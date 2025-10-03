import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Asset, AssetStatus, AssetCondition, Attachment, Request } from '../types';
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
// FIX: Import DismantleIcon to be used in the asset detail modal.
import { DismantleIcon } from './icons/DismantleIcon';


interface ItemRegistrationProps {
    assets: Asset[];
    setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
    prefillData?: Request | null;
    onClearPrefill: () => void;
    onRegistrationComplete: (requestId: string) => void;
    onInitiateHandover: (asset: Asset) => void;
    // FIX: Add missing onInitiateDismantle prop to fix type error.
    onInitiateDismantle: (asset: Asset) => void;
    onInitiateInstallation: (asset: Asset) => void;
}

const ispAssetCategories: Record<string, string[]> = {
    'Perangkat Jaringan': ['Router', 'Switch', 'Access Point', 'Firewall', 'OLT'],
    'Perangkat Pelanggan (CPE)': ['Modem', 'Router WiFi', 'ONT/ONU', 'Set-Top Box'],
    'Infrastruktur Fiber Optik': ['Kabel Fiber Optik', 'Splicer', 'OTDR', 'Patch Panel'],
    'Server & Penyimpanan': ['Server Rack', 'Storage (NAS/SAN)', 'UPS'],
    'Alat Ukur & Perkakas': ['Power Meter', 'Crimping Tools', 'LAN Tester'],
    'Perangkat Pendukung': ['Tiang/Pole', 'Kabel UTP', 'Konektor'],
    'Komputer': ['Laptop', 'PC Desktop'],
    'Peripheral': ['Monitor', 'Printer', 'Scanner'],
};

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

    for (let i = 1; i <= 150; i++) {
        const template = assetPool[i % assetPool.length];
        const purchaseDate = new Date(2024 - Math.floor(i / 30), (12 - i) % 12, 28 - (i % 28));
        
        let status = statuses[i % statuses.length];
        let condition = conditions[i % conditions.length];
        let isDismantled = false;
        
        // Explicitly create a block of dismantled assets for demo purposes
        if (i > 5 && i <= 15) {
            status = AssetStatus.IN_STORAGE;
            condition = AssetCondition.USED_OKAY;
            isDismantled = true;
        } else {
            isDismantled = status === AssetStatus.IN_STORAGE && i > 100 && i % 5 === 0; // Keep some randomness for others
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
            purchaseDate: purchaseDate.toISOString().split('T')[0],
            purchasePrice: Math.floor(Math.random() * (5000000 - 500000 + 1) + 500000),
            vendor: `Distributor ${String.fromCharCode(65 + (i%5))}`,
            warrantyEndDate: new Date(new Date(purchaseDate).setFullYear(purchaseDate.getFullYear() + 1)).toISOString().split('T')[0],
            location,
            currentUser,
            woRoIntNumber: `WO-${String(12345 + i)}`,
            status,
            condition,
            notes: status === AssetStatus.DAMAGED ? 'Memerlukan perbaikan minor.' : (isDismantled ? 'Aset hasil tarikan dari pelanggan.' : null),
            attachments: [],
            isDismantled,
        });
    }
    return assets;
};

export const mockAssets: Asset[] = generateMockAssets();

const getStatusClass = (status: AssetStatus) => {
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
    onDetailClick: (asset: Asset) => void;
    onDeleteClick: (id: string) => void;
    sortConfig: SortConfig<Asset> | null;
    requestSort: (key: keyof Asset) => void;
    selectedAssetIds: string[];
    onSelectOne: (id: string) => void;
    onSelectAll: (event: React.ChangeEvent<HTMLInputElement>) => void;
    isBulkSelectMode: boolean;
    onEnterBulkMode: () => void;
}

