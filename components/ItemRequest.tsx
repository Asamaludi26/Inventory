import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Request, ItemStatus, RequestItem, User, AssetStatus, Asset } from '../types';
import Modal from './shared/Modal';
import { CloseIcon } from './icons/CloseIcon';
import DatePicker from './shared/DatePicker';
import { ApprovalStamp } from './shared/ApprovalStamp';
import { RejectionStamp } from './shared/RejectionStamp';
import { SignatureStamp } from './shared/SignatureStamp';
import { EyeIcon } from './icons/EyeIcon';
import { TrashIcon } from './icons/TrashIcon';
import FloatingActionBar from './shared/FloatingActionBar';
import { useNotification } from './shared/Notification';
import { InboxIcon } from './icons/InboxIcon';
import { useSortableData, SortConfig } from '../hooks/useSortableData';
import { SortAscIcon } from './icons/SortAscIcon';
import { SortDescIcon } from './icons/SortDescIcon';
import { SortIcon } from './icons/SortIcon';
import { exportToCSV } from '../utils/csvExporter';
import { ExportIcon } from './icons/ExportIcon';
import { Checkbox } from './shared/Checkbox';
import { useLongPress } from '../hooks/useLongPress';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { SearchIcon } from './icons/SearchIcon';
import { PaginationControls } from './shared/PaginationControls';
import { RegisterIcon } from './icons/RegisterIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { Tooltip } from './shared/Tooltip';
import { ClickableLink } from './shared/ClickableLink';
import { PreviewData } from './shared/PreviewModal';


interface ItemRequestProps {
    currentUser: User;
    requests: Request[];
    setRequests: React.Dispatch<React.SetStateAction<Request[]>>;
    assets: Asset[];
    onInitiateRegistration: (request: Request) => void;
    initialFilters?: any;
    onClearInitialFilters: () => void;
    onShowPreview: (data: PreviewData) => void;
}

export const initialMockRequests: Request[] = Array.from({ length: 120 }, (_, i) => {
    const userPool = ['Evan Davis', 'Diana Miller', 'Charlie Brown', 'Bob Williams', 'Ivy Martinez', 'Grace Lee', 'Henry Wilson', 'Jack Taylor', 'Andi Susanto', 'Budi Wijaya', 'Citra Lestari'];
    const divisionPool = ['NOC', 'Marketing', 'Engineer', 'Inventori', 'Finance', 'Sales'];
    const itemPool = [
        { name: 'Laptop Dell XPS 15', brand: 'Dell', stock: 5 },
        { name: 'Access Point U6 Lite', brand: 'Ubiquiti', stock: 20 },
        { name: 'Optical Power Meter', brand: 'Joinwit', stock: 15 },
        { name: 'Monitor 27" LG', brand: 'LG', stock: 10 },
        { name: 'ONT HG8245H', brand: 'Huawei', stock: 50 },
        { name: 'Kabel UTP 305m', brand: 'Belden', stock: 8 },
        { name: 'Router Core RB4011', brand: 'Mikrotik', stock: 3 },
        { name: 'Patch Cord SC-UPC 3m', brand: 'Generic', stock: 100 },
        { name: 'HTB 3100 A/B', brand: 'Netlink', stock: 40 },
        { name: 'IP Phone GXP1625', brand: 'Grandstream', stock: 12 },
    ];
    const statuses = [ItemStatus.APPROVED, ItemStatus.PENDING, ItemStatus.LOGISTIC_APPROVED, ItemStatus.REJECTED, ItemStatus.COMPLETED, ItemStatus.PENDING, ItemStatus.APPROVED];
    
    const status = statuses[i % statuses.length];
    const requester = userPool[i % userPool.length];
    const division = divisionPool[i % divisionPool.length];
    const requestDate = new Date(2024, 7, 15 - (i % 30)).toISOString().split('T')[0];
    
    const numItems = (i % 5 === 0) ? Math.floor(Math.random() * 2) + 2 : 1;
    const items: RequestItem[] = [];
    for (let j = 0; j < numItems; j++) {
        const selectedItem = itemPool[(i + j) % itemPool.length];
        const quantity = Math.floor(Math.random() * 5) + 1;
        items.push({
            id: j + 1,
            itemName: selectedItem.name,
            itemTypeBrand: selectedItem.brand,
            stock: selectedItem.stock,
            quantity,
            keterangan: `Kebutuhan untuk project ${division} #${i+1}`
        });
    }

    const request: Request = {
        id: `REQ-${String(120 - i).padStart(3, '0')}`,
        requester,
        division,
        requestDate,
        status,
        order: ['Regular Stock', 'Urgent', 'Project Based'][i % 3],
        lembar: ['1. Logistic', '2. Divisi', '3. Purchase'][i % 3] as any,
        items,
        logisticApprover: null,
        logisticApprovalDate: null,
        finalApprover: null,
        finalApprovalDate: null,
        rejectionReason: null,
        rejectedBy: null,
        rejectionDate: null,
        rejectedByDivision: null,
        isRegistered: false,
    };

    if (status === ItemStatus.LOGISTIC_APPROVED || status === ItemStatus.APPROVED || status === ItemStatus.COMPLETED) {
        request.logisticApprover = 'Alice Johnson';
        request.logisticApprovalDate = new Date(new Date(requestDate).getTime() + 86400000).toISOString().split('T')[0];
    }
    if (status === ItemStatus.APPROVED || status === ItemStatus.COMPLETED) {
        request.finalApprover = 'John Doe';
        request.finalApprovalDate = new Date(new Date(request.logisticApprovalDate!).getTime() + 86400000).toISOString().split('T')[0];
    }
    if (status === ItemStatus.COMPLETED) {
        request.isRegistered = true;
    }
    if (status === ItemStatus.REJECTED) {
        request.rejectedBy = 'Alice Johnson';
        request.rejectionDate = new Date(new Date(requestDate).getTime() + 86400000).toISOString().split('T')[0];
        request.rejectionReason = 'Stok tidak mencukupi untuk permintaan saat ini.';
        request.rejectedByDivision = 'Divisi Inventori';
    }

    return request;
});


