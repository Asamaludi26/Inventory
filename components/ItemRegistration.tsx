import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
// FIX: Import PreviewData from central types file to resolve import error.
import { Asset, AssetStatus, AssetCondition, Attachment, Request, User, Customer, Handover, Dismantle, ActivityLogEntry, PreviewData, AssetCategory } from '../types';
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

declare var QRCode: any;
declare var Html5Qrcode: any;

interface ItemRegistrationProps {
    currentUser: User;
    assets: Asset[];
    setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
    customers: Customer[];
    requests: Request[];
    handovers: Handover[];
    dismantles: Dismantle[];
    assetCategories: AssetCategory[];
    prefillData?: Request | null;
    onClearPrefill: () => void;
    onRegistrationComplete: (requestId: string) => void;
    onInitiateHandover: (asset: Asset) => void;
    onInitiateDismantle: (asset: Asset) => void;
    onInitiateInstallation: (asset: Asset) => void;
    assetToViewId: string | null;
    initialFilters?: any;
    onClearInitialFilters: () => void;
    itemToEdit: { type: string; data: any } | null;
    onClearItemToEdit: () => void;
    onShowPreview: (data: PreviewData) => void;
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

const generateMockAssets = (): Asset[] => {
    const assets: Asset[] = [];
    const assetPool = [
        { name: 'Router Core RB4011iGS+', category: 'Perangkat Jaringan', type: 'Router', brand: 'Mikrotik' },
        { name: 'OLT EPON 8 Port', category: 'Perangkat Jaringan', type: 'OLT', brand: 'Huawei' },
        { name: 'Switch Unifi 24 Port PoE', category: 'Perangkat Jaringan', type: 'Switch', brand: 'Ubiquiti' },
        { name: 'Access Point U6 Lite', category: 'Perangkat Jaringan', type: 'Access Point', brand: 'Ubiquiti' },
        { name: 'ONT HG8245H', category: 'Perangkat Pelanggan (CPE)', type: 'ONT/ONU', brand: 'Huawei' },
        { name: 'Router WiFi Archer C6', category: 'Perangkat Pelanggan (CPE)', type: 'Router WiFi', brand: 'TP-Link' },
        { name: 'Fusion Splicer 90S', category: 'Infrastruktur Fiber Optik', type: 'Splicer', brand: 'Fujikura' },
        { name: 'OTDR AQ7280', category: 'Infrastruktur Fiber Optik', type: 'OTDR', brand: 'Yokogawa' },
        { name: 'Server Dell PowerEdge R740', category: 'Server & Penyimpanan', type: 'Server Rack', brand: 'Dell' },
        { name: 'UPS APC 3000VA', category: 'Server & Penyimpanan', type: 'UPS', brand: 'APC' },
        { name: 'Optical Power Meter', category: 'Alat Ukur & Perkakas', type: 'Power Meter', brand: 'Joinwit' },
        { name: 'LAN Tester NF-8209', category: 'Alat Ukur & Perkakas', type: 'LAN Tester', brand: 'Noyafa' },
        { name: 'Laptop Dell XPS 15', category: 'Komputer', type: 'Laptop', brand: 'Dell' },
        { name: 'PC Rakitan i7', category: 'Komputer', type: 'PC Desktop', brand: 'Custom' },
        { name: 'Monitor LG 27UK850-W', category: 'Peripheral', type: 'Monitor', brand: 'LG' },
        { name: 'ODP 16 Core', category: 'Infrastruktur Fiber Optik', type: 'Patch Panel', brand: 'Generic' },
        { name: 'Kabel Dropcore 150m', category: 'Infrastruktur Fiber Optik', type: 'Kabel Fiber Optik', brand: 'FiberHome' },
    ];

    const userPool = ['Evan Davis', 'Diana Miller', 'Charlie Brown', 'Bob Williams', 'Ivy Martinez', 'Grace Lee', 'Henry Wilson', 'Jack Taylor', 'Tim NOC Shift 1', 'Tim Engineer Lapangan'];
    const customerIdPool = Array.from({ length: 75 }, (_, i) => `TMI-${String(1001 + i).padStart(5, '0')}`);
    const statuses = Object.values(AssetStatus);
    const conditions = Object.values(AssetCondition);
    const dismantleCustomerPool = [
        { name: 'PT. Maju Mundur Sejahtera', id: 'TMI-01002' },
        { name: 'Warung Kopi Bahagia', id: 'TMI-01004' },
        { name: 'CV. Terang Benderang', id: 'TMI-01008' },
        { name: 'Sekolah Harapan Bangsa', id: 'TMI-01013' },
    ];


    for (let i = 1; i <= 150; i++) {
        const template = assetPool[i % assetPool.length];
        const purchaseDate = new Date(2024 - Math.floor(i / 30), (12 - i) % 12, 28 - (i % 28));
        const registrationDate = new Date(purchaseDate);
        registrationDate.setDate(purchaseDate.getDate() + (i % 5));
        
        let status = statuses[i % statuses.length];
        let condition = conditions[i % conditions.length];
        let isDismantled = false;
        let dismantleInfo: Asset['dismantleInfo'] = undefined;
        let lastModifiedDate: string | null = null;
        let lastModifiedBy: string | null = null;
        
        // Explicitly create a block of dismantled assets for demo purposes
        if (i > 5 && i <= 15) {
            status = AssetStatus.IN_STORAGE;
            condition = AssetCondition.USED_OKAY;
            isDismantled = true;
            const customer = dismantleCustomerPool[i % dismantleCustomerPool.length];
            const dismantleDate = new Date(purchaseDate);
            dismantleDate.setFullYear(purchaseDate.getFullYear() + Math.floor(i/5)); // Create varied dates
            dismantleInfo = {
                customerId: customer.id,
                customerName: customer.name,
                dismantleDate: dismantleDate.toISOString().split('T')[0],
                dismantleId: `DSM-MOCK-${String(i).padStart(3, '0')}`,
            };
        } else {
            isDismantled = status === AssetStatus.IN_STORAGE && i > 100 && i % 5 === 0; // Keep some randomness for others
        }
        
        if (i > 140) { // Add some edited assets for demo
             const modDate = new Date(registrationDate);
             modDate.setMonth(modDate.getMonth() + 2);
             lastModifiedDate = modDate.toISOString();
             lastModifiedBy = 'John Doe';
        }

        // Force statuses for assets to clearly demonstrate the CPE-only installation rule.
        // These will override any previous random or block assignments.
        if (i === 1) { // Non-CPE: OLT
            status = AssetStatus.IN_STORAGE;
            condition = AssetCondition.BRAND_NEW;
            isDismantled = false;
            dismantleInfo = undefined;
        }
        if (i === 2) { // Non-CPE: Switch
            status = AssetStatus.IN_STORAGE;
            condition = AssetCondition.GOOD;
            isDismantled = false;
            dismantleInfo = undefined;
        }
        if (i === 4) { // CPE: ONT
            status = AssetStatus.IN_STORAGE;
            condition = AssetCondition.BRAND_NEW;
            isDismantled = false;
            dismantleInfo = undefined;
        }
        if (i === 5) { // CPE: Router WiFi
            status = AssetStatus.IN_STORAGE;
            condition = AssetCondition.GOOD;
            isDismantled = false;
            dismantleInfo = undefined;
        }

        let location: string | null = assetLocations[i % assetLocations.length];
        let currentUser: string | null = null;
        
        if (status === AssetStatus.IN_USE) {
            if (i % 2 === 0 && template.category === 'Perangkat Pelanggan (CPE)') {
                 currentUser = customerIdPool[i % customerIdPool.length];
                 location = `Terpasang di Pelanggan ${currentUser}`;
            } else {
                 currentUser = userPool[i % userPool.length];
                 location = `Digunakan oleh ${currentUser}`;
            }
        } else if (status === AssetStatus.IN_STORAGE) {
             location = 'Gudang Inventori';
             currentUser = null;
        }

        if (status === AssetStatus.DECOMMISSIONED || status === AssetStatus.DAMAGED) {
            currentUser = null;
            location = status === AssetStatus.DECOMMISSIONED ? 'Diberhentikan' : 'Ruang Perbaikan';
        }

        assets.push({
            id: `AST-${String(i).padStart(4, '0')}`,
            name: `${template.name}`,
            category: template.category,
            type: template.type,
            brand: template.brand,
            serialNumber: `${template.brand.substring(0, 3).toUpperCase()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
            macAddress: `00:0C:42:${Math.floor(Math.random()*255).toString(16).padStart(2,'0').toUpperCase()}:${Math.floor(Math.random()*255).toString(16).padStart(2,'0').toUpperCase()}:${Math.floor(Math.random()*255).toString(16).padStart(2,'0').toUpperCase()}`,
            registrationDate: registrationDate.toISOString().split('T')[0],
            recordedBy: userPool[i % userPool.length],
            purchaseDate: purchaseDate.toISOString().split('T')[0],
            purchasePrice: Math.floor(Math.random() * (5000000 - 500000 + 1) + 500000),
            vendor: `Distributor ${String.fromCharCode(65 + (i%5))}`,
            poNumber: `PO-TRN-${String(202400 + i)}`,
            invoiceNumber: `INV/VENDOR${String.fromCharCode(65 + (i%5))}/${String(98765 + i)}`,
            warrantyEndDate: new Date(new Date(purchaseDate).setFullYear(purchaseDate.getFullYear() + (i % 3 === 0 ? -1 : 1) )).toISOString().split('T')[0],
            location,
            locationDetail: location === 'Gudang Inventori' ? `Rak ${String.fromCharCode(65 + (i % 5))}-${(i % 10) + 1}` : null,
            currentUser,
            woRoIntNumber: `WO-${String(12345 + i)}`,
            status,
            condition,
            notes: status === AssetStatus.DAMAGED ? 'Memerlukan perbaikan minor.' : (isDismantled ? `Aset hasil tarikan dari pelanggan ${dismantleInfo?.customerName}.` : null),
            attachments: [],
            activityLog: [],
            isDismantled,
            dismantleInfo,
            lastModifiedDate,
            lastModifiedBy,
        });
    }
    return assets;
};

export const mockAssets: Asset[] = generateMockAssets();

// FIX: Export getStatusClass to be used in other components.
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
                            <td id={`asset-name-${asset.id}`} className="px-6 py-4 whitespace-nowrap">
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
                            <td className="px-6 py-4 whitespace-nowrap">
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
                            <td className="px-6 py-4 whitespace-nowrap">
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
                            <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
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

// FIX: Added missing DetailCard and DetailItem components.
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

const parseScannedData = (data: string): { serialNumber?: string; macAddress?: string; raw: string } => {
    const result: { serialNumber?: string; macAddress?: string; raw: string } = { raw: data };
    const pairs = data.split(/[,;\n\r]/).map(p => p.trim());

    for (const pair of pairs) {
        const parts = pair.split(/[:=]/).map(p => p.trim());
        if (parts.length === 2) {
            const key = parts[0].toLowerCase();
            const value = parts[1];
            if (key.includes('sn') || key.includes('serial')) {
                result.serialNumber = value;
            } else if (key.includes('mac')) {
                result.macAddress = value.replace(/[-:]/g, ''); // Normalize MAC
            }
        }
    }
    
    return result;
};

const RegistrationForm: React.FC<{ 
    onBack: () => void; 
    onSave: (data: RegistrationFormData, assetIdToUpdate?: string) => void; 
    prefillData?: Request | null; 
    editingAsset?: Asset | null;
    currentUser: User;
    onStartScan: (itemId: number, field: 'serialNumber' | 'macAddress') => void;
    bulkItems: { id: number, serialNumber: string, macAddress: string }[];
    setBulkItems: React.Dispatch<React.SetStateAction<{ id: number, serialNumber: string, macAddress: string }[]>>;
    assetCategories: AssetCategory[];
}> = ({ onBack, onSave, prefillData, editingAsset, currentUser, onStartScan, bulkItems, setBulkItems, assetCategories }) => {
    const isEditing = !!editingAsset;
    const [assetName, setAssetName] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [assetType, setAssetType] = useState('');
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
    
    const [deviceTypes, setDeviceTypes] = useState<string[]>([]);
    const [isFooterVisible, setIsFooterVisible] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const footerRef = useRef<HTMLDivElement>(null);
    const formId = "asset-registration-form";

    useEffect(() => {
        if (prefillData && prefillData.items.length > 0) {
            const firstItem = prefillData.items[0];
            setAssetName(firstItem.itemName);
            setBrand(firstItem.itemTypeBrand);
            setNotes(`Pencatatan dari request ${prefillData.id}: ${firstItem.keterangan}`);
            setInitialUser(prefillData.requester);
            
            const quantity = prefillData.items.reduce((sum, item) => sum + item.quantity, 0);
            setBulkItems(Array.from({ length: quantity }, (_, i) => ({ id: Date.now() + i, serialNumber: '', macAddress: '' })));
        }
    }, [prefillData, setBulkItems]);
    
    useEffect(() => {
        if (isEditing && editingAsset) {
            setAssetName(editingAsset.name);
            setSelectedCategory(editingAsset.category);
            const category = assetCategories.find(c => c.name === editingAsset.category);
            setDeviceTypes(category ? category.types.map(t => t.name) : []);
            setAssetType(editingAsset.type);
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

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const categoryName = e.target.value;
        setSelectedCategory(categoryName);
        const category = assetCategories.find(c => c.name === categoryName);
        setDeviceTypes(category ? category.types.map(t => t.name) : []);
        setAssetType('');
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
        const formData: RegistrationFormData = {
            assetName,
            category: selectedCategory,
            type: assetType,
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
            bulkItems,
            relatedRequestId: prefillData?.id || null,
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
                            Mencatat aset dari permintaan <span className="font-bold">{prefillData.id}</span> oleh <span className="font-bold">{prefillData.requester}</span>.
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
                    <div className="md:col-span-2">
                        <label htmlFor="assetName" className="block text-sm font-medium text-gray-700">Nama Aset</label>
                        <input type="text" id="assetName" value={assetName} onChange={e => setAssetName(e.target.value)} required className="block w-full px-3 py-2 mt-1 text-gray-900 placeholder:text-gray-400 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-tm-accent focus:border-tm-accent sm:text-sm" placeholder="Contoh: Router Mikrotik RB4011" />
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">Kategori Aset</label>
                        <select id="category" onChange={handleCategoryChange} value={selectedCategory} required className="block w-full px-3 py-2 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-tm-accent focus:border-tm-accent sm:text-sm">
                            <option value="">-- Pilih Kategori --</option>
                            {assetCategories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700">Tipe Aset</label>
                        <select id="type" value={assetType} onChange={e => setAssetType(e.target.value)} disabled={!selectedCategory} required className="block w-full px-3 py-2 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-md shadow-sm disabled:bg-gray-200 disabled:cursor-not-allowed focus:outline-none focus:ring-tm-accent focus:border-tm-accent sm:text-sm">
                            <option value="">{selectedCategory ? '-- Pilih Tipe --' : 'Pilih kategori dahulu'}</option>
                            {deviceTypes.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="brand" className="block text-sm font-medium text-gray-700">Brand</label>
                        <input type="text" id="brand" value={brand} onChange={e => setBrand(e.target.value)} required className="block w-full px-3 py-2 mt-1 text-gray-900 placeholder:text-gray-400 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-tm-accent focus:border-tm-accent sm:text-sm" placeholder="Contoh: Mikrotik, Cisco, Ubiquiti, Huawei" />
                    </div>
                </FormSection>

                <FormSection title="Detail Unit Aset" icon={<InfoIcon className="w-6 h-6 mr-3 text-tm-primary" />} className="md:col-span-2">
                    <div className="md:col-span-2">
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">Daftar Unit (Nomor Seri & MAC Address)</label>
                            {!isEditing && <button type="button" onClick={addBulkItem} className="px-3 py-1 text-xs font-semibold text-white transition-colors duration-200 rounded-md shadow-sm bg-tm-accent hover:bg-tm-primary">+ Tambah Unit</button>}
                        </div>
                       <div className="space-y-3">
                            {bulkItems.map((item, index) => (
                                <div key={item.id} className="relative grid grid-cols-1 gap-x-4 gap-y-2 p-3 bg-gray-50/80 border rounded-lg md:grid-cols-2">
                                    <div className="md:col-span-2">
                                        <label className="text-sm font-medium text-gray-700">{isEditing ? 'Detail Unit' : `Unit #${index + 1}`}</label>
                                    </div>
                                    <div>
                                        <label htmlFor={`sn-${item.id}`} className="block text-xs font-medium text-gray-500">Nomor Seri</label>
                                        <div className="relative">
                                            <input
                                                id={`sn-${item.id}`}
                                                type="text"
                                                value={item.serialNumber}
                                                onChange={(e) => handleBulkItemChange(item.id, 'serialNumber', e.target.value)}
                                                required
                                                className="block w-full px-3 py-2 pr-10 mt-1 text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-tm-accent focus:border-tm-accent sm:text-sm"
                                                placeholder="Wajib diisi"
                                            />
                                            <button type="button" onClick={() => onStartScan(item.id, 'serialNumber')} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-tm-accent" aria-label={`Pindai Nomor Seri untuk Unit ${index + 1}`}>
                                                <QrCodeIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor={`mac-${item.id}`} className="block text-xs font-medium text-gray-500">MAC Address</label>
                                         <div className="relative">
                                            <input
                                                id={`mac-${item.id}`}
                                                type="text"
                                                value={item.macAddress}
                                                onChange={(e) => handleBulkItemChange(item.id, 'macAddress', e.target.value)}
                                                className="block w-full px-3 py-2 pr-10 mt-1 text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-tm-accent focus:border-tm-accent sm:text-sm"
                                                placeholder="Opsional"
                                            />
                                             <button type="button" onClick={() => onStartScan(item.id, 'macAddress')} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-tm-accent" aria-label={`Pindai MAC Address untuk Unit ${index + 1}`}>
                                                <QrCodeIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                    {bulkItems.length > 1 && !isEditing && (
                                        <div className="absolute top-2 right-2">
                                            <button type="button" onClick={() => removeBulkItem(item.id)} className="p-1 text-gray-400 rounded-full hover:bg-red-100 hover:text-red-500">
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
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
                        <select id="condition" value={condition} onChange={e => setCondition(e.target.value as AssetCondition)} className="block w-full px-3 py-2 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-md shadow-sm sm:text-sm">
                            {Object.values(AssetCondition).map(c => <option key={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700">Lokasi Fisik Aset</label>
                        <select id="location" value={location} onChange={e => setLocation(e.target.value)} className="block w-full px-3 py-2 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-md shadow-sm sm:text-sm">
                            <option value="">-- Pilih Lokasi --</option>
                            {assetLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                        </select>
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

export const ItemRegistration: React.FC<ItemRegistrationProps> = ({ currentUser, assets, setAssets, customers, requests, handovers, dismantles, assetCategories, prefillData, onClearPrefill, onRegistrationComplete, onInitiateHandover, onInitiateInstallation, onInitiateDismantle, assetToViewId, initialFilters, onClearInitialFilters, itemToEdit, onClearItemToEdit, onShowPreview }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [assetToDeleteId, setAssetToDeleteId] = useState<string | null>(null);
    const [bulkDeleteConfirmation, setBulkDeleteConfirmation] = useState(false);
    const addNotification = useNotification();
    const [isLoading, setIsLoading] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    const [activeTab, setActiveTab] = useState<'details' | 'history' | 'attachments' | 'qr-code'>('details');

    const [view, setView] = useState<'list' | 'form'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({ status: '', category: '', location: '', dismantled: '', warranty: '' });
    const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
    const [isBulkSelectMode, setIsBulkSelectMode] = useState(false);
    
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [scanningTarget, setScanningTarget] = useState<{ itemId: number; field: 'serialNumber' | 'macAddress' } | null>(null);
    const [bulkItems, setBulkItems] = useState<{ id: number, serialNumber: string, macAddress: string }[]>([{ id: Date.now(), serialNumber: '', macAddress: '' }]);

    const [isChangeStatusModalOpen, setIsChangeStatusModalOpen] = useState(false);
    const [targetStatus, setTargetStatus] = useState<AssetStatus>(AssetStatus.IN_STORAGE);
    const [assetToEdit, setAssetToEdit] = useState<Asset | null>(null);
    
    const qrCanvasRef = useRef<HTMLCanvasElement>(null);
    
    const handleStartEdit = useCallback((asset: Asset) => {
        setAssetToEdit(asset);
        setBulkItems([{
            id: Date.now(),
            serialNumber: asset.serialNumber,
            macAddress: asset.macAddress || '',
        }]);
        setIsModalOpen(false);
        setView('form');
    }, []);

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
    
    useEffect(() => {
        if (initialFilters && Object.keys(initialFilters).length > 0) {
            setFilters(prev => ({ ...prev, ...initialFilters }));
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

    const isFiltering = useMemo(() => {
        return searchQuery.trim() !== '' || filters.status !== '' || filters.category !== '' || filters.location !== '' || filters.dismantled !== '' || filters.warranty !== '';
    }, [searchQuery, filters]);

    const handleResetFilters = () => {
        setSearchQuery('');
        setFilters({ status: '', category: '', location: '', dismantled: '', warranty: '' });
    };

    const filterOptions = useMemo(() => {
        const categories = [...new Set(mockAssets.map(a => a.category))];
        const locations = [...new Set(mockAssets.map(a => a.location).filter(Boolean))] as string[];
        const statuses = Object.values(AssetStatus);
        return { categories, locations, statuses };
    }, []);

    const filteredAssets = useMemo(() => {
        return assets
            .filter(asset => {
                const searchLower = searchQuery.toLowerCase();
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
            .filter(asset => {
                if (filters.dismantled === 'yes') return asset.isDismantled === true;
                if (filters.dismantled === 'no') return !asset.isDismantled;
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
                    return warrantyEnd.getMonth() === currentMonth && warrantyEnd.getFullYear() === currentYear;
                }
                if (filters.warranty === 'expired') {
                    return warrantyEnd < today;
                }
                return true;
            });
    }, [assets, searchQuery, filters]);

    const { items: sortedAssets, requestSort, sortConfig } = useSortableData(filteredAssets, { key: 'id', direction: 'ascending' });
    
    const totalItems = sortedAssets.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedAssets = sortedAssets.slice(startIndex, endIndex);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filters, itemsPerPage]);

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

    useEffect(() => {
        if (isBulkSelectMode) {
            handleCancelBulkMode();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, filters]);

    const handleSelectOne = (id: string) => {
        setSelectedAssetIds(prev =>
            prev.includes(id) ? prev.filter(assetId => assetId !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setSelectedAssetIds(paginatedAssets.map(asset => asset.id));
        } else {
            setSelectedAssetIds([]);
        }
    };

    const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
    };

    const handleShowDetails = useCallback((asset: Asset) => {
        setSelectedAsset(asset);
        setActiveTab('details');
        setIsModalOpen(true);
    }, []);

    useEffect(() => {
        if (assetToViewId) {
            const assetToShow = assets.find(a => a.id === assetToViewId);
            if (assetToShow) {
                handleShowDetails(assetToShow);
            }
        }
    }, [assetToViewId, assets, handleShowDetails]);

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedAsset(null);
    };
    
    const handleConfirmDelete = () => {
        if (!assetToDeleteId) return;
        setIsLoading(true);
        setTimeout(() => { // Simulate API Call
            setAssets(prev => prev.filter(asset => asset.id !== assetToDeleteId));
            addNotification(`Aset ${assetToDeleteId} berhasil dihapus.`, 'success');
            setAssetToDeleteId(null);
            setIsLoading(false);
        }, 1000);
    };
    
    const { deletableAssetsCount, skippableAssetsCount } = useMemo(() => {
        if (!bulkDeleteConfirmation) {
            return { deletableAssetsCount: 0, skippableAssetsCount: 0 };
        }
        const selected = assets.filter(a => selectedAssetIds.includes(a.id));
        const skippable = selected.filter(a => a.status === AssetStatus.IN_USE);
        return {
            deletableAssetsCount: selected.length - skippable.length,
            skippableAssetsCount: skippable.length,
        };
    }, [bulkDeleteConfirmation, selectedAssetIds, assets]);

    const handleBulkDelete = () => {
        setIsLoading(true);
        setTimeout(() => {
            const deletableAssetIds = selectedAssetIds.filter(id => {
                const asset = assets.find(a => a.id === id);
                return asset && asset.status !== AssetStatus.IN_USE;
            });

            if (deletableAssetIds.length === 0) {
// FIX: Changed 'warning' to 'error' to match the allowed NotificationType values.
                addNotification('Tidak ada aset yang dapat dihapus (semua sedang digunakan).', 'error');
                setBulkDeleteConfirmation(false);
                setIsLoading(false);
                handleCancelBulkMode();
                return;
            }

            setAssets(prev => prev.filter(asset => !deletableAssetIds.includes(asset.id)));

            let message = `${deletableAssetIds.length} aset berhasil dihapus.`;
            if (skippableAssetsCount > 0) {
                message += ` ${skippableAssetsCount} aset dilewati karena sedang digunakan.`;
            }
            addNotification(message, 'success');

            handleCancelBulkMode();
            setBulkDeleteConfirmation(false);
            setIsLoading(false);
        }, 1000);
    };

    const handleChangeStatus = () => {
        if (!selectedAsset) return;
        setIsLoading(true);
        setTimeout(() => {
            setAssets(prev => prev.map(a => a.id === selectedAsset.id ? { ...a, status: targetStatus } : a));
            setSelectedAsset(prev => prev ? { ...prev, status: targetStatus } : null);
            addNotification(`Status aset ${selectedAsset.id} berhasil diubah.`, 'success');
            setIsChangeStatusModalOpen(false);
            setIsLoading(false);
        }, 1000);
    };
    
    const handleBulkStatusChange = () => {
        setIsLoading(true);
        setTimeout(() => { // Simulate API Call
            setAssets(prevAssets =>
                prevAssets.map(asset =>
                    selectedAssetIds.includes(asset.id)
                        ? { ...asset, status: targetStatus }
                        : asset
                )
            );
            addNotification(`${selectedAssetIds.length} aset berhasil diubah statusnya menjadi "${targetStatus}".`, 'success');
            setIsChangeStatusModalOpen(false);
            handleCancelBulkMode();
            setIsLoading(false);
        }, 1000);
    };

    const handleExport = () => {
        exportToCSV(sortedAssets, `aset_tercatat_${new Date().toISOString().split('T')[0]}`);
    };
    
    const handleSaveAsset = (data: RegistrationFormData, assetIdToUpdate?: string) => {
        if (assetIdToUpdate) {
            // Update logic
            setAssets(prevAssets => prevAssets.map(asset => {
                if (asset.id === assetIdToUpdate) {
                    return {
                        ...asset,
                        name: data.assetName,
                        category: data.category,
                        type: data.type,
                        brand: data.brand,
                        purchasePrice: data.purchasePrice,
                        vendor: data.vendor,
                        poNumber: data.poNumber,
                        invoiceNumber: data.invoiceNumber,
                        purchaseDate: data.purchaseDate,
                        registrationDate: data.registrationDate,
                        recordedBy: data.recordedBy,
                        warrantyEndDate: data.warrantyEndDate,
                        condition: data.condition,
                        location: data.location,
                        locationDetail: data.locationDetail,
                        currentUser: data.currentUser,
                        notes: data.notes,
                        serialNumber: data.bulkItems[0].serialNumber,
                        macAddress: data.bulkItems[0].macAddress || null,
                        lastModifiedDate: new Date().toISOString(),
                        lastModifiedBy: currentUser.name,
                        activityLog: [
                            ...(asset.activityLog || []),
                            {
                                id: `log-edit-${Date.now()}`,
                                timestamp: new Date().toISOString(),
                                user: currentUser.name,
                                action: 'Data Aset Diperbarui',
                                details: 'Informasi aset telah diubah melalui form edit.',
                            } as ActivityLogEntry
                        ]
                    };
                }
                return asset;
            }));
            addNotification(`Aset ${assetIdToUpdate} berhasil diperbarui.`, 'success');
            handleSetView('list');
        } else {
            // Creation logic
            const baseAssetData = {
                name: data.assetName,
                category: data.category,
                type: data.type,
                brand: data.brand,
                registrationDate: data.registrationDate,
                recordedBy: data.recordedBy,
                purchaseDate: data.purchaseDate,
                purchasePrice: data.purchasePrice,
                vendor: data.vendor,
                poNumber: data.poNumber,
                invoiceNumber: data.invoiceNumber,
                warrantyEndDate: data.warrantyEndDate,
                location: data.location,
                locationDetail: data.locationDetail,
                currentUser: data.currentUser,
                condition: data.condition,
                notes: data.notes,
                attachments: data.attachments,
                woRoIntNumber: data.relatedRequestId || `INT-${Math.floor(Math.random() * 90000) + 10000}`,
                status: data.currentUser ? AssetStatus.IN_USE : AssetStatus.IN_STORAGE,
                lastModifiedDate: null,
                lastModifiedBy: null,
            };

            const newAssets: Asset[] = data.bulkItems.map((item, index) => ({
                ...baseAssetData,
                id: `AST-${String(assets.length + 1 + index).padStart(3, '0')}`,
                serialNumber: item.serialNumber,
                macAddress: item.macAddress || null,
                activityLog: [],
            }));
            
            setAssets(prev => [...newAssets, ...prev]);
            handleSetView('list');
            if (data.relatedRequestId) {
                onRegistrationComplete(data.relatedRequestId);
            }
            addNotification(`${newAssets.length} aset baru berhasil dicatat.`, 'success');
        }
    };
    
    const formatCurrency = (value: number | null) => {
        if (value === null || value === undefined) return '-';
        return `Rp ${value.toLocaleString('id-ID')}`;
    };
    
    const handleCopyToClipboard = (text: string | null, message: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        addNotification(message, 'success');
    };

    const assetHistory = useMemo(() => {
        if (!selectedAsset) return [];
        
        let history: { date: string, type: string, description: React.ReactNode, icon: React.FC<any>, color: string }[] = [];

        // 1. Initial Registration
        history.push({
            date: selectedAsset.registrationDate,
            type: 'Pencatatan Aset',
            description: <>Aset dicatat oleh <ClickableLink onClick={() => onShowPreview({ type: 'user', id: selectedAsset.recordedBy })}>{selectedAsset.recordedBy}</ClickableLink>.</>,
            icon: TagIcon,
            color: 'text-blue-500',
        });
        
        // 2. Related Request (if any)
        const relatedRequest = requests.find(r => selectedAsset.woRoIntNumber === r.id);
        if(relatedRequest) {
             history.push({
                date: relatedRequest.requestDate,
                type: 'Permintaan Awal',
                description: <>Disediakan berdasarkan request <ClickableLink onClick={() => onShowPreview({ type: 'request', id: relatedRequest.id })}>#{relatedRequest.id}</ClickableLink> oleh <ClickableLink onClick={() => onShowPreview({ type: 'user', id: relatedRequest.requester })}>{relatedRequest.requester}</ClickableLink>.</>,
                icon: RequestIcon,
                color: 'text-purple-500',
            });
        }

        // 3. Handovers
        handovers.filter(h => h.items.some(item => item.assetId === selectedAsset.id)).forEach(h => {
            const isInstallation = h.penerima.includes('TMI-');
            const customer = isInstallation ? customers.find(c => h.penerima.includes(c.id)) : null;
            history.push({
                date: h.handoverDate,
                type: isInstallation ? 'Pemasangan di Pelanggan' : 'Serah Terima Internal',
                description: isInstallation 
                    ? <>Dipasang di Pelanggan: <ClickableLink onClick={() => onShowPreview({ type: 'customer', id: customer!.id })}>{customer ? customer.name : h.penerima}</ClickableLink> via form <ClickableLink onClick={() => onShowPreview({ type: 'handover', id: h.id })}>#{h.id}</ClickableLink>.</>
                    : <>Diserahkan dari <ClickableLink onClick={() => onShowPreview({ type: 'user', id: h.menyerahkan })}>{h.menyerahkan}</ClickableLink> kepada <ClickableLink onClick={() => onShowPreview({ type: 'user', id: h.penerima })}>{h.penerima}</ClickableLink> via form <ClickableLink onClick={() => onShowPreview({ type: 'handover', id: h.id })}>#{h.id}</ClickableLink>.</>,
                icon: isInstallation ? CustomerIcon : UsersIcon,
                color: isInstallation ? 'text-green-500' : 'text-cyan-500',
            });
        });
        
        // 4. Dismantles
        dismantles.filter(d => d.assetId === selectedAsset.id).forEach(d => {
            history.push({
                date: d.dismantleDate,
                type: 'Penarikan Aset (Dismantle)',
                description: <>Ditarik dari Pelanggan: <ClickableLink onClick={() => onShowPreview({ type: 'customer', id: d.customerId })}>{d.customerName}</ClickableLink> oleh teknisi <ClickableLink onClick={() => onShowPreview({ type: 'user', id: d.technician })}>{d.technician}</ClickableLink> via form <ClickableLink onClick={() => onShowPreview({ type: 'dismantle', id: d.id })}>#{d.id}</ClickableLink>.</>,
                icon: WrenchIcon,
                color: 'text-red-500',
            });
        });

        // 5. Activity Log (Edits, etc.)
        (selectedAsset.activityLog || []).forEach(log => {
             if (log.action === 'Data Aset Diperbarui') {
                 history.push({
                    date: new Date(log.timestamp).toISOString().split('T')[0],
                    type: 'Data Diperbarui',
                    description: <>Informasi aset diperbarui oleh <ClickableLink onClick={() => onShowPreview({ type: 'user', id: log.user })}>{log.user}</ClickableLink>.</>,
                    icon: PencilIcon,
                    color: 'text-yellow-500',
                });
             }
        });


        return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    }, [selectedAsset, requests, handovers, dismantles, customers, onShowPreview]);

    const renderModalFooter = () => {
        if (!selectedAsset) return null;
        
        const canBeAssigned = selectedAsset.status === AssetStatus.IN_STORAGE;
        const canBeDismantled = selectedAsset.status === AssetStatus.IN_USE;
        const isCpeDevice = selectedAsset.category === 'Perangkat Pelanggan (CPE)';

        return (
            <div className="flex items-center justify-end flex-1 space-x-3 no-print">
                {canBeAssigned && (
                    <>
                        <Tooltip text={isCpeDevice ? "Buat form serah terima untuk pemasangan aset ke pelanggan." : "Hanya aset kategori 'Perangkat Pelanggan (CPE)' yang dapat dipasang."}>
                            {/* Wrapping with a span ensures the tooltip works even when the button is disabled */}
                            <span className={!isCpeDevice ? 'cursor-not-allowed' : ''}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (isCpeDevice) {
                                            onInitiateInstallation(selectedAsset);
                                        }
                                    }}
                                    disabled={!isCpeDevice}
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 bg-tm-primary rounded-lg shadow-sm hover:bg-tm-primary-hover disabled:bg-tm-primary/50 disabled:cursor-not-allowed"
                                >
                                    <CustomerIcon className="w-4 h-4" />
                                    Pasang ke Pelanggan
                                </button>
                            </span>
                        </Tooltip>
                        <Tooltip text="Buat form serah terima untuk pemindahan aset antar staf/divisi.">
                            <button
                                type="button"
                                onClick={() => {
                                    onInitiateHandover(selectedAsset);
                                    handleCloseModal();
                                }}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 transition-all duration-200 bg-white border rounded-lg shadow-sm hover:bg-gray-100"
                            >
                                <HandoverIcon className="w-4 h-4" />
                                Serah Terima Internal
                            </button>
                        </Tooltip>
                    </>
                )}
                 {canBeDismantled && (
                    <Tooltip text="Buat form penarikan aset dari pelanggan (dismantle).">
                        <button
                            type="button"
                            onClick={() => {
                                onInitiateDismantle(selectedAsset);
                                handleCloseModal();
                            }}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 rounded-lg shadow-sm bg-danger hover:bg-red-700"
                        >
                            <DismantleIcon className="w-4 h-4" />
                            Tarik / Dismantle Aset
                        </button>
                    </Tooltip>
                )}
            </div>
        )
    };
    
    useEffect(() => {
        if (activeTab === 'qr-code' && selectedAsset && qrCanvasRef.current) {
            if (typeof QRCode !== 'undefined') {
                QRCode.toCanvas(qrCanvasRef.current, selectedAsset.id, { width: 256, margin: 2 }, function (error: any) {
                    if (error) {
                        console.error("QR Code generation error:", error);
                        addNotification('Gagal membuat Kode QR.', 'error');
                    }
                });
            } else {
                console.error("QRCode library is not loaded.");
                addNotification('Pustaka Kode QR tidak dapat dimuat. Coba muat ulang halaman.', 'error');
            }
        }
    }, [activeTab, selectedAsset, addNotification]);
    
    const handlePrintQr = () => {
        if (!qrCanvasRef.current || !selectedAsset) {
            addNotification('Konten QR tidak dapat dimuat untuk dicetak.', 'error');
            return;
        }

        const qrImageURL = qrCanvasRef.current.toDataURL('image/png');

        const printWindow = window.open('', '_blank', 'height=500,width=500');
        if (!printWindow) {
            addNotification('Gagal membuka jendela cetak. Mohon izinkan pop-up untuk situs ini.', 'error');
            return;
        }

        printWindow.document.write(`
            <html>
                <head>
                    <title>Cetak QR - ${selectedAsset.id}</title>
                    <style>
                        @media print {
                            @page { size: 10cm 10cm; margin: 0; }
                            body { margin: 0; }
                        }
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                            text-align: center;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            height: 100%;
                            margin: 0;
                        }
                        .container {
                            padding: 20px;
                        }
                        h3 {
                            margin: 0 0 5px 0;
                            font-size: 16px;
                        }
                        p {
                            margin: 0 0 10px 0;
                            font-family: monospace;
                            font-size: 14px;
                        }
                        img {
                            max-width: 80%;
                            height: auto;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h3>${selectedAsset.name}</h3>
                        <p>${selectedAsset.id}</p>
                        <img src="${qrImageURL}" alt="QR Code for ${selectedAsset.id}" />
                    </div>
                </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.focus();
        
        printWindow.onload = function() {
            printWindow.print();
            printWindow.close();
        };
    };

    const handleBulkPrintQr = async () => {
        if (selectedAssetIds.length === 0) {
            addNotification('Pilih setidaknya satu aset untuk mencetak QR.', 'error');
            return;
        }
        
        setIsPrinting(true);
        const selectedAssetsToPrint = assets.filter(a => selectedAssetIds.includes(a.id));

        // Allow UI to update with loading state
        await new Promise(resolve => setTimeout(resolve, 50));

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            addNotification('Gagal membuka jendela cetak. Mohon izinkan pop-up untuk situs ini.', 'error');
            setIsPrinting(false);
            return;
        }

        printWindow.document.write(`
            <html>
                <head>
                    <title>Cetak QR Aset (${selectedAssetsToPrint.length} item)</title>
                    <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
                        .qr-item {
                            width: 100%;
                            height: 100%;
                            display: flex;
                            flex-direction: column;
                            justify-content: center;
                            align-items: center;
                            text-align: center;
                            page-break-after: always;
                            box-sizing: border-box;
                        }
                        .qr-item:last-child { page-break-after: auto; }
                        h3 { margin: 0 0 5px 0; font-size: 16px; word-break: break-word; }
                        p { margin: 0 0 10px 0; font-family: monospace; font-size: 14px; }
                        canvas { max-width: 80%; height: auto; }
                        @media print {
                            @page { size: 10cm 10cm; margin: 0; }
                            body { margin: 0; }
                        }
                    </style>
                </head>
                <body><div id="print-container"></div></body>
            </html>
        `);
        printWindow.document.close();

        try {
            const container = printWindow.document.getElementById('print-container');
            if (!container) throw new Error("Print container not found");
            
            for (const asset of selectedAssetsToPrint) {
                const itemDiv = printWindow.document.createElement('div');
                itemDiv.className = 'qr-item';
                
                const nameEl = printWindow.document.createElement('h3');
                nameEl.textContent = asset.name;
                itemDiv.appendChild(nameEl);
                
                const idEl = printWindow.document.createElement('p');
                idEl.textContent = asset.id;
                itemDiv.appendChild(idEl);

                const canvasEl = printWindow.document.createElement('canvas');
                itemDiv.appendChild(canvasEl);

                container.appendChild(itemDiv);

                await new Promise<void>((resolve, reject) => {
                    QRCode.toCanvas(canvasEl, asset.id, { width: 256, margin: 2 }, (error: any) => {
                        if (error) reject(error);
                        else resolve();
                    });
                });
            }

            printWindow.focus();
            printWindow.print();
        } catch (error) {
            console.error("Failed to generate QR codes for printing:", error);
            addNotification('Gagal membuat satu atau lebih Kode QR.', 'error');
        } finally {
            printWindow.close();
            setIsPrinting(false);
        }
    };


    const handleDownloadQr = () => {
        if (qrCanvasRef.current && selectedAsset) {
            const link = document.createElement('a');
            link.download = `qrcode-aset-${selectedAsset.id}.png`;
            link.href = qrCanvasRef.current.toDataURL('image/png');
            link.click();
        }
    };
    
    const handleStartScan = (itemId: number, field: 'serialNumber' | 'macAddress') => {
        setScanningTarget({ itemId, field });
        setIsScannerOpen(true);
    };

    const onScanSuccess = (decodedText: string) => {
        if (!scanningTarget) return;

        const parsed = parseScannedData(decodedText);
        
        setBulkItems(prevItems => prevItems.map(item => {
            if (item.id === scanningTarget.itemId) {
                const newItem = { ...item };
                // Smart fill: if data contains both SN and MAC, fill both
                if (parsed.serialNumber && parsed.macAddress) {
                    newItem.serialNumber = parsed.serialNumber;
                    newItem.macAddress = parsed.macAddress;
                    addNotification('Nomor Seri dan MAC Address terisi.', 'success');
                } else if (parsed.serialNumber) {
                    newItem.serialNumber = parsed.serialNumber;
                    addNotification('Nomor Seri terisi.', 'success');
                } else if (parsed.macAddress) {
                    newItem.macAddress = parsed.macAddress;
                    addNotification('MAC Address terisi.', 'success');
                } else {
                    // Fallback: fill the targeted field with raw data
                    newItem[scanningTarget.field] = parsed.raw;
                    addNotification(`${scanningTarget.field === 'serialNumber' ? 'Nomor Seri' : 'MAC Address'} terisi.`, 'success');
                }
                return newItem;
            }
            return item;
        }));

        setIsScannerOpen(false);
        setScanningTarget(null);
    };

    const ScannerModal = () => {
        const scannerRef = useRef<any>(null);

        useEffect(() => {
            if (isScannerOpen) {
                const html5QrCode = new Html5Qrcode("qr-reader");
                scannerRef.current = html5QrCode;
                
                const successCallback = (decodedText: string, decodedResult: any) => {
                    if (scannerRef.current?.isScanning) {
                        scannerRef.current.stop();
                    }
                    onScanSuccess(decodedText);
                };

                html5QrCode.start(
                    { facingMode: "environment" },
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    successCallback,
                    (errorMessage: string) => {} // error callback
                ).catch(err => {
                    addNotification('Gagal memulai kamera. Pastikan izin telah diberikan.', 'error');
                    console.error("Unable to start scanning.", err);
                    setIsScannerOpen(false);
                });
            }

            return () => {
                if (scannerRef.current && scannerRef.current.isScanning) {
                    scannerRef.current.stop().catch((err: any) => console.error("Error stopping scanner:", err));
                }
            };
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [isScannerOpen]);

        return (
            <Modal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} title="Pindai Kode Aset" size="md">
                <div id="qr-reader" style={{ width: '100%' }}></div>
            </Modal>
        );
    };

    
    const renderContent = () => {
        if (view === 'form') {
             return (
                 <div className="p-4 sm:p-6">
                    <div className="flex flex-col items-start justify-between gap-4 mb-6 sm:flex-row sm:items-center">
                        <h1 className="text-2xl sm:text-3xl font-bold text-tm-dark">{assetToEdit ? 'Edit Data Aset' : 'Catat Aset Baru'}</h1>
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
                        />
                    </div>
                </div>
            )
        }
        
        return (
             <div className="p-4 md:p-8">
                <div className="flex flex-col items-start justify-between gap-4 mb-6 md:flex-row md:items-center">
                    <h1 className="text-3xl font-bold text-tm-dark">Daftar Aset Tercatat</h1>
                     <div className="flex items-center space-x-2">
                        <button
                            onClick={handleExport}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 transition-all duration-200 bg-white border rounded-lg shadow-sm hover:bg-gray-50"
                        >
                            <ExportIcon className="w-4 h-4"/>
                            Export CSV
                        </button>
                        <button
                            onClick={() => setIsScannerOpen(true)}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 transition-all duration-200 bg-white border rounded-lg shadow-sm hover:bg-gray-50"
                        >
                            <QrCodeIcon className="w-4 h-4"/>
                            Pindai QR
                        </button>
                        <button
                            onClick={() => handleSetView('form')}
                            className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 rounded-lg shadow-sm bg-tm-primary hover:bg-tm-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tm-accent"
                        >
                            Catat Aset Baru
                        </button>
                    </div>
                </div>
                {/* Toolbar */}
                 <div className="p-4 mb-4 bg-white border border-gray-200/80 rounded-xl shadow-md">
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                        {/* Search Bar */}
                        <div className="relative lg:col-span-12">
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
                        
                        {/* Filters */}
                        <select onChange={e => handleFilterChange('status', e.target.value)} value={filters.status} className="w-full h-10 px-3 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-300 rounded-lg lg:col-span-3 focus:ring-tm-accent focus:border-tm-accent">
                            <option value="">Semua Status</option>
                            {filterOptions.statuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <select onChange={e => handleFilterChange('category', e.target.value)} value={filters.category} className="w-full h-10 px-3 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-300 rounded-lg lg:col-span-3 focus:ring-tm-accent focus:border-tm-accent">
                            <option value="">Semua Kategori</option>
                            {assetCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                        <select onChange={e => handleFilterChange('dismantled', e.target.value)} value={filters.dismantled} className="w-full h-10 px-3 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-300 rounded-lg lg:col-span-2 focus:ring-tm-accent focus:border-tm-accent">
                            <option value="">Semua Asal Aset</option>
                            <option value="yes">Hasil Dismantle</option>
                            <option value="no">Bukan Dismantle</option>
                        </select>
                         <select onChange={e => handleFilterChange('warranty', e.target.value)} value={filters.warranty} className="w-full h-10 px-3 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-300 rounded-lg lg:col-span-2 focus:ring-tm-accent focus:border-tm-accent">
                            <option value="">Semua Garansi</option>
                            <option value="expiring">Habis Bulan Ini</option>
                            <option value="expired">Sudah Habis</option>
                        </select>
                        
                        {isFiltering && (
                            <div className="flex justify-start lg:col-span-2 lg:justify-end">
                                <button
                                    type="button"
                                    onClick={handleResetFilters}
                                    className="inline-flex items-center justify-center w-full h-10 px-4 text-sm font-semibold text-gray-700 transition-all duration-200 bg-white border border-gray-300 rounded-lg shadow-sm md:w-auto hover:bg-red-50 hover:border-red-500 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-400"
                                >
                                    Reset
                                </button>
                            </div>
                        )}
                    </div>

                     {isFiltering && (
                         <div className="pt-4 mt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-600">
                                Menampilkan <span className="font-semibold text-tm-dark">{sortedAssets.length}</span> dari <span className="font-semibold text-tm-dark">{assets.length}</span> total aset yang cocok.
                            </p>
                         </div>
                     )}

                     {isBulkSelectMode && (
                         <div className="pt-4 mt-4 border-t border-gray-200">
                            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                                {selectedAssetIds.length > 0 ? (
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="text-sm font-medium text-tm-primary">{selectedAssetIds.length} item terpilih</span>
                                        <div className="hidden h-5 border-l border-gray-300 sm:block"></div>
                                        <button
                                            onClick={() => setIsChangeStatusModalOpen(true)}
                                            className="px-3 py-1.5 text-sm font-semibold text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200"
                                        >
                                            Ubah Status
                                        </button>
                                        <button
                                            onClick={handleBulkPrintQr}
                                            disabled={isPrinting || isLoading}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-green-600 bg-green-100 rounded-md hover:bg-green-200 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                                        >
                                            {isPrinting ? <SpinnerIcon className="w-4 h-4" /> : <QrCodeIcon className="w-4 h-4" />}
                                            Cetak QR
                                        </button>
                                        <button
                                            onClick={() => setBulkDeleteConfirmation(true)}
                                            className="px-3 py-1.5 text-sm font-semibold text-red-600 bg-red-100 rounded-md hover:bg-red-200"
                                        >
                                            Hapus Terpilih
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
                 </div>

                <div className="bg-white border border-gray-200/80 rounded-xl shadow-md">
                    <div className="overflow-x-auto custom-scrollbar">
                       <RegistrationTable 
                            assets={paginatedAssets} 
                            customers={customers}
                            onDetailClick={handleShowDetails} 
                            onDeleteClick={setAssetToDeleteId}
                            sortConfig={sortConfig}
                            requestSort={requestSort}
                            selectedAssetIds={selectedAssetIds}
                            onSelectOne={handleSelectOne}
                            onSelectAll={handleSelectAll}
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
        )
    }

    const getTimelineIconBgClass = (textColor: string): string => {
        const colorMap: { [key: string]: string } = {
            'text-blue-500': 'bg-blue-100',
            'text-purple-500': 'bg-purple-100',
            'text-green-500': 'bg-green-100',
            'text-cyan-500': 'bg-cyan-100',
            'text-red-500': 'bg-red-100',
            'text-yellow-500': 'bg-yellow-100',
        };
        return colorMap[textColor as keyof typeof colorMap] || 'bg-gray-100';
    };

    const renderModalContent = () => {
        if (!selectedAsset) return null;

        const customer = selectedAsset.currentUser?.startsWith('TMI-') 
            ? customers.find(c => c.id === selectedAsset.currentUser) 
            : null;
        
        const getWarrantyStatus = () => {
            if (!selectedAsset.warrantyEndDate) return null;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const warrantyEnd = new Date(selectedAsset.warrantyEndDate);
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(today.getDate() + 30);

            if (warrantyEnd < today) {
                return { text: "Garansi telah berakhir", color: "text-danger-text" };
            }
            if (warrantyEnd <= thirtyDaysFromNow) {
                return { text: "Garansi akan segera berakhir", color: "text-warning-text" };
            }
            return null;
        };
        const warrantyStatus = getWarrantyStatus();

        const renderStatusHeader = () => {
            let statusText = selectedAsset.status.toUpperCase();
            let locationText: React.ReactNode = '';

            switch(selectedAsset.status) {
                case AssetStatus.IN_USE:
                    statusText = 'DIGUNAKAN';
                    if (customer) {
                        locationText = <>Terpasang di Pelanggan: <ClickableLink title={`Lihat Pratinjau ${customer.name}`} onClick={() => onShowPreview({type: 'customer', id: customer.id})}>{customer.name}</ClickableLink></>;
                    } else {
                        locationText = <>Dipegang oleh: <ClickableLink onClick={() => onShowPreview({type: 'user', id: selectedAsset.currentUser!})}>{selectedAsset.currentUser}</ClickableLink></>;
                    }
                    break;
                case AssetStatus.IN_STORAGE:
                    statusText = 'TERSEDIA';
                    locationText = `Disimpan di: ${selectedAsset.location} ${selectedAsset.locationDetail ? `(${selectedAsset.locationDetail})` : ''}`;
                    break;
                case AssetStatus.DAMAGED:
                    statusText = 'RUSAK';
                    locationText = `Lokasi: ${selectedAsset.location}`;
                    break;
                case AssetStatus.DECOMMISSIONED:
                    statusText = 'DIBERHENTIKAN';
                    locationText = 'Aset sudah tidak digunakan lagi.';
                    break;
            }

            return (
                <div className={`p-4 rounded-lg mb-6 ${
                    selectedAsset.status === AssetStatus.IN_USE ? 'bg-info-light' : 
                    selectedAsset.status === AssetStatus.IN_STORAGE ? 'bg-gray-100' :
                    selectedAsset.status === AssetStatus.DAMAGED ? 'bg-warning-light' : 'bg-danger-light'
                }`}>
                    <p className={`text-sm font-bold tracking-wider ${
                         selectedAsset.status === AssetStatus.IN_USE ? 'text-info-text' : 
                         selectedAsset.status === AssetStatus.IN_STORAGE ? 'text-gray-800' :
                         selectedAsset.status === AssetStatus.DAMAGED ? 'text-warning-text' : 'text-danger-text'
                    }`}>{statusText}</p>
                    <p className="text-sm text-gray-700">{locationText}</p>
                </div>
            );
        };

        return (
             <>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 -mt-1">{selectedAsset.name}</h2>
                        <p className="text-sm text-gray-500 font-mono">{selectedAsset.id}</p>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                        <button onClick={() => setIsChangeStatusModalOpen(true)} disabled={selectedAsset.status === AssetStatus.DECOMMISSIONED} className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" title="Ubah Status Aset">
                            <WrenchIcon className="w-4 h-4" />
                            <span className="hidden sm:inline">Ubah Status</span>
                        </button>
                        <button onClick={() => setActiveTab('qr-code')} className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50" title="Lihat & Cetak Kode QR">
                            <QrCodeIcon className="w-4 h-4" />
                            <span className="hidden sm:inline">Cetak Label</span>
                        </button>
                         <button onClick={() => handleStartEdit(selectedAsset)} className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50" >
                            <PencilIcon className="w-4 h-4" />
                            <span className="hidden sm:inline">Edit</span>
                        </button>
                    </div>
                </div>

                <div className="border-b border-gray-200 no-print">
                    <nav className="flex -mb-px space-x-6" aria-label="Tabs">
                        <button onClick={() => setActiveTab('details')} className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'details' ? 'border-tm-primary text-tm-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Detail Utama</button>
                        <button onClick={() => setActiveTab('history')} className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'history' ? 'border-tm-primary text-tm-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Riwayat & Aktivitas</button>
                        <button onClick={() => setActiveTab('attachments')} className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'attachments' ? 'border-tm-primary text-tm-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Lampiran</button>
                        <button onClick={() => setActiveTab('qr-code')} className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'qr-code' ? 'border-tm-primary text-tm-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Kode QR</button>
                    </nav>
                </div>
                
                <div className="pt-6">
                    {activeTab === 'details' && (
                         <div className="space-y-6">
                            {renderStatusHeader()}

                            <DetailCard title="Spesifikasi Aset">
                                <DetailItem label="Kategori" value={selectedAsset.category} />
                                <DetailItem label="Tipe Aset" value={selectedAsset.type} />
                                <DetailItem label="Brand / Merek" value={selectedAsset.brand} />
                                <DetailItem label="Kondisi" value={selectedAsset.condition} />
                                <DetailItem label="Nomor Seri">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="font-mono">{selectedAsset.serialNumber}</span>
                                        <button onClick={() => handleCopyToClipboard(selectedAsset.serialNumber, `Nomor Seri disalin.`)} className="text-gray-400 hover:text-tm-primary"><CopyIcon className="w-4 h-4" /></button>
                                    </div>
                                </DetailItem>
                                <DetailItem label="MAC Address">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="font-mono">{selectedAsset.macAddress}</span>
                                        <button onClick={() => handleCopyToClipboard(selectedAsset.macAddress, `MAC Address disalin.`)} className="text-gray-400 hover:text-tm-primary"><CopyIcon className="w-4 h-4" /></button>
                                    </div>
                                </DetailItem>
                                <DetailItem label="Asal Aset" value={selectedAsset.isDismantled ? <span className="font-semibold text-amber-700">Hasil Dismantle</span> : "Pembelian Baru / Stok Lama"} fullWidth />
                            </DetailCard>

                            <DetailCard title="Informasi Pembelian & Garansi">
                                <DetailItem label="Tanggal Pembelian" value={selectedAsset.purchaseDate} />
                                <DetailItem label="Harga Beli" value={<span className="font-semibold">{formatCurrency(selectedAsset.purchasePrice)}</span>} />
                                <DetailItem label="Vendor / Toko" value={selectedAsset.vendor} />
                                <DetailItem label="Nomor PO">
                                    <div className="flex items-center justify-between gap-2">
                                        <span>{selectedAsset.poNumber}</span>
                                        <button onClick={() => handleCopyToClipboard(selectedAsset.poNumber, `Nomor PO disalin.`)} className="text-gray-400 hover:text-tm-primary"><CopyIcon className="w-4 h-4" /></button>
                                    </div>
                                </DetailItem>
                                <DetailItem label="Nomor Faktur">
                                     <div className="flex items-center justify-between gap-2">
                                        <span>{selectedAsset.invoiceNumber}</span>
                                        <button onClick={() => handleCopyToClipboard(selectedAsset.invoiceNumber, `Nomor Faktur disalin.`)} className="text-gray-400 hover:text-tm-primary"><CopyIcon className="w-4 h-4" /></button>
                                    </div>
                                </DetailItem>
                                <DetailItem label="Tanggal Pencatatan" value={selectedAsset.registrationDate} />
                                <DetailItem label="Dicatat oleh" value={<ClickableLink onClick={() => onShowPreview({type: 'user', id: selectedAsset.recordedBy})}>{selectedAsset.recordedBy}</ClickableLink>} />
                                <DetailItem label="Akhir Garansi">
                                    <div className="flex items-center gap-2">
                                        <span>{selectedAsset.warrantyEndDate || '-'}</span>
                                        {warrantyStatus && (
                                            <span className={`flex items-center text-xs gap-1 ${warrantyStatus.color}`} title={warrantyStatus.text}>
                                                <ExclamationTriangleIcon className="w-4 h-4" />
                                                {warrantyStatus.text}
                                            </span>
                                        )}
                                    </div>
                                </DetailItem>
                                 {selectedAsset.lastModifiedDate && (
                                    <DetailItem label="Terakhir Diubah" fullWidth>
                                        {new Date(selectedAsset.lastModifiedDate).toLocaleString('id-ID')} oleh <strong>{selectedAsset.lastModifiedBy}</strong>
                                    </DetailItem>
                                )}
                            </DetailCard>

                            {selectedAsset.isDismantled && selectedAsset.dismantleInfo && (
                                <DetailCard title="Informasi Penarikan Aset">
                                    <DetailItem label="Pelanggan Asal" value={<><ClickableLink onClick={() => onShowPreview({ type: 'customer', id: selectedAsset.dismantleInfo!.customerId})}>{selectedAsset.dismantleInfo.customerName}</ClickableLink> ({selectedAsset.dismantleInfo.customerId})</>} />
                                    <DetailItem label="Tanggal Ditarik" value={selectedAsset.dismantleInfo.dismantleDate} />
                                    <DetailItem label="Form Dismantle" value={<ClickableLink onClick={() => onShowPreview({ type: 'dismantle', id: selectedAsset.dismantleInfo!.dismantleId})}>#{selectedAsset.dismantleInfo.dismantleId}</ClickableLink>} fullWidth />
                                </DetailCard>
                            )}
                             <DetailCard title="Catatan">
{/* FIX: Added the required 'label' prop to the DetailItem component. */}
                                 <DetailItem label="Catatan" value={selectedAsset.notes || 'Tidak ada catatan.'} fullWidth />
                             </DetailCard>
                        </div>
                    )}
                    {activeTab === 'history' && (
                       <div>
                            {assetHistory.length > 0 ? (
                                <ol className="relative border-l border-gray-200 ml-2">                  
                                    {assetHistory.map((item, index) => (
                                        <li key={index} className="mb-6 ml-6">
                                            <span title={item.type} className={`absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 ring-4 ring-white ${getTimelineIconBgClass(item.color)}`}>
                                                <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                                            </span>
                                            <time className="block mb-1 text-xs font-normal leading-none text-gray-400">{item.date}</time>
                                            <h3 className="text-sm font-semibold text-gray-900">{item.type}</h3>
                                            <p className="text-sm font-normal text-gray-500">{item.description}</p>
                                        </li>
                                    ))}
                                </ol>
                            ) : (
                                <p className="text-sm text-center text-gray-500">Tidak ada riwayat aktivitas untuk aset ini.</p>
                            )}
                        </div>
                    )}
                    {activeTab === 'attachments' && (
                         <div>
                            {selectedAsset.attachments.length > 0 ? (
                                <ul className="space-y-2">
                                    {selectedAsset.attachments.map(file => (
                                        <li key={file.id} className="flex items-center p-2 text-sm bg-gray-50 rounded-md border">
                                            <PaperclipIcon className="w-4 h-4 mr-2 text-gray-500"/>
                                            <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-tm-primary hover:underline">{file.name}</a>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-center text-gray-500">Tidak ada lampiran untuk aset ini.</p>
                            )}
                        </div>
                    )}
                     {activeTab === 'qr-code' && (
                         <div className="printable-area flex flex-col items-center justify-center text-center">
                            <h3 className="text-lg font-semibold text-gray-800">{selectedAsset.name}</h3>
                            <p className="text-sm text-gray-500 font-mono mb-4">{selectedAsset.id}</p>
                            <canvas ref={qrCanvasRef}></canvas>
                            <div className="flex items-center mt-6 space-x-3 no-print">
                                <button onClick={handlePrintQr} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200">
                                    Cetak
                                </button>
                                <button onClick={handleDownloadQr} className="px-4 py-2 text-sm font-semibold text-white rounded-lg bg-tm-primary hover:bg-tm-primary-hover">
                                    Unduh
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </>
        )
    };
    
    return (
        <>
            {renderContent()}

            <ScannerModal />
            
            {selectedAsset && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    title=""
                    size="3xl"
                    footerContent={renderModalFooter()}
                >
                    {renderModalContent()}
                </Modal>
            )}

            {isChangeStatusModalOpen && selectedAsset && (
                <Modal
                    isOpen={isChangeStatusModalOpen}
                    onClose={() => setIsChangeStatusModalOpen(false)}
                    title={`Ubah Status Aset: ${selectedAsset.id}`}
                    size="md"
                    footerContent={
                        <>
                            <button onClick={() => setIsChangeStatusModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Batal</button>
                            <button
                                type="button"
                                onClick={handleChangeStatus}
                                disabled={isLoading}
                                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-tm-primary rounded-lg shadow-sm hover:bg-tm-primary-hover disabled:bg-tm-primary/70"
                            >
                                {isLoading && <SpinnerIcon className="w-5 h-5 mr-2" />}
                                Simpan Perubahan
                            </button>
                        </>
                    }
                >
                    <p className="mb-4 text-sm text-gray-600">Pilih status baru untuk aset ini.</p>
                    <div>
                        <label htmlFor="targetStatus" className="block text-sm font-medium text-gray-700">Status Baru</label>
                        <select 
                            id="targetStatus" 
                            value={targetStatus}
                            onChange={e => setTargetStatus(e.target.value as AssetStatus)}
                            className="block w-full px-3 py-2 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-tm-accent focus:border-tm-accent sm:text-sm"
                        >
                            {Object.values(AssetStatus).filter(s => s !== AssetStatus.DECOMMISSIONED).map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                </Modal>
            )}

            {assetToDeleteId && (
                <Modal
                    isOpen={!!assetToDeleteId}
                    onClose={() => setAssetToDeleteId(null)}
                    title="Konfirmasi Hapus Aset"
                    size="md"
                    hideDefaultCloseButton={true}
                    footerContent={
                        <>
                            <button onClick={() => setAssetToDeleteId(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Batal</button>
                            <button
                                type="button"
                                onClick={handleConfirmDelete}
                                disabled={isLoading}
                                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-danger rounded-lg shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-400"
                            >
                                {isLoading && <SpinnerIcon className="w-5 h-5 mr-2" />}
                                Konfirmasi Hapus
                            </button>
                        </>
                    }
                >
                    <p className="text-sm text-gray-600">
                        Apakah Anda yakin ingin menghapus aset dengan ID <span className="font-bold text-tm-dark">{assetToDeleteId}</span>? Tindakan ini tidak dapat diurungkan.
                    </p>
                </Modal>
            )}
            {bulkDeleteConfirmation && (
                <Modal
                    isOpen={bulkDeleteConfirmation}
                    onClose={() => setBulkDeleteConfirmation(false)}
                    title="Konfirmasi Hapus Aset Massal"
                    size="md"
                    hideDefaultCloseButton
                >
                    <div className="flex flex-col items-center text-center">
                        <div className="flex items-center justify-center w-12 h-12 mb-4 text-red-600 bg-red-100 rounded-full">
                            <ExclamationTriangleIcon className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">
                            Hapus {deletableAssetsCount} Aset?
                        </h3>
                        <p className="mt-2 text-sm text-gray-600">
                            Anda akan menghapus aset yang dipilih secara permanen. Aset yang sedang digunakan tidak akan dihapus.
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
                                <span className="font-medium">Dilewati (sedang digunakan):</span>
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
            )}
            {isChangeStatusModalOpen && isBulkSelectMode && (
                 <Modal
                    isOpen={isChangeStatusModalOpen}
                    onClose={() => setIsChangeStatusModalOpen(false)}
                    title="Ubah Status Aset Massal"
                    size="md"
                    hideDefaultCloseButton={true}
                    footerContent={
                        <>
                             <button onClick={() => setIsChangeStatusModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Batal</button>
                            <button
                                type="button"
                                onClick={handleBulkStatusChange}
                                disabled={isLoading}
                                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-tm-primary rounded-lg shadow-sm hover:bg-tm-primary-hover disabled:bg-tm-primary/70"
                            >
                                {isLoading && <SpinnerIcon className="w-5 h-5 mr-2" />}
                                Simpan Perubahan
                            </button>
                        </>
                    }
                >
                    <p className="mb-4 text-sm text-gray-600">
                        Pilih status baru yang akan diterapkan pada <span className="font-bold text-tm-dark">{selectedAssetIds.length}</span> aset yang dipilih.
                    </p>
                    <div>
                        <label htmlFor="targetStatus" className="block text-sm font-medium text-gray-700">Status Baru</label>
                        <select 
                            id="targetStatus" 
                            value={targetStatus}
                            onChange={e => setTargetStatus(e.target.value as AssetStatus)}
                            className="block w-full px-3 py-2 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-tm-accent focus:border-tm-accent sm:text-sm"
                        >
                            {Object.values(AssetStatus).map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                </Modal>
            )}
        </>
    );
};