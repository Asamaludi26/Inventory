import React, { useState, useEffect } from 'react';
import { useActionableItems, ActionableItem } from '../../../hooks/useActionableItems';
import { User, Request, Asset, Page, PreviewData } from '../../../types';
import { WrenchIcon } from '../../../components/icons/WrenchIcon';
import { RequestIcon } from '../../../components/icons/RequestIcon';
import { RegisterIcon } from '../../../components/icons/RegisterIcon';
import { InboxIcon } from '../../../components/icons/InboxIcon';
import { FireIcon } from '../../../components/icons/FireIcon';
import { MegaphoneIcon } from '../../../components/icons/MegaphoneIcon';
import { ChevronDownIcon } from '../../../components/icons/ChevronDownIcon';

interface ActionableItemsListProps {
  currentUser: User;
  requests: Request[];
  assets: Asset[];
  setActivePage: (page: Page, filters?: any) => void;
  onShowPreview: (data: PreviewData) => void;
}

const formatRelativeTime = (isoDate: string) => {
    const date = new Date(isoDate);
    const now = new Date();
    const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);
    if (diffSeconds < 60) return `${diffSeconds}d lalu`;
    const diffMinutes = Math.round(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m lalu`;
    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}j lalu`;
    return `${Math.round(diffHours / 24)}h lalu`;
};


const ActionItemCard: React.FC<{ item: ActionableItem, onClick: () => void }> = ({ item, onClick }) => {
    const getIcon = () => {
        switch(item.type) {
            case 'request': return <RequestIcon className="w-5 h-5 text-amber-600" />;
            case 'asset_registration': return <RegisterIcon className="w-5 h-5 text-green-600" />;
            case 'asset_damage': return <WrenchIcon className="w-5 h-5 text-red-600" />;
            default: return null;
        }
    };

    return (
        <div 
            onClick={onClick}
            className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-tm-primary transition-all duration-200 cursor-pointer"
        >
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">{getIcon()}</div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-800 truncate" title={item.title}>{item.title}</p>
                        <time className="flex-shrink-0 ml-4 text-xs text-gray-400">{formatRelativeTime(item.timestamp)}</time>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Oleh: <span className="font-medium text-gray-700">{item.requester}</span> {item.division && `(${item.division})`}
                    </p>
                    {item.priorityLabel && (
                        <div className={`mt-2 flex items-center gap-1.5 px-2 py-0.5 text-xs font-bold rounded-full w-fit
                            ${item.priority === 'high' ? 'bg-purple-100 text-purple-700' :
                              item.priority === 'urgent' ? 'bg-red-100 text-red-700' : ''}`
                        }>
                            {item.priority === 'high' ? <MegaphoneIcon className="w-3 h-3" /> : <FireIcon className="w-3 h-3" />}
                            {item.priorityLabel}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const INITIAL_ITEM_LIMIT = 5;

export const ActionableItemsList: React.FC<ActionableItemsListProps> = ({ currentUser, requests, assets, setActivePage, onShowPreview }) => {
    const allActionableItems = useActionableItems(currentUser, requests, assets);
    
    const [activeTab, setActiveTab] = useState<'all' | 'request' | 'asset_registration' | 'asset_damage'>('all');
    const [isExpanded, setIsExpanded] = useState(false);

    const filteredItems = allActionableItems.filter(item => activeTab === 'all' || item.type === activeTab);

    // Reset expansion when tab changes
    useEffect(() => {
        setIsExpanded(false);
    }, [activeTab]);

    const itemsToDisplay = isExpanded ? filteredItems : filteredItems.slice(0, INITIAL_ITEM_LIMIT);
    const remainingItemsCount = filteredItems.length - INITIAL_ITEM_LIMIT;

    const handleItemClick = (item: ActionableItem) => {
        switch(item.type) {
            case 'request':
                setActivePage('request', { openDetailForId: item.id });
                break;
            case 'asset_registration':
                setActivePage('request', { openDetailForId: item.id });
                break;
            case 'asset_damage':
                onShowPreview({ type: 'asset', id: item.id });
                break;
        }
    }
    
    const tabs = [
        { id: 'all', label: 'Semua', count: allActionableItems.length },
        { id: 'request', label: 'Persetujuan', count: allActionableItems.filter(i => i.type === 'request').length },
        { id: 'asset_registration', label: 'Registrasi', count: allActionableItems.filter(i => i.type === 'asset_registration').length },
        { id: 'asset_damage', label: 'Perbaikan', count: allActionableItems.filter(i => i.type === 'asset_damage').length },
    ].filter(tab => tab.count > 0);

    return (
        <div className="bg-white border border-gray-200/80 rounded-xl shadow-md">
            <div className="flex items-center justify-between p-6 border-b">
                <div>
                    <h2 className="text-lg font-semibold text-tm-dark">Inbox Tugas</h2>
                    <p className="text-sm text-gray-500">{allActionableItems.length} item menunggu aksi Anda</p>
                </div>
            </div>
            {tabs.length > 1 && (
                <div className="px-6 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm
                                    ${activeTab === tab.id ? 'border-tm-primary text-tm-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`
                                }
                            >
                                {tab.label} <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === tab.id ? 'bg-tm-primary text-white' : 'bg-gray-100 text-gray-600'}`}>{tab.count}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            )}
             <div className="p-6 bg-gray-50/50">
                 {filteredItems.length > 0 ? (
                    <>
                        <div className="space-y-3">
                            {itemsToDisplay.map(item => (
                                <ActionItemCard key={`${item.type}-${item.id}`} item={item} onClick={() => handleItemClick(item)} />
                            ))}
                        </div>

                        {filteredItems.length > INITIAL_ITEM_LIMIT && (
                            <div className="mt-4 text-center">
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-tm-primary bg-blue-100 rounded-full hover:bg-blue-200 transition-colors"
                                >
                                    <span>{isExpanded ? 'Tampilkan lebih sedikit' : `Tampilkan semua (${remainingItemsCount} lainnya)`}</span>
                                    <ChevronDownIcon className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-12">
                        <InboxIcon className="w-16 h-16 mx-auto text-gray-300" />
                        <h3 className="mt-4 text-lg font-semibold text-gray-800">Semua Tugas Selesai!</h3>
                        <p className="mt-1 text-sm text-gray-500">Tidak ada item yang memerlukan tindakan Anda saat ini.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
