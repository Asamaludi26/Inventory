


import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Page, User, Asset, Request, Handover, Dismantle, ItemStatus, AssetStatus, Customer, CustomerStatus, ActivityLogEntry, PreviewData, AssetCategory, Division, StandardItem, AssetType, RequestItem, ParsedScanResult, Notification, AssetCondition, Attachment } from './types';
import { Sidebar } from './components/layout/Sidebar';
import DashboardPage from './features/dashboard/DashboardPage';
import ItemRequestPage from './features/itemRequest/ItemRequestPage';
import ItemRegistration from './features/assetRegistration/RegistrationPage';
import ItemHandoverPage from './features/handover/HandoverPage';
import ItemDismantlePage from './features/dismantle/ItemDismantlePage';
import AccountsPage from './features/users/AccountsPage';
import CustomerManagementPage from './features/customers/CustomerManagementPage';
import { MenuIcon } from './components/icons/MenuIcon';
import { NotificationProvider, useNotification } from './providers/NotificationProvider';
import Modal from './components/ui/Modal';
import { QrCodeIcon } from './components/icons/QrCodeIcon';
import { CheckIcon } from './components/icons/CheckIcon';
import StockOverviewPage from './features/stock/StockOverviewPage';
import PreviewModal from './features/preview/PreviewModal';
import CategoryManagementPage from './features/categories/CategoryManagementPage';
import { ModelManagementModal } from './components/ui/ModelManagementModal';
import { TypeManagementModal } from './components/ui/TypeManagementModal';
import LoginPage from './features/auth/LoginPage';
import { LogoutIcon } from './components/icons/LogoutIcon';
import { ChevronDownIcon } from './components/icons/ChevronDownIcon';
import { SpinnerIcon } from './components/icons/SpinnerIcon';
import * as api from './services/api';
import { ExclamationTriangleIcon } from './components/icons/ExclamationTriangleIcon';
import { BellIcon } from './components/icons/BellIcon';
import { InboxIcon } from './components/icons/InboxIcon';
import { Avatar } from './components/ui/Avatar';
import { RequestIcon } from './components/icons/RequestIcon';
import { MegaphoneIcon } from './components/icons/MegaphoneIcon';
import { InfoIcon } from './components/icons/InfoIcon';
import { CloseIcon } from './components/icons/CloseIcon';
import { parseScanData } from './utils/scanner';
import ReportDamageModal from './features/stock/components/ReportDamageModal';
// FIX: Import AddProgressUpdateModal, which was missing.
import { StartRepairModal, CompleteRepairModal, DecommissionConfirmationModal, AddProgressUpdateModal } from './features/stock/components/RepairModals';
import { WrenchIcon } from './components/icons/WrenchIcon';
import RepairManagementPage from './features/repair/RepairManagementPage';
import { RegisterIcon } from './components/icons/RegisterIcon';


declare var Html5Qrcode: any;
declare var Html5QrcodeSupportedFormats: any;

const getRoleClass = (role: User['role']) => {
    switch(role) {
        case 'Super Admin': return 'bg-purple-100 text-purple-800';
        // FIX: Replaced 'Admin' with specific admin roles to align with UserRole type.
        case 'Inventory Admin': return 'bg-info-light text-info-text';
        case 'Procurement Admin': return 'bg-teal-100 text-teal-800';
        case 'Manager': return 'bg-sky-100 text-sky-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

const InstallToCustomerModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    asset: Asset | null;
    customers: Customer[];
    onConfirm: (customerId: string) => void;
}> = ({ isOpen, onClose, asset, customers, onConfirm }) => {
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && customers.length > 0) {
            setSelectedCustomerId(customers.find(c => c.status === CustomerStatus.ACTIVE)?.id || customers[0].id);
        }
    }, [customers, isOpen]);

    const handleConfirm = () => {
        setIsLoading(true);
        setTimeout(() => { // Simulate API Call
            onConfirm(selectedCustomerId);
            setIsLoading(false);
            onClose();
        }, 1000);
    };

    if (!asset) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Pasang Aset ke Pelanggan"
            size="md"
            hideDefaultCloseButton={true}
            footerContent={
                <>
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Kembali</button>
                    <button onClick={handleConfirm} disabled={!selectedCustomerId || isLoading} className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm bg-tm-primary hover:bg-tm-primary-hover disabled:bg-tm-primary/70">
                        {isLoading && <SpinnerIcon className="w-4 h-4 mr-2" />}
                        Konfirmasi Pemasangan
                    </button>
                </>
            }
        >
            <div className="space-y-4 text-sm">
                <p className="text-gray-600">Anda akan memasang aset berikut:</p>
                <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-semibold text-tm-dark">{asset.name}</p>
                    <p className="text-xs text-gray-500">{asset.id} &bull; SN: {asset.serialNumber}</p>
                </div>
                <div>
                    <label id="customer-listbox-label" className="block text-sm font-medium text-gray-700">Pilih Pelanggan</label>
                    <div
                        role="listbox"
                        aria-labelledby="customer-listbox-label"
                        tabIndex={0}
                        className="w-full h-48 mt-1 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-sm custom-scrollbar focus:outline-none focus:ring-2 focus:ring-tm-accent"
                    >
                        {customers.filter(c => c.status === CustomerStatus.ACTIVE).map(c => (
                            <div
                                key={c.id}
                                role="option"
                                aria-selected={c.id === selectedCustomerId}
                                onClick={() => setSelectedCustomerId(c.id)}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedCustomerId(c.id); }}
                                className={`flex items-center justify-between px-3 py-2 text-sm cursor-pointer transition-colors ${
                                    c.id === selectedCustomerId
                                        ? 'bg-tm-primary text-white'
                                        : 'text-gray-900 hover:bg-tm-light'
                                }`}
                            >
                                <span>{c.name} ({c.id})</span>
                                {c.id === selectedCustomerId && (
                                    <CheckIcon className="w-5 h-5 text-white" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

const GlobalScannerModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onScanSuccess: (parsedData: ParsedScanResult) => void;
}> = ({ isOpen, onClose, onScanSuccess }) => {
    const scannerRef = useRef<any>(null);
    const addNotification = useNotification();
    const [isSuccess, setIsSuccess] = useState(false);
    const [scanResult, setScanResult] = useState<ParsedScanResult | null>(null);

    useEffect(() => {
        if (isOpen && typeof Html5Qrcode !== 'undefined') {
            setIsSuccess(false);
            setScanResult(null);
            const html5QrCode = new Html5Qrcode("global-qr-reader");
            scannerRef.current = html5QrCode;
            
            const successCallback = (decodedText: string, decodedResult: any) => {
                if (scannerRef.current?.isScanning) {
                    const parsed = parseScanData(decodedText);
                    setScanResult(parsed);
                    setIsSuccess(true);
                    
                    scannerRef.current.stop();
                    setTimeout(() => onScanSuccess(parsed), 800); // Delay for visual feedback
                }
            };

            const config = {
                fps: 10,
                qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
                    const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
                    const qrboxSize = Math.floor(minEdge * 0.7);
                    return { width: qrboxSize, height: qrboxSize };
                },
                formatsToSupport: [
                    Html5QrcodeSupportedFormats.QR_CODE,
                    Html5QrcodeSupportedFormats.CODE_128,
                    Html5QrcodeSupportedFormats.EAN_13,
                    Html5QrcodeSupportedFormats.UPC_A,
                    Html5QrcodeSupportedFormats.EAN_8,
                ],
                experimentalFeatures: {
                    useBarCodeDetectorIfSupported: true
                }
            };

            html5QrCode.start(
                { facingMode: "environment" },
                config,
                successCallback,
                (errorMessage: string) => {} // error callback
            ).catch(err => {
                addNotification('Gagal memulai kamera. Pastikan izin telah diberikan.', 'error');
                console.error("Unable to start scanning.", err);
                onClose();
            });
        }

        return () => {
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().catch((err: any) => console.error("Error stopping scanner:", err));
            }
        };
    }, [isOpen, onScanSuccess, onClose, addNotification]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Pindai Kode QR atau Barcode" size="md">
            <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-black">
                <div id="global-qr-reader" className="w-full h-full"></div>
                 {isSuccess && scanResult ? (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white text-center p-4 animate-fade-in-down">
                        <CheckIcon className="w-16 h-16 text-green-400 mb-4" />
                        <h3 className="text-lg font-bold">Pindai Berhasil</h3>
                        {scanResult.name && <p className="mt-2 text-base">{scanResult.name}</p>}
                        {scanResult.id && <p className="text-sm font-mono text-gray-300">{scanResult.id}</p>}
                        {scanResult.serialNumber && !scanResult.id && <p className="text-sm font-mono text-gray-300">SN: {scanResult.serialNumber}</p>}
                    </div>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative w-[70%] h-[70%]">
                            <div className="absolute inset-0 border-4 rounded-lg border-white/50"></div>
                            <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 rounded-tl-lg border-white"></div>
                            <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 rounded-tr-lg border-white"></div>
                            <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 rounded-bl-lg border-white"></div>
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 rounded-br-lg border-white"></div>
                        </div>
                    </div>
                )}
            </div>
            <p className="mt-4 text-sm text-center text-gray-600">Posisikan Kode QR atau Barcode di dalam kotak.</p>
        </Modal>
    );
};

