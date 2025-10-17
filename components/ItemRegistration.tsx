import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Asset, AssetStatus, AssetCondition, Attachment, Request, User, Customer, Handover, Dismantle, ActivityLogEntry, PreviewData, AssetCategory, StandardItem, Page, AssetType, RequestItem, ParsedScanResult } from '../types';
import Modal from './shared/Modal';
import DatePicker from './shared/DatePicker';
import { InfoIcon } from './icons/InfoIcon';
import { DollarIcon } from './icons/DollarIcon';
import { WrenchIcon } from './icons/WrenchIcon';
import { PaperclipIcon } from './icons/PaperclipIcon';
import { TrashIcon } from './icons/TrashIcon';
import { EyeIcon } from './icons/EyeIcon';
import FloatingActionBar from './shared/FloatingActionBar';
import { useNotification } from './shared/Notification';
import { InboxIcon } from './icons/InboxIcon';
import { useSortableData, SortConfig } from '../hooks/useSortableData';
import { exportToCSV } from '../utils/csvExporter';
import { Checkbox } from './shared/Checkbox';
import { SortAscIcon } from './icons/SortAscIcon';
import { SortDescIcon } from './icons/SortDescIcon';
import { SortIcon } from './icons/SortIcon';
import { ExportIcon } from './icons/ExportIcon';
import { useLongPress } from '../hooks/useLongPress';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { SearchIcon } from './icons/SearchIcon';
import { CloseIcon } from './icons/CloseIcon';
import { PaginationControls } from './shared/PaginationControls';
import { HandoverIcon } from './icons/HandoverIcon';
import { CustomerIcon } from './icons/CustomerIcon';
import { DismantleIcon } from './icons/DismantleIcon';
import { RegisterIcon } from './icons/RegisterIcon';
import { RequestIcon } from './icons/RequestIcon';
import { CopyIcon } from './icons/CopyIcon';
import { QrCodeIcon } from './icons/QrCodeIcon';
import { PencilIcon } from './icons/PencilIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { TagIcon } from './icons/TagIcon';
import { UsersIcon } from './icons/UsersIcon';
import { Tooltip } from './shared/Tooltip';
import { ClickableLink } from './shared/ClickableLink';
import { CustomSelect } from './shared/CustomSelect';
import { DownloadIcon } from './icons/DownloadIcon';
import { FilterIcon } from './icons/FilterIcon';
import { ArchiveBoxIcon } from './icons/ArchiveBoxIcon';

declare var QRCode: any;
declare var Html5Qrcode: any;

// Universal parser for QR and Barcodes
export const parseScanData = (data: string): ParsedScanResult => {
    const raw = data.trim();
    let result: ParsedScanResult = { raw };

    // Regex patterns
    const MAC_REGEX = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$|^([0-9A-Fa-f]{12})$/;
    const ASSET_ID_REGEX = /^AST-\d{4,}$/;
    const SERIAL_NUMBER_REGEX = /^[A-Z0-9-]{6,}$/i;

    // 1. Try to parse as "Smart QR" JSON
    try {
        const jsonData = JSON.parse(raw);
        if (jsonData.type === 'asset' && (jsonData.id || jsonData.sn || jsonData.mac)) {
            result.id = jsonData.id;
            result.serialNumber = jsonData.sn;
            result.macAddress = jsonData.mac ? jsonData.mac.replace(/[:-]/g, '').toUpperCase() : undefined;
            // FIX: Add name property from parsed QR JSON data to display in scanner feedback.
            if (jsonData.name) {
                result.name = jsonData.name;
            }
            return result;
        }
    } catch (e) {
        // Not a JSON, continue
    }

    // 2. Try to parse as key-value pairs (e.g., "SN:123, MAC:ABC")
    const pairs = raw.split(/[,;\n\r]/).map(p => p.trim());
    let foundKeyValue = false;
    for (const pair of pairs) {
        const parts = pair.split(/[:=]/).map(p => p.trim());
        if (parts.length === 2) {
            const key = parts[0].toLowerCase();
            const value = parts[1];
            if (key.includes('sn') || key.includes('serial')) {
                result.serialNumber = value;
                foundKeyValue = true;
            } else if (key.includes('mac')) {
                result.macAddress = value.replace(/[:-]/g, '').toUpperCase();
                foundKeyValue = true;
            }
        }
    }
    if (foundKeyValue) {
        return result;
    }
    
    // 3. If not key-value, identify the raw string's format
    if (ASSET_ID_REGEX.test(raw)) {
        result.id = raw;
        return result;
    }

    if (MAC_REGEX.test(raw)) {
        result.macAddress = raw.replace(/[:-]/g, '').toUpperCase();
        return result;
    }
    
    if (SERIAL_NUMBER_REGEX.test(raw)) {
        result.serialNumber = raw;
        return result;
    }

    return result;
};


interface ItemRegistrationProps {
    currentUser: User;
    assets: Asset[];
    setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
    customers: Customer[];
    requests: Request[];
    handovers: Handover[];
    dismantles: Dismantle[];
    assetCategories: AssetCategory[];
    prefillData?: { request: Request; itemToRegister?: RequestItem } | null;
    onClearPrefill: () => void;
    onRegistrationComplete: (requestId: string, registeredItemInfo: { requestItemId: number; count: number }) => void;
    onInitiateHandover: (asset: Asset) => void;
    onInitiateDismantle: (asset: Asset) => void;
    onInitiateInstallation: (asset: Asset) => void;
    assetToViewId: string | null;
    initialFilters?: any;
    onClearInitialFilters: () => void;
    itemToEdit: { type: string; data: any } | null;
    onClearItemToEdit: () => void;
    onShowPreview: (data: PreviewData) => void;
    setActivePage: (page: Page, initialState?: any) => void;
    openModelModal: (category: AssetCategory, type: AssetType, onModelAdded: (model: StandardItem) => void) => void;
    openTypeModal: (category: AssetCategory, typeToEdit: AssetType | null, onTypeAdded: (type: AssetType) => void) => void;
    setIsGlobalScannerOpen: (isOpen: boolean) => void;
    setScanContext: (context: 'global' | 'form') => void;
    setFormScanCallback: (callback: ((data: ParsedScanResult) => void) | null) => void;
}

const assetLocations = [
    'Gudang Inventori',
    'Data Center Lt. 1',
    'POP Cempaka Putih',
    'Gudang Teknisi',
    'Kantor Marketing',
    'Mobil Tim Engineer',
    'Kantor Engineer',
    'Kantor NOC',
];

