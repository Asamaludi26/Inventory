import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Dismantle, ItemStatus, Asset, AssetStatus, AssetCondition, Customer } from '../types';
import Modal from './shared/Modal';
import { EyeIcon } from './icons/EyeIcon';
import { TrashIcon } from './icons/TrashIcon';
import { useNotification } from './shared/Notification';
import { InboxIcon } from './icons/InboxIcon';
import { useSortableData, SortConfig } from '../hooks/useSortableData';
import { SortAscIcon } from './icons/SortAscIcon';
import { SortDescIcon } from './icons/SortDescIcon';
import { SortIcon } from './icons/SortIcon';
import { exportToCSV } from '../utils/csvExporter';
import { ExportIcon } from './icons/ExportIcon';
import { useLongPress } from '../hooks/useLongPress';
import { Checkbox } from './shared/Checkbox';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { SearchIcon } from './icons/SearchIcon';
import { CloseIcon } from './icons/CloseIcon';
import { PaginationControls } from './shared/PaginationControls';
import DatePicker from './shared/DatePicker';
import { SignatureStamp } from './shared/SignatureStamp';
import { ApprovalStamp } from './shared/ApprovalStamp';
import FloatingActionBar from './shared/FloatingActionBar';


interface ItemDismantleProps {
    dismantles: Dismantle[];
    setDismantles: React.Dispatch<React.SetStateAction<Dismantle[]>>;
    assets: Asset[];
    customers: Customer[];
    prefillData?: Asset | null;
    onClearPrefill: () => void;
    onUpdateAsset: (assetId: string, updates: Partial<Asset>) => void;
}

export const mockDismantles: Dismantle[] = Array.from({ length: 50 }, (_, i) => {
    const technicianPool = ['Alice Johnson', 'Jack Taylor', 'Charlie Brown', 'Bob Williams', 'Henry Wilson', 'Fajar Nugroho'];
    const customerPool = [
        { name: 'PT. Maju Mundur Sejahtera', id: 'TMI-01002', address: 'Jl. Sudirman No. 123, Jakarta Selatan' },
        { name: 'Warung Kopi Bahagia', id: 'TMI-01004', address: 'Jl. Gatot Subroto No. 45, Jakarta Pusat' },
        { name: 'CV. Terang Benderang', id: 'TMI-01008', address: 'Jl. Pahlawan No. 8, Bandung' },
        { name: 'Sekolah Harapan Bangsa', id: 'TMI-01013', address: 'Jl. Pendidikan No. 1, Surabaya' },
        { name: 'Klinik Medika Utama', id: 'TMI-01021', address: 'Jl. Kesehatan No. 15, Yogyakarta' },
    ];
    const assetPool = [
        { id: 'AST-0114', name: 'PC Rakitan i7' },
        { id: 'AST-0112', name: 'LAN Tester NF-8209' },
        { id: 'AST-0005', name: 'ONT HG8245H' },
        { id: 'AST-0050', name: 'Server Dell PowerEdge R740' },
        { id: 'AST-0075', name: 'Monitor LG 27UK850-W' },
        { id: 'AST-0006', name: 'Router WiFi Archer C6' },
    ];
    const asset = assetPool[i % assetPool.length];
    const customer = customerPool[i % customerPool.length];
    
    return {
        id: `DSM-${String(50 - i).padStart(3, '0')}`,
        assetId: asset.id,
        assetName: asset.name,
        dismantleDate: new Date(2024, 7, 5 - (i % 28)).toISOString().split('T')[0],
        technician: technicianPool[i % technicianPool.length],
        customerName: customer.name,
        customerId: customer.id,
        customerAddress: customer.address,
        retrievedCondition: [AssetCondition.GOOD, AssetCondition.MINOR_DAMAGE, AssetCondition.USED_OKAY, AssetCondition.MAJOR_DAMAGE][i % 4],
        acknowledger: (i % 3 === 0) ? 'Budi Santoso' : null,
        status: (i % 3 === 0) ? ItemStatus.COMPLETED : ItemStatus.IN_PROGRESS
    };
});


