
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
import { Tooltip } from '../../components/ui/Tooltip';
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
}

const KpiCard: React.FC<KpiCardProps> = ({ icon: Icon, title, value, color, onClick, tooltip }) => (
    <div 
        onClick={onClick}
        title={tooltip}
        className={`p-4 rounded-xl border-l-4 transition-all duration-200 ${onClick ? 'cursor-pointer hover:bg-gray-50 hover:shadow-md' : ''}`}
        style={{ borderLeftColor: color }}
    >
        <div className="flex items-center gap-4">
            <Icon className="w-6 h-6" style={{ color: color }} />
            <div className="flex-1 min-w-0">
                <p className="text-xl font-bold text-tm-dark truncate">{value}</p>
                <p className="text-xs text-gray-500 font-medium">{title}</p>
            </div>
        </div>
    </div>
);

interface OrderAnalyticsCardProps {
    currentUser: User;
    requests: Request[];
    divisions: Division[];
    onOpenUrgentReport: () => void;
    setActivePage: (page: Page, filters?: any) => void;
    isLoading?: boolean;
}

const OrderAnalyticsCard: React.FC<OrderAnalyticsCardProps> = ({ currentUser, requests, divisions, onOpenUrgentReport, setActivePage, isLoading }) => {
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

        const projectCounts: Record<string, number> = {};
        
        let totalApprovalMillis = 0;
        let approvedRequestCount = 0;
        let totalUrgentApprovalMillis = 0;
        let approvedUrgentRequestCount = 0;
        let totalValue = 0;
        
        filteredRequests.forEach(req => {
            typeCounts[req.order.type]++;
            if(req.totalValue) totalValue += req.totalValue;

            if (divisionData[req.division]) {
                const data = divisionData[req.division];
                data.total++;
                if (req.order.type === 'Urgent') data.urgent++;
                else if (req.order.type === 'Project Based') {
                    data.project++;
                    if(req.order.project) projectCounts[req.order.project] = (projectCounts[req.order.project] || 0) + 1;
                } else data.regular++;
            }

            if(req.finalApprovalDate) {
                const approvalMillis = new Date(req.finalApprovalDate).getTime() - new Date(req.requestDate).getTime();
                totalApprovalMillis += approvalMillis;
                approvedRequestCount++;
                if (req.order.type === 'Urgent') {
                    totalUrgentApprovalMillis += approvalMillis;
                    approvedUrgentRequestCount++;
                }
            }
        });

        const topDivisions = Object.entries(divisionData)
            .filter(([, counts]) => counts.total > 0)
            .sort(([,a], [,b]) => b.total - a.total)
            .slice(0, 5)
            .map(([name, counts]) => ({ name, ...counts }));
        
        const topProjects = Object.entries(projectCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([name, count]) => ({ name, count }));

        const totalRequests = filteredRequests.length;
        const urgentRatio = totalRequests > 0 ? (typeCounts['Urgent'] / totalRequests) * 100 : 0;
        const avgApprovalMillis = approvedRequestCount > 0 ? totalApprovalMillis / approvedRequestCount : 0;
        const avgUrgentApprovalMillis = approvedUrgentRequestCount > 0 ? totalUrgentApprovalMillis / approvedUrgentRequestCount : 0;
        
        const formatDuration = (ms: number) => {
            if (ms <= 0) return 'N/A';
            const days = Math.floor(ms / (1000 * 60 * 60 * 24));
            const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
            if (days > 0) return `${days}h ${hours}j`;
            if (hours > 0) return `${hours}j ${minutes}m`;
            return `${minutes}m`;
        };

        const donutData = [
            { label: 'Urgent', value: typeCounts['Urgent'], color: '#DC2626', filter: { orderType: 'Urgent' } }, // danger
            { label: 'Project', value: typeCounts['Project Based'], color: '#2563EB', filter: { orderType: 'Project Based' } }, // info
            { label: 'Regular', value: typeCounts['Regular Stock'], color: '#6B7280', filter: { orderType: 'Regular Stock' } } // tm-secondary
        ].filter(d => d.value > 0);

        const conicGradient = donutData.length > 0 ? 'conic-gradient(' + donutData.map((d, i, arr) => {
            const startAngle = arr.slice(0, i).reduce((acc, curr) => acc + curr.value, 0) / totalRequests * 360;
            const endAngle = startAngle + (d.value / totalRequests * 360);
            return `${d.color} ${startAngle}deg ${endAngle}deg`;
        }).join(', ') + ')' : '#F3F4F6';


        return {
            totalRequests,
            totalValue,
            urgentRatio,
            avgApprovalTime: formatDuration(avgApprovalMillis),
            avgUrgentApprovalTime: formatDuration(avgUrgentApprovalMillis),
            donutData,
            conicGradient,
            topDivisions,
            topProjects,
            maxDivisionCount: Math.max(...topDivisions.map(d => d.total), 1)
        };
    }, [requests, divisions, timeFilter]);

    if (isLoading) {
        return (
            <div className="bg-white border border-gray-200/80 rounded-xl shadow-md p-6 space-y-6">
                <div className="flex justify-between">
                    <Skeleton height={24} width={200} />
                    <Skeleton height={32} width={150} />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <div className="lg:col-span-2 flex flex-col items-center">
                        <Skeleton variant="circular" width={192} height={192} />
                        <Skeleton height={20} width="80%" className="mt-4" />
                    </div>
                    <div className="lg:col-span-3 space-y-6">
                         <div className="grid grid-cols-2 gap-4">
                            <Skeleton height={80} />
                            <Skeleton height={80} />
                            <Skeleton height={80} />
                            <Skeleton height={80} />
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <Skeleton height={150} />
                            <Skeleton height={150} />
                         </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200/80 rounded-xl shadow-md">
            <div className="flex flex-col md:flex-row justify-between md:items-center p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-tm-dark">Analitik Permintaan Aset</h2>
                <div className="mt-2 md:mt-0 w-full md:w-48">
                    <CustomSelect
                        options={[{value: 'all', label: 'Semua Waktu'}, {value: '30d', label: '30 Hari Terakhir'}, {value: '7d', label: '7 Hari Terakhir'}]}
                        value={timeFilter}
                        onChange={setTimeFilter}
                    />
                </div>
            </div>
             <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 p-6">
                <div className="lg:col-span-2 flex flex-col items-center justify-center">
                    <h3 className="text-base font-semibold text-gray-800 mb-4">Distribusi Tipe Order</h3>
                    <div className="relative flex items-center justify-center">
                        <div
                            className="w-48 h-48 rounded-full transition-all"
                            style={{ background: analytics.conicGradient }}
                        >
                             <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center text-center">
                                <div>
                                    <p className="text-3xl font-bold text-tm-dark">{analytics.totalRequests}</p>
                                    <p className="text-xs text-gray-500">Total Permintaan</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-4 text-sm">
                        {analytics.donutData.map(item => (
                            <div key={item.label} onClick={() => setActivePage('request', item.filter)} className="flex items-center gap-2 cursor-pointer group">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                                <span className="text-gray-600 group-hover:text-tm-primary">{item.label} <span className="font-semibold">({item.value})</span></span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="lg:col-span-3">
                     <h3 className="text-base font-semibold text-gray-800 mb-6">Performa & Prioritas</h3>
                     <div className="grid grid-cols-2 gap-4 mb-8 bg-gray-50/70 p-4 rounded-xl border">
                        {canViewPrice(currentUser.role) && (
                            <KpiCard icon={DollarIcon} title="Total Nilai Permintaan" value={`Rp ${formatCurrencyShort(analytics.totalValue)}`} color="#16A34A" onClick={() => setActivePage('request')} tooltip={`Rp ${analytics.totalValue.toLocaleString('id-ID')}`}/>
                        )}
                        <KpiCard icon={PercentIcon} title="Rasio Urgent" value={`${analytics.urgentRatio.toFixed(1)}%`} color="#DC2626" onClick={() => setActivePage('request', { orderType: 'Urgent' })} />
                        <KpiCard icon={HistoryIcon} title="Avg. Waktu Persetujuan" value={analytics.avgApprovalTime} color="#6B7280" />
                        <KpiCard icon={FireIcon} title="Avg. Persetujuan Urgent" value={analytics.avgUrgentApprovalTime} color="#F59E0B" onClick={() => setActivePage('request', { orderType: 'Urgent' })} />
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                         <div>
                            <h4 className="font-semibold text-gray-700 text-sm mb-3">Top Divisi Pemohon</h4>
                            <div className="space-y-4">
                                {analytics.topDivisions.map(div => (
                                    <div key={div.name}>
                                        <div className="flex justify-between items-center text-xs mb-1.5">
                                            <span onClick={() => setActivePage('request', { division: div.name })} className="font-semibold text-gray-700 hover:text-tm-primary cursor-pointer truncate pr-2">{div.name}</span>
                                            <span className="font-bold text-gray-800">{div.total}</span>
                                        </div>
                                        <div className="flex w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                            <Tooltip text={`Urgent: ${div.urgent}`}>
                                                <div onClick={() => setActivePage('request', { division: div.name, orderType: 'Urgent' })} className="bg-danger h-full hover:opacity-80 cursor-pointer" style={{ width: `${(div.urgent / div.total) * 100}%`}}></div>
                                            </Tooltip>
                                            <Tooltip text={`Project: ${div.project}`}>
                                                <div onClick={() => setActivePage('request', { division: div.name, orderType: 'Project Based' })} className="bg-info h-full hover:opacity-80 cursor-pointer" style={{ width: `${(div.project / div.total) * 100}%`}}></div>
                                            </Tooltip>
                                            <Tooltip text={`Regular: ${div.regular}`}>
                                                <div onClick={() => setActivePage('request', { division: div.name, orderType: 'Regular Stock' })} className="bg-tm-secondary h-full hover:opacity-80 cursor-pointer" style={{ width: `${(div.regular / div.total) * 100}%`}}></div>
                                            </Tooltip>
                                        </div>
                                    </div>
                                ))}
                                {analytics.topDivisions.length === 0 && <p className="text-xs text-center text-gray-500 py-4">Tidak ada data divisi pada periode ini.</p>}
                            </div>
                        </div>
                         <div>
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-gray-700 text-sm">Top Proyek Aktif</h4>
                                <button onClick={onOpenUrgentReport} className="text-xs font-semibold text-danger hover:underline">Laporan Urgent</button>
                            </div>
                            {analytics.topProjects.length > 0 ? (
                                <ul className="space-y-3">
                                    {analytics.topProjects.map(proj => (
                                        <li key={proj.name} onClick={() => setActivePage('request', { project: proj.name })} className="flex items-center gap-3 text-sm cursor-pointer group p-2 rounded-lg hover:bg-gray-50">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-info-light text-info-text">
                                                <ProjectIcon className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-800 truncate group-hover:text-tm-primary">{proj.name}</p>
                                                <p className="text-xs text-gray-500">{proj.count} Permintaan</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 p-4 bg-gray-50 rounded-lg">
                                    <ProjectIcon className="w-8 h-8 mb-2"/>
                                    <p className="text-xs">Belum ada request berbasis proyek pada periode ini.</p>
                                </div>
                            )}
                        </div>
                     </div>
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
    const [isComputing, setIsComputing] = useState(true); // Simulating heavy calculation delay
    
    useEffect(() => {
        // Simulate loading of heavy analytics
        const timer = setTimeout(() => {
            setIsComputing(false);
        }, 800);
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
            } else if (req.logisticApprovalDate && req.logisticApprover) {
                activities.push({ id: `req-log-approve-${req.id}`, user: req.logisticApprover, action: <>Menyetujui (Logistik) request <strong className="text-gray-900">#{req.id}</strong></>, date: new Date(req.logisticApprovalDate), timestamp: req.logisticApprovalDate, icon: <CheckIcon className="w-4 h-4 text-green-600" />, previewData: { type: 'request', id: req.id } });
            }
            if (req.rejectionDate && req.rejectedBy) {
                activities.push({ id: `req-reject-${req.id}`, user: req.rejectedBy, action: <>Menolak request <strong className="text-gray-900">#{req.id}</strong></>, date: new Date(req.rejectionDate), timestamp: req.rejectionDate, icon: <CloseIcon className="w-4 h-4 text-red-600" />, previewData: { type: 'request', id: req.id } });
            }
        });

        assets.forEach(asset => {
            activities.push({ id: `asset-create-${asset.id}`, user: asset.recordedBy, action: <>Mencatat aset baru <strong className="text-gray-900">{asset.name}</strong></>, date: new Date(asset.registrationDate), timestamp: asset.registrationDate, icon: <RegisterIcon className="w-4 h-4 text-blue-600" />, previewData: { type: 'asset', id: asset.id } });
            if (asset.lastModifiedDate && asset.lastModifiedBy) {
                activities.push({ id: `asset-edit-${asset.id}`, user: asset.lastModifiedBy, action: <>Memperbarui data aset <strong className="text-gray-900">{asset.name}</strong></>, date: new Date(asset.lastModifiedDate), timestamp: asset.lastModifiedDate, icon: <PencilIcon className="w-4 h-4 text-gray-500" />, previewData: { type: 'asset', id: asset.id } });
            }
        });

        handovers.forEach(ho => {
            activities.push({ id: `ho-create-${ho.id}`, user: ho.menyerahkan, action: <>Handover <strong className="text-gray-900">#{ho.id}</strong> kepada {ho.penerima}</>, date: new Date(ho.handoverDate), timestamp: ho.handoverDate, icon: <HandoverIcon className="w-4 h-4 text-purple-600" />, previewData: { type: 'handover', id: ho.id } });
        });
        
        dismantles.forEach(d => {
            activities.push({ id: `dsm-create-${d.id}`, user: d.technician, action: <>Dismantle <strong className="text-gray-900">#{d.id}</strong> dari {d.customerName}</>, date: new Date(d.dismantleDate), timestamp: d.dismantleDate, icon: <DismantleIcon className="w-4 h-4 text-gray-500" />, previewData: { type: 'dismantle', id: d.id } });
        });

        const formatRelativeTime = (date: Date) => {
            const now = new Date();
            const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);
            if (diffSeconds < 60) return `${diffSeconds} detik lalu`;
            const diffMinutes = Math.round(diffSeconds / 60);
            if (diffMinutes < 60) return `${diffMinutes}m lalu`;
            const diffHours = Math.round(diffMinutes / 60);
            if (diffHours < 24) return `${diffHours}j lalu`;
            return `${Math.round(diffHours / 24)}h lalu`;
        };

        return activities
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .map(act => ({ ...act, timestamp: formatRelativeTime(act.date) }));
    }, [assets, requests, handovers, dismantles]);

    const recentActivities = useMemo(() => allActivities.slice(0, 5), [allActivities]);


    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-8">
            {/* 8 Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {isComputing ? (
                    Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="p-6 bg-white border rounded-xl shadow-md border-gray-200/80 h-32">
                            <div className="flex justify-between items-start">
                                <div className="space-y-3 w-full">
                                    <Skeleton height={16} width="60%" />
                                    <Skeleton height={32} width="40%" />
                                    <Skeleton height={12} width="50%" />
                                </div>
                                <Skeleton variant="circular" width={48} height={48} />
                            </div>
                        </div>
                    ))
                ) : (
                    <>
                        <DashboardCard title="Total Tipe Aset" value={inventorySummary.totalAssetTypes} secondaryMetric={`${inventorySummary.totalIndividualAssets} unit`} icon={AssetIcon} color="blue" onClick={() => setActivePage('stock')} />
                        {canViewPrice(currentUser.role) && <DashboardCard title="Total Nilai Stok" value={`Rp ${formatCurrencyShort(inventorySummary.totalValueInStorage)}`} secondaryMetric="Hanya di gudang" icon={DollarIcon} color="green" onClick={() => setActivePage('stock')} tooltipText={`Rp ${inventorySummary.totalValueInStorage.toLocaleString('id-ID')}`}/>}
                        <DashboardCard title="Stok Menipis" value={inventorySummary.lowStockItems} secondaryMetric="Stok ≤ 5 unit" icon={ExclamationTriangleIcon} color="amber" onClick={() => setActivePage('stock', { lowStockOnly: true })} />
                        <DashboardCard title="Stok Habis" value={inventorySummary.outOfStockItems} secondaryMetric="Stok = 0 unit" icon={InboxIcon} color="red" onClick={() => setActivePage('stock', { outOfStockOnly: true })} />
                        
                        <DashboardCard title="Aset Digunakan" value={operationalSummary.inUse} secondaryMetric={`${operationalSummary.totalCustomers} Pelanggan`} icon={UsersIcon} color="green" onClick={() => setActivePage('registration', { status: AssetStatus.IN_USE })} />
                        <DashboardCard title="Dalam Perbaikan" value={operationalSummary.underRepair} secondaryMetric="Internal & Eksternal" icon={SpinnerIcon} color="purple" onClick={() => setActivePage('repair')} />
                        <DashboardCard title="Aset Rusak" value={operationalSummary.damaged} secondaryMetric="Menunggu perbaikan" icon={WrenchIcon} color="amber" onClick={() => setActivePage('repair')} />
                        <DashboardCard title="Total Pelanggan" value={operationalSummary.totalCustomers} secondaryMetric="Semua status" icon={UsersIcon} color="blue" onClick={() => setActivePage('customers')} />
                    </>
                )}
            </div>

            {/* Actionable Items */}
            <ActionableItemsList 
                currentUser={currentUser}
                requests={requests}
                assets={assets}
                setActivePage={setActivePage}
                onShowPreview={onShowPreview}
            />

            {/* Order Analytics and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8">
                    <OrderAnalyticsCard currentUser={currentUser} requests={requests} divisions={divisions} onOpenUrgentReport={() => setIsUrgentReportModalOpen(true)} setActivePage={setActivePage} isLoading={isComputing} />
                </div>
                <div className="lg:col-span-4">
                     <div className="bg-white border border-gray-200/80 rounded-xl shadow-md flex flex-col h-full">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
                            <h2 className="text-base font-semibold text-tm-dark">Riwayat Aktivitas Terbaru</h2>
                            {allActivities.length > 5 && (
                                <button 
                                    onClick={() => setIsActivityModalOpen(true)}
                                    className="px-3 py-1 text-xs font-semibold text-center text-tm-primary transition-colors rounded-lg hover:bg-tm-light"
                                >
                                    Lihat Semua
                                </button>
                            )}
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                            {isComputing ? (
                                <div className="space-y-4">
                                    {[1,2,3,4,5].map(i => (
                                        <div key={i} className="flex gap-3">
                                            <Skeleton variant="circular" width={32} height={32} />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton height={14} width="90%" />
                                                <Skeleton height={10} width="60%" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : recentActivities.length > 0 ? (
                                <ol className="relative ml-3">
                                    <div className="absolute left-3.5 top-5 h-full -translate-x-1/2 w-0.5 bg-gray-200"></div>
                                    {recentActivities.map((log, index) => (
                                        <li key={log.id} className="relative pl-8 pb-6">
                                            <div className="absolute -left-1 top-1 flex items-center justify-center w-8 h-8 bg-white rounded-full">
                                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 ring-4 ring-white">
                                                    {log.icon}
                                                </span>
                                            </div>
                                            <div 
                                                onClick={() => onShowPreview(log.previewData)}
                                                className="p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:shadow-sm hover:border-gray-300 transition-all duration-200"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm text-gray-800 flex-1 min-w-0">{log.action}</p>
                                                    <time className="flex-shrink-0 ml-4 text-xs text-gray-400">{log.timestamp}</time>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">oleh {log.user}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ol>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                                    <InboxIcon className="w-12 h-12 text-gray-300"/>
                                    <p className="mt-2 text-sm font-semibold">Belum ada aktivitas.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            <Modal
                isOpen={isActivityModalOpen}
                onClose={() => setIsActivityModalOpen(false)}
                title={`Semua Aktivitas (${allActivities.length})`}
                size="2xl"
            >
                <div className="max-h-[70vh] overflow-y-auto custom-scrollbar -m-6 p-6">
                    {allActivities.length > 0 ? (
                         <ol className="relative ml-3">
                            <div className="absolute left-3.5 top-5 h-full -translate-x-1/2 w-0.5 bg-gray-200"></div>
                            {allActivities.map((log) => (
                                <li key={log.id} className="relative pl-8 pb-6">
                                    <div className="absolute -left-1 top-1 flex items-center justify-center w-8 h-8 bg-white rounded-full">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 ring-4 ring-white">
                                            {log.icon}
                                        </span>
                                    </div>
                                    <div 
                                        onClick={() => onShowPreview(log.previewData)}
                                        className="p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:shadow-sm hover:border-gray-300 transition-all duration-200"
                                    >
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-gray-800 flex-1 min-w-0">{log.action}</p>
                                            <time className="flex-shrink-0 ml-4 text-xs text-gray-400">{log.timestamp}</time>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">oleh {log.user}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    ) : (
                        <div className="py-12 text-center text-gray-500">
                            <InboxIcon className="w-12 h-12 text-gray-300"/>
                            <p className="mt-2 font-semibold">Belum ada aktivitas.</p>
                        </div>
                    )}
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
