import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Asset, AssetStatus, Page, PreviewData, AssetCategory, AssetType, TrackingMethod } from '../types';
import { useSortableData, SortConfig } from '../hooks/useSortableData';
import { PaginationControls } from './shared/PaginationControls';
import { SearchIcon } from './icons/SearchIcon';
import { InboxIcon } from './icons/InboxIcon';
import { SortIcon } from './icons/SortIcon';
import { SortAscIcon } from './icons/SortAscIcon';
import { SortDescIcon } from './icons/SortDescIcon';
import { AssetIcon } from './icons/AssetIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { RequestIcon } from './icons/RequestIcon';
import { ClickableLink } from './shared/ClickableLink';
import { CustomSelect } from './shared/CustomSelect';
import { CloseIcon } from './icons/CloseIcon';
import { FilterIcon } from './icons/FilterIcon';
import { Checkbox } from './shared/Checkbox';
import { HistoryIcon } from './icons/HistoryIcon';
import { DollarIcon } from './icons/DollarIcon';
import { PencilIcon } from './icons/PencilIcon';
import { CheckIcon } from './icons/CheckIcon';
import { ArchiveBoxIcon } from './icons/ArchiveBoxIcon';
import { UsersIcon } from './icons/UsersIcon';
import { WrenchIcon } from './icons/WrenchIcon';

interface StockOverviewProps {
    assets: Asset[];
    assetCategories: AssetCategory[];
    setActivePage: (page: Page, filters?: any) => void;
    onShowPreview: (data: PreviewData) => void;
    initialFilters?: any;
    onClearInitialFilters: () => void;
}

interface StockItem {
    name: string;
    category: string;
    brand: string;
    inStorage: number;
    inUse: number;
    damaged: number;
    total: number;
    valueInStorage: number;
    unitOfMeasure?: string;
    trackingMethod?: TrackingMethod;
}

const LOW_STOCK_DEFAULT = 5;

