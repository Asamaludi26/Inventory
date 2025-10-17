import React, { useMemo, useState, useEffect } from 'react';
import { Asset, Request, Handover, Dismantle, Customer, AssetStatus, ItemStatus, Page, PreviewData, AssetCategory } from '../types';
import { WrenchIcon } from './icons/WrenchIcon';
import { RequestIcon } from './icons/RequestIcon';
import { HandoverIcon } from './icons/HandoverIcon';
import { DismantleIcon } from './icons/DismantleIcon';
import { RegisterIcon } from './icons/RegisterIcon';
import { CheckIcon } from './icons/CheckIcon';
import { CloseIcon } from './icons/CloseIcon';
import { PencilIcon } from './icons/PencilIcon';
import Modal from './shared/Modal';
import { ArchiveBoxIcon } from './icons/ArchiveBoxIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { ShoppingCartIcon } from './icons/ShoppingCartIcon';
import { AssetIcon } from './icons/AssetIcon';
import { DollarIcon } from './icons/DollarIcon';
import { UsersIcon } from './icons/UsersIcon';
import { Tooltip } from './shared/Tooltip';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { useNotification } from './shared/Notification';

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

// Define DashboardProps interface
interface DashboardProps {
    assets: Asset[];
    requests: Request[];
    handovers: Handover[];
    dismantles: Dismantle[];
    customers: Customer[];
    assetCategories: AssetCategory[];
    setActivePage: (page: Page, filters?: any) => void;
    onShowPreview: (data: PreviewData) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ assets, requests, handovers, dismantles, customers, assetCategories, setActivePage, onShowPreview }) => {
    const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
    const [isActionItemsExpanded, setIsActionItemsExpanded] = useState(false);
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
            arrivedToRegisterCount,
            approvedAwaitingProcurementCount,
            expiringAssetsCount,
            totalValueInStorage,
            totalActionableItems,
        };
    }, [assets, requests]);

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
                    <StatCard 
                        icon={DollarIcon} 
                        title="Total Nilai Stok" 
                        value={shortStockValue}
                        tooltipText={fullStockValue}
                        className="border-b md:border-b-0 md:border-r border-gray-200/80"
                        color="success"
                        onClick={() => setActivePage('stock')}
                    />
                    <StatCard 
                        icon={UsersIcon} 
                        title="Aset Digunakan" 
                        value={summary.statusCounts[AssetStatus.IN_USE]}
                        className=""
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
                           <ActionCard title="Perlu Persetujuan" value={summary.pendingRequestCount} onClick={() => setActivePage('request', { status: 'awaiting-approval' })} icon={RequestIcon} color="warning" />
                            <ActionCard title="Menunggu Pengadaan" value={summary.approvedAwaitingProcurementCount} onClick={() => setActivePage('request', { status: ItemStatus.APPROVED })} icon={ShoppingCartIcon} color="info" />
                            <ActionCard title="Siap Dicatat" value={summary.arrivedToRegisterCount} onClick={() => setActivePage('request', { status: ItemStatus.ARRIVED })} icon={ArchiveBoxIcon} color="success" />
                            <ActionCard title="Aset Rusak" value={summary.statusCounts[AssetStatus.DAMAGED]} onClick={() => setActivePage('registration', { status: AssetStatus.DAMAGED })} icon={WrenchIcon} color="danger" />
                            <ActionCard title="Garansi Segera Habis" value={summary.expiringAssetsCount} onClick={() => setActivePage('registration', { warranty: 'expiring' })} icon={ExclamationTriangleIcon} color="warning" />
                        </div>
                    </div>
                </div>
            </div>
            
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
        </div>
    );
};

export default Dashboard;