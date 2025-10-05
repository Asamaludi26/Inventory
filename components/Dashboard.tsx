import React, { useMemo, useState } from 'react';
import { Asset, Request, Handover, Dismantle, Customer, AssetStatus, ItemStatus, Page, PreviewData } from '../types';
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
import { ArrowTrendingUpIcon } from './icons/ArrowTrendingUpIcon';
import { ArrowTrendingDownIcon } from './icons/ArrowTrendingDownIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { CustomerIcon } from './icons/CustomerIcon';


interface DashboardProps {
    assets: Asset[];
    requests: Request[];
    handovers: Handover[];
    dismantles: Dismantle[];
    customers: Customer[];
    setActivePage: (page: Page, filters?: any) => void;
    onShowPreview: (data: PreviewData) => void;
}

type CardVariant = 'info' | 'neutral' | 'warning' | 'danger';

const cardConfig: Record<CardVariant, { bg: string; text: string; icon: React.FC<any> }> = {
    info: { bg: 'bg-info-light', text: 'text-info-text', icon: WrenchIcon },
    neutral: { bg: 'bg-gray-100', text: 'text-gray-600', icon: ArchiveBoxIcon },
    warning: { bg: 'bg-warning-light', text: 'text-warning-text', icon: RequestIcon },
    danger: { bg: 'bg-danger-light', text: 'text-danger-text', icon: ExclamationTriangleIcon },
};

const SummaryCard: React.FC<{ 
    title: string; 
    value: string | number; 
    variant: CardVariant;
    trend: number; 
    trendPeriod: string; 
    onClick?: () => void; 
}> = ({ title, value, variant, trend, trendPeriod, onClick }) => {
    const isPositive = trend >= 0;
    const TrendIcon = isPositive ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;
    const trendColor = isPositive ? 'text-success' : 'text-danger';
    const config = cardConfig[variant];
    const Icon = config.icon;

    return (
        <div 
            onClick={onClick}
            className={`p-6 bg-white border border-gray-200/80 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg hover:border-tm-accent/50 hover:-translate-y-1 ${onClick ? 'cursor-pointer' : ''}`}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h3 className="text-sm font-medium tracking-wide text-gray-500">{title}</h3>
                    <p className="mt-2 text-3xl font-bold text-tm-dark" title={value.toString()}>{value}</p>
                </div>
                <div className={`flex items-center justify-center flex-shrink-0 w-12 h-12 rounded-lg ${config.bg}`}>
                    <Icon className={`w-6 h-6 ${config.text}`} />
                </div>
            </div>
            <div className="flex items-center mt-4 text-xs text-gray-500">
                <span className={`flex items-center gap-1 font-semibold ${trendColor}`}>
                    <TrendIcon className="w-4 h-4" />
                    <span>{isPositive ? '+' : ''}{trend}</span>
                </span>
                <span className="ml-2">vs {trendPeriod}</span>
            </div>
        </div>
    );
};


const TaskItem: React.FC<{ icon: React.ReactNode; text: React.ReactNode; priority: 'Tinggi' | 'Sedang'; onClick?: () => void }> = ({ icon, text, priority, onClick }) => {
    const priorityClasses = priority === 'Tinggi' 
        ? 'border-danger-light bg-danger-light text-danger-text' 
        : 'border-warning-light bg-warning-light text-warning-text';
    return (
        <li
            onClick={onClick}
            className={`flex items-center p-3 space-x-3 transition-colors border-l-4 rounded-r-md ${priorityClasses} ${onClick ? 'cursor-pointer hover:bg-opacity-60' : ''}`}
        >
            <div className="flex-shrink-0">{icon}</div>
            <div className="flex-1 text-sm">{text}</div>
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                priority === 'Tinggi' ? 'bg-danger-light text-danger-text' : 'bg-warning-light text-warning-text'
            }`}>{priority}</span>
        </li>
    );
};

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

const AssetStatusBar: React.FC<{ status: AssetStatus; count: number; total: number; color: string; onClick?: () => void }> = ({ status, count, total, color, onClick }) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
        <div
            onClick={onClick}
            className={`p-2 -m-2 rounded-lg transition-colors ${onClick ? 'cursor-pointer hover:bg-gray-100' : ''}`}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : -1}
            onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
            aria-label={`Lihat aset dengan status ${status}`}
        >
            <div className="flex justify-between mb-1 text-sm">
                <span className="font-medium text-gray-700">{status}</span>
                <span className="text-gray-500">{count} Aset</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5" aria-hidden="true">
                <div className={`${color} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};

