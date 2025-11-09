import React, { useState, useEffect, useMemo, useRef } from 'react';
// FIX: Add LoanRequest to the type import to handle prefilling from loan requests.
import { Handover, ItemStatus, HandoverItem, Asset, AssetStatus, User, ActivityLogEntry, PreviewData, Request, Division, LoanRequest } from '../../types';
import { EyeIcon } from '../../components/icons/EyeIcon';
import { TrashIcon } from '../../components/icons/TrashIcon';
import { useNotification } from '../../providers/NotificationProvider';
import { InboxIcon } from '../../components/icons/InboxIcon';
import { useSortableData, SortConfig } from '../../hooks/useSortableData';
import { SortAscIcon } from '../../components/icons/SortAscIcon';
import { SortDescIcon } from '../../components/icons/SortDescIcon';
import { SortIcon } from '../../components/icons/SortIcon';
import { exportToCSV } from '../../utils/csvExporter';
import { ExportIcon } from '../../components/icons/ExportIcon';
import { useLongPress } from '../../hooks/useLongPress';
import { Checkbox } from '../../components/ui/Checkbox';
import { SpinnerIcon } from '../../components/icons/SpinnerIcon';
import { SearchIcon } from '../../components/icons/SearchIcon';
import { CloseIcon } from '../../components/icons/CloseIcon';
import { PaginationControls } from '../../components/ui/PaginationControls';
import DatePicker from '../../components/ui/DatePicker';
import { SignatureStamp } from '../../components/ui/SignatureStamp';
import FloatingActionBar from '../../components/ui/FloatingActionBar';
import { ExclamationTriangleIcon } from '../../components/icons/ExclamationTriangleIcon';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { FilterIcon } from '../../components/icons/FilterIcon';
import { InfoIcon } from '../../components/icons/InfoIcon';
import HandoverDetailPage from './HandoverDetailPage';
// FIX: Add missing imports for Modal and CheckIcon to resolve 'Cannot find name' errors.
import Modal from '../../components/ui/Modal';
import { CheckIcon } from '../../components/icons/CheckIcon';

