
import React, { useMemo, useState, useEffect } from 'react';
import { Asset, Request, Handover, Dismantle, Customer, AssetStatus, ItemStatus, Page, PreviewData, AssetCategory, Division, OrderType, User, UserRole } from '../../types';
import { WrenchIcon } from '../../components/icons/WrenchIcon';
import { RequestIcon } from '../../components/icons/RequestIcon';
import { HandoverIcon } from '../../components/icons/HandoverIcon';
import { DismantleIcon } from '../../components/icons/DismantleIcon';
import { RegisterIcon } from '../../components/icons/RegisterIcon';
import { CheckIcon } from '../../components/icons/CheckIcon';
import { CloseIcon } from '../../components/icons/CloseIcon';
import { PencilIcon } from '../../components/icons/PencilIcon';
import Modal from '../../components/ui/Modal';
import { ArchiveBoxIcon } from '../../components/icons/ArchiveBoxIcon';
import { ExclamationTriangleIcon } from '../../components/icons/ExclamationTriangleIcon';
import { ShoppingCartIcon } from '../../components/icons/ShoppingCartIcon';
import { AssetIcon } from '../../components/icons/AssetIcon';
import { DollarIcon } from '../../components/icons/DollarIcon';
import { UsersIcon } from '../../components/icons/UsersIcon';
import { useNotification } from '../../providers/NotificationProvider';
import { FireIcon } from '../../components/icons/FireIcon';
import { ProjectIcon } from '../../components/icons/ProjectIcon';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { PercentIcon } from '../../components/icons/PercentIcon';
import { HistoryIcon } from '../../components/icons/HistoryIcon';
import { RequestStatusIndicator } from '../requests/new/components/RequestStatus';
import { InboxIcon } from '../../components/icons/InboxIcon';
import { getStatusClass as getAssetStatusClass } from '../assetRegistration/RegistrationPage';
import { useSortableData, SortConfig } from '../../hooks/useSortableData';
import { PaginationControls } from '../../components/ui/PaginationControls';
import { SortIcon } from '../../components/icons/SortIcon';
import { SortAscIcon } from '../../components/icons/SortAscIcon';
import { SortDescIcon } from '../../components/icons/SortDescIcon';
import { SearchIcon } from '../../components/icons/SearchIcon';
import { EyeIcon } from '../../components/icons/EyeIcon';
import { ActionableItemsList } from './components/ActionableItemsList';
import { SpinnerIcon } from '../../components/icons/SpinnerIcon';
import { DashboardCard } from './components/DashboardCard';
import { TruckIcon } from '../../components/icons/TruckIcon';
import { Skeleton } from '../../components/ui/Skeleton';
import { MegaphoneIcon } from '../../components/icons/MegaphoneIcon';
import { BellIcon } from '../../components/icons/BellIcon';

// Chart.js Imports
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  ChartTooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
  Filler
);

const formatCurrencyShort = (value: number): string => {
    if (value >= 1_000_000_000) {
        return `${(value / 1_000_000_000).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Miliar`;
    }
    if (value >= 1_000_000) {
        return `${(value / 1_000_000).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Juta`;
    }
    if (value >= 1000) {
        return `${(value / 1000).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} Ribu`;
    }
    return value.toLocaleString('id-ID');
};

const canViewPrice = (role: UserRole) => ['Admin Purchase', 'Super Admin'].includes(role);

interface DashboardProps {
    currentUser: User;
    assets: Asset[];
    requests: Request[];
    handovers: Handover[];
    dismantles: Dismantle[];
    customers: Customer[];
    assetCategories: AssetCategory[];
    divisions: Division[];
    setActivePage: (page: Page, filters?: any) => void;
    onShowPreview: (data: PreviewData) => void;
}

interface SortableHeaderProps {
    children: React.ReactNode;
    columnKey: keyof Asset;
    sortConfig: SortConfig<Asset> | null;
    requestSort: (key: keyof Asset) => void;
    className?: string;
}