// FIX: Export getStatusClass to be used in other components.
export const getStatusClass = (status: ItemStatus) => {
    switch (status) {
        case ItemStatus.APPROVED: return 'bg-success-light text-success-text';
        case ItemStatus.COMPLETED: return 'bg-gray-200 text-gray-800';
        case ItemStatus.LOGISTIC_APPROVED: return 'bg-info-light text-info-text';
        case ItemStatus.PENDING: return 'bg-warning-light text-warning-text';
        case ItemStatus.REJECTED: return 'bg-danger-light text-danger-text';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const SortableHeader: React.FC<{
    children: React.ReactNode;
    columnKey: keyof Request;
    sortConfig: SortConfig<Request> | null;
    requestSort: (key: keyof Request) => void;
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

interface RequestTableProps {
    requests: Request[];
    onDetailClick: (request: Request) => void;
    onDeleteClick: (id: string) => void;
    sortConfig: SortConfig<Request> | null;
    requestSort: (key: keyof Request) => void;
    selectedRequestIds: string[];
    onSelectOne: (id: string) => void;
    onSelectAll: (event: React.ChangeEvent<HTMLInputElement>) => void;
    isBulkSelectMode: boolean;
    onEnterBulkMode: () => void;
}

const RequestTable: React.FC<RequestTableProps> = ({ requests, onDetailClick, onDeleteClick, sortConfig, requestSort, selectedRequestIds, onSelectOne, onSelectAll, isBulkSelectMode, onEnterBulkMode }) => {
    const longPressHandlers = useLongPress(onEnterBulkMode, 500);

    const handleRowClick = (req: Request) => {
        if (isBulkSelectMode) {
            onSelectOne(req.id);
        } else {
            onDetailClick(req);
        }
    };

    return (
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="sticky top-0 z-10 bg-gray-50">
                <tr>
                    {isBulkSelectMode && (
                        <th scope="col" className="px-6 py-3">
                            <Checkbox
                                checked={selectedRequestIds.length === requests.length && requests.length > 0}
                                onChange={onSelectAll}
                                aria-label="Pilih semua request"
                            />
                        </th>
                    )}
                    <SortableHeader columnKey="id" sortConfig={sortConfig} requestSort={requestSort}>ID / Tanggal</SortableHeader>
                    <SortableHeader columnKey="requester" sortConfig={sortConfig} requestSort={requestSort}>Pemohon</SortableHeader>
                    <th scope="col" className="px-6 py-3 text-sm font-semibold tracking-wider text-left text-gray-500">Detail Permintaan</th>
                    <SortableHeader columnKey="status" sortConfig={sortConfig} requestSort={requestSort}>Status</SortableHeader>
                    <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Aksi</span>
                    </th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {requests.length > 0 ? (
                    requests.map((req) => (
                        <tr 
                            key={req.id}
                            {...longPressHandlers}
                            onClick={() => handleRowClick(req)}
                            className={`transition-colors cursor-pointer ${selectedRequestIds.includes(req.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                        >
                            {isBulkSelectMode && (
                                <td className="px-6 py-4 align-top" onClick={(e) => e.stopPropagation()}>
                                    <Checkbox
                                        checked={selectedRequestIds.includes(req.id)}
                                        onChange={() => onSelectOne(req.id)}
                                        aria-labelledby={`request-id-${req.id}`}
                                    />
                                </td>
                            )}
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-semibold text-gray-900">{req.id}</div>
                                <div className="text-xs text-gray-500">{req.requestDate}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{req.requester}</div>
                                <div className="text-xs text-gray-500">{req.division}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                                <div className="font-medium text-gray-800">
                                    {req.items.length} item
                                </div>
                                <div className="text-xs truncate text-gray-500 max-w-[200px]" title={req.items[0]?.itemName}>
                                    {req.items[0]?.itemName}{req.items.length > 1 ? ', ...' : ''}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(req.status)}`}>
                                    {req.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                                <div className="flex items-center justify-end space-x-2">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onDetailClick(req); }}
                                        className="flex items-center justify-center w-8 h-8 text-gray-500 transition-colors bg-gray-100 rounded-full hover:bg-info-light hover:text-info-text"
                                        title="Lihat Detail"
                                    >
                                      <EyeIcon className="w-5 h-5"/>
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); onDeleteClick(req.id); }} className="flex items-center justify-center w-8 h-8 text-gray-500 transition-colors bg-gray-100 rounded-full hover:bg-danger-light hover:text-danger-text" title="Hapus">
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
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak Ada Data Request</h3>
                                <p className="mt-1 text-sm text-gray-500">Ubah filter atau buat request baru.</p>
                            </div>
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    );
};

type RequestItemForm = Omit<RequestItem, 'id'> & { id: number };

const RequestForm: React.FC<{ 
    currentUser: User; 
    assets: Asset[];
    onCreateRequest: (data: Omit<Request, 'id' | 'status' | 'logisticApprover' | 'logisticApprovalDate' | 'finalApprover' | 'finalApprovalDate' | 'rejectionReason' | 'rejectedBy' | 'rejectionDate' | 'rejectedByDivision'>) => void;
    prefillItem: { name: string; brand: string } | null;
}> = ({ currentUser, assets, onCreateRequest, prefillItem }) => {
    const [requestDate, setRequestDate] = useState<Date | null>(new Date());
    const [requesterName, setRequesterName] = useState(currentUser.name);
    const [requesterDivision, setRequesterDivision] = useState('');
    const [order, setOrder] = useState('');
    const [lembar, setLembar] = useState<'1. Logistic' | '2. Divisi' | '3. Purchase'>('1. Logistic');
    const [items, setItems] = useState<RequestItemForm[]>([
        { id: Date.now(), itemName: '', itemTypeBrand: '', stock: 0, quantity: 1, keterangan: '' }
    ]);
    const [isFooterVisible, setIsFooterVisible] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const footerRef = useRef<HTMLDivElement>(null);
    
    const formId = "item-request-form";

    const availableAssets = useMemo(() => assets.filter(asset => asset.status === AssetStatus.IN_STORAGE), [assets]);
    const uniqueAvailableAssetNames = useMemo(() => [...new Set(availableAssets.map(asset => asset.name))], [availableAssets]);

    useEffect(() => {
        if (prefillItem) {
            const stock = assets.filter(asset => asset.name === prefillItem.name && asset.status === AssetStatus.IN_STORAGE).length;
            setItems([
                {
                    id: Date.now(),
                    itemName: prefillItem.name,
                    itemTypeBrand: prefillItem.brand,
                    stock: stock,
                    quantity: 1,
                    keterangan: 'Permintaan dari halaman stok.'
                }
            ]);
        }
    }, [prefillItem, assets]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsFooterVisible(entry.isIntersecting);
            },
            { root: null, rootMargin: "0px", threshold: 0.1 }
        );

        const currentRef = footerRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, []);

    const handleAddItem = () => {
        setItems([...items, { id: Date.now(), itemName: '', itemTypeBrand: '', stock: 0, quantity: 1, keterangan: '' }]);
    };

    const handleRemoveItem = (id: number) => {
        if (items.length > 1) {
            setItems(items.filter(item => item.id !== id));
        }
    };

    const handleItemChange = (id: number, field: keyof RequestItem, value: string | number) => {
        setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const handleAssetSelection = (id: number, selectedAssetName: string) => {
        const selectedAsset = availableAssets.find(asset => asset.name === selectedAssetName);
        
        let newName = selectedAssetName;
        let newBrand = '';
        let newStock = 0;

        if (selectedAsset) {
            newBrand = selectedAsset.brand;
            newStock = assets.filter(asset => asset.name === selectedAssetName && asset.status === AssetStatus.IN_STORAGE).length;
        }

        setItems(items.map(item => 
            item.id === id 
            ? { ...item, itemName: newName, itemTypeBrand: newBrand, stock: newStock } 
            : item
        ));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => { // Simulate API call
            onCreateRequest({
                requester: requesterName,
                division: requesterDivision,
                requestDate: requestDate ? requestDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                order,
                lembar,
                items: items,
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
            {isSubmitting ? 'Mengajukan...' : 'Ajukan Permintaan'}
        </button>
    );

    return (
    <>
        <form id={formId} className="space-y-6" onSubmit={handleSubmit}>
            {/* Document Header */}
            <div className="mb-6 space-y-2 text-center">
                <h4 className="text-xl font-bold text-tm-dark">TRINITY MEDIA INDONESIA</h4>
                <p className="font-semibold text-tm-secondary">SURAT PERMINTAAN PEMBELIAN BARANG (PURCHASE REQUISITION)</p>
            </div>

            {/* Document Info */}
            <div className="p-4 border-t border-b border-gray-200">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <label htmlFor="requestDate" className="block text-sm font-medium text-gray-700">Tanggal</label>
                        <div className="mt-1">
                            <DatePicker 
                                id="requestDate"
                                selectedDate={requestDate}
                                onDateChange={setRequestDate}
                                disablePastDates
                            />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="requesterName" className="block text-sm font-medium text-gray-700">Nama</label>
                        <input 
                            type="text" 
                            id="requesterName" 
                            value={requesterName}
                            onChange={(e) => setRequesterName(e.target.value)}
                            className="block w-full px-3 py-2 mt-1 text-gray-900 placeholder:text-gray-500 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-tm-accent focus:border-tm-accent sm:text-sm" 
                            placeholder="Nama lengkap Anda" 
                        />
                    </div>
                    <div>
                        <label htmlFor="division" className="block text-sm font-medium text-gray-700">Divisi</label>
                        <input 
                            type="text" 
                            id="division" 
                            value={requesterDivision}
                            onChange={(e) => setRequesterDivision(e.target.value)}
                            className="block w-full px-3 py-2 mt-1 text-gray-900 placeholder:text-gray-500 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-tm-accent focus:border-tm-accent sm:text-sm" 
                            placeholder="Contoh: IT, Marketing" 
                        />
                    </div>
                     <div>
                        <label htmlFor="docNumber" className="block text-sm font-medium text-gray-700">No Dokumen</label>
                        <input type="text" id="docNumber" readOnly className="block w-full px-3 py-2 mt-1 text-gray-700 bg-gray-100 border border-gray-200 rounded-md shadow-sm sm:text-sm" value="[Otomatis]" />
                    </div>
                    <div>
                        <label htmlFor="requestNumber" className="block text-sm font-medium text-gray-700">No Request</label>
                        <input type="text" id="requestNumber" readOnly className="block w-full px-3 py-2 mt-1 text-gray-700 bg-gray-100 border border-gray-200 rounded-md shadow-sm sm:text-sm" value="[Otomatis]" />
                    </div>
                     <div>
                        <label htmlFor="order" className="block text-sm font-medium text-gray-700">Order</label>
                        <input 
                            type="text" 
                            id="order" 
                            value={order}
                            onChange={(e) => setOrder(e.target.value)}
                            className="block w-full px-3 py-2 mt-1 text-gray-900 placeholder:text-gray-500 bg-gray-50 border border-gray-300 rounded-md shadow-sm sm:text-sm" 
                            placeholder="Jenis pesanan" 
                        />
                    </div>
                     <div>
                        <label htmlFor="lembar" className="block text-sm font-medium text-gray-700">Lembar</label>
                        <select 
                            id="lembar"
                            value={lembar}
                            onChange={(e) => setLembar(e.target.value as any)}
                            className="block w-full px-3 py-2 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                        >
                            <option value="1. Logistic">1. Logistic</option>
                            <option value="2. Divisi">2. Divisi</option>
                            <option value="3. Purchase">3. Purchase</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Item Details */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-tm-dark">Detail Permintaan Barang</h3>
                <button type="button" onClick={handleAddItem} className="px-3 py-1 text-sm font-semibold text-white transition-colors duration-200 rounded-md shadow-sm bg-tm-accent hover:bg-tm-primary">+ Tambah Item</button>
            </div>

            <div className="space-y-4">
                {items.map((item, index) => (
                    <div key={item.id} className="relative grid grid-cols-1 gap-4 p-4 border border-gray-200 rounded-lg md:grid-cols-8 lg:grid-cols-12">
                        <div className="md:col-span-4 lg:col-span-3">
                            <label htmlFor={`itemName-${item.id}`} className="block text-sm font-medium text-gray-700">Nama Barang</label>
                            <select 
                            id={`itemName-${item.id}`} 
                            value={item.itemName} 
                            onChange={(e) => handleAssetSelection(item.id, e.target.value)} 
                            className="block w-full px-3 py-2 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-tm-accent focus:border-tm-accent sm:text-sm"
                            >
                                <option value="">-- Pilih Barang dari Stok --</option>
                                {uniqueAvailableAssetNames.map(name => <option key={name} value={name}>{name}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-4 lg:col-span-3">
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
                        <div className="md:col-span-2 lg:col-span-1">
                            <label htmlFor={`stock-${item.id}`} className="block text-sm font-medium text-gray-700">Stok</label>
                            <input 
                                type="number" 
                                id={`stock-${item.id}`} 
                                value={item.stock} 
                                readOnly 
                                className="block w-full px-3 py-2 mt-1 text-gray-700 bg-gray-100 border border-gray-200 rounded-md shadow-sm sm:text-sm" 
                            />
                        </div>
                        <div className="md:col-span-2 lg:col-span-1">
                            <label htmlFor={`quantity-${item.id}`} className="block text-sm font-medium text-gray-700">Req</label>
                            <input type="number" id={`quantity-${item.id}`} value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value))} min="1" className="block w-full px-3 py-2 mt-1 text-gray-900 placeholder:text-gray-500 bg-gray-50 border border-gray-300 rounded-md shadow-sm sm:text-sm" />
                        </div>
                        <div className="md:col-span-4 lg:col-span-4">
                            <label htmlFor={`keterangan-${item.id}`} className="block text-sm font-medium text-gray-700">Keterangan</label>
                            <input type="text" id={`keterangan-${item.id}`} value={item.keterangan} onChange={(e) => handleItemChange(item.id, 'keterangan', e.target.value)} className="block w-full px-3 py-2 mt-1 text-gray-900 placeholder:text-gray-500 bg-gray-50 border border-gray-300 rounded-md shadow-sm sm:text-sm" placeholder="Jelaskan kebutuhan" />
                        </div>
                        {items.length > 1 && (
                            <div className="absolute top-2 right-2">
                                <button type="button" onClick={() => handleRemoveItem(item.id)} className="text-gray-400 hover:text-red-500">
                                    <CloseIcon className="w-5 h-5"/>
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Signature Section */}
            <div className="pt-8 mt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 text-center gap-y-8 md:grid-cols-3 md:gap-x-8">
                    <div>
                        <p className="font-medium text-gray-700">Request</p>
                        <div className="flex items-center justify-center mt-2 h-28">
                            {requesterName && requesterDivision ? (
                                <SignatureStamp signerName={requesterName} signatureDate={requestDate?.toISOString() || ''} signerDivision={`Divisi ${requesterDivision}`} />
                            ) : (
                            <span className="text-sm italic text-gray-300">Tanda Tangan</span>
                            )}
                        </div>
                        <p className="pt-1 mt-2 text-sm text-gray-600 border-t border-gray-400">( {requesterName || 'Nama Jelas'} )</p>
                    </div>

                    <div>
                        <p className="font-medium text-gray-700">Logistic</p>
                        <div className="flex items-center justify-center mt-2 h-28">
                            <span className="text-sm italic text-gray-300">Menunggu Persetujuan</span>
                        </div>
                        <p className="pt-1 mt-2 text-sm text-gray-600 border-t border-gray-400">( Nama Jelas )</p>
                    </div>

                    <div>
                        <p className="font-medium text-gray-700">Approval</p>
                        <div className="flex items-center justify-center mt-2 h-28">
                            <span className="text-sm italic text-gray-300">Menunggu Persetujuan</span>
                        </div>
                        <p className="pt-1 mt-2 text-sm text-gray-600 border-t border-gray-400">( Nama Jelas )</p>
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
)};

const ItemRequest: React.FC<ItemRequestProps> = ({ currentUser, requests, setRequests, assets, onInitiateRegistration, initialFilters, onClearInitialFilters, onShowPreview }) => {
    const [view, setView] = useState<'list' | 'form'>('list');
    const [itemToPrefill, setItemToPrefill] = useState<{ name: string; brand: string } | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [requestToDeleteId, setRequestToDeleteId] = useState<string | null>(null);
    const [bulkDeleteConfirmation, setBulkDeleteConfirmation] = useState(false);
    const [isBulkSelectMode, setIsBulkSelectMode] = useState(false);
    const [selectedRequestIds, setSelectedRequestIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // States for new bulk action modals
    const [bulkApproveConfirmation, setBulkApproveConfirmation] = useState(false);
    const [bulkRejectConfirmation, setBulkRejectConfirmation] = useState(false);
    const [bulkRejectionReason, setBulkRejectionReason] = useState('');

    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const addNotification = useNotification();

    useEffect(() => {
        if (initialFilters) {
            if (initialFilters.status) {
                setFilterStatus(initialFilters.status);
            }
            if (initialFilters.prefillItem) {
                setItemToPrefill(initialFilters.prefillItem);
                setView('form');
            }
            onClearInitialFilters();
        }
    }, [initialFilters, onClearInitialFilters]);


    const isFiltering = useMemo(() => {
        return searchQuery.trim() !== '' || filterStatus !== '';
    }, [searchQuery, filterStatus]);

    const handleResetFilters = () => {
        setSearchQuery('');
        setFilterStatus('');
    };

    const filteredRequests = useMemo(() => {
        return requests
            .filter(req => {
                const searchLower = searchQuery.toLowerCase();
                return (
                    req.id.toLowerCase().includes(searchLower) ||
                    req.requester.toLowerCase().includes(searchLower) ||
                    req.division.toLowerCase().includes(searchLower)
                );
            })
            .filter(req => {
                if (!filterStatus) return true;
                if (filterStatus === 'awaiting-approval') {
                    return [ItemStatus.PENDING, ItemStatus.LOGISTIC_APPROVED].includes(req.status);
                }
                return req.status === filterStatus;
            });
    }, [requests, searchQuery, filterStatus]);

    const { items: sortedRequests, requestSort, sortConfig } = useSortableData(filteredRequests, { key: 'requestDate', direction: 'descending' });

    const totalItems = sortedRequests.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedRequests = sortedRequests.slice(startIndex, endIndex);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterStatus, itemsPerPage]);

    const handleItemsPerPageChange = (newSize: number) => {
        setItemsPerPage(newSize);
        setCurrentPage(1);
    };

    const actionableCounts = useMemo(() => {
        if (!isBulkSelectMode) return { approveCount: 0, rejectCount: 0, deleteCount: 0 };
        const selected = requests.filter(r => selectedRequestIds.includes(r.id));
        
        const canApprove = (req: Request) => 
            (req.status === ItemStatus.PENDING && (currentUser.role === 'Admin' || currentUser.role === 'Super Admin')) ||
            (req.status === ItemStatus.LOGISTIC_APPROVED && currentUser.role === 'Super Admin');

        const canReject = (req: Request) => 
            (req.status === ItemStatus.PENDING || req.status === ItemStatus.LOGISTIC_APPROVED) &&
            (currentUser.role === 'Admin' || currentUser.role === 'Super Admin');

        return {
            approveCount: selected.filter(canApprove).length,
            rejectCount: selected.filter(canReject).length,
            deleteCount: selected.length,
        };
    }, [requests, selectedRequestIds, currentUser.role, isBulkSelectMode]);

    const handleCancelBulkMode = () => {
        setIsBulkSelectMode(false);
        setSelectedRequestIds([]);
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
        setSelectedRequestIds(prev =>
            prev.includes(id) ? prev.filter(reqId => reqId !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setSelectedRequestIds(paginatedRequests.map(req => req.id));
        } else {
            setSelectedRequestIds([]);
        }
    };

    const handleExport = () => {
        exportToCSV(sortedRequests, `requests_${new Date().toISOString().split('T')[0]}`);
    };

    const handleShowDetails = (request: Request) => {
        setSelectedRequest(request);
        setIsDetailModalOpen(true);
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedRequest(null);
    };

    const handleOpenRejectionModal = () => {
        setIsDetailModalOpen(false); // Close detail modal before opening rejection modal
        setIsRejectionModalOpen(true);
    };

    const handleCloseRejectionModal = () => {
        setIsRejectionModalOpen(false);
        setRejectionReason('');
        setSelectedRequest(null); // Clear selected request
    };

    const handleCreateRequest = (data: Omit<Request, 'id' | 'status' | 'logisticApprover' | 'logisticApprovalDate' | 'finalApprover' | 'finalApprovalDate' | 'rejectionReason' | 'rejectedBy' | 'rejectionDate' | 'rejectedByDivision'>) => {
        const newRequest: Request = {
            ...data,
            id: `REQ-${String(requests.length + 1).padStart(3, '0')}`,
            status: ItemStatus.PENDING,
            logisticApprover: null,
            logisticApprovalDate: null,
            finalApprover: null,
            finalApprovalDate: null,
            rejectionReason: null,
            rejectedBy: null,
            rejectionDate: null,
            rejectedByDivision: null,
        };
        setRequests(prev => [newRequest, ...prev]);
        setView('list');
        setItemToPrefill(null);
        addNotification('Request berhasil dibuat!', 'success');
    };

    const handleApproval = (requestId: string) => {
        setIsLoading(true);
        setTimeout(() => { // Simulate API Call
            const today = new Date().toISOString();
            let approved = false;
            setRequests(prevRequests =>
                prevRequests.map(req => {
                    if (req.id === requestId) {
                        if (req.status === ItemStatus.PENDING && (currentUser.role === 'Admin' || currentUser.role === 'Super Admin')) {
                            approved = true;
                            return { ...req, status: ItemStatus.LOGISTIC_APPROVED, logisticApprover: currentUser.name, logisticApprovalDate: today };
                        }
                        if (req.status === ItemStatus.LOGISTIC_APPROVED && currentUser.role === 'Super Admin') {
                            approved = true;
                            return { ...req, status: ItemStatus.APPROVED, finalApprover: currentUser.name, finalApprovalDate: today };
                        }
                    }
                    return req;
                })
            );
            if (approved) {
                addNotification('Request berhasil disetujui.', 'success');
            }
            setIsLoading(false);
            handleCloseDetailModal();
        }, 1000);
    };
    
    const handleConfirmRejection = () => {
        if (!selectedRequest || !rejectionReason.trim()) {
            addNotification('Alasan penolakan harus diisi.', 'error');
            return;
        }
        setIsLoading(true);
        setTimeout(() => { // Simulate API Call
            const today = new Date().toISOString();
            const rejectorDivision = currentUser.role === 'Super Admin' ? 'CEO / Super Admin' : 'Divisi Inventori';

            setRequests(prevRequests =>
                prevRequests.map(req =>
                    req.id === selectedRequest.id 
                    ? { ...req, status: ItemStatus.REJECTED, rejectionReason: rejectionReason.trim(), rejectedBy: currentUser.name, rejectionDate: today, rejectedByDivision: rejectorDivision } 
                    : req
                )
            );
            addNotification('Request telah ditolak.', 'success');
            setIsLoading(false);
            handleCloseRejectionModal();
        }, 1000);
    };
    
    const handleConfirmDelete = () => {
        if (!requestToDeleteId) return;
        setIsLoading(true);
        setTimeout(() => {
            setRequests(prev => prev.filter(r => r.id !== requestToDeleteId));
            addNotification(`Request ${requestToDeleteId} berhasil dihapus.`, 'success');
            setRequestToDeleteId(null);
            setIsLoading(false);
        }, 1000);
    };

    const handleBulkDelete = () => {
        setIsLoading(true);
        setTimeout(() => {
            setRequests(prev => prev.filter(req => !selectedRequestIds.includes(req.id)));
            addNotification(`${selectedRequestIds.length} request berhasil dihapus.`, 'success');
            handleCancelBulkMode();
            setBulkDeleteConfirmation(false);
            setIsLoading(false);
        }, 1000);
    };

    const handleBulkApprove = () => {
        setIsLoading(true);
        setTimeout(() => {
            const today = new Date().toISOString();
            let approvedCount = 0;

            setRequests(prevRequests => {
                return prevRequests.map(req => {
                    if (selectedRequestIds.includes(req.id)) {
                        if (req.status === ItemStatus.PENDING && (currentUser.role === 'Admin' || currentUser.role === 'Super Admin')) {
                            approvedCount++;
                            return { ...req, status: ItemStatus.LOGISTIC_APPROVED, logisticApprover: currentUser.name, logisticApprovalDate: today };
                        }
                        if (req.status === ItemStatus.LOGISTIC_APPROVED && currentUser.role === 'Super Admin') {
                            approvedCount++;
                            return { ...req, status: ItemStatus.APPROVED, finalApprover: currentUser.name, finalApprovalDate: today };
                        }
                    }
                    return req;
                });
            });

            if (approvedCount > 0) {
                addNotification(`${approvedCount} request berhasil disetujui.`, 'success');
            } else {
                addNotification('Tidak ada request yang dapat disetujui dengan role Anda saat ini.', 'error');
            }

            handleCancelBulkMode();
            setBulkApproveConfirmation(false);
            setIsLoading(false);
        }, 1000);
    };

    const handleBulkReject = () => {
        if (!bulkRejectionReason.trim()) {
            addNotification('Alasan penolakan harus diisi.', 'error');
            return;
        }
        setIsLoading(true);
        setTimeout(() => {
            const today = new Date().toISOString();
            const rejectorDivision = currentUser.role === 'Super Admin' ? 'CEO / Super Admin' : 'Divisi Inventori';
            let rejectedCount = 0;

            setRequests(prevRequests => {
                return prevRequests.map(req => {
                    if (selectedRequestIds.includes(req.id) && (req.status === ItemStatus.PENDING || req.status === ItemStatus.LOGISTIC_APPROVED)) {
                        rejectedCount++;
                        return {
                            ...req,
                            status: ItemStatus.REJECTED,
                            rejectionReason: bulkRejectionReason.trim(),
                            rejectedBy: currentUser.name,
                            rejectionDate: today,
                            rejectedByDivision: rejectorDivision
                        };
                    }
                    return req;
                });
            });
            
            if (rejectedCount > 0) {
                 addNotification(`${rejectedCount} request berhasil ditolak.`, 'success');
            } else {
                addNotification('Tidak ada request yang dapat ditolak (mungkin sudah disetujui/ditolak sebelumnya).', 'error');
            }

            handleCancelBulkMode();
            setBulkRejectConfirmation(false);
            setBulkRejectionReason('');
            setIsLoading(false);
        }, 1000);
    };

    const renderApprovalActions = () => {
        if (!selectedRequest) return null;
        
        const canAdminApprove = selectedRequest.status === ItemStatus.PENDING && currentUser.role === 'Admin';
        const canSuperAdminApprove = selectedRequest.status === ItemStatus.LOGISTIC_APPROVED && currentUser.role === 'Super Admin';
        const canSuperAdminFirstApprove = selectedRequest.status === ItemStatus.PENDING && currentUser.role === 'Super Admin';
        
        const canReject = (selectedRequest.status === ItemStatus.PENDING || selectedRequest.status === ItemStatus.LOGISTIC_APPROVED) && 
                          (currentUser.role === 'Admin' || currentUser.role === 'Super Admin');

        const canRegister = selectedRequest.status === ItemStatus.APPROVED && !selectedRequest.isRegistered;

        return (
            <div className="flex items-center justify-end flex-1 space-x-3">
                {canRegister && (
                    <Tooltip text="Membuka formulir pencatatan aset baru dengan data dari permintaan ini.">
                        <button
                            type="button"
                            onClick={() => {
                                onInitiateRegistration(selectedRequest);
                                handleCloseDetailModal();
                            }}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700"
                        >
                            <RegisterIcon className="w-4 h-4" />
                            Catat sebagai Aset
                        </button>
                    </Tooltip>
                )}
                {canReject && (
                    <button
                        type="button"
                        onClick={handleOpenRejectionModal}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-white transition-colors duration-200 bg-red-600 rounded-lg shadow-sm hover:bg-red-700 disabled:bg-red-400"
                    >
                        Tolak
                    </button>
                )}
                {(canAdminApprove || canSuperAdminApprove || canSuperAdminFirstApprove) && (
                    <button
                        type="button"
                        onClick={() => handleApproval(selectedRequest.id)}
                        disabled={isLoading}
                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white transition-colors duration-200 bg-green-600 rounded-lg shadow-sm hover:bg-green-700 disabled:bg-green-400"
                    >
                        {isLoading ? <SpinnerIcon className="w-5 h-5 mr-2"/> : null}
                        {isLoading ? 'Memproses...' : 'Setujui'}
                    </button>
                )}
            </div>
        );
    };
    
    const renderContent = () => {
        if (view === 'form') {
            return (
                <div className="p-4 sm:p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl font-bold text-tm-dark">Buat Request Baru</h1>
                        <button
                            onClick={() => {
                                setView('list');
                                setItemToPrefill(null);
                            }}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tm-accent"
                        >
                            Kembali ke Daftar
                        </button>
                    </div>
                    <div className="p-4 sm:p-6 bg-white border border-gray-200/80 rounded-xl shadow-md pb-24">
                        <RequestForm currentUser={currentUser} assets={assets} onCreateRequest={handleCreateRequest} prefillItem={itemToPrefill} />
                    </div>
                </div>
            );
        }

        return (
            <div className="p-4 sm:p-6 md:p-8">
                <div className="flex flex-col items-start justify-between gap-4 mb-6 md:flex-row md:items-center">
                    <h1 className="text-3xl font-bold text-tm-dark">Daftar Request Barang</h1>
                     <div className="flex items-center space-x-2">
                        <button
                            onClick={handleExport}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 transition-all duration-200 bg-white border rounded-lg shadow-sm hover:bg-gray-50"
                        >
                            <ExportIcon className="w-4 h-4"/>
                            Export CSV
                        </button>
                        <button
                            onClick={() => setView('form')}
                            className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 rounded-lg shadow-sm bg-tm-primary hover:bg-tm-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tm-accent"
                        >
                            Buat Request Baru
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
                                placeholder="Cari ID, Pemohon, Divisi..."
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
                            <option value="awaiting-approval" className="font-semibold">Perlu Persetujuan</option>
                            {Object.values(ItemStatus).map(s => <option key={s} value={s}>{s}</option>)}
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
                               Menampilkan <span className="font-semibold text-tm-dark">{sortedRequests.length}</span> dari <span className="font-semibold text-tm-dark">{requests.length}</span> total request yang cocok.
                           </p>
                        </div>
                    )}
                </div>

                {isBulkSelectMode && (
                     <div className="p-4 mb-4 bg-blue-50 border-l-4 border-tm-accent rounded-r-lg">
                        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                            {selectedRequestIds.length > 0 ? (
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="text-sm font-medium text-tm-primary">{selectedRequestIds.length} item terpilih</span>
                                    <div className="hidden h-5 border-l border-gray-300 sm:block"></div>
                                    <button
                                        onClick={() => setBulkApproveConfirmation(true)}
                                        disabled={actionableCounts.approveCount === 0}
                                        className="px-3 py-1.5 text-sm font-semibold text-success-text bg-success-light rounded-md hover:bg-green-200 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                                    >
                                        Setujui {actionableCounts.approveCount > 0 ? `(${actionableCounts.approveCount})` : ''}
                                    </button>
                                    <button
                                        onClick={() => setBulkRejectConfirmation(true)}
                                        disabled={actionableCounts.rejectCount === 0}
                                        className="px-3 py-1.5 text-sm font-semibold text-warning-text bg-warning-light rounded-md hover:bg-amber-200 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                                    >
                                        Tolak {actionableCounts.rejectCount > 0 ? `(${actionableCounts.rejectCount})` : ''}
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
                
                <div className="bg-white border border-gray-200/80 rounded-xl shadow-md">
                    <div className="overflow-x-auto custom-scrollbar">
                       <RequestTable 
                            requests={paginatedRequests} 
                            onDetailClick={handleShowDetails} 
                            onDeleteClick={setRequestToDeleteId} 
                            sortConfig={sortConfig} 
                            requestSort={requestSort}
                            selectedRequestIds={selectedRequestIds}
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
            
            {selectedRequest && (
                <Modal
                    isOpen={isDetailModalOpen}
                    onClose={handleCloseDetailModal}
                    title={`Detail Request`}
                    size="3xl"
                    footerContent={renderApprovalActions()}
                >
                    {/* Document Header */}
                    <div className="mb-4 space-y-2 text-center">
                        <h4 className="text-xl font-bold text-tm-dark">TRINITY MEDIA INDONESIA</h4>
                        <p className="font-semibold text-tm-secondary">SURAT PERMINTAAN PEMBELIAN BARANG (PURCHASE REQUISITION)</p>
                    </div>

                    {/* Document Info */}
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 py-4 my-4 text-sm border-t border-b border-gray-200 lg:grid-cols-3">
                        <div><span className="font-semibold text-gray-600">No Dokumen:</span><span className="pl-2 text-gray-800">TMI/PR/{selectedRequest.id}</span></div>
                        <div><span className="font-semibold text-gray-600">No Request:</span><span className="pl-2 text-gray-800">{selectedRequest.id}</span></div>
                        <div><span className="font-semibold text-gray-600">Tanggal:</span><span className="pl-2 text-gray-800">{selectedRequest.requestDate}</span></div>
                        <div><span className="font-semibold text-gray-600">Nama:</span><span className="pl-2 text-gray-800">{selectedRequest.requester}</span></div>
                        <div><span className="font-semibold text-gray-600">Divisi:</span><span className="pl-2 text-gray-800">{selectedRequest.division}</span></div>
                        <div><span className="font-semibold text-gray-600">Order:</span><span className="pl-2 text-gray-800">{selectedRequest.order}</span></div>
                        <div><span className="font-semibold text-gray-600">Lembar:</span><span className="pl-2 text-gray-800">{selectedRequest.lembar}</span></div>
                    </div>
                    
                    {/* Item Details Section */}
                    <div className="overflow-auto custom-scrollbar max-h-[40vh]">
                        <table className="min-w-full text-sm divide-y divide-gray-200">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-4 py-2 font-semibold text-left text-gray-600">No</th>
                                    <th className="px-4 py-2 font-semibold text-left text-gray-600">Nama Barang</th>
                                    <th className="px-4 py-2 font-semibold text-left text-gray-600">Type/Brand</th>
                                    <th className="px-4 py-2 font-semibold text-center text-gray-600">Stok</th>
                                    <th className="px-4 py-2 font-semibold text-center text-gray-600">Req</th>
                                    <th className="px-4 py-2 font-semibold text-left text-gray-600">Keterangan</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {selectedRequest.items.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="px-4 py-2 text-gray-700">{index + 1}</td>
                                        <td className="px-4 py-2 font-medium text-gray-800">{item.itemName}</td>
                                        <td className="px-4 py-2 text-gray-700">{item.itemTypeBrand}</td>
                                        <td className="px-4 py-2 text-center text-gray-700">{item.stock}</td>
                                        <td className="px-4 py-2 font-bold text-center text-tm-primary">{item.quantity}</td>
                                        <td className="px-4 py-2 text-gray-700">{item.keterangan}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                     <div className="pt-4 mt-4 text-sm border-t border-gray-200">
                        <span className="font-semibold text-gray-600">Status: </span>
                        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(selectedRequest.status)}`}>
                            {selectedRequest.status}
                        </span>
                     </div>
                     {selectedRequest.isRegistered && (
                        <div className="pt-2 text-sm">
                            <span className="font-semibold text-gray-600">Aset Terkait: </span>
                            {assets.filter(a => a.woRoIntNumber === selectedRequest.id).map(asset => (
                                <ClickableLink key={asset.id} onClick={() => onShowPreview({ type: 'asset', id: asset.id })}>
                                    {asset.id}
                                </ClickableLink>
                            ))}
                        </div>
                    )}


                    {/* Signature Section */}
                    <div className="pt-6 mt-6 border-t border-gray-200">
                        {selectedRequest.status === ItemStatus.REJECTED ? (
                            <div className="p-4 text-center bg-danger-light rounded-lg">
                                <h4 className="text-lg font-bold text-danger-text">Permintaan Ditolak</h4>
                                 <div className="flex justify-center my-4">
                                     {selectedRequest.rejectedBy && selectedRequest.rejectionDate && (
                                        <RejectionStamp 
                                            rejectorName={selectedRequest.rejectedBy} 
                                            rejectionDate={selectedRequest.rejectionDate}
                                            rejectorDivision={selectedRequest.rejectedByDivision || ''}
                                        />
                                     )}
                                 </div>
                                <p className="text-sm font-semibold text-gray-700">Alasan Penolakan:</p>
                                <p className="text-sm text-gray-600 italic">"{selectedRequest.rejectionReason}"</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 text-sm text-center gap-y-6 sm:grid-cols-3 sm:gap-x-4">
                                <div>
                                    <p className="font-semibold text-gray-600">Request</p>
                                    <div className="flex items-center justify-center mt-2 h-28">
                                        <SignatureStamp signerName={selectedRequest.requester} signatureDate={selectedRequest.requestDate} signerDivision={`Divisi ${selectedRequest.division}`} />
                                    </div>
                                    <div className="pt-1 border-t border-gray-400">
                                        <p className="text-gray-800">({selectedRequest.requester})</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-600">Logistic</p>
                                    <div className="flex items-center justify-center mt-2 h-28">
                                        {selectedRequest.logisticApprover && selectedRequest.logisticApprovalDate ? (
                                            <ApprovalStamp approverName={selectedRequest.logisticApprover} approvalDate={selectedRequest.logisticApprovalDate} approverDivision="Divisi Inventori" />
                                        ) : (
                                            <span className="italic text-gray-300">Menunggu...</span>
                                        )}
                                    </div>
                                    <div className="pt-1 border-t border-gray-400">
                                        <p className="text-gray-500">({selectedRequest.logisticApprover || '_________________________'})</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-600">Approval</p>
                                    <div className="flex items-center justify-center mt-2 h-28">
                                         {selectedRequest.finalApprover && selectedRequest.finalApprovalDate ? (
                                            <ApprovalStamp approverName={selectedRequest.finalApprover} approvalDate={selectedRequest.finalApprovalDate} approverDivision="CEO / Super Admin" />
                                         ) : (
                                            <span className="italic text-gray-300">Menunggu...</span>
                                         )}
                                    </div>
                                    <div className="pt-1 border-t border-gray-400">
                                        <p className="text-gray-500">({selectedRequest.finalApprover || '_________________________'})</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </Modal>
            )}

            {isRejectionModalOpen && (
                 <Modal
                    isOpen={isRejectionModalOpen}
                    onClose={handleCloseRejectionModal}
                    title="Konfirmasi Penolakan"
                    hideDefaultCloseButton={true}
                    footerContent={
                        <div className="flex items-center space-x-3">
                            <button
                                type="button"
                                onClick={handleCloseRejectionModal}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmRejection}
                                disabled={!rejectionReason.trim() || isLoading}
                                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg shadow-sm hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed"
                            >
                                {isLoading && <SpinnerIcon className="w-5 h-5 mr-2" />}
                                Konfirmasi Tolak
                            </button>
                        </div>
                    }
                >
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                           Anda akan menolak permintaan dengan ID <span className="font-bold text-tm-dark">{selectedRequest?.id}</span>. 
                           Mohon berikan alasan penolakan di bawah ini.
                        </p>
                        <div>
                            <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700">Alasan Penolakan</label>
                            <textarea
                                id="rejectionReason"
                                rows={4}
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="block w-full px-3 py-2 mt-1 text-gray-900 placeholder:text-gray-400 bg-gray-50 border border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-tm-accent focus:border-tm-accent"
                                placeholder="Contoh: Stok tidak tersedia, permintaan tidak sesuai budget, dll."
                            ></textarea>
                        </div>
                    </div>
                </Modal>
            )}

            {requestToDeleteId && (
                <Modal
                    isOpen={!!requestToDeleteId}
                    onClose={() => setRequestToDeleteId(null)}
                    title="Konfirmasi Hapus"
                    size="md"
                    hideDefaultCloseButton
                >
                    <div className="text-center">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto text-red-600 bg-red-100 rounded-full">
                            <ExclamationTriangleIcon className="w-8 h-8" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-gray-800">Hapus Request?</h3>
                        <p className="mt-2 text-sm text-gray-600">
                            Anda yakin ingin menghapus request <span className="font-bold">{requestToDeleteId}</span>? Tindakan ini tidak dapat diurungkan.
                        </p>
                    </div>
                    <div className="flex items-center justify-end pt-5 mt-5 space-x-3 border-t">
                         <button onClick={() => setRequestToDeleteId(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Batal</button>
                        <button
                            type="button"
                            onClick={handleConfirmDelete}
                            disabled={isLoading}
                            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-danger rounded-lg shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-400"
                        >
                            {isLoading && <SpinnerIcon className="w-5 h-5 mr-2"/>}
                            Ya, Hapus
                        </button>
                    </div>
                </Modal>
            )}

            {bulkDeleteConfirmation && (
                <Modal
                    isOpen={bulkDeleteConfirmation}
                    onClose={() => setBulkDeleteConfirmation(false)}
                    title="Konfirmasi Hapus Massal"
                    size="md"
                    hideDefaultCloseButton
                >
                     <div className="text-center">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto text-red-600 bg-red-100 rounded-full">
                            <ExclamationTriangleIcon className="w-8 h-8" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-gray-800">Hapus {selectedRequestIds.length} Request?</h3>
                        <p className="mt-2 text-sm text-gray-600">
                            Anda yakin ingin menghapus semua request yang dipilih? Tindakan ini tidak dapat diurungkan.
                        </p>
                    </div>
                     <div className="flex items-center justify-end pt-5 mt-5 space-x-3 border-t">
                         <button onClick={() => setBulkDeleteConfirmation(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Batal</button>
                        <button
                            type="button"
                            onClick={handleBulkDelete}
                            disabled={isLoading}
                            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-danger rounded-lg shadow-sm hover:bg-red-700 disabled:bg-red-400"
                        >
                            {isLoading && <SpinnerIcon className="w-5 h-5 mr-2"/>}
                            Ya, Hapus ({selectedRequestIds.length}) Request
                        </button>
                    </div>
                </Modal>
            )}

            {bulkApproveConfirmation && (
                <Modal
                    isOpen={bulkApproveConfirmation}
                    onClose={() => setBulkApproveConfirmation(false)}
                    title="Konfirmasi Persetujuan Massal"
                    size="md"
                    hideDefaultCloseButton={true}
                    footerContent={
                        <>
                            <button onClick={() => setBulkApproveConfirmation(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Batal</button>
                            <button
                                type="button"
                                onClick={handleBulkApprove}
                                disabled={isLoading}
                                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-success rounded-lg shadow-sm hover:bg-green-700 disabled:bg-green-400"
                            >
                                {isLoading && <SpinnerIcon className="w-5 h-5 mr-2"/>}
                                Ya, Setujui ({actionableCounts.approveCount})
                            </button>
                        </>
                    }
                >
                    <div className="space-y-2 text-sm text-gray-600">
                        <p>
                            Anda akan menyetujui <span className="font-bold text-tm-dark">{actionableCounts.approveCount}</span> request yang dapat diproses dari total {selectedRequestIds.length} yang dipilih.
                        </p>
                        <p>
                            Request berstatus <span className="font-semibold text-warning-text">'Menunggu Persetujuan'</span> akan diubah menjadi <span className="font-semibold text-info-text">'Disetujui Logistik'</span>.
                        </p>
                        {currentUser.role === 'Super Admin' && (
                             <p>
                                Request berstatus <span className="font-semibold text-info-text">'Disetujui Logistik'</span> akan diubah menjadi <span className="font-semibold text-success-text">'Disetujui'</span>.
                            </p>
                        )}
                        <p className="pt-2">Tindakan ini akan berlaku sesuai dengan role Anda. Lanjutkan?</p>
                    </div>
                </Modal>
            )}
            
            {bulkRejectConfirmation && (
                <Modal
                    isOpen={bulkRejectConfirmation}
                    onClose={() => setBulkRejectConfirmation(false)}
                    title={`Konfirmasi Penolakan (${actionableCounts.rejectCount}) Request`}
                    hideDefaultCloseButton
                >
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                           Anda akan menolak <span className="font-bold text-tm-dark">{actionableCounts.rejectCount}</span> request yang dapat diproses.
                           Mohon berikan alasan penolakan yang akan diterapkan untuk semua request tersebut.
                        </p>
                        <div>
                            <label htmlFor="bulkRejectionReason" className="block text-sm font-medium text-gray-700">Alasan Penolakan</label>
                            <textarea
                                id="bulkRejectionReason"
                                rows={3}
                                value={bulkRejectionReason}
                                onChange={(e) => setBulkRejectionReason(e.target.value)}
                                className="block w-full px-3 py-2 mt-1 text-gray-900 placeholder:text-gray-400 bg-gray-50 border border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-tm-accent focus:border-tm-accent"
                                placeholder="Alasan penolakan massal..."
                            ></textarea>
                        </div>
                    </div>
                    <div className="flex items-center justify-end pt-5 mt-5 space-x-3 border-t">
                         <button
                            type="button"
                            onClick={() => setBulkRejectConfirmation(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
                          >
                            Batal
                          </button>
                         <button
                            type="button"
                            onClick={handleBulkReject}
                            disabled={!bulkRejectionReason.trim() || isLoading}
                            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-danger rounded-lg shadow-sm hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed"
                          >
                            {isLoading && <SpinnerIcon className="w-5 h-5 mr-2" />}
                            Konfirmasi Tolak ({actionableCounts.rejectCount})
                          </button>
                    </div>
                </Modal>
            )}
        </>
    );
};

export default ItemRequest;