const CategoryDistributionChart: React.FC<{ assets: Asset[]; setActivePage: (page: Page, filters?: any) => void; }> = ({ assets, setActivePage }) => {
    const categoryData = useMemo(() => {
        const counts: Record<string, number> = {};
        assets.forEach(asset => {
            counts[asset.category] = (counts[asset.category] || 0) + 1;
        });
        
        const sorted = Object.entries(counts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 7); // Show top 7 categories

        const maxCount = sorted.length > 0 ? sorted[0].count : 0;
        
        return { sorted, maxCount };
    }, [assets]);

    const { sorted, maxCount } = categoryData;
    const barColors = ['bg-tm-primary', 'bg-blue-500', 'bg-blue-400', 'bg-sky-400', 'bg-cyan-400', 'bg-teal-400', 'bg-gray-400'];

    return (
        <div className="bg-white border border-gray-200/80 rounded-xl shadow-md">
            <h2 className="p-6 text-lg font-semibold border-b border-gray-200 text-tm-dark">Distribusi Aset by Kategori</h2>
            <div className="p-6 space-y-2">
                {sorted.length > 0 ? sorted.map((item, index) => {
                    const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                    return (
                        <div
                            key={item.name}
                            onClick={() => setActivePage('registration', { category: item.name })}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActivePage('registration', { category: item.name }); } }}
                            aria-label={`Lihat aset kategori ${item.name}`}
                            className="flex items-center text-sm p-2 -m-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                            <span className="w-1/3 font-medium text-gray-600 truncate" title={item.name}>{item.name}</span>
                            <div className="flex-1 w-2/3 mx-2 bg-gray-200 rounded-full h-3.5">
                                <div 
                                    className={`${barColors[index % barColors.length]} h-3.5 rounded-full`}
                                    style={{ width: `${percentage}%` }}
                                    title={`${item.count} aset`}
                                />
                            </div>
                            <span className="w-10 text-right font-semibold text-gray-800">{item.count}</span>
                        </div>
                    );
                }) : <p className="text-sm text-center text-gray-500">Belum ada data aset untuk ditampilkan.</p>}
            </div>
        </div>
    );
};


