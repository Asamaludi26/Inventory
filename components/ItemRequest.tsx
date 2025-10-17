import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Request, ItemStatus, RequestItem, User, AssetStatus, Asset, PreviewData, AssetCategory, AssetType, StandardItem, Division, Page } from '../types';
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
import { CustomSelect } from './shared/CustomSelect';
import { FilterIcon } from './icons/FilterIcon';
import { RequestIcon } from './icons/RequestIcon';
import { CheckIcon } from './icons/CheckIcon';
import { ShoppingCartIcon } from './icons/ShoppingCartIcon';
import { TruckIcon } from './icons/TruckIcon';
import { ArchiveBoxIcon } from './icons/ArchiveBoxIcon';
import { Letterhead } from './shared/Letterhead';


interface ItemRequestProps {
    currentUser: User;
    requests: Request[];
    setRequests: React.Dispatch<React.SetStateAction<Request[]>>;
    assets: Asset[];
    assetCategories: AssetCategory[];
    divisions: Division[];
    onInitiateRegistration: (request: Request, itemToRegister: RequestItem) => void;
    initialFilters?: any;
    onClearInitialFilters: () => void;
    onShowPreview: (data: PreviewData) => void;
    openModelModal: (category: AssetCategory, type: AssetType, onModelAdded: (model: StandardItem) => void) => void;
    openTypeModal: (category: AssetCategory, typeToEdit: AssetType | null, onTypeAdded: (type: AssetType) => void) => void;
    setActivePage: (page: Page, initialState?: any) => void;
}