const NotificationBell: React.FC<{
    currentUser: User;
    users: User[];
    notifications: Notification[];
    setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
    requests: Request[];
    setActivePage: (page: Page, filters?: any) => void;
    onShowPreview: (data: PreviewData) => void;
}> = ({ currentUser, users, notifications, setNotifications, requests, setActivePage, onShowPreview }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const myNotifications = useMemo(() => 
        notifications
            .filter(n => n.recipientId === currentUser.id)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [notifications, currentUser.id]);

    const unreadCount = useMemo(() => myNotifications.filter(n => !n.isRead).length, [myNotifications]);

    const handleMarkAsRead = (notificationId: string) => {
        setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
    };

    const handleMarkAllAsRead = () => {
        setNotifications(prev => prev.map(n => n.recipientId === currentUser.id ? { ...n, isRead: true } : n));
    };

    const handleNotificationClick = (notification: Notification) => {
        handleMarkAsRead(notification.id);
        if (notification.type.startsWith('REQUEST_') || ['FOLLOW_UP', 'CEO_DISPOSITION', 'PROGRESS_UPDATE_REQUEST', 'PROGRESS_FEEDBACK', 'STATUS_CHANGE'].includes(notification.type)) {
             setActivePage('request', { openDetailForId: notification.referenceId });
        } else if (notification.type.startsWith('ASSET_') || ['REPAIR_STARTED', 'REPAIR_COMPLETED', 'REPAIR_PROGRESS_UPDATE'].includes(notification.type)) {
            onShowPreview({type: 'asset', id: notification.referenceId});
        }
        setIsOpen(false);
    };
    
    const getNotificationDetails = (notification: Notification) => {
        const actor = users.find(u => u.name === notification.actorName);
        let message = notification.message || '';
        let Icon = InfoIcon;

        switch (notification.type) {
            case 'REQUEST_CREATED': message = `membuat request baru`; Icon = RequestIcon; break;
            case 'REQUEST_AWAITING_FINAL_APPROVAL': message = `menyetujui request, butuh approval final untuk`; Icon = CheckIcon; break;
            case 'REQUEST_FULLY_APPROVED': message = `memberikan approval final untuk`; Icon = CheckIcon; break;
            case 'REQUEST_COMPLETED': message = `telah menyelesaikan registrasi aset untuk`; Icon = RegisterIcon; break;
            case 'FOLLOW_UP': message = `meminta follow-up untuk request`; Icon = BellIcon; break;
            case 'CEO_DISPOSITION': message = `memprioritaskan request`; Icon = MegaphoneIcon; break;
            case 'PROGRESS_UPDATE_REQUEST': message = `meminta update progres untuk request`; Icon = InfoIcon; break;
            case 'PROGRESS_FEEDBACK': message = `memberikan update progres untuk`; Icon = CheckIcon; break;
            case 'STATUS_CHANGE': message = `mengubah status request`; Icon = RequestIcon; break;
            case 'REQUEST_APPROVED': message = `menyetujui request Anda`; Icon = CheckIcon; break;
            case 'REQUEST_REJECTED': message = `menolak request Anda`; Icon = CloseIcon; break;
            case 'ASSET_DAMAGED_REPORT': message = `melaporkan kerusakan pada aset`; Icon = WrenchIcon; break;
            case 'REPAIR_STARTED': message = `memulai perbaikan untuk aset Anda`; Icon = SpinnerIcon; break;
            case 'REPAIR_COMPLETED': message = `menyelesaikan perbaikan untuk aset Anda`; Icon = CheckIcon; break;
            case 'REPAIR_PROGRESS_UPDATE': message = `memberi update progres perbaikan aset`; Icon = InfoIcon; break;
            case 'ASSET_DECOMMISSIONED': message = `memberhentikan aset Anda yang rusak berat`; Icon = ExclamationTriangleIcon; break;
        }

        const fullMessage = (
            <>
                <strong className="font-semibold text-gray-900">{notification.actorName}</strong> {message} <strong className="font-semibold text-gray-900">#{notification.referenceId}</strong>.
            </>
        );

        return { actor, fullMessage, Icon };
    };
    
    const formatRelativeTime = (isoDate: string) => {
        const date = new Date(isoDate);
        const now = new Date();
        const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);
        if (diffSeconds < 60) return `${diffSeconds}d lalu`;
        const diffMinutes = Math.round(diffSeconds / 60);
        if (diffMinutes < 60) return `${diffMinutes}m lalu`;
        const diffHours = Math.round(diffMinutes / 60);
        if (diffHours < 24) return `${diffHours}j lalu`;
        return `${Math.round(diffHours / 24)}h lalu`;
    };


    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(prev => !prev)}
                className="relative p-2 text-gray-500 rounded-full hover:bg-gray-100 hover:text-tm-primary"
                title={`${unreadCount} notifikasi belum dibaca`}
            >
                <BellIcon className="w-6 h-6" />
                {unreadCount > 0 && (
                     <span className="absolute top-1 right-1 flex h-5 w-5">
                        <span className="absolute inline-flex w-full h-full bg-red-400 rounded-full opacity-75 animate-ping"></span>
                        <span className="relative inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">{unreadCount}</span>
                    </span>
                )}
            </button>
            {isOpen && (
                <div className="absolute right-0 z-30 w-96 mt-2 origin-top-right bg-white border border-gray-200 rounded-xl shadow-lg animate-zoom-in">
                    <div className="flex items-center justify-between p-4 border-b">
                        <h3 className="text-base font-semibold text-gray-800">Notifikasi</h3>
                        {unreadCount > 0 && (
                            <button onClick={handleMarkAllAsRead} className="text-xs font-semibold text-tm-primary hover:underline">
                                Tandai semua terbaca
                            </button>
                        )}
                    </div>
                    <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                        {myNotifications.length > 0 ? (
                            myNotifications.map(notif => {
                                const { actor, fullMessage, Icon } = getNotificationDetails(notif);
                                return (
                                <div
                                    key={notif.id}
                                    onClick={() => handleNotificationClick(notif)}
                                    className={`relative flex items-start gap-4 p-4 border-b cursor-pointer last:border-b-0 transition-colors ${!notif.isRead ? 'bg-blue-50/50 hover:bg-blue-50' : 'hover:bg-gray-50'}`}
                                >
                                    {!notif.isRead && <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-2 h-2 bg-tm-primary rounded-full"></span>}
                                    <Avatar name={notif.actorName} className="w-9 h-9 text-xs flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-600">{fullMessage}</p>
                                        <time className="block mt-1 text-xs font-medium text-gray-400">{formatRelativeTime(notif.timestamp)}</time>
                                    </div>
                                    <Icon className={`w-5 h-5 text-gray-400 flex-shrink-0 mt-1 ${notif.type === 'REPAIR_STARTED' ? 'animate-spin' : ''}`} />
                                </div>
                            )})
                        ) : (
                            <div className="p-8 text-sm text-center text-gray-500">
                                <InboxIcon className="w-12 h-12 mx-auto text-gray-300" />
                                <p className="mt-3 font-semibold text-gray-700">Tidak ada notifikasi</p>
                                <p className="mt-1">Semua notifikasi Anda akan muncul di sini.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};


const AppContent: React.FC<{ currentUser: User; onLogout: () => void; }> = ({ currentUser, onLogout }) => {
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pageInitialState, setPageInitialState] = useState<any>(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // --- Data States ---
  const [assets, setAssets] = useState<Asset[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [handovers, setHandovers] = useState<Handover[]>([]);
  const [dismantles, setDismantles] = useState<Dismantle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [assetCategories, setAssetCategories] = useState<AssetCategory[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // --- UI/App Status States ---
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for pre-filling forms & cross-module modals
  const [prefillRegData, setPrefillRegData] = useState<{ request: Request; itemToRegister?: RequestItem } | null>(null);
  const [prefillHoData, setPrefillHoData] = useState<Asset | Request | null>(null);
  const [prefillDmData, setPrefillDmData] = useState<Asset | null>(null);
  const [assetToInstall, setAssetToInstall] = useState<Asset | null>(null);
  const [isGlobalScannerOpen, setIsGlobalScannerOpen] = useState(false);
  // State to show a specific asset detail modal after a QR scan.
  const [assetToViewId, setAssetToViewId] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [itemToEdit, setItemToEdit] = useState<{ type: string; data: any } | null>(null);
  
  // QR Scanner context state
  const [scanContext, setScanContext] = useState<'global' | 'form'>('global');
  const [formScanCallback, setFormScanCallback] = useState<((data: ParsedScanResult) => void) | null>(null);

  // Asset Damage Report Flow Modals
  const [assetToReport, setAssetToReport] = useState<Asset | null>(null);
  const [assetToStartRepair, setAssetToStartRepair] = useState<Asset | null>(null);
  const [assetToCompleteRepair, setAssetToCompleteRepair] = useState<Asset | null>(null);
  const [assetToDecommission, setAssetToDecommission] = useState<Asset | null>(null);
  const [assetToUpdateProgress, setAssetToUpdateProgress] = useState<Asset | null>(null);


  // State for global management modals
  const [modelModalState, setModelModalState] = useState<{ category: AssetCategory; type: AssetType; onModelAdded?: (model: StandardItem) => void } | null>(null);
  const [typeModalState, setTypeModalState] = useState<{ category: AssetCategory; typeToEdit: AssetType | null, onTypeAdded?: (type: AssetType) => void } | null>(null);

  
  const addNotification = useNotification();

    // Data fetching on initial load
    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await api.fetchAllData();
                setAssets(data.assets);
                setRequests(data.requests);
                setHandovers(data.handovers);
                setDismantles(data.dismantles);
                setCustomers(data.customers);
                setUsers(data.users);
                setDivisions(data.divisions);
                setAssetCategories(data.assetCategories);
                setNotifications(data.notifications);

            } catch (err: any) {
                setError(err.message || 'Gagal memuat data aplikasi. Silakan coba muat ulang halaman.');
                addNotification('Gagal memuat data aplikasi.', 'error');
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [addNotification]);
    
    // Smart Background Scanning for external devices
    useEffect(() => {
        let scanBuffer = '';
        let lastKeyTime = Date.now();

        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
                return;
            }
            if (Date.now() - lastKeyTime > 100) {
                scanBuffer = '';
            }
            lastKeyTime = Date.now();

            if (e.key === 'Enter') {
                if (scanBuffer.length > 3) {
                    const parsedData = parseScanData(scanBuffer);
                    
                    let asset: Asset | undefined;
                    if (parsedData.id) {
                        asset = assets.find(a => a.id === parsedData.id);
                    } else if (parsedData.serialNumber) {
                        asset = assets.find(a => a.serialNumber === parsedData.serialNumber);
                    }

                    if (asset) {
                        setPreviewData({ type: 'asset', id: asset.id });
                        addNotification(`Aset ${asset.id} ditemukan via pindaian.`, 'success');
                    } else {
                        addNotification(`Aset dengan kode "${scanBuffer}" tidak ditemukan.`, 'error');
                    }
                }
                scanBuffer = '';
            } else if (e.key.length === 1) {
                scanBuffer += e.key;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [assets, addNotification]);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
                setIsProfileDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

  const handleSetActivePage = (page: Page, initialState: any = null) => {
    const preservePrefillReg = page === 'registration';
    const preservePrefillHo = page === 'handover';
    const preservePrefillDm = page === 'dismantle';
    const preserveItemToEdit = page === 'registration' || page === 'customers';
    const preserveAssetToView = page === 'registration';
    
    if (!preservePrefillReg) setPrefillRegData(null);
    if (!preservePrefillHo) setPrefillHoData(null);
    if (!preservePrefillDm) setPrefillDmData(null);
    if (!preserveItemToEdit) setItemToEdit(null);
    if (!preserveAssetToView) setAssetToViewId(null);
    
    setPageInitialState(initialState);
    setActivePage(page);
  };

  const clearPageInitialState = useCallback(() => {
    setPageInitialState(null);
  }, []);

  const handleEditItem = (data: PreviewData) => {
    setPreviewData(null);
    
    switch (data.type) {
      case 'asset': {
        const asset = assets.find(a => a.id === data.id);
        if (asset) {
          setItemToEdit({ type: 'asset', data: asset });
          handleSetActivePage('registration');
        }
        break;
      }
      case 'customer': {
        const customer = customers.find(c => c.id === data.id);
        if (customer) {
          setItemToEdit({ type: 'customer', data: customer });
          handleSetActivePage('customers');
        }
        break;
      }
      default:
        addNotification(`Fungsi edit belum tersedia untuk tipe ${data.type}.`, 'error');
    }
  };

    const setAndPersist = <T,>(
        setter: React.Dispatch<React.SetStateAction<T>>,
        valueOrFn: React.SetStateAction<T>,
        key: string
    ) => {
        setter(prevState => {
            const newState = typeof valueOrFn === 'function'
                ? (valueOrFn as (prevState: T) => T)(prevState)
                : valueOrFn;
            
            api.updateData(key, newState);
            
            return newState;
        });
    };

    const addAppNotification = (notificationData: Partial<Notification> & { recipientId: number, actorName: string, type: Notification['type'], referenceId: string }) => {
        const newNotification: Notification = {
            id: `notif-${Date.now()}-${Math.random()}`,
            isRead: false,
            timestamp: new Date().toISOString(),
            ...notificationData,
        };
        setAndPersist(setNotifications, (prev: Notification[]) => [newNotification, ...prev], 'app_notifications');
    };

    const markNotificationsAsRead = (referenceId: string) => {
        setAndPersist(setNotifications, (prev: Notification[]) => 
            prev.map(n => 
                (n.recipientId === currentUser.id && n.referenceId === referenceId && !n.isRead)
                ? { ...n, isRead: true }
                : n
            ),
        'app_notifications');
    };


    const handleUpdateAsset = (assetId: string, updates: Partial<Asset>, logEntry?: Omit<ActivityLogEntry, 'id' | 'timestamp'>) => {
        const updatedAssets = assets.map(asset => {
            if (asset.id === assetId) {
                const updatedAsset = { ...asset, ...updates };
                if (logEntry) {
                    const newLog: ActivityLogEntry = {
                        ...logEntry,
                        id: `log-${assetId}-${Date.now()}`,
                        timestamp: new Date().toISOString(),
                    };
                    updatedAsset.activityLog = [...(asset.activityLog || []), newLog];
                }
                return updatedAsset;
            }
            return asset;
        });
        setAndPersist(setAssets, updatedAssets, 'app_assets');
    };

  const handleGlobalScanSuccess = (parsedData: ParsedScanResult) => {
    setIsGlobalScannerOpen(false);
    
    if (scanContext === 'form' && formScanCallback) {
        formScanCallback(parsedData);
    } else {
        let asset: Asset | undefined;
        if (parsedData.id) asset = assets.find(a => a.id === parsedData.id);
        else if (parsedData.serialNumber) asset = assets.find(a => a.serialNumber === parsedData.serialNumber);

        if (asset) {
            setPreviewData({ type: 'asset', id: asset.id });
            addNotification(`Aset ${asset.id} ditemukan.`, 'success');
        } else {
            addNotification(`Kode QR/Barcode tidak valid atau aset tidak ditemukan.`, 'error');
        }
    }
    setScanContext('global');
    setFormScanCallback(null);
  };
  
  const handleOpenModelModal = (category: AssetCategory, type: AssetType, onModelAdded?: (model: StandardItem) => void) => {
    setModelModalState({ category, type, onModelAdded });
  };
  
  const handleSaveModel = (parentInfo: { category: AssetCategory; type: AssetType }, modelData: Omit<StandardItem, 'id'>, id?: number) => {
    let savedModel: StandardItem | undefined;
    let updatedCategory: AssetCategory | undefined;
    let updatedType: AssetType | undefined;

    const newCategories = assetCategories.map(cat => {
        if (cat.id === parentInfo.category.id) {
            const newTypes = cat.types.map(t => {
                if (t.id === parentInfo.type.id) {
                    let updatedItems;
                    if (id) {
                        updatedItems = (t.standardItems || []).map(item => item.id === id ? { ...item, ...modelData } : item);
                        savedModel = updatedItems.find(item => item.id === id);
                        addNotification(`Model "${modelData.name}" berhasil diperbarui.`, 'success');
                    } else {
                        const newItem: StandardItem = { ...modelData, id: Date.now() };
                        savedModel = newItem;
                        updatedItems = [...(t.standardItems || []), newItem];
                        addNotification(`Model "${modelData.name}" berhasil ditambahkan.`, 'success');
                    }
                    updatedType = { ...t, standardItems: updatedItems };
                    return updatedType;
                }
                return t;
            });
            updatedCategory = { ...cat, types: newTypes };
            return updatedCategory;
        }
        return cat;
    });
    
    setAndPersist(setAssetCategories, newCategories, 'app_assetCategories');

    if (modelModalState && updatedCategory && updatedType && !modelModalState.onModelAdded) {
        setModelModalState(prev => (prev ? { ...prev, category: updatedCategory, type: updatedType } : null));
    }
    if (savedModel && modelModalState?.onModelAdded) {
        modelModalState.onModelAdded(savedModel);
    }
    if (modelModalState?.onModelAdded) {
      setModelModalState(null);
    }
  };

  const handleDeleteModel = (parentInfo: { category: AssetCategory, type: AssetType }, modelToDelete: StandardItem) => {
    let updatedCategory: AssetCategory | undefined;
    let updatedType: AssetType | undefined;

    const newCategories = assetCategories.map(cat => {
        if (cat.id === parentInfo.category.id) {
            const newTypes = cat.types.map(t => {
                if (t.id === parentInfo.type.id) {
                    updatedType = { ...t, standardItems: (t.standardItems || []).filter(item => item.id !== modelToDelete.id) };
                    return updatedType;
                }
                return t;
            });
            updatedCategory = { ...cat, types: newTypes };
            return updatedCategory;
        }
        return cat;
    });
    setAndPersist(setAssetCategories, newCategories, 'app_assetCategories');

    if (modelModalState && updatedCategory && updatedType && !modelModalState.onModelAdded) {
        setModelModalState(prev => (prev ? { ...prev, category: updatedCategory, type: updatedType } : null));
    }
    addNotification(`Model "${modelToDelete.name}" berhasil dihapus.`, 'success');
  }

  const handleOpenTypeModal = (category: AssetCategory, typeToEdit: AssetType | null = null, onTypeAdded?: (type: AssetType) => void) => {
    setTypeModalState({ category, typeToEdit, onTypeAdded });
  };
  
  const handleSaveType = (parentCategory: AssetCategory, typeData: Omit<AssetType, 'id' | 'standardItems'>, typeId?: number) => {
    let savedType: AssetType | undefined;
    let updatedCategory: AssetCategory | undefined;

    const newCategories = assetCategories.map(cat => {
        if (cat.id === parentCategory.id) {
            let updatedTypes;
            if (typeId) {
                updatedTypes = cat.types.map(t => t.id === typeId ? { ...t, ...typeData } : t);
                savedType = updatedTypes.find(t => t.id === typeId);
                addNotification(`Tipe "${typeData.name}" berhasil diperbarui.`, 'success');
            } else {
                const newType: AssetType = { ...typeData, id: Date.now(), standardItems: [] };
                savedType = newType;
                updatedTypes = [...cat.types, newType];
                addNotification(`Tipe "${typeData.name}" berhasil ditambahkan.`, 'success');
            }
            updatedCategory = { ...cat, types: updatedTypes };
            return updatedCategory;
        }
        return cat;
    });
    setAndPersist(setAssetCategories, newCategories, 'app_assetCategories');

    if (typeModalState && updatedCategory && !typeModalState.onTypeAdded) { 
        setTypeModalState(prev => (prev ? { ...prev, category: updatedCategory, typeToEdit: null } : null));
    }
    if (savedType && typeModalState?.onTypeAdded) {
        typeModalState.onTypeAdded(savedType);
    }
    if (typeModalState?.onTypeAdded) {
      setTypeModalState(null);
    }
  };

  const handleDeleteType = (parentCategory: AssetCategory, typeToDelete: AssetType) => {
    let updatedCategory: AssetCategory | undefined;
    const newCategories = assetCategories.map(cat => {
        if (cat.id === parentCategory.id) {
            updatedCategory = { ...cat, types: cat.types.filter(t => t.id !== typeToDelete.id) };
            return updatedCategory;
        }
        return cat;
    });
    setAndPersist(setAssetCategories, newCategories, 'app_assetCategories');

    if (typeModalState && updatedCategory && !typeModalState.onTypeAdded) {
        setTypeModalState(prev => (prev ? { ...prev, category: updatedCategory } : null));
    }
    addNotification(`Tipe "${typeToDelete.name}" berhasil dihapus.`, 'success');
  };

  const handleInitiateRegistration = (request: Request, itemToRegister: RequestItem) => {
    setPrefillRegData({ request, itemToRegister });
    handleSetActivePage('registration');
  };
  
  const handleInitiateHandover = (asset: Asset) => {
    setPrefillHoData(asset);
    handleSetActivePage('handover');
  };
  
  const handleInitiateHandoverFromRequest = (request: Request) => {
    setPrefillHoData(request);
    handleSetActivePage('handover');
  };

  const handleInitiateDismantle = (asset: Asset) => {
    setPrefillDmData(asset);
    handleSetActivePage('dismantle');
  };

  const handleInitiateInstallation = (asset: Asset) => {
    const category = assetCategories.find(c => c.name === asset.category);
    if (!category?.isCustomerInstallable) {
      addNotification("Aset dari kategori ini tidak dapat dipasang ke pelanggan.", 'error');
      return;
    }
    setAssetToInstall(asset);
  };
  
  const handleConfirmInstallation = (customerId: string) => {
      if (!assetToInstall) return;
      const customer = customers.find(c => c.id === customerId);
      if (!customer) return;

      const newHandoverId = `HO-${String(handovers.length + 1).padStart(3, '0')}`;
      const newHandover: Handover = {
        id: newHandoverId, handoverDate: new Date().toISOString().split('T')[0], menyerahkan: currentUser.name, penerima: `${customer.name} (${customer.id})`, mengetahui: currentUser.name, woRoIntNumber: `INSTALL-${assetToInstall.id}`,
        items: [{ id: Date.now(), assetId: assetToInstall.id, itemName: assetToInstall.name, itemTypeBrand: assetToInstall.brand, conditionNotes: 'Pemasangan baru ke pelanggan', quantity: 1, checked: true }], status: ItemStatus.COMPLETED
      };
      setAndPersist(setHandovers, (prev: Handover[]) => [newHandover, ...prev], 'app_handovers');

      handleUpdateAsset(assetToInstall.id, {
        status: AssetStatus.IN_USE, currentUser: customer.id, location: `Terpasang di: ${customer.address}`,
      }, {
        user: currentUser.name, action: 'Instalasi Pelanggan', details: `Dipasang untuk pelanggan ${customer.name} (${customer.id}).`, referenceId: newHandoverId,
      });

      addNotification(`Aset ${assetToInstall.name} berhasil dipasang ke pelanggan ${customer.name}.`, 'success');
      setAssetToInstall(null);
  };

  const handleCompleteRequestRegistration = (
    requestId: string,
    registeredItemInfo: { requestItemId: number; count: number }
  ) => {
    setAndPersist(setRequests, (prevRequests) => {
      const updatedRequests = [...prevRequests];
      const requestIndex = updatedRequests.findIndex(r => r.id === requestId);
      if (requestIndex === -1) return prevRequests;

      const originalRequest = updatedRequests[requestIndex];
      const updatedRequest = { 
        ...originalRequest,
        partiallyRegisteredItems: { ...(originalRequest.partiallyRegisteredItems || {}) }
      };

      const currentCount = updatedRequest.partiallyRegisteredItems?.[registeredItemInfo.requestItemId] || 0;
      const newCount = currentCount + registeredItemInfo.count;
      updatedRequest.partiallyRegisteredItems[registeredItemInfo.requestItemId] = newCount;
      
      const allItemsRegistered = updatedRequest.items.every(
          item => (updatedRequest.partiallyRegisteredItems?.[item.id] || 0) >= item.quantity
      );

      if (allItemsRegistered) {
          updatedRequest.isRegistered = true;
          updatedRequest.status = ItemStatus.COMPLETED;
          
          const requesterUser = users.find(u => u.name === updatedRequest.requester);
          if (requesterUser) {
              addAppNotification({
                  recipientId: requesterUser.id,
                  actorName: currentUser.name,
                  type: 'REQUEST_COMPLETED',
                  referenceId: requestId,
              });
          }
          // FIX: Replace 'Admin' with 'Inventory Admin' to match UserRole type.
          const admins = users.filter(u => u.role === 'Inventory Admin' || u.role === 'Super Admin');
          admins.forEach(admin => {
              addAppNotification({
                  recipientId: admin.id,
                  actorName: currentUser.name,
                  type: 'REQUEST_COMPLETED',
                  referenceId: requestId,
              });
          });

          addNotification(`Semua item untuk request ${requestId} telah dicatat. Status diubah menjadi Selesai.`, 'success');
      }
      
      updatedRequests[requestIndex] = updatedRequest;
      return updatedRequests;
    }, 'app_requests');
  };
  
    const findReporter = (asset: Asset): User | undefined => {
        const reportLog = [...(asset.activityLog || [])].reverse().find(log => log.action === 'Kerusakan Dilaporkan');
        if (reportLog) {
            return users.find(u => u.name === reportLog.user);
        }
        return undefined;
    };

    const handleReportDamage = (asset: Asset, condition: AssetCondition, description: string, attachments: Attachment[]) => {
        handleUpdateAsset(asset.id, {
            status: AssetStatus.DAMAGED,
            condition: condition,
            attachments: [...(asset.attachments || []), ...attachments],
        }, {
            user: currentUser.name,
            action: 'Kerusakan Dilaporkan',
            details: `Kerusakan dilaporkan dengan deskripsi: "${description}"`,
        });

        // FIX: Replace 'Admin' with 'Inventory Admin' as they are responsible for asset management.
        users.filter(u => u.role === 'Inventory Admin').forEach(admin => {
            addAppNotification({
                recipientId: admin.id,
                actorName: currentUser.name,
                type: 'ASSET_DAMAGED_REPORT',
                referenceId: asset.id,
                message: `melaporkan kerusakan pada aset ${asset.name}`
            });
        });
        
        addNotification(`Laporan kerusakan untuk aset ${asset.id} telah dikirim ke Admin.`, 'success');
        setAssetToReport(null);
    };

    // FIX: Update signature to match the corrected StartRepairModal onSubmit prop.
    const handleStartRepairProcess = (asset: Asset, data: { repairType: 'internal' | 'external'; technician?: string; vendor?: string; vendorContact?: string; estimatedDate: Date; notes: string }) => {
        const { repairType, technician, vendor, vendorContact, estimatedDate, notes } = data;
        let details = '';
        let newStatus: AssetStatus;
        let notificationMessage = '';
        
        if (repairType === 'internal') {
            details = `Perbaikan internal dimulai oleh ${technician}. Estimasi selesai: ${estimatedDate.toISOString().split('T')[0]}. Catatan: "${notes}"`;
            newStatus = AssetStatus.UNDER_REPAIR;
            notificationMessage = `memulai perbaikan internal untuk aset Anda: ${asset.name}. Teknisi: ${technician}.`;
        } else {
            details = `Perbaikan eksternal dikirim ke ${vendor} (Kontak: ${vendorContact}). Estimasi kembali: ${estimatedDate.toISOString().split('T')[0]}. Catatan: "${notes}"`;
            newStatus = AssetStatus.OUT_FOR_REPAIR;
            notificationMessage = `aset Anda: ${asset.name} dikirim untuk perbaikan eksternal ke ${vendor}.`;
        }
        
        handleUpdateAsset(asset.id, {
            status: newStatus,
        }, {
            user: currentUser.name,
            action: 'Proses Perbaikan Dimulai',
            details: details,
        });
  
        const reporter = findReporter(asset);
        if (reporter) {
            addAppNotification({
                recipientId: reporter.id,
                actorName: currentUser.name,
                type: 'REPAIR_STARTED',
                referenceId: asset.id,
                message: notificationMessage
            });
        }
        addNotification(`Proses perbaikan untuk ${asset.id} dimulai.`, 'info');
        setAssetToStartRepair(null);
    };

    const handleReceiveFromRepair = (asset: Asset) => {
        setAssetToCompleteRepair(asset);
    };
    
    const handleAddProgressUpdate = (asset: Asset, note: string) => {
        handleUpdateAsset(asset.id, {}, {
            user: currentUser.name,
            action: 'Update Progres Perbaikan',
            details: `Update: "${note}"`,
        });

        const reporter = findReporter(asset);
        if(reporter) {
            addAppNotification({
                recipientId: reporter.id,
                actorName: currentUser.name,
                type: 'REPAIR_PROGRESS_UPDATE',
                referenceId: asset.id,
                message: `memberi update progres untuk aset ${asset.name}: "${note}"`
            });
        }
        addNotification('Update progres berhasil ditambahkan dan notifikasi dikirim.', 'success');
        setAssetToUpdateProgress(null);
    };

    const handleCompleteRepair = (asset: Asset, data: { newCondition: AssetCondition; repairNotes: string; repairCost: number | null; actionsTaken: string[] }) => {
        const { newCondition, repairNotes, repairCost, actionsTaken } = data;
        const costString = repairCost ? ` Biaya: Rp ${repairCost.toLocaleString('id-ID')}` : '';
        const actionsString = actionsTaken.length > 0 ? ` Tindakan: ${actionsTaken.join(', ')}.` : '';
        const details = `Perbaikan selesai. Kondisi baru: ${newCondition}.${actionsString} Catatan: "${repairNotes}".${costString}`;
        
        handleUpdateAsset(asset.id, {
            status: AssetStatus.IN_USE,
            condition: newCondition,
        }, {
            user: currentUser.name,
            action: 'Perbaikan Selesai',
            details: details
        });

        const reporter = findReporter(asset);
        if (reporter) {
            addAppNotification({
                recipientId: reporter.id,
                actorName: currentUser.name,
                type: 'REPAIR_COMPLETED',
                referenceId: asset.id,
                message: `perbaikan untuk aset Anda (${asset.name}) telah selesai.`
            });
        }
        addNotification(`Aset ${asset.id} telah diperbaiki dan kembali digunakan.`, 'success');
        setAssetToCompleteRepair(null);
    };

    const handleConfirmDecommission = (asset: Asset) => {
        handleUpdateAsset(asset.id, {
            status: AssetStatus.DECOMMISSIONED,
            currentUser: null,
            location: 'Diberhentikan',
        }, {
            user: currentUser.name,
            action: 'Aset Diberhentikan',
            details: `Aset diberhentikan karena kerusakan berat.`
        });

        const reporter = findReporter(asset);
        if (reporter) {
            addAppNotification({
                recipientId: reporter.id,
                actorName: currentUser.name,
                type: 'ASSET_DECOMMISSIONED',
                referenceId: asset.id,
                message: `memberhentikan aset Anda (${asset.name}) karena rusak berat`
            });
        }
        addNotification(`Aset ${asset.id} telah diberhentikan.`, 'warning');
        setAssetToDecommission(null);
    };


  const handleShowPreview = (data: PreviewData) => {
    setPreviewData(data);
  };

  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-tm-light">
            <div className="flex flex-col items-center">
                <SpinnerIcon className="w-12 h-12 text-tm-primary" />
                <p className="mt-4 text-lg font-semibold text-gray-700">Memuat Data Aplikasi...</p>
            </div>
        </div>
    );
  }

  if (error) {
     return (
        <div className="flex items-center justify-center min-h-screen bg-red-50">
            <div className="text-center p-8 max-w-md">
                <ExclamationTriangleIcon className="w-16 h-16 mx-auto text-red-400" />
                <h1 className="mt-4 text-2xl font-bold text-red-800">Terjadi Kesalahan Kritis</h1>
                <p className="mt-2 text-gray-600">{error}</p>
                 <button onClick={() => window.location.reload()} className="mt-6 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 bg-tm-primary rounded-lg shadow-sm hover:bg-tm-primary-hover">
                    Coba Muat Ulang
                </button>
            </div>
        </div>
    );
  }

  const renderPage = () => {
    const staffRestrictedPages: Page[] = ['registration', 'pengaturan-pengguna', 'kategori', 'customers', 'repair'];
    if (currentUser.role === 'Staff' && staffRestrictedPages.includes(activePage)) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-4rem)] p-8 text-center bg-gray-50">
                <div>
                    <ExclamationTriangleIcon className="w-16 h-16 mx-auto text-amber-400" />
                    <h1 className="mt-4 text-2xl font-bold text-gray-800">Akses Ditolak</h1>
                    <p className="mt-2 text-gray-600">Anda tidak memiliki izin untuk mengakses halaman ini. Silakan hubungi administrator.</p>
                </div>
            </div>
        );
    }

    switch (activePage) {
      case 'dashboard':
        return <DashboardPage currentUser={currentUser} assets={assets} requests={requests} handovers={handovers} dismantles={dismantles} customers={customers} assetCategories={assetCategories} divisions={divisions} setActivePage={handleSetActivePage} onShowPreview={handleShowPreview} />;
      case 'request':
        return <ItemRequestPage currentUser={currentUser} requests={requests} setRequests={(valueOrFn) => setAndPersist(setRequests, valueOrFn, 'app_requests')} assets={assets} assetCategories={assetCategories} divisions={divisions} onInitiateRegistration={handleInitiateRegistration} initialFilters={pageInitialState} onClearInitialFilters={clearPageInitialState} onShowPreview={handleShowPreview} openModelModal={handleOpenModelModal} openTypeModal={handleOpenTypeModal} setActivePage={handleSetActivePage} users={users} notifications={notifications} addNotification={addAppNotification} markNotificationsAsRead={markNotificationsAsRead} />;
      case 'registration':
        return <ItemRegistration currentUser={currentUser} assets={assets} setAssets={(valueOrFn) => setAndPersist(setAssets, valueOrFn, 'app_assets')} customers={customers} requests={requests} handovers={handovers} dismantles={dismantles} assetCategories={assetCategories} prefillData={prefillRegData} onClearPrefill={() => setPrefillRegData(null)} onRegistrationComplete={handleCompleteRequestRegistration} onInitiateHandover={handleInitiateHandover} onInitiateDismantle={handleInitiateDismantle} onInitiateInstallation={handleInitiateInstallation} assetToViewId={assetToViewId} initialFilters={pageInitialState} onClearInitialFilters={clearPageInitialState} itemToEdit={itemToEdit} onClearItemToEdit={() => setItemToEdit(null)} onShowPreview={handleShowPreview} setActivePage={handleSetActivePage} openModelModal={handleOpenModelModal} openTypeModal={handleOpenTypeModal} setIsGlobalScannerOpen={setIsGlobalScannerOpen} setScanContext={setScanContext} setFormScanCallback={setFormScanCallback}/>;
      case 'handover':
        return <ItemHandoverPage currentUser={currentUser} handovers={handovers} setHandovers={(valueOrFn) => setAndPersist(setHandovers, valueOrFn, 'app_handovers')} assets={assets} users={users} divisions={divisions} prefillData={prefillHoData} onClearPrefill={() => setPrefillHoData(null)} onUpdateAsset={handleUpdateAsset} onShowPreview={handleShowPreview}/>;
      case 'dismantle':
        return <ItemDismantlePage currentUser={currentUser} dismantles={dismantles} setDismantles={(valueOrFn) => setAndPersist(setDismantles, valueOrFn, 'app_dismantles')} assets={assets} customers={customers} users={users} prefillData={prefillDmData} onClearPrefill={() => setPrefillDmData(null)} onUpdateAsset={handleUpdateAsset} onShowPreview={handleShowPreview} setActivePage={handleSetActivePage}/>;
      case 'stock':
        return <StockOverviewPage currentUser={currentUser} assets={assets} assetCategories={assetCategories} setActivePage={handleSetActivePage} onShowPreview={handleShowPreview} initialFilters={pageInitialState} onClearInitialFilters={clearPageInitialState} handovers={handovers} requests={requests} onReportDamage={setAssetToReport} />;
      case 'repair':
        return <RepairManagementPage currentUser={currentUser} assets={assets} users={users} onShowPreview={handleShowPreview} onStartRepair={setAssetToStartRepair} onAddProgressUpdate={setAssetToUpdateProgress} onReceiveFromRepair={handleReceiveFromRepair} onCompleteRepair={setAssetToCompleteRepair} onDecommission={setAssetToDecommission} />;
      case 'pengaturan-pengguna':
        return <AccountsPage currentUser={currentUser} users={users} setUsers={(valueOrFn) => setAndPersist(setUsers, valueOrFn, 'app_users')} divisions={divisions} setDivisions={(valueOrFn) => setAndPersist(setDivisions, valueOrFn, 'app_divisions')} setActivePage={handleSetActivePage} />;
      case 'kategori':
        return <CategoryManagementPage currentUser={currentUser} categories={assetCategories} setCategories={(valueOrFn) => setAndPersist(setAssetCategories, valueOrFn, 'app_assetCategories')} divisions={divisions} assets={assets} openModelModal={handleOpenModelModal} openTypeModal={handleOpenTypeModal}/>;
      case 'customers':
        return <CustomerManagementPage currentUser={currentUser} customers={customers} setCustomers={(valueOrFn) => setAndPersist(setCustomers, valueOrFn, 'app_customers')} assets={assets} onInitiateDismantle={handleInitiateDismantle} onShowPreview={handleShowPreview} itemToEdit={itemToEdit} onClearItemToEdit={() => setItemToEdit(null)}/>;
      default:
        return <DashboardPage currentUser={currentUser} assets={assets} requests={requests} handovers={handovers} dismantles={dismantles} customers={customers} assetCategories={assetCategories} divisions={divisions} setActivePage={handleSetActivePage} onShowPreview={handleShowPreview} />;
    }
  };

  return (
      <div className="min-h-screen bg-tm-light">
        <Sidebar 
          currentUser={currentUser}
          activePage={activePage} 
          setActivePage={handleSetActivePage}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />
        <div className="flex flex-col md:ml-64">
          <header className="sticky top-0 z-20 flex items-center justify-between w-full h-16 px-4 bg-white border-b border-gray-200 no-print md:justify-end">
              <button 
                  onClick={() => setSidebarOpen(true)}
                  className="text-gray-500 md:hidden"
              >
                  <MenuIcon className="w-6 h-6" />
              </button>
              <div className="flex items-center space-x-4">
                  <NotificationBell
                    currentUser={currentUser}
                    users={users}
                    notifications={notifications}
                    setNotifications={(valueOrFn) => setAndPersist(setNotifications, valueOrFn, 'app_notifications')}
                    requests={requests}
                    setActivePage={handleSetActivePage}
                    onShowPreview={handleShowPreview}
                  />
                  <button
                    onClick={() => {
                        setScanContext('global');
                        setIsGlobalScannerOpen(true);
                    }}
                    className="p-2 text-gray-500 rounded-full hover:bg-gray-100 hover:text-tm-primary"
                    title="Pindai QR Aset"
                  >
                    <QrCodeIcon className="w-6 h-6"/>
                  </button>
                  <div className="relative" ref={profileDropdownRef}>
                        <button onClick={() => setIsProfileDropdownOpen(prev => !prev)} className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100">
                            <img className="w-8 h-8 rounded-full" src="https://i.pravatar.cc/100" alt="User Avatar" />
                            <div className="hidden text-right sm:block">
                                <span className="text-sm font-medium text-gray-700">{currentUser.name}</span>
                            </div>
                            <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                         {isProfileDropdownOpen && (
                            <div className="absolute right-0 z-30 w-48 mt-2 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg">
                                <div className="p-2">
                                     <div className="px-2 py-2 mb-1 border-b">
                                        <p className="text-sm font-semibold text-gray-800">{currentUser.name}</p>
                                        <p className={`text-xs font-semibold rounded-full ${getRoleClass(currentUser.role)} inline-block px-2 py-0.5 mt-1`}>{currentUser.role}</p>
                                    </div>
                                    <button
                                        onClick={onLogout}
                                        className="flex items-center w-full gap-3 px-3 py-2 text-sm text-left text-gray-700 rounded-md hover:bg-gray-100 hover:text-tm-primary"
                                    >
                                        <LogoutIcon className="w-4 h-4" />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            </div>
                        )}
                  </div>
              </div>
          </header>
          <main className="flex-1">
              {renderPage()}
          </main>
        </div>
        <InstallToCustomerModal
            isOpen={!!assetToInstall}
            onClose={() => setAssetToInstall(null)}
            asset={assetToInstall}
            customers={customers}
            onConfirm={handleConfirmInstallation}
        />
        <GlobalScannerModal
            isOpen={isGlobalScannerOpen}
            onClose={() => setIsGlobalScannerOpen(false)}
            onScanSuccess={handleGlobalScanSuccess}
        />
        <PreviewModal 
            currentUser={currentUser}
            previewData={previewData}
            onClose={() => setPreviewData(null)}
            onShowPreview={setPreviewData}
            onEditItem={handleEditItem}
            assets={assets}
            customers={customers}
            users={users}
            requests={requests}
            handovers={handovers}
            dismantles={dismantles}
            divisions={divisions}
            assetCategories={assetCategories}
            onInitiateHandover={handleInitiateHandover}
            onInitiateDismantle={handleInitiateDismantle}
            onInitiateInstallation={handleInitiateInstallation}
            onReportDamage={setAssetToReport}
            onStartRepair={setAssetToStartRepair}
            onMarkAsRepaired={setAssetToCompleteRepair}
            onReceiveFromRepair={handleReceiveFromRepair}
            onDecommission={setAssetToDecommission}
            onAddProgressUpdate={setAssetToUpdateProgress}
        />
        {modelModalState && (
          <ModelManagementModal
            isOpen={!!modelModalState}
            onClose={() => setModelModalState(null)}
            parentInfo={{ category: modelModalState.category, type: modelModalState.type }}
            assets={assets}
            onSave={handleSaveModel}
            onDelete={handleDeleteModel}
          />
        )}
        {typeModalState && (
            <TypeManagementModal
                isOpen={!!typeModalState}
                onClose={() => setTypeModalState(null)}
                parentCategory={typeModalState.category}
                typeToEdit={typeModalState.typeToEdit}
                assets={assets}
                onSave={handleSaveType}
                onDelete={handleDeleteType}
            />
        )}
        <ReportDamageModal
            isOpen={!!assetToReport}
            onClose={() => setAssetToReport(null)}
            asset={assetToReport}
            onSubmit={handleReportDamage}
        />
        <StartRepairModal
            isOpen={!!assetToStartRepair}
            onClose={() => setAssetToStartRepair(null)}
            asset={assetToStartRepair}
            users={users}
            onSubmit={handleStartRepairProcess}
        />
        <CompleteRepairModal
            isOpen={!!assetToCompleteRepair}
            onClose={() => setAssetToCompleteRepair(null)}
            asset={assetToCompleteRepair}
            onSubmit={handleCompleteRepair}
        />
        <DecommissionConfirmationModal
            isOpen={!!assetToDecommission}
            onClose={() => setAssetToDecommission(null)}
            asset={assetToDecommission}
            onConfirm={handleConfirmDecommission}
        />
        <AddProgressUpdateModal
            isOpen={!!assetToUpdateProgress}
            onClose={() => setAssetToUpdateProgress(null)}
            asset={assetToUpdateProgress}
            onSubmit={handleAddProgressUpdate}
        />
      </div>
  );
};

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        try {
            const storedUser = localStorage.getItem('currentUser');
            if (storedUser) {
                return JSON.parse(storedUser);
            }
        } catch (error) {
            console.error("Failed to parse user from localStorage", error);
        }
        return null;
    });
    
    const addNotification = useNotification();

    const handleLogin = async (email: string, pass: string): Promise<User> => {
        try {
            const user = await api.loginUser(email, pass);
            addNotification(`Selamat datang kembali, ${user.name}!`, 'success');
            setCurrentUser(user);
            return user;
        } catch (err) {
            // Error handling will be done in the component
            throw err;
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        setCurrentUser(null);
        addNotification('Anda telah berhasil logout.', 'success');
    };

    if (!currentUser) {
        return <LoginPage onLogin={handleLogin} />;
    }

    return <AppContent currentUser={currentUser} onLogout={handleLogout} />;
};

const RootApp: React.FC = () => (
    <NotificationProvider>
        <App />
    </NotificationProvider>
);

export default RootApp;