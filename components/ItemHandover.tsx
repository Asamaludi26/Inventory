import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Handover, ItemStatus, HandoverItem, Asset, AssetStatus } from '../types';
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
import FloatingActionBar from './shared/FloatingActionBar';

interface ItemHandoverProps {
    handovers: Handover[];
    setHandovers: React.Dispatch<React.SetStateAction<Handover[]>>;
    assets: Asset[];
    prefillData?: Asset | null;
    onClearPrefill: () => void;
    onUpdateAsset: (assetId: string, updates: Partial<Asset>) => void;
}

export const mockHandovers: Handover[] = Array.from({ length: 60 }, (_, i) => {
    const userPool = ['Alice Johnson', 'Evan Davis', 'Charlie Brown', 'Jack Taylor', 'Diana Miller', 'Bob Williams', 'Grace Lee', 'Henry Wilson'];
    const assetPool = [
        { id: 'AST-0001', name: 'Router Core RB4011iGS+', brand: 'Mikrotik' },
        { id: 'AST-0013', name: 'Laptop Dell XPS 15', brand: 'Dell' },
        { id: 'AST-0007', name: 'Fusion Splicer 90S', brand: 'Fujikura' },
        { id: 'AST-0004', name: 'Access Point U6 Lite', brand: 'Ubiquiti' },
        { id: 'AST-0111', name: 'LAN Tester NF-8209', brand: 'Noyafa' },
        { id: 'AST-0113', name: 'PC Rakitan i7', brand: 'Custom' },
    ];
    const asset = assetPool[i % assetPool.length];
    
    return {
        id: `HO-${String(60 - i).padStart(3, '0')}`,
        handoverDate: new Date(2024, 7, 10 - (i % 28)).toISOString().split('T')[0],
        menyerahkan: userPool[i % userPool.length],
        penerima: userPool[(i + 2) % userPool.length],
        mengetahui: 'John Doe',
        woRoIntNumber: `RO-${11223 + i}`,
        lembar: (i % 2 === 0 ? '1. Menyerahkan' : '2. Penerima') as any,
        items: [
            { id: 1, assetId: asset.id, itemName: asset.name, itemTypeBrand: asset.brand, conditionNotes: 'Kondisi baik, normal, siap pakai.', quantity: 1, checked: true }
        ],
        status: (i % 4 === 0) ? ItemStatus.IN_PROGRESS : ItemStatus.COMPLETED
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
    columnKey: keyof Handover;
    sortConfig: SortConfig<Handover> | null;
    requestSort: (key: keyof Handover) => void;
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

interface HandoverTableProps {
    handovers: Handover[];
    onDetailClick: (handover: Handover) => void;
    onDeleteClick: (id: string) => void;
    sortConfig: SortConfig<Handover> | null;
    requestSort: (key: keyof Handover) => void;
    selectedHandoverIds: string[];
    onSelectOne: (id: string) => void;
    onSelectAll: (event: React.ChangeEvent<HTMLInputElement>) => void;
    isBulkSelectMode: boolean;
    onEnterBulkMode: () => void;
}

const HandoverTable: React.FC<HandoverTableProps> = ({ handovers, onDetailClick, onDeleteClick, sortConfig, requestSort, selectedHandoverIds, onSelectOne, onSelectAll, isBulkSelectMode, onEnterBulkMode }) => {
    const longPressHandlers = useLongPress(onEnterBulkMode, 500);

    const handleRowClick = (ho: Handover) => {
        if (isBulkSelectMode) {
            onSelectOne(ho.id);
        } else {
            onDetailClick(ho);
        }
    };
    
    return (
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="sticky top-0 z-10 bg-gray-50">
                <tr>
                    {isBulkSelectMode && (
                        <th scope="col" className="px-6 py-3">
                            <Checkbox
                                checked={selectedHandoverIds.length === handovers.length && handovers.length > 0}
                                onChange={onSelectAll}
                                aria-label="Pilih semua handover"
                            />
                        </th>
                    )}
                    <SortableHeader columnKey="id" sortConfig={sortConfig} requestSort={requestSort}>ID / Tanggal</SortableHeader>
                    <th scope="col" className="px-6 py-3 text-sm font-semibold tracking-wider text-left text-gray-500">Pihak Terlibat</th>
                    <th scope="col" className="px-6 py-3 text-sm font-semibold tracking-wider text-left text-gray-500">Detail Barang</th>
                    {/* FIX: Corrected typo 'sortSort' to 'requestSort' */}
                    <SortableHeader columnKey="status" sortConfig={sortConfig} requestSort={requestSort}>Status</SortableHeader>
                    <th className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {handovers.length > 0 ? (
                    handovers.map((ho) => (
                        <tr 
                            key={ho.id}
                            {...longPressHandlers}
                            onClick={() => handleRowClick(ho)}
                            className={`transition-colors cursor-pointer ${selectedHandoverIds.includes(ho.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                        >
                            {isBulkSelectMode && (
                                <td className="px-6 py-4 align-top" onClick={(e) => e.stopPropagation()}>
                                    <Checkbox
                                        checked={selectedHandoverIds.includes(ho.id)}
                                        onChange={() => onSelectOne(ho.id)}
                                        aria-labelledby={`handover-id-${ho.id}`}
                                    />
                                </td>
                            )}
                            <td id={`handover-id-${ho.id}`} className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-semibold text-gray-900">{ho.id}</div>
                                <div className="text-xs text-gray-500">{ho.handoverDate}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{ho.menyerahkan}</div>
                                <div className="text-xs text-gray-500">ke {ho.penerima}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                                <div className="font-medium text-gray-800">
                                    {ho.items.length} item
                                </div>
                                <div className="text-xs truncate text-gray-500 max-w-[200px]" title={ho.items[0]?.itemName}>
                                    {ho.items[0]?.itemName}{ho.items.length > 1 ? ', ...' : ''}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(ho.status)}`}>
                                    {ho.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                                 <div className="flex items-center justify-end space-x-2">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onDetailClick(ho); }}
                                        className="flex items-center justify-center w-8 h-8 text-gray-500 transition-colors bg-gray-100 rounded-full hover:bg-info-light hover:text-info-text" title="Lihat Detail"
                                    >
                                      <EyeIcon className="w-5 h-5"/>
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); onDeleteClick(ho.id); }} className="flex items-center justify-center w-8 h-8 text-gray-500 transition-colors bg-gray-100 rounded-full hover:bg-danger-light hover:text-danger-text" title="Hapus">
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
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak Ada Data Handover</h3>
                                <p className="mt-1 text-sm text-gray-500">Ubah filter atau buat handover baru.</p>
                            </div>
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    );
};

const HandoverForm: React.FC<{ 
    onSave: (data: Omit<Handover, 'id' | 'status'>) => void; 
    assets: Asset[]; 
    prefillData?: Asset | null;
    onUpdateAsset: (assetId: string, updates: Partial<Asset>) => void;
}> = ({ onSave, assets, prefillData, onUpdateAsset }) => {
    const [handoverDate, setHandoverDate] = useState<Date | null>(new Date());
    const [menyerahkan, setMenyerahkan] = useState('');
    const [penerima, setPenerima] = useState('');
    const [mengetahui, setMengetahui] = useState('');
    const [woRoIntNumber, setWoRoIntNumber] = useState('');
    const [lembar, setLembar] = useState<'1. Menyerahkan' | '2. Penerima'>('1. Menyerahkan');
    const [items, setItems] = useState<HandoverItem[]>([
        { id: Date.now(), assetId: '', itemName: '', itemTypeBrand: '', conditionNotes: '', quantity: 1, checked: false }
    ]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFooterVisible, setIsFooterVisible] = useState(true);
    const footerRef = useRef<HTMLDivElement>(null);
    const formId = "handover-form";
    const addNotification = useNotification();
    
    const availableAssets = useMemo(() => 
        assets.filter(asset => asset.status === AssetStatus.IN_STORAGE || asset.status === AssetStatus.IN_USE),
    []);

    useEffect(() => {
        if (prefillData) {
            setItems([{
                id: Date.now(),
                assetId: prefillData.id,
                itemName: prefillData.name,
                itemTypeBrand: prefillData.brand,
                conditionNotes: prefillData.condition,
                quantity: 1,
                checked: true,
            }]);
            setMenyerahkan(prefillData.currentUser || '');
        }
    }, [prefillData]);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => setIsFooterVisible(entry.isIntersecting), { threshold: 0.1 });
        const currentRef = footerRef.current;
        if (currentRef) observer.observe(currentRef);
        return () => { if (currentRef) observer.unobserve(currentRef); };
    }, []);

    const handleAddItem = () => {
        setItems([...items, { id: Date.now(), assetId: '', itemName: '', itemTypeBrand: '', conditionNotes: '', quantity: 1, checked: false }]);
    };

    const handleRemoveItem = (id: number) => {
        if (items.length > 1) {
            setItems(items.filter(item => item.id !== id));
        }
    };
    
    const handleAssetSelection = (id: number, selectedAssetId: string) => {
        const selectedAsset = availableAssets.find(asset => asset.id === selectedAssetId);
        
        setItems(items.map(item => 
            item.id === id 
            ? { ...item, 
                assetId: selectedAsset?.id, 
                itemName: selectedAsset?.name || '', 
                itemTypeBrand: selectedAsset?.brand || '',
                conditionNotes: selectedAsset?.condition || ''
              } 
            : item
        ));
    };

    const handleItemChange = (id: number, field: keyof Omit<HandoverItem, 'id' | 'itemName' | 'itemTypeBrand' | 'assetId'>, value: string | number | boolean) => {
        setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!menyerahkan || !penerima || !mengetahui) {
            addNotification('Harap lengkapi nama pihak yang terlibat.', 'error');
            return;
        }
        setIsSubmitting(true);
        setTimeout(() => {
            onSave({
                handoverDate: handoverDate!.toISOString().split('T')[0],
                menyerahkan,
                penerima,
                mengetahui,
                woRoIntNumber,
                lembar,
                items,
            });

            // Update asset status
            items.forEach(item => {
                if(item.assetId) {
                    onUpdateAsset(item.assetId, {
                        currentUser: penerima,
                        status: AssetStatus.IN_USE,
                        location: `Dipinjam oleh ${penerima}`
                    })
                }
            });
            
            setIsSubmitting(false);
        }, 1000);
    };

    const ActionButtons: React.FC<{ formId?: string }> = ({ formId }) => (
        <button 
            type="submit" 
            form={formId}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 rounded-lg shadow-sm bg-tm-primary hover:bg-tm-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tm-accent disabled:bg-tm-primary/70 disabled:cursor-not-allowed">
             {isSubmitting ? <SpinnerIcon className="w-5 h-5 mr-2" /> : null}
            {isSubmitting ? 'Memproses...' : 'Proses Handover'}
        </button>
    );

    return (
    <>
        <form id={formId} className="space-y-6" onSubmit={handleSubmit}>
            {prefillData && (
                <div className="p-4 border-l-4 rounded-r-lg bg-info-light border-tm-primary">
                    <p className="text-sm text-info-text">
                        Membuat handover untuk aset: <span className="font-bold">{prefillData.name} ({prefillData.id})</span>.
                    </p>
                </div>
            )}
            <div className="mb-6 space-y-2 text-center">
                <h4 className="text-xl font-bold text-tm-dark">TRINITY MEDIA INDONESIA</h4>
                <p className="font-semibold text-tm-secondary">BERITA ACARA SERAH TERIMA BARANG (HANDOVER)</p>
            </div>
            
            <div className="p-4 border-t border-b border-gray-200">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <label htmlFor="handoverDate" className="block text-sm font-medium text-gray-700">Tanggal</label>
                         <DatePicker id="handoverDate" selectedDate={handoverDate} onDateChange={setHandoverDate} />
                    </div>
                    <div>
                        <label htmlFor="menyerahkan" className="block text-sm font-medium text-gray-700">Menyerahkan</label>
                        <input type="text" id="menyerahkan" value={menyerahkan} onChange={e => setMenyerahkan(e.target.value)} required className="block w-full px-3 py-2 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-md sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="penerima" className="block text-sm font-medium text-gray-700">Penerima</label>
                        <input type="text" id="penerima" value={penerima} onChange={e => setPenerima(e.target.value)} required className="block w-full px-3 py-2 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-md sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="docNumber" className="block text-sm font-medium text-gray-700">No Dokumen</label>
                        <input type="text" id="docNumber" readOnly className="block w-full px-3 py-2 mt-1 text-gray-700 bg-gray-100 border border-gray-200 rounded-md sm:text-sm" value="[Otomatis]" />
                    </div>
                    <div>
                        <label htmlFor="woRoIntNumber" className="block text-sm font-medium text-gray-700">No WO/RO/INT</label>
                        <input type="text" id="woRoIntNumber" value={woRoIntNumber} onChange={e => setWoRoIntNumber(e.target.value)} className="block w-full px-3 py-2 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-md sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="lembar" className="block text-sm font-medium text-gray-700">Lembar</label>
                        <select id="lembar" value={lembar} onChange={e => setLembar(e.target.value as any)} className="block w-full px-3 py-2 mt-1 bg-gray-50 border border-gray-300 rounded-md sm:text-sm">
                            <option value="1. Menyerahkan">1. Menyerahkan</option>
                            <option value="2. Penerima">2. Penerima</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-tm-dark">Detail Barang</h3>
                <button type="button" onClick={handleAddItem} disabled={!!prefillData} className="px-3 py-1 text-sm font-semibold text-white transition-colors duration-200 rounded-md shadow-sm bg-tm-accent hover:bg-tm-primary disabled:bg-gray-400 disabled:cursor-not-allowed">+ Tambah Item</button>
            </div>
            
            <div className="space-y-4">
                {items.map((item, index) => (
                    <div key={item.id} className="relative grid grid-cols-1 gap-4 p-4 border border-gray-200 rounded-lg md:grid-cols-12">
                        <div className="md:col-span-3">
                            <label htmlFor={`itemName-${item.id}`} className="block text-sm font-medium text-gray-700">Nama Barang</label>
                            <select 
                                id={`itemName-${item.id}`} 
                                value={item.assetId}
                                onChange={(e) => handleAssetSelection(item.id, e.target.value)} 
                                disabled={!!prefillData}
                                className="block w-full px-3 py-2 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-tm-accent focus:border-tm-accent sm:text-sm disabled:bg-gray-200"
                            >
                                <option value="">-- Pilih Aset --</option>
                                {availableAssets.map(asset => <option key={asset.id} value={asset.id}>{asset.name} ({asset.id})</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor={`itemTypeBrand-${item.id}`} className="block text-sm font-medium text-gray-700">Type / Brand</label>
                            <input 
                                type="text" 
                                id={`itemTypeBrand-${item.id}`} 
                                value={item.itemTypeBrand} 
                                readOnly 
                                className="block w-full px-3 py-2 mt-1 text-gray-700 bg-gray-100 border border-gray-200 rounded-md shadow-sm sm:text-sm" 
                                placeholder="Otomatis" 
                            />
                        </div>
                         <div className="md:col-span-4">
                            <label htmlFor={`conditionNotes-${item.id}`} className="block text-sm font-medium text-gray-700">Ket / Status Barang</label>
                            <input 
                                type="text" 
                                id={`conditionNotes-${item.id}`} 
                                value={item.conditionNotes} 
                                onChange={(e) => handleItemChange(item.id, 'conditionNotes', e.target.value)}
                                className="block w-full px-3 py-2 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                                placeholder="Contoh: Baru, Bekas, Baik, Rusak"
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label htmlFor={`quantity-${item.id}`} className="block text-sm font-medium text-gray-700">Jumlah</label>
                            <input 
                                type="number" 
                                id={`quantity-${item.id}`} 
                                value={item.quantity} 
                                onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value))} 
                                min="1" 
                                className="block w-full px-3 py-2 mt-1 text-center text-gray-900 bg-gray-50 border border-gray-300 rounded-md shadow-sm sm:text-sm" 
                            />
                        </div>
                         <div className="flex flex-col items-center md:col-span-1">
                            <label htmlFor={`check-${item.id}`} className="block mb-2 text-sm font-medium text-gray-700">Check</label>
                            <Checkbox 
                                id={`check-${item.id}`}
                                checked={item.checked} 
                                onChange={e => handleItemChange(item.id, 'checked', e.target.checked)} 
                                className="mt-1"
                            />
                        </div>
                        {items.length > 1 && !prefillData && (
                            <div className="absolute top-2 right-2">
                                <button type="button" onClick={() => handleRemoveItem(item.id)} className="p-1 text-gray-400 rounded-full hover:bg-red-100 hover:text-red-500">
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>


            <div className="pt-8 mt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 text-center gap-y-8 md:grid-cols-3 md:gap-x-8">
                    <div>
                        <p className="font-medium text-gray-700">Menyerahkan</p>
                        <div className="flex items-center justify-center mt-2 h-28">
                            {menyerahkan && <SignatureStamp signerName={menyerahkan} signatureDate={handoverDate?.toISOString() || ''} />}
                        </div>
                        <p className="pt-1 mt-2 text-sm text-gray-600 border-t border-gray-400">( {menyerahkan || 'Nama Jelas'} )</p>
                    </div>
                    <div>
                        <p className="font-medium text-gray-700">Penerima</p>
                        <div className="flex items-center justify-center mt-2 h-28">
                            {penerima && <SignatureStamp signerName={penerima} signatureDate={handoverDate?.toISOString() || ''} />}
                        </div>
                        <p className="pt-1 mt-2 text-sm text-gray-600 border-t border-gray-400">( {penerima || 'Nama Jelas'} )</p>
                    </div>
                     <div>
                        <label htmlFor="mengetahui" className="font-medium text-gray-700">Mengetahui</label>
                         <div className="flex items-center justify-center mt-2 h-28">
                            {mengetahui && <SignatureStamp signerName={mengetahui} signatureDate={handoverDate?.toISOString() || ''} />}
                        </div>
                        <input 
                            type="text" 
                            id="mengetahui" 
                            value={mengetahui} 
                            onChange={e => setMengetahui(e.target.value)} 
                            className="w-48 p-1 mt-2 text-sm text-center bg-gray-50 border-t border-gray-400" 
                            placeholder="( Nama Jelas )"
                        />
                    </div>
                </div>
            </div>
            
            <div ref={footerRef} className="flex justify-end pt-4 mt-4 border-t border-gray-200">
                <ActionButtons />
            </div>
        </form>
        <FloatingActionBar isVisible={!isFooterVisible}>
            <ActionButtons formId={formId} />
        </FloatingActionBar>
    </>
    );
};

const ItemHandover: React.FC<ItemHandoverProps> = ({ handovers, setHandovers, assets, prefillData, onClearPrefill, onUpdateAsset }) => {
    const [view, setView] = useState<'list' | 'form'>('list');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedHandover, setSelectedHandover] = useState<Handover | null>(null);
    const [handoverToDeleteId, setHandoverToDeleteId] = useState<string | null>(null);
    const [bulkDeleteConfirmation, setBulkDeleteConfirmation] = useState(false);
    const [bulkCompleteConfirmation, setBulkCompleteConfirmation] = useState(false);
    const [isBulkSelectMode, setIsBulkSelectMode] = useState(false);
    const [selectedHandoverIds, setSelectedHandoverIds] = useState<string[]>([]);
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

    const filteredHandovers = useMemo(() => {
        return handovers
            .filter(ho => {
                const searchLower = searchQuery.toLowerCase();
                return (
                    ho.id.toLowerCase().includes(searchLower) ||
                    ho.menyerahkan.toLowerCase().includes(searchLower) ||
                    ho.penerima.toLowerCase().includes(searchLower) ||
                    ho.items.some(item => item.itemName.toLowerCase().includes(searchLower))
                );
            })
            .filter(ho => filterStatus ? ho.status === filterStatus : true);
    }, [handovers, searchQuery, filterStatus]);

    const { items: sortedHandovers, requestSort, sortConfig } = useSortableData(filteredHandovers, { key: 'handoverDate', direction: 'descending' });
    
    const totalItems = sortedHandovers.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedHandovers = sortedHandovers.slice(startIndex, endIndex);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterStatus, itemsPerPage]);

    const handleItemsPerPageChange = (newSize: number) => {
        setItemsPerPage(newSize);
        setCurrentPage(1);
    };

    const actionableCompleteCount = useMemo(() => {
        if (!isBulkSelectMode) return 0;
        return handovers.filter(h => selectedHandoverIds.includes(h.id) && h.status === ItemStatus.IN_PROGRESS).length;
    }, [handovers, selectedHandoverIds, isBulkSelectMode]);

     const handleCancelBulkMode = () => {
        setIsBulkSelectMode(false);
        setSelectedHandoverIds([]);
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
        setSelectedHandoverIds(prev =>
            prev.includes(id) ? prev.filter(reqId => reqId !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setSelectedHandoverIds(paginatedHandovers.map(req => req.id));
        } else {
            setSelectedHandoverIds([]);
        }
    };

    const handleShowDetails = (handover: Handover) => {
        setSelectedHandover(handover);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedHandover(null);
    };
    
    const handleExport = () => {
        exportToCSV(sortedHandovers, `handover_barang_${new Date().toISOString().split('T')[0]}`);
    };

    const handleCreateHandover = (data: Omit<Handover, 'id' | 'status'>) => {
        const newHandover: Handover = {
            ...data,
            id: `HO-${String(handovers.length + 1).padStart(3, '0')}`,
            status: ItemStatus.COMPLETED,
        };
        setHandovers(prev => [newHandover, ...prev]);
        handleSetView('list');
        addNotification('Formulir handover berhasil dibuat dan status aset diperbarui.', 'success');
    };
    
    const handleConfirmDelete = () => {
        if (!handoverToDeleteId) return;
        setIsLoading(true);
        setTimeout(() => {
            setHandovers(prev => prev.filter(ho => ho.id !== handoverToDeleteId));
            addNotification(`Handover ${handoverToDeleteId} berhasil dihapus.`, 'success');
            setHandoverToDeleteId(null);
            setIsLoading(false);
        }, 1000);
    };

    const handleBulkDelete = () => {
        setIsLoading(true);
        setTimeout(() => {
            setHandovers(prev => prev.filter(ho => !selectedHandoverIds.includes(ho.id)));
            addNotification(`${selectedHandoverIds.length} handover berhasil dihapus.`, 'success');
            handleCancelBulkMode();
            setBulkDeleteConfirmation(false);
            setIsLoading(false);
        }, 1000);
    };

    const handleBulkComplete = () => {
        setIsLoading(true);
        setTimeout(() => {
            setHandovers(prev => prev.map(ho => 
                selectedHandoverIds.includes(ho.id) && ho.status === ItemStatus.IN_PROGRESS
                    ? { ...ho, status: ItemStatus.COMPLETED }
                    : ho
            ));
            addNotification(`${actionableCompleteCount} handover ditandai selesai.`, 'success');
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
                        <h1 className="text-3xl font-bold text-tm-dark">Buat Handover Baru</h1>
                        <button
                            onClick={() => handleSetView('list')}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tm-accent"
                        >
                            Kembali ke Daftar
                        </button>
                    </div>
                    <div className="p-4 sm:p-6 bg-white border border-gray-200/80 rounded-xl shadow-md pb-24">
                        <HandoverForm onSave={handleCreateHandover} assets={assets} prefillData={prefillData} onUpdateAsset={onUpdateAsset} />
                    </div>
                </div>
            );
        }

        return (
            <div className="p-4 sm:p-6 md:p-8">
                <div className="flex flex-col items-start justify-between gap-4 mb-6 md:flex-row md:items-center">
                    <h1 className="text-3xl font-bold text-tm-dark">Daftar Handover Barang</h1>
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
                            className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 rounded-lg shadow-sm bg-tm-primary hover:bg-tm-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tm-accent"
                        >
                            Buat Handover Baru
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
                                placeholder="Cari ID, Nama Aset, Pengguna..."
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
                            {Object.values(ItemStatus).filter(s => s !== ItemStatus.REJECTED && s !== ItemStatus.LOGISTIC_APPROVED && s !== ItemStatus.APPROVED).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        
                        {isFiltering && (
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className="inline-flex items-center justify-center w-full h-10 px-4 text-sm font-semibold text-gray-700 transition-all duration-200 bg-white border border-gray-300 rounded-lg shadow-sm sm:w-auto sm:ml-auto hover:bg-red-50 hover:border-red-500 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-400"
                            >
                                Reset
                            </button>
                        )}
                    </div>

                     {isFiltering && (
                         <div className="pt-4 mt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-600">
                                Menampilkan <span className="font-semibold text-tm-dark">{sortedHandovers.length}</span> dari <span className="font-semibold text-tm-dark">{handovers.length}</span> total handover yang cocok.
                            </p>
                         </div>
                     )}
                </div>

                {isBulkSelectMode && (
                     <div className="p-4 mb-4 bg-blue-50 border-l-4 border-tm-accent rounded-r-lg">
                        <div className="flex items-center justify-between">
                            {selectedHandoverIds.length > 0 ? (
                                <div className="flex items-center space-x-3">
                                    <span className="text-sm font-medium text-tm-primary">{selectedHandoverIds.length} item terpilih</span>
                                    <div className="h-5 border-l border-gray-300"></div>
                                    <button
                                        onClick={() => setBulkCompleteConfirmation(true)}
                                        disabled={actionableCompleteCount === 0}
                                        className="px-3 py-1.5 text-sm font-semibold text-green-600 bg-green-100 rounded-md hover:bg-green-200 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                                    >
                                        Selesai {actionableCompleteCount > 0 ? `(${actionableCompleteCount})` : ''}
                                    </button>
                                    <button
                                        onClick={() => setBulkDeleteConfirmation(true)}
                                        className="px-3 py-1.5 text-sm font-semibold text-red-600 bg-red-100 rounded-md hover:bg-red-200"
                                    >
                                        Hapus ({selectedHandoverIds.length})
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
                        <HandoverTable 
                            handovers={paginatedHandovers} 
                            onDetailClick={handleShowDetails} 
                            onDeleteClick={setHandoverToDeleteId} 
                            sortConfig={sortConfig} 
                            requestSort={requestSort} 
                            selectedHandoverIds={selectedHandoverIds}
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

            {selectedHandover && (
                 <Modal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    title={`Detail Handover: ${selectedHandover.id}`}
                    size="2xl"
                >
                    <div className="mb-6 space-y-2 text-center">
                        <h4 className="text-xl font-bold text-tm-dark">TRINITY MEDIA INDONESIA</h4>
                        <p className="font-semibold text-tm-secondary">BERITA ACARA SERAH TERIMA BARANG</p>
                    </div>
                    
                    <dl className="grid grid-cols-1 gap-x-6 gap-y-3 py-4 my-4 text-sm border-t border-b sm:grid-cols-2">
                        <div><dt className="font-semibold text-gray-600">Tanggal:</dt><dd className="text-gray-800">{selectedHandover.handoverDate}</dd></div>
                        <div><dt className="font-semibold text-gray-600">No Dokumen:</dt><dd className="font-mono text-gray-800">{selectedHandover.id}</dd></div>
                        <div><dt className="font-semibold text-gray-600">Menyerahkan:</dt><dd className="text-gray-800">{selectedHandover.menyerahkan}</dd></div>
                        <div><dt className="font-semibold text-gray-600">Penerima:</dt><dd className="text-gray-800">{selectedHandover.penerima}</dd></div>
                        <div><dt className="font-semibold text-gray-600">No WO/RO/INT:</dt><dd className="font-mono text-gray-800">{selectedHandover.woRoIntNumber || '-'}</dd></div>
                        <div><dt className="font-semibold text-gray-600">Lembar:</dt><dd className="text-gray-800">{selectedHandover.lembar}</dd></div>
                    </dl>

                    <div className="overflow-auto custom-scrollbar max-h-[30vh]">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-2 font-semibold text-left text-gray-600">Nama Barang</th>
                                    <th className="px-4 py-2 font-semibold text-left text-gray-600">Status</th>
                                    <th className="px-4 py-2 font-semibold text-center text-gray-600">Jumlah</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {selectedHandover.items.map(item => (
                                <tr key={item.id}>
                                    <td className="px-4 py-2">{item.itemName}<br/><span className="text-xs text-gray-500">{item.itemTypeBrand}</span></td>
                                    <td className="px-4 py-2">{item.conditionNotes}</td>
                                    <td className="px-4 py-2 text-center">{item.quantity}</td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="pt-6 mt-6 border-t border-gray-200">
                        <div className="grid grid-cols-1 text-sm text-center gap-y-6 sm:grid-cols-3 sm:gap-x-4">
                            <div>
                                <p className="font-semibold text-gray-600">Menyerahkan</p>
                                <div className="flex items-center justify-center mt-2 h-28"><SignatureStamp signerName={selectedHandover.menyerahkan} signatureDate={selectedHandover.handoverDate} /></div>
                                <div className="pt-1 mt-2 border-t border-gray-400"><p>({selectedHandover.menyerahkan})</p></div>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-600">Penerima</p>
                                <div className="flex items-center justify-center mt-2 h-28"><SignatureStamp signerName={selectedHandover.penerima} signatureDate={selectedHandover.handoverDate} /></div>
                                <div className="pt-1 mt-2 border-t border-gray-400"><p>({selectedHandover.penerima})</p></div>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-600">Mengetahui</p>
                                <div className="flex items-center justify-center mt-2 h-28"><SignatureStamp signerName={selectedHandover.mengetahui} signatureDate={selectedHandover.handoverDate} /></div>
                                <div className="pt-1 mt-2 border-t border-gray-400"><p>({selectedHandover.mengetahui})</p></div>
                            </div>
                        </div>
                    </div>

                </Modal>
            )}
            
            {handoverToDeleteId && (
                <Modal isOpen={!!handoverToDeleteId} onClose={() => setHandoverToDeleteId(null)} title="Konfirmasi Hapus Handover" size="md" hideDefaultCloseButton={true} footerContent={<><button onClick={() => setHandoverToDeleteId(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Batal</button><button type="button" onClick={handleConfirmDelete} disabled={isLoading} className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-danger rounded-lg shadow-sm hover:bg-red-700 disabled:bg-red-400">{isLoading && <SpinnerIcon className="w-5 h-5 mr-2" />}Ya, Hapus</button></>}>
                    <p className="text-sm text-gray-600">Apakah Anda yakin ingin menghapus data handover dengan ID <span className="font-bold text-tm-dark">{handoverToDeleteId}</span>? Tindakan ini tidak dapat diurungkan.</p>
                </Modal>
            )}
            {bulkDeleteConfirmation && (
                <Modal isOpen={bulkDeleteConfirmation} onClose={() => setBulkDeleteConfirmation(false)} title="Konfirmasi Hapus Handover Massal" size="md" hideDefaultCloseButton={true} footerContent={<><button onClick={() => setBulkDeleteConfirmation(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Batal</button><button type="button" onClick={handleBulkDelete} disabled={isLoading} className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-danger rounded-lg shadow-sm hover:bg-red-700 disabled:bg-red-400">{isLoading && <SpinnerIcon className="w-5 h-5 mr-2" />}Ya, Hapus ({selectedHandoverIds.length})</button></>}>
                    <p className="text-sm text-gray-600">Anda yakin ingin menghapus <span className="font-bold text-tm-dark">{selectedHandoverIds.length}</span> handover yang dipilih?</p>
                </Modal>
            )}
            {bulkCompleteConfirmation && (
                <Modal isOpen={bulkCompleteConfirmation} onClose={() => setBulkCompleteConfirmation(false)} title="Konfirmasi Selesaikan Handover" size="md" hideDefaultCloseButton={true} footerContent={<><button onClick={() => setBulkCompleteConfirmation(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Batal</button><button type="button" onClick={handleBulkComplete} disabled={isLoading} className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-success rounded-lg shadow-sm hover:bg-green-700 disabled:bg-green-400">{isLoading && <SpinnerIcon className="w-5 h-5 mr-2" />}Ya, Tandai Selesai ({actionableCompleteCount})</button></>}>
                    <p className="text-sm text-gray-600">Anda akan menandai <span className="font-bold text-tm-dark">{actionableCompleteCount}</span> handover sebagai 'Selesai'. Hanya item berstatus 'Dalam Proses' yang akan diubah.</p>
                </Modal>
            )}
        </>
    );
};

export default ItemHandover;