const Dashboard: React.FC<DashboardProps> = ({ assets, requests, handovers, dismantles, customers, setActivePage, onShowPreview }) => {
    const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);

    const summaryData = useMemo(() => {
        const inUseCount = assets.filter(a => a.status === AssetStatus.IN_USE).length;
        const pendingRequestCount = requests.filter(r => [ItemStatus.PENDING, ItemStatus.LOGISTIC_APPROVED].includes(r.status)).length;
        const damagedAssetCount = assets.filter(a => a.status === AssetStatus.DAMAGED).length;

        return [
            { title: 'Aset Digunakan', value: inUseCount, variant: 'info' as CardVariant, trend: 5, trendPeriod: 'minggu lalu', action: () => setActivePage('registration', { status: AssetStatus.IN_USE }) },
            { title: 'Aset di Gudang', value: assets.filter(a => a.status === AssetStatus.IN_STORAGE).length, variant: 'neutral' as CardVariant, trend: -2, trendPeriod: 'minggu lalu', action: () => setActivePage('registration', { status: AssetStatus.IN_STORAGE }) },
            { title: 'Perlu Persetujuan', value: pendingRequestCount, variant: 'warning' as CardVariant, trend: 1, trendPeriod: 'kemarin', action: () => setActivePage('request', { status: 'awaiting-approval' }) },
            { title: 'Aset Rusak', value: damagedAssetCount, variant: 'danger' as CardVariant, trend: 0, trendPeriod: 'kemarin', action: () => setActivePage('registration', { status: AssetStatus.DAMAGED }) },
        ];
    }, [assets, requests, setActivePage]);
    
    const assetStatusDistribution = useMemo(() => {
        const distribution = {
            [AssetStatus.IN_USE]: 0,
            [AssetStatus.IN_STORAGE]: 0,
            [AssetStatus.DAMAGED]: 0,
            [AssetStatus.DECOMMISSIONED]: 0
        };
        assets.forEach(asset => {
            if (distribution[asset.status] !== undefined) {
                distribution[asset.status]++;
            }
        });
        return distribution;
    }, [assets]);
    
    const urgentTasks = useMemo(() => {
        const tasks = [];
        const pendingRequests = requests.filter(r => [ItemStatus.PENDING, ItemStatus.LOGISTIC_APPROVED].includes(r.status));
        if (pendingRequests.length > 0) {
            tasks.push({
                id: 'task-req',
                icon: <RequestIcon className="w-6 h-6 text-danger-text"/>,
                text: <p>Ada <span className="font-bold">{pendingRequests.length} request</span> menunggu persetujuan.</p>,
                priority: 'Tinggi' as const,
                onClick: () => setActivePage('request', { status: 'awaiting-approval' }),
            });
        }
        
        const damagedAssets = assets.filter(a => a.status === AssetStatus.DAMAGED);
        if (damagedAssets.length > 0) {
             tasks.push({
                id: 'task-dmg',
                icon: <WrenchIcon className="w-6 h-6 text-danger-text"/>,
                text: <p><span className="font-bold">{damagedAssets.length} aset</span> dilaporkan rusak dan perlu diperiksa.</p>,
                priority: 'Tinggi' as const,
                onClick: () => setActivePage('registration', { status: AssetStatus.DAMAGED }),
            });
        }
        
        const now = new Date();
        const expiringAssets = assets.filter(a => {
            if (!a.warrantyEndDate) return false;
            const warrantyEnd = new Date(a.warrantyEndDate);
            return warrantyEnd.getMonth() === now.getMonth() && warrantyEnd.getFullYear() === now.getFullYear();
        });

        if (expiringAssets.length > 0) {
            tasks.push({
                id: 'task-warr',
                icon: <CustomerIcon className="w-6 h-6 text-warning-text"/>,
                text: <p><span className="font-bold">{expiringAssets.length} Aset</span> akan habis masa garansinya bulan ini.</p>,
                priority: 'Sedang' as const,
                onClick: () => setActivePage('registration', { warranty: 'expiring' }),
            });
        }

        return tasks;

    }, [requests, assets, setActivePage]);
    
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

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {summaryData.map(item => <SummaryCard key={item.title} {...item} onClick={item.action} />)}
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-8">
                    {/* Tasks Card */}
                    <div className="bg-white border border-gray-200/80 rounded-xl shadow-md">
                        <h2 className="p-6 text-lg font-semibold border-b border-gray-200 text-tm-dark">Tugas & Peringatan Mendesak</h2>
                        <div className="p-4 space-y-3">
                            {urgentTasks.length > 0 ? (
                                urgentTasks.map(task => <TaskItem key={task.id} {...task} />)
                            ) : (
                                <p className="p-4 text-sm text-center text-gray-500">Tidak ada tugas mendesak saat ini. Kerja bagus!</p>
                            )}
                        </div>
                    </div>
                    
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

                <div className="space-y-8">
                    {/* Asset Status */}
                     <div className="bg-white border border-gray-200/80 rounded-xl shadow-md">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-tm-dark">Status Aset</h2>
                            <span className="px-2.5 py-1 text-xs font-semibold text-gray-700 bg-gray-100 rounded-full">
                                Total: {assets.length}
                            </span>
                        </div>
                        <div className="p-4 space-y-2">
                            <AssetStatusBar 
                                status={AssetStatus.IN_USE} 
                                count={assetStatusDistribution[AssetStatus.IN_USE]} 
                                total={assets.length} 
                                color="bg-info" 
                                onClick={() => setActivePage('registration', { status: AssetStatus.IN_USE })}
                            />
                            <AssetStatusBar 
                                status={AssetStatus.IN_STORAGE} 
                                count={assetStatusDistribution[AssetStatus.IN_STORAGE]} 
                                total={assets.length} 
                                color="bg-tm-secondary"
                                onClick={() => setActivePage('registration', { status: AssetStatus.IN_STORAGE })}
                            />
                            <AssetStatusBar 
                                status={AssetStatus.DAMAGED} 
                                count={assetStatusDistribution[AssetStatus.DAMAGED]} 
                                total={assets.length} 
                                color="bg-warning"
                                onClick={() => setActivePage('registration', { status: AssetStatus.DAMAGED })}
                            />
                            <AssetStatusBar 
                                status={AssetStatus.DECOMMISSIONED} 
                                count={assetStatusDistribution[AssetStatus.DECOMMISSIONED]} 
                                total={assets.length} 
                                color="bg-danger"
                                onClick={() => setActivePage('registration', { status: AssetStatus.DECOMMISSIONED })}
                            />
                        </div>
                    </div>
                    {/* Category Distribution Chart */}
                    <CategoryDistributionChart assets={assets} setActivePage={setActivePage} />
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