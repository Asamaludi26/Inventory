import React, { useMemo } from 'react';
import { Asset, Request, Handover, Dismantle, Customer, AssetStatus, ItemStatus, Page } from '../types';
import { AssetIcon } from './icons/AssetIcon';
import { WrenchIcon } from './icons/WrenchIcon';
import { RequestIcon } from './icons/RequestIcon';
import { CustomerIcon } from './icons/CustomerIcon';
import { HandoverIcon } from './icons/HandoverIcon';
import { DismantleIcon } from './icons/DismantleIcon';
import { RegisterIcon } from './icons/RegisterIcon';
import { ArrowUpIcon } from './icons/ArrowUpIcon';
import { ArrowDownIcon } from './icons/ArrowDownIcon';

interface DashboardProps {
    assets: Asset[];
    requests: Request[];
    handovers: Handover[];
    dismantles: Dismantle[];
    customers: Customer[];
    setActivePage: (page: Page) => void;
}

const SummaryCard: React.FC<{ title: string; value: string | number; icon: React.FC<{ className?: string }>; trend: number; trendPeriod: string; }> = ({ title, value, icon: Icon, trend, trendPeriod }) => {
    const isPositive = trend >= 0;
    const TrendIcon = isPositive ? ArrowUpIcon : ArrowDownIcon;
    const trendColor = isPositive ? 'text-success' : 'text-danger';

    return (
        <div className="flex items-start p-6 bg-white border border-gray-200/80 rounded-xl shadow-md transition-all hover:shadow-lg hover:border-tm-accent/50">
            <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mr-4 text-white rounded-full bg-tm-primary">
                <Icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-500">{title}</h3>
                <p className="mt-1 text-3xl font-bold text-tm-dark">{value}</p>
                 <div className="flex items-center mt-1 text-xs text-gray-500">
                    <TrendIcon className={`w-3.5 h-3.5 mr-1 ${trendColor}`} />
                    <span className={`${trendColor} font-semibold`}>{isPositive ? '+' : ''}{trend}</span>
                    <span className="ml-1">vs {trendPeriod}</span>
                </div>
            </div>
        </div>
    );
};

