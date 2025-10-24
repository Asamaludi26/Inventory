import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Asset, Request, Handover, Dismantle, Customer, AssetStatus, ItemStatus, Page, PreviewData, AssetCategory, Division, OrderType, OrderDetails, User, UserRole } from '../../types';
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
import { ChevronDownIcon } from '../../components/icons/ChevronDownIcon';
import { useNotification } from '../../providers/NotificationProvider';
import { FireIcon } from '../../components/icons/FireIcon';
import { ProjectIcon } from '../../components/icons/ProjectIcon';
import { BoxIcon } from '../../components/icons/BoxIcon';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { PercentIcon } from '../../components/icons/PercentIcon';
import { HistoryIcon } from '../../components/icons/HistoryIcon';
import { RequestStatusIndicator } from '../itemRequest/ItemRequestPage';
import { InboxIcon } from '../../components/icons/InboxIcon';
import { getStatusClass as getAssetStatusClass } from '../assetRegistration/RegistrationPage';
import { useSortableData, SortConfig } from '../../hooks/useSortableData';
import { PaginationControls } from '../../components/ui/PaginationControls';
import { SortIcon } from '../../components/icons/SortIcon';
import { SortAscIcon } from '../../components/icons/SortAscIcon';
import { SortDescIcon } from '../../components/icons/SortDescIcon';
import { SearchIcon } from '../../components/icons/SearchIcon';
import { EyeIcon } from '../../components/icons/EyeIcon';

const ActivityItem: React.FC<{ icon: React.ReactNode; action: React.ReactNode; user: string; timestamp: string; onClick: () => void; }> = ({ icon, action, user, timestamp, onClick }) => (
    <li 
        className="flex items-center justify-between p-4 space-x-4 transition-colors rounded-lg cursor-pointer hover:bg-gray-50" 
        onClick={onClick}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
        role="button"
        tabIndex={0}
        aria-label={`Aktivitas: ${action}, oleh ${user} ${timestamp}`}
    >
        <div className="flex items-center flex-shrink-0 w-8 h-8 text-gray-500">{icon}</div>
        <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-800 truncate">{action}</p>
            <p className="text-xs text-gray-500">oleh {user}</p>
        </div>
        <span className="flex-shrink-0 text-xs text-gray-400">{timestamp}</span>
    </li>
);

// FIX: Moved formatCurrencyShort to module scope so it can be accessed by OrderAnalyticsCard.
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

const canViewPrice = (role: UserRole) => ['Procurement Admin', 'Super Admin'].includes(role);

// Define DashboardProps interface
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