export const getStatusClass = (status: ItemStatus) => {
    switch (status) {
        case ItemStatus.APPROVED: return 'bg-success-light text-success-text';
        case ItemStatus.PURCHASING: return 'bg-blue-200 text-blue-800';
        case ItemStatus.IN_DELIVERY: return 'bg-purple-200 text-purple-800';
        case ItemStatus.ARRIVED: return 'bg-green-300 text-green-900 font-semibold';
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
    onOpenStaging: (request: Request) => void;
    sortConfig: SortConfig<Request> | null;
    requestSort: (key: keyof Request) => void;
    selectedRequestIds: string[];
    onSelectOne: (id: string) => void;
    onSelectAll: (event: React.ChangeEvent<HTMLInputElement>) => void;
    isBulkSelectMode: boolean;
    onEnterBulkMode: () => void;
}

const OrderIndicator: React.FC<{ order: string }> = ({ order }) => {
    const details = useMemo(() => {
        switch (order) {
            case 'Urgent':
                return { color: 'bg-danger', ringColor: 'ring-danger/30', tooltip: 'Urgent' };
            case 'Project Based':
                return { color: 'bg-info', ringColor: 'ring-info/30', tooltip: 'Project Based' };
            case 'Regular Stock':
            default:
                return { color: 'bg-gray-400', ringColor: 'ring-gray-400/30', tooltip: 'Regular Stock' };
        }
    }, [order]);

    return (
        <Tooltip text={details.tooltip} position="right">
            <span className={`block w-2.5 h-2.5 rounded-full ${details.color} ring-2 ${details.ringColor}`}></span>
        </Tooltip>
    );
};

const RequestTable: React.FC<RequestTableProps> = ({ requests, onDetailClick, onDeleteClick, onOpenStaging, sortConfig, requestSort, selectedRequestIds, onSelectOne, onSelectAll, isBulkSelectMode, onEnterBulkMode }) => {
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
                            <td className="px-6 py-4 lg:whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                    <OrderIndicator order={req.order} />
                                    <div>
                                        <div id={`request-id-${req.id}`} className="text-sm font-semibold text-gray-900">{req.id}</div>
                                        <div className="text-xs text-gray-500">{req.requestDate}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 lg:whitespace-nowrap">
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
                            <td className="px-6 py-4 lg:whitespace-nowrap">
                                <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(req.status)}`}>
                                    {req.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-right lg:whitespace-nowrap">
                                <div className="flex items-center justify-end space-x-2">
                                    {req.status === ItemStatus.ARRIVED && !req.isRegistered ? (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onOpenStaging(req); }}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-white transition-all duration-200 bg-tm-primary rounded-lg shadow-sm hover:bg-tm-primary-hover"
                                            title="Catat sebagai Aset"
                                        >
                                          <RegisterIcon className="w-4 h-4"/>
                                          <span>Catat Aset</span>
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onDetailClick(req); }}
                                            className="flex items-center justify-center w-8 h-8 text-gray-500 transition-colors bg-gray-100 rounded-full hover:bg-info-light hover:text-info-text"
                                            title="Lihat Detail"
                                        >
                                          <EyeIcon className="w-5 h-5"/>
                                        </button>
                                    )}
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

type RequestItemForm = Omit<RequestItem, 'id'> & { 
    id: number;
    categoryId: string;
    typeId: string;
};

const RequestForm: React.FC<{ 
    currentUser: User; 
    assets: Asset[];
    assetCategories: AssetCategory[];
    divisions: Division[];
    onCreateRequest: (data: Omit<Request, 'id' | 'status' | 'logisticApprover' | 'logisticApprovalDate' | 'finalApprover' | 'finalApprovalDate' | 'rejectionReason' | 'rejectedBy' | 'rejectionDate' | 'rejectedByDivision'>) => void;
    prefillItem: { name: string; brand: string } | null;
    openModelModal: (category: AssetCategory, type: AssetType, onModelAdded: (model: StandardItem) => void) => void;
    openTypeModal: (category: AssetCategory, typeToEdit: AssetType | null, onTypeAdded: (type: AssetType) => void) => void;
    setActivePage: (page: Page, initialState?: any) => void;
}> = ({ currentUser, assets, assetCategories, divisions, onCreateRequest, prefillItem, openModelModal, openTypeModal, setActivePage }) => {
    const [requestDate, setRequestDate] = useState<Date | null>(new Date());
    const [requesterName, setRequesterName] = useState(currentUser.name);
    const [requesterDivision, setRequesterDivision] = useState('');
    const [order, setOrder] = useState('Regular Stock');
    const [lembar, setLembar] = useState<'1. Logistic' | '2. Divisi' | '3. Purchase'>('1. Logistic');
    const [items, setItems] = useState<RequestItemForm[]>([
        { id: Date.now(), categoryId: '', typeId: '', itemName: '', itemTypeBrand: '', stock: 0, quantity: 1, keterangan: '' }
    ]);
    const [isFooterVisible, setIsFooterVisible] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const footerRef = useRef<HTMLDivElement>(null);
    
    const orderOptions = [
        { value: 'Regular Stock', label: 'Regular Stock', indicator: <OrderIndicator order="Regular Stock" /> },
        { value: 'Urgent', label: 'Urgent', indicator: <OrderIndicator order="Urgent" /> },
        { value: 'Project Based', label: 'Project Based', indicator: <OrderIndicator order="Project Based" /> },
    ];
    
    const lembarOptions = [
        { value: '1. Logistic', label: '1. Logistic' },
        { value: '2. Divisi', label: '2. Divisi' },
        { value: '3. Purchase', label: '3. Purchase' },
    ];

    const formId = "item-request-form";

    useEffect(() => {
        const userDivision = divisions.find(d => d.id === currentUser.divisionId);
        if (userDivision) {
            setRequesterDivision(userDivision.name);
        }
    }, [currentUser, divisions]);

    useEffect(() => {
        if (prefillItem) {
            const stock = assets.filter(asset => asset.name === prefillItem.name && asset.status === AssetStatus.IN_STORAGE).length;
            const category = assetCategories.find(c => c.types.some(t => t.standardItems?.some(si => si.name === prefillItem?.name)));
            const type = category?.types.find(t => t.standardItems?.some(si => si.name === prefillItem?.name));
            
            setItems([
                {
                    id: Date.now(),
                    categoryId: category?.id.toString() || '',
                    typeId: type?.id.toString() || '',
                    itemName: prefillItem.name,
                    itemTypeBrand: prefillItem.brand,
                    stock: stock,
                    quantity: 1,
                    keterangan: 'Permintaan dari halaman stok.'
                }
            ]);
        }
    }, [prefillItem, assets, assetCategories]);

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
        setItems([...items, { id: Date.now(), categoryId: '', typeId: '', itemName: '', itemTypeBrand: '', stock: 0, quantity: 1, keterangan: '' }]);
    };

    const handleRemoveItem = (id: number) => {
        if (items.length > 1) {
            setItems(items.filter(item => item.id !== id));
        }
    };

    const handleItemChange = (id: number, field: keyof RequestItemForm, value: string | number) => {
        setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const handleCategoryChange = (id: number, categoryId: string) => {
        setItems(items.map(item => item.id === id ? { ...item, categoryId, typeId: '', itemName: '', itemTypeBrand: '', stock: 0 } : item));
    };

    const handleTypeChange = (id: number, typeId: string) => {
         setItems(items.map(item => item.id === id ? { ...item, typeId, itemName: '', itemTypeBrand: '', stock: 0 } : item));
    };

    const handleModelChange = (id: number, model: StandardItem) => {
        const stock = assets.filter(asset => asset.name === model.name && asset.status === AssetStatus.IN_STORAGE).length;
        setItems(items.map(item => item.id === id ? { ...item, itemName: model.name, itemTypeBrand: model.brand, stock } : item));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => { // Simulate API call
            const finalItems = items.map(({ categoryId, typeId, ...rest }) => rest);
            onCreateRequest({
                requester: requesterName,
                division: requesterDivision,
                requestDate: requestDate ? requestDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                order,
                lembar,
                items: finalItems,
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
                            readOnly
                            className="block w-full px-3 py-2 mt-1 text-gray-700 placeholder:text-gray-500 bg-gray-100 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-tm-accent focus:border-tm-accent sm:text-sm" 
                        />
                    </div>
                    <div>
                        <label htmlFor="division" className="block text-sm font-medium text-gray-700">Divisi</label>
                        <input 
                            type="text" 
                            id="division" 
                            value={requesterDivision}
                            onChange={(e) => setRequesterDivision(e.target.value)}
                            readOnly={!!currentUser.divisionId}
                            className="block w-full px-3 py-2 mt-1 text-gray-900 placeholder:text-gray-500 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-tm-accent focus:border-tm-accent sm:text-sm read-only:bg-gray-100 read-only:text-gray-700" 
                            placeholder="Contoh: IT, Marketing" 
                        />
                    </div>
                     <div>
                        <label htmlFor="docNumber" className="block text-sm font-medium text-gray-700">No Dokumen</label>
                        <input type="text" id="docNumber" readOnly className="block w-full px-3 py-2 mt-1 text-gray-700 bg-gray-100 border border-gray-200 rounded-lg shadow-sm sm:text-sm" value="[Otomatis]" />
                    </div>
                    <div>
                        <label htmlFor="requestNumber" className="block text-sm font-medium text-gray-700">No Request</label>
                        <input type="text" id="requestNumber" readOnly className="block w-full px-3 py-2 mt-1 text-gray-700 bg-gray-100 border border-gray-200 rounded-lg shadow-sm sm:text-sm" value="[Otomatis]" />
                    </div>
                     <div>
                        <label htmlFor="order" className="block text-sm font-medium text-gray-700">Order</label>
                        <div className="mt-1">
                           <CustomSelect
                                options={orderOptions}
                                value={order}
                                onChange={setOrder}
                            />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="lembar" className="block text-sm font-medium text-gray-700">Lembar</label>
                        <div className="mt-1">
                            <CustomSelect
                                options={lembarOptions}
                                value={lembar}
                                onChange={(newValue) => setLembar(newValue as any)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Item Details */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-tm-dark">Detail Permintaan Barang</h3>
                <button type="button" onClick={handleAddItem} className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 rounded-lg shadow-sm bg-tm-accent hover:bg-tm-primary">
                    Tambah Item
                </button>
            </div>

            <div className="space-y-6">
                {items.map((item, index) => {
                    const categoryOptions = assetCategories.map(c => ({ value: c.id.toString(), label: c.name }));
                    const selectedCategory = assetCategories.find(c => c.id.toString() === item.categoryId);
                    const availableTypes = selectedCategory?.types || [];
                    const typeOptions = availableTypes.map(t => ({ value: t.id.toString(), label: t.name }));
                    const selectedType = availableTypes.find(t => t.id.toString() === item.typeId);
                    const availableModels = selectedType?.standardItems || [];
                    const modelOptions = availableModels.map(m => ({ value: m.name, label: m.name }));
                    const unitOfMeasure = selectedType?.unitOfMeasure || 'unit';

                    return (
                        <div key={item.id} className="relative p-5 pt-6 bg-white border border-gray-200 rounded-xl shadow-sm">
                             <div className="absolute flex items-center justify-center w-8 h-8 font-bold text-white rounded-full -top-4 -left-4 bg-tm-primary">
                                {index + 1}
                            </div>
                            {items.length > 1 && (
                                <div className="absolute top-2 right-2">
                                    <button type="button" onClick={() => handleRemoveItem(item.id)} className="flex items-center justify-center w-8 h-8 text-gray-400 transition-colors rounded-full hover:bg-red-100 hover:text-red-500">
                                        <TrashIcon className="w-5 h-5"/>
                                    </button>
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-12">
                                <div className="md:col-span-4">
                                    <label className="block text-sm font-medium text-gray-600">Kategori</label>
                                    <CustomSelect 
                                        options={categoryOptions} 
                                        value={item.categoryId} 
                                        onChange={(value) => handleCategoryChange(item.id, value)} 
                                        placeholder="-- Pilih Kategori --"
                                        emptyStateMessage="Belum ada kategori."
                                        emptyStateButtonLabel="Buka Pengaturan Kategori"
                                        onEmptyStateClick={() => setActivePage('kategori')}
                                    />
                                </div>
                                <div className="md:col-span-4">
                                    <label className="block text-sm font-medium text-gray-600">Tipe Aset</label>
                                    <CustomSelect 
                                        options={typeOptions} 
                                        value={item.typeId} 
                                        onChange={(value) => handleTypeChange(item.id, value)} 
                                        placeholder="-- Pilih Tipe --" 
                                        disabled={!item.categoryId}
                                        emptyStateMessage="Tidak ada tipe untuk kategori ini."
                                        emptyStateButtonLabel="Tambah Tipe Aset"
                                        onEmptyStateClick={() => {
                                            if (selectedCategory) {
                                                openTypeModal(selectedCategory, null, (newType) => {
                                                    handleTypeChange(item.id, newType.id.toString());
                                                });
                                            }
                                        }}
                                    />
                                </div>
                                <div className="md:col-span-4">
                                    <label className="block text-sm font-medium text-gray-600">Model Barang Standar</label>
                                    <CustomSelect
                                        options={modelOptions}
                                        value={item.itemName}
                                        onChange={(value) => {
                                            const model = availableModels.find(m => m.name === value);
                                            if (model) handleModelChange(item.id, model);
                                        }}
                                        placeholder="-- Pilih Model --"
                                        disabled={!item.typeId}
                                        emptyStateMessage="Tidak ada model untuk tipe ini."
                                        emptyStateButtonLabel="Tambah Model Barang"
                                        onEmptyStateClick={() => {
                                            if (selectedCategory && selectedType) {
                                                openModelModal(selectedCategory, selectedType, (newModel) => {
                                                    handleModelChange(item.id, newModel);
                                                });
                                            }
                                        }}
                                    />
                                </div>
                                <div className="md:col-span-4">
                                    <label className="block text-sm font-medium text-gray-600">Brand</label>
                                    <input type="text" value={item.itemTypeBrand} readOnly className="block w-full px-3 py-2 mt-1 text-gray-700 bg-gray-100 border border-gray-200 rounded-lg shadow-sm sm:text-sm" placeholder="Otomatis" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-600">Stok Gudang</label>
                                    <input type="number" value={item.stock} readOnly className="block w-full px-3 py-2 mt-1 text-gray-700 bg-gray-100 border border-gray-200 rounded-lg shadow-sm sm:text-sm" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-600">Jumlah Req ({unitOfMeasure})</label>
                                    <input type="number" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value))} min="1" className="block w-full px-3 py-2 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg shadow-sm sm:text-sm" />
                                </div>
                                <div className="md:col-span-4">
                                    <label className="block text-sm font-medium text-gray-600">Keterangan</label>
                                    <input type="text" value={item.keterangan} onChange={(e) => handleItemChange(item.id, 'keterangan', e.target.value)} className="block w-full px-3 py-2 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg shadow-sm sm:text-sm" placeholder="Jelaskan kebutuhan" />
                                </div>
                            </div>
                        </div>
                    );
                })}
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

const ItemRequest: React.FC<ItemRequestProps> = ({ currentUser, requests, setRequests, assets, assetCategories, divisions, onInitiateRegistration, initialFilters, onClearInitialFilters, onShowPreview, openModelModal, openTypeModal, setActivePage }) => {
    const [view, setView] = useState<'list' | 'form'>('list');
    const [itemToPrefill, setItemToPrefill] = useState<{ name: string; brand: string } | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
    const [isProcurementModalOpen, setIsProcurementModalOpen] = useState(false);
    const [stagingRequest, setStagingRequest] = useState<Request | null>(null);
    const [estimatedDelivery, setEstimatedDelivery] = useState<Date | null>(new Date());
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
    const initialFilterState = { status: '' };
    const [filters, setFilters] = useState(initialFilterState);
    const [tempFilters, setTempFilters] = useState(filters);
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const filterPanelRef = useRef<HTMLDivElement>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const addNotification = useNotification();
    
    const statusOptions = [
        { value: 'awaiting-approval', label: 'Perlu Persetujuan' },
        ...Object.values(ItemStatus).map(s => ({ value: s, label: s }))
    ];

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (filterPanelRef.current && !filterPanelRef.current.contains(event.target as Node)) {
                setIsFilterPanelOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => { document.removeEventListener("mousedown", handleClickOutside); };
    }, [filterPanelRef]);

    useEffect(() => {
        if (initialFilters) {
            if (initialFilters.status) {
                setFilters({ status: initialFilters.status });
            }
            if (initialFilters.prefillItem) {
                setItemToPrefill(initialFilters.prefillItem);
                setView('form');
            }
            onClearInitialFilters();
        }
    }, [initialFilters, onClearInitialFilters]);

    useEffect(() => {
        if (initialFilters?.reopenStagingModalFor) {
            const requestId = initialFilters.reopenStagingModalFor;
            const requestToReopen = requests.find(r => r.id === requestId);
            // Hanya buka kembali jika requestnya belum selesai
            if (requestToReopen && requestToReopen.status !== ItemStatus.COMPLETED) {
                setStagingRequest(requestToReopen);
            }
            onClearInitialFilters();
        }
    }, [initialFilters, requests, onClearInitialFilters]);

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
                if (!filters.status) return true;
                if (filters.status === 'awaiting-approval') {
                    return [ItemStatus.PENDING, ItemStatus.LOGISTIC_APPROVED].includes(req.status);
                }
                return req.status === filters.status;
            });
    }, [requests, searchQuery, filters]);

    const { items: sortedRequests, requestSort, sortConfig } = useSortableData(filteredRequests, { key: 'requestDate', direction: 'descending' });

    const totalItems = sortedRequests.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedRequests = sortedRequests.slice(startIndex, endIndex);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filters, itemsPerPage]);

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
        setIsDetailModalOpen(false);
        setIsRejectionModalOpen(true);
    };

    const handleCloseRejectionModal = () => {
        setIsRejectionModalOpen(false);
        setRejectionReason('');
        setSelectedRequest(null);
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
            const today = new Date().toISOString().split('T')[0];
            let approved = false;
            let finalStatus: ItemStatus | null = null;
            setRequests(prevRequests =>
                prevRequests.map(req => {
                    if (req.id === requestId) {
                        if (req.status === ItemStatus.PENDING && (currentUser.role === 'Admin' || currentUser.role === 'Super Admin')) {
                            approved = true;
                            finalStatus = ItemStatus.LOGISTIC_APPROVED;
                            return { ...req, status: ItemStatus.LOGISTIC_APPROVED, logisticApprover: currentUser.name, logisticApprovalDate: today };
                        }
                        if (req.status === ItemStatus.LOGISTIC_APPROVED && currentUser.role === 'Super Admin') {
                            approved = true;
                            finalStatus = ItemStatus.APPROVED;
                            return { ...req, status: ItemStatus.APPROVED, finalApprover: currentUser.name, finalApprovalDate: today };
                        }
                    }
                    return req;
                })
            );
            if (approved && finalStatus) {
                addNotification('Request berhasil disetujui.', 'success');
                // Update selectedRequest state for modal UI to react
                setSelectedRequest(prev => {
                    if (!prev || prev.id !== requestId) return prev;
                    if (finalStatus === ItemStatus.LOGISTIC_APPROVED) {
                        return {...prev, status: finalStatus, logisticApprover: currentUser.name, logisticApprovalDate: today};
                    }
                    if (finalStatus === ItemStatus.APPROVED) {
                        return {...prev, status: finalStatus, finalApprover: currentUser.name, finalApprovalDate: today};
                    }
                    return prev;
                });
            }
            setIsLoading(false);
        }, 1000);
    };

    const handleStartProcurement = () => {
        setIsDetailModalOpen(false);
        setIsProcurementModalOpen(true);
    };
    
    const handleConfirmProcurement = () => {
        if (!selectedRequest || !estimatedDelivery) return;
        setIsLoading(true);
        setTimeout(() => {
            const updatedRequest: Request = { 
                ...selectedRequest, 
                status: ItemStatus.PURCHASING,
                estimatedDeliveryDate: estimatedDelivery.toISOString().split('T')[0]
            };
            setRequests(prev => prev.map(r => r.id === selectedRequest.id ? updatedRequest : r));
            addNotification(`Proses pengadaan untuk ${selectedRequest.id} dimulai.`, 'success');
            setIsProcurementModalOpen(false);
            setSelectedRequest(null);
            setIsLoading(false);
        }, 1000);
    };

    const handleUpdateRequestStatus = (newStatus: ItemStatus) => {
        if (!selectedRequest) return;
        setIsLoading(true);
        setTimeout(() => {
            let updatedRequest: Request = { ...selectedRequest, status: newStatus };
            if (newStatus === ItemStatus.ARRIVED) {
                updatedRequest = {
                    ...updatedRequest,
                    arrivalDate: new Date().toISOString().split('T')[0],
                    receivedBy: currentUser.name,
                };
            }
            setRequests(prev => prev.map(r => r.id === selectedRequest.id ? updatedRequest : r));
            addNotification(`Status request ${selectedRequest.id} diubah menjadi "${newStatus}".`, 'success');
            setSelectedRequest(updatedRequest); // Update state in modal
            setIsLoading(false);
        }, 1000);
    };
    
    const handleConfirmRejection = () => {
        if (!selectedRequest || !rejectionReason.trim()) {
            addNotification('Alasan penolakan harus diisi.', 'error');
            return;
        }
        setIsLoading(true);
        setTimeout(() => { // Simulate API Call
            const today = new Date().toISOString().split('T')[0];
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
            const today = new Date().toISOString().split('T')[0];
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
            const today = new Date().toISOString().split('T')[0];
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
        
        const canAdminApprove = selectedRequest.status === ItemStatus.PENDING && (currentUser.role === 'Admin' || currentUser.role === 'Super Admin');
        const canSuperAdminApprove = selectedRequest.status === ItemStatus.LOGISTIC_APPROVED && currentUser.role === 'Super Admin';
        
        const canReject = (selectedRequest.status === ItemStatus.PENDING || selectedRequest.status === ItemStatus.LOGISTIC_APPROVED) && 
                          (currentUser.role === 'Admin' || currentUser.role === 'Super Admin');

        const canStartProcurement = selectedRequest.status === ItemStatus.APPROVED;
        const canConfirmShipment = selectedRequest.status === ItemStatus.PURCHASING;
        const canConfirmArrival = selectedRequest.status === ItemStatus.IN_DELIVERY;
        const canRegister = selectedRequest.status === ItemStatus.ARRIVED && !selectedRequest.isRegistered;

        return (
            <div className="flex items-center justify-end flex-1 space-x-3">
                 {canRegister && (
                    <button type="button" onClick={() => { setStagingRequest(selectedRequest); handleCloseDetailModal(); }} className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 bg-tm-primary rounded-lg shadow-sm hover:bg-tm-primary-hover"><RegisterIcon className="w-4 h-4" />Catat sebagai Aset</button>
                )}
                {canConfirmArrival && (
                    <button type="button" onClick={() => handleUpdateRequestStatus(ItemStatus.ARRIVED)} disabled={isLoading} className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 bg-green-600 rounded-lg shadow-sm hover:bg-green-700">{isLoading ? <SpinnerIcon /> : <ArchiveBoxIcon className="w-4 h-4" />}Konfirmasi Tiba</button>
                )}
                {canConfirmShipment && (
                    <button type="button" onClick={() => handleUpdateRequestStatus(ItemStatus.IN_DELIVERY)} disabled={isLoading} className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 bg-purple-600 rounded-lg shadow-sm hover:bg-purple-700">{isLoading ? <SpinnerIcon /> : <TruckIcon className="w-4 h-4" />}Konfirmasi Kirim</button>
                )}
                 {canStartProcurement && (
                    <button type="button" onClick={handleStartProcurement} disabled={isLoading} className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700">{isLoading ? <SpinnerIcon /> : <ShoppingCartIcon className="w-4 h-4" />}Mulai Pengadaan</button>
                )}
                {canReject && (
                    <button type="button" onClick={handleOpenRejectionModal} disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white transition-colors duration-200 bg-danger rounded-lg shadow-sm hover:bg-red-700 disabled:bg-red-400">Tolak</button>
                )}
                {(canAdminApprove || canSuperAdminApprove) && (
                    <button type="button" onClick={() => handleApproval(selectedRequest.id)} disabled={isLoading} className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white transition-colors duration-200 bg-success rounded-lg shadow-sm hover:bg-green-700 disabled:bg-green-400">{isLoading ? <SpinnerIcon className="w-5 h-5 mr-2"/> : null}{isLoading ? 'Memproses...' : 'Setujui'}</button>
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
                        <RequestForm currentUser={currentUser} assets={assets} assetCategories={assetCategories} divisions={divisions} onCreateRequest={handleCreateRequest} prefillItem={itemToPrefill} openModelModal={openModelModal} openTypeModal={openTypeModal} setActivePage={setActivePage} />
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
                    <div className="flex flex-wrap items-center gap-4">
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
                        
                        <div className="relative" ref={filterPanelRef}>
                            <button
                                onClick={() => {
                                    setTempFilters(filters);
                                    setIsFilterPanelOpen(p => !p);
                                }}
                                className="inline-flex items-center justify-center gap-2 w-full h-10 px-4 text-sm font-semibold text-gray-700 transition-all duration-200 bg-white border border-gray-300 rounded-lg shadow-sm sm:w-auto hover:bg-gray-50"
                            >
                                <FilterIcon className="w-4 h-4" />
                                <span>Filter</span>
                                {activeFilterCount > 0 && (
                                    <span className="px-2 py-0.5 text-xs font-bold text-white rounded-full bg-tm-primary">{activeFilterCount}</span>
                                )}
                            </button>
                            {isFilterPanelOpen && (
                                <>
                                    <div onClick={() => setIsFilterPanelOpen(false)} className="fixed inset-0 z-20 bg-black/25 sm:hidden" />
                                    <div className="fixed top-32 inset-x-4 z-30 origin-top rounded-xl border border-gray-200 bg-white shadow-lg sm:absolute sm:top-full sm:inset-x-auto sm:right-0 sm:mt-2 sm:w-72">
                                        <div className="flex items-center justify-between p-4 border-b">
                                            <h3 className="text-lg font-semibold text-gray-800">Filter Request</h3>
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
                    
                    {activeFilterCount > 0 && (
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
                
                <div className="overflow-hidden bg-white border border-gray-200/80 rounded-xl shadow-md">
                    <div className="overflow-x-auto custom-scrollbar">
                       <RequestTable 
                            requests={paginatedRequests} 
                            onDetailClick={handleShowDetails} 
                            onDeleteClick={setRequestToDeleteId} 
                            onOpenStaging={setStagingRequest}
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

    const showProcurement = selectedRequest && [ItemStatus.APPROVED, ItemStatus.PURCHASING, ItemStatus.IN_DELIVERY, ItemStatus.ARRIVED, ItemStatus.COMPLETED].includes(selectedRequest.status);

    return (
        <>
            {renderContent()}

            {stagingRequest && (
                <RegistrationStagingModal
                    isOpen={!!stagingRequest}
                    onClose={() => setStagingRequest(null)}
                    request={stagingRequest}
                    onInitiateRegistration={(item) => {
                        onInitiateRegistration(stagingRequest, item);
                        setStagingRequest(null);
                    }}
                />
            )}
            
            {selectedRequest && (
                <Modal
                    isOpen={isDetailModalOpen}
                    onClose={handleCloseDetailModal}
                    title=""
                    size="3xl"
                    footerContent={renderApprovalActions()}
                    disableContentPadding
                >
                    <div className="p-6">
                        <Letterhead />

                        <div className="text-center mb-6">
                            <h3 className="text-xl font-bold uppercase text-tm-dark">Surat Permintaan Pembelian Barang</h3>
                            <p className="text-sm text-tm-secondary">Nomor: {selectedRequest.id}</p>
                        </div>

                        <div className="space-y-6 text-sm">
                            {/* Section I: Detail Dokumen & Pemohon */}
                            <section>
                                <h4 className="font-semibold text-gray-800 border-b pb-1 mb-2">I. Detail Dokumen</h4>
                                <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-3">
                                    <PreviewItem label="Tanggal Request" value={selectedRequest.requestDate} />
                                    <PreviewItem label="Pemohon" value={selectedRequest.requester} />
                                    <PreviewItem label="Divisi" value={selectedRequest.division} />
                                    <PreviewItem label="Tipe Order">
                                        <div className="flex items-center gap-2">
                                            <OrderIndicator order={selectedRequest.order} />
                                            <span>{selectedRequest.order}</span>
                                        </div>
                                    </PreviewItem>
                                    <PreviewItem label="Lembar" value={selectedRequest.lembar} />
                                    <PreviewItem label="Status Saat Ini">
                                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(selectedRequest.status)}`}>
                                            {selectedRequest.status}
                                        </span>
                                    </PreviewItem>
                                </dl>
                            </section>

                            {/* Section II: Rincian Barang */}
                            <section>
                                <h4 className="font-semibold text-gray-800 border-b pb-1 mb-2">II. Rincian Barang yang Diminta</h4>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-100 text-xs uppercase text-gray-700">
                                            <tr>
                                                <th className="p-2 w-10">No.</th>
                                                <th className="p-2">Nama Barang</th>
                                                <th className="p-2">Tipe/Brand</th>
                                                <th className="p-2 text-center w-20">Jumlah</th>
                                                <th className="p-2">Keterangan</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedRequest.items.map((item, index) => (
                                                <tr key={item.id} className="border-b">
                                                    <td className="p-2 text-center text-gray-800">{index + 1}.</td>
                                                    <td className="p-2 font-semibold text-gray-800">{item.itemName}</td>
                                                    <td className="p-2 text-gray-600">{item.itemTypeBrand}</td>
                                                    <td className="p-2 text-center font-medium text-gray-800">{item.quantity} unit</td>
                                                    <td className="p-2 text-xs italic text-gray-600">"{item.keterangan}"</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                            {/* Section III: Progres Pengadaan (if applicable) */}
                            {showProcurement && (
                                <section>
                                    <h4 className="font-semibold text-gray-800 border-b pb-1 mb-2">III. Progres Pengadaan</h4>
                                    <ProcurementTimeline request={selectedRequest} />
                                </section>
                            )}
                            
                            {selectedRequest.isRegistered && (
                                <section className="pt-4 text-sm border-t">
                                    <span className="font-semibold text-gray-600">Aset Terkait: </span>
                                    {assets.filter(a => a.woRoIntNumber === selectedRequest.id).map(asset => (
                                        <ClickableLink key={asset.id} onClick={() => onShowPreview({ type: 'asset', id: asset.id })}>
                                            {asset.id}
                                        </ClickableLink>
                                    ))}
                                </section>
                            )}
                            
                            {/* Section IV: Progres Persetujuan */}
                            <section className="pt-6">
                                <h4 className="font-semibold text-gray-800 border-b pb-1 mb-4">{selectedRequest.status === ItemStatus.REJECTED ? 'Status Penolakan' : `${showProcurement ? 'IV.' : 'III.'} Progres Persetujuan`}</h4>
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
                                        <ApprovalBox title="Request" signer={selectedRequest.requester} date={selectedRequest.requestDate} division={selectedRequest.division} isSigned={true} />
                                        <ApprovalBox title="Logistic" signer={selectedRequest.logisticApprover} date={selectedRequest.logisticApprovalDate} division="Inventori" isSigned={!!selectedRequest.logisticApprover} />
                                        <ApprovalBox title="CEO / Approval" signer={selectedRequest.finalApprover} date={selectedRequest.finalApprovalDate} division="Manajemen" isSigned={!!selectedRequest.finalApprover} />
                                    </div>
                                )}
                            </section>
                        </div>
                    </div>
                </Modal>
            )}

             {isProcurementModalOpen && (
                <Modal
                    isOpen={isProcurementModalOpen}
                    onClose={() => { setIsProcurementModalOpen(false); setSelectedRequest(null); }}
                    title={`Mulai Pengadaan untuk ${selectedRequest?.id}`}
                    size="md"
                    hideDefaultCloseButton
                    footerContent={
                        <>
                            <button onClick={() => { setIsProcurementModalOpen(false); setSelectedRequest(null); }} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Batal</button>
                            <button onClick={handleConfirmProcurement} disabled={!estimatedDelivery || isLoading} className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-tm-primary rounded-lg shadow-sm hover:bg-tm-primary-hover disabled:bg-tm-primary/70">{isLoading && <SpinnerIcon className="w-4 h-4 mr-2" />}Konfirmasi</button>
                        </>
                    }
                >
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">Silakan masukkan estimasi tanggal barang akan tiba di gudang.</p>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Estimasi Tanggal Tiba</label>
                            <DatePicker id="est-delivery" selectedDate={estimatedDelivery} onDateChange={setEstimatedDelivery} disablePastDates />
                        </div>
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
                                className="block w-full px-3 py-2 mt-1 text-gray-900 placeholder:text-gray-400 bg-gray-50 border border-gray-300 rounded-lg shadow-sm sm:text-sm focus:ring-tm-accent focus:border-tm-accent"
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
                                className="block w-full px-3 py-2 mt-1 text-gray-900 placeholder:text-gray-400 bg-gray-50 border border-gray-300 rounded-lg shadow-sm sm:text-sm focus:ring-tm-accent focus:border-tm-accent"
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

const ProcurementTimeline: React.FC<{ request: Request }> = ({ request }) => {
    const statuses = [ItemStatus.APPROVED, ItemStatus.PURCHASING, ItemStatus.IN_DELIVERY, ItemStatus.ARRIVED, ItemStatus.COMPLETED];
    const currentStatusIndex = statuses.indexOf(request.status);

    const getStepDetails = (status: ItemStatus) => {
        switch (status) {
            case ItemStatus.APPROVED:
                return { label: 'Disetujui', icon: CheckIcon, date: request.finalApprovalDate };
            case ItemStatus.PURCHASING:
                return { label: 'Pengadaan', icon: ShoppingCartIcon, date: request.estimatedDeliveryDate ? `Estimasi: ${request.estimatedDeliveryDate}` : null };
            case ItemStatus.IN_DELIVERY:
                return { label: 'Dikirim', icon: TruckIcon, date: null };
            case ItemStatus.ARRIVED:
                return { label: 'Tiba', icon: ArchiveBoxIcon, date: request.arrivalDate ? `Pada: ${request.arrivalDate}`: null };
            case ItemStatus.COMPLETED:
                return { label: 'Selesai', icon: RegisterIcon, date: request.isRegistered ? 'Aset Dicatat' : null };
            default:
                return { label: 'Unknown', icon: CheckIcon, date: null };
        }
    };

    return (
        <div className="p-4 bg-gray-50 rounded-lg">
            <ol className="flex items-start">
                {statuses.map((status, index) => {
                    const stepDetails = getStepDetails(status);
                    const isCompleted = currentStatusIndex > index || (request.status === ItemStatus.COMPLETED && request.isRegistered);
                    const isCurrent = currentStatusIndex === index && request.status !== ItemStatus.COMPLETED;
                    
                    const iconColor = isCompleted || isCurrent ? 'text-white' : 'text-gray-500';
                    const bgColor = isCompleted ? 'bg-success' : isCurrent ? 'bg-tm-primary' : 'bg-gray-200';
                    const textColor = isCompleted || isCurrent ? 'text-gray-800' : 'text-gray-500';
                    const lineColor = isCompleted ? 'border-success' : 'border-gray-300';

                    return (
                        <li key={status} className="relative flex-1 flex flex-col items-center text-center">
                            <div className="flex items-center w-full">
                                <div className={`flex-1 h-0.5 ${index === 0 ? 'bg-transparent' : isCompleted ? 'bg-success' : 'bg-gray-300'}`}></div>
                                <div className={`relative flex items-center justify-center w-10 h-10 rounded-full shrink-0 z-10 ${bgColor} transition-colors`}>
                                   {isCompleted ? <CheckIcon className="w-5 h-5 text-white" /> : <stepDetails.icon className={`w-5 h-5 ${iconColor} transition-colors`} />}
                                </div>
                                <div className={`flex-1 h-0.5 ${index === statuses.length - 1 ? 'bg-transparent' : isCompleted ? 'bg-success' : 'bg-gray-300'}`}></div>
                            </div>
                            <div className="mt-2 w-full">
                                <h3 className={`text-xs font-semibold ${textColor} transition-colors`}>{stepDetails.label}</h3>
                                {stepDetails.date && <p className="text-[10px] text-gray-500">{stepDetails.date}</p>}
                            </div>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
};

const ApprovalBox: React.FC<{title: string; signer: string | null; date: string | null; division: string; isSigned: boolean}> = ({ title, signer, date, division, isSigned }) => {
    const isApprovalStep = title === 'Logistic' || title === 'CEO / Approval';
    
    return (
        <div>
            <p className="font-semibold text-gray-600">{title}</p>
            <div className="flex items-center justify-center mt-2 border border-gray-200 rounded-md h-32 bg-gray-50/50">
                {isSigned ? (
                    isApprovalStep ? (
                        <ApprovalStamp approverName={signer!} approvalDate={date!} approverDivision={`Divisi ${division}`} />
                    ) : (
                        <SignatureStamp signerName={signer!} signatureDate={date!} signerDivision={`Divisi ${division}`} />
                    )
                ) : (
                    <span className="text-sm italic text-gray-400">Menunggu Persetujuan</span>
                )}
            </div>
            <div className="pt-1 mt-2 text-center">
                <p className="text-sm text-gray-800 font-medium">({signer || '.........................'})</p>
            </div>
        </div>
    );
};

const PreviewItem: React.FC<{ label: string; value?: React.ReactNode; children?: React.ReactNode; }> = ({ label, value, children }) => (
    <div>
        <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</dt>
        <dd className="mt-1 text-gray-800">{value || children || '-'}</dd>
    </div>
);

const RegistrationStagingModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    request: Request;
    onInitiateRegistration: (item: RequestItem) => void;
}> = ({ isOpen, onClose, request, onInitiateRegistration }) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Pencatatan Aset untuk Request #${request.id}`}
            size="xl"
            hideDefaultCloseButton
        >
            <div className="space-y-4">
                <p className="text-sm text-gray-600">
                    Barang untuk request ini telah tiba. Silakan catat setiap item di bawah ini untuk dimasukkan ke dalam daftar aset.
                </p>
                <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar -mx-2 px-2">
                    {request.items.map(item => {
                        const registeredCount = request.partiallyRegisteredItems?.[item.id] || 0;
                        const isCompleted = registeredCount >= item.quantity;
                        const progress = (registeredCount / item.quantity) * 100;

                        return (
                            <div key={item.id} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-800">{item.itemName}</p>
                                    <p className="text-xs text-gray-500">{item.itemTypeBrand}</p>
                                    <div className="mt-2">
                                        <div className="flex justify-between mb-1 text-xs">
                                            <span className="font-medium text-gray-700">Progres Pencatatan</span>
                                            <span className="text-gray-500">{registeredCount} / {item.quantity} Aset</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div 
                                                className={`h-2.5 rounded-full transition-all duration-500 ${isCompleted ? 'bg-success' : 'bg-tm-primary'}`} 
                                                style={{ width: `${progress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-shrink-0">
                                    <button 
                                        onClick={() => onInitiateRegistration(item)}
                                        disabled={isCompleted}
                                        className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 text-sm font-semibold text-white transition-all duration-200 bg-tm-accent rounded-lg shadow-sm hover:bg-tm-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >
                                        <RegisterIcon className="w-4 h-4"/>
                                        {isCompleted ? 'Selesai' : `Catat (${item.quantity - registeredCount})`}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </Modal>
    );
}


export default ItemRequest;