import React, { useMemo, useState, useEffect } from 'react';
import { Asset, AssetStatus, Page } from '../types';
import { useSortableData, SortConfig } from '../hooks/useSortableData';
import { PaginationControls } from './shared/PaginationControls';
import { SearchIcon } from './icons/SearchIcon';
import { InboxIcon } from './icons/InboxIcon';
import { SortIcon } from './icons/SortIcon';
import { SortAscIcon } from './icons/SortAscIcon';
import { SortDescIcon } from './icons/SortDescIcon';
import { BoxIcon } from './icons/BoxIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { AssetIcon } from './icons/AssetIcon';
import { RequestIcon } from './icons/RequestIcon';
import { PreviewData } from './shared/PreviewModal';
import { ClickableLink } from './shared/ClickableLink';

interface StockOverviewProps {
    assets: Asset[];
    setActivePage: (page: Page, filters?: any) => void;
    onShowPreview: (data: PreviewData) => void;
}

interface StockItem {
    name: string;
    category: string;
    brand: string;
    inStorage: number;
    inUse: number;
    damaged: number;
    total: number;
}

const LOW_STOCK_THRESHOLD = 5;

const SummaryCard: React.FC<{ title: string; value: string | number; icon: React.FC<{ className?: string }>; onClick?: () => void; isActive?: boolean }> = ({ title, value, icon: Icon, onClick, isActive = false }) => {
    return (
        <div 
            onClick={onClick} 
            className={`p-5 bg-white border rounded-xl shadow-md transition-all 
                ${onClick ? 'cursor-pointer hover:shadow-lg hover:border-tm-accent/50' : ''}
                ${isActive ? 'border-tm-primary ring-2 ring-tm-accent/50' : 'border-gray-200/80'}
            `}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
                    <p className="mt-1 text-3xl font-bold text-tm-dark truncate" title={typeof value === 'string' ? value : undefined}>{value}</p>
                </div>
                <div className={`flex items-center justify-center flex-shrink-0 w-10 h-10 text-white rounded-full transition-colors ${isActive ? 'bg-tm-accent' : 'bg-tm-primary'}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
        </div>
    );
};

const StockOverview: React.FC<StockOverviewProps> = ({ assets, setActivePage, onShowPreview }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterBrand, setFilterBrand] = useState('');
    const [showLowStockOnly, setShowLowStockOnly] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const aggregatedStock = useMemo<StockItem[]>(() => {
        const stockMap = new Map<string, StockItem>();

        const activeAssets = assets.filter(asset => asset.status !== AssetStatus.DECOMMISSIONED);

        activeAssets.forEach(asset => {
            const key = `${asset.name}|${asset.brand}`;
            if (!stockMap.has(key)) {
                stockMap.set(key, { name: asset.name, category: asset.category, brand: asset.brand, inStorage: 0, inUse: 0, damaged: 0, total: 0 });
            }

            const current = stockMap.get(key)!;
            current.total++;

            switch (asset.status) {
                case AssetStatus.IN_STORAGE: current.inStorage++; break;
                case AssetStatus.IN_USE: current.inUse++; break;
                case AssetStatus.DAMAGED: current.damaged++; break;
                default: break;
            }
        });

        return Array.from(stockMap.values());
    }, [assets]);
    
    const summaryData = useMemo(() => {
        const lowStockItems = aggregatedStock.filter(item => item.inStorage <= LOW_STOCK_THRESHOLD).length;
        const totalInStorage = aggregatedStock.reduce((sum, item) => sum + item.inStorage, 0);
        
        return { totalTypes: aggregatedStock.length, lowStockItems, totalInStorage };
    }, [aggregatedStock]);

    const filterOptions = useMemo(() => {
        const categories = [...new Set(aggregatedStock.map(item => item.category))];
        const brands = [...new Set(aggregatedStock.map(item => item.brand))];
        return { categories, brands };
    }, [aggregatedStock]);

    const filteredStock = useMemo(() => {
        return aggregatedStock
            .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.brand.toLowerCase().includes(searchQuery.toLowerCase()))
            .filter(item => filterCategory ? item.category === filterCategory : true)
            .filter(item => filterBrand ? item.brand === filterBrand : true)
            .filter(item => showLowStockOnly ? item.inStorage <= LOW_STOCK_THRESHOLD : true);
    }, [aggregatedStock, searchQuery, filterCategory, filterBrand, showLowStockOnly]);

    const { items: sortedStock, requestSort, sortConfig } = useSortableData(filteredStock, { key: 'name', direction: 'ascending' });
    
    const totalItems = sortedStock.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedStock = sortedStock.slice(startIndex, endIndex);

    useEffect(() => { setCurrentPage(1); }, [searchQuery, filterCategory, filterBrand, showLowStockOnly, itemsPerPage]);

    const handleShowAssetDetails = (item: StockItem, status: AssetStatus) => {
        const id = `${item.name}|${item.brand}|${status}`;
        onShowPreview({ type: 'stockItemAssets', id });
    };

    return (
        <div className="p-4 space-y-6 sm:p-6 md:p-8">
            <h1 className="text-3xl font-bold text-tm-dark">Ringkasan Stok Barang</h1>
            
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <SummaryCard title="Total Jenis Barang" value={summaryData.totalTypes} icon={BoxIcon} onClick={() => { setSearchQuery(''); setFilterCategory(''); setFilterBrand(''); setShowLowStockOnly(false); }} />
                <SummaryCard 
                    title="Stok Menipis" 
                    value={summaryData.lowStockItems} 
                    icon={ExclamationTriangleIcon} 
                    onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                    isActive={showLowStockOnly}
                />
                <SummaryCard title="Total di Gudang" value={summaryData.totalInStorage.toLocaleString('id-ID')} icon={AssetIcon} />
            </div>

            <div>
                <div className="p-4 mb-4 bg-white border border-gray-200/80 rounded-xl shadow-md">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        <div className="relative sm:col-span-2 md:col-span-3 lg:col-span-4">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <SearchIcon className="w-5 h-5 text-gray-400" />
                            </div>
                            <input type="text" placeholder="Cari nama atau brand barang..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full h-10 py-2 pl-10 pr-4 text-sm placeholder:text-gray-500 text-gray-900 bg-gray-50 border-gray-300 rounded-lg focus:ring-tm-accent focus:border-tm-accent" />
                        </div>
                        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="w-full h-10 px-3 py-2 text-sm text-gray-900 bg-gray-50 border-gray-300 rounded-lg md:col-span-1 focus:ring-tm-accent focus:border-tm-accent">
                            <option value="">Semua Kategori</option>
                            {filterOptions.categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select value={filterBrand} onChange={e => setFilterBrand(e.target.value)} className="w-full h-10 px-3 py-2 text-sm text-gray-900 bg-gray-50 border-gray-300 rounded-lg md:col-span-1 focus:ring-tm-accent focus:border-tm-accent">
                            <option value="">Semua Brand</option>
                            {filterOptions.brands.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                        <div className="flex items-center justify-start h-10 px-3 space-x-2 md:col-span-2 lg:col-span-1">
                            <label htmlFor="low-stock-toggle" className="flex items-center cursor-pointer">
                                <div className="relative">
                                    <input
                                      id="low-stock-toggle"
                                      type="checkbox"
                                      className="sr-only peer"
                                      checked={showLowStockOnly}
                                      onChange={() => setShowLowStockOnly(!showLowStockOnly)}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-tm-primary transition"></div>
                                    <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5"></div>
                                </div>
                                <span className="ml-3 text-sm font-medium text-gray-700">Hanya Stok Menipis</span>
                            </label>
                        </div>
                    </div>
                </div>
                
                {showLowStockOnly && (
                    <div className="flex items-center justify-between p-3 mb-4 -mt-2 text-sm border-l-4 rounded-r-lg bg-warning-light border-warning">
                        <div className="flex items-center">
                            <ExclamationTriangleIcon className="flex-shrink-0 w-5 h-5 mr-2 text-warning-text" />
                            <p className="font-medium text-warning-text">
                                Filter aktif: Menampilkan barang dengan stok &le; {LOW_STOCK_THRESHOLD} unit.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowLowStockOnly(false)}
                            className="px-2 py-1 text-xs font-semibold rounded-md text-warning-text bg-warning/20 hover:bg-warning/30"
                        >
                            Hapus Filter
                        </button>
                    </div>
                )}

                <div className="flex items-center justify-end gap-4 px-4 pt-2 pb-1 text-xs text-gray-600">
                    <span className="font-semibold">Legenda Distribusi:</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-gray-400"></span> Di Gudang</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-info"></span> Digunakan</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-warning"></span> Rusak</span>
                </div>

                <div className="bg-white border border-gray-200/80 rounded-xl shadow-md">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50"><StockTableHeader sortConfig={sortConfig} requestSort={requestSort} /></thead>
                            <tbody className="bg-white divide-y divide-gray-200">{paginatedStock.length > 0 ? paginatedStock.map(item => <StockTableRow key={`${item.name}-${item.brand}`} item={item} onShowDetails={handleShowAssetDetails} onRequestItem={() => setActivePage('request', { prefillItem: { name: item.name, brand: item.brand } })} onShowPreview={onShowPreview} />) : <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-500"><InboxIcon className="w-12 h-12 mx-auto text-gray-400" /><h3 className="mt-2 text-sm font-medium">Tidak ada data stok</h3><p className="mt-1 text-sm">Coba ubah filter atau tambahkan aset baru.</p></td></tr>}</tbody>
                        </table>
                    </div>
                        <PaginationControls currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} onItemsPerPageChange={setItemsPerPage} startIndex={startIndex} endIndex={endIndex} />
                </div>
            </div>
        </div>
    );
};

const StockTableHeader: React.FC<{ sortConfig: SortConfig<StockItem> | null; requestSort: (key: keyof StockItem) => void }> = ({ sortConfig, requestSort }) => (
    <tr>
        <SortableHeader columnKey="name" sortConfig={sortConfig} requestSort={requestSort}>Nama Barang</SortableHeader>
        <SortableHeader columnKey="inStorage" sortConfig={sortConfig} requestSort={requestSort}>Stok Gudang</SortableHeader>
        <SortableHeader columnKey="inUse" sortConfig={sortConfig} requestSort={requestSort}>Digunakan</SortableHeader>
        <SortableHeader columnKey="damaged" sortConfig={sortConfig} requestSort={requestSort}>Rusak</SortableHeader>
        <SortableHeader columnKey="total" sortConfig={sortConfig} requestSort={requestSort}>Total</SortableHeader>
        <th scope="col" className="px-6 py-3 text-sm font-semibold tracking-wider text-left text-gray-500">Distribusi</th>
        <th scope="col" className="px-6 py-3 text-sm font-semibold tracking-wider text-center text-gray-500">Aksi</th>
    </tr>
);

const StockTableRow: React.FC<{ item: StockItem; onShowDetails: (item: StockItem, status: AssetStatus) => void; onRequestItem: () => void; onShowPreview: (data: PreviewData) => void; }> = ({ item, onShowDetails, onRequestItem, onShowPreview }) => {
    const isLowStock = item.inStorage <= LOW_STOCK_THRESHOLD;
    
    const totalForDist = item.inStorage + item.inUse + item.damaged;
    const storagePct = totalForDist > 0 ? (item.inStorage / totalForDist) * 100 : 0;
    const usePct = totalForDist > 0 ? (item.inUse / totalForDist) * 100 : 0;
    const damagedPct = totalForDist > 0 ? (item.damaged / totalForDist) * 100 : 0;

    return (
        <tr className={isLowStock ? 'bg-warning-light/50' : ''}>
            <td className="px-6 py-4 whitespace-nowrap">
                <button onClick={() => onShowPreview({ type: 'stockItemAssets', id: `${item.name}|${item.brand}|ALL` })} className="text-left group">
                    <div className="text-sm font-semibold text-info group-hover:underline group-hover:text-info-text">{item.name}</div>
                    <div className={`text-xs ${isLowStock ? 'text-warning-text' : 'text-gray-500'}`}>{item.brand}</div>
                </button>
            </td>
            <td className="px-6 py-4 text-sm font-bold text-center whitespace-nowrap">
                <button onClick={() => onShowDetails(item, AssetStatus.IN_STORAGE)} className={`hover:underline ${isLowStock ? 'text-danger font-bold' : 'text-tm-primary'}`}>
                    {item.inStorage}
                </button>
            </td>
            <td className="px-6 py-4 text-sm text-center whitespace-nowrap">
                <button onClick={() => onShowDetails(item, AssetStatus.IN_USE)} className="font-semibold text-blue-600 hover:underline">{item.inUse}</button>
            </td>
            <td className="px-6 py-4 text-sm text-center whitespace-nowrap">
                <button onClick={() => onShowDetails(item, AssetStatus.DAMAGED)} className="font-semibold text-blue-600 hover:underline">{item.damaged}</button>
            </td>
            <td className="px-6 py-4 text-sm font-semibold text-center text-gray-900 whitespace-nowrap">{item.total}</td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex w-full h-2.5 rounded-full overflow-hidden bg-gray-200" title={`Gudang: ${item.inStorage}, Digunakan: ${item.inUse}, Rusak: ${item.damaged}`}>
                    <div className="bg-gray-400" style={{ width: `${storagePct}%` }}></div>
                    <div className="bg-info" style={{ width: `${usePct}%` }}></div>
                    <div className="bg-warning" style={{ width: `${damagedPct}%` }}></div>
                </div>
            </td>
            <td className="px-6 py-4 text-center whitespace-nowrap">
                {isLowStock && (
                    <button onClick={onRequestItem} className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-white transition-colors bg-tm-accent rounded-full shadow-sm hover:bg-tm-primary">
                        <RequestIcon className="w-3.5 h-3.5" /> Request
                    </button>
                )}
            </td>
        </tr>
    );
};

const SortableHeader: React.FC<{ children: React.ReactNode; columnKey: keyof StockItem; sortConfig: SortConfig<StockItem> | null; requestSort: (key: keyof StockItem) => void; }> = ({ children, columnKey, sortConfig, requestSort }) => {
    const isSorted = sortConfig?.key === columnKey;
    const direction = isSorted ? sortConfig.direction : undefined;
    const getSortIcon = () => {
        if (!isSorted) return <SortIcon className="w-4 h-4 text-gray-400" />;
        if (direction === 'ascending') return <SortAscIcon className="w-4 h-4 text-tm-accent" />;
        return <SortDescIcon className="w-4 h-4 text-tm-accent" />;
    };
    const isNumeric = ['inStorage', 'inUse', 'damaged', 'total'].includes(columnKey);

    return (
        <th scope="col" className={`px-6 py-3 text-sm font-semibold tracking-wider text-gray-500 ${isNumeric ? 'text-center' : 'text-left'}`}>
            <button onClick={() => requestSort(columnKey)} className={`flex items-center space-x-1 group ${isNumeric ? 'mx-auto' : ''}`}>
                <span>{children}</span>
                <span className="opacity-50 group-hover:opacity-100">{getSortIcon()}</span>
            </button>
        </th>
    );
};

export default StockOverview;