// FIX: Define SortableHeader component for the asset table in StaffDashboard.
const SortableHeader: React.FC<{
    children: React.ReactNode;
    columnKey: keyof Asset;
    sortConfig: SortConfig<Asset> | null;
    requestSort: (key: keyof Asset) => void;
    className?: string;
}> = ({ children, columnKey, sortConfig, requestSort, className }) => {
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

    const StatCard: React.FC<{ title: string, value: number, icon: React.FC<{className?:string}>, color: 'blue' | 'amber' | 'green'}> = ({ title, value, icon: Icon, color }) => {
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
                                    {/* FIX: Correctly use SortableHeader component which renders a <th> */}
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
    if (currentUser.role === 'Staff') {
        return <StaffDashboard {...props} />;
    }
    
    // --- Admin, Manager, Super Admin View ---
    const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
    const [isActionItemsExpanded, setIsActionItemsExpanded] = useState(true);
    const [isUrgentReportModalOpen, setIsUrgentReportModalOpen] = useState(false);
    const addNotification = useNotification();

    useEffect(() => {
        const stockMap = new Map<string, { inStorage: number }>();
        const activeAssets = assets.filter(asset => asset.status !== AssetStatus.DECOMMISSIONED);

        activeAssets.forEach(asset => {
            const key = `${asset.name}|${asset.brand}`;
            if (!stockMap.has(key)) {
                stockMap.set(key, { inStorage: 0 });
            }
            if (asset.status === AssetStatus.IN_STORAGE) {
                stockMap.get(key)!.inStorage++;
            }
        });
        
        const LOW_STOCK_DEFAULT = 5; // In a real app, this might be configurable from settings
        const lowStockItemsCount = Array.from(stockMap.values()).filter(item => 
            item.inStorage > 0 && item.inStorage <= LOW_STOCK_DEFAULT
        ).length;

        const notificationShown = sessionStorage.getItem('lowStockNotificationShown');

        if (lowStockItemsCount > 0 && !notificationShown) {
            addNotification(
                `Terdapat ${lowStockItemsCount} item dengan stok menipis.`,
                'warning',
                {
                    actions: [
                        { 
                            label: 'Lihat Stok', 
                            onClick: () => setActivePage('stock', { lowStockOnly: true }),
                            variant: 'primary'
                        },
                        {
                            label: 'Tutup',
                            onClick: () => {}, // The notification will be dismissed automatically
                            variant: 'secondary'
                        }
                    ],
                    duration: 15000, // Keep notification for 15 seconds
                }
            );
            sessionStorage.setItem('lowStockNotificationShown', 'true');
        }
    }, [assets, addNotification, setActivePage]);

    const summary = useMemo(() => {
        const statusCounts = {
            [AssetStatus.IN_USE]: 0,
            [AssetStatus.IN_STORAGE]: 0,
            [AssetStatus.DAMAGED]: 0,
            [AssetStatus.DECOMMISSIONED]: 0,
        };
        const categoryCounts: Record<string, number> = {};
        let totalValueInStorage = 0;

        for (const asset of assets) {
            if (statusCounts[asset.status] !== undefined) {
                statusCounts[asset.status]++;
            }
             if (asset.status === AssetStatus.IN_STORAGE && asset.purchasePrice) {
                totalValueInStorage += asset.purchasePrice;
            }
            categoryCounts[asset.category] = (categoryCounts[asset.category] || 0) + 1;
        }

        const topCategories = Object.entries(categoryCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        
        const pendingRequestCount = requests.filter(r => [ItemStatus.PENDING, ItemStatus.LOGISTIC_APPROVED].includes(r.status)).length;
        const pendingUrgentCount = requests.filter(r => r.order.type === 'Urgent' && [ItemStatus.PENDING, ItemStatus.LOGISTIC_APPROVED].includes(r.status)).length;
        const arrivedToRegisterCount = requests.filter(r => r.status === ItemStatus.ARRIVED && !r.isRegistered).length;
        const approvedAwaitingProcurementCount = requests.filter(r => r.status === ItemStatus.APPROVED).length;
        
        const now = new Date();
        const expiringAssetsCount = assets.filter(a => {
            if (!a.warrantyEndDate) return false;
            const warrantyEnd = new Date(a.warrantyEndDate);
            const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
            return warrantyEnd > now && warrantyEnd <= nextMonth;
        }).length;
        
        const totalActionableItems = pendingRequestCount + arrivedToRegisterCount + approvedAwaitingProcurementCount + statusCounts[AssetStatus.DAMAGED] + expiringAssetsCount;

        return {
            totalAssets: assets.length,
            statusCounts,
            topCategories,
            pendingRequestCount,
            pendingUrgentCount,
            arrivedToRegisterCount,
            approvedAwaitingProcurementCount,
            expiringAssetsCount,
            totalValueInStorage,
            totalActionableItems,
        };
    }, [assets, requests]);

    const fullStockValue = `Rp ${summary.totalValueInStorage.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    const shortStockValue = `Rp ${formatCurrencyShort(summary.totalValueInStorage)}`;

    const displayTotalAssets = summary.totalAssets - summary.statusCounts[AssetStatus.DAMAGED];

    const statusData = [
        { label: AssetStatus.IN_USE, value: summary.statusCounts[AssetStatus.IN_USE], color: 'info', onClick: () => setActivePage('registration', { status: AssetStatus.IN_USE }) },
        { label: AssetStatus.IN_STORAGE, value: summary.statusCounts[AssetStatus.IN_STORAGE], color: 'neutral', onClick: () => setActivePage('registration', { status: AssetStatus.IN_STORAGE }) },
        { label: AssetStatus.DECOMMISSIONED, value: summary.statusCounts[AssetStatus.DECOMMISSIONED], color: 'danger', onClick: () => setActivePage('registration', { status: AssetStatus.DECOMMISSIONED }) },
    ];
    
    const statusColorClasses: Record<string, { dot: string; progress: string }> = {
        info: { dot: 'bg-info', progress: 'bg-info' },
        neutral: { dot: 'bg-gray-400', progress: 'bg-gray-400' },
        danger: { dot: 'bg-danger', progress: 'bg-danger' },
    };

    const ActionCard: React.FC<{ 
        title: string; 
        value: number; 
        icon: React.FC<{className?: string}>; 
        onClick: () => void;
        color: 'info' | 'success' | 'warning' | 'danger';
    }> = ({ title, value, icon: Icon, onClick, color }) => {
        const colorClasses = {
            info: { border: 'border-l-info', iconText: 'text-info-text', iconBg: 'bg-info-light' },
            success: { border: 'border-l-success', iconText: 'text-success-text', iconBg: 'bg-success-light' },
            warning: { border: 'border-l-warning', iconText: 'text-warning-text', iconBg: 'bg-warning-light' },
            danger: { border: 'border-l-danger', iconText: 'text-danger-text', iconBg: 'bg-danger-light' },
        };
        const currentColors = colorClasses[color];
        return (
            <div 
                onClick={onClick} 
                className={`p-4 bg-white rounded-lg cursor-pointer hover:bg-gray-50 transition-all duration-200 border border-gray-200/80 border-l-4 hover:shadow-md hover:border-l-tm-primary ${currentColors.border}`}
            >
                <div className="flex items-center gap-4">
                    <div className={`flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-full ${currentColors.iconBg}`}>
                        <Icon className={`w-5 h-5 ${currentColors.iconText}`}/>
                    </div>
                    <div className="flex-1">
                        <p className="text-2xl font-bold text-tm-dark">{value}</p>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
                    </div>
                </div>
            </div>
        );
    };
    
    interface StatCardProps {
        icon: React.FC<{ className?: string }>;
        title: string;
        value: string | number;
        className?: string;
        tooltipText?: string;
        color: 'primary' | 'success' | 'warning' | 'info';
        onClick?: () => void;
    }
    
    const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, className, tooltipText, color, onClick }) => {
        const colorClasses = {
            primary: { text: 'text-tm-primary', bg: 'bg-blue-100' },
            info: { text: 'text-info-text', bg: 'bg-info-light' },
            success: { text: 'text-success-text', bg: 'bg-success-light' },
            warning: { text: 'text-warning-text', bg: 'bg-warning-light' },
        };
        const currentColors = colorClasses[color];
        const valueElement = <p className="text-2xl font-bold text-tm-dark truncate">{value}</p>;
    
        return (
             <div className={`flex items-center p-4 ${className} ${onClick ? 'cursor-pointer rounded-lg hover:bg-gray-50' : ''}`} onClick={onClick}>
                <div className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-lg ${currentColors.bg} ${currentColors.text}`}>
                    <Icon className="h-6 w-6" />
                </div>
                <div className="ml-4 min-w-0">
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    {tooltipText ? (
                        <Tooltip text={tooltipText}>
                            {valueElement}
                        </Tooltip>
                    ) : (
                        valueElement
                    )}
                </div>
            </div>
        );
    };
    
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
            activities.push({ id: `req-create-${req.id}`, user: req.requester, action: <>Membuat request baru <strong className="text-gray-900">#{req.id}</strong></>, date: new Date(req.requestDate), timestamp: req.requestDate, icon: <RequestIcon />, previewData: { type: 'request', id: req.id } });
            if (req.finalApprovalDate && req.finalApprover) {
                activities.push({ id: `req-approve-${req.id}`, user: req.finalApprover, action: <>Menyetujui request <strong className="text-gray-900">#{req.id}</strong></>, date: new Date(req.finalApprovalDate), timestamp: req.finalApprovalDate, icon: <CheckIcon className="text-success" />, previewData: { type: 'request', id: req.id } });
            } else if (req.logisticApprovalDate && req.logisticApprover) {
                activities.push({ id: `req-log-approve-${req.id}`, user: req.logisticApprover, action: <>Menyetujui (Logistik) request <strong className="text-gray-900">#{req.id}</strong></>, date: new Date(req.logisticApprovalDate), timestamp: req.logisticApprovalDate, icon: <CheckIcon className="text-success" />, previewData: { type: 'request', id: req.id } });
            }
            if (req.rejectionDate && req.rejectedBy) {
                activities.push({ id: `req-reject-${req.id}`, user: req.rejectedBy, action: <>Menolak request <strong className="text-gray-900">#{req.id}</strong></>, date: new Date(req.rejectionDate), timestamp: req.rejectionDate, icon: <CloseIcon className="text-danger" />, previewData: { type: 'request', id: req.id } });
            }
        });

        assets.forEach(asset => {
            activities.push({ id: `asset-create-${asset.id}`, user: asset.recordedBy, action: <>Mencatat aset baru <strong className="text-gray-900">{asset.name}</strong></>, date: new Date(asset.registrationDate), timestamp: asset.registrationDate, icon: <RegisterIcon />, previewData: { type: 'asset', id: asset.id } });
            if (asset.lastModifiedDate && asset.lastModifiedBy) {
                activities.push({ id: `asset-edit-${asset.id}`, user: asset.lastModifiedBy, action: <>Memperbarui data aset <strong className="text-gray-900">{asset.name}</strong></>, date: new Date(asset.lastModifiedDate), timestamp: asset.lastModifiedDate, icon: <PencilIcon />, previewData: { type: 'asset', id: asset.id } });
            }
        });

        handovers.forEach(ho => {
            activities.push({ id: `ho-create-${ho.id}`, user: ho.menyerahkan, action: <>Handover <strong className="text-gray-900">#{ho.id}</strong> kepada {ho.penerima}</>, date: new Date(ho.handoverDate), timestamp: ho.handoverDate, icon: <HandoverIcon />, previewData: { type: 'handover', id: ho.id } });
        });
        
        dismantles.forEach(d => {
            activities.push({ id: `dsm-create-${d.id}`, user: d.technician, action: <>Dismantle <strong className="text-gray-900">#{d.id}</strong> dari {d.customerName}</>, date: new Date(d.dismantleDate), timestamp: d.dismantleDate, icon: <DismantleIcon />, previewData: { type: 'dismantle', id: d.id } });
        });

        const formatRelativeTime = (date: Date) => {
            const now = new Date();
            const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);
            if (diffSeconds < 60) return `${diffSeconds} detik lalu`;
            const diffMinutes = Math.round(diffSeconds / 60);
            if (diffMinutes < 60) return `${diffMinutes} menit lalu`;
            const diffHours = Math.round(diffMinutes / 60);
            if (diffHours < 24) return `${diffHours} jam lalu`;
            return `${Math.round(diffHours / 24)} hari lalu`;
        };

        return activities
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .map(act => ({ ...act, timestamp: formatRelativeTime(act.date) }));
    }, [assets, requests, handovers, dismantles]);

    const recentActivities = useMemo(() => allActivities.slice(0, 7), [allActivities]);


    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-8">
            <h1 className="text-3xl font-bold text-tm-dark">Dashboard</h1>
            
            {/* Card 1: Ringkasan Statistik */}
            <div className="bg-white border border-gray-200/80 rounded-xl shadow-md">
                <h2 className="p-6 text-lg font-semibold border-b border-gray-200 text-tm-dark">Ringkasan Statistik</h2>
                <div className="grid grid-cols-1 md:grid-cols-3">
                    <StatCard 
                        icon={AssetIcon} 
                        title="Total Aset Operasional" 
                        value={displayTotalAssets}
                        className="border-b md:border-b-0 md:border-r border-gray-200/80"
                        color="primary"
                        onClick={() => setActivePage('registration')}
                    />
                    {canViewPrice(currentUser.role) && (
                        <StatCard 
                            icon={DollarIcon} 
                            title="Total Nilai Stok" 
                            value={shortStockValue}
                            tooltipText={fullStockValue}
                            className="border-b md:border-b-0 md:border-r border-gray-200/80"
                            color="success"
                            onClick={() => setActivePage('stock')}
                        />
                    )}
                    <StatCard 
                        icon={UsersIcon} 
                        title="Aset Digunakan" 
                        value={summary.statusCounts[AssetStatus.IN_USE]}
                        className={!canViewPrice(currentUser.role) ? "md:border-r border-gray-200/80" : ""}
                        color="info"
                        onClick={() => setActivePage('registration', { status: AssetStatus.IN_USE })}
                    />
                </div>
            </div>

             {/* Card 2: Item Perlu Tindakan (Clickable) */}
            <div className="bg-white border border-gray-200/80 rounded-xl shadow-md overflow-hidden">
                <button 
                    onClick={() => setIsActionItemsExpanded(prev => !prev)}
                    className="flex items-center justify-between w-full p-6 text-left transition-colors hover:bg-gray-50/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-tm-accent"
                    aria-expanded={isActionItemsExpanded}
                    aria-controls="actionable-items-panel"
                >
                    <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-lg bg-warning-light text-warning-text">
                            <WrenchIcon className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-tm-dark">Item Perlu Tindakan</h2>
                            <p className="text-sm text-gray-500">{summary.totalActionableItems} item menunggu aksi Anda</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-tm-dark">{summary.totalActionableItems}</span>
                        <ChevronDownIcon className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${isActionItemsExpanded ? 'rotate-180' : ''}`} />
                    </div>
                </button>
                <div 
                    id="actionable-items-panel"
                    className={`transition-all duration-500 ease-in-out overflow-hidden ${isActionItemsExpanded ? 'max-h-[500px]' : 'max-h-0'}`}
                >
                    <div className="p-6 pt-0 border-t border-gray-200/80">
                        <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                           <ActionCard title="Urgent Menunggu Aksi" value={summary.pendingUrgentCount} onClick={() => setActivePage('request', { status: 'urgent-awaiting-approval' })} icon={FireIcon} color="danger" />
                           <ActionCard title="Perlu Persetujuan" value={summary.pendingRequestCount} onClick={() => setActivePage('request', { status: 'awaiting-approval' })} icon={RequestIcon} color="warning" />
                            <ActionCard title="Menunggu Pengadaan" value={summary.approvedAwaitingProcurementCount} onClick={() => setActivePage('request', { status: ItemStatus.APPROVED })} icon={ShoppingCartIcon} color="info" />
                            <ActionCard title="Siap Dicatat" value={summary.arrivedToRegisterCount} onClick={() => setActivePage('request', { status: ItemStatus.ARRIVED })} icon={ArchiveBoxIcon} color="success" />
                            <ActionCard title="Aset Rusak" value={summary.statusCounts[AssetStatus.DAMAGED]} onClick={() => setActivePage('registration', { status: AssetStatus.DAMAGED })} icon={WrenchIcon} color="danger" />
                            <ActionCard title="Garansi Segera Habis" value={summary.expiringAssetsCount} onClick={() => setActivePage('registration', { warranty: 'expiring' })} icon={ExclamationTriangleIcon} color="warning" />
                        </div>
                    </div>
                </div>
            </div>

            <OrderAnalyticsCard currentUser={currentUser} requests={requests} divisions={divisions} onOpenUrgentReport={() => setIsUrgentReportModalOpen(true)} setActivePage={setActivePage} />
            
            {/* Card 3: Rincian Aset */}
            <div className="bg-white border border-gray-200/80 rounded-xl shadow-md">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                    <div className="p-6 lg:border-r border-gray-200/80">
                         <h3 className="text-base font-semibold text-gray-800 mb-4">Status Aset (Operasional)</h3>
                        <div className="space-y-4">
                            {statusData.map(item => {
                                const percentage = displayTotalAssets > 0 ? (item.value / displayTotalAssets) * 100 : 0;
                                const colors = statusColorClasses[item.color];
                                return (
                                    <div key={item.label} onClick={item.onClick} className="cursor-pointer group">
                                        <div className="flex justify-between items-center text-sm mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2.5 h-2.5 rounded-full ${colors.dot}`}></span>
                                                <span className="font-medium text-gray-600 group-hover:text-tm-primary">{item.label}</span>
                                            </div>
                                            <span className="font-semibold text-gray-800">{item.value}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div className={`h-2 rounded-full ${colors.progress}`} style={{ width: `${percentage}%` }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="p-6 border-t lg:border-t-0 border-gray-200/80">
                         <h3 className="text-base font-semibold text-gray-800 mb-4">Distribusi per Kategori</h3>
                         <div className="space-y-4">
                            {summary.topCategories.map(cat => {
                                const percentage = summary.totalAssets > 0 ? (cat.count / summary.totalAssets) * 100 : 0;
                                return (
                                    <div key={cat.name} onClick={() => setActivePage('registration', { category: cat.name })} className="text-sm cursor-pointer group">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-medium text-gray-600 group-hover:text-tm-primary truncate pr-2">{cat.name}</span>
                                            <span className="font-semibold text-gray-800">{cat.count}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div className="bg-blue-400 group-hover:bg-tm-primary h-2 rounded-full transition-colors" style={{ width: `${percentage}%` }}></div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Activity History */}
                 <div className="bg-white border border-gray-200/80 rounded-xl shadow-md">
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                       <h2 className="text-lg font-semibold text-tm-dark">Riwayat Aktivitas Terbaru</h2>
                       {allActivities.length > 7 && (
                            <button 
                                onClick={() => setIsActivityModalOpen(true)}
                                className="px-3 py-1 text-sm font-semibold text-center text-tm-primary transition-colors rounded-lg hover:bg-tm-light"
                            >
                                Lihat Semua
                            </button>
                        )}
                    </div>
                    <ul className="divide-y divide-gray-200">
                        {recentActivities.length > 0 ? (
                            recentActivities.map(log => <ActivityItem key={log.id} {...log} onClick={() => onShowPreview(log.previewData)} />)
                        ) : (
                            <li className="p-4 text-sm text-center text-gray-500">Belum ada aktivitas.</li>
                        )}
                    </ul>
                </div>
            </div>

            <Modal
                isOpen={isActivityModalOpen}
                onClose={() => setIsActivityModalOpen(false)}
                title={`Semua Aktivitas (${allActivities.length})`}
                size="2xl"
            >
                <div className="max-h-[70vh] overflow-y-auto custom-scrollbar -mx-6 -my-6">
                    <ul className="divide-y divide-gray-200">
                        {allActivities.map(log => (
                            <ActivityItem 
                                key={log.id} 
                                {...log} 
                                onClick={() => onShowPreview(log.previewData)}
                            />
                        ))}
                    </ul>
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

const OrderAnalyticsCard: React.FC<{ currentUser: User; requests: Request[]; divisions: Division[]; onOpenUrgentReport: () => void, setActivePage: (page: Page, filters?: any) => void; }> = ({ currentUser, requests, divisions, onOpenUrgentReport, setActivePage }) => {
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

    const KpiCard: React.FC<{
        icon: React.FC<{className?: string; style?: React.CSSProperties;}>;
        title: string;
        value: string | number;
        color: string;
        onClick?: () => void;
        tooltip?: string;
    }> = ({ icon: Icon, title, value, color, onClick, tooltip }) => (
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

const UrgentReportModal: React.FC<{isOpen: boolean; onClose: () => void; requests: Request[]}> = ({ isOpen, onClose, requests }) => {
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