import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Request, ItemStatus, RequestItem, User, AssetStatus, Asset, PreviewData, AssetCategory, AssetType, StandardItem, Division, Page, OrderDetails, OrderType, Notification, UserRole, PurchaseDetails, Activity } from '../../types';
import Modal from '../../components/ui/Modal';
import { CloseIcon } from '../../components/icons/CloseIcon';
import DatePicker from '../../components/ui/DatePicker';
import { EyeIcon } from '../../components/icons/EyeIcon';
import { TrashIcon } from '../../components/icons/TrashIcon';
import FloatingActionBar from '../../components/ui/FloatingActionBar';
import { useNotification } from '../../providers/NotificationProvider';
import { InboxIcon } from '../../components/icons/InboxIcon';
import { useSortableData, SortConfig } from '../../hooks/useSortableData';
import { SortAscIcon } from '../../components/icons/SortAscIcon';
import { SortDescIcon } from '../../components/icons/SortDescIcon';
import { SortIcon } from '../../components/icons/SortIcon';
import { exportToCSV } from '../../utils/csvExporter';
import { Checkbox } from '../../components/ui/Checkbox';
import { useLongPress } from '../../hooks/useLongPress';
import { SpinnerIcon } from '../../components/icons/SpinnerIcon';
import { SearchIcon } from '../../components/icons/SearchIcon';
import { PaginationControls } from '../../components/ui/PaginationControls';
import { RegisterIcon } from '../../components/icons/RegisterIcon';
import { ExclamationTriangleIcon } from '../../components/icons/ExclamationTriangleIcon';
import { Tooltip } from '../../components/ui/Tooltip';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { FilterIcon } from '../../components/icons/FilterIcon';
import { RequestIcon } from '../../components/icons/RequestIcon';
import { CheckIcon } from '../../components/icons/CheckIcon';
import { BellIcon } from '../../components/icons/BellIcon';
import { MegaphoneIcon } from '../../components/icons/MegaphoneIcon';
import { InfoIcon } from '../../components/icons/InfoIcon';
import { ExportIcon } from '../../components/icons/ExportIcon';
import { RequestStatusIndicator, OrderIndicator } from './components/RequestStatus';
import RequestDetailPage from './RequestDetailPage';
// FIX: Import SignatureStamp to resolve 'Cannot find name' error.
import { SignatureStamp } from '../../components/ui/SignatureStamp';
// FIX: Import PencilIcon to resolve 'Cannot find name' error.
import { PencilIcon } from '../../components/icons/PencilIcon';


const canViewPrice = (role: UserRole) => ['Admin Purchase', 'Super Admin'].includes(role);

interface ItemRequestPageProps {
    currentUser: User;
    requests: Request[];
    setRequests: React.Dispatch<React.SetStateAction<Request[]>>;
    assets: Asset[];
    assetCategories: AssetCategory[];
    divisions: Division[];
    onInitiateRegistration: (request: Request, itemToRegister: RequestItem) => void;
    onInitiateHandoverFromRequest: (request: Request) => void;
    initialFilters?: any;
    onClearInitialFilters: () => void;
    onShowPreview: (data: PreviewData) => void;
    openModelModal: (category: AssetCategory, type: AssetType, onModelAdded: (model: StandardItem) => void) => void;
    openTypeModal: (category: AssetCategory, typeToEdit: AssetType | null, onTypeAdded: (type: AssetType) => void) => void;
    setActivePage: (page: Page, initialState?: any) => void;
    users: User[];
    notifications: Notification[];
    addNotification: (notification: Partial<Notification> & { recipientId: number, actorName: string, type: Notification['type'], referenceId: string }) => void;
    markNotificationsAsRead: (referenceId: string) => void;
}

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
    currentUser: User;
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
    notifications: Notification[];
    onFollowUpClick: (request: Request) => void;
}