const RegistrationTable: React.FC<RegistrationTableProps> = ({ assets, onDetailClick, onDeleteClick, sortConfig, requestSort, selectedAssetIds, onSelectOne, onSelectAll, isBulkSelectMode, onEnterBulkMode }) => {
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
                                    {asset.isDismantled && (
                                        <span className="px-2 py-0.5 text-xs font-semibold text-amber-800 bg-amber-100 rounded-full">
                                            Dismantled
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs text-gray-500">{asset.id} &bull; {asset.category}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                 <div className="text-sm font-medium text-gray-800">{asset.location || '-'}</div>
                                 <div className="text-xs text-gray-500">{asset.currentUser && asset.currentUser.startsWith('TMI-') ? `ID Pelanggan: ${asset.currentUser}` : asset.currentUser || 'Tidak ada pengguna'}</div>
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
    purchaseDate: string;
    warrantyEndDate: string | null;
    condition: AssetCondition;
    location: string | null;
    currentUser: string | null;
    notes: string | null;
    attachments: Attachment[];
    bulkItems: { id: number, serialNumber: string, macAddress: string }[];
    relatedRequestId: string | null;
}

const RegistrationForm: React.FC<{ onBack: () => void; onSave: (data: RegistrationFormData) => void; prefillData?: Request | null }> = ({ onBack, onSave, prefillData }) => {
    const [assetName, setAssetName] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [assetType, setAssetType] = useState('');
    const [brand, setBrand] = useState('');
    const [purchasePrice, setPurchasePrice] = useState<number | ''>('');
    const [vendor, setVendor] = useState('');
    const [purchaseDate, setPurchaseDate] = useState<Date | null>(new Date());
    const [warrantyDate, setWarrantyDate] = useState<Date | null>(null);
    const [warrantyPeriod, setWarrantyPeriod] = useState<number | ''>('');
    const [condition, setCondition] = useState<AssetCondition>(AssetCondition.BRAND_NEW);
    const [location, setLocation] = useState('Gudang Inventori');
    const [initialUser, setInitialUser] = useState('');
    const [notes, setNotes] = useState('');
    const [attachments, setAttachments] = useState<File[]>([]);
    
    const [deviceTypes, setDeviceTypes] = useState<string[]>([]);
    const [isFooterVisible, setIsFooterVisible] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const footerRef = useRef<HTMLDivElement>(null);
    const formId = "asset-registration-form";
    const [bulkItems, setBulkItems] = useState<{ id: number, serialNumber: string, macAddress: string }[]>([{ id: Date.now(), serialNumber: '', macAddress: '' }]);

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
    }, [prefillData]);


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
        const category = e.target.value;
        setSelectedCategory(category);
        setDeviceTypes(ispAssetCategories[category] || []);
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
            purchaseDate: purchaseDate!.toISOString().split('T')[0],
            warrantyEndDate: warrantyDate ? warrantyDate.toISOString().split('T')[0] : null,
            condition,
            location: location || null,
            currentUser: initialUser || null,
            notes: notes || null,
            attachments: [],
            bulkItems,
            relatedRequestId: prefillData?.id || null,
        };

        setTimeout(() => { // Simulate API Call
            onSave(formData);
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
                {isSubmitting ? 'Menyimpan...' : 'Simpan Aset Baru'}
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
                    <p className="font-semibold text-tm-secondary">FORMULIR PENCATATAN ASET BARU</p>
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
                            {Object.keys(ispAssetCategories).map(cat => <option key={cat} value={cat}>{cat}</option>)}
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
                            <button type="button" onClick={addBulkItem} className="px-3 py-1 text-xs font-semibold text-white transition-colors duration-200 rounded-md shadow-sm bg-tm-accent hover:bg-tm-primary">+ Tambah Unit</button>
                        </div>
                       <div className="space-y-3">
                            {bulkItems.map((item, index) => (
                                <div key={item.id} className="relative grid grid-cols-1 gap-x-4 gap-y-2 p-3 bg-gray-50/80 border rounded-lg md:grid-cols-2">
                                    <div className="md:col-span-2">
                                        <label className="text-sm font-medium text-gray-700">Unit #{index + 1}</label>
                                    </div>
                                    <div>
                                        <label htmlFor={`sn-${item.id}`} className="block text-xs font-medium text-gray-500">Nomor Seri</label>
                                        <input
                                            id={`sn-${item.id}`}
                                            type="text"
                                            value={item.serialNumber}
                                            onChange={(e) => handleBulkItemChange(item.id, 'serialNumber', e.target.value)}
                                            required
                                            className="block w-full px-3 py-2 mt-1 text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-tm-accent focus:border-tm-accent sm:text-sm"
                                            placeholder="Wajib diisi"
                                        />
                                    </div>
                                    <div>
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
                                    {bulkItems.length > 1 && (
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
                    <div className="md:col-span-2">
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

const DetailItem: React.FC<{ label: string; value: React.ReactNode; fullWidth?: boolean }> = ({ label, value, fullWidth = false }) => (
    <div className={fullWidth ? 'md:col-span-2' : ''}>
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900">{value || '-'}</dd>
    </div>
);


const ItemRegistration: React.FC<ItemRegistrationProps> = ({ assets, setAssets, prefillData, onClearPrefill, onRegistrationComplete, onInitiateHandover, onInitiateInstallation, onInitiateDismantle }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [assetToDeleteId, setAssetToDeleteId] = useState<string | null>(null);
    const [bulkDeleteConfirmation, setBulkDeleteConfirmation] = useState(false);
    const addNotification = useNotification();
    const [isLoading, setIsLoading] = useState(false);

    const [view, setView] = useState<'list' | 'form'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({ status: '', category: '', location: '', dismantled: '' });
    const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
    const [isBulkSelectMode, setIsBulkSelectMode] = useState(false);
    
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // States for new bulk action modals
    const [isChangeStatusModalOpen, setIsChangeStatusModalOpen] = useState(false);
    const [targetStatus, setTargetStatus] = useState<AssetStatus>(AssetStatus.IN_STORAGE);

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
        return searchQuery.trim() !== '' || filters.status !== '' || filters.category !== '' || filters.location !== '' || filters.dismantled !== '';
    }, [searchQuery, filters]);

    const handleResetFilters = () => {
        setSearchQuery('');
        setFilters({ status: '', category: '', location: '', dismantled: '' });
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

    const handleShowDetails = (asset: Asset) => {
        setSelectedAsset(asset);
        setIsModalOpen(true);
    };

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

    const handleBulkDelete = () => {
        setIsLoading(true);
        setTimeout(() => { // Simulate API Call
            setAssets(prev => prev.filter(asset => !selectedAssetIds.includes(asset.id)));
            addNotification(`${selectedAssetIds.length} aset berhasil dihapus.`, 'success');
            handleCancelBulkMode();
            setBulkDeleteConfirmation(false);
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
    
    const handleAddAssets = (data: RegistrationFormData) => {
        const baseAssetData = {
            name: data.assetName,
            category: data.category,
            type: data.type,
            brand: data.brand,
            purchaseDate: data.purchaseDate,
            purchasePrice: data.purchasePrice,
            vendor: data.vendor,
            warrantyEndDate: data.warrantyEndDate,
            location: data.location,
            currentUser: data.currentUser,
            condition: data.condition,
            notes: data.notes,
            attachments: data.attachments,
            woRoIntNumber: data.relatedRequestId || `INT-${Math.floor(Math.random() * 90000) + 10000}`,
            status: data.currentUser ? AssetStatus.IN_USE : AssetStatus.IN_STORAGE,
        };

        const newAssets: Asset[] = data.bulkItems.map((item, index) => ({
            ...baseAssetData,
            id: `AST-${String(assets.length + 1 + index).padStart(3, '0')}`,
            serialNumber: item.serialNumber,
            macAddress: item.macAddress || null,
        }));
        
        setAssets(prev => [...newAssets, ...prev]);
        handleSetView('list');
        if (data.relatedRequestId) {
            onRegistrationComplete(data.relatedRequestId);
        }
        addNotification(`${newAssets.length} aset baru berhasil dicatat.`, 'success');
    };
    
    const formatCurrency = (value: number | null) => {
        if (value === null || value === undefined) return '-';
        return `Rp ${value.toLocaleString('id-ID')}`;
    };

    const renderModalFooter = () => {
        if (!selectedAsset) return null;
        
        const canBeAssigned = selectedAsset.status === AssetStatus.IN_STORAGE;
        const canBeDismantled = selectedAsset.status === AssetStatus.IN_USE;

        return (
            <div className="flex items-center justify-end flex-1 space-x-3">
                {canBeAssigned && (
                    <>
                        <button
                            type="button"
                            onClick={() => {
                                onInitiateInstallation(selectedAsset);
                                handleCloseModal();
                            }}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 bg-tm-primary rounded-lg shadow-sm hover:bg-tm-primary-hover"
                        >
                            <CustomerIcon className="w-4 h-4" />
                            Pasang ke Pelanggan
                        </button>
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
                    </>
                )}
                 {canBeDismantled && (
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
                )}
            </div>
        )
    };
    
    const renderContent = () => {
        if (view === 'form') {
            return (
                 <div className="p-4 sm:p-6">
                    <div className="flex flex-col items-start justify-between gap-4 mb-6 sm:flex-row sm:items-center">
                        <h1 className="text-2xl sm:text-3xl font-bold text-tm-dark">Catat Aset Baru</h1>
                        <button
                            onClick={() => handleSetView('list')}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tm-accent"
                        >
                            Kembali ke Daftar
                        </button>
                    </div>
                    <div className="p-4 sm:p-6 bg-white border border-gray-200/80 rounded-xl shadow-md pb-24">
                        <RegistrationForm onBack={() => handleSetView('list')} onSave={handleAddAssets} prefillData={prefillData} />
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
                            {filterOptions.categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select onChange={e => handleFilterChange('dismantled', e.target.value)} value={filters.dismantled} className="w-full h-10 px-3 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-300 rounded-lg lg:col-span-3 focus:ring-tm-accent focus:border-tm-accent">
                            <option value="">Semua Asal Aset</option>
                            <option value="yes">Hasil Dismantle</option>
                            <option value="no">Bukan Dismantle</option>
                        </select>
                        
                        {isFiltering && (
                            <div className="flex justify-start lg:col-span-3 lg:justify-end">
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
                            <div className="flex items-center justify-between">
                                {selectedAssetIds.length > 0 ? (
                                    <div className="flex items-center space-x-3">
                                        <span className="text-sm font-medium text-tm-primary">{selectedAssetIds.length} item terpilih</span>
                                        <div className="h-5 border-l border-gray-300"></div>
                                        <button
                                            onClick={() => setIsChangeStatusModalOpen(true)}
                                            className="px-3 py-1.5 text-sm font-semibold text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200"
                                        >
                                            Ubah Status
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
                            onDetailClick={handleShowDetails} 
                            onDeleteClick={setAssetToDeleteId}
                            sortConfig={sortConfig}
                            requestSort={requestSort}
                            selectedAssetIds={selectedAssetIds}
                            onSelectOne={handleSelectOne}
                            onSelectAll={handleSelectAll}
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
        )
    }

    return (
        <>
            {renderContent()}
            
            {selectedAsset && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    title={`Detail Aset: ${selectedAsset.name}`}
                    size="3xl"
                    footerContent={renderModalFooter()}
                >
                    <div className="space-y-6">
                        <div className="mb-4 space-y-1 text-center border-b pb-4">
                            <h4 className="text-lg font-bold text-tm-dark">TRINITY MEDIA INDONESIA</h4>
                            <p className="font-semibold text-tm-secondary">KARTU ASET (ASSET CARD)</p>
                        </div>

                        {/* Section 1: Info */}
                        <div>
                            <h4 className="font-semibold text-tm-dark mb-2 border-b pb-2">Informasi Aset</h4>
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-2">
                                <DetailItem label="ID Aset" value={<span className="font-mono">{selectedAsset.id}</span>} />
                                <DetailItem label="Kategori" value={selectedAsset.category} />
                                <DetailItem label="Brand" value={selectedAsset.brand} />
                                <DetailItem label="Type" value={selectedAsset.type} />
                                <DetailItem label="Nomor Seri" value={<span className="font-mono">{selectedAsset.serialNumber}</span>} />
                                <DetailItem label="MAC Address" value={<span className="font-mono">{selectedAsset.macAddress}</span>} />
                                <DetailItem label="Pengguna Saat Ini" value={selectedAsset.currentUser} />
                                <DetailItem label="Lokasi Fisik" value={selectedAsset.location} />
                            </dl>
                        </div>
                        {/* Section 2: Pembelian */}
                         <div>
                            <h4 className="font-semibold text-tm-dark mb-2 border-b pb-2">Informasi Pembelian</h4>
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-2">
                                <DetailItem label="Harga Beli" value={<span className="font-semibold">{formatCurrency(selectedAsset.purchasePrice)}</span>} />
                                <DetailItem label="Vendor / Toko" value={selectedAsset.vendor} />
                                <DetailItem label="Tanggal Pembelian" value={selectedAsset.purchaseDate} />
                                <DetailItem label="Akhir Garansi" value={selectedAsset.warrantyEndDate} />
                            </dl>
                        </div>

                        {/* Section 3: Status & Kondisi */}
                        <div>
                            <h4 className="font-semibold text-tm-dark mb-2 border-b pb-2">Status & Kondisi</h4>
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-2">
                                <DetailItem label="Status" value={<span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(selectedAsset.status)}`}>{selectedAsset.status}</span>} />
                                <DetailItem label="Kondisi" value={selectedAsset.condition} />
                                 <DetailItem label="Asal Aset" value={
                                    selectedAsset.isDismantled
                                        ? <span className="font-semibold text-amber-700">Hasil Dismantle</span>
                                        : "Pembelian Baru / Stok Lama"
                                } />
                                <DetailItem label="Catatan" value={selectedAsset.notes} fullWidth={!selectedAsset.isDismantled} />
                            </dl>
                        </div>

                         {/* Section 4: Lampiran */}
                        {selectedAsset.attachments.length > 0 && (
                             <div>
                                <h4 className="font-semibold text-tm-dark mb-2 border-b pb-2">Lampiran</h4>
                                <ul className="space-y-2">
                                    {selectedAsset.attachments.map(file => (
                                        <li key={file.id} className="flex items-center p-2 text-sm bg-gray-50 rounded-md border">
                                            <PaperclipIcon className="w-4 h-4 mr-2 text-gray-500"/>
                                            <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-tm-primary hover:underline">{file.name}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
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
                                Ya, Hapus
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
                    hideDefaultCloseButton={true}
                    footerContent={
                         <>
                             <button onClick={() => setBulkDeleteConfirmation(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Batal</button>
                            <button
                                type="button"
                                onClick={handleBulkDelete}
                                disabled={isLoading}
                                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-danger rounded-lg shadow-sm hover:bg-red-700 disabled:bg-red-400"
                            >
                                {isLoading && <SpinnerIcon className="w-5 h-5 mr-2" />}
                                Ya, Hapus Semua
                            </button>
                        </>
                    }
                >
                    <p className="text-sm text-gray-600">
                        Apakah Anda yakin ingin menghapus <span className="font-bold text-tm-dark">{selectedAssetIds.length}</span> aset yang dipilih? Tindakan ini tidak dapat diurungkan.
                    </p>
                </Modal>
            )}
            {isChangeStatusModalOpen && (
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

export default ItemRegistration;