export const getStatusClass = (status: AssetStatus) => {
    switch (status) {
        case AssetStatus.IN_USE: return 'bg-info-light text-info-text';
        case AssetStatus.IN_STORAGE: return 'bg-gray-100 text-gray-800';
        case AssetStatus.DAMAGED: return 'bg-warning-light text-warning-text';
        case AssetStatus.DECOMMISSIONED: return 'bg-red-200 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const SortableHeader: React.FC<{
    children: React.ReactNode;
    columnKey: keyof Asset;
    sortConfig: SortConfig<Asset> | null;
    requestSort: (key: keyof Asset) => void;
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

interface RegistrationTableProps {
    assets: Asset[];
    customers: Customer[];
    onDetailClick: (asset: Asset) => void;
    onDeleteClick: (id: string) => void;
    sortConfig: SortConfig<Asset> | null;
    requestSort: (key: keyof Asset) => void;
    selectedAssetIds: string[];
    onSelectOne: (id: string) => void;
    onSelectAll: (event: React.ChangeEvent<HTMLInputElement>) => void;
    isBulkSelectMode: boolean;
    onEnterBulkMode: () => void;
    onShowPreview: (data: PreviewData) => void;
}

const RegistrationTable: React.FC<RegistrationTableProps> = ({ assets, customers, onDetailClick, onDeleteClick, sortConfig, requestSort, selectedAssetIds, onSelectOne, onSelectAll, isBulkSelectMode, onEnterBulkMode, onShowPreview }) => {
    const longPressHandlers = useLongPress(onEnterBulkMode, 500);

    const handleRowClick = (asset: Asset) => {
        if (isBulkSelectMode) {
            onSelectOne(asset.id);
        } else {
            onDetailClick(asset);
        }
    };

    return (
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="sticky top-0 z-10 bg-gray-50">
                <tr>
                    {isBulkSelectMode && (
                        <th scope="col" className="px-6 py-3">
                            <Checkbox
                                checked={selectedAssetIds.length === assets.length && assets.length > 0}
                                onChange={onSelectAll}
                                aria-label="Pilih semua aset"
                            />
                        </th>
                    )}
                    <SortableHeader columnKey="name" sortConfig={sortConfig} requestSort={requestSort}>Aset</SortableHeader>
                    <SortableHeader columnKey="location" sortConfig={sortConfig} requestSort={requestSort}>Lokasi / Pengguna</SortableHeader>
                    <SortableHeader columnKey="status" sortConfig={sortConfig} requestSort={requestSort}>Status</SortableHeader>
                    <th className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {assets.length > 0 ? (
                    assets.map((asset) => (
                        <tr 
                            key={asset.id} 
                            {...longPressHandlers}
                            onClick={() => handleRowClick(asset)}
                            className={`transition-colors cursor-pointer ${
                                selectedAssetIds.includes(asset.id) 
                                    ? 'bg-blue-50' 
                                    : asset.isDismantled 
                                    ? 'bg-amber-50 hover:bg-amber-100' 
                                    : 'hover:bg-gray-50'
                            }`}
                        >
                            {isBulkSelectMode && (
                                <td className="px-6 py-4 align-top" onClick={(e) => e.stopPropagation()}>
                                    <Checkbox
                                        checked={selectedAssetIds.includes(asset.id)}
                                        onChange={() => onSelectOne(asset.id)}
                                        aria-labelledby={`asset-name-${asset.id}`}
                                    />
                                </td>
                            )}
                            <td id={`asset-name-${asset.id}`} className="px-6 py-4 lg:whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-gray-900">{asset.name}</span>
                                    {asset.lastModifiedDate && (
                                        <span title={`Diubah: ${new Date(asset.lastModifiedDate).toLocaleString('id-ID')} oleh ${asset.lastModifiedBy}`}>
                                            <PencilIcon className="w-3.5 h-3.5 text-gray-400" />
                                        </span>
                                    )}
                                    {asset.isDismantled && (
                                        <span className="px-2 py-0.5 text-xs font-semibold text-amber-800 bg-amber-100 rounded-full">
                                            Dismantled
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs text-gray-500">{asset.id} &bull; {asset.category}</div>
                            </td>
                            <td className="px-6 py-4 lg:whitespace-nowrap">
                                {(() => {
                                    if (asset.currentUser && asset.currentUser.startsWith('TMI-')) {
                                        const customer = customers.find(c => c.id === asset.currentUser);
                                        return (
                                            <div className="flex items-center gap-2">
                                                <CustomerIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                                <div>
                                                    <div className="text-sm font-medium text-tm-dark">
                                                         <ClickableLink onClick={() => onShowPreview({ type: 'customer', id: customer!.id })}>
                                                            {customer ? customer.name : 'Terpasang di Pelanggan'}
                                                        </ClickableLink>
                                                    </div>
                                                    <div className="text-xs text-tm-secondary">ID: {asset.currentUser}</div>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return (
                                        <>
                                            <div className="text-sm font-medium text-gray-800">{asset.location || '-'}</div>
                                            <div className="text-xs text-gray-500">{asset.currentUser || 'Tidak ada pengguna'}</div>
                                        </>
                                    );
                                })()}
                            </td>
                            <td className="px-6 py-4 lg:whitespace-nowrap">
                                {asset.isDismantled && asset.status === AssetStatus.IN_STORAGE ? (
                                    <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-warning-light text-warning-text">
                                        Disimpan (Dismantle)
                                    </span>
                                ) : (
                                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(asset.status)}`}>
                                        {asset.status}
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-right lg:whitespace-nowrap">
                                <div className="flex items-center justify-end space-x-2">
                                   <button onClick={(e) => { e.stopPropagation(); onDetailClick(asset); }} className="flex items-center justify-center w-8 h-8 text-gray-500 transition-colors bg-gray-100 rounded-full hover:bg-info-light hover:text-info-text" title="Lihat Detail"><EyeIcon className="w-5 h-5"/></button>
                                    <button onClick={(e) => { e.stopPropagation(); onDeleteClick(asset.id); }} className="flex items-center justify-center w-8 h-8 text-gray-500 transition-colors bg-gray-100 rounded-full hover:bg-danger-light hover:text-danger-text" title="Hapus"><TrashIcon className="w-5 h-5"/></button>
                                </div>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={isBulkSelectMode ? 5 : 4} className="px-6 py-12 text-center text-gray-500">
                            <div className="flex flex-col items-center">
                                <InboxIcon className="w-12 h-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak Ada Data Aset</h3>
                                <p className="mt-1 text-sm text-gray-500">Ubah filter atau buat aset baru.</p>
                            </div>
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    );
};

const DetailCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h3 className="text-base font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-4">{title}</h3>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 text-sm">
            {children}
        </dl>
    </div>
);

interface DetailItemProps {
    label: string;
    value?: React.ReactNode;
    children?: React.ReactNode;
    fullWidth?: boolean;
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value, children, fullWidth = false }) => (
    <div className={fullWidth ? 'sm:col-span-2' : ''}>
        <dt className="font-medium text-gray-500">{label}</dt>
        <dd className="mt-1 text-gray-900">
            {value || children || '-'}
        </dd>
    </div>
);

const FormSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; className?: string }> = ({ title, icon, children, className }) => (
    <div className={`pt-6 border-t border-gray-200 first:pt-0 first:border-t-0 ${className}`}>
        <div className="flex items-center mb-4">
            {icon}
            <h3 className="text-lg font-semibold text-tm-dark">{title}</h3>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {children}
        </div>
    </div>
);

interface RegistrationFormData {
    assetName: string;
    category: string;
    type: string;
    brand: string;
    purchasePrice: number | null;
    vendor: string | null;
    poNumber: string | null;
    invoiceNumber: string | null;
    purchaseDate: string;
    registrationDate: string;
    recordedBy: string;
    warrantyEndDate: string | null;
    condition: AssetCondition;
    location: string | null;
    locationDetail: string | null;
    currentUser: string | null;
    notes: string | null;
    attachments: Attachment[];
    bulkItems: { id: number, serialNumber: string, macAddress: string }[];
    relatedRequestId: string | null;
}

interface RegistrationFormProps {
    onBack: () => void;
    onSave: (data: RegistrationFormData, assetIdToUpdate?: string) => void;
    prefillData?: { request: Request; itemToRegister?: RequestItem } | null;
    editingAsset?: Asset | null;
    currentUser: User;
    onStartScan: (itemId: number) => void;
    bulkItems: { id: number; serialNumber: string; macAddress: string }[];
    setBulkItems: React.Dispatch<React.SetStateAction<{ id: number; serialNumber: string; macAddress: string }[]>>;
    assetCategories: AssetCategory[];
    openModelModal: (category: AssetCategory, type: AssetType, onModelAdded: (model: StandardItem) => void) => void;
    openTypeModal: (category: AssetCategory, typeToEdit: AssetType | null, onTypeAdded: (type: AssetType) => void) => void;
    setActivePage: (page: Page, initialState?: any) => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onBack, onSave, prefillData, editingAsset, currentUser, onStartScan, bulkItems, setBulkItems, assetCategories, openModelModal, openTypeModal, setActivePage }) => {
    const isEditing = !!editingAsset;
    const [assetName, setAssetName] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [assetTypeId, setAssetTypeId] = useState('');
    const [brand, setBrand] = useState('');
    const [purchasePrice, setPurchasePrice] = useState<number | ''>('');
    const [vendor, setVendor] = useState('');
    const [poNumber, setPoNumber] = useState('');
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [purchaseDate, setPurchaseDate] = useState<Date | null>(new Date());
    const [registrationDate, setRegistrationDate] = useState<Date | null>(new Date());
    const [warrantyDate, setWarrantyDate] = useState<Date | null>(null);
    const [warrantyPeriod, setWarrantyPeriod] = useState<number | ''>('');
    const [condition, setCondition] = useState<AssetCondition>(AssetCondition.BRAND_NEW);
    const [location, setLocation] = useState('Gudang Inventori');
    const [locationDetail, setLocationDetail] = useState('');
    const [initialUser, setInitialUser] = useState('');
    const [notes, setNotes] = useState('');
    const [attachments, setAttachments] = useState<File[]>([]);
    
    const [quantity, setQuantity] = useState<number | ''>(1);
    const [isFooterVisible, setIsFooterVisible] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const footerRef = useRef<HTMLDivElement>(null);
    const formId = "asset-registration-form";
    const addNotification = useNotification();

    const selectedCategory = useMemo(() => assetCategories.find(c => c.id.toString() === selectedCategoryId), [assetCategories, selectedCategoryId]);
    const availableTypes = useMemo(() => selectedCategory?.types || [], [selectedCategory]);
    const selectedType = useMemo(() => availableTypes.find(t => t.id.toString() === assetTypeId), [availableTypes, assetTypeId]);
    const availableModels = useMemo(() => selectedType?.standardItems || [], [selectedType]);

    const categoryOptions = useMemo(() => assetCategories.map(cat => ({ value: cat.id.toString(), label: cat.name })), [assetCategories]);
    const typeOptions = useMemo(() => availableTypes.map(type => ({ value: type.id.toString(), label: type.name })), [availableTypes]);
    const modelOptions = useMemo(() => availableModels.map(model => ({ value: model.name, label: model.name })), [availableModels]);
    const conditionOptions = useMemo(() => Object.values(AssetCondition).map(c => ({ value: c, label: c })), []);
    const locationOptions = useMemo(() => assetLocations.map(loc => ({ value: loc, label: loc })), []);

    const capitalizeFirstLetter = (string: string | undefined): string => {
        if (!string) return 'Unit';
        return string.charAt(0).toUpperCase() + string.slice(1);
    };
    const unitLabel = capitalizeFirstLetter(selectedType?.unitOfMeasure);
    const totalCalculatedBaseQuantity = (typeof quantity === 'number' && selectedType?.quantityPerUnit) ? quantity * selectedType.quantityPerUnit : '';


    useEffect(() => {
        if (prefillData?.request && prefillData.itemToRegister) {
            const { request, itemToRegister } = prefillData;
            const category = assetCategories.find(c => c.types.some(t => t.standardItems?.some(si => si.name === itemToRegister.itemName)));
            const type = category?.types.find(t => t.standardItems?.some(si => si.name === itemToRegister.itemName));

            if (category) setSelectedCategoryId(category.id.toString());
            if (type) setAssetTypeId(type.id.toString());

            setAssetName(itemToRegister.itemName);
            setBrand(itemToRegister.itemTypeBrand);
            setNotes(`Pencatatan dari request ${request.id}: ${itemToRegister.keterangan}`);
            setInitialUser(request.requester);
            
            const alreadyRegistered = request.partiallyRegisteredItems?.[itemToRegister.id] || 0;
            const quantityToRegister = Math.max(0, itemToRegister.quantity - alreadyRegistered);

            if (type?.trackingMethod === 'bulk') {
                setQuantity(quantityToRegister);
                setBulkItems([]); // Clear individual items for bulk
            } else {
                setBulkItems(Array.from({ length: quantityToRegister }, (_, i) => ({ id: Date.now() + i, serialNumber: '', macAddress: '' })));
                setQuantity(quantityToRegister);
            }
        }
    }, [prefillData, setBulkItems, assetCategories]);
    
    useEffect(() => {
        if (isEditing && editingAsset) {
            setAssetName(editingAsset.name);
            const category = assetCategories.find(c => c.name === editingAsset.category);
            const type = category?.types.find(t => t.name === editingAsset.type);
            if(category) setSelectedCategoryId(category.id.toString());
            if(type) setAssetTypeId(type.id.toString());
            setBrand(editingAsset.brand);
            setPurchasePrice(editingAsset.purchasePrice ?? '');
            setVendor(editingAsset.vendor ?? '');
            setPoNumber(editingAsset.poNumber ?? '');
            setInvoiceNumber(editingAsset.invoiceNumber ?? '');
            setPurchaseDate(new Date(editingAsset.purchaseDate));
            setRegistrationDate(new Date(editingAsset.registrationDate));
            setWarrantyDate(editingAsset.warrantyEndDate ? new Date(editingAsset.warrantyEndDate) : null);
            setCondition(editingAsset.condition);
            setLocation(editingAsset.location ?? 'Gudang Inventori');
            setLocationDetail(editingAsset.locationDetail ?? '');
            setInitialUser(editingAsset.currentUser ?? '');
            setNotes(editingAsset.notes ?? '');
            setQuantity(1); // For editing, it's always one item.
            setBulkItems([{
                id: Date.now(),
                serialNumber: editingAsset.serialNumber || '',
                macAddress: editingAsset.macAddress || '',
            }]);
        }
    }, [isEditing, editingAsset, assetCategories]);


    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => setIsFooterVisible(entry.isIntersecting),
            { root: null, rootMargin: "0px", threshold: 0.1 }
        );
        const currentRef = footerRef.current;
        if (currentRef) observer.observe(currentRef);
        return () => { if (currentRef) observer.unobserve(currentRef); };
    }, []);

    useEffect(() => {
        if (purchaseDate && warrantyPeriod) {
            const newWarrantyDate = new Date(purchaseDate);
            newWarrantyDate.setMonth(newWarrantyDate.getMonth() + warrantyPeriod);
            setWarrantyDate(newWarrantyDate);
        } else {
            setWarrantyDate(null);
        }
    }, [purchaseDate, warrantyPeriod]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) setAttachments(prev => [...prev, ...Array.from(event.target.files!)]);
    };

    const removeAttachment = (fileName: string) => {
        setAttachments(prev => prev.filter(file => file.name !== fileName));
    };

    const handleCategoryChange = (value: string) => {
        setSelectedCategoryId(value);
        setAssetTypeId('');
        setAssetName('');
        setBrand('');
    };
    
    const handleTypeChange = (value: string) => {
        setAssetTypeId(value);
        setAssetName('');
        setBrand('');
    };
    
    const handleModelChange = (modelName: string) => {
        const model = availableModels.find(m => m.name === modelName);
        if (model) {
            setAssetName(model.name);
            setBrand(model.brand);
        }
    };

    const addBulkItem = () => {
        setBulkItems([...bulkItems, { id: Date.now(), serialNumber: '', macAddress: '' }]);
    };

    const removeBulkItem = (id: number) => {
        if (bulkItems.length > 1) setBulkItems(bulkItems.filter(item => item.id !== id));
    };
    
    const handleBulkItemChange = (id: number, field: 'serialNumber' | 'macAddress', value: string) => {
        setBulkItems(bulkItems.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        let finalBulkItems = bulkItems;
        if (!isEditing && selectedType?.trackingMethod === 'bulk') {
            const finalQuantity = typeof quantity === 'number' ? quantity : 0;
            finalBulkItems = Array.from({ length: finalQuantity }, (_, i) => ({
                id: Date.now() + i,
                serialNumber: '',
                macAddress: '',
            }));
        }

        if (finalBulkItems.length === 0 && (isEditing || selectedType?.trackingMethod !== 'bulk')) {
             addNotification('Jumlah aset yang dicatat tidak boleh nol.', 'error');
             setIsSubmitting(false);
             return;
        }
        if (quantity === 0 && !isEditing && selectedType?.trackingMethod === 'bulk') {
            addNotification('Jumlah aset yang dicatat tidak boleh nol.', 'error');
            setIsSubmitting(false);
            return;
        }

        const formData: RegistrationFormData = {
            assetName,
            category: selectedCategory?.name || '',
            type: selectedType?.name || '',
            brand,
            purchasePrice: purchasePrice === '' ? null : purchasePrice,
            vendor: vendor || null,
            poNumber: poNumber || null,
            invoiceNumber: invoiceNumber || null,
            purchaseDate: purchaseDate!.toISOString().split('T')[0],
            registrationDate: registrationDate!.toISOString().split('T')[0],
            recordedBy: currentUser.name,
            warrantyEndDate: warrantyDate ? warrantyDate.toISOString().split('T')[0] : null,
            condition,
            location: location || null,
            locationDetail: locationDetail || null,
            currentUser: initialUser || null,
            notes: notes || null,
            attachments: [],
            bulkItems: finalBulkItems,
            relatedRequestId: prefillData?.request.id || null,
        };

        setTimeout(() => { // Simulate API Call
            onSave(formData, editingAsset?.id);
            setIsSubmitting(false);
        }, 1000);
    };
    
    const ActionButtons: React.FC<{ formId?: string }> = ({ formId }) => (
        <>
            <button type="button" onClick={onBack} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">
                Batal
            </button>
            <button 
                type="submit" 
                form={formId}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 rounded-lg shadow-sm bg-tm-primary hover:bg-tm-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tm-accent disabled:bg-tm-primary/70 disabled:cursor-not-allowed">
                {isSubmitting ? <SpinnerIcon className="w-5 h-5 mr-2"/> : null}
                {isSubmitting ? 'Menyimpan...' : (isEditing ? 'Simpan Perubahan' : 'Simpan Aset Baru')}
            </button>
        </>
    );

    return (
        <>
            <form id={formId} className="space-y-8" onSubmit={handleSubmit}>
                 {prefillData && (
                    <div className="p-4 border-l-4 rounded-r-lg bg-info-light border-tm-primary">
                        <p className="text-sm text-info-text">
                            Mencatat <strong>{prefillData.itemToRegister?.itemName}</strong> dari permintaan <span className="font-bold">{prefillData.request.id}</span> oleh <span className="font-bold">{prefillData.request.requester}</span>.
                        </p>
                    </div>
                )}
                <div className="mb-6 space-y-2 text-center">
                    <h4 className="text-xl font-bold text-tm-dark">TRINITY MEDIA INDONESIA</h4>
                    <p className="font-semibold text-tm-secondary">{isEditing ? 'FORMULIR EDIT DATA ASET' : 'FORMULIR PENCATATAN ASET BARU'}</p>
                </div>

                <div className="p-4 border-t border-b border-gray-200">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <label htmlFor="registrationDate" className="block text-sm font-medium text-gray-700">Tanggal Pencatatan</label>
                            <DatePicker 
                                id="registrationDate" 
                                selectedDate={registrationDate} 
                                onDateChange={setRegistrationDate} 
                                disableFutureDates 
                            />
                        </div>
                        <div>
                            <label htmlFor="recordedBy" className="block text-sm font-medium text-gray-700">Dicatat oleh</label>
                            <input
                                type="text"
                                id="recordedBy"
                                readOnly
                                className="block w-full px-3 py-2 mt-1 text-gray-700 bg-gray-100 border border-gray-200 rounded-md shadow-sm sm:text-sm"
                                value={currentUser.name}
                            />
                        </div>
                        <div>
                            <label htmlFor="docNumber" className="block text-sm font-medium text-gray-700">No Dokumen Aset</label>
                            <input type="text" id="docNumber" readOnly className="block w-full px-3 py-2 mt-1 text-gray-700 bg-gray-100 border border-gray-200 rounded-md shadow-sm sm:text-sm" value={editingAsset?.id || '[Otomatis]'} />
                        </div>
                    </div>
                </div>

                <FormSection title="Informasi Dasar Aset" icon={<InfoIcon className="w-6 h-6 mr-3 text-tm-primary" />}>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:col-span-2">
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Kategori Aset</label>
                            <div className="mt-1">
                                <CustomSelect
                                    options={categoryOptions}
                                    value={selectedCategoryId}
                                    onChange={handleCategoryChange}
                                    placeholder="-- Pilih Kategori --"
                                    emptyStateMessage="Belum ada kategori."
                                    emptyStateButtonLabel="Buka Pengaturan Kategori"
                                    onEmptyStateClick={() => setActivePage('kategori')}
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Tipe Aset</label>
                             <div className="mt-1">
                                <CustomSelect
                                    options={typeOptions}
                                    value={assetTypeId}
                                    onChange={handleTypeChange}
                                    placeholder={selectedCategoryId ? '-- Pilih Tipe --' : 'Pilih kategori dahulu'}
                                    disabled={!selectedCategoryId}
                                    emptyStateMessage="Tidak ada tipe untuk kategori ini."
                                    emptyStateButtonLabel="Tambah Tipe Aset"
                                    onEmptyStateClick={() => {
                                        if (selectedCategory) {
                                            openTypeModal(selectedCategory, null, (newType) => {
                                                handleTypeChange(newType.id.toString());
                                            });
                                        }
                                    }}
                                />
                            </div>
                        </div>
                         <div>
                            <label htmlFor="standardModel" className="block text-sm font-medium text-gray-700">Model Barang Standar</label>
                             <div className="mt-1">
                                <CustomSelect
                                    options={modelOptions}
                                    value={assetName}
                                    onChange={handleModelChange}
                                    placeholder={assetTypeId ? '-- Pilih Model --' : 'Pilih tipe dahulu'}
                                    disabled={!assetTypeId}
                                    emptyStateMessage="Tidak ada model untuk tipe ini."
                                    emptyStateButtonLabel="Tambah Model Barang"
                                    onEmptyStateClick={() => {
                                        if (selectedCategory && selectedType) {
                                            openModelModal(selectedCategory, selectedType, (newModel) => {
                                                handleModelChange(newModel.name);
                                            });
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="assetName" className="block text-sm font-medium text-gray-700">Nama Aset (Otomatis)</label>
                        <input type="text" id="assetName" value={assetName} readOnly required className="block w-full px-3 py-2 mt-1 text-gray-700 bg-gray-100 border border-gray-200 rounded-md shadow-sm sm:text-sm" />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="brand" className="block text-sm font-medium text-gray-700">Brand (Otomatis)</label>
                        <input type="text" id="brand" value={brand} readOnly required className="block w-full px-3 py-2 mt-1 text-gray-700 bg-gray-100 border border-gray-200 rounded-md shadow-sm sm:text-sm" />
                    </div>
                </FormSection>

                <FormSection title="Detail Unit Aset" icon={<InfoIcon className="w-6 h-6 mr-3 text-tm-primary" />} className="md:col-span-2">
                    {isEditing || selectedType?.trackingMethod !== 'bulk' ? (
                         <div className="md:col-span-2">
                            {isEditing && selectedType?.trackingMethod === 'bulk' ? (
                                <div className="p-4 mb-4 border-l-4 rounded-r-lg bg-amber-50 border-amber-400">
                                    <div className="flex items-start gap-3">
                                        <ExclamationTriangleIcon className="flex-shrink-0 w-5 h-5 mt-1 text-amber-600" />
                                        <div className="text-sm text-amber-800">
                                            <p className="font-semibold">Mengedit Aset Massal</p>
                                            <p>Anda sedang mengedit properti umum (seperti harga, vendor, dll.) untuk tipe aset <strong className="font-bold">{assetName}</strong>. Perubahan di sini akan memengaruhi informasi umum, bukan kuantitas stok.</p>
                                            <p className="mt-2 text-xs">Satuan Stok: <span className="font-semibold">{selectedType.unitOfMeasure}</span> | Aturan Konversi: <span className="font-semibold">{selectedType.quantityPerUnit} {selectedType.baseUnitOfMeasure}</span> per <span className="font-semibold">{selectedType.unitOfMeasure}</span>.</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-gray-700">Daftar Unit (Nomor Seri & MAC Address)</label>
                                    {!isEditing && <button type="button" onClick={addBulkItem} className="px-3 py-1 text-xs font-semibold text-white transition-colors duration-200 rounded-md shadow-sm bg-tm-accent hover:bg-tm-primary">+ Tambah {unitLabel}</button>}
                                </div>
                                <div className="space-y-3">
                                    {bulkItems.length > 0 ? bulkItems.map((item, index) => (
                                        <div key={item.id} className="relative grid grid-cols-1 md:grid-cols-5 gap-x-4 gap-y-2 p-3 bg-gray-50/80 border rounded-lg">
                                            <div className="md:col-span-5">
                                                <label className="text-sm font-medium text-gray-700">{isEditing ? `Detail ${unitLabel}` : `${unitLabel} #${index + 1}`}</label>
                                            </div>
                                            <div className="md:col-span-2">
                                                <label htmlFor={`sn-${item.id}`} className="block text-xs font-medium text-gray-500">Nomor Seri</label>
                                                <input
                                                    id={`sn-${item.id}`}
                                                    type="text"
                                                    value={item.serialNumber}
                                                    onChange={(e) => handleBulkItemChange(item.id, 'serialNumber', e.target.value)}
                                                    required={!isEditing && selectedType?.trackingMethod !== 'bulk'}
                                                    className="block w-full px-3 py-2 mt-1 text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-tm-accent focus:border-tm-accent sm:text-sm"
                                                    placeholder="Wajib diisi"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label htmlFor={`mac-${item.id}`} className="block text-xs font-medium text-gray-500">MAC Address</label>
                                                <input
                                                    id={`mac-${item.id}`}
                                                    type="text"
                                                    value={item.macAddress}
                                                    onChange={(e) => handleBulkItemChange(item.id, 'macAddress', e.target.value)}
                                                    className="block w-full px-3 py-2 mt-1 text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-tm-accent focus:border-tm-accent sm:text-sm"
                                                    placeholder="Opsional"
                                                />
                                            </div>
                                            <div className="flex items-end justify-start md:justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => onStartScan(item.id)}
                                                    className="flex items-center justify-center w-full h-10 px-3 text-gray-600 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 hover:text-tm-primary"
                                                    title="Pindai SN/MAC"
                                                >
                                                    <QrCodeIcon className="w-5 h-5"/>
                                                </button>
                                            </div>
                                            {bulkItems.length > 1 && !isEditing && (
                                                <div className="absolute top-2 right-2">
                                                    <button type="button" onClick={() => removeBulkItem(item.id)} className="p-1 text-gray-400 rounded-full hover:bg-red-100 hover:text-red-500">
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )) : (
                                        <p className="text-sm text-center text-gray-500 py-4">Tidak ada unit untuk dicatat. Silakan kembali ke halaman request.</p>
                                    )}
                                </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="md:col-span-2 p-4 -mt-2 mb-2 border-l-4 rounded-r-lg bg-info-light border-tm-primary">
                                <div className="flex items-start gap-3">
                                    <InfoIcon className="flex-shrink-0 w-5 h-5 mt-1 text-info-text" />
                                    <div className="text-sm text-info-text">
                                        <p className="font-semibold">Mode Pencatatan Massal (Bulk)</p>
                                        <p>Anda akan mencatat aset ini secara massal. Sistem akan membuat {quantity || 0} entri aset terpisah tanpa nomor seri individual, yang semuanya terhubung ke dokumen ini.</p>
                                    </div>
                                </div>
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:col-span-2">
                                <div>
                                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Stok ({unitLabel})</label>
                                    <div className="relative mt-1">
                                        <input 
                                            type="number" 
                                            id="quantity" 
                                            value={quantity} 
                                            onChange={(e) => setQuantity(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                                            min="1"
                                            required
                                            className="block w-full py-2 text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-tm-accent focus:border-tm-accent sm:text-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="unitSize" className="block text-sm font-medium text-gray-700">Ukuran Satuan ({selectedType?.baseUnitOfMeasure || '...'})</label>
                                    <div className="relative mt-1">
                                        <input 
                                            type="number" 
                                            id="unitSize" 
                                            value={selectedType?.quantityPerUnit || ''} 
                                            readOnly
                                            className="block w-full py-2 text-gray-700 bg-gray-100 border border-gray-200 rounded-md shadow-sm sm:text-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                     <label htmlFor="totalSize" className="block text-sm font-medium text-gray-700">Total Ukuran ({selectedType?.baseUnitOfMeasure || '...'})</label>
                                    <div className="relative mt-1">
                                        <input 
                                            type="number" 
                                            id="totalSize" 
                                            value={totalCalculatedBaseQuantity} 
                                            readOnly
                                            className="block w-full py-2 text-gray-700 bg-gray-100 border border-gray-200 rounded-md shadow-sm sm:text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                            {selectedType?.quantityPerUnit && (
                                <div className="md:col-span-2">
                                     <p className="mt-1 text-xs text-gray-500">Total Ukuran dihitung dari: Stok × Ukuran Satuan.</p>
                                </div>
                            )}
                        </>
                    )}
                </FormSection>

                <FormSection title="Informasi Pembelian" icon={<DollarIcon className="w-6 h-6 mr-3 text-tm-primary" />}>
                    <div>
                        <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-700">Harga Beli (Rp)</label>
                        <input type="number" id="purchasePrice" value={purchasePrice} onChange={e => setPurchasePrice(e.target.value === '' ? '' : parseFloat(e.target.value))} className="block w-full px-3 py-2 mt-1 text-gray-900 placeholder:text-gray-400 bg-gray-50 border border-gray-300 rounded-md shadow-sm sm:text-sm" placeholder="Contoh: 3500000" />
                    </div>
                    <div>
                        <label htmlFor="vendor" className="block text-sm font-medium text-gray-700">Vendor / Toko</label>
                        <input type="text" id="vendor" value={vendor} onChange={e => setVendor(e.target.value)} className="block w-full px-3 py-2 mt-1 text-gray-900 placeholder:text-gray-400 bg-gray-50 border border-gray-300 rounded-md shadow-sm sm:text-sm" placeholder="Contoh: Distributor Resmi" />
                    </div>
                    <div>
                        <label htmlFor="poNumber" className="block text-sm font-medium text-gray-700">Nomor PO</label>
                        <input type="text" id="poNumber" value={poNumber} onChange={e => setPoNumber(e.target.value)} className="block w-full px-3 py-2 mt-1 text-gray-900 placeholder:text-gray-400 bg-gray-50 border border-gray-300 rounded-md shadow-sm sm:text-sm" placeholder="Contoh: PO-123/IV/2024" />
                    </div>
                    <div>
                        <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-700">Nomor Faktur</label>
                        <input type="text" id="invoiceNumber" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} className="block w-full px-3 py-2 mt-1 text-gray-900 placeholder:text-gray-400 bg-gray-50 border border-gray-300 rounded-md shadow-sm sm:text-sm" placeholder="Contoh: INV/VENDOR/2024/001" />
                    </div>
                    <div>
                        <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700">Tanggal Pembelian</label>
                        <DatePicker id="purchaseDate" selectedDate={purchaseDate} onDateChange={setPurchaseDate} disableFutureDates />
                    </div>
                    <div>
                        <label htmlFor="warrantyPeriod" className="block text-sm font-medium text-gray-700">Masa Garansi (bulan)</label>
                        <input type="number" id="warrantyPeriod" value={warrantyPeriod} onChange={e => setWarrantyPeriod(e.target.value === '' ? '' : parseInt(e.target.value))} className="block w-full px-3 py-2 mt-1 text-gray-900 placeholder:text-gray-400 bg-gray-50 border border-gray-300 rounded-md shadow-sm sm:text-sm" placeholder="Contoh: 12" />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="warrantyEndDate" className="block text-sm font-medium text-gray-700">Akhir Garansi</label>
                        <DatePicker id="warrantyEndDate" selectedDate={warrantyDate} onDateChange={setWarrantyDate} />
                    </div>
                </FormSection>

                <FormSection title="Kondisi, Lokasi & Catatan" icon={<WrenchIcon className="w-6 h-6 mr-3 text-tm-primary" />}>
                    <div>
                        <label htmlFor="condition" className="block text-sm font-medium text-gray-700">Kondisi Aset</label>
                        <div className="mt-1">
                           <CustomSelect options={conditionOptions} value={condition} onChange={(value) => setCondition(value as AssetCondition)} />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700">Lokasi Fisik Aset</label>
                        <div className="mt-1">
                            <CustomSelect options={locationOptions} value={location} onChange={(value) => setLocation(value)} placeholder="-- Pilih Lokasi --" />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="locationDetail" className="block text-sm font-medium text-gray-700">Detail Lokasi / Rak</label>
                        <input type="text" id="locationDetail" value={locationDetail} onChange={e => setLocationDetail(e.target.value)} className="block w-full px-3 py-2 mt-1 text-gray-900 placeholder:text-gray-400 bg-gray-50 border border-gray-300 rounded-md shadow-sm sm:text-sm" placeholder="Contoh: Rak C-03, Meja 12" />
                    </div>
                    <div>
                        <label htmlFor="initialUser" className="block text-sm font-medium text-gray-700">Pengguna Awal (Opsional)</label>
                        <input type="text" id="initialUser" value={initialUser} onChange={e => setInitialUser(e.target.value)} className="block w-full px-3 py-2 mt-1 text-gray-900 placeholder:text-gray-400 bg-gray-50 border border-gray-300 rounded-md shadow-sm sm:text-sm" placeholder="Nama tim atau pengguna yang menerima aset ini" />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Catatan Tambahan</label>
                        <textarea id="notes" rows={3} value={notes} onChange={e => setNotes(e.target.value)} className="block w-full px-3 py-2 mt-1 text-gray-900 placeholder:text-gray-400 bg-gray-50 border border-gray-300 rounded-md shadow-sm sm:text-sm" placeholder="Informasi relevan lainnya..."></textarea>
                    </div>
                </FormSection>

                <FormSection title="Lampiran" icon={<PaperclipIcon className="w-6 h-6 mr-3 text-tm-primary" />}>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Unggah File (Foto, Invoice, dll)</label>
                        <div className="flex items-center justify-center w-full px-6 pt-5 pb-6 mt-1 border-2 border-gray-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                            <svg className="w-12 h-12 mx-auto text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                <div className="flex text-sm text-gray-600">
                                    <label htmlFor="file-upload" className="relative font-medium bg-white rounded-md cursor-pointer text-tm-primary hover:text-tm-accent focus-within:outline-none">
                                        <span>Pilih file</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={handleFileChange} />
                                    </label>
                                    <p className="pl-1">atau tarik dan lepas</p>
                                </div>
                                <p className="text-xs text-gray-500">PNG, JPG, PDF hingga 10MB</p>
                            </div>
                        </div>
                        {attachments.length > 0 && (
                            <div className="mt-4 space-y-2">
                                {attachments.map(file => (
                                    <div key={file.name} className="flex items-center justify-between p-2 text-sm text-gray-700 bg-gray-100 border border-gray-200 rounded-md">
                                        <span className="truncate">{file.name}</span>
                                        <button type="button" onClick={() => removeAttachment(file.name)} className="text-red-500 hover:text-red-700">
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </FormSection>

                <div ref={footerRef} className="flex justify-end pt-5 mt-4 space-x-3 border-t border-gray-200">
                    <ActionButtons />
                </div>
            </form>
            <FloatingActionBar isVisible={!isFooterVisible}>
                <ActionButtons formId={formId} />
            </FloatingActionBar>
        </>
    );
};

export const ItemRegistration: React.FC<ItemRegistrationProps> = ({ currentUser, assets, setAssets, customers, requests, handovers, dismantles, assetCategories, prefillData, onClearPrefill, onRegistrationComplete, onInitiateHandover, onInitiateInstallation, onInitiateDismantle, assetToViewId, initialFilters, onClearInitialFilters, itemToEdit, onClearItemToEdit, onShowPreview, setActivePage, openModelModal, openTypeModal, setIsGlobalScannerOpen, setScanContext, setFormScanCallback }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [assetToDeleteId, setAssetToDeleteId] = useState<string | null>(null);
    const [bulkDeleteConfirmation, setBulkDeleteConfirmation] = useState(false);
    const addNotification = useNotification();
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'details' | 'history' | 'attachments' | 'qr-code'>('details');

    const [view, setView] = useState<'list' | 'form'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const initialFiltersState = { status: '', category: '', location: '', dismantled: '', warranty: '', name: '', brand: '' };
    const [filters, setFilters] = useState(initialFiltersState);
    const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
    const [isBulkSelectMode, setIsBulkSelectMode] = useState(false);
    
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [bulkItems, setBulkItems] = useState<{ id: number, serialNumber: string, macAddress: string }[]>([{ id: Date.now(), serialNumber: '', macAddress: '' }]);
    
    const [isChangeStatusModalOpen, setIsChangeStatusModalOpen] = useState(false);
    const [isChangeLocationModalOpen, setIsChangeLocationModalOpen] = useState(false);
    const [targetStatus, setTargetStatus] = useState<AssetStatus>(AssetStatus.IN_STORAGE);
    const [targetLocation, setTargetLocation] = useState<string>(assetLocations[0]);
    const [targetLocationDetail, setTargetLocationDetail] = useState<string>('');
    const [assetToEdit, setAssetToEdit] = useState<Asset | null>(null);

    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [tempFilters, setTempFilters] = useState(filters);
    const filterPanelRef = useRef<HTMLDivElement>(null);
    
    const qrCanvasRef = useRef<HTMLCanvasElement>(null);
    
    const handleStartEdit = useCallback((asset: Asset) => {
        setAssetToEdit(asset);
        setView('form');
    }, []);

     useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (filterPanelRef.current && !filterPanelRef.current.contains(event.target as Node)) {
                setIsFilterPanelOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [filterPanelRef]);

    useEffect(() => {
        if (itemToEdit && itemToEdit.type === 'asset') {
            handleStartEdit(itemToEdit.data as Asset);
            onClearItemToEdit();
        }
    }, [itemToEdit, onClearItemToEdit, handleStartEdit]);

    useEffect(() => {
        if (prefillData) {
            setView('form');
        } else if (!assetToEdit) { // Only reset if not entering edit mode
            setBulkItems([{ id: Date.now(), serialNumber: '', macAddress: '' }]);
        }
    }, [prefillData, assetToEdit]);
    
    const handleStartScan = (itemId: number) => {
        setScanContext('form');
        setFormScanCallback(() => (data: ParsedScanResult) => {
            setBulkItems(prev => prev.map(item => {
                if (item.id === itemId) {
                    const updatedItem = { ...item };
                    if (data.serialNumber) {
                        updatedItem.serialNumber = data.serialNumber;
                    }
                    if (data.macAddress) {
                        updatedItem.macAddress = data.macAddress;
                    }
                    return updatedItem;
                }
                return item;
            }));
            addNotification('Data berhasil dipindai dan diterapkan.', 'success');
        });
        setIsGlobalScannerOpen(true);
    };
    
    useEffect(() => {
        if (initialFilters && Object.keys(initialFilters).length > 0) {
            setFilters(prev => ({ ...prev, ...initialFilters }));
            setTempFilters(prev => ({ ...prev, ...initialFilters }));
            onClearInitialFilters();
        }
    }, [initialFilters, onClearInitialFilters]);

    const handleSetView = (newView: 'list' | 'form') => {
        if (newView === 'list') {
            if (prefillData) onClearPrefill();
            if (assetToEdit) setAssetToEdit(null);
        }
        setView(newView);
    }

    const handleResetFilters = () => {
        setFilters(initialFiltersState);
        setTempFilters(initialFiltersState);
        setIsFilterPanelOpen(false);
    };
    
    const handleApplyFilters = () => {
        setFilters(tempFilters);
        setIsFilterPanelOpen(false);
    };

    const filterOptions = useMemo(() => {
        const categories = assetCategories.map(c => c.name);
        const locations = [...new Set(assets.map(a => a.location).filter(Boolean))] as string[];
        const statuses = Object.values(AssetStatus);
        return { categories, locations, statuses };
    }, [assets, assetCategories]);
    
    const categoryFilterOptions = [
        { value: '', label: 'Semua Kategori' },
        ...filterOptions.categories.map(c => ({ value: c, label: c }))
    ];
    const locationFilterOptions = [
        { value: '', label: 'Semua Lokasi' },
        ...filterOptions.locations.map(l => ({ value: l, label: l }))
    ];
    
    const warrantyFilterOptions: {value: string, label: string}[] = [
        { value: 'expiring', label: 'Segera Habis' },
        { value: 'expired', label: 'Sudah Habis' },
    ];
    
    const dismantledFilterOptions: {value: string, label: string}[] = [
        { value: 'yes', label: 'Hanya Dismantled' },
    ];


    const filteredAssets = useMemo(() => {
        return assets
            .filter(asset => {
                const searchLower = searchQuery.toLowerCase();
                if (!searchLower) return true;
                return (
                    asset.id.toLowerCase().includes(searchLower) ||
                    asset.name.toLowerCase().includes(searchLower) ||
                    (asset.currentUser && asset.currentUser.toLowerCase().includes(searchLower)) ||
                    (asset.serialNumber && asset.serialNumber.toLowerCase().includes(searchLower))
                );
            })
            .filter(asset => filters.status ? asset.status === filters.status : true)
            .filter(asset => filters.category ? asset.category === filters.category : true)
            .filter(asset => filters.location ? asset.location === filters.location : true)
            .filter(asset => filters.name ? asset.name === filters.name : true)
            .filter(asset => filters.brand ? asset.brand === filters.brand : true)
            .filter(asset => {
                if (filters.dismantled === 'yes') return asset.isDismantled === true;
                return true;
            })
            .filter(asset => {
                if (!filters.warranty) return true;
                if (!asset.warrantyEndDate) return false;
        
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const warrantyEnd = new Date(asset.warrantyEndDate);
                
                if (filters.warranty === 'expiring') {
                    const currentMonth = today.getMonth();
                    const currentYear = today.getFullYear();
                    return warrantyEnd > today && warrantyEnd.getMonth() === currentMonth && warrantyEnd.getFullYear() === currentYear;
                }
                
                if (filters.warranty === 'expired') {
                    return warrantyEnd < today;
                }
                
                return true;
            });
    }, [assets, searchQuery, filters]);

    const { items: sortedAssets, requestSort, sortConfig } = useSortableData(filteredAssets, { key: 'registrationDate', direction: 'descending' });

    const totalItems = sortedAssets.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedAssets = sortedAssets.slice(startIndex, endIndex);
    
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filters, itemsPerPage]);
    
    const activeFilterCount = useMemo(() => {
        return Object.values(filters).filter(value => {
            if (typeof value === 'boolean') return value;
            return !!value;
        }).length;
    }, [filters]);

    const handleItemsPerPageChange = (newSize: number) => {
        setItemsPerPage(newSize);
        setCurrentPage(1);
    };

    const handleCancelBulkMode = () => {
        setIsBulkSelectMode(false);
        setSelectedAssetIds([]);
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                handleCancelBulkMode();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const handleSelectOne = (id: string) => {
        setSelectedAssetIds(prev =>
            prev.includes(id) ? prev.filter(reqId => reqId !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setSelectedAssetIds(paginatedAssets.map(req => req.id));
        } else {
            setSelectedAssetIds([]);
        }
    };

    const handleExport = () => {
        exportToCSV(sortedAssets, `asset_registration_${new Date().toISOString().split('T')[0]}`);
    };

    const handleShowDetails = useCallback((asset: Asset) => {
        setSelectedAsset(asset);
        setActiveTab('details');
        setIsModalOpen(true);
    }, []);

    useEffect(() => {
        if (assetToViewId) {
            const asset = assets.find(a => a.id === assetToViewId);
            if (asset) {
                handleShowDetails(asset);
            }
        }
    }, [assetToViewId, assets, handleShowDetails]);


    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedAsset(null);
    };

    const handleSaveAsset = (formData: RegistrationFormData, assetIdToUpdate?: string) => {
        if (assetIdToUpdate) { // Update existing asset
            const originalAsset = assets.find(a => a.id === assetIdToUpdate)!;
            const updatedAsset: Asset = {
                ...originalAsset,
                name: formData.assetName,
                category: formData.category,
                type: formData.type,
                brand: formData.brand,
                serialNumber: formData.bulkItems[0].serialNumber,
                macAddress: formData.bulkItems[0].macAddress,
                purchasePrice: formData.purchasePrice,
                vendor: formData.vendor,
                poNumber: formData.poNumber,
                invoiceNumber: formData.invoiceNumber,
                purchaseDate: formData.purchaseDate,
                registrationDate: formData.registrationDate,
                warrantyEndDate: formData.warrantyEndDate,
                condition: formData.condition,
                location: formData.location,
                locationDetail: formData.locationDetail,
                currentUser: formData.currentUser,
                notes: formData.notes,
                lastModifiedBy: currentUser.name,
                lastModifiedDate: new Date().toISOString(),
            };
            
            const newLogEntry: ActivityLogEntry = {
                id: `log-${assetIdToUpdate}-${Date.now()}`,
                timestamp: updatedAsset.lastModifiedDate!,
                user: currentUser.name,
                action: 'Data Diperbarui',
                details: 'Informasi aset telah diperbarui.'
            };
    
            updatedAsset.activityLog = [...(updatedAsset.activityLog || []), newLogEntry];

            setAssets(prev => prev.map(a => a.id === assetIdToUpdate ? updatedAsset : a));
            addNotification(`Aset ${assetIdToUpdate} berhasil diperbarui.`, 'success');
            handleSetView('list');
            setAssetToEdit(null);
        } else { // Create new assets (can be bulk)
            const newAssets: Asset[] = formData.bulkItems.map((item, index) => {
                const newId = `AST-${String(assets.length + index + 1).padStart(4, '0')}`;
                return {
                    id: newId,
                    name: formData.assetName,
                    category: formData.category,
                    type: formData.type,
                    brand: formData.brand,
                    serialNumber: item.serialNumber,
                    macAddress: item.macAddress,
                    registrationDate: formData.registrationDate,
                    recordedBy: formData.recordedBy,
                    purchaseDate: formData.purchaseDate,
                    purchasePrice: formData.purchasePrice,
                    vendor: formData.vendor,
                    poNumber: formData.poNumber,
                    invoiceNumber: formData.invoiceNumber,
                    warrantyEndDate: formData.warrantyEndDate,
                    location: formData.location,
                    locationDetail: formData.locationDetail,
                    currentUser: formData.currentUser,
                    status: AssetStatus.IN_STORAGE,
                    condition: formData.condition,
                    notes: formData.notes,
                    attachments: [],
                    activityLog: [
                        { id: `log-${newId}-create`, timestamp: new Date().toISOString(), user: currentUser.name, action: 'Aset Dicatat', details: 'Aset baru dicatat ke dalam sistem.'}
                    ],
                    woRoIntNumber: formData.relatedRequestId || `REG-${newId}`,
                    lastModifiedBy: null,
                    lastModifiedDate: null,
                }
            });

            setAssets(prev => [...newAssets, ...prev]);
            
            if (formData.relatedRequestId && prefillData?.itemToRegister) {
                onRegistrationComplete(formData.relatedRequestId, {
                    requestItemId: prefillData.itemToRegister.id,
                    count: formData.bulkItems.length
                });
                addNotification(`${newAssets.length} aset dari request ${formData.relatedRequestId} berhasil dicatat.`, 'success');
                setActivePage('request', { reopenStagingModalFor: formData.relatedRequestId });
            } else {
                addNotification(`${newAssets.length} aset baru berhasil ditambahkan.`, 'success');
                handleSetView('list');
            }
        }
    };
    
    const handleConfirmDelete = () => {
        if (!assetToDeleteId) return;
        setIsLoading(true);
        setTimeout(() => {
            setAssets(prev => prev.filter(r => r.id !== assetToDeleteId));
            addNotification(`Aset ${assetToDeleteId} berhasil dihapus.`, 'success');
            setAssetToDeleteId(null);
            setIsLoading(false);
        }, 1000);
    };

    const { deletableAssetsCount, skippableAssetsCount } = useMemo(() => {
        if (!bulkDeleteConfirmation) return { deletableAssetsCount: 0, skippableAssetsCount: 0 };
        
        const selected = assets.filter(a => selectedAssetIds.includes(a.id));
        const skippable = selected.filter(a => a.status === AssetStatus.IN_USE);
        
        return {
            deletableAssetsCount: selected.length - skippable.length,
            skippableAssetsCount: skippable.length,
        };
    }, [bulkDeleteConfirmation, selectedAssetIds, assets]);


    const handleBulkDelete = () => {
        const deletableAssetIds = selectedAssetIds.filter(id => {
            const asset = assets.find(a => a.id === id);
            return asset && asset.status !== AssetStatus.IN_USE;
        });
        
        if (deletableAssetIds.length === 0) {
            addNotification('Tidak ada aset yang dapat dihapus (semua sedang digunakan).', 'error');
            setBulkDeleteConfirmation(false);
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            setAssets(prev => prev.filter(asset => !deletableAssetIds.includes(asset.id)));
            
            let message = `${deletableAssetIds.length} aset berhasil dihapus.`;
            if (skippableAssetsCount > 0) {
                message += ` ${skippableAssetsCount} aset dilewati karena sedang digunakan.`;
            }
            addNotification(message, 'success');

            setBulkDeleteConfirmation(false);
            handleCancelBulkMode();
            setIsLoading(false);
        }, 1000);
    };

    const handleChangeStatus = () => {
        if (!selectedAsset) return;
        setIsLoading(true);
        setTimeout(() => {
            setAssets(prev => prev.map(asset => 
                asset.id === selectedAsset.id 
                ? { ...asset, status: targetStatus, lastModifiedBy: currentUser.name, lastModifiedDate: new Date().toISOString() } 
                : asset
            ));
            addNotification(`Status aset ${selectedAsset.id} berhasil diubah.`, 'success');
            setIsChangeStatusModalOpen(false);
            setIsModalOpen(false);
            setSelectedAsset(null);
            setIsLoading(false);
        }, 1000);
    };

    const handleBulkChangeStatus = () => {
        setIsLoading(true);
        setTimeout(() => {
            setAssets(prev => prev.map(asset => {
                if (selectedAssetIds.includes(asset.id)) {
                    const newLog: ActivityLogEntry = {
                        id: `log-${asset.id}-${Date.now()}`,
                        timestamp: new Date().toISOString(),
                        user: currentUser.name,
                        action: 'Status Diubah (Massal)',
                        details: `Status diubah dari "${asset.status}" menjadi "${targetStatus}".`
                    };
                    return { ...asset, status: targetStatus, activityLog: [...asset.activityLog, newLog] };
                }
                return asset;
            }));
            addNotification(`${selectedAssetIds.length} aset berhasil diubah statusnya menjadi "${targetStatus}".`, 'success');
            setIsChangeStatusModalOpen(false);
            handleCancelBulkMode();
            setIsLoading(false);
        }, 1000);
    };

    const handleBulkChangeLocation = () => {
        setIsLoading(true);
        setTimeout(() => {
            setAssets(prev => prev.map(asset => {
                if (selectedAssetIds.includes(asset.id)) {
                     const newLog: ActivityLogEntry = {
                        id: `log-${asset.id}-${Date.now()}`,
                        timestamp: new Date().toISOString(),
                        user: currentUser.name,
                        action: 'Lokasi Diubah (Massal)',
                        details: `Lokasi diubah dari "${asset.location}" menjadi "${targetLocation}".`
                    };
                    return { ...asset, location: targetLocation, locationDetail: targetLocationDetail, activityLog: [...asset.activityLog, newLog] };
                }
                return asset;
            }));
            addNotification(`${selectedAssetIds.length} aset berhasil dipindahkan ke "${targetLocation}".`, 'success');
            setIsChangeLocationModalOpen(false);
            handleCancelBulkMode();
            setIsLoading(false);
        }, 1000);
    };


    const handlePrintQrCode = () => {
        if (!selectedAsset) return;
    
        const printWindow = window.open('', '', 'height=400,width=400');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                <head>
                    <title>Cetak Label QR - ${selectedAsset.id}</title>
                    <style>
                        body { 
                            margin: 0; 
                            padding: 20px; 
                            display: flex; 
                            align-items: center; 
                            justify-content: center; 
                            height: 100%; 
                            box-sizing: border-box; 
                            -webkit-print-color-adjust: exact; 
                        }
                        .print-label { 
                            text-align: center; 
                            font-family: sans-serif; 
                            display: flex; 
                            flex-direction: column; 
                            align-items: center; 
                            gap: 10px;
                        }
                        .print-label p { margin: 0; }
                        .asset-name { font-size: 14px; font-weight: bold; }
                        .asset-id { font-size: 12px; }
                        .asset-sn { font-family: monospace; font-size: 10px; word-break: break-all; }
                    </style>
                </head>
                <body>
                    <div class="print-label">
                        <canvas id="print-canvas"></canvas>
                        <div>
                            <p class="asset-name">${selectedAsset.name}</p>
                            <p class="asset-id">${selectedAsset.id}</p>
                            <p class="asset-sn">SN: ${selectedAsset.serialNumber}</p>
                        </div>
                    </div>
                </body>
                </html>
            `);
            printWindow.document.close();
            
            const printCanvas = printWindow.document.getElementById('print-canvas');
            if (printCanvas) {
                const qrContent = JSON.stringify({
                    v: 1,
                    type: 'asset',
                    id: selectedAsset.id,
                    name: selectedAsset.name,
                    sn: selectedAsset.serialNumber,
                    mac: selectedAsset.macAddress
                });
                QRCode.toCanvas(printCanvas, qrContent, { width: 160, margin: 1 }, function (error: any) {
                    if (error) {
                        console.error('QR Code generation failed in print window:', error);
                        return;
                    }
                    printWindow.focus();
                    setTimeout(() => {
                        printWindow.print();
                        printWindow.close();
                    }, 250);
                });
            }
        }
    };

    const handleDownloadQrCode = () => {
        if (qrCanvasRef.current && selectedAsset) {
            const qrCanvas = qrCanvasRef.current;
    
            // Create a new canvas to compose the final image
            const labelCanvas = document.createElement('canvas');
            const ctx = labelCanvas.getContext('2d');
            if (!ctx) return;
    
            // Define dimensions and padding
            const padding = 20;
            const qrSize = qrCanvas.width;
            const textLineHeight = 20;
            const nameFontSize = 16;
            const idFontSize = 14;
            const snFontSize = 12;
    
            // Calculate canvas dimensions
            const textBlockHeight = textLineHeight * 3 + 10; // Extra padding
            labelCanvas.width = qrSize + padding * 2;
            labelCanvas.height = qrSize + textBlockHeight + padding * 2;
    
            // 1. Draw white background
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, labelCanvas.width, labelCanvas.height);
    
            // 2. Draw QR code in the center
            ctx.drawImage(qrCanvas, padding, padding);
    
            // 3. Draw text below the QR code
            ctx.fillStyle = '#111827'; // tm-dark
            ctx.textAlign = 'center';
    
            let textY = padding + qrSize + padding + nameFontSize;
    
            // Asset Name
            ctx.font = `bold ${nameFontSize}px sans-serif`;
            ctx.fillText(selectedAsset.name, labelCanvas.width / 2, textY);
            textY += textLineHeight;
    
            // Asset ID
            ctx.font = `600 ${idFontSize}px sans-serif`;
            ctx.fillStyle = '#374151'; // gray-700
            ctx.fillText(selectedAsset.id, labelCanvas.width / 2, textY);
            textY += textLineHeight;
    
            // Serial Number
            ctx.font = `${snFontSize}px monospace`;
            ctx.fillStyle = '#6B7280'; // gray-500
            ctx.fillText(`SN: ${selectedAsset.serialNumber}`, labelCanvas.width / 2, textY);
    
            // 4. Trigger download
            const link = document.createElement('a');
            link.download = `QR-Label_${selectedAsset.id}.png`;
            link.href = labelCanvas.toDataURL('image/png');
            link.click();
    
            addNotification('Label QR berhasil diunduh.', 'success');
        }
    };
    
    const handleBulkPrintQr = () => {
        const assetsToPrint = assets.filter(a => selectedAssetIds.includes(a.id));
        if (assetsToPrint.length === 0) {
            addNotification('Pilih setidaknya satu aset untuk dicetak.', 'error');
            return;
        }

        const printWindow = window.open('', '', 'height=800,width=1000');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                <head>
                    <title>Cetak Label QR Massal</title>
                    <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js"></script>
                    <style>
                        @media print { @page { size: A4; margin: 1cm; } body { -webkit-print-color-adjust: exact; } .no-print { display: none !important; } }
                        body { font-family: sans-serif; margin: 0; }
                        .print-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; padding: 20px; }
                        .qr-label { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 15px; border: 1px solid #ccc; border-radius: 8px; page-break-inside: avoid; }
                        .qr-label canvas { margin-bottom: 10px; }
                        .asset-name { font-size: 14px; font-weight: bold; margin: 0; }
                        .asset-id { font-size: 12px; margin: 2px 0; }
                        .asset-sn { font-family: monospace; font-size: 10px; margin: 0; word-break: break-all; }
                        .print-header { padding: 20px; text-align: center; background-color: #f3f4f6; border-bottom: 1px solid #e5e7eb; }
                        .print-button { padding: 10px 20px; font-size: 16px; cursor: pointer; background-color: #1D4ED8; color: white; border: none; border-radius: 8px; }
                    </style>
                </head>
                <body>
                    <div class="print-header no-print">
                        <h1>Pratinjau Cetak Label QR</h1>
                        <p>Total ${assetsToPrint.length} label akan dicetak. Pastikan printer Anda siap.</p>
                        <button class="print-button" onclick="window.print()">Cetak Sekarang</button>
                    </div>
                    <div class="print-grid">
            `);

            assetsToPrint.forEach(asset => {
                printWindow.document.write(`
                    <div class="qr-label">
                        <canvas id="qr-${asset.id}" width="128" height="128"></canvas>
                        <p class="asset-name">${asset.name}</p>
                        <p class="asset-id">${asset.id}</p>
                        <p class="asset-sn">SN: ${asset.serialNumber}</p>
                    </div>
                `);
            });

            printWindow.document.write(`
                    </div>
                    <script>
                        document.addEventListener('DOMContentLoaded', () => {
                            const assets = ${JSON.stringify(assetsToPrint.map(a => ({ id: a.id, name: a.name, sn: a.serialNumber, mac: a.macAddress })))};
                            const promises = assets.map(asset => {
                                return new Promise((resolve, reject) => {
                                    const canvas = document.getElementById('qr-' + asset.id);
                                    const qrContent = JSON.stringify({ v: 1, type: 'asset', id: asset.id, name: asset.name, sn: asset.sn, mac: asset.mac });
                                    QRCode.toCanvas(canvas, qrContent, { width: 128 }, function (error) {
                                        if (error) reject(error);
                                        else resolve();
                                    });
                                });
                            });
                            Promise.all(promises).catch(err => console.error('Error generating QR codes:', err));
                        });
                    </script>
                </body>
                </html>
            `);

            printWindow.document.close();
            printWindow.focus();
        }
    };

    useEffect(() => {
        if (activeTab === 'qr-code' && selectedAsset && qrCanvasRef.current) {
            if (typeof QRCode !== 'undefined') {
                const qrContent = JSON.stringify({
                    v: 1,
                    type: 'asset',
                    id: selectedAsset.id,
                    name: selectedAsset.name,
                    sn: selectedAsset.serialNumber,
                    mac: selectedAsset.macAddress
                });
                QRCode.toCanvas(qrCanvasRef.current, qrContent, { width: 160, margin: 1 }, function (error: any) {
                    if (error) console.error(error);
                });
            }
        }
    }, [activeTab, selectedAsset]);

    const FilterSummary: React.FC = () => {
        const pills: { key: keyof typeof filters, label: string, value: string }[] = [];
        if (filters.status) pills.push({ key: 'status', label: 'Status', value: filters.status });
        if (filters.category) pills.push({ key: 'category', label: 'Kategori', value: filters.category });
        if (filters.location) pills.push({ key: 'location', label: 'Lokasi', value: filters.location });
        if (filters.name) pills.push({ key: 'name', label: 'Nama Aset', value: filters.name });
        if (filters.brand) pills.push({ key: 'brand', label: 'Brand', value: filters.brand });
        if (filters.dismantled) pills.push({ key: 'dismantled', label: 'Dismantled', value: 'Ya' });
        if (filters.warranty) pills.push({ key: 'warranty', label: 'Garansi', value: filters.warranty });

        const removeFilter = (key: keyof typeof filters) => {
            setFilters(prev => ({ ...prev, [key]: '' }));
            setTempFilters(prev => ({ ...prev, [key]: '' }));
        };

        if (pills.length === 0) return null;

        return (
            <div className="pt-4 mt-4 border-t border-gray-200">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="text-sm font-medium text-gray-600">Filter Aktif:</span>
                    {pills.map(pill => (
                        <span key={pill.key} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-tm-primary bg-blue-100 rounded-full">
                            {pill.label}: {pill.value}
                            <button onClick={() => removeFilter(pill.key)} className="p-0.5 -mr-1 text-tm-primary/70 rounded-full hover:bg-blue-200 hover:text-tm-primary">
                                <CloseIcon className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                    <button onClick={handleResetFilters} className="ml-2 text-xs font-semibold text-gray-500 hover:text-tm-primary hover:underline">
                        Reset Semua
                    </button>
                </div>
                <p className="text-sm text-gray-600">
                    Menampilkan <span className="font-semibold text-tm-dark">{sortedAssets.length}</span> dari <span className="font-semibold text-tm-dark">{assets.length}</span> total aset yang cocok.
                </p>
            </div>
        );
    };    

    const renderContent = () => {
        if (view === 'form') {
            return (
                <div className="p-4 sm:p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl font-bold text-tm-dark">{assetToEdit ? 'Edit Aset' : 'Catat Aset Baru'}</h1>
                        <button
                            onClick={() => handleSetView('list')}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tm-accent"
                        >
                            Kembali ke Daftar
                        </button>
                    </div>
                    <div className="p-4 sm:p-6 bg-white border border-gray-200/80 rounded-xl shadow-md pb-24">
                        <RegistrationForm 
                            onBack={() => handleSetView('list')} 
                            onSave={handleSaveAsset} 
                            prefillData={prefillData}
                            editingAsset={assetToEdit}
                            currentUser={currentUser}
                            onStartScan={handleStartScan}
                            bulkItems={bulkItems}
                            setBulkItems={setBulkItems}
                            assetCategories={assetCategories}
                            openModelModal={openModelModal}
                            openTypeModal={openTypeModal}
                            setActivePage={setActivePage}
                        />
                    </div>
                </div>
            );
        }

        return (
            <div className="p-4 sm:p-6 md:p-8">
                <div className="flex flex-col items-start justify-between gap-4 mb-6 md:flex-row md:items-center">
                    <h1 className="text-3xl font-bold text-tm-dark">Daftar Aset</h1>
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
                            Catat Aset Baru
                        </button>
                    </div>
                </div>
                
                 <div className="p-4 mb-4 bg-white border border-gray-200/80 rounded-xl shadow-md">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative flex-grow">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <SearchIcon className="w-5 h-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Cari ID, Nama, SN, Pengguna..."
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
                                    <div className="fixed top-32 inset-x-4 z-30 origin-top rounded-xl border border-gray-200 bg-white shadow-lg sm:absolute sm:top-full sm:inset-x-auto sm:right-0 sm:mt-2 sm:w-96">
                                        <div className="flex items-center justify-between p-4 border-b">
                                            <h3 className="text-lg font-semibold text-gray-800">Filter Aset</h3>
                                            <button onClick={() => setIsFilterPanelOpen(false)} className="p-1 text-gray-400 rounded-full hover:bg-gray-100"><CloseIcon className="w-5 h-5"/></button>
                                        </div>
                                        <div className="p-4 space-y-5 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {filterOptions.statuses.map(status => (
                                                        <button key={status} type="button" onClick={() => setTempFilters(f => ({ ...f, status: f.status === status ? '' : status }))}
                                                            className={`px-3 py-1.5 text-sm rounded-md border text-center transition-colors ${ tempFilters.status === status ? 'bg-tm-primary border-tm-primary text-white font-semibold' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50' }`}>
                                                            {status}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Kategori</label>
                                                <CustomSelect options={categoryFilterOptions} value={tempFilters.category} onChange={(value) => setTempFilters(f => ({...f, category: value}))} onEmptyStateClick={() => setActivePage('kategori')} emptyStateMessage="Tidak ada Kategori" emptyStateButtonLabel="Kelola Kategori"/>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Lokasi</label>
                                                <CustomSelect options={locationFilterOptions} value={tempFilters.location} onChange={(value) => setTempFilters(f => ({...f, location: value}))} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Garansi</label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {warrantyFilterOptions.map(opt => (
                                                        <button key={opt.value} type="button" onClick={() => setTempFilters(f => ({ ...f, warranty: f.warranty === opt.value ? '' : opt.value }))}
                                                            className={`px-3 py-1.5 text-sm rounded-md border text-center transition-colors ${ tempFilters.warranty === opt.value ? 'bg-tm-primary border-tm-primary text-white font-semibold' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50' }`}>
                                                            {opt.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Lainnya</label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button type="button" onClick={() => setTempFilters(f => ({ ...f, dismantled: f.dismantled === 'yes' ? '' : 'yes' }))}
                                                        className={`px-3 py-1.5 text-sm rounded-md border text-center transition-colors ${ tempFilters.dismantled === 'yes' ? 'bg-tm-primary border-tm-primary text-white font-semibold' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50' }`}>
                                                        Hanya Dismantled
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-gray-50 border-t">
                                            <button onClick={handleResetFilters} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Reset Filter</button>
                                            <button onClick={handleApplyFilters} className="px-4 py-2 text-sm font-semibold text-white bg-tm-primary rounded-lg shadow-sm hover:bg-tm-primary-hover">Terapkan</button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    <FilterSummary />
                </div>


                {isBulkSelectMode && (
                     <div className="p-4 mb-4 bg-blue-50 border-l-4 border-tm-accent rounded-r-lg">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            {selectedAssetIds.length > 0 ? (
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="text-sm font-medium text-tm-primary">{selectedAssetIds.length} item terpilih</span>
                                    <div className="h-5 border-l border-gray-300"></div>
                                    <button onClick={handleBulkPrintQr} className="px-3 py-1.5 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cetak Label QR</button>
                                    <button onClick={() => setIsChangeStatusModalOpen(true)} className="px-3 py-1.5 text-sm font-semibold text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200">Ubah Status</button>
                                    <button onClick={() => setIsChangeLocationModalOpen(true)} className="px-3 py-1.5 text-sm font-semibold text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200">Ubah Lokasi</button>
                                    <button onClick={() => setBulkDeleteConfirmation(true)} className="px-3 py-1.5 text-sm font-semibold text-red-600 bg-red-100 rounded-md hover:bg-red-200">Hapus</button>
                                </div>
                            ) : (
                                <span className="text-sm text-gray-500">Pilih item untuk memulai aksi massal. Tekan tahan pada baris untuk memulai.</span>
                            )}
                            <button onClick={handleCancelBulkMode} className="px-3 py-1.5 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Batal</button>
                        </div>
                     </div>
                )}
                
                <div className="overflow-hidden bg-white border border-gray-200/80 rounded-xl shadow-md">
                    <div className="overflow-x-auto custom-scrollbar">
                        <RegistrationTable 
                            assets={paginatedAssets}
                            customers={customers}
                            onDetailClick={handleShowDetails} 
                            onDeleteClick={setAssetToDeleteId}
                            sortConfig={sortConfig} 
                            requestSort={requestSort}
                            selectedAssetIds={selectedAssetIds}
                            onSelectAll={handleSelectAll}
                            onSelectOne={handleSelectOne}
                            isBulkSelectMode={isBulkSelectMode}
                            onEnterBulkMode={() => setIsBulkSelectMode(true)}
                            onShowPreview={onShowPreview}
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

    const getLogIcon = (action: string) => {
        const iconClass = "w-4 h-4 text-blue-800";
        if (action.includes('Dicatat')) return <RegisterIcon className={iconClass} />;
        if (action.includes('Serah Terima')) return <HandoverIcon className={iconClass} />;
        if (action.includes('Instalasi')) return <CustomerIcon className={iconClass} />;
        if (action.includes('Dismantle')) return <DismantleIcon className={iconClass} />;
        if (action.includes('Diperbarui')) return <PencilIcon className={iconClass} />;
        if (action.includes('Status')) return <TagIcon className={iconClass} />;
        return <InfoIcon className={iconClass} />;
    };

    return (
        <>
            {renderContent()}
            
            {selectedAsset && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    title={`Detail Aset: ${selectedAsset.name}`}
                    size="3xl"
                    footerContent={
                        <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center w-full gap-3">
                            <div className="w-full sm:w-auto">
                                <button type="button" onClick={() => handleStartEdit(selectedAsset)} className="w-full sm:w-auto justify-center inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 transition-all duration-200 bg-white border rounded-lg shadow-sm hover:bg-gray-50">
                                    <PencilIcon className="w-4 h-4" /> Edit
                                </button>
                            </div>
                            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 w-full sm:w-auto">
                                {selectedAsset.status === AssetStatus.IN_STORAGE && (
                                    <>
                                        <button onClick={() => onInitiateHandover(selectedAsset)} className="w-full sm:w-auto justify-center inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white transition-colors bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700">
                                            <HandoverIcon className="w-4 h-4"/> Serah Terima Internal
                                        </button>
                                        {(() => {
                                            const category = assetCategories.find(c => c.name === selectedAsset.category);
                                            const canBeInstalled = category?.isCustomerInstallable;
                                            
                                            const button = (
                                                <button 
                                                    onClick={() => onInitiateInstallation(selectedAsset)} 
                                                    disabled={!canBeInstalled}
                                                    className="w-full sm:w-auto justify-center inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white transition-colors bg-green-600 rounded-lg shadow-sm hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                                >
                                                    <CustomerIcon className="w-4 h-4"/> Pasang ke Pelanggan
                                                </button>
                                            );

                                            if (canBeInstalled) {
                                                return button;
                                            } else {
                                                return (
                                                    <Tooltip text="Kategori aset ini tidak dapat diinstal ke pelanggan.">
                                                        <div className="w-full sm:w-auto">{button}</div>
                                                    </Tooltip>
                                                );
                                            }
                                        })()}
                                    </>
                                )}
                                {selectedAsset.status === AssetStatus.IN_USE && selectedAsset.currentUser?.startsWith('TMI-') && (
                                    <button onClick={() => onInitiateDismantle(selectedAsset)} className="w-full sm:w-auto justify-center inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white transition-colors bg-red-600 rounded-lg shadow-sm hover:bg-red-700">
                                        <DismantleIcon className="w-4 h-4"/> Tarik dari Pelanggan
                                    </button>
                                )}
                            </div>
                        </div>
                    }
                >
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                            <button onClick={() => setActiveTab('details')} className={`py-3 px-1 border-b-2 text-sm font-medium ${activeTab === 'details' ? 'border-tm-primary text-tm-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                                Detail
                            </button>
                             <button onClick={() => setActiveTab('history')} className={`py-3 px-1 border-b-2 text-sm font-medium ${activeTab === 'history' ? 'border-tm-primary text-tm-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                                Riwayat
                            </button>
                            <button onClick={() => setActiveTab('attachments')} className={`py-3 px-1 border-b-2 text-sm font-medium ${activeTab === 'attachments' ? 'border-tm-primary text-tm-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                                Lampiran
                            </button>
                            <button onClick={() => setActiveTab('qr-code')} className={`py-3 px-1 border-b-2 text-sm font-medium ${activeTab === 'qr-code' ? 'border-tm-primary text-tm-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                                Kode QR
                            </button>
                        </nav>
                    </div>
                    <div className="py-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                        {activeTab === 'details' && (() => {
                             const assetTypeForDetail = assetCategories
                                .find(c => c.name === selectedAsset.category)
                                ?.types.find(t => t.name === selectedAsset.type);
                            
                            return (
                                <div className="space-y-6">
                                    <DetailCard title="Informasi Dasar">
                                        <DetailItem label="ID Aset" value={selectedAsset.id} />
                                        <DetailItem label="Kategori" value={selectedAsset.category} />
                                        <DetailItem label="Tipe" value={selectedAsset.type} />
                                        <DetailItem label="Brand" value={selectedAsset.brand} />

                                        {assetTypeForDetail?.trackingMethod === 'bulk' ? (
                                            <>
                                                <DetailItem label="Metode Pelacakan">
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2 py-0.5 text-xs font-semibold text-purple-800 bg-purple-100 rounded-full">Bulk</span>
                                                    </div>
                                                </DetailItem>
                                                <DetailItem label="Satuan Ukur (Stok)" value={`${assetTypeForDetail.unitOfMeasure || 'N/A'}`} />
                                                <DetailItem label="Satuan Dasar" value={assetTypeForDetail.baseUnitOfMeasure || 'N/A'} />
                                                <DetailItem label="Konversi" value={
                                                    assetTypeForDetail.quantityPerUnit 
                                                    ? `1 ${assetTypeForDetail.unitOfMeasure} = ${assetTypeForDetail.quantityPerUnit} ${assetTypeForDetail.baseUnitOfMeasure}`
                                                    : '-'
                                                } />
                                            </>
                                        ) : (
                                            <>
                                                <DetailItem label="Nomor Seri">
                                                    <div className="flex items-center gap-2 font-mono">
                                                        <span>{selectedAsset.serialNumber || '-'}</span>
                                                        {selectedAsset.serialNumber && <button onClick={() => navigator.clipboard.writeText(selectedAsset.serialNumber!)} title="Salin" className="text-gray-400 hover:text-tm-primary"><CopyIcon className="w-3 h-3"/></button>}
                                                    </div>
                                                </DetailItem>
                                                <DetailItem label="MAC Address">
                                                    <div className="flex items-center gap-2 font-mono">
                                                        <span>{selectedAsset.macAddress || '-'}</span>
                                                        {selectedAsset.macAddress && <button onClick={() => navigator.clipboard.writeText(selectedAsset.macAddress!)} title="Salin" className="text-gray-400 hover:text-tm-primary"><CopyIcon className="w-3 h-3"/></button>}
                                                    </div>
                                                </DetailItem>
                                            </>
                                        )}
                                    </DetailCard>
                                     <DetailCard title="Informasi Pembelian">
                                        <DetailItem label="Tgl Pembelian" value={selectedAsset.purchaseDate} />
                                        <DetailItem label="Harga Beli" value={selectedAsset.purchasePrice ? `Rp ${selectedAsset.purchasePrice.toLocaleString('id-ID')}` : '-'} />
                                        <DetailItem label="Vendor" value={selectedAsset.vendor} />
                                        <DetailItem label="Akhir Garansi" value={selectedAsset.warrantyEndDate} />
                                        <DetailItem label="No. PO" value={<ClickableLink onClick={() => onShowPreview({type: 'request', id: selectedAsset.poNumber!})}>{selectedAsset.poNumber}</ClickableLink>} />
                                        <DetailItem label="No. Invoice" value={selectedAsset.invoiceNumber} />
                                    </DetailCard>
                                     <DetailCard title="Status & Lokasi">
                                        <DetailItem label="Status Saat Ini">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusClass(selectedAsset.status)}`}>{selectedAsset.status}</span>
                                                <button onClick={() => setIsChangeStatusModalOpen(true)} className="p-1.5 text-gray-500 rounded-full hover:bg-gray-100"><PencilIcon className="w-3.5 h-3.5" /></button>
                                            </div>
                                        </DetailItem>
                                        <DetailItem label="Kondisi" value={selectedAsset.condition} />
                                        <DetailItem label="Lokasi" value={selectedAsset.location} />
                                        <DetailItem label="Detail Lokasi" value={selectedAsset.locationDetail} />
                                        <DetailItem label="Pengguna Saat Ini">
                                            {selectedAsset.currentUser?.startsWith('TMI-') ? (
                                                 <ClickableLink onClick={() => onShowPreview({type: 'customer', id: selectedAsset.currentUser!})}>
                                                    {customers.find(c => c.id === selectedAsset.currentUser)?.name || selectedAsset.currentUser}
                                                </ClickableLink>
                                            ) : selectedAsset.currentUser ? (
                                                <ClickableLink onClick={() => onShowPreview({type: 'user', id: selectedAsset.currentUser!})}>
                                                    {selectedAsset.currentUser}
                                                </ClickableLink>
                                            ) : '-'}
                                        </DetailItem>
                                        <DetailItem label="Dicatat oleh" value={selectedAsset.recordedBy} fullWidth />
                                        <DetailItem label="Catatan" value={selectedAsset.notes} fullWidth />
                                    </DetailCard>
                                </div>
                            );
                        })()}
                        {activeTab === 'history' && (
                             <ol className="relative ml-4 border-l border-gray-200">                  
                                {selectedAsset.activityLog.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((log) => (
                                <li key={log.id} className="mb-6 ml-6">
                                    <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full -left-4 ring-4 ring-white">
                                        {getLogIcon(log.action)}
                                    </span>
                                    <time className="block mb-1 text-xs font-normal leading-none text-gray-500">{new Date(log.timestamp).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}</time>
                                    <h3 className="text-sm font-semibold text-gray-900">{log.action}</h3>
                                    <p className="text-sm font-normal text-gray-600">
                                        {log.details} oleh <ClickableLink onClick={() => onShowPreview({ type: 'user', id: log.user })}>{log.user}</ClickableLink>.
                                    </p>
                                    {log.referenceId && (
                                        <div className="mt-1.5">
                                            <ClickableLink 
                                                onClick={() => onShowPreview({ type: log.referenceId?.startsWith('HO') ? 'handover' : log.referenceId?.startsWith('DSM') ? 'dismantle' : 'request', id: log.referenceId! })}
                                                title={`Lihat detail untuk ${log.referenceId}`}
                                            >
                                                Lihat Dokumen: {log.referenceId}
                                            </ClickableLink>
                                        </div>
                                    )}
                                </li>
                                ))}
                            </ol>
                        )}
                         {activeTab === 'attachments' && (
                            <div className="space-y-3">
                                {selectedAsset.attachments.length > 0 ? selectedAsset.attachments.map(att => (
                                    <div key={att.id} className="flex items-center justify-between p-3 text-sm bg-gray-50 border rounded-lg">
                                        <div>
                                            <p className="font-semibold text-gray-800">{att.name}</p>
                                            <p className="text-xs text-gray-500">{att.type === 'image' ? 'Gambar' : 'Dokumen PDF'}</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <a href={att.url} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-500 rounded-full hover:bg-gray-200" title="Lihat"><EyeIcon className="w-4 h-4" /></a>
                                            <a href={att.url} download={att.name} className="p-2 text-gray-500 rounded-full hover:bg-gray-200" title="Unduh"><DownloadIcon className="w-4 h-4" /></a>
                                        </div>
                                    </div>
                                )) : <p className="text-sm text-center text-gray-500 py-4">Tidak ada lampiran.</p>}
                            </div>
                        )}
                        {activeTab === 'qr-code' && (
                            <div className="flex flex-col items-center justify-center space-y-4">
                               <div className="p-4 bg-white border rounded-lg shadow-sm">
                                    <canvas ref={qrCanvasRef} />
                                </div>
                                <div className="text-center">
                                    <p className="font-semibold text-lg text-gray-800">{selectedAsset.id}</p>
                                    <p className="text-sm text-gray-500">{selectedAsset.name}</p>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <button onClick={handlePrintQrCode} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Cetak</button>
                                    <button onClick={handleDownloadQrCode} className="px-4 py-2 text-sm font-medium text-white bg-tm-primary rounded-lg shadow-sm hover:bg-tm-primary-hover">Unduh</button>
                                </div>
                            </div>
                        )}
                    </div>
                </Modal>
            )}
            
            <Modal isOpen={!!assetToDeleteId} onClose={() => setAssetToDeleteId(null)} title="Konfirmasi Hapus" hideDefaultCloseButton size="md">
                <div className="text-center">
                    <ExclamationTriangleIcon className="w-12 h-12 mx-auto text-red-500" />
                    <h3 className="mt-4 text-lg font-semibold text-gray-800">Hapus Aset?</h3>
                    <p className="mt-2 text-sm text-gray-600">Anda yakin ingin menghapus aset <strong>{assetToDeleteId}</strong>? Tindakan ini tidak dapat diurungkan.</p>
                </div>
                <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                    <button onClick={() => setAssetToDeleteId(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Batal</button>
                    <button onClick={handleConfirmDelete} disabled={isLoading} className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-danger rounded-lg shadow-sm hover:bg-red-700">{isLoading && <SpinnerIcon className="w-4 h-4 mr-2"/>} Hapus</button>
                </div>
            </Modal>
            
            {/* FIX: Changed `onClose` to pass a function instead of calling the state setter directly. */}
            <Modal isOpen={bulkDeleteConfirmation} onClose={() => setBulkDeleteConfirmation(false)} title="Konfirmasi Hapus Massal" size="md" hideDefaultCloseButton>
                <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 mx-auto text-red-600 bg-red-100 rounded-full">
                        <ExclamationTriangleIcon className="w-8 h-8" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-gray-800">
                        Hapus {deletableAssetsCount} Aset?
                    </h3>
                    <p className="mt-2 text-sm text-gray-600">
                        Anda akan menghapus aset yang dipilih secara permanen. Aksi ini tidak dapat diurungkan.
                    </p>
                    <div className="w-full p-3 mt-4 text-sm text-left bg-gray-50 border rounded-lg">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Total Aset Dipilih:</span>
                            <span className="font-semibold text-gray-800">{selectedAssetIds.length}</span>
                        </div>
                        <div className="flex justify-between mt-1 text-green-700">
                            <span className="font-medium">Akan Dihapus:</span>
                            <span className="font-bold">{deletableAssetsCount}</span>
                        </div>
                        <div className="flex justify-between mt-1 text-amber-700">
                            <span className="font-medium">Dilewati (status "Digunakan"):</span>
                            <span className="font-bold">{skippableAssetsCount}</span>
                        </div>
                    </div>
                    {deletableAssetsCount === 0 && skippableAssetsCount > 0 && (
                        <p className="mt-4 text-sm font-semibold text-red-700">
                            Tidak ada aset yang dapat dihapus. Semua aset yang dipilih sedang digunakan.
                        </p>
                    )}
                </div>
                 <div className="flex items-center justify-end pt-5 mt-5 space-x-3 border-t">
                    <button type="button" onClick={() => setBulkDeleteConfirmation(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Batal</button>
                    <button type="button" onClick={handleBulkDelete} disabled={isLoading || deletableAssetsCount === 0} className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-danger rounded-lg shadow-sm hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed">
                        {isLoading && <SpinnerIcon className="w-4 h-4 mr-2"/>}
                        Ya, Hapus ({deletableAssetsCount}) Aset
                    </button>
                </div>
            </Modal>

            <Modal
                isOpen={isChangeStatusModalOpen}
                onClose={() => setIsChangeStatusModalOpen(false)}
                title={isBulkSelectMode ? `Ubah Status untuk ${selectedAssetIds.length} Aset` : `Ubah Status untuk ${selectedAsset?.id}`}
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">Pilih status baru untuk aset yang dipilih.</p>
                    <div>
                        <CustomSelect
                            options={Object.values(AssetStatus).map(s => ({ value: s, label: s }))}
                            value={targetStatus}
                            onChange={v => setTargetStatus(v as AssetStatus)}
                        />
                    </div>
                </div>
                 <div className="flex items-center justify-end pt-5 mt-5 space-x-3 border-t">
                    <button onClick={() => setIsChangeStatusModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Batal</button>
                    <button onClick={isBulkSelectMode ? handleBulkChangeStatus : handleChangeStatus} disabled={isLoading} className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-tm-primary rounded-lg shadow-sm hover:bg-tm-primary-hover disabled:bg-tm-primary/70">{isLoading && <SpinnerIcon className="w-5 h-5 mr-2"/>}Ubah Status</button>
                </div>
            </Modal>
             <Modal
                isOpen={isChangeLocationModalOpen}
                onClose={() => setIsChangeLocationModalOpen(false)}
                title={`Pindahkan ${selectedAssetIds.length} Aset`}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Lokasi Tujuan</label>
                        <CustomSelect
                            options={assetLocations.map(l => ({ value: l, label: l }))}
                            value={targetLocation}
                            onChange={setTargetLocation}
                        />
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Detail Lokasi (Opsional)</label>
                         <input type="text" value={targetLocationDetail} onChange={e => setTargetLocationDetail(e.target.value)} className="block w-full px-3 py-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg shadow-sm" placeholder="Contoh: Rak C-05" />
                    </div>
                </div>
                <div className="flex items-center justify-end pt-5 mt-5 space-x-3 border-t">
                    <button onClick={() => setIsChangeLocationModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Batal</button>
                    <button onClick={handleBulkChangeLocation} disabled={isLoading} className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-tm-primary rounded-lg shadow-sm hover:bg-tm-primary-hover disabled:bg-tm-primary/70">{isLoading && <SpinnerIcon className="w-5 h-5 mr-2"/>}Pindahkan</button>
                </div>
            </Modal>
        </>
    );
};