const TaskItem: React.FC<{ icon: React.ReactNode; text: React.ReactNode; priority: 'Tinggi' | 'Sedang'; onClick?: () => void }> = ({ icon, text, priority, onClick }) => {
    const priorityClasses = priority === 'Tinggi' 
        ? 'border-danger-light bg-danger-light/30 text-danger-text' 
        : 'border-warning-light bg-warning-light/30 text-warning-text';
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

const ActivityItem: React.FC<{ icon: React.ReactNode; action: string; user: string; timestamp: string }> = ({ icon, action, user, timestamp }) => (
    <li className="flex items-center justify-between p-4 space-x-4 hover:bg-gray-50">
        <div className="flex items-center flex-shrink-0 w-8 h-8 text-gray-500">{icon}</div>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{action}</p>
            <p className="text-xs text-gray-500">oleh {user}</p>
        </div>
        <span className="flex-shrink-0 text-xs text-gray-400">{timestamp}</span>
    </li>
);

const AssetStatusBar: React.FC<{ status: AssetStatus; count: number; total: number; color: string }> = ({ status, count, total, color }) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
        <div>
            <div className="flex justify-between mb-1 text-sm">
                <span className="font-medium text-gray-700">{status}</span>
                <span className="text-gray-500">{count} Aset</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className={`${color} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};


const Dashboard: React.FC<DashboardProps> = ({ assets, requests, handovers, dismantles, customers, setActivePage }) => {

    const summaryData = useMemo(() => {
        const inUseCount = assets.filter(a => a.status === AssetStatus.IN_USE).length;
        const pendingRequestCount = requests.filter(r => [ItemStatus.PENDING, ItemStatus.LOGISTIC_APPROVED].includes(r.status)).length;
        const damagedAssetCount = assets.filter(a => a.status === AssetStatus.DAMAGED).length;

        return [
            { title: 'Aset Digunakan', value: inUseCount, icon: WrenchIcon, trend: 5, trendPeriod: 'minggu lalu' },
            { title: 'Aset di Gudang', value: assets.filter(a => a.status === AssetStatus.IN_STORAGE).length, icon: AssetIcon, trend: -2, trendPeriod: 'minggu lalu' },
            { title: 'Perlu Persetujuan', value: pendingRequestCount, icon: RequestIcon, trend: 1, trendPeriod: 'kemarin' },
            { title: 'Aset Rusak', value: damagedAssetCount, icon: DismantleIcon, trend: 0, trendPeriod: 'kemarin' },
        ];
    }, [assets, requests]);
    
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
                onClick: () => setActivePage('request'),
            });
        }
        
        const damagedAssets = assets.filter(a => a.status === AssetStatus.DAMAGED);
        if (damagedAssets.length > 0) {
             tasks.push({
                id: 'task-dmg',
                icon: <WrenchIcon className="w-6 h-6 text-danger-text"/>,
                text: <p><span className="font-bold">{damagedAssets.length} aset</span> dilaporkan rusak dan perlu diperiksa.</p>,
                priority: 'Tinggi' as const,
                onClick: () => setActivePage('registration'),
            });
        }
        
        // Mock data for expiring warranties for demo
        tasks.push({
            id: 'task-warr',
            icon: <CustomerIcon className="w-6 h-6 text-warning-text"/>,
            text: <p><span className="font-bold">3 Aset</span> akan habis masa garansinya bulan ini.</p>,
            priority: 'Sedang' as const,
            onClick: () => setActivePage('registration'),
        });

        return tasks;

    }, [requests, assets, setActivePage]);
    
    const recentActivities = useMemo(() => {
        const activities: { id: string; user: string; action: string; timestamp: string; date: Date; icon: React.ReactNode }[] = [];

        requests.slice(0, 3).forEach(req => {
            activities.push({ id: `req-${req.id}`, user: req.requester, action: `Membuat request baru #${req.id}`, timestamp: req.requestDate, date: new Date(req.requestDate), icon: <RequestIcon /> });
        });

        assets.slice(0, 3).forEach(asset => {
            activities.push({ id: `asset-${asset.id}`, user: 'Sistem', action: `Mencatat aset baru "${asset.name}"`, timestamp: asset.purchaseDate, date: new Date(asset.purchaseDate), icon: <RegisterIcon /> });
        });

        handovers.slice(0, 2).forEach(ho => {
            activities.push({ id: `ho-${ho.id}`, user: ho.menyerahkan, action: `Handover #${ho.id} kepada ${ho.penerima}`, timestamp: ho.handoverDate, date: new Date(ho.handoverDate), icon: <HandoverIcon /> });
        });
        
        dismantles.slice(0, 2).forEach(d => {
            activities.push({ id: `dsm-${d.id}`, user: d.technician, action: `Dismantle #${d.id} dari ${d.customerName}`, timestamp: d.dismantleDate, date: new Date(d.dismantleDate), icon: <DismantleIcon /> });
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
            .slice(0, 7)
            .map(act => ({ ...act, timestamp: formatRelativeTime(act.date) }));
    }, [assets, requests, handovers, dismantles]);


    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-8">
            <h1 className="text-3xl font-bold text-tm-dark">Dashboard</h1>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {summaryData.map(item => <SummaryCard key={item.title} {...item} />)}
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
                        <h2 className="p-6 text-lg font-semibold border-b border-gray-200 text-tm-dark">Riwayat Aktivitas Terbaru</h2>
                        <ul className="divide-y divide-gray-200">
                            {recentActivities.length > 0 ? (
                                recentActivities.map(log => <ActivityItem key={log.id} {...log} />)
                            ) : (
                                <li className="p-4 text-sm text-center text-gray-500">Belum ada aktivitas.</li>
                            )}
                        </ul>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Asset Status */}
                     <div className="bg-white border border-gray-200/80 rounded-xl shadow-md">
                        <h2 className="p-6 text-lg font-semibold border-b border-gray-200 text-tm-dark">Status Aset</h2>
                        <div className="p-6 space-y-4">
                            <AssetStatusBar status={AssetStatus.IN_USE} count={assetStatusDistribution[AssetStatus.IN_USE]} total={assets.length} color="bg-info" />
                            <AssetStatusBar status={AssetStatus.IN_STORAGE} count={assetStatusDistribution[AssetStatus.IN_STORAGE]} total={assets.length} color="bg-tm-secondary" />
                            <AssetStatusBar status={AssetStatus.DAMAGED} count={assetStatusDistribution[AssetStatus.DAMAGED]} total={assets.length} color="bg-warning" />
                            <AssetStatusBar status={AssetStatus.DECOMMISSIONED} count={assetStatusDistribution[AssetStatus.DECOMMISSIONED]} total={assets.length} color="bg-danger" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;