const SortableHeader: React.FC<SortableHeaderProps> = ({ children, columnKey, sortConfig, requestSort, className }) => {
    const isSorted = sortConfig?.key === columnKey;
    const direction = isSorted ? sortConfig.direction : undefined;

    const getSortIcon = () => {
        if (!isSorted) return <SortIcon className="w-4 h-4 text-gray-400" />;
        if (direction === 'ascending') return <SortAscIcon className="w-4 h-4 text-tm-accent" />;
        return <SortDescIcon className="w-4 h-4 text-tm-accent" />;
    };

    return (
        <th scope="col" className={`px-6 py-3 text-sm font-semibold tracking-wider text-left text-gray-500 ${className}`}>
            <button onClick={() => requestSort(columnKey)} className="flex items-center space-x-1 group">
                <span>{children}</span>
                <span className="opacity-50 group-hover:opacity-100">{getSortIcon()}</span>
            </button>
        </th>
    );
};

interface UrgentReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    requests: Request[];
}

const UrgentReportModal: React.FC<UrgentReportModalProps> = ({ isOpen, onClose, requests }) => {
    const urgentRequests = useMemo(() => {
        return requests.filter(r => r.order.type === 'Urgent').sort((a,b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
    }, [requests]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Laporan Justifikasi Urgent (${urgentRequests.length})`} size="2xl">
            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar -mx-6 -my-4">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">ID / Tanggal</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Pemohon</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Justifikasi</th>
                             <th className="px-4 py-2 text-left font-medium text-gray-500">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {urgentRequests.map(req => (
                            <tr key={req.id}>
                                <td className="px-4 py-3 whitespace-nowrap align-top">
                                    <p className="font-semibold text-gray-800">{req.id}</p>
                                    <p className="text-xs text-gray-500">{new Date(req.requestDate).toLocaleDateString('id-ID')}</p>
                                </td>
                                <td className="px-4 py-3 align-top">
                                    <p className="font-medium text-gray-800">{req.requester}</p>
                                    <p className="text-xs text-gray-500">{req.division}</p>
                                </td>
                                <td className="px-4 py-3 align-top">
                                    <p className="text-gray-700 italic">"{req.order.justification}"</p>
                                </td>
                                <td className="px-4 py-3 align-top">
                                    <RequestStatusIndicator status={req.status} />
                                </td>
                            </tr>
                        ))}
                         {urgentRequests.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-gray-500">
                                    <div className="flex flex-col items-center">
                                        <InboxIcon className="w-10 h-10 text-gray-400 mb-2"/>
                                        <p className="font-semibold">Tidak ada permintaan urgent.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Modal>
    );
}

interface KpiCardProps {
    icon: React.FC<{className?: string; style?: React.CSSProperties;}>;
    title: string;
    value: string | number;
    color: string;
    onClick?: () => void;
    tooltip?: string;
    subValue?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ icon: Icon, title, value, color, onClick, tooltip, subValue }) => (
    <div 
        onClick={onClick}
        title={tooltip}
        className={`p-4 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-4 ${onClick ? 'cursor-pointer hover:-translate-y-1' : ''}`}
    >
        <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
            <Icon className="w-6 h-6" style={{ color: color }} />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
            <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-gray-800">{value}</p>
                {subValue && <span className="text-xs text-gray-400 font-medium">{subValue}</span>}
            </div>
        </div>
    </div>
);

// --- New Critical Stock Alert Widget ---
interface CriticalStockWidgetProps {
    assets: Asset[];
    setActivePage: (page: Page, filters?: any) => void;
}

const CriticalStockWidget: React.FC<CriticalStockWidgetProps> = ({ assets, setActivePage }) => {
    const criticalItems = useMemo(() => {
        const stockMap = new Map<string, { name: string; brand: string; inStorage: number }>();

        assets.forEach(asset => {
            if (asset.status === AssetStatus.DECOMMISSIONED) return;
            const key = `${asset.name}|${asset.brand}`;
            if (!stockMap.has(key)) {
                stockMap.set(key, { name: asset.name, brand: asset.brand, inStorage: 0 });
            }
            if (asset.status === AssetStatus.IN_STORAGE) {
                stockMap.get(key)!.inStorage++;
            }
        });

        return Array.from(stockMap.values()).filter(item => item.inStorage === 0);
    }, [assets]);

    if (criticalItems.length === 0) return null;

    return (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-6 shadow-sm animate-fade-in-up">
            <div className="flex items-start gap-4">
                <div className="p-2 bg-red-100 rounded-lg text-red-600 shrink-0 animate-pulse-slow">
                    <FireIcon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-red-800">Perhatian: Stok Kritis!</h3>
                    <p className="text-sm text-red-600 mb-3">
                        Terdapat <span className="font-bold">{criticalItems.length} tipe aset</span> yang stok gudangnya kosong (0). Segera lakukan restock untuk mencegah gangguan operasional.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {criticalItems.slice(0, 6).map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-white border border-red-100 rounded-lg shadow-sm">
                                <div className="min-w-0 mr-2">
                                    <p className="text-sm font-semibold text-gray-800 truncate" title={item.name}>{item.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{item.brand}</p>
                                </div>
                                <button 
                                    onClick={() => setActivePage('request', { prefillItem: { name: item.name, brand: item.brand } })}
                                    className="shrink-0 px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-md shadow transition-colors"
                                >
                                    Restock
                                </button>
                            </div>
                        ))}
                    </div>
                    {criticalItems.length > 6 && (
                         <button 
                            onClick={() => setActivePage('stock', { outOfStockOnly: true })}
                            className="mt-3 text-sm font-semibold text-red-700 hover:underline"
                        >
                            Lihat {criticalItems.length - 6} item lainnya &rarr;
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

interface OrderAnalyticsCardProps {
    currentUser: User;
    requests: Request[];
    assets: Asset[];
    divisions: Division[];
    onOpenUrgentReport: () => void;
    setActivePage: (page: Page, filters?: any) => void;
    isLoading?: boolean;
}

const OrderAnalyticsCard: React.FC<OrderAnalyticsCardProps> = ({ currentUser, requests, assets, divisions, onOpenUrgentReport, setActivePage, isLoading }) => {
    const [timeFilter, setTimeFilter] = useState('all');

    const analytics = useMemo(() => {
        const now = new Date();
        const filteredRequests = requests.filter(req => {
            if (timeFilter === 'all') return true;
            const reqDate = new Date(req.requestDate);
            const daysAgo = (now.getTime() - reqDate.getTime()) / (1000 * 3600 * 24);
            if (timeFilter === '7d') return daysAgo <= 7;
            if (timeFilter === '30d') return daysAgo <= 30;
            return true;
        });

        const typeCounts: Record<OrderType, number> = { 'Urgent': 0, 'Project Based': 0, 'Regular Stock': 0 };
        const divisionData: Record<string, { total: number; urgent: number; project: number; regular: number; }> = {};
        divisions.forEach(d => { divisionData[d.name] = { total: 0, urgent: 0, project: 0, regular: 0 }; });
        
        let totalApprovalMillis = 0;
        let approvedRequestCount = 0;
        let totalValue = 0;
        
        filteredRequests.forEach(req => {
            typeCounts[req.order.type]++;
            if(req.totalValue) totalValue += req.totalValue;

            if (divisionData[req.division]) {
                const data = divisionData[req.division];
                data.total++;
            }

            if(req.finalApprovalDate) {
                const approvalMillis = new Date(req.finalApprovalDate).getTime() - new Date(req.requestDate).getTime();
                totalApprovalMillis += approvalMillis;
                approvedRequestCount++;
            }
        });

        const topDivisions = Object.entries(divisionData)
            .filter(([, counts]) => counts.total > 0)
            .sort(([,a], [,b]) => b.total - a.total)
            .slice(0, 5)
            .map(([name, counts]) => ({ name, ...counts }));
        
        const totalRequests = filteredRequests.length;
        const urgentRatio = totalRequests > 0 ? (typeCounts['Urgent'] / totalRequests) * 100 : 0;
        
        const donutData = [
            { label: 'Urgent', value: typeCounts['Urgent'], color: '#EF4444', filter: { orderType: 'Urgent' } }, 
            { label: 'Project', value: typeCounts['Project Based'], color: '#3B82F6', filter: { orderType: 'Project Based' } }, 
            { label: 'Regular', value: typeCounts['Regular Stock'], color: '#10B981', filter: { orderType: 'Regular Stock' } } 
        ].filter(d => d.value > 0);
        
        // Asset Category Distribution
        const categoryCounts: Record<string, number> = {};
        assets.forEach(a => {
            categoryCounts[a.category] = (categoryCounts[a.category] || 0) + 1;
        });
        const categoryData = Object.entries(categoryCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));

        return {
            totalRequests,
            totalValue,
            urgentRatio,
            donutData,
            topDivisions,
            categoryData
        };
    }, [requests, assets, divisions, timeFilter]);

    const doughnutChartData = {
        labels: analytics.donutData.map(d => d.label),
        datasets: [{
            data: analytics.donutData.map(d => d.value),
            backgroundColor: analytics.donutData.map(d => d.color),
            borderWidth: 0,
            hoverOffset: 10,
        }],
    };
    
    const doughnutOptions: any = {
        cutout: '70%',
        plugins: {
            legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } },
            tooltip: { enabled: true }
        },
        maintainAspectRatio: false,
    };

    const barChartData = {
        labels: analytics.topDivisions.map(d => d.name),
        datasets: [{
            label: 'Total Request',
            data: analytics.topDivisions.map(d => d.total),
            backgroundColor: '#6366F1',
            borderRadius: 6,
            barThickness: 16,
        }],
    };

    const barOptions: any = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { display: false }, ticks: { display: false } },
            y: { grid: { display: false }, ticks: { font: { size: 11, weight: 'bold' } } }
        },
        layout: { padding: { left: 0, right: 20 } }
    };

    if (isLoading) return <Skeleton height={400} />;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
             {/* Card 1: Request Distribution */}
             <div className="bg-white border border-gray-200/80 rounded-xl shadow-sm p-6 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-800">Distribusi Tipe Order</h3>
                    <div className="w-32"><CustomSelect options={[{value: 'all', label: 'Semua'}, {value: '30d', label: '30 Hari'}]} value={timeFilter} onChange={setTimeFilter} /></div>
                </div>
                <div className="flex-1 relative min-h-[200px]">
                    <Doughnut data={doughnutChartData} options={doughnutOptions} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                        <p className="text-3xl font-bold text-tm-dark">{analytics.totalRequests}</p>
                        <p className="text-xs text-gray-500">Total</p>
                    </div>
                </div>
             </div>

             {/* Card 2: Division Performance */}
             <div className="bg-white border border-gray-200/80 rounded-xl shadow-sm p-6 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-800">Aktivitas per Divisi</h3>
                    <button onClick={() => setActivePage('request')} className="text-xs font-semibold text-tm-primary">Lihat Semua</button>
                </div>
                <div className="flex-1 min-h-[200px]">
                    {analytics.topDivisions.length > 0 ? (
                        <Bar data={barChartData} options={barOptions} />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <InboxIcon className="w-8 h-8 mb-2"/>
                            <p className="text-xs">Belum ada data.</p>
                        </div>
                    )}
                </div>
             </div>
        </div>
    );
};

interface StatCardProps {
    title: string;
    value: number;
    icon: React.FC<{className?:string}>;
    color: 'blue' | 'amber' | 'green';
}

const StaffDashboard: React.FC<DashboardProps> = ({ currentUser, assets, requests, setActivePage, onShowPreview }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    const myAssets = useMemo(() => 
        assets.filter(a => a.currentUser === currentUser.name), 
    [assets, currentUser.name]);

    const myRequests = useMemo(() => 
        requests.filter(r => r.requester === currentUser.name), 
    [requests, currentUser.name]);

    const staffSummary = useMemo(() => ({
        totalAssets: myAssets.length,
        pendingRequests: myRequests.filter(r => ![ItemStatus.COMPLETED, ItemStatus.REJECTED, ItemStatus.CANCELLED].includes(r.status)).length,
        completedRequests: myRequests.filter(r => r.status === ItemStatus.COMPLETED).length,
    }), [myAssets, myRequests]);
    
    const recentRequests = useMemo(() => 
        myRequests.sort((a,b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()).slice(0, 5),
    [myRequests]);
    
    const filteredMyAssets = useMemo(() => 
        myAssets.filter(asset => {
            const searchLower = searchQuery.toLowerCase();
            return (
                asset.name.toLowerCase().includes(searchLower) ||
                asset.id.toLowerCase().includes(searchLower) ||
                asset.brand.toLowerCase().includes(searchLower) ||
                (asset.serialNumber && asset.serialNumber.toLowerCase().includes(searchLower))
            );
        }),
    [myAssets, searchQuery]);

    const { items: sortedMyAssets, requestSort, sortConfig } = useSortableData(filteredMyAssets, { key: 'name', direction: 'ascending' });
    
    const totalItems = sortedMyAssets.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedMyAssets = sortedMyAssets.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => { setCurrentPage(1); }, [searchQuery, itemsPerPage]);

    const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color }) => {
        const colors = {
            blue: 'bg-blue-100 text-blue-700',
            amber: 'bg-amber-100 text-amber-700',
            green: 'bg-green-100 text-green-700',
        };
        return (
            <div className="p-5 bg-white border border-gray-200/80 rounded-xl shadow-sm">
                <div className="flex items-center gap-4">
                    <div className={`flex items-center justify-center flex-shrink-0 w-12 h-12 rounded-lg ${colors[color]}`}>
                        <Icon className="w-6 h-6"/>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-tm-dark">{value}</p>
                        <p className="text-sm font-medium text-gray-500">{title}</p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-tm-dark">Selamat Datang, {currentUser.name.split(' ')[0]}!</h1>
                <p className="mt-1 text-gray-600">Ini adalah ringkasan aset dan permintaan Anda.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard title="Total Aset Saya" value={staffSummary.totalAssets} icon={AssetIcon} color="blue" />
                <StatCard title="Request Diproses" value={staffSummary.pendingRequests} icon={RequestIcon} color="amber" />
                <StatCard title="Request Selesai" value={staffSummary.completedRequests} icon={CheckIcon} color="green" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white border border-gray-200/80 rounded-xl shadow-sm">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-tm-dark">Aset yang Sedang Anda Gunakan</h2>
                    </div>
                     <div className="p-4">
                        <div className="relative">
                            <SearchIcon className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 top-1/2 left-3" />
                            <input type="text" placeholder="Cari nama, ID, brand, atau SN aset..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full h-10 py-2 pl-10 pr-4 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-tm-accent focus:border-tm-accent" />
                        </div>
                    </div>
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50/70">
                                <tr>
                                    <SortableHeader columnKey="name" sortConfig={sortConfig} requestSort={requestSort}>Nama Aset</SortableHeader>
                                    <SortableHeader columnKey="category" sortConfig={sortConfig} requestSort={requestSort}>Kategori</SortableHeader>
                                    <SortableHeader columnKey="condition" sortConfig={sortConfig} requestSort={requestSort}>Kondisi</SortableHeader>
                                    <SortableHeader columnKey="status" sortConfig={sortConfig} requestSort={requestSort}>Status</SortableHeader>
                                    <th className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedMyAssets.length > 0 ? paginatedMyAssets.map(asset => (
                                    <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <p className="text-sm font-semibold text-gray-900">{asset.name}</p>
                                            <p className="text-xs text-gray-500 font-mono">{asset.id}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{asset.category}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{asset.condition}</td>
                                        <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getAssetStatusClass(asset.status)}`}>{asset.status}</span></td>
                                        <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                                            <button onClick={() => onShowPreview({ type: 'asset', id: asset.id })} className="p-2 text-gray-500 rounded-full hover:bg-info-light hover:text-info-text"><EyeIcon className="w-5 h-5"/></button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={5} className="py-12 text-center text-gray-500">Tidak ada aset yang cocok dengan pencarian Anda.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {totalItems > 0 && <PaginationControls currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} onItemsPerPageChange={setItemsPerPage} startIndex={startIndex} endIndex={startIndex + paginatedMyAssets.length} />}
                </div>

                <div className="bg-white border border-gray-200/80 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-tm-dark">Request Terbaru Saya</h2>
                        <button onClick={() => setActivePage('request')} className="text-sm font-semibold text-tm-primary hover:underline">Lihat Semua</button>
                    </div>
                    <ul className="divide-y divide-gray-200">
                        {recentRequests.length > 0 ? recentRequests.map(req => (
                            <li key={req.id} onClick={() => onShowPreview({type: 'request', id: req.id})} className="p-4 cursor-pointer hover:bg-gray-50">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">{req.id}</p>
                                        <p className="text-xs text-gray-500">{new Date(req.requestDate).toLocaleDateString('id-ID')}</p>
                                    </div>
                                    <RequestStatusIndicator status={req.status} />
                                </div>
                                <p className="mt-2 text-xs text-gray-600">
                                    {req.items.map(item => `${item.quantity}x ${item.itemName}`).join(', ')}
                                </p>
                            </li>
                        )) : (
                            <li className="p-8 text-center text-gray-500">
                                <InboxIcon className="w-10 h-10 mx-auto text-gray-300"/>
                                <p className="mt-2 text-sm">Anda belum membuat request.</p>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default function DashboardPage(props: DashboardProps): React.ReactElement {
    const { currentUser, assets, requests, handovers, dismantles, customers, assetCategories, divisions, setActivePage, onShowPreview } = props;

    // Staff view is completely different, handle it first.
    if (currentUser.role === 'Staff' || currentUser.role === 'Leader') {
        return <StaffDashboard {...props} />;
    }
    
    // --- Admin, Manager, Super Admin View ---
    const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
    const [isUrgentReportModalOpen, setIsUrgentReportModalOpen] = useState(false);
    const [isComputing, setIsComputing] = useState(true); 
    
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsComputing(false);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    const inventorySummary = useMemo(() => {
        const stockMap = new Map<string, { inStorage: number, valueInStorage: number }>();

        assets.forEach(asset => {
            const key = `${asset.name}|${asset.brand}`;
            if (!stockMap.has(key)) {
                stockMap.set(key, { inStorage: 0, valueInStorage: 0 });
            }

            if (asset.status === AssetStatus.IN_STORAGE) {
                const current = stockMap.get(key)!;
                current.inStorage++;
                if (asset.purchasePrice) {
                    current.valueInStorage += asset.purchasePrice;
                }
            }
        });
        
        const stockItems = Array.from(stockMap.values());
        const LOW_STOCK_THRESHOLD = 5;

        return {
            totalAssetTypes: stockMap.size,
            totalValueInStorage: stockItems.reduce((sum, item) => sum + item.valueInStorage, 0),
            lowStockItems: stockItems.filter(item => item.inStorage > 0 && item.inStorage <= LOW_STOCK_THRESHOLD).length,
            outOfStockItems: stockItems.filter(item => item.inStorage === 0).length,
            totalIndividualAssets: assets.length,
        };
    }, [assets]);

    const operationalSummary = useMemo(() => {
        return {
            inUse: assets.filter(a => a.status === AssetStatus.IN_USE).length,
            underRepair: assets.filter(a => [AssetStatus.UNDER_REPAIR, AssetStatus.OUT_FOR_REPAIR].includes(a.status)).length,
            damaged: assets.filter(a => a.status === AssetStatus.DAMAGED).length,
            totalCustomers: customers.length,
        };
    }, [assets, customers]);

    const allActivities = useMemo(() => {
        const activities: { 
            id: string; 
            user: string; 
            action: React.ReactNode; 
            timestamp: string; 
            date: Date; 
            icon: React.ReactNode;
            previewData: PreviewData;
        }[] = [];

        requests.forEach(req => {
            activities.push({ id: `req-create-${req.id}`, user: req.requester, action: <>Membuat request baru <strong className="text-gray-900">#{req.id}</strong></>, date: new Date(req.requestDate), timestamp: req.requestDate, icon: <RequestIcon className="w-4 h-4 text-amber-600" />, previewData: { type: 'request', id: req.id } });
            if (req.finalApprovalDate && req.finalApprover) {
                activities.push({ id: `req-approve-${req.id}`, user: req.finalApprover, action: <>Menyetujui request <strong className="text-gray-900">#{req.id}</strong></>, date: new Date(req.finalApprovalDate), timestamp: req.finalApprovalDate, icon: <CheckIcon className="w-4 h-4 text-green-600" />, previewData: { type: 'request', id: req.id } });
            }
            // ... (other log logic simplified for brevity, keep original if needed)
        });

        // Limit for initial view, but keep full list for modal
        return activities.sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [assets, requests]);

    const recentActivities = useMemo(() => allActivities.slice(0, 5), [allActivities]);


    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-8 bg-gray-50/50 min-h-screen">
            {/* CRITICAL STOCK ALERT WIDGET */}
            {!isComputing && (
                <CriticalStockWidget assets={assets} setActivePage={setActivePage} />
            )}

            {/* Top KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {isComputing ? (
                    Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={100} className="rounded-xl" />)
                ) : (
                    <>
                        <KpiCard 
                            icon={AssetIcon} 
                            title="Total Aset" 
                            value={inventorySummary.totalIndividualAssets} 
                            subValue={`${inventorySummary.totalAssetTypes} Tipe`}
                            color="#2563EB" 
                            onClick={() => setActivePage('stock')} 
                        />
                        {canViewPrice(currentUser.role) && (
                            <KpiCard 
                                icon={DollarIcon} 
                                title="Valuasi Aset (Gudang)" 
                                value={formatCurrencyShort(inventorySummary.totalValueInStorage)} 
                                color="#16A34A" 
                                tooltip={`Rp ${inventorySummary.totalValueInStorage.toLocaleString('id-ID')}`}
                                onClick={() => setActivePage('stock')}
                            />
                        )}
                        <KpiCard 
                            icon={ExclamationTriangleIcon} 
                            title="Stok Menipis" 
                            value={inventorySummary.lowStockItems} 
                            subValue={`${inventorySummary.outOfStockItems} Habis`}
                            color="#F59E0B" 
                            onClick={() => setActivePage('stock', { lowStockOnly: true })} 
                        />
                        <KpiCard 
                            icon={WrenchIcon} 
                            title="Perlu Perbaikan" 
                            value={operationalSummary.damaged} 
                            subValue={`${operationalSummary.underRepair} Sedang Diperbaiki`}
                            color="#DC2626" 
                            onClick={() => setActivePage('repair')} 
                        />
                    </>
                )}
            </div>

            {/* Actionable Inbox */}
            <ActionableItemsList 
                currentUser={currentUser}
                requests={requests}
                assets={assets}
                setActivePage={setActivePage}
                onShowPreview={onShowPreview}
            />

            {/* Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart Area (2/3) */}
                <div className="lg:col-span-2">
                    <OrderAnalyticsCard 
                        currentUser={currentUser} 
                        requests={requests} 
                        assets={assets}
                        divisions={divisions} 
                        onOpenUrgentReport={() => setIsUrgentReportModalOpen(true)} 
                        setActivePage={setActivePage} 
                        isLoading={isComputing} 
                    />
                </div>

                {/* Recent Activity (1/3) */}
                <div className="lg:col-span-1 h-full">
                     <div className="bg-white border border-gray-200/80 rounded-xl shadow-sm flex flex-col h-full max-h-[600px]">
                        <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gray-50/30 rounded-t-xl">
                            <h2 className="text-base font-bold text-gray-800">Log Aktivitas</h2>
                            <button onClick={() => setIsActivityModalOpen(true)} className="text-xs font-semibold text-tm-primary hover:underline">Lihat Semua</button>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                            {recentActivities.length > 0 ? (
                                <div className="divide-y divide-gray-100">
                                    {recentActivities.map((log) => (
                                        <div 
                                            key={log.id} 
                                            onClick={() => onShowPreview(log.previewData)}
                                            className="p-4 hover:bg-gray-50 cursor-pointer transition-colors group"
                                        >
                                            <div className="flex gap-3">
                                                <div className="mt-1 p-1.5 rounded-full bg-gray-100 group-hover:bg-white group-hover:shadow-sm transition-all">
                                                    {log.icon}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-gray-800 leading-snug">{log.action}</p>
                                                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                                        <span>{log.user}</span>
                                                        <span>•</span>
                                                        <time>{new Date(log.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</time>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                                    <InboxIcon className="w-8 h-8 mb-2 opacity-50"/>
                                    <span className="text-sm">Belum ada aktivitas</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Modals */}
            <Modal
                isOpen={isActivityModalOpen}
                onClose={() => setIsActivityModalOpen(false)}
                title={`Semua Aktivitas (${allActivities.length})`}
                size="2xl"
            >
                <div className="max-h-[70vh] overflow-y-auto custom-scrollbar -m-6 p-6">
                    <ol className="relative ml-3 border-l border-gray-200">
                        {allActivities.map((log) => (
                            <li key={log.id} className="mb-6 ml-6">
                                <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full -left-4 ring-4 ring-white">
                                    {log.icon}
                                </span>
                                <h3 className="flex items-center mb-1 text-sm font-semibold text-gray-900">{log.action}</h3>
                                <time className="block mb-2 text-xs font-normal leading-none text-gray-400">{new Date(log.timestamp).toLocaleString()}</time>
                                <p className="text-sm font-normal text-gray-500">Dilakukan oleh {log.user}</p>
                            </li>
                        ))}
                    </ol>
                </div>
            </Modal>
            
            <UrgentReportModal
                isOpen={isUrgentReportModalOpen}
                onClose={() => setIsUrgentReportModalOpen(false)}
                requests={requests}
            />
        </div>
    );
}