interface ItemHandoverPageProps {
    currentUser: User;
    handovers: Handover[];
    setHandovers: React.Dispatch<React.SetStateAction<Handover[]>>;
    assets: Asset[];
    users: User[];
    divisions: Division[];
    // FIX: Update prefillData to accept LoanRequest in addition to Asset and Request.
    prefillData?: Asset | Request | LoanRequest | null;
    onClearPrefill: () => void;
    onUpdateAsset: (assetId: string, updates: Partial<Asset>, logEntry?: Omit<ActivityLogEntry, 'id' | 'timestamp'>) => void;
    onShowPreview: (data: PreviewData) => void;
    onSave: (data: Omit<Handover, 'id' | 'status'>) => void;
    initialFilters?: any;
    onClearInitialFilters: () => void;
}

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
                    <SortableHeader columnKey="docNumber" sortConfig={sortConfig} requestSort={requestSort}>No. Dokumen / Tanggal</SortableHeader>
                    <th scope="col" className="px-6 py-3 text-sm font-semibold tracking-wider text-left text-gray-500">Pihak Terlibat</th>
                    <th scope="col" className="px-6 py-3 text-sm font-semibold tracking-wider text-left text-gray-500">Detail Barang</th>
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
                                <div className="text-sm font-semibold text-gray-900">{ho.docNumber}</div>
                                <div className="text-xs text-gray-500">{new Date(ho.handoverDate).toLocaleDateString('id-ID')}</div>
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
    currentUser: User;
    handovers: Handover[];
    onSave: (data: Omit<Handover, 'id' | 'status'>) => void; 
    assets: Asset[]; 
    users: User[];
    divisions: Division[];
    prefillData?: Asset | Request | LoanRequest | null;
    onClearPrefill: () => void;
    onUpdateAsset: (assetId: string, updates: Partial<Asset>, logEntry?: Omit<ActivityLogEntry, 'id' | 'timestamp'>) => void;
}> = ({ currentUser, handovers, onSave, assets, users, divisions, prefillData, onClearPrefill, onUpdateAsset }) => {
    const [handoverDate, setHandoverDate] = useState<Date | null>(new Date());
    const [docNumber, setDocNumber] = useState('');
    const [menyerahkan, setMenyerahkan] = useState(currentUser.name);
    const [penerima, setPenerima] = useState('');
    const [mengetahui, setMengetahui] = useState('');
    const [woRoIntNumber, setWoRoIntNumber] = useState('');
    const [items, setItems] = useState<HandoverItem[]>([
        { id: Date.now(), assetId: '', itemName: '', itemTypeBrand: '', conditionNotes: '', quantity: 1, checked: false }
    ]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFooterVisible, setIsFooterVisible] = useState(true);
    const footerRef = useRef<HTMLDivElement>(null);
    const formId = "handover-form";
    const addNotification = useNotification();
    
    const [selectedDivisionId, setSelectedDivisionId] = useState('');
    
    const isFromRequest = prefillData && 'requester' in prefillData;
    
    const divisionOptions = useMemo(() => [
        { value: '', label: '-- Pilih Divisi --' },
        ...divisions.map(d => ({ value: d.id.toString(), label: d.name }))
    ], [divisions]);

    const filteredUserOptions = useMemo(() => {
        if (!selectedDivisionId) {
            return [];
        }
        const userList = users.filter(u => u.divisionId?.toString() === selectedDivisionId);
        return userList.map(user => ({
            value: user.name,
            label: user.name
        }));
    }, [users, selectedDivisionId]);

    const handleDivisionChange = (divId: string) => {
        setSelectedDivisionId(divId);
        setPenerima(''); // Reset recipient when division changes
    };

    const ceo = useMemo(() => users.find(u => u.role === 'Super Admin'), [users]);

    const availableAssetsForSelection = useMemo(() => {
        const canAccessWarehouse = ['Admin Logistik', 'Super Admin', 'Leader'].includes(currentUser.role);

        if (isFromRequest || (!isFromRequest && canAccessWarehouse)) {
            // For requests OR if user is an admin/leader doing a manual handover,
            // assets are from central storage.
            return assets.filter(asset => asset.status === AssetStatus.IN_STORAGE);
        } else {
            // For manual handovers by Staff, assets are those belonging to them.
            return assets.filter(asset => asset.currentUser === menyerahkan && asset.status === AssetStatus.IN_USE);
        }
    }, [assets, isFromRequest, menyerahkan, currentUser.role]);

    const assetOptions = useMemo(() => {
        const prefilledAssetId = (prefillData && 'id' in prefillData && !isFromRequest) ? (prefillData as Asset).id : null;
        
        const optionAssets = [...availableAssetsForSelection];
        // Ensure the pre-filled asset is in the list, even if its status/user is slightly off.
        if (prefilledAssetId && !optionAssets.some(a => a.id === prefilledAssetId)) {
            const prefilledAsset = assets.find(a => a.id === prefilledAssetId);
            if (prefilledAsset) {
                optionAssets.push(prefilledAsset);
            }
        }

        return optionAssets.map(asset => {
            let labelSuffix = '';
            if (asset.status === AssetStatus.IN_STORAGE) labelSuffix = ' - Di Gudang';
            return {
                value: asset.id,
                label: `${asset.name} (${asset.id})${labelSuffix}`
            };
        });
    }, [availableAssetsForSelection, prefillData, assets, isFromRequest]);

    const getDivisionForUser = (userName: string): string => {
        if (!userName) return '';
        const user = users.find(u => u.name === userName);
        if (!user || !user.divisionId) return '';
        const division = divisions.find(d => d.id === user.divisionId);
        return division ? `Divisi ${division.name}` : '';
    };

    useEffect(() => {
        const now = new Date();
        const year = now.getFullYear().toString().slice(-2);
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const datePrefix = `${year}${month}${day}`;

        // Determine the prefix based on whether it's from a request
        const isFromAnyRequest = prefillData && 'requester' in prefillData;
        const prefix = isFromAnyRequest ? `HO-RO-${datePrefix}` : `HO-${datePrefix}`;

        const todayHandovers = handovers.filter(h => {
            if (!h.docNumber) return false;
            // Check if the docNumber starts with either of today's possible prefixes
            return h.docNumber.startsWith(`HO-RO-${datePrefix}`) || h.docNumber.startsWith(`HO-${datePrefix}`);
        });

        const highestSequence = todayHandovers.reduce((max, h) => {
            const parts = h.docNumber.split('-');
            const sequence = parseInt(parts[parts.length - 1], 10); // Always take the last part
            return sequence > max ? sequence : max;
        }, 0);
        
        const newSequence = (highestSequence + 1).toString().padStart(3, '0');
        const newDocNumber = `${prefix}-${newSequence}`;
        
        setDocNumber(newDocNumber);
    }, [handovers, prefillData]);

    useEffect(() => {
        setMenyerahkan(currentUser.name);
    }, [currentUser]);

    useEffect(() => {
        if (ceo) {
            setMengetahui(ceo.name);
        }
    }, [ceo]);

    // FIX: Update useEffect to differentiate between Request and LoanRequest for prefilling form data.
    useEffect(() => {
        if (prefillData) {
            if ('requester' in prefillData) { // It's a Request or LoanRequest object
                if ('order' in prefillData) { // It's a Request object
                    const request = prefillData;
                    const recipientUser = users.find(u => u.name === request.requester);
                    if (recipientUser) {
                        setPenerima(recipientUser.name);
                        setSelectedDivisionId(recipientUser.divisionId?.toString() || '');
                    }
                    setWoRoIntNumber(request.id);
                    
                    const registeredAssets = assets.filter(asset => 
                        asset.woRoIntNumber === request.id && asset.status === AssetStatus.IN_STORAGE
                    );

                    if (registeredAssets.length > 0) {
                        setItems(registeredAssets.map(asset => ({
                            id: Date.now() + Math.random(),
                            assetId: asset.id,
                            itemName: asset.name,
                            itemTypeBrand: asset.brand,
                            conditionNotes: asset.condition,
                            quantity: 1,
                            checked: true
                        })));
                    } else {
                            setItems(request.items.map(item => ({
                            id: Date.now() + Math.random(),
                            assetId: '', 
                            itemName: item.itemName,
                            itemTypeBrand: item.itemTypeBrand,
                            conditionNotes: 'Kondisi baik (dari stok)',
                            quantity: item.quantity,
                            checked: true
                        })));
                            addNotification('Aset yang baru dicatat tidak ditemukan di gudang. Harap pilih secara manual.', 'warning');
                    }
                } else { // It's a LoanRequest object
                    const loanRequest = prefillData as LoanRequest;
                    const recipientUser = users.find(u => u.name === loanRequest.requester);
                    if (recipientUser) {
                        setPenerima(recipientUser.name);
                        setSelectedDivisionId(recipientUser.divisionId?.toString() || '');
                    }
                    setWoRoIntNumber(loanRequest.id);

                    if (loanRequest.assignedAssetIds) {
                        const assignedAssetIdsFlat = Object.values(loanRequest.assignedAssetIds).flat();
                        const assignedAssets = assets.filter(asset => assignedAssetIdsFlat.includes(asset.id));
                        if (assignedAssets.length > 0) {
                            setItems(assignedAssets.map(asset => ({
                                id: Date.now() + Math.random(),
                                assetId: asset.id,
                                itemName: asset.name,
                                itemTypeBrand: asset.brand,
                                conditionNotes: asset.condition,
                                quantity: 1,
                                checked: true
                            })));
                        }
                    } else {
                        setItems(loanRequest.items.map(item => ({
                            id: Date.now() + Math.random(),
                            assetId: '',
                            itemName: item.itemName,
                            itemTypeBrand: item.brand,
                            conditionNotes: 'Kondisi baik (dari stok)',
                            quantity: item.quantity,
                            checked: true
                        })));
                        addNotification('Aset untuk pinjaman ini belum ditetapkan oleh admin. Harap pilih secara manual.', 'warning');
                    }
                }
            } else { // It's an Asset object
                setItems([{
                    id: Date.now(),
                    assetId: prefillData.id,
                    itemName: prefillData.name,
                    itemTypeBrand: prefillData.brand,
                    conditionNotes: prefillData.condition,
                    quantity: 1,
                    checked: true,
                }]);
                setMenyerahkan(prefillData.currentUser || currentUser.name);
            }
        }
    }, [prefillData, currentUser.name, assets, addNotification, users]);

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
        const selectedAsset = assets.find(asset => asset.id === selectedAssetId);
        
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
        if (items.some(item => !item.assetId)) {
            addNotification('Harap pilih aset untuk semua item.', 'error');
            return;
        }
        if (!penerima) {
            addNotification('Penerima tidak boleh kosong.', 'error');
            return;
        }
        setIsSubmitting(true);
        setTimeout(() => {
            onSave({
                docNumber: docNumber,
                handoverDate: handoverDate!.toISOString().split('T')[0],
                menyerahkan,
                penerima,
                mengetahui,
                woRoIntNumber,
                items,
            });
            setIsSubmitting(false);
        }, 1000);
    };
    
    const ActionButtons: React.FC<{ formId?: string }> = ({ formId }) => (
        <button 
            type="submit" 
            form={formId}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 rounded-lg shadow-sm bg-tm-primary hover:bg-tm-primary-hover disabled:bg-tm-primary/70 disabled:cursor-not-allowed">
             {isSubmitting ? <SpinnerIcon className="w-5 h-5 mr-2" /> : null}
            {isSubmitting ? 'Memproses...' : 'Proses Handover'}
        </button>
    );

    return (
        <>
            <form id={formId} onSubmit={handleSubmit} className="space-y-6">
                <div className="mb-6 space-y-2 text-center">
                    <h4 className="text-xl font-bold text-tm-dark">TRINITY MEDIA INDONESIA</h4>
                    <p className="font-semibold text-tm-secondary">BERITA ACARA SERAH TERIMA BARANG (INTERNAL)</p>
                </div>
                
                {isFromRequest && (
                    <div className="p-4 mb-4 border-l-4 rounded-r-lg bg-blue-50 border-tm-primary">
                        <div className="flex items-start gap-3">
                            <InfoIcon className="flex-shrink-0 w-5 h-5 mt-0.5 text-tm-primary" />
                            <p className="text-sm text-blue-800">
                                <strong>Info:</strong> Penerima, divisi, dan detail barang telah diatur secara otomatis berdasarkan data dari request aset asli
                                (<span className="font-mono">{woRoIntNumber}</span>) untuk memastikan akurasi data.
                            </p>
                        </div>
                    </div>
                )}
                
                <div className="p-4 border-t border-b border-gray-200">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tanggal</label>
                            <DatePicker id="handoverDate" selectedDate={handoverDate} onDateChange={setHandoverDate} />
                        </div>
                        <div>
                            <label htmlFor="docNumber" className="block text-sm font-medium text-gray-700">No. Dokumen</label>
                            <input 
                                type="text" 
                                id="docNumber" 
                                value={docNumber}
                                readOnly
                                className="block w-full px-3 py-2 mt-1 text-gray-700 bg-gray-100 border border-gray-200 rounded-lg shadow-sm sm:text-sm" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">No. Referensi (WO/RO/Request)</label>
                            <input type="text" value={woRoIntNumber} onChange={e => setWoRoIntNumber(e.target.value)} className="block w-full px-3 py-2 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-tm-accent focus:border-tm-accent sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Divisi</label>
                             <CustomSelect 
                                options={divisionOptions} 
                                value={selectedDivisionId}
                                onChange={handleDivisionChange}
                                disabled={isFromRequest}
                            />
                        </div>
                         <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Penerima</label>
                            <CustomSelect 
                                options={filteredUserOptions} 
                                value={penerima} 
                                onChange={setPenerima} 
                                placeholder={selectedDivisionId ? "-- Pilih Nama Penerima --" : "Pilih divisi terlebih dahulu"}
                                disabled={!selectedDivisionId || isFromRequest}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-tm-dark">Detail Barang</h3>
                     <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">Daftar aset yang diserahterimakan.</p>
                        <button type="button" onClick={handleAddItem} disabled={isFromRequest} className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 rounded-lg shadow-sm bg-tm-accent hover:bg-tm-primary disabled:bg-gray-400 disabled:cursor-not-allowed">
                            Tambah Aset
                        </button>
                    </div>

                    <div className="space-y-4">
                        {items.map((item, index) => (
                             <div key={item.id} className="relative p-5 pt-6 bg-white border border-gray-200 rounded-xl shadow-sm">
                                <div className="absolute flex items-center justify-center w-8 h-8 font-bold text-white rounded-full -top-4 -left-4 bg-tm-primary">
                                    {index + 1}
                                </div>
                                {items.length > 1 && !isFromRequest && (
                                    <div className="absolute top-2 right-2">
                                        <button type="button" onClick={() => handleRemoveItem(item.id)} className="flex items-center justify-center w-8 h-8 text-gray-400 transition-colors rounded-full hover:bg-red-100 hover:text-red-500">
                                            <TrashIcon className="w-5 h-5"/>
                                        </button>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-600">Pilih Aset</label>
                                        <CustomSelect options={assetOptions} value={item.assetId || ''} onChange={value => handleAssetSelection(item.id, value)} placeholder="-- Pilih Aset dari Stok --" disabled={isFromRequest} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600">Nama Barang</label>
                                        <input type="text" value={item.itemName} readOnly className="block w-full px-3 py-2 mt-1 text-gray-700 bg-gray-100 border border-gray-200 rounded-lg shadow-sm sm:text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600">Tipe/Brand</label>
                                        <input type="text" value={item.itemTypeBrand} readOnly className="block w-full px-3 py-2 mt-1 text-gray-700 bg-gray-100 border border-gray-200 rounded-lg shadow-sm sm:text-sm" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-600">Catatan Kondisi</label>
                                        <input type="text" value={item.conditionNotes} onChange={e => handleItemChange(item.id, 'conditionNotes', e.target.value)} className="block w-full px-3 py-2 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg shadow-sm sm:text-sm" placeholder="Contoh: Baik, lengkap dengan aksesoris" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pt-8 mt-6 border-t border-gray-200">
                     <div className="grid grid-cols-1 text-center gap-y-8 md:grid-cols-3 md:gap-x-8">
                        <div>
                            <p className="font-medium text-gray-700">Yang Menyerahkan</p>
                            <div className="flex items-center justify-center mt-2 h-28">
                                {menyerahkan && <SignatureStamp signerName={menyerahkan} signatureDate={handoverDate?.toISOString() || ''} signerDivision={getDivisionForUser(menyerahkan)} />}
                            </div>
                            <div className="pt-1 mt-2 border-t border-gray-400">
                                <p className="w-full p-1 text-sm text-center text-gray-800 rounded-md">{menyerahkan || 'Nama Jelas'}</p>
                            </div>
                        </div>
                        <div>
                            <p className="font-medium text-gray-700">Penerima</p>
                            <div className="flex items-center justify-center mt-2 h-28">
                                {penerima ? <SignatureStamp signerName={penerima} signatureDate={handoverDate?.toISOString() || ''} signerDivision={getDivisionForUser(penerima)} /> : <span className="text-sm italic text-gray-400">Pilih penerima di atas</span>}
                            </div>
                             <div className="pt-1 mt-2 border-t border-gray-400">
                                <p className="w-full p-1 text-sm text-center text-gray-800 rounded-md">{penerima || 'Nama Jelas'}</p>
                            </div>
                        </div>
                        <div>
                            <p className="font-medium text-gray-700">Mengetahui</p>
                            <div className="flex items-center justify-center mt-2 h-28">
                                {mengetahui && <SignatureStamp signerName={mengetahui} signatureDate={handoverDate?.toISOString() || ''} signerDivision={getDivisionForUser(mengetahui)} />}
                            </div>
                            <div className="pt-1 mt-2 border-t border-gray-400">
                                <p className="w-full p-1 text-sm text-center text-gray-800 rounded-md">{mengetahui || 'Nama Jelas'}</p>
                            </div>
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

const ItemHandoverPage: React.FC<ItemHandoverPageProps> = (props) => {
    const { currentUser, handovers, setHandovers, assets, users, divisions, prefillData, onClearPrefill, onUpdateAsset, onShowPreview, onSave, initialFilters, onClearInitialFilters } = props;

    const [view, setView] = useState<'list' | 'form' | 'detail'>('list');
    const [selectedHandover, setSelectedHandover] = useState<Handover | null>(null);
    const [handoverToDeleteId, setHandoverToDeleteId] = useState<string | null>(null);
    const [bulkDeleteConfirmation, setBulkDeleteConfirmation] = useState(false);
    const [isBulkSelectMode, setIsBulkSelectMode] = useState(false);
    const [selectedHandoverIds, setSelectedHandoverIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [bulkCompleteConfirmation, setBulkCompleteConfirmation] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const initialFilterState = { status: '' };
    const [filters, setFilters] = useState(initialFilterState);
    const [tempFilters, setTempFilters] = useState(filters);
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const filterPanelRef = useRef<HTMLDivElement>(null);
    
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const addNotification = useNotification();
    
    useEffect(() => {
        if (prefillData) setView('form');
    }, [prefillData]);
    
    useEffect(() => {
        if (initialFilters?.view === 'list') {
            setView('list');
            onClearInitialFilters(); // Consume the state
        }
    }, [initialFilters, onClearInitialFilters]);

    const handleSetView = (newView: 'list' | 'form' | 'detail') => {
        if (newView === 'list' && prefillData) onClearPrefill();
        setView(newView);
    };

    const handleShowDetails = (handover: Handover) => {
        setSelectedHandover(handover);
        setView('detail');
    };
    
    const handleCompleteHandover = () => {
        if (!selectedHandover) return;
        setIsLoading(true);

        setTimeout(() => {
            const updatedHandover: Handover = { ...selectedHandover, status: ItemStatus.COMPLETED };
            
            setHandovers(prev => prev.map(d => d.id === updatedHandover.id ? updatedHandover : d));

            addNotification('Handover telah diselesaikan.', 'success');
            setIsLoading(false);
            setView('list');
            setSelectedHandover(null);
        }, 1000);
    }
    
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
        return Object.values(filters).filter(Boolean).length;
    }, [filters]);

    const handleResetFilters = () => {
        setFilters(initialFilterState);
        setTempFilters(initialFilterState);
        setIsFilterPanelOpen(false);
    };

    const handleApplyFilters = () => {
        setFilters(tempFilters);
        setIsFilterPanelOpen(false);
    };

    const handleCancelBulkMode = () => {
        setIsBulkSelectMode(false);
        setSelectedHandoverIds([]);
    };

    const actionableCounts = useMemo(() => {
        if (!isBulkSelectMode) return { completeCount: 0, deleteCount: 0 };
        const selected = handovers.filter(h => selectedHandoverIds.includes(h.id));
        
        const canComplete = (ho: Handover) => ho.status === ItemStatus.IN_PROGRESS;

        return {
            completeCount: selected.filter(canComplete).length,
            deleteCount: selected.length,
        };
    }, [handovers, selectedHandoverIds, isBulkSelectMode]);


    const filteredHandovers = useMemo(() => {
        let tempHandovers = handovers;

        if (currentUser.role === 'Staff') {
            tempHandovers = tempHandovers.filter(ho => ho.menyerahkan === currentUser.name || ho.penerima === currentUser.name);
        }

        return tempHandovers.filter(ho => {
            const searchLower = searchQuery.toLowerCase();
            return (
                ho.docNumber.toLowerCase().includes(searchLower) ||
                ho.menyerahkan.toLowerCase().includes(searchLower) ||
                ho.penerima.toLowerCase().includes(searchLower) ||
                ho.items.some(item => item.itemName.toLowerCase().includes(searchLower))
            );
        }).filter(ho => filters.status ? ho.status === filters.status : true);
    }, [handovers, searchQuery, filters, currentUser]);

    const { items: sortedHandovers, requestSort, sortConfig } = useSortableData(filteredHandovers, { key: 'handoverDate', direction: 'descending' });

    const totalItems = sortedHandovers.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedHandovers = sortedHandovers.slice(startIndex, endIndex);

    useEffect(() => { setCurrentPage(1); }, [searchQuery, filters, itemsPerPage]);

    const handleConfirmDelete = () => {
        if (!handoverToDeleteId) return;
        setIsLoading(true);
        setTimeout(() => {
            setHandovers(prev => prev.filter(h => h.id !== handoverToDeleteId));
            addNotification(`Handover ${handoverToDeleteId} berhasil dihapus.`, 'success');
            setHandoverToDeleteId(null);
            setIsLoading(false);
        }, 1000);
    };

    const handleBulkDelete = () => {
        setIsLoading(true);
        setTimeout(() => {
            setHandovers(prev => prev.filter(h => !selectedHandoverIds.includes(h.id)));
            addNotification(`${selectedHandoverIds.length} handover berhasil dihapus.`, 'success');
            setBulkDeleteConfirmation(false);
            handleCancelBulkMode();
            setIsLoading(false);
        }, 1000);
    };
    
    const handleBulkComplete = () => {
        setIsLoading(true);
        setTimeout(() => {
            let completedCount = 0;
            setHandovers(prev => prev.map(ho => {
                if (selectedHandoverIds.includes(ho.id) && ho.status === ItemStatus.IN_PROGRESS) {
                    completedCount++;
                    return { ...ho, status: ItemStatus.COMPLETED };
                }
                return ho;
            }));

            if (completedCount > 0) {
                addNotification(`${completedCount} handover berhasil diselesaikan.`, 'success');
            } else {
                addNotification('Tidak ada handover yang dapat diselesaikan (status bukan "Dalam Proses").', 'error');
            }

            setBulkCompleteConfirmation(false);
            handleCancelBulkMode();
            setIsLoading(false);
        }, 1000);
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedHandoverIds(paginatedHandovers.map(h => h.id));
        } else {
            setSelectedHandoverIds([]);
        }
    };
    
    const handleSelectOne = (id: string) => {
        setSelectedHandoverIds(prev => prev.includes(id) ? prev.filter(hid => hid !== id) : [...prev, id]);
    };
    
    const statusOptions = Object.values(ItemStatus).filter(s => [ItemStatus.COMPLETED, ItemStatus.IN_PROGRESS, ItemStatus.PENDING].includes(s)).map(s => ({ value: s, label: s }));

    const renderContent = () => {
        if (view === 'form') {
            return (
                <div className="p-4 sm:p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl font-bold text-tm-dark">Buat Berita Acara Handover</h1>
                        <button onClick={() => handleSetView('list')} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">
                            Kembali ke Daftar
                        </button>
                    </div>
                    <div className="p-4 sm:p-6 bg-white border border-gray-200/80 rounded-xl shadow-md">
                        <HandoverForm {...props} onSave={onSave} />
                    </div>
                </div>
            );
        }

        if (view === 'detail' && selectedHandover) {
            return (
                <HandoverDetailPage
                    handover={selectedHandover}
                    currentUser={currentUser}
                    onBackToList={() => {
                        setView('list');
                        setSelectedHandover(null);
                    }}
                    users={users}
                    divisions={divisions}
                    onShowPreview={onShowPreview}
                    onComplete={handleCompleteHandover}
                    isLoading={isLoading}
                />
            );
        }

        return (
            <div className="p-4 sm:p-6 md:p-8">
                <div className="flex flex-col items-start justify-between gap-4 mb-6 md:flex-row md:items-center">
                    <h1 className="text-3xl font-bold text-tm-dark">Daftar Handover Aset</h1>
                    <div className="flex items-center space-x-2">
                        <button onClick={() => exportToCSV(sortedHandovers, 'handover_aset.csv')} className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border rounded-lg shadow-sm hover:bg-gray-50">
                            <ExportIcon className="w-4 h-4"/> Export CSV
                        </button>
                        <button onClick={() => handleSetView('form')} className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 rounded-lg shadow-sm bg-tm-primary hover:bg-tm-primary-hover">
                            Buat Handover Baru
                        </button>
                    </div>
                </div>

                <div className="p-4 mb-4 bg-white border border-gray-200/80 rounded-xl shadow-md">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative flex-grow">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><SearchIcon className="w-5 h-5 text-gray-400" /></div>
                            <input type="text" placeholder="Cari No. Dokumen, Pihak, Barang..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full h-10 py-2 pl-10 pr-4 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-tm-accent focus:border-tm-accent" />
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
                                            <h3 className="text-lg font-semibold text-gray-800">Filter Handover</h3>
                                            <button onClick={() => setIsFilterPanelOpen(false)} className="p-1 text-gray-400 rounded-full hover:bg-gray-100"><CloseIcon className="w-5 h-5"/></button>
                                        </div>
                                        <div className="p-4 space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                                                <div className="space-y-2">
                                                    {statusOptions.map(opt => (
                                                        <button key={opt.value} type="button" onClick={() => setTempFilters(f => ({ ...f, status: f.status === opt.value ? '' : opt.value }))}
                                                            className={`w-full px-3 py-2 text-sm rounded-md border text-left transition-colors ${ tempFilters.status === opt.value ? 'bg-tm-primary border-tm-primary text-white font-semibold' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50' }`}>
                                                            {opt.label}
                                                        </button>
                                                    ))}
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
                </div>

                 {isBulkSelectMode && (
                    <div className="p-4 mb-4 bg-blue-50 border-l-4 border-tm-accent rounded-r-lg">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                             {selectedHandoverIds.length > 0 ? (
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="text-sm font-medium text-tm-primary">{selectedHandoverIds.length} item terpilih</span>
                                    <div className="h-5 border-l border-gray-300"></div>
                                    <button
                                        onClick={() => setBulkCompleteConfirmation(true)}
                                        disabled={actionableCounts.completeCount === 0}
                                        className="px-3 py-1.5 text-sm font-semibold text-success-text bg-success-light rounded-md hover:bg-green-200 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                                    >
                                        Selesaikan {actionableCounts.completeCount > 0 ? `(${actionableCounts.completeCount})` : ''}
                                    </button>
                                    <button
                                        onClick={() => setBulkDeleteConfirmation(true)}
                                        disabled={actionableCounts.deleteCount === 0}
                                        className="px-3 py-1.5 text-sm font-semibold text-danger-text bg-danger-light rounded-md hover:bg-red-200 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                                    >
                                        Hapus {actionableCounts.deleteCount > 0 ? `(${actionableCounts.deleteCount})` : ''}
                                    </button>
                                </div>
                            ) : (
                                <span className="text-sm text-gray-500">Pilih item untuk memulai aksi massal. Tekan tahan pada baris untuk memulai.</span>
                            )}
                            <button onClick={handleCancelBulkMode} className="px-3 py-1.5 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
                                Batal
                            </button>
                        </div>
                    </div>
                )}

                <div className="overflow-hidden bg-white border border-gray-200/80 rounded-xl shadow-md">
                    <div className="overflow-x-auto custom-scrollbar">
                        <HandoverTable handovers={paginatedHandovers} onDetailClick={handleShowDetails} onDeleteClick={setHandoverToDeleteId} sortConfig={sortConfig} requestSort={requestSort} selectedHandoverIds={selectedHandoverIds} onSelectAll={handleSelectAll} onSelectOne={handleSelectOne} isBulkSelectMode={isBulkSelectMode} onEnterBulkMode={() => setIsBulkSelectMode(true)} />
                    </div>
                    <PaginationControls currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} onItemsPerPageChange={size => { setItemsPerPage(size); setCurrentPage(1);}} startIndex={startIndex} endIndex={endIndex} />
                </div>
            </div>
        );
    };

    return (
        <div className={view === 'form' ? 'pb-24' : ''}>
            {renderContent()}

            {handoverToDeleteId && (
                <Modal isOpen={!!handoverToDeleteId} onClose={() => setHandoverToDeleteId(null)} title="Konfirmasi Hapus" hideDefaultCloseButton>
                    <div className="text-center">
                        <ExclamationTriangleIcon className="w-12 h-12 mx-auto text-red-500" />
                        <h3 className="mt-4 text-lg font-semibold text-gray-800">Hapus Data Handover?</h3>
                        <p className="mt-2 text-sm text-gray-600">Anda yakin ingin menghapus data handover <strong>{handoverToDeleteId}</strong>? Tindakan ini tidak dapat diurungkan.</p>
                    </div>
                    <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                        <button onClick={() => setHandoverToDeleteId(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Batal</button>
                        <button onClick={handleConfirmDelete} disabled={isLoading} className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-danger rounded-lg shadow-sm hover:bg-red-700">
                            {isLoading && <SpinnerIcon className="w-4 h-4 mr-2"/>} Hapus
                        </button>
                    </div>
                </Modal>
            )}
            
            {bulkDeleteConfirmation && (
                <Modal isOpen={bulkDeleteConfirmation} onClose={() => setBulkDeleteConfirmation(false)} title="Konfirmasi Hapus Massal" hideDefaultCloseButton>
                     <div className="text-center">
                        <ExclamationTriangleIcon className="w-12 h-12 mx-auto text-red-500" />
                        <h3 className="mt-4 text-lg font-semibold text-gray-800">Hapus {selectedHandoverIds.length} Data Handover?</h3>
                        <p className="mt-2 text-sm text-gray-600">Anda yakin ingin menghapus semua data handover yang dipilih? Aksi ini tidak dapat diurungkan.</p>
                    </div>
                    <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                        <button onClick={() => setBulkDeleteConfirmation(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Batal</button>
                        <button onClick={handleBulkDelete} disabled={isLoading} className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-danger rounded-lg shadow-sm hover:bg-red-700">
                           {isLoading && <SpinnerIcon className="w-4 h-4 mr-2"/>} Ya, Hapus
                        </button>
                    </div>
                </Modal>
            )}

            {bulkCompleteConfirmation && (
                 <Modal isOpen={bulkCompleteConfirmation} onClose={() => setBulkCompleteConfirmation(false)} title="Konfirmasi Selesaikan Massal" hideDefaultCloseButton>
                    <div className="text-center">
                        <CheckIcon className="w-12 h-12 mx-auto text-success" />
                        <h3 className="mt-4 text-lg font-semibold text-gray-800">Selesaikan {actionableCounts.completeCount} Handover?</h3>
                        <p className="mt-2 text-sm text-gray-600">Anda akan mengubah status handover yang dipilih menjadi "Selesai".</p>
                    </div>
                    <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                        <button onClick={() => setBulkCompleteConfirmation(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Batal</button>
                        <button onClick={handleBulkComplete} disabled={isLoading} className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-success rounded-lg shadow-sm hover:bg-green-700">
                           {isLoading && <SpinnerIcon className="w-4 h-4 mr-2"/>} Ya, Selesaikan
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
};
export default ItemHandoverPage;