const getStatusClass = (status: ItemStatus) => {
    switch (status) {
        case ItemStatus.COMPLETED: return 'bg-success-light text-success-text';
        case ItemStatus.IN_PROGRESS: return 'bg-info-light text-info-text';
        case ItemStatus.PENDING: return 'bg-warning-light text-warning-text';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const SortableHeader: React.FC<{
    children: React.ReactNode;
    columnKey: keyof Dismantle;
    sortConfig: SortConfig<Dismantle> | null;
    requestSort: (key: keyof Dismantle) => void;
}> = ({ children, columnKey, sortConfig, requestSort }) => {
    const isSorted = sortConfig?.key === columnKey;
    const direction = isSorted ? sortConfig.direction : undefined;

    const getSortIcon = () => {
        if (!isSorted) return <SortIcon className="w-4 h-4 text-gray-400" />;
        if (direction === 'ascending') return <SortAscIcon className="w-4 h-4 text-tm-accent" />;
        return <SortDescIcon className="w-4 h-4 text-tm-accent" />;
    };

    return (
        <th scope="col" className="px-6 py-3 text-sm font-semibold tracking-wider text-left text-gray-500">
            <button onClick={() => requestSort(columnKey)} className="flex items-center space-x-1 group">
                <span>{children}</span>
                <span className="opacity-50 group-hover:opacity-100">{getSortIcon()}</span>
            </button>
        </th>
    );
};

interface DismantleTableProps {
    dismantles: Dismantle[];
    onDetailClick: (dismantle: Dismantle) => void;
    onDeleteClick: (id: string) => void;
    sortConfig: SortConfig<Dismantle> | null;
    requestSort: (key: keyof Dismantle) => void;
    selectedDismantleIds: string[];
    onSelectOne: (id: string) => void;
    onSelectAll: (event: React.ChangeEvent<HTMLInputElement>) => void;
    isBulkSelectMode: boolean;
    onEnterBulkMode: () => void;
}

const DismantleTable: React.FC<DismantleTableProps> = ({ dismantles, onDetailClick, onDeleteClick, sortConfig, requestSort, selectedDismantleIds, onSelectOne, onSelectAll, isBulkSelectMode, onEnterBulkMode }) => {
    const longPressHandlers = useLongPress(onEnterBulkMode, 500);

    const handleRowClick = (d: Dismantle) => {
        if (isBulkSelectMode) {
            onSelectOne(d.id);
        } else {
            onDetailClick(d);
        }
    };
    
    return (
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="sticky top-0 z-10 bg-gray-50">
                <tr>
                     {isBulkSelectMode && (
                        <th scope="col" className="px-6 py-3">
                            <Checkbox
                                checked={selectedDismantleIds.length === dismantles.length && dismantles.length > 0}
                                onChange={onSelectAll}
                                aria-label="Pilih semua data dismantle"
                            />
                        </th>
                    )}
                    <SortableHeader columnKey="id" sortConfig={sortConfig} requestSort={requestSort}>ID / Tanggal</SortableHeader>
                    <SortableHeader columnKey="assetName" sortConfig={sortConfig} requestSort={requestSort}>Aset yang di-Dismantle</SortableHeader>
                    <SortableHeader columnKey="technician" sortConfig={sortConfig} requestSort={requestSort}>Teknisi / Pelanggan</SortableHeader>
                    <SortableHeader columnKey="status" sortConfig={sortConfig} requestSort={requestSort}>Status</SortableHeader>
                    <th className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {dismantles.length > 0 ? (
                    dismantles.map((d) => (
                        <tr 
                            key={d.id}
                            {...longPressHandlers}
                            onClick={() => handleRowClick(d)}
                            className={`transition-colors cursor-pointer ${selectedDismantleIds.includes(d.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                        >
                            {isBulkSelectMode && (
                                <td className="px-6 py-4 align-top" onClick={(e) => e.stopPropagation()}>
                                    <Checkbox
                                        checked={selectedDismantleIds.includes(d.id)}
                                        onChange={() => onSelectOne(d.id)}
                                        aria-labelledby={`dismantle-id-${d.id}`}
                                    />
                                </td>
                            )}
                            <td id={`dismantle-id-${d.id}`} className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-semibold text-gray-900">{d.id}</div>
                                <div className="text-xs text-gray-500">{d.dismantleDate}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{d.assetName}</div>
                                <div className="text-xs text-gray-500 font-mono">{d.assetId}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                 <div className="text-sm font-medium text-gray-900">{d.technician}</div>
                                <div className="text-xs text-gray-500">dari {d.customerName}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(d.status)}`}>
                                    {d.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                                <div className="flex items-center justify-end space-x-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDetailClick(d); }}
                                        className="flex items-center justify-center w-8 h-8 text-gray-500 transition-colors bg-gray-100 rounded-full hover:bg-info-light hover:text-info-text" title="Lihat Detail"
                                    >
                                      <EyeIcon className="w-5 h-5"/>
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); onDeleteClick(d.id); }} className="flex items-center justify-center w-8 h-8 text-gray-500 transition-colors bg-gray-100 rounded-full hover:bg-danger-light hover:text-danger-text" title="Hapus">
                                      <TrashIcon className="w-5 h-5"/>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={isBulkSelectMode ? 6 : 5} className="px-6 py-12 text-center text-gray-500">
                            <div className="flex flex-col items-center">
                                <InboxIcon className="w-12 h-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak Ada Data Dismantle</h3>
                                <p className="mt-1 text-sm text-gray-500">Buat form dismantle baru untuk memulai.</p>
                            </div>
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    );
};

const DismantleForm: React.FC<{ 
    onSave: (data: Omit<Dismantle, 'id' | 'status' | 'acknowledger'>) => void;
    assets: Asset[];
    customers: Customer[];
    prefillData?: Asset | null;
}> = ({ onSave, assets, customers, prefillData }) => {
    const [assetId, setAssetId] = useState('');
    const [technician, setTechnician] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [customerId, setCustomerId] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [retrievedCondition, setRetrievedCondition] = useState<AssetCondition>(AssetCondition.USED_OKAY);
    const [dismantleDate, setDismantleDate] = useState<Date | null>(new Date());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const addNotification = useNotification();
    const [isFooterVisible, setIsFooterVisible] = useState(true);
    const footerRef = useRef<HTMLDivElement>(null);
    const formId = "dismantle-form";

    const customersWithAssets = useMemo(() => {
        const customerIdsInUse = new Set(assets.filter(a => a.status === AssetStatus.IN_USE && a.currentUser?.startsWith('TMI-')).map(a => a.currentUser));
        return customers.filter(c => customerIdsInUse.has(c.id));
    }, [assets, customers]);
    
    const availableAssetsForCustomer = useMemo(() => {
        if (!customerId) return [];
        return assets.filter(a => a.status === AssetStatus.IN_USE && a.currentUser === customerId);
    }, [assets, customerId]);
    
    useEffect(() => {
        if(prefillData && prefillData.currentUser) {
            setCustomerId(prefillData.currentUser);
            setAssetId(prefillData.id);
        }
    }, [prefillData]);
    
    useEffect(() => {
        const customer = customers.find(c => c.id === customerId);
        if (customer) {
            setCustomerName(customer.name);
            setCustomerAddress(customer.address);
            
            const assetsForCustomer = assets.filter(a => a.status === AssetStatus.IN_USE && a.currentUser === customerId);
            
            if (assetsForCustomer.length === 1) {
                setAssetId(assetsForCustomer[0].id);
            } else if (!prefillData || customerId !== prefillData.currentUser) {
                setAssetId('');
            }
        } else {
            setCustomerName('');
            setCustomerAddress('');
            setAssetId('');
        }
    }, [customerId, customers, assets, prefillData]);

     useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => setIsFooterVisible(entry.isIntersecting), { threshold: 0.1 });
        const currentRef = footerRef.current;
        if (currentRef) observer.observe(currentRef);
        return () => { if (currentRef) observer.unobserve(currentRef); };
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!assetId || !technician || !customerId || !dismantleDate) {
            addNotification('Harap lengkapi semua field yang wajib diisi.', 'error');
            return;
        }
        setIsSubmitting(true);
        const asset = assets.find(a => a.id === assetId);
        setTimeout(() => {
             onSave({
                assetId,
                assetName: asset?.name || 'Aset Tidak Ditemukan',
                technician,
                customerName,
                customerId,
                customerAddress,
                retrievedCondition,
                dismantleDate: dismantleDate.toISOString().split('T')[0],
            });
            setIsSubmitting(false);
        }, 1000);
    };

    const ActionButtons: React.FC<{ formId: string }> = ({ formId }) => (
         <button 
            type="submit" 
            form={formId}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 rounded-lg shadow-sm bg-tm-primary hover:bg-tm-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tm-accent disabled:bg-tm-primary/70 disabled:cursor-not-allowed">
             {isSubmitting ? <SpinnerIcon className="w-5 h-5 mr-2" /> : null}
            {isSubmitting ? 'Memproses...' : 'Simpan Form Dismantle'}
        </button>
    );

    return (
        <>
            <form id={formId} className="space-y-6" onSubmit={handleSubmit}>
                {prefillData && (
                    <div className="p-4 border-l-4 rounded-r-lg bg-info-light border-tm-primary">
                        <p className="text-sm text-info-text">
                            Membuat form dismantle untuk aset: <span className="font-bold">{prefillData.name} ({prefillData.id})</span> dari pelanggan <span className="font-bold">{prefillData.currentUser}</span>.
                        </p>
                    </div>
                )}
                <div className="mb-6 space-y-2 text-center">
                    <h4 className="text-xl font-bold text-tm-dark">TRINITY MEDIA INDONESIA</h4>
                    <p className="font-semibold text-tm-secondary">FORMULIR DISMANTLE PERANGKAT</p>
                </div>
                
                <div className="p-4 border-t border-b border-gray-200">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <label htmlFor="docNumber" className="block text-sm font-medium text-gray-700">No Dokumen</label>
                            <input type="text" id="docNumber" readOnly className="block w-full px-3 py-2 mt-1 text-gray-700 bg-gray-100 border border-gray-200 rounded-md shadow-sm sm:text-sm" value="[Otomatis]" />
                        </div>
                        <div>
                            <label htmlFor="dismantleDate" className="block text-sm font-medium text-gray-700">Tanggal Dismantle</label>
                             <div className="mt-1">
                                <DatePicker 
                                    id="dismantleDate"
                                    selectedDate={dismantleDate}
                                    onDateChange={setDismantleDate}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-tm-dark">Informasi Pelanggan & Teknisi</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                         <div>
                            <label htmlFor="customerId" className="block text-sm font-medium text-gray-700">ID Pelanggan</label>
                            <select
                                id="customerId"
                                value={customerId}
                                onChange={e => setCustomerId(e.target.value)}
                                disabled={!!prefillData}
                                required
                                className="block w-full px-3 py-2 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-md shadow-sm sm:text-sm disabled:bg-gray-200"
                            >
                                <option value="">-- Pilih Pelanggan --</option>
                                {customersWithAssets.map(c => (
                                    <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">Nama Pelanggan</label>
                            <input type="text" id="customerName" value={customerName} readOnly className="block w-full px-3 py-2 mt-1 text-gray-700 bg-gray-100 border border-gray-200 rounded-md shadow-sm sm:text-sm" />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="customerAddress" className="block text-sm font-medium text-gray-700">Alamat Pelanggan</label>
                        <textarea id="customerAddress" rows={2} value={customerAddress} readOnly className="block w-full px-3 py-2 mt-1 text-gray-700 bg-gray-100 border border-gray-200 rounded-md shadow-sm sm:text-sm"></textarea>
                    </div>
                     <div>
                        <label htmlFor="technician" className="block text-sm font-medium text-gray-700">Teknisi Bertugas</label>
                        <input type="text" id="technician" value={technician} onChange={e => setTechnician(e.target.value)} required className="block w-full px-3 py-2 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-md shadow-sm sm:text-sm" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-tm-dark">Detail Aset yang di-Dismantle</h3>
                     <div>
                        <label htmlFor="assetId" className="block text-sm font-medium text-gray-700">Aset</label>
                         <select 
                            id="assetId" 
                            value={assetId}
                            onChange={e => setAssetId(e.target.value)}
                            required
                            disabled={!customerId || !!prefillData || availableAssetsForCustomer.length === 1}
                            className="block w-full px-3 py-2 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-md shadow-sm disabled:bg-gray-200"
                        >
                            <option value="">{customerId ? '-- Pilih Aset --' : 'Pilih pelanggan dahulu'}</option>
                            {availableAssetsForCustomer.map(asset => (
                                <option key={asset.id} value={asset.id}>
                                    {asset.name} (SN: {asset.serialNumber})
                                </option>
                            ))}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="retrievedCondition" className="block text-sm font-medium text-gray-700">Kondisi Aset Saat Diterima</label>
                        <select id="retrievedCondition" value={retrievedCondition} onChange={e => setRetrievedCondition(e.target.value as AssetCondition)} required className="block w-full px-3 py-2 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-md shadow-sm sm:text-sm">
                            {Object.values(AssetCondition).map(c => <option key={c}>{c}</option>)}
                        </select>
                    </div>
                </div>

                <div className="pt-8 mt-6 border-t border-gray-200">
                    <div className="grid grid-cols-1 text-center gap-y-8 md:grid-cols-2 md:gap-x-8">
                        <div>
                            <p className="font-medium text-gray-700">Teknisi</p>
                            <div className="flex items-center justify-center mt-2 h-28">
                                {technician && <SignatureStamp signerName={technician} signatureDate={dismantleDate?.toISOString() || ''} signerDivision="Divisi Engineer" />}
                            </div>
                            <p className="pt-1 mt-2 text-sm text-gray-600 border-t border-gray-400">( {technician || 'Nama Jelas'} )</p>
                        </div>
                        <div>
                            <p className="font-medium text-gray-700">Mengetahui</p>
                            <div className="flex items-center justify-center mt-2 h-28">
                                <span className="text-sm italic text-gray-300">Menunggu Verifikasi Gudang</span>
                            </div>
                            <p className="pt-1 mt-2 text-sm text-gray-600 border-t border-gray-400">( Nama Jelas )</p>
                        </div>
                    </div>
                </div>
                
                <div ref={footerRef} className="flex justify-end pt-4 mt-4 border-t border-gray-200">
                    <ActionButtons formId={formId} />
                </div>
            </form>
             <FloatingActionBar isVisible={!isFooterVisible}>
                <ActionButtons formId={formId} />
            </FloatingActionBar>
        </>
    );
};


export const ItemDismantle: React.FC<ItemDismantleProps> = ({ dismantles, setDismantles, assets, customers, prefillData, onClearPrefill, onUpdateAsset }) => {
    const [view, setView] = useState<'list' | 'form'>('list');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDismantle, setSelectedDismantle] = useState<Dismantle | null>(null);
    const [dismantleToDeleteId, setDismantleToDeleteId] = useState<string | null>(null);
    const [bulkDeleteConfirmation, setBulkDeleteConfirmation] = useState(false);
    const [bulkCompleteConfirmation, setBulkCompleteConfirmation] = useState(false);
    const [isBulkSelectMode, setIsBulkSelectMode] = useState(false);
    const [selectedDismantleIds, setSelectedDismantleIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const addNotification = useNotification();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        if (prefillData) {
            setView('form');
        }
    }, [prefillData]);
    
    const handleSetView = (newView: 'list' | 'form') => {
        if (newView === 'list' && prefillData) {
            onClearPrefill();
        }
        setView(newView);
    }

    const isFiltering = useMemo(() => {
        return searchQuery.trim() !== '' || filterStatus !== '';
    }, [searchQuery, filterStatus]);

    const handleResetFilters = () => {
        setSearchQuery('');
        setFilterStatus('');
    };

    const filteredDismantles = useMemo(() => {
        return dismantles
            .filter(d => {
                const searchLower = searchQuery.toLowerCase();
                return (
                    d.id.toLowerCase().includes(searchLower) ||
                    d.assetName.toLowerCase().includes(searchLower) ||
                    d.technician.toLowerCase().includes(searchLower) ||
                    d.customerName.toLowerCase().includes(searchLower)
                );
            })
            .filter(d => filterStatus ? d.status === filterStatus : true);
    }, [dismantles, searchQuery, filterStatus]);

    const { items: sortedDismantles, requestSort, sortConfig } = useSortableData(filteredDismantles, { key: 'dismantleDate', direction: 'descending' });

    const totalItems = sortedDismantles.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedDismantles = sortedDismantles.slice(startIndex, endIndex);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterStatus, itemsPerPage]);

    const handleItemsPerPageChange = (newSize: number) => {
        setItemsPerPage(newSize);
        setCurrentPage(1);
    };

    const handleCancelBulkMode = () => {
        setIsBulkSelectMode(false);
        setSelectedDismantleIds([]);
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                handleCancelBulkMode();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleSelectOne = (id: string) => {
        setSelectedDismantleIds(prev =>
            prev.includes(id) ? prev.filter(reqId => reqId !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setSelectedDismantleIds(paginatedDismantles.map(req => req.id));
        } else {
            setSelectedDismantleIds([]);
        }
    };

    const handleShowDetails = (dismantle: Dismantle) => {
        setSelectedDismantle(dismantle);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedDismantle(null);
    };

    const handleExport = () => {
        exportToCSV(sortedDismantles, `dismantle_aset_${new Date().toISOString().split('T')[0]}`);
    };
    
    const handleCreateDismantle = (data: Omit<Dismantle, 'id' | 'status' | 'acknowledger'>) => {
        const newDismantle: Dismantle = {
            ...data,
            id: `DSM-${String(dismantles.length + 1).padStart(3, '0')}`,
            status: ItemStatus.COMPLETED,
            acknowledger: 'Budi Santoso', // Auto-acknowledged for demo
        };
        setDismantles(prev => [newDismantle, ...prev]);
        onUpdateAsset(data.assetId, { 
            status: AssetStatus.IN_STORAGE, 
            currentUser: null, 
            location: 'Gudang Inventori',
            condition: data.retrievedCondition,
            isDismantled: true,
        });
        handleSetView('list');
        addNotification('Formulir dismantle berhasil dibuat dan status aset diperbarui.', 'success');
    };
    
    const handleConfirmDelete = () => {
        if (!dismantleToDeleteId) return;
        setIsLoading(true);
        setTimeout(() => {
            setDismantles(prev => prev.filter(d => d.id !== dismantleToDeleteId));
            addNotification(`Data dismantle ${dismantleToDeleteId} berhasil dihapus.`, 'success');
            setDismantleToDeleteId(null);
            setIsLoading(false);
        }, 1000);
    };

    const handleBulkDelete = () => {
        setIsLoading(true);
        setTimeout(() => {
            setDismantles(prev => prev.filter(d => !selectedDismantleIds.includes(d.id)));
            addNotification(`${selectedDismantleIds.length} data dismantle berhasil dihapus.`, 'success');
            handleCancelBulkMode();
            setBulkDeleteConfirmation(false);
            setIsLoading(false);
        }, 1000);
    };

    const handleBulkComplete = () => {
        setIsLoading(true);
        setTimeout(() => {
            setDismantles(prev => prev.map(d => 
                selectedDismantleIds.includes(d.id) ? { ...d, status: ItemStatus.COMPLETED } : d
            ));
            addNotification(`${selectedDismantleIds.length} data dismantle ditandai selesai.`, 'success');
            handleCancelBulkMode();
            setBulkCompleteConfirmation(false);
            setIsLoading(false);
        }, 1000);
    };
    
    const renderContent = () => {
         if (view === 'form') {
             return (
                <div className="p-4 sm:p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl font-bold text-tm-dark">Form Dismantle Aset</h1>
                        <button
                            onClick={() => handleSetView('list')}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
                        >
                            Kembali ke Daftar
                        </button>
                    </div>
                    <div className="p-4 sm:p-6 bg-white border border-gray-200/80 rounded-xl shadow-md pb-24">
                        <DismantleForm onSave={handleCreateDismantle} assets={assets} customers={customers} prefillData={prefillData} />
                    </div>
                </div>
            );
        }
        
        return (
            <div className="p-4 sm:p-6 md:p-8">
                <div className="flex flex-col items-start justify-between gap-4 mb-6 md:flex-row md:items-center">
                    <h1 className="text-3xl font-bold text-tm-dark">Daftar Dismantle</h1>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handleExport}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 transition-all duration-200 bg-white border rounded-lg shadow-sm hover:bg-gray-50"
                        >
                            <ExportIcon className="w-4 h-4"/>
                            Export CSV
                        </button>
                        <button
                            onClick={() => handleSetView('form')}
                            className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 rounded-lg shadow-sm bg-tm-primary hover:bg-tm-primary-hover"
                        >
                            Buat Form Dismantle
                        </button>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="p-4 mb-4 bg-white border border-gray-200/80 rounded-xl shadow-md">
                    <div className="flex flex-col w-full gap-4 sm:flex-row sm:flex-wrap sm:items-center">
                        <div className="relative flex-grow">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <SearchIcon className="w-5 h-5 text-gray-400" />
                            </div>
                            <input 
                                type="text"
                                placeholder="Cari ID, Aset, Teknisi, Pelanggan..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full h-10 py-2 pl-10 pr-10 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-tm-accent focus:border-tm-accent"
                            />
                             {searchQuery && (
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        className="p-1 text-gray-400 rounded-full hover:bg-gray-200 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-tm-accent"
                                        aria-label="Hapus pencarian"
                                    >
                                        <CloseIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        <select onChange={e => setFilterStatus(e.target.value)} value={filterStatus} className="w-full h-10 px-3 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-300 rounded-lg sm:w-auto focus:ring-tm-accent focus:border-tm-accent">
                            <option value="">Semua Status</option>
                            {Object.values(ItemStatus).filter(s => s === ItemStatus.COMPLETED || s === ItemStatus.IN_PROGRESS).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        
                        {isFiltering && (
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className="inline-flex items-center justify-center w-full h-10 px-4 text-sm font-semibold text-gray-700 transition-all duration-200 bg-white border border-gray-300 rounded-lg shadow-sm sm:w-auto sm:ml-auto hover:bg-red-50 hover:border-red-500 hover:text-red-600"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                     {isFiltering && (
                         <div className="pt-4 mt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-600">
                                Menampilkan <span className="font-semibold text-tm-dark">{sortedDismantles.length}</span> dari <span className="font-semibold text-tm-dark">{dismantles.length}</span> total data yang cocok.
                            </p>
                         </div>
                     )}
                </div>

                {isBulkSelectMode && (
                     <div className="p-4 mb-4 bg-blue-50 border-l-4 border-tm-accent rounded-r-lg">
                        <div className="flex items-center justify-between">
                            {selectedDismantleIds.length > 0 ? (
                                <div className="flex items-center space-x-3">
                                    <span className="text-sm font-medium text-tm-primary">{selectedDismantleIds.length} item terpilih</span>
                                    <div className="h-5 border-l border-gray-300"></div>
                                    <button
                                        onClick={() => setBulkCompleteConfirmation(true)}
                                        className="px-3 py-1.5 text-sm font-semibold text-green-600 bg-green-100 rounded-md hover:bg-green-200"
                                    >
                                        Tandai Selesai
                                    </button>
                                    <button
                                        onClick={() => setBulkDeleteConfirmation(true)}
                                        className="px-3 py-1.5 text-sm font-semibold text-red-600 bg-red-100 rounded-md hover:bg-red-200"
                                    >
                                        Hapus
                                    </button>
                                </div>
                            ) : (
                                <span className="text-sm text-gray-500">Pilih item untuk memulai aksi massal.</span>
                            )}
                            <button onClick={handleCancelBulkMode} className="px-3 py-1.5 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
                                Batal
                            </button>
                        </div>
                     </div>
                )}
                
                <div className="bg-white border border-gray-200/80 rounded-xl shadow-md">
                    <div className="overflow-x-auto custom-scrollbar">
                        <DismantleTable 
                            dismantles={paginatedDismantles} 
                            onDetailClick={handleShowDetails} 
                            onDeleteClick={setDismantleToDeleteId} 
                            sortConfig={sortConfig} 
                            requestSort={requestSort}
                            selectedDismantleIds={selectedDismantleIds}
                            onSelectAll={handleSelectAll}
                            onSelectOne={handleSelectOne}
                            isBulkSelectMode={isBulkSelectMode}
                            onEnterBulkMode={() => setIsBulkSelectMode(true)}
                        />
                    </div>
                    <PaginationControls
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={handleItemsPerPageChange}
                        startIndex={startIndex}
                        endIndex={endIndex}
                    />
                </div>
            </div>
        );
    };

    return (
        <>
            {renderContent()}

            {selectedDismantle && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    title={`Detail Dismantle Aset`}
                    size="xl"
                >
                    <div className="mb-4 space-y-2 text-center">
                        <h4 className="text-xl font-bold text-tm-dark">TRINITY MEDIA INDONESIA</h4>
                        <p className="font-semibold text-tm-secondary">FORMULIR DISMANTLE ASET</p>
                    </div>

                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 py-4 my-4 text-sm border-t border-b border-gray-200">
                        <div><span className="font-semibold text-gray-600">No Dokumen:</span><span className="pl-2 text-gray-800">{selectedDismantle.id}</span></div>
                        <div><span className="font-semibold text-gray-600">Tanggal Dismantle:</span><span className="pl-2 text-gray-800">{selectedDismantle.dismantleDate}</span></div>
                    </div>

                    <div className="space-y-4 text-sm">
                        <h3 className="font-semibold text-tm-dark">Informasi Pelanggan & Teknisi</h3>
                        <div className="grid grid-cols-3 gap-x-4">
                            <span className="font-semibold text-gray-600">Nama Pelanggan</span>
                            <span className="col-span-2 text-gray-800">{selectedDismantle.customerName} ({selectedDismantle.customerId})</span>
                        </div>
                         <div className="grid grid-cols-3 gap-x-4">
                            <span className="font-semibold text-gray-600">Alamat</span>
                            <span className="col-span-2 text-gray-800">{selectedDismantle.customerAddress}</span>
                        </div>
                         <div className="grid grid-cols-3 gap-x-4">
                            <span className="font-semibold text-gray-600">Teknisi</span>
                            <span className="col-span-2 text-gray-800">{selectedDismantle.technician}</span>
                        </div>
                    </div>

                     <div className="mt-6 space-y-4 text-sm">
                        <h3 className="font-semibold text-tm-dark">Informasi Aset yang di-Dismantle</h3>
                        {(() => {
                            const assetDetails = assets.find(a => a.id === selectedDismantle.assetId);
                            return (
                                <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                                    <div className="sm:col-span-2">
                                        <dt className="font-semibold text-gray-600">Nama Aset</dt>
                                        <dd className="text-gray-800">{selectedDismantle.assetName} ({selectedDismantle.assetId})</dd>
                                    </div>
                                    <div>
                                        <dt className="font-semibold text-gray-600">Nomor Seri</dt>
                                        <dd className="font-mono text-gray-800">{assetDetails?.serialNumber || 'N/A'}</dd>
                                    </div>
                                    <div>
                                        <dt className="font-semibold text-gray-600">MAC Address</dt>
                                        <dd className="font-mono text-gray-800">{assetDetails?.macAddress || 'N/A'}</dd>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <dt className="font-semibold text-gray-600">Kondisi Saat Ditarik</dt>
                                        <dd className="text-gray-800">{selectedDismantle.retrievedCondition}</dd>
                                    </div>
                                </dl>
                            );
                        })()}
                    </div>
                     
                    <div className="pt-8 mt-6 border-t border-gray-200">
                        <div className="grid grid-cols-1 text-sm text-center gap-y-8 sm:grid-cols-2 sm:gap-x-8">
                             <div>
                                <p className="font-semibold text-gray-600">Teknisi</p>
                                <div className="flex items-center justify-center mt-2 h-28">
                                    <SignatureStamp signerName={selectedDismantle.technician} signatureDate={selectedDismantle.dismantleDate} signerDivision="Divisi Engineer" />
                                </div>
                                <div className="pt-1 mt-2 border-t border-gray-400">
                                    <p>({selectedDismantle.technician})</p>
                                </div>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-600">Mengetahui</p>
                                <div className="flex items-center justify-center mt-2 h-28">
                                    {selectedDismantle.acknowledger ? (
                                        <ApprovalStamp approverName={selectedDismantle.acknowledger} approvalDate={selectedDismantle.dismantleDate} approverDivision="Divisi Inventori" />
                                    ) : (
                                        <span className="italic text-gray-400">Belum Diverifikasi</span>
                                    )}
                                </div>
                                <div className="pt-1 mt-2 border-t border-gray-400">
                                    <p>({selectedDismantle.acknowledger || 'Nama Jelas'})</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
            
            {dismantleToDeleteId && (
                <Modal isOpen={!!dismantleToDeleteId} onClose={() => setDismantleToDeleteId(null)} title="Konfirmasi Hapus Data" size="md" hideDefaultCloseButton={true} footerContent={<><button onClick={() => setDismantleToDeleteId(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Batal</button><button type="button" onClick={handleConfirmDelete} disabled={isLoading} className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-danger rounded-lg shadow-sm hover:bg-red-700 disabled:bg-red-400">{isLoading && <SpinnerIcon className="w-5 h-5 mr-2" />}Ya, Hapus</button></>}>
                    <p className="text-sm text-gray-600">Apakah Anda yakin ingin menghapus data dismantle dengan ID <span className="font-bold text-tm-dark">{dismantleToDeleteId}</span>?</p>
                </Modal>
            )}
            {bulkDeleteConfirmation && (
                <Modal isOpen={bulkDeleteConfirmation} onClose={() => setBulkDeleteConfirmation(false)} title="Konfirmasi Hapus Massal" size="md" hideDefaultCloseButton={true} footerContent={<><button onClick={() => setBulkDeleteConfirmation(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Batal</button><button type="button" onClick={handleBulkDelete} disabled={isLoading} className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-danger rounded-lg shadow-sm hover:bg-red-700 disabled:bg-red-400">{isLoading && <SpinnerIcon className="w-5 h-5 mr-2" />}Ya, Hapus ({selectedDismantleIds.length})</button></>}>
                    <p className="text-sm text-gray-600">Anda yakin ingin menghapus <span className="font-bold text-tm-dark">{selectedDismantleIds.length}</span> data yang dipilih?</p>
                </Modal>
            )}
            {bulkCompleteConfirmation && (
                <Modal isOpen={bulkCompleteConfirmation} onClose={() => setBulkCompleteConfirmation(false)} title="Konfirmasi Selesaikan Proses" size="md" hideDefaultCloseButton={true} footerContent={<><button onClick={() => setBulkCompleteConfirmation(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Batal</button><button type="button" onClick={handleBulkComplete} disabled={isLoading} className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-success rounded-lg shadow-sm hover:bg-green-700 disabled:bg-green-400">{isLoading && <SpinnerIcon className="w-5 h-5 mr-2" />}Ya, Tandai Selesai</button></>}>
                    <p className="text-sm text-gray-600">Anda akan menandai <span className="font-bold text-tm-dark">{selectedDismantleIds.length}</span> proses dismantle sebagai 'Selesai'.</p>
                </Modal>
            )}
        </>
    );
};