const RequestTable: React.FC<RequestTableProps> = ({ requests, currentUser, onDetailClick, onDeleteClick, onOpenStaging, sortConfig, requestSort, selectedRequestIds, onSelectOne, onSelectAll, isBulkSelectMode, onEnterBulkMode, notifications, onFollowUpClick }) => {
    const longPressHandlers = useLongPress(onEnterBulkMode, 500);

    const handleRowClick = (req: Request) => {
        if (isBulkSelectMode) {
            onSelectOne(req.id);
        } else {
            onDetailClick(req);
        }
    };
    
    // SLA simulation: 2 hours in milliseconds
    const SLA_THRESHOLD_MS = 2 * 60 * 60 * 1000;

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
                    requests.map((req) => {
                        const relevantNotifs = notifications.filter(n => n.recipientId === currentUser.id && n.referenceId === req.id);
                        const hasUnreadNotif = relevantNotifs.some(n => !n.isRead);
                        const isApprover = ['Admin Purchase', 'Admin Logistik', 'Super Admin'].includes(currentUser.role);
                        const showHighlight = hasUnreadNotif && isApprover;

                        const unreadNotifTypes = new Set(relevantNotifs.filter(n => !n.isRead).map(n => n.type));
                        
                        const now = new Date();
                        const lastFollowUpDate = req.lastFollowUpAt ? new Date(req.lastFollowUpAt) : null;
                        let isFollowUpDisabled = false;
                        let followUpTooltip = "Kirim notifikasi follow-up ke approver";

                        if (lastFollowUpDate) {
                            const diffHours = (now.getTime() - lastFollowUpDate.getTime()) / (1000 * 60 * 60);
                            if (diffHours < 24) {
                                isFollowUpDisabled = true;
                                const hoursRemaining = Math.ceil(24 - diffHours);
                                followUpTooltip = `Anda dapat follow-up lagi dalam ${hoursRemaining} jam.`;
                            }
                        }


                        return (
                        <tr 
                            key={req.id}
                            {...longPressHandlers}
                            onClick={() => handleRowClick(req)}
                            className={`transition-colors cursor-pointer 
                                ${selectedRequestIds.includes(req.id) ? 'bg-blue-50' : ''}
                                ${showHighlight ? 'bg-amber-100/50 animate-pulse-slow' : 'hover:bg-gray-50'}
                            `}
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
                                <div className="flex items-start gap-3">
                                    
                                    <div className="flex flex-col gap-2">
                                        <div>
                                            <div id={`request-id-${req.id}`} className="text-sm font-semibold text-gray-900">{req.id}</div>
                                            <div className="text-xs text-gray-500">{new Date(req.requestDate).toLocaleString('id-ID')}</div>
                                        </div>
                                         <OrderIndicator order={req.order} />
                                          {showHighlight && (
                                            <div className="flex items-center gap-1.5">
                                                {unreadNotifTypes.has('CEO_DISPOSITION') && (
                                                    <Tooltip text="Diprioritaskan oleh CEO"><MegaphoneIcon className="w-4 h-4 text-purple-600" /></Tooltip>
                                                )}
                                                {unreadNotifTypes.has('PROGRESS_UPDATE_REQUEST') && (
                                                    <Tooltip text="CEO meminta update progres"><InfoIcon className="w-4 h-4 text-blue-600 animate-pulse" /></Tooltip>
                                                )}
                                                {unreadNotifTypes.has('FOLLOW_UP') && (
                                                     <Tooltip text="Permintaan ini di-follow up"><BellIcon className="w-4 h-4 text-amber-500" /></Tooltip>
                                                )}
                                            </div>
                                        )}
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
                                <RequestStatusIndicator status={req.status} />
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-right lg:whitespace-nowrap">
                                <div className="flex items-center justify-end space-x-2">
                                    {(currentUser.role === 'Staff' || currentUser.role === 'Leader') && (req.status === ItemStatus.PENDING || req.status === ItemStatus.LOGISTIC_APPROVED) && (
                                        <Tooltip text={followUpTooltip} position="left">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onFollowUpClick(req); }}
                                                disabled={isFollowUpDisabled}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-info-text bg-info-light rounded-lg shadow-sm hover:bg-blue-200 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                                                aria-label={followUpTooltip}
                                            >
                                                <BellIcon className="w-4 h-4"/>
                                                <span>Follow Up</span>
                                            </button>
                                        </Tooltip>
                                    )}
                                    
                                    {req.status === ItemStatus.ARRIVED && !req.isRegistered && (currentUser.role === 'Admin Logistik' || currentUser.role === 'Super Admin') ? (
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
                                    {(currentUser.role === 'Admin Purchase' || currentUser.role === 'Super Admin') && (
                                        <button onClick={(e) => { e.stopPropagation(); onDeleteClick(req.id); }} className="flex items-center justify-center w-8 h-8 text-gray-500 transition-colors bg-gray-100 rounded-full hover:bg-danger-light hover:text-danger-text" title="Hapus">
                                          <TrashIcon className="w-5 h-5"/>
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                        )
                    })
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
    const [orderType, setOrderType] = useState<OrderType>('Regular Stock');
    const [justification, setJustification] = useState('');
    const [project, setProject] = useState('');
    const [items, setItems] = useState<RequestItemForm[]>([
        { id: Date.now(), categoryId: '', typeId: '', itemName: '', itemTypeBrand: '', stock: 0, quantity: 1, keterangan: '' }
    ]);
    const [isFooterVisible, setIsFooterVisible] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const footerRef = useRef<HTMLDivElement>(null);
    const addNotification = useNotification();

    const availableCategories = useMemo(() => {
        if (currentUser.role === 'Staff' && currentUser.divisionId) {
            return assetCategories.filter(category => 
                category.associatedDivisions.length === 0 || // Global category
                category.associatedDivisions.includes(currentUser.divisionId!) // Associated with the staff's division
            );
        }
        // Managers, Admins, and Super Admins can see all categories.
        return assetCategories;
    }, [assetCategories, currentUser]);
    
    const orderOptions = useMemo(() => {
        const allOptions = [
            { value: 'Regular Stock', label: 'Regular Stock', indicator: <OrderIndicator order={{ type: 'Regular Stock' }} /> },
            { value: 'Urgent', label: 'Urgent', indicator: <OrderIndicator order={{ type: 'Urgent' }} /> },
            { value: 'Project Based', label: 'Project Based', indicator: <OrderIndicator order={{ type: 'Project Based' }} /> },
        ];

        if (currentUser.role === 'Staff') {
            return allOptions.filter(opt => opt.value === 'Regular Stock');
        }
        
        return allOptions;
    }, [currentUser.role]);
    
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
            const category = availableCategories.find(c => c.types.some(t => t.standardItems?.some(si => si.name === prefillItem?.name)));
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
    }, [prefillItem, assets, availableCategories]);

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
        
        if (orderType === 'Urgent' && !justification.trim()) {
            addNotification('Justifikasi harus diisi untuk permintaan Urgent.', 'error');
            return;
        }
        if (orderType === 'Project Based' && !project.trim()) {
            addNotification('Nama/Kode Proyek harus diisi.', 'error');
            return;
        }

        setIsSubmitting(true);
        setTimeout(() => { // Simulate API call
            
            const totalValue = items.reduce((sum, item) => {
                const assetSample = assets.find(a => a.name === item.itemName && a.brand === item.itemTypeBrand);
                const price = assetSample?.purchasePrice || 0;
                return sum + (price * item.quantity);
            }, 0);

            const finalItems = items.map(({ categoryId, typeId, ...rest }) => rest);
            const orderDetails: OrderDetails = {
                type: orderType,
                justification: orderType === 'Urgent' ? justification : undefined,
                project: orderType === 'Project Based' ? project : undefined,
            };

            onCreateRequest({
                requester: requesterName,
                division: requesterDivision,
                requestDate: requestDate ? requestDate.toISOString() : new Date().toISOString(),
                order: orderDetails,
                items: finalItems,
                totalValue,
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
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                        <label htmlFor="order" className="block text-sm font-medium text-gray-700">Tipe Order</label>
                        <div className="mt-1">
                           <CustomSelect
                                options={orderOptions}
                                value={orderType}
                                onChange={(value) => setOrderType(value as OrderType)}
                            />
                        </div>
                    </div>
                </div>
                {orderType === 'Urgent' && (
                     <div className="mt-6">
                        <label htmlFor="justification" className="block text-sm font-medium text-gray-700">Justifikasi Kebutuhan Urgent</label>
                         <textarea id="justification" value={justification} onChange={e => setJustification(e.target.value)} required rows={2} className="block w-full px-3 py-2 mt-1 text-gray-900 bg-amber-50 border border-amber-300 rounded-lg shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm" placeholder="Jelaskan alasan mengapa permintaan ini bersifat mendesak..."></textarea>
                     </div>
                )}
                {orderType === 'Project Based' && (
                    <div className="mt-6">
                        <label htmlFor="project" className="block text-sm font-medium text-gray-700">Nama / Kode Proyek</label>
                        <input type="text" id="project" value={project} onChange={e => setProject(e.target.value)} required className="block w-full px-3 py-2 mt-1 text-gray-900 bg-blue-50 border border-blue-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Contoh: Instalasi Klien Korporat PT. Sejahtera" />
                    </div>
                )}
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
                    const categoryOptions = availableCategories.map(c => ({ value: c.id.toString(), label: c.name }));
                    const selectedCategory = availableCategories.find(c => c.id.toString() === item.categoryId);
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
                                 <div className="md:col-span-6">
                                    <label className="block text-sm font-medium text-gray-600">Nama Barang</label>
                                    <input type="text" value={item.itemName} onChange={(e) => handleItemChange(item.id, 'itemName', e.target.value)} className="block w-full px-3 py-2 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg shadow-sm sm:text-sm" placeholder="Otomatis dari model, atau isi manual" />
                                </div>
                                <div className="md:col-span-6">
                                    <label className="block text-sm font-medium text-gray-600">Brand</label>
                                    <input type="text" value={item.itemTypeBrand} onChange={(e) => handleItemChange(item.id, 'itemTypeBrand', e.target.value)} className="block w-full px-3 py-2 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg shadow-sm sm:text-sm" placeholder="Otomatis dari model, atau isi manual" />
                                </div>
                                <div className="md:col-span-3">
                                    <label className="block text-sm font-medium text-gray-600">Stok Gudang</label>
                                    <input type="number" value={item.stock} readOnly className="block w-full px-3 py-2 mt-1 text-gray-700 bg-gray-100 border border-gray-200 rounded-lg shadow-sm sm:text-sm" />
                                </div>
                                <div className="md:col-span-3">
                                    <label className="block text-sm font-medium text-gray-600">Jumlah Req ({unitOfMeasure})</label>
                                    <input type="number" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value))} min="1" className="block w-full px-3 py-2 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg shadow-sm sm:text-sm" />
                                </div>
                                <div className="md:col-span-6">
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

const FollowUpConfirmationModal: React.FC<{
    request: Request | null;
    onClose: () => void;
    onConfirm: () => void;
    isLoading: boolean;
    title: string;
    message: React.ReactNode;
    zIndex?: string;
}> = ({ request, onClose, onConfirm, isLoading, title, message, zIndex = 'z-50' }) => {
    if (!request) return null;

    return (
        <Modal
            isOpen={!!request}
            onClose={onClose}
            title={title}
            size="md"
            hideDefaultCloseButton
            zIndex={zIndex}
            footerContent={
                <>
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Batal</button>
                    <button onClick={onConfirm} disabled={isLoading} className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-tm-primary rounded-lg shadow-sm hover:bg-tm-primary-hover disabled:bg-tm-primary/70">
                        {isLoading && <SpinnerIcon className="w-4 h-4 mr-2" />}
                        Kirim Notifikasi
                    </button>
                </>
            }
        >
            <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3 p-3 text-blue-800 bg-blue-50/70 rounded-lg border border-blue-200/50">
                    <InfoIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    {message}
                </div>
                <p className="text-gray-600">
                    Fitur ini ditujukan untuk menanyakan status atau meminta klarifikasi secara profesional. Mohon gunakan dengan bijak dan tidak berlebihan untuk menjaga etika kerja.
                </p>
                <p className="font-semibold text-gray-800">
                    Setelah dikirim, Anda hanya dapat melakukan follow-up lagi setelah 24 jam. Lanjutkan?
                </p>
            </div>
        </Modal>
    );
};

const RequestReviewModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    request: Request;
    onConfirm: (adjustments: Record<number, { approvedQuantity: number, reason: string }>) => void;
    isLoading: boolean;
}> = ({ isOpen, onClose, request, onConfirm, isLoading }) => {
    type ItemAction = 'approve' | 'partial' | 'reject';
    const [itemActions, setItemActions] = useState<Record<number, ItemAction>>({});
    const [adjustments, setAdjustments] = useState<Record<number, { approvedQuantity: string; reason: string }>>({});
    const addNotificationUI = useNotification();

    useEffect(() => {
        if (isOpen) {
            const initialActions: Record<number, ItemAction> = {};
            const initialAdjustments: Record<number, { approvedQuantity: string; reason: string }> = {};
            
            request.items.forEach(item => {
                const existingStatus = request.itemStatuses?.[item.id];
                const approvedQty = existingStatus?.approvedQuantity;
                
                if (typeof approvedQty === 'number') {
                    if (approvedQty === 0) initialActions[item.id] = 'reject';
                    else if (approvedQty < item.quantity) initialActions[item.id] = 'partial';
                    else initialActions[item.id] = 'approve';
                    
                    initialAdjustments[item.id] = {
                        approvedQuantity: approvedQty.toString(),
                        reason: existingStatus?.reason ?? ''
                    };
                } else {
                    initialActions[item.id] = 'approve';
                    initialAdjustments[item.id] = {
                        approvedQuantity: item.quantity.toString(),
                        reason: ''
                    };
                }
            });
            setItemActions(initialActions);
            setAdjustments(initialAdjustments);
        }
    }, [isOpen, request]);

    const handleAdjustmentChange = (itemId: number, field: 'approvedQuantity' | 'reason', value: string) => {
        const item = request.items.find(i => i.id === itemId);
        if (!item) return;

        let newValue = value;
        if (field === 'approvedQuantity') {
            if (value === '') {
                newValue = '';
            } else {
                const numValue = parseInt(value, 10);
                if (isNaN(numValue) || numValue < 0 || numValue > item.quantity) return;
                newValue = numValue.toString();
            }
        }
        
        setAdjustments(prev => ({
            ...prev,
            [itemId]: { ...prev[itemId], [field]: newValue }
        }));
    };
    
    const handleActionChange = (itemId: number, action: ItemAction) => {
        setItemActions(prev => ({ ...prev, [itemId]: action }));
        
        const item = request.items.find(i => i.id === itemId);
        if (!item) return;

        let newQuantity = item.quantity;
        if (action === 'reject') newQuantity = 0;
        else if (action === 'partial') newQuantity = Math.max(1, item.quantity - 1);
        
        setAdjustments(prev => ({
            ...prev,
            [itemId]: { ...prev[itemId], approvedQuantity: String(newQuantity) }
        }));
    };


    const isSubmissionValid = useMemo(() => {
        return request.items.every(item => {
            const adj = adjustments[item.id];
            if (!adj || adj.approvedQuantity === '') return false;
            const approvedQty = Number(adj.approvedQuantity);
            if (approvedQty < item.quantity) {
                return adj.reason.trim() !== '';
            }
            return true;
        });
    }, [adjustments, request.items]);

    const handleSubmit = () => {
        if (!isSubmissionValid) {
            addNotificationUI('Harap isi catatan untuk setiap item yang kuantitasnya diubah atau ditolak.', 'error');
            return;
        }
        const finalAdjustments: Record<number, { approvedQuantity: number, reason: string }> = {};
        for (const itemId in adjustments) {
            finalAdjustments[itemId] = {
                approvedQuantity: Number(adjustments[itemId].approvedQuantity),
                reason: adjustments[itemId].reason
            };
        }
        onConfirm(finalAdjustments);
    };

    const ActionButton: React.FC<{ onClick: () => void, text: string, icon: React.FC<{className?:string}>, isActive: boolean }> = ({ onClick, text, icon: Icon, isActive }) => (
        <button
            type="button"
            onClick={onClick}
            className={`flex-1 p-3 border-2 rounded-lg text-left transition-all duration-200 ${isActive ? 'bg-blue-50 border-tm-primary ring-2 ring-tm-primary/50' : 'bg-white border-gray-300 hover:border-tm-accent'}`}
        >
            <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-tm-primary' : 'text-gray-500'}`} />
                <span className="font-semibold text-gray-800 text-sm">{text}</span>
            </div>
        </button>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Tinjau & Revisi Permintaan #${request.id}`}
            size="2xl"
            hideDefaultCloseButton
            footerContent={
                <>
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Batal</button>
                    <button onClick={handleSubmit} disabled={isLoading || !isSubmissionValid} className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-tm-primary rounded-lg shadow-sm hover:bg-tm-primary-hover disabled:bg-tm-primary/60">
                        {isLoading && <SpinnerIcon className="w-4 h-4 mr-2" />}
                        Simpan Tinjauan & Lanjutkan
                    </button>
                </>
            }
        >
            <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 text-sm text-blue-800 bg-blue-50/70 rounded-lg border border-blue-200/50">
                    <InfoIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <p>Sesuaikan jumlah yang disetujui untuk setiap item. Jika jumlah dikurangi atau ditolak, Anda wajib memberikan catatan.</p>
                </div>
                <div className="pt-4 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar -m-2 p-2">
                    {request.items.map(item => {
                        const currentAction = itemActions[item.id];
                        const adj = adjustments[item.id];
                        const showReason = currentAction === 'reject' || currentAction === 'partial';

                        return (
                            <div key={item.id} className="p-4 border rounded-lg bg-gray-50/50 border-gray-200">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-gray-800">{item.itemName}</p>
                                        <p className="text-xs text-gray-500">{item.itemTypeBrand} &bull; Diminta: {item.quantity} unit</p>
                                    </div>
                                </div>
                                
                                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {item.quantity === 1 ? (
                                        <>
                                            <ActionButton text="Setujui (1)" icon={CheckIcon} isActive={currentAction === 'approve'} onClick={() => handleActionChange(item.id, 'approve')} />
                                            <ActionButton text="Tolak (0)" icon={CloseIcon} isActive={currentAction === 'reject'} onClick={() => handleActionChange(item.id, 'reject')} />
                                        </>
                                    ) : (
                                        <>
                                            <ActionButton text={`Setujui Semua (${item.quantity})`} icon={CheckIcon} isActive={currentAction === 'approve'} onClick={() => handleActionChange(item.id, 'approve')} />
                                            <ActionButton text="Setujui Sebagian" icon={PencilIcon} isActive={currentAction === 'partial'} onClick={() => handleActionChange(item.id, 'partial')} />
                                            <ActionButton text="Tolak Semua (0)" icon={CloseIcon} isActive={currentAction === 'reject'} onClick={() => handleActionChange(item.id, 'reject')} />
                                        </>
                                    )}
                                </div>
                                
                                {currentAction === 'partial' && (
                                    <div className="mt-3">
                                        <label htmlFor={`qty-${item.id}`} className="block text-sm font-medium text-gray-700">Jumlah Disetujui</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <input
                                                type="number"
                                                id={`qty-${item.id}`}
                                                value={adj?.approvedQuantity ?? ''}
                                                onChange={(e) => handleAdjustmentChange(item.id, 'approvedQuantity', e.target.value)}
                                                min="1"
                                                max={item.quantity - 1}
                                                className="block w-24 px-2 py-1 text-center font-semibold text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-tm-accent focus:border-tm-accent"
                                            />
                                            <span className="text-sm text-gray-500">/ {item.quantity} unit</span>
                                        </div>
                                    </div>
                                )}

                                {showReason && (
                                     <div className="mt-3">
                                        <label htmlFor={`reason-${item.id}`} className="block text-sm font-medium text-amber-800">Catatan Revisi/Penolakan (Wajib)</label>
                                        <textarea
                                            id={`reason-${item.id}`}
                                            rows={2}
                                            value={adj?.reason ?? ''}
                                            onChange={(e) => handleAdjustmentChange(item.id, 'reason', e.target.value)}
                                            className="block w-full px-3 py-2 mt-1 text-sm text-gray-900 bg-white border-amber-300 rounded-lg shadow-sm focus:ring-amber-500 focus:border-amber-500"
                                            placeholder={`Contoh: Stok hanya tersedia ${adj?.approvedQuantity}, Budget terbatas, dll.`}
                                        ></textarea>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </Modal>
    );
};

// FIX: Define RegistrationStagingModal component to fix 'Cannot find name' error.
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
            title={`Pilih Item untuk Dicatat dari Request ${request.id}`}
            size="lg"
            hideDefaultCloseButton={true}
            footerContent={<button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Tutup</button>}
        >
            <div className="space-y-4">
                <p className="text-sm text-gray-600">
                    Satu atau lebih item dari permintaan ini telah tiba. Pilih item di bawah ini untuk memulai proses pencatatan sebagai aset.
                </p>
                <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar border rounded-lg p-3 bg-gray-50/50">
                    {request.items.map(item => {
                        const registeredCount = request.partiallyRegisteredItems?.[item.id] || 0;
                        const remainingCount = item.quantity - registeredCount;
                        const isCompleted = remainingCount <= 0;

                        return (
                            <div key={item.id} className={`p-4 border rounded-lg transition-colors ${isCompleted ? 'bg-gray-100' : 'bg-white'}`}>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className={`font-semibold ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-800'}`}>{item.itemName}</p>
                                        <p className="text-xs text-gray-500">{item.itemTypeBrand}</p>
                                    </div>
                                    <button
                                        onClick={() => onInitiateRegistration(item)}
                                        disabled={isCompleted}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-tm-primary rounded-md shadow-sm hover:bg-tm-primary-hover disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >
                                        <RegisterIcon className="w-4 h-4" />
                                        Catat
                                    </button>
                                </div>
                                <div className="mt-2 pt-2 border-t text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total diminta:</span>
                                        <span className="font-medium text-gray-800">{item.quantity} unit</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Sudah dicatat:</span>
                                        <span className="font-medium text-gray-800">{registeredCount} unit</span>
                                    </div>
                                    <div className={`flex justify-between font-semibold ${isCompleted ? 'text-green-600' : 'text-blue-600'}`}>
                                        <span>Sisa:</span>
                                        <span>{remainingCount} unit</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </Modal>
    );
};


const ItemRequestPage: React.FC<ItemRequestPageProps> = (props) => {
    const { currentUser, requests, setRequests, assets, assetCategories, divisions, onInitiateRegistration, onInitiateHandoverFromRequest, initialFilters, onClearInitialFilters, onShowPreview, openModelModal, openTypeModal, setActivePage, users, notifications, addNotification, markNotificationsAsRead } = props;
    const [view, setView] = useState<'list' | 'form' | 'detail'>('list');
    const [itemToPrefill, setItemToPrefill] = useState<{ name: string; brand: string } | null>(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isProcurementModalOpen, setIsProcurementModalOpen] = useState(false);
    const [isCancellationModalOpen, setIsCancellationModalOpen] = useState(false);
    const [stagingRequest, setStagingRequest] = useState<Request | null>(null);
    const [estimatedDelivery, setEstimatedDelivery] = useState<Date | null>(new Date());
    const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
    const [requestToDeleteId, setRequestToDeleteId] = useState<string | null>(null);
    const [bulkDeleteConfirmation, setBulkDeleteConfirmation] = useState(false);
    const [isBulkSelectMode, setIsBulkSelectMode] = useState(false);
    const [selectedRequestIds, setSelectedRequestIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [followUpRequest, setFollowUpRequest] = useState<Request | null>(null);
    const [isFollowUpCeoModalOpen, setIsFollowUpCeoModalOpen] = useState(false);
    const [requestForCeoFollowUp, setRequestForCeoFollowUp] = useState<Request | null>(null);
    
    // States for new bulk action modals
    const [bulkApproveConfirmation, setBulkApproveConfirmation] = useState(false);
    const [bulkRejectConfirmation, setBulkRejectConfirmation] = useState(false);
    const [bulkRejectionReason, setBulkRejectionReason] = useState('');

    const [searchQuery, setSearchQuery] = useState('');
    const initialFilterState = { status: '', division: '', project: '', orderType: '' };
    const [filters, setFilters] = useState(initialFilterState);
    const [tempFilters, setTempFilters] = useState(filters);
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const filterPanelRef = useRef<HTMLDivElement>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const addNotificationUI = useNotification();
    
    const statusOptions = [
        { value: 'awaiting-approval', label: 'Perlu Persetujuan' },
        { value: 'urgent-awaiting-approval', label: 'Urgent Menunggu Aksi' },
        ...Object.values(ItemStatus).map(s => ({ value: s, label: s }))
    ];

    const orderTypeOptions = (['Regular Stock', 'Urgent', 'Project Based'] as const).map(o => ({ value: o, label: o }));

    const divisionOptions = divisions.map(d => ({ value: d.name, label: d.name }));

    const sendProgressFeedbackNotification = (request: Request) => {
        if (currentUser.role !== 'Admin Purchase') return null;
    
        const wasPrioritized = request.isPrioritizedByCEO && !request.ceoDispositionFeedbackSent;
        const wasUpdateRequested = request.progressUpdateRequest && !request.progressUpdateRequest.feedbackSent;
    
        if (!wasPrioritized && !wasUpdateRequested) return null;
    
        let targetUsers = users.filter(u => u.role === 'Super Admin');
        if (wasUpdateRequested) {
            const requester = targetUsers.find(u => u.name === request.progressUpdateRequest!.requestedBy);
            if (requester) {
                targetUsers = [requester];
            }
        }
        
        if (targetUsers.length === 0) return null;
    
        targetUsers.forEach(superAdmin => {
            addNotification({
                recipientId: superAdmin.id,
                actorName: currentUser.name,
                type: 'PROGRESS_FEEDBACK',
                referenceId: request.id,
                message: `Memberi update pada #${request.id}: Status baru adalah "${request.status}"`
            });
        });
    
        const updates: Partial<Request> = {};
        if (wasPrioritized) {
            updates.ceoDispositionFeedbackSent = true;
        }
        if (wasUpdateRequested) {
            updates.progressUpdateRequest = {
                ...request.progressUpdateRequest!,
                feedbackSent: true,
            };
        }
        
        addNotificationUI(`Notifikasi progres untuk #${request.id} telah dikirim ke manajemen.`, 'info');
        
        return updates;
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (filterPanelRef.current && !filterPanelRef.current.contains(event.target as Node)) {
                setIsFilterPanelOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => { document.removeEventListener("mousedown", handleClickOutside); };
    }, [filterPanelRef]);
    
    const handleShowDetails = (request: Request) => {
        setSelectedRequest(request);
        setView('detail');
        markNotificationsAsRead(request.id);
    };

    useEffect(() => {
        if (initialFilters) {
             setFilters(prev => ({
                ...prev,
                status: initialFilters.status || '',
                division: initialFilters.division || '',
                project: initialFilters.project || '',
                orderType: initialFilters.orderType || '',
            }));
            if (initialFilters.prefillItem) {
                setItemToPrefill(initialFilters.prefillItem);
                setView('form');
            }
            if (initialFilters.openDetailForId) {
                const requestToOpen = requests.find(r => r.id === initialFilters.openDetailForId);
                if (requestToOpen) {
                    handleShowDetails(requestToOpen);
                }
            }
            onClearInitialFilters();
        }
    }, [initialFilters, onClearInitialFilters, requests]);

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
        let tempRequests = requests
            .filter(req => {
                const searchLower = searchQuery.toLowerCase();
                const projectFilterLower = filters.project.toLowerCase();
                return (
                    (searchQuery ? (
                        req.id.toLowerCase().includes(searchLower) ||
                        req.requester.toLowerCase().includes(searchLower) ||
                        req.division.toLowerCase().includes(searchLower)
                    ) : true) &&
                    (projectFilterLower ? (
                        req.order.project && req.order.project.toLowerCase().includes(projectFilterLower)
                    ) : true)
                );
            })
            .filter(req => {
                if (!filters.status) return true;
                if (filters.status === 'awaiting-approval') {
                    return [ItemStatus.PENDING, ItemStatus.LOGISTIC_APPROVED, ItemStatus.AWAITING_CEO_APPROVAL].includes(req.status);
                }
                if (filters.status === 'urgent-awaiting-approval') {
                    return req.order.type === 'Urgent' && [ItemStatus.PENDING, ItemStatus.LOGISTIC_APPROVED, ItemStatus.AWAITING_CEO_APPROVAL].includes(req.status);
                }
                return req.status === filters.status;
            })
            .filter(req => filters.division ? req.division === filters.division : true)
            .filter(req => filters.orderType ? req.order.type === filters.orderType : true);
        
        // Staff can only see their own requests
        if (currentUser.role === 'Staff' || currentUser.role === 'Leader') {
            tempRequests = tempRequests.filter(req => req.requester === currentUser.name);
        }

        // Prioritize requests for Admins and Super Admins based on unread notifications
        if (['Admin Logistik', 'Admin Purchase', 'Super Admin'].includes(currentUser.role)) {
            const getPriorityScore = (req: Request): number => {
                const unreadNotifs = notifications.filter(n => n.recipientId === currentUser.id && n.referenceId === req.id && !n.isRead);
                if (unreadNotifs.length === 0) return 0;
                if (unreadNotifs.some(n => n.type === 'CEO_DISPOSITION')) return 3;
                if (unreadNotifs.some(n => n.type === 'PROGRESS_UPDATE_REQUEST')) return 2;
                if (unreadNotifs.some(n => n.type === 'FOLLOW_UP')) return 1;
                return 0; // Default
            };
            tempRequests.sort((a, b) => getPriorityScore(b) - getPriorityScore(a));
        }

        return tempRequests;
    }, [requests, searchQuery, filters, currentUser.role, currentUser.name, notifications]);

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
            (req.status === ItemStatus.PENDING && (currentUser.role === 'Admin Purchase' || currentUser.role === 'Super Admin')) ||
            (req.status === ItemStatus.LOGISTIC_APPROVED && currentUser.role === 'Super Admin');

        const canReject = (req: Request) => 
            (req.status === ItemStatus.PENDING || req.status === ItemStatus.LOGISTIC_APPROVED) &&
            (currentUser.role === 'Admin Purchase' || currentUser.role === 'Super Admin');

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
        const dataToExport = sortedRequests.map(req => {
            if (canViewPrice(currentUser.role)) {
                return req;
            }
            const { totalValue, ...rest } = req;
            return rest;
        });
        exportToCSV(dataToExport, `requests_${new Date().toISOString().split('T')[0]}`);
    };
    
    const handleConfirmReview = (adjustments: Record<number, { approvedQuantity: number; reason: string }>) => {
        if (!selectedRequest) return;
    
        setIsLoading(true);
        setTimeout(() => {
            const newItemStatuses = { ...(selectedRequest.itemStatuses || {}) };
            const today = new Date().toISOString();
            let hasAtLeastOneApproval = false;
    
            for (const itemIdStr in adjustments) {
                const itemId = parseInt(itemIdStr, 10);
                const { approvedQuantity, reason } = adjustments[itemId];
                const originalItem = selectedRequest.items.find(i => i.id === itemId);
    
                if (originalItem && approvedQuantity < originalItem.quantity) {
                    newItemStatuses[itemId] = {
                        status: 'rejected',
                        reason: reason,
                        approvedQuantity: approvedQuantity,
                    };
                } else if (newItemStatuses[itemId]) {
                    delete newItemStatuses[itemId]; // Reverted to full approval, so clear status
                }
    
                if (approvedQuantity > 0) {
                    hasAtLeastOneApproval = true;
                }
            }
    
            let nextStatus = selectedRequest.status;
            let approvalUpdates: Partial<Request> = {};
    
            if (!hasAtLeastOneApproval) {
                // All items were rejected
                nextStatus = ItemStatus.REJECTED;
                const rejectorDivision = currentUser.role === 'Super Admin' ? 'Manajemen' : 
                                        currentUser.role === 'Admin Purchase' ? 'Purchase' : 'Logistik';
                approvalUpdates = {
                    rejectionReason: "Semua item ditolak atau kuantitas disetujui adalah 0.",
                    rejectedBy: currentUser.name,
                    rejectionDate: today,
                    rejectedByDivision: rejectorDivision,
                };
            } else {
                // At least one item approved, proceed to next stage
                if (selectedRequest.status === ItemStatus.PENDING) {
                    nextStatus = ItemStatus.LOGISTIC_APPROVED;
                    approvalUpdates = { logisticApprover: currentUser.name, logisticApprovalDate: today };
                } else if (selectedRequest.status === ItemStatus.LOGISTIC_APPROVED) {
                    // Just update the item statuses, but don't change the main status yet.
                    // The Admin Purchase still needs to fill in purchase details.
                    nextStatus = ItemStatus.LOGISTIC_APPROVED;
                    // No approvalUpdates needed here, as we are not changing the approver.
                } else if (selectedRequest.status === ItemStatus.AWAITING_CEO_APPROVAL) {
                    nextStatus = ItemStatus.APPROVED;
                    approvalUpdates = { finalApprover: currentUser.name, finalApprovalDate: today };
                }
            }
    
            const updatedRequest: Request = {
                ...selectedRequest,
                status: nextStatus,
                itemStatuses: newItemStatuses,
                ...approvalUpdates,
            };
    
            setRequests(prev => prev.map(r => r.id === selectedRequest.id ? updatedRequest : r));
            addNotificationUI(`Tinjauan untuk request #${selectedRequest.id} telah disimpan.`, 'success');
            
            setIsLoading(false);
            setIsReviewModalOpen(false);
            
            if (nextStatus === ItemStatus.REJECTED) {
                setView('list');
                setSelectedRequest(null);
            } else {
                setSelectedRequest(updatedRequest); // Update the detail view with the new data
            }
        }, 1000);
    };

    const handleOpenRejectionModal = () => {
        if (!selectedRequest) return;
        setIsReviewModalOpen(true);
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

        const logisticAndSuperAdmins = users.filter(u => u.role === 'Admin Logistik' || u.role === 'Super Admin');
        logisticAndSuperAdmins.forEach(admin => {
            addNotification({
                recipientId: admin.id,
                actorName: currentUser.name,
                type: 'REQUEST_CREATED',
                referenceId: newRequest.id,
            });
        });

        setView('list');
        setItemToPrefill(null);
        if (data.order.type === 'Urgent') {
            addNotificationUI(`Permintaan urgent ${newRequest.id} dibuat!`, 'warning', { duration: 10000 });
        } else {
            addNotificationUI('Request berhasil dibuat!', 'success');
        }
    };

    const handleLogisticApproval = (requestId: string) => {
        setIsLoading(true);
        setTimeout(() => {
            const today = new Date().toISOString();
            let approved = false;
            setRequests(prev => prev.map(req => {
                if (req.id === requestId && req.status === ItemStatus.PENDING) {
                    if (['Admin Logistik', 'Super Admin'].includes(currentUser.role)) {
                        approved = true;
                        
                        const purchaseAdmins = users.filter(u => u.role === 'Admin Purchase');
                        purchaseAdmins.forEach(admin => {
                            addNotification({ recipientId: admin.id, actorName: currentUser.name, type: 'REQUEST_LOGISTIC_APPROVED', referenceId: req.id });
                        });

                        return { ...req, status: ItemStatus.LOGISTIC_APPROVED, logisticApprover: currentUser.name, logisticApprovalDate: today };
                    }
                }
                return req;
            }));

            if(approved) {
                addNotificationUI('Request disetujui oleh Logistik dan diteruskan ke Purchase.', 'success');
                setView('list');
                setSelectedRequest(null);
            } else {
                 addNotificationUI('Aksi tidak diizinkan.', 'error');
            }
            setIsLoading(false);
        }, 800);
    };
    
    const handleSubmitForCeoApproval = (requestId: string, purchaseData: Record<number, Omit<PurchaseDetails, 'filledBy' | 'fillDate'>>) => {
        setIsLoading(true);
        setTimeout(() => {
            const today = new Date().toISOString();
            let submitted = false;
            setRequests(prev => prev.map(req => {
                 if (req.id === requestId && req.status === ItemStatus.LOGISTIC_APPROVED) {
                    if (currentUser.role === 'Admin Purchase') {
                        submitted = true;
                        const superAdmins = users.filter(u => u.role === 'Super Admin');
                        superAdmins.forEach(sa => {
                            addNotification({ recipientId: sa.id, actorName: currentUser.name, type: 'REQUEST_AWAITING_FINAL_APPROVAL', referenceId: req.id });
                        });
                        
                        const newPurchaseDetails: Record<number, PurchaseDetails> = {};
                        for (const itemId in purchaseData) {
                            newPurchaseDetails[itemId] = {
                                ...purchaseData[itemId],
                                filledBy: currentUser.name,
                                fillDate: today
                            };
                        }

                        return { 
                            ...req, 
                            status: ItemStatus.AWAITING_CEO_APPROVAL,
                            purchaseDetails: newPurchaseDetails
                        };
                    }
                }
                return req;
            }));

            if (submitted) {
                addNotificationUI('Detail pembelian disimpan dan permintaan diteruskan ke CEO.', 'success');
                setView('list');
                setSelectedRequest(null);
            } else {
                addNotificationUI('Aksi tidak diizinkan.', 'error');
            }
            setIsLoading(false);
        }, 800);
    };

    const handleFinalCeoApproval = (requestId: string) => {
         setIsLoading(true);
        setTimeout(() => {
            const today = new Date().toISOString();
            let approved = false;

            setRequests(prev => prev.map(req => {
                 if (req.id === requestId && req.status === ItemStatus.AWAITING_CEO_APPROVAL) {
                    if (currentUser.role === 'Super Admin') {
                        approved = true;

                        const purchaseAdmins = users.filter(u => u.role === 'Admin Purchase');
                        purchaseAdmins.forEach(admin => {
                            addNotification({ recipientId: admin.id, actorName: currentUser.name, type: 'REQUEST_FULLY_APPROVED', referenceId: req.id });
                        });
                        
                        const requesterUser = users.find(u => u.name === req.requester);
                        if (requesterUser) {
                            addNotification({ recipientId: requesterUser.id, actorName: currentUser.name, type: 'REQUEST_APPROVED', referenceId: req.id });
                        }

                        return { ...req, status: ItemStatus.APPROVED, finalApprover: currentUser.name, finalApprovalDate: today };
                    }
                 }
                 return req;
            }));

            if(approved) {
                addNotificationUI('Persetujuan final diberikan. Tim Purchase akan melanjutkan proses.', 'success');
                setView('list');
                setSelectedRequest(null);
            } else {
                addNotificationUI('Aksi tidak diizinkan.', 'error');
            }
            setIsLoading(false);
        }, 800);
    };
    
    const handleOpenFollowUpModal = (request: Request) => {
        const now = new Date();
        if (request.lastFollowUpAt) {
            const lastFollowUpDate = new Date(request.lastFollowUpAt);
            const diffHours = (now.getTime() - lastFollowUpDate.getTime()) / (1000 * 60 * 60);
            if (diffHours < 24) {
                addNotificationUI('Anda sudah melakukan follow up hari ini. Silakan coba lagi besok.', 'info');
                return;
            }
        }
        setFollowUpRequest(request);
    };

    const handleConfirmFollowUp = () => {
        if (!followUpRequest) return;

        setIsLoading(true);
        setTimeout(() => {
            const now = new Date();
            if (followUpRequest.lastFollowUpAt) {
                const lastFollowUpDate = new Date(followUpRequest.lastFollowUpAt);
                const diffHours = (now.getTime() - lastFollowUpDate.getTime()) / (1000 * 60 * 60);
                if (diffHours < 24) {
                    addNotificationUI('Anda baru saja melakukan follow up. Coba lagi besok.', 'error');
                    setIsLoading(false);
                    setFollowUpRequest(null);
                    return;
                }
            }
            
            const updatedRequest = { ...followUpRequest, lastFollowUpAt: now.toISOString() };

            setRequests(prev => prev.map(r => r.id === followUpRequest.id ? updatedRequest : r));
            setSelectedRequest(updatedRequest); 

            const admins = users.filter(u => u.role === 'Admin Logistik');
            admins.forEach(admin => {
                addNotification({
                    recipientId: admin.id,
                    actorName: currentUser.name,
                    type: 'FOLLOW_UP',
                    referenceId: followUpRequest.id
                });
            });
            addNotificationUI(`Notifikasi follow-up untuk #${followUpRequest.id} telah dikirim ke Admin Logistik.`, 'success');

            setIsLoading(false);
            setFollowUpRequest(null);
        }, 800);
    };

    const handleFollowUpToCeo = (request: Request) => {
        setRequestForCeoFollowUp(request);
        setIsFollowUpCeoModalOpen(true);
    };

    const handleConfirmFollowUpToCeo = () => {
        if (!requestForCeoFollowUp) return;

        setIsLoading(true);
        setTimeout(() => {
            setRequests(prev => prev.map(r => r.id === requestForCeoFollowUp.id ? { ...r, ceoFollowUpSent: true } : r));

            const superAdmins = users.filter(u => u.role === 'Super Admin');
            superAdmins.forEach(sa => {
                addNotification({
                    recipientId: sa.id,
                    actorName: currentUser.name,
                    type: 'FOLLOW_UP',
                    referenceId: requestForCeoFollowUp.id,
                    message: `meminta follow-up untuk persetujuan final pada request`,
                });
            });
            addNotificationUI(`Notifikasi follow-up untuk #${requestForCeoFollowUp.id} telah dikirim ke CEO.`, 'success');

            setIsLoading(false);
            setIsFollowUpCeoModalOpen(false);
            setRequestForCeoFollowUp(null);
        }, 800);
    };

    const handleCeoDisposition = (requestId: string) => {
        if (!selectedRequest || currentUser.role !== 'Super Admin') return;

        setIsLoading(true);
        setTimeout(() => {
            const dispositionDate = new Date().toISOString();
            const updatedRequest: Request = { 
                ...selectedRequest, 
                isPrioritizedByCEO: true,
                ceoDispositionDate: dispositionDate
            };
            
            setRequests(prev => prev.map(r => r.id === requestId ? updatedRequest : r));
            setSelectedRequest(updatedRequest); // Update modal state immediately
            
            users.filter(u => u.role === 'Admin Purchase' || u.role === 'Admin Logistik').forEach(admin => {
                addNotification({
                    recipientId: admin.id,
                    actorName: currentUser.name,
                    type: 'CEO_DISPOSITION',
                    referenceId: requestId,
                });
            });
            addNotificationUI(`Disposisi prioritas untuk ${requestId} telah dikirim ke tim terkait.`, 'success');
            setIsLoading(false);
        }, 1000);
    };

    const handleRequestProgressUpdate = (requestId: string) => {
        if (currentUser.role !== 'Super Admin') return;
    
        setIsLoading(true);
        setTimeout(() => {
            const updateDate = new Date().toISOString();
            const updatedRequestPartial = {
                progressUpdateRequest: {
                    requestedBy: currentUser.name,
                    requestDate: updateDate,
                    isAcknowledged: false,
                }
            };
    
            setRequests(prev => prev.map(r => r.id === requestId ? { ...r, ...updatedRequestPartial } : r));
            setSelectedRequest(prev => prev ? { ...prev, ...updatedRequestPartial } : null);
            
            users.filter(u => u.role === 'Admin Purchase').forEach(admin => {
                addNotification({
                    recipientId: admin.id,
                    actorName: currentUser.name,
                    type: 'PROGRESS_UPDATE_REQUEST',
                    referenceId: requestId,
                });
            });
            addNotificationUI(`Permintaan update progres untuk #${requestId} telah dikirim.`, 'success');
            setIsLoading(false);
        }, 1000);
    };

    const handleAcknowledgeProgressUpdate = () => {
        if (!selectedRequest || currentUser.role !== 'Admin Purchase') return;
        const requestId = selectedRequest.id;
    
        setIsLoading(true);
        setTimeout(() => {
            const ackDate = new Date().toISOString();
            const updatedRequestPartial = {
                progressUpdateRequest: {
                    ...selectedRequest.progressUpdateRequest!,
                    isAcknowledged: true,
                    acknowledgedBy: currentUser.name,
                    acknowledgedDate: ackDate,
                }
            };
    
            setRequests(prev => prev.map(r => r.id === requestId ? { ...r, ...updatedRequestPartial } : r));
            setSelectedRequest(prev => prev ? { ...prev, ...updatedRequestPartial } : null);
    
            markNotificationsAsRead(requestId); // Clear the notification for the current admin
            addNotificationUI(`Anda telah melihat permintaan update untuk #${requestId}.`, 'success');
            setIsLoading(false);
        }, 1000);
    };


    const handleStartProcurement = () => {
        setIsProcurementModalOpen(true);
    };
    
    const handleConfirmProcurement = () => {
        if (!selectedRequest || !estimatedDelivery) return;
        setIsLoading(true);
        setTimeout(() => {
            let updatedRequest: Request = { 
                ...selectedRequest, 
                status: ItemStatus.PURCHASING,
                estimatedDeliveryDate: estimatedDelivery.toISOString().split('T')[0]
            };
    
            const feedbackUpdates = sendProgressFeedbackNotification(updatedRequest);
            if (feedbackUpdates) {
                updatedRequest = { ...updatedRequest, ...feedbackUpdates };
            }
    
            setRequests(prev => prev.map(r => r.id === selectedRequest.id ? updatedRequest : r));
            addNotificationUI(`Proses pengadaan untuk ${selectedRequest.id} dimulai.`, 'success');
            setIsProcurementModalOpen(false);
            setSelectedRequest(null);
            setView('list');
            setIsLoading(false);
        }, 1000);
    };
    
    const handleUpdateRequestStatus = (newStatus: ItemStatus) => {
        if (!selectedRequest) return;
        setIsLoading(true);
        setTimeout(() => {
            let updatedRequest: Request = { ...selectedRequest, status: newStatus };
            if (newStatus === ItemStatus.IN_DELIVERY) {
                updatedRequest = {
                    ...updatedRequest,
                    actualShipmentDate: new Date().toISOString().split('T')[0],
                };
            }
            if (newStatus === ItemStatus.ARRIVED) {
                updatedRequest = {
                    ...updatedRequest,
                    arrivalDate: new Date().toISOString().split('T')[0],
                    receivedBy: currentUser.name,
                };
            }
    
            const feedbackUpdates = sendProgressFeedbackNotification(updatedRequest);
            if (feedbackUpdates) {
                updatedRequest = { ...updatedRequest, ...feedbackUpdates };
            }
            
            const requesterUser = users.find(u => u.name === updatedRequest.requester);
            if (requesterUser) {
                 addNotification({
                    recipientId: requesterUser.id,
                    actorName: currentUser.name,
                    type: 'STATUS_CHANGE',
                    referenceId: updatedRequest.id,
                    message: `statusnya diubah menjadi "${newStatus}"`
                });
            }
            
            const adminsAndSuperAdmins = users.filter(u => (u.role === 'Admin Purchase' || u.role === 'Super Admin') && u.id !== currentUser.id);
            adminsAndSuperAdmins.forEach(admin => {
                addNotification({
                    recipientId: admin.id,
                    actorName: currentUser.name,
                    type: 'STATUS_CHANGE',
                    referenceId: updatedRequest.id,
                    message: `statusnya diubah menjadi "${newStatus}"`
                });
            });
    
            setRequests(prev => prev.map(r => r.id === selectedRequest.id ? updatedRequest : r));
            addNotificationUI(`Status request ${selectedRequest.id} diubah menjadi "${newStatus}".`, 'success');
            setSelectedRequest(updatedRequest);
            setIsLoading(false);
        }, 1000);
    };
    
    const handleConfirmCancellation = () => {
        if (!selectedRequest) return;

        setIsLoading(true);
        setTimeout(() => {
            setRequests(prev => prev.map(r => r.id === selectedRequest.id ? { ...r, status: ItemStatus.CANCELLED } : r));
            addNotificationUI(`Request ${selectedRequest.id} berhasil dibatalkan.`, 'success');
            setIsLoading(false);
            setIsCancellationModalOpen(false);
            setView('list');
            setSelectedRequest(null);
        }, 1000);
    };
    
    const handleConfirmDelete = () => {
        if (!requestToDeleteId) return;
        setIsLoading(true);
        setTimeout(() => {
            setRequests(prev => prev.filter(r => r.id !== requestToDeleteId));
            addNotificationUI(`Request ${requestToDeleteId} berhasil dihapus.`, 'success');
            setRequestToDeleteId(null);
            setIsLoading(false);
        }, 1000);
    };

    const handleBulkDelete = () => {
        setIsLoading(true);
        setTimeout(() => {
            setRequests(prev => prev.filter(req => !selectedRequestIds.includes(req.id)));
            addNotificationUI(`${selectedRequestIds.length} request berhasil dihapus.`, 'success');
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
                        if (req.status === ItemStatus.PENDING && (currentUser.role === 'Admin Purchase' || currentUser.role === 'Super Admin')) {
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
                addNotificationUI(`${approvedCount} request berhasil disetujui.`, 'success');
            } else {
                addNotificationUI('Tidak ada request yang dapat disetujui dengan role Anda saat ini.', 'error');
            }

            handleCancelBulkMode();
            setBulkApproveConfirmation(false);
            setIsLoading(false);
        }, 1000);
    };

    const handleBulkReject = () => {
        if (!bulkRejectionReason.trim()) {
            addNotificationUI('Alasan penolakan harus diisi.', 'error');
            return;
        }
        setIsLoading(true);
        setTimeout(() => {
            const today = new Date().toISOString().split('T')[0];
            const rejectorDivision = currentUser.role === 'Super Admin' ? 'CEO / Super Admin' : 'Purchase';
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
                 addNotificationUI(`${rejectedCount} request berhasil ditolak.`, 'success');
            } else {
                addNotificationUI('Tidak ada request yang dapat ditolak (mungkin sudah disetujui/ditolak sebelumnya).', 'error');
            }

            handleCancelBulkMode();
            setBulkRejectConfirmation(false);
            setBulkRejectionReason('');
            setIsLoading(false);
        }, 1000);
    };

    const renderContent = () => {
        if (view === 'form') {
            return (
                <div className="p-4 sm:p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl font-bold text-tm-dark">Buat Request Aset Baru</h1>
                        <button onClick={() => setView('list')} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">
                            Kembali ke Daftar
                        </button>
                    </div>
                    <div className="p-4 sm:p-6 bg-white border border-gray-200/80 rounded-xl shadow-md">
                        <RequestForm
                            currentUser={currentUser}
                            assets={assets}
                            assetCategories={assetCategories}
                            divisions={divisions}
                            onCreateRequest={handleCreateRequest}
                            prefillItem={itemToPrefill}
                            openModelModal={openModelModal}
                            openTypeModal={openTypeModal}
                            setActivePage={setActivePage}
                        />
                    </div>
                </div>
            );
        }

        if (view === 'detail' && selectedRequest) {
            return (
                <RequestDetailPage
                    request={selectedRequest}
                    onUpdateRequest={(updatedRequest) => {
                        setRequests(prev => prev.map(r => r.id === updatedRequest.id ? updatedRequest : r));
                        setSelectedRequest(updatedRequest);
                    }}
                    currentUser={currentUser}
                    onBackToList={() => {
                        setView('list');
                        setSelectedRequest(null);
                    }}
                    assets={assets}
                    users={users}
                    assetCategories={assetCategories}
                    onShowPreview={onShowPreview}
                    onOpenRejectionModal={handleOpenRejectionModal}
                    onOpenCancellationModal={() => setIsCancellationModalOpen(true)}
                    onOpenFollowUpModal={handleOpenFollowUpModal}
                    onLogisticApproval={handleLogisticApproval}
                    onSubmitForCeoApproval={handleSubmitForCeoApproval}
                    onFinalCeoApproval={handleFinalCeoApproval}
                    onStartProcurement={handleStartProcurement}
                    onUpdateRequestStatus={handleUpdateRequestStatus}
                    onOpenStaging={setStagingRequest}
                    onCeoDisposition={handleCeoDisposition}
                    onAcknowledgeProgressUpdate={handleAcknowledgeProgressUpdate}
                    onRequestProgressUpdate={handleRequestProgressUpdate}
                    onFollowUpToCeo={handleFollowUpToCeo}
                    onInitiateHandoverFromRequest={onInitiateHandoverFromRequest}
                    // FIX: Pass missing 'divisions' prop to RequestDetailPage
                    divisions={divisions}
                    isLoading={isLoading}
                />
            );
        }

        return (
            <div className="p-4 sm:p-6 md:p-8">
                <div className="flex flex-col items-start justify-between gap-4 mb-6 md:flex-row md:items-center">
                    <h1 className="text-3xl font-bold text-tm-dark">Daftar Request Aset</h1>
                    <div className="flex items-center space-x-2">
                        <button onClick={handleExport} className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border rounded-lg shadow-sm hover:bg-gray-50">
                            <ExportIcon className="w-4 h-4"/> Export CSV
                        </button>
                        <button onClick={() => setView('form')} className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 rounded-lg shadow-sm bg-tm-primary hover:bg-tm-primary-hover">
                            Buat Request Baru
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
                                placeholder="Cari ID, pemohon, atau divisi..."
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
                                    <div className="fixed top-32 inset-x-4 z-30 origin-top rounded-xl border border-gray-200 bg-white shadow-lg sm:absolute sm:top-full sm:inset-x-auto sm:right-0 sm:mt-2 sm:w-80">
                                        <div className="flex items-center justify-between p-4 border-b">
                                            <h3 className="text-lg font-semibold text-gray-800">Filter Request</h3>
                                            <button onClick={() => setIsFilterPanelOpen(false)} className="p-1 text-gray-400 rounded-full hover:bg-gray-100"><CloseIcon className="w-5 h-5"/></button>
                                        </div>
                                        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                                                <CustomSelect options={[{value: '', label: 'Semua Status'}, ...statusOptions]} value={tempFilters.status} onChange={v => setTempFilters(f => ({...f, status: v}))} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Tipe Order</label>
                                                <CustomSelect options={[{value: '', label: 'Semua Tipe'}, ...orderTypeOptions]} value={tempFilters.orderType} onChange={v => setTempFilters(f => ({...f, orderType: v}))} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Divisi</label>
                                                <CustomSelect options={[{value: '', label: 'Semua Divisi'}, ...divisionOptions]} value={tempFilters.division} onChange={v => setTempFilters(f => ({...f, division: v}))} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Proyek</label>
                                                <input type="text" placeholder="Cari nama proyek..." value={tempFilters.project} onChange={e => setTempFilters(f => ({...f, project: e.target.value}))} className="w-full h-10 py-2 px-4 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-tm-accent focus:border-tm-accent" />
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
                            {selectedRequestIds.length > 0 ? (
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="text-sm font-medium text-tm-primary">{selectedRequestIds.length} item terpilih</span>
                                    <div className="h-5 border-l border-gray-300"></div>
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
                                        className="px-3 py-1.5 text-sm font-semibold text-danger-text bg-danger-light rounded-md hover:bg-red-200 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                                    >
                                        Tolak {actionableCounts.rejectCount > 0 ? `(${actionableCounts.rejectCount})` : ''}
                                    </button>
                                    <button
                                        onClick={() => setBulkDeleteConfirmation(true)}
                                        disabled={actionableCounts.deleteCount === 0}
                                        className="px-3 py-1.5 text-sm font-semibold text-red-600 bg-red-100 rounded-md hover:bg-red-200 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
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
                            currentUser={currentUser}
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
                            notifications={notifications}
                            onFollowUpClick={handleOpenFollowUpModal}
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
        <div className={view === 'form' ? 'pb-24' : ''}>
            {renderContent()}

            {isFollowUpCeoModalOpen && (
                <FollowUpConfirmationModal
                    request={requestForCeoFollowUp}
                    onClose={() => setIsFollowUpCeoModalOpen(false)}
                    onConfirm={handleConfirmFollowUpToCeo}
                    isLoading={isLoading}
                    title="Konfirmasi Follow Up ke CEO"
                    message={
                         <p>
                            Anda akan mengirimkan notifikasi follow-up untuk persetujuan final request <strong className="font-semibold text-gray-900">#{requestForCeoFollowUp?.id}</strong> kepada Super Admin/CEO.
                        </p>
                    }
                    zIndex="z-[70]"
                />
            )}
            
            <FollowUpConfirmationModal
                request={followUpRequest}
                onClose={() => setFollowUpRequest(null)}
                onConfirm={handleConfirmFollowUp}
                isLoading={isLoading}
                title="Konfirmasi Follow Up Profesional"
                message={
                    <p>
                        Anda akan mengirimkan notifikasi follow-up untuk request <strong className="font-semibold text-gray-900">#{followUpRequest?.id}</strong> kepada tim Procurement.
                    </p>
                }
                zIndex="z-[70]"
            />

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
            
            {isProcurementModalOpen && (
                <Modal
                    isOpen={isProcurementModalOpen}
                    onClose={() => { setIsProcurementModalOpen(false); }}
                    title={`Mulai Pengadaan untuk ${selectedRequest?.id}`}
                    size="md"
                    hideDefaultCloseButton
                    footerContent={
                        <>
                            <button onClick={() => { setIsProcurementModalOpen(false); }} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Batal</button>
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

            {isReviewModalOpen && selectedRequest && (
                 <RequestReviewModal
                    isOpen={isReviewModalOpen}
                    onClose={() => {
                        setIsReviewModalOpen(false);
                    }}
                    request={selectedRequest}
                    onConfirm={handleConfirmReview}
                    isLoading={isLoading}
                />
            )}

            {selectedRequest && (
                <Modal
                    isOpen={isCancellationModalOpen}
                    onClose={() => setIsCancellationModalOpen(false)}
                    title="Konfirmasi Pembatalan"
                    size="md"
                    hideDefaultCloseButton
                    footerContent={
                        <div className="flex items-center space-x-3">
                            <button onClick={() => setIsCancellationModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Tidak</button>
                            <button onClick={handleConfirmCancellation} disabled={isLoading} className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-danger rounded-lg shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-400">
                                {isLoading && <SpinnerIcon className="w-5 h-5 mr-2"/>}
                                Ya, Batalkan
                            </button>
                        </div>
                    }
                >
                    <p className="text-sm text-center text-gray-600">Anda yakin ingin membatalkan permintaan <strong>{selectedRequest.id}</strong>? Tindakan ini tidak dapat diurungkan.</p>
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
                            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-danger rounded-lg shadow-sm hover:bg-red-400"
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
                                Request berstatus <span className="font-semibold text-info-text">'Disetujui Logistik'</span> akan diubah menjadi <span className="font-semibold text-success-text">'Disetujui'</span>. Request bernilai tinggi juga akan disetujui.
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
        </div>
    );
};

export default ItemRequestPage;