const SummaryCard: React.FC<{ title: string; value: string | number; icon: React.FC<{ className?: string }>; onClick?: () => void; isActive?: boolean; tooltipText?: string }> = ({ title, value, icon: Icon, onClick, isActive = false, tooltipText }) => {
    return (
        <div 
            onClick={onClick} 
            className={`p-6 bg-white border rounded-xl shadow-md transition-all duration-300
                ${onClick ? 'cursor-pointer hover:shadow-lg hover:border-tm-accent/50 hover:-translate-y-1' : ''}
                ${isActive ? 'border-tm-primary ring-2 ring-tm-accent/50' : 'border-gray-200/80'}
            `}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium tracking-wide text-gray-500">{title}</h3>
                    <p className="mt-2 text-3xl font-bold text-tm-dark truncate" title={tooltipText || (typeof value === 'string' ? value : undefined)}>{value}</p>
                </div>
                <div className={`flex items-center justify-center flex-shrink-0 w-12 h-12 rounded-lg transition-colors ${isActive ? 'bg-info-light text-info-text' : 'bg-tm-light text-tm-primary'}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    );
};

const SortableHeader: React.FC<{
    children: React.ReactNode;
    columnKey: keyof StockItem;
    sortConfig: SortConfig<StockItem> | null;
    requestSort: (key: keyof StockItem) => void;
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


const StockOverview: React.FC<StockOverviewProps> = ({ assets, assetCategories, setActivePage, onShowPreview, initialFilters, onClearInitialFilters }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [thresholds, setThresholds] = useState<Record<string, number>>({});
    const [editingThresholdKey, setEditingThresholdKey] = useState<string | null>(null);
    const [tempThreshold, setTempThreshold] = useState<string>('');

    const initialFilterState = { category: '', brand: '', lowStockOnly: false };
    const [filters, setFilters] = useState(initialFilterState);
    const [tempFilters, setTempFilters] = useState(filters);
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const filterPanelRef = useRef<HTMLDivElement>(null);

    const handleThresholdChange = (key: string, value: number) => {
        const newThreshold = Math.max(0, value); // Ensure threshold is not negative
        setThresholds(prev => ({ ...prev, [key]: newThreshold }));
    };

    useEffect(() => {
        if (initialFilters) {
            setFilters(prev => ({...prev, ...initialFilters}));
            onClearInitialFilters();
        }
    }, [initialFilters, onClearInitialFilters]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (filterPanelRef.current && !filterPanelRef.current.contains(event.target as Node)) {
                setIsFilterPanelOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => { document.removeEventListener("mousedown", handleClickOutside); };
    }, [filterPanelRef]);

    const activeFilterCount = useMemo(() => {
        return Object.values(filters).filter(value => {
            if (typeof value === 'boolean') return value;
            return !!value;
        }).length;
    }, [filters]);

    const handleApplyFilters = () => {
        setFilters(tempFilters);
        setIsFilterPanelOpen(false);
    };

    const handleResetFilters = () => {
        setFilters(initialFilterState);
        setTempFilters(initialFilterState);
        setIsFilterPanelOpen(false);
    };
    
    const aggregatedStock = useMemo<StockItem[]>(() => {
        const stockMap = new Map<string, StockItem>();

        const activeAssets = assets.filter(asset => asset.status !== AssetStatus.DECOMMISSIONED);

        activeAssets.forEach(asset => {
            const key = `${asset.name}|${asset.brand}`;
            if (!stockMap.has(key)) {
                const category = assetCategories.find(c => c.name === asset.category);
                const type = category?.types.find(t => t.name === asset.type);
                stockMap.set(key, { 
                    name: asset.name, 
                    category: asset.category, 
                    brand: asset.brand, 
                    inStorage: 0, 
                    inUse: 0, 
                    damaged: 0, 
                    total: 0, 
                    valueInStorage: 0,
                    unitOfMeasure: type?.unitOfMeasure || 'unit',
                    trackingMethod: type?.trackingMethod || 'individual'
                });
            }

            const current = stockMap.get(key)!;
            current.total++;

            switch (asset.status) {
                case AssetStatus.IN_STORAGE: 
                    current.inStorage++;
                    if (asset.purchasePrice) {
                        current.valueInStorage += asset.purchasePrice;
                    }
                    break;
                case AssetStatus.IN_USE: current.inUse++; break;
                case AssetStatus.DAMAGED: current.damaged++; break;
                default: break;
            }
        });

        return Array.from(stockMap.values());
    }, [assets, assetCategories]);
    
    const summaryData = useMemo(() => {
        const lowStockItems = aggregatedStock.filter(item => {
            const key = `${item.name}|${item.brand}`;
            const threshold = thresholds[key] ?? LOW_STOCK_DEFAULT;
            return item.inStorage > 0 && item.inStorage <= threshold;
        }).length;
        const outOfStockItems = aggregatedStock.filter(item => item.inStorage === 0).length;
        const totalValueInStorage = aggregatedStock.reduce((sum, item) => sum + item.valueInStorage, 0);
        
        return { 
            totalTypes: aggregatedStock.length, 
            lowStockItems, 
            outOfStockItems, 
            totalValueInStorage,
        };
    }, [aggregatedStock, thresholds]);

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

    const fullStockValue = `Rp ${summaryData.totalValueInStorage.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    const shortStockValue = `Rp ${formatCurrencyShort(summaryData.totalValueInStorage)}`;

    const filterOptions = useMemo(() => {
        const categories = assetCategories.map(c => c.name);
        const brands = [...new Set(aggregatedStock.map(item => item.brand))];
        return { categories, brands };
    }, [aggregatedStock, assetCategories]);
    
    const filteredStock = useMemo(() => {
        return aggregatedStock
            .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.brand.toLowerCase().includes(searchQuery.toLowerCase()))
            .filter(item => filters.category ? item.category === filters.category : true)
            .filter(item => filters.brand ? item.brand === filters.brand : true)
            .filter(item => {
                if (!filters.lowStockOnly) return true;
                const key = `${item.name}|${item.brand}`;
                const threshold = thresholds[key] ?? LOW_STOCK_DEFAULT;
                return item.inStorage > 0 && item.inStorage <= threshold;
            });
    }, [aggregatedStock, searchQuery, filters, thresholds]);

    const { items: sortedStock, requestSort, sortConfig } = useSortableData(filteredStock, { key: 'name', direction: 'ascending' });
    
    const totalItems = sortedStock.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedStock = sortedStock.slice(startIndex, endIndex);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filters, itemsPerPage]);

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-8">
            <h1 className="text-3xl font-bold text-tm-dark">Stok Aset</h1>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <SummaryCard title="Total Tipe Aset" value={summaryData.totalTypes} icon={AssetIcon} />
                <SummaryCard 
                    title="Total Nilai Stok Gudang" 
                    value={shortStockValue}
                    tooltipText={fullStockValue}
                    icon={DollarIcon} 
                />
                <SummaryCard title="Stok Menipis" value={summaryData.lowStockItems} icon={ExclamationTriangleIcon} onClick={() => { 
                    const newFilterState = !filters.lowStockOnly;
                    setFilters(f => ({ ...initialFilterState, lowStockOnly: newFilterState }));
                    setTempFilters(f => ({ ...initialFilterState, lowStockOnly: newFilterState })); 
                }} isActive={filters.lowStockOnly} />
                <SummaryCard title="Stok Habis" value={summaryData.outOfStockItems} icon={InboxIcon} />
            </div>
            
            <div className="p-4 bg-white border border-gray-200/80 rounded-xl shadow-md">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <SearchIcon className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Cari nama atau brand aset..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 py-2 pl-10 pr-10 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-tm-accent focus:border-tm-accent"
                        />
                         {searchQuery && (
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                <button type="button" onClick={() => setSearchQuery('')} className="p-1 text-gray-400 rounded-full hover:bg-gray-200 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-tm-accent" aria-label="Hapus pencarian">
                                    <CloseIcon className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="relative" ref={filterPanelRef}>
                        <button
                            onClick={() => { setTempFilters(filters); setIsFilterPanelOpen(p => !p); }}
                            className="inline-flex items-center justify-center gap-2 w-full h-10 px-4 text-sm font-semibold text-gray-700 transition-all duration-200 bg-white border border-gray-300 rounded-lg shadow-sm sm:w-auto hover:bg-gray-50"
                        >
                            <FilterIcon className="w-4 h-4" /> <span>Filter</span> {activeFilterCount > 0 && <span className="px-2 py-0.5 text-xs font-bold text-white rounded-full bg-tm-primary">{activeFilterCount}</span>}
                        </button>
                        {isFilterPanelOpen && (
                           <>
                                <div onClick={() => setIsFilterPanelOpen(false)} className="fixed inset-0 z-20 bg-black/25 sm:hidden" />
                                <div className="fixed top-32 inset-x-4 z-30 origin-top rounded-xl border border-gray-200 bg-white shadow-lg sm:absolute sm:top-full sm:inset-x-auto sm:right-0 sm:mt-2 sm:w-72">
                                    <div className="flex items-center justify-between p-4 border-b">
                                        <h3 className="text-lg font-semibold text-gray-800">Filter Stok</h3>
                                        <button onClick={() => setIsFilterPanelOpen(false)} className="p-1 text-gray-400 rounded-full hover:bg-gray-100"><CloseIcon className="w-5 h-5"/></button>
                                    </div>
                                    <div className="p-4 space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Kategori</label>
                                            <CustomSelect
                                                options={[{ value: '', label: 'Semua Kategori' }, ...filterOptions.categories.map(c => ({ value: c, label: c }))]}
                                                value={tempFilters.category}
                                                onChange={v => setTempFilters(f => ({...f, category: v}))}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Brand</label>
                                            <CustomSelect
                                                options={[{ value: '', label: 'Semua Brand' }, ...filterOptions.brands.map(b => ({ value: b, label: b }))]}
                                                value={tempFilters.brand}
                                                onChange={v => setTempFilters(f => ({...f, brand: v}))}
                                            />
                                        </div>
                                        <div>
                                            <div className="flex items-center p-2 -m-2 rounded-md hover:bg-gray-50">
                                                <Checkbox
                                                    id="low-stock-filter"
                                                    checked={tempFilters.lowStockOnly}
                                                    onChange={e => setTempFilters(f => ({...f, lowStockOnly: e.target.checked}))}
                                                />
                                                <label htmlFor="low-stock-filter" className="ml-3 text-sm font-medium text-gray-700 cursor-pointer">
                                                    Hanya tampilkan stok menipis
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-gray-50 border-t">
                                        <button onClick={handleResetFilters} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Reset</button>
                                        <button onClick={handleApplyFilters} className="px-4 py-2 text-sm font-semibold text-white bg-tm-primary rounded-lg shadow-sm hover:bg-tm-primary-hover">Terapkan</button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                 {activeFilterCount > 0 && (
                    <div className="pt-4 mt-4 border-t border-gray-200">
                       <p className="text-sm text-gray-600">
                           Menampilkan <span className="font-semibold text-tm-dark">{sortedStock.length}</span> dari <span className="font-semibold text-tm-dark">{aggregatedStock.length}</span> total tipe aset yang cocok.
                       </p>
                    </div>
                )}
            </div>
            
            <div className="overflow-hidden bg-white border border-gray-200/80 rounded-xl shadow-md">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <SortableHeader columnKey="name" sortConfig={sortConfig} requestSort={requestSort}>Nama Aset</SortableHeader>
                                <th scope="col" className="px-6 py-3 text-sm font-semibold tracking-wider text-center text-gray-500">Ambang Batas</th>
                                <th scope="col" className="px-6 py-3 text-sm font-semibold tracking-wider text-center text-gray-500">Di Gudang</th>
                                <SortableHeader columnKey="valueInStorage" sortConfig={sortConfig} requestSort={requestSort} className="text-right">Nilai Stok (Rp)</SortableHeader>
                                <th scope="col" className="px-6 py-3 text-sm font-semibold tracking-wider text-center text-gray-500">Digunakan</th>
                                <th scope="col" className="px-6 py-3 text-sm font-semibold tracking-wider text-center text-gray-500">Rusak</th>
                                <th scope="col" className="px-6 py-3 text-sm font-semibold tracking-wider text-center text-gray-500">Total</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedStock.length > 0 ? (
                                paginatedStock.map(item => {
                                    const key = `${item.name}|${item.brand}`;
                                    const threshold = thresholds[key] ?? LOW_STOCK_DEFAULT;
                                    const isOutOfStock = item.inStorage === 0;
                                    const isLowStock = !isOutOfStock && item.inStorage <= threshold;
                                    
                                    const storagePercentage = item.total > 0 ? (item.inStorage / item.total) * 100 : 0;
                                    const barColorClass = isOutOfStock ? 'bg-danger/80' : isLowStock ? 'bg-warning/80' : 'bg-success/80';
                                    
                                    const rowClass = isOutOfStock ? 'bg-red-50/50' : isLowStock ? 'bg-amber-50/50' : '';

                                    return (
                                        <tr key={key} className={`${rowClass} hover:bg-gray-50 transition-colors`}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <a
                                                        href="#"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setActivePage('registration', { name: item.name, brand: item.brand });
                                                        }}
                                                        className="text-sm font-semibold text-gray-900 hover:text-tm-primary hover:underline"
                                                    >
                                                        {item.name}
                                                    </a>
                                                    {item.trackingMethod === 'bulk' ? (
                                                        <span className="px-2 py-0.5 text-xs font-semibold text-purple-800 bg-purple-100 rounded-full">Bulk</span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 text-xs font-semibold text-gray-700 bg-gray-100 rounded-full">Individual</span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500">{item.brand} &bull; {item.category}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-center whitespace-nowrap">
                                                {editingThresholdKey === key ? (
                                                    <div className="flex items-center justify-center gap-1">
                                                        <input
                                                            type="number"
                                                            value={tempThreshold}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                if (value === '') {
                                                                    setTempThreshold('');
                                                                    return;
                                                                }
                                                                const numValue = parseInt(value, 10);
                                                                if (!isNaN(numValue) && numValue >= 0) {
                                                                    setTempThreshold(String(numValue));
                                                                }
                                                            }}
                                                            autoFocus
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    const finalValue = parseInt(tempThreshold, 10) || 0;
                                                                    handleThresholdChange(key, finalValue);
                                                                    setEditingThresholdKey(null);
                                                                } else if (e.key === 'Escape') {
                                                                    setEditingThresholdKey(null);
                                                                }
                                                            }}
                                                            className="w-16 h-8 text-sm font-semibold text-center text-gray-900 bg-white border border-tm-primary rounded-md shadow-sm outline-none ring-2 ring-tm-accent"
                                                        />
                                                        <button 
                                                            onClick={() => {
                                                                const finalValue = parseInt(tempThreshold, 10) || 0;
                                                                handleThresholdChange(key, finalValue);
                                                                setEditingThresholdKey(null);
                                                            }}
                                                            className="p-1.5 text-success-text bg-success-light rounded-md hover:bg-green-200"
                                                        >
                                                            <CheckIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div 
                                                        onClick={() => {
                                                            setTempThreshold(String(threshold));
                                                            setEditingThresholdKey(key);
                                                        }}
                                                        className="group relative flex items-center justify-center w-16 h-8 px-2 py-1 mx-auto font-semibold text-gray-800 transition-colors rounded-md cursor-pointer hover:bg-gray-200"
                                                    >
                                                        <span>{threshold}</span>
                                                        <PencilIcon className="absolute w-3 h-3 text-gray-500 transition-opacity opacity-0 right-1 group-hover:opacity-100" />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-center whitespace-nowrap">
                                                <ClickableLink 
                                                    onClick={() => onShowPreview({ type: 'stockItemAssets', id: `${item.name}|${item.brand}|${AssetStatus.IN_STORAGE}` })}
                                                    className="flex flex-col items-center justify-center gap-1.5 !text-gray-800"
                                                >
                                                    <div className={`flex items-center gap-2 font-bold ${isOutOfStock ? 'text-danger-text' : isLowStock ? 'text-warning-text' : 'text-success-text'}`}>
                                                        <ArchiveBoxIcon className="w-4 h-4"/>
                                                        <span>{item.inStorage}</span>
                                                        <span className="text-xs font-normal text-gray-500">{item.unitOfMeasure}</span>
                                                    </div>
                                                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden" title={`${storagePercentage.toFixed(0)}% dari total`}>
                                                        <div className={`h-full rounded-full ${barColorClass}`} style={{ width: `${storagePercentage}%` }}></div>
                                                    </div>
                                                </ClickableLink>
                                            </td>
                                             <td className="px-6 py-4 text-sm font-medium text-right text-gray-800 whitespace-nowrap">
                                                {item.valueInStorage.toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-center text-gray-800 whitespace-nowrap">
                                                <ClickableLink
                                                    onClick={() => onShowPreview({ type: 'stockItemAssets', id: `${item.name}|${item.brand}|${AssetStatus.IN_USE}` })}
                                                    className="flex items-center justify-center gap-2 !text-gray-800"
                                                >
                                                    <UsersIcon className="w-4 h-4"/>
                                                    <span>{item.inUse} <span className="text-xs font-normal text-gray-500">{item.unitOfMeasure}</span></span>
                                                </ClickableLink>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-center text-gray-800 whitespace-nowrap">
                                                <ClickableLink
                                                    onClick={() => onShowPreview({ type: 'stockItemAssets', id: `${item.name}|${item.brand}|${AssetStatus.DAMAGED}` })}
                                                    className="flex items-center justify-center gap-2 !text-gray-800"
                                                >
                                                    <WrenchIcon className="w-4 h-4"/>
                                                    <span>{item.damaged} <span className="text-xs font-normal text-gray-500">{item.unitOfMeasure}</span></span>
                                                </ClickableLink>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-center text-gray-900 whitespace-nowrap">
                                                 <ClickableLink onClick={() => onShowPreview({ type: 'stockItemAssets', id: `${item.name}|${item.brand}|ALL` })} className="!text-gray-900">
                                                    {item.total} <span className="text-xs font-normal text-gray-500">{item.unitOfMeasure}</span>
                                                </ClickableLink>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button 
                                                        onClick={() => onShowPreview({ type: 'stockHistory', id: `${item.name}|${item.brand}` })}
                                                        className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors bg-gray-100 rounded-md shadow-sm hover:bg-gray-200"
                                                    >
                                                        <HistoryIcon className="w-4 h-4" />
                                                        Riwayat
                                                    </button>
                                                    <button 
                                                        onClick={() => setActivePage('request', { prefillItem: { name: item.name, brand: item.brand } })}
                                                        className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white rounded-md shadow-sm transition-colors
                                                            ${isOutOfStock || isLowStock ? 'bg-amber-500 hover:bg-amber-600' : 'bg-tm-accent hover:bg-tm-primary'}`
                                                        }
                                                    >
                                                        <RequestIcon className="w-4 h-4" />
                                                        Request
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center">
                                            <InboxIcon className="w-12 h-12 text-gray-400" />
                                            <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak Ada Data Stok</h3>
                                            <p className="mt-1 text-sm text-gray-500">Ubah filter atau catat aset baru untuk memulai.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={(size) => { setItemsPerPage(size); setCurrentPage(1); }}
                    startIndex={startIndex}
                    endIndex={endIndex}
                />
            </div>
        </div>
    );
};

export default StockOverview;
