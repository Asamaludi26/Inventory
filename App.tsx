import React, { useState, useEffect, useRef, useCallback } from 'react';
// FIX: Import PreviewData from central types file.
import { Page, User, Asset, Request, Handover, Dismantle, ItemStatus, AssetStatus, Customer, CustomerStatus, ActivityLogEntry, PreviewData, AssetCategory } from './types';
import { Sidebar } from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ItemRequest, { initialMockRequests } from './components/ItemRequest';
import { ItemRegistration, mockAssets } from './components/ItemRegistration';
import { ItemHandover, mockHandovers } from './components/ItemHandover';
import { ItemDismantle, mockDismantles } from './components/ItemDismantle';
import AccountsAndDivisions, { mockUsers as initialMockUsers, mockDivisions } from './components/AccountsAndDivisions';
import CustomerManagement, { mockCustomers } from './components/CustomerManagement';
import { MenuIcon } from './components/icons/MenuIcon';
import { NotificationProvider, useNotification } from './components/shared/Notification';
import Modal from './components/shared/Modal';
import { SpinnerIcon } from './components/icons/SpinnerIcon';
import { QrCodeIcon } from './components/icons/QrCodeIcon';
import { CheckIcon } from './components/icons/CheckIcon';
import StockOverview from './components/StockOverview';
// FIX: Remove PreviewData import from here as it's now in types.ts.
import { PreviewModal } from './components/shared/PreviewModal';
import { CategoryManagement } from './components/CategoryManagement';


declare var Html5Qrcode: any;

const currentUser: User = {
    id: 99,
    name: 'John Doe',
    email: 'john.doe@triniti.com',
    divisionId: 1,
    role: 'Super Admin',
};

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

const initialAssetCategories = (): AssetCategory[] => {
  let categoryId = 1;
  let typeId = 1;
  return Object.entries(ispAssetCategories).map(([categoryName, types]) => {
    return {
      id: categoryId++,
      name: categoryName,
      types: types.map(typeName => ({
        id: typeId++,
        name: typeName,
      })),
      associatedDivisions: [], // Start with no associated divisions
    };
  });
};


const getRoleClass = (role: User['role']) => {
    switch(role) {
        case 'Super Admin': return 'bg-purple-100 text-purple-800';
        case 'Admin': return 'bg-info-light text-info-text';
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
    onScanSuccess: (decodedText: string) => void;
}> = ({ isOpen, onClose, onScanSuccess }) => {
    const scannerRef = useRef<any>(null);
    const addNotification = useNotification();

    useEffect(() => {
        if (isOpen && typeof Html5Qrcode !== 'undefined') {
            const html5QrCode = new Html5Qrcode("global-qr-reader");
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
        <Modal isOpen={isOpen} onClose={onClose} title="Pindai Kode QR Aset" size="md">
            <div id="global-qr-reader" style={{ width: '100%' }}></div>
        </Modal>
    );
};


const AppContent: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Lifted state
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [requests, setRequests] = useState<Request[]>(initialMockRequests);
  const [handovers, setHandovers] = useState<Handover[]>(mockHandovers);
  const [dismantles, setDismantles] = useState<Dismantle[]>(mockDismantles);
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [users, setUsers] = useState<User[]>(initialMockUsers);
  const [divisions, setDivisions] = useState(mockDivisions);
  const [assetCategories, setAssetCategories] = useState<AssetCategory[]>(initialAssetCategories);
  
  // State for pre-filling forms & cross-module modals
  const [prefillRegData, setPrefillRegData] = useState<Request | null>(null);
  const [prefillHoData, setPrefillHoData] = useState<Asset | null>(null);
  const [prefillDmData, setPrefillDmData] = useState<Asset | null>(null);
  const [assetToInstall, setAssetToInstall] = useState<Asset | null>(null);
  const [isGlobalScannerOpen, setIsGlobalScannerOpen] = useState(false);
  // State to show a specific asset detail modal after a QR scan.
  const [assetToViewId, setAssetToViewId] = useState<string | null>(null);
  const [initialFilters, setInitialFilters] = useState<Record<string, any> | null>(null);

  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [itemToEdit, setItemToEdit] = useState<{ type: string; data: any } | null>(null);
  
  const addNotification = useNotification();

  const handleEditItem = (data: PreviewData) => {
    setPreviewData(null); // Close the preview modal first
    
    switch (data.type) {
      case 'asset': {
        const asset = assets.find(a => a.id === data.id);
        if (asset) {
          setItemToEdit({ type: 'asset', data: asset });
          setActivePage('registration');
        }
        break;
      }
      case 'customer': {
        const customer = customers.find(c => c.id === data.id);
        if (customer) {
          setItemToEdit({ type: 'customer', data: customer });
          setActivePage('customers');
        }
        break;
      }
      default:
        addNotification(`Fungsi edit belum tersedia untuk tipe ${data.type}.`, 'error');
    }
  };

  const logAssetActivity = (assetId: string, logEntry: Omit<ActivityLogEntry, 'id' | 'timestamp'>) => {
    setAssets(prevAssets =>
      prevAssets.map(asset => {
        if (asset.id === assetId) {
          const newLog: ActivityLogEntry = {
            ...logEntry,
            id: `log-${assetId}-${Date.now()}`,
            timestamp: new Date().toISOString(),
          };
          return {
            ...asset,
            activityLog: [...(asset.activityLog || []), newLog],
          };
        }
        return asset;
      })
    );
  };

  const handleUpdateAsset = (assetId: string, updates: Partial<Asset>, logEntry?: Omit<ActivityLogEntry, 'id' | 'timestamp'>) => {
    setAssets(prev => prev.map(asset => asset.id === assetId ? { ...asset, ...updates } : asset));
    if (logEntry) {
        logAssetActivity(assetId, logEntry);
    }
  };

  const handleGlobalScanSuccess = (assetId: string) => {
    const foundAsset = assets.find(a => a.id === assetId);
    if (foundAsset) {
        setIsGlobalScannerOpen(false);
        setPreviewData({ type: 'asset', id: assetId });
        addNotification(`Aset ${assetId} ditemukan.`, 'success');
    } else {
        addNotification(`Aset dengan ID ${assetId} tidak ditemukan.`, 'error');
    }
  };

  // Handlers for cross-component communication
  const handleNavigate = (page: Page, filters: Record<string, any> | null = null) => {
    setActivePage(page);
    if (filters) {
        setInitialFilters({ [page]: filters });
    } else {
        setInitialFilters(null);
    }
    setPrefillRegData(null);
    setPrefillHoData(null);
    setPrefillDmData(null);
    setAssetToViewId(null);
  };

  const clearInitialFilters = useCallback(() => {
    setInitialFilters(null);
  }, []);
  
  const handleInitiateRegistration = (request: Request) => {
    setPrefillRegData(request);
    setActivePage('registration');
  };
  
  const handleInitiateHandover = (asset: Asset) => {
    setPrefillHoData(asset);
    setActivePage('handover');
  };

  const handleInitiateDismantle = (asset: Asset) => {
    setPrefillDmData(asset);
    setActivePage('dismantle');
  };

  const handleInitiateInstallation = (asset: Asset) => {
    if (asset.category !== 'Perangkat Pelanggan (CPE)') {
      addNotification("Hanya aset kategori 'Perangkat Pelanggan (CPE)' yang dapat dipasang.", 'error');
      return;
    }
    setAssetToInstall(asset);
  };
  
  const handleConfirmInstallation = (customerId: string) => {
      if (!assetToInstall) return;
      const customer = customers.find(c => c.id === customerId);
      if (!customer) return;

      // 1. Update the asset
      const assetUpdates: Partial<Asset> = {
        status: AssetStatus.IN_USE,
        currentUser: customer.id,
        location: `Terpasang di: ${customer.address}`,
      };
      const logEntry = {
        user: currentUser.name,
        action: 'Instalasi Pelanggan',
        details: `Dipasang untuk pelanggan ${customer.name} (${customer.id}).`,
      };
      handleUpdateAsset(assetToInstall.id, assetUpdates, logEntry);

      // 2. Create a handover record for audit trail
      const newHandover: Handover = {
        id: `HO-${String(handovers.length + 1).padStart(3, '0')}`,
        handoverDate: new Date().toISOString().split('T')[0],
        menyerahkan: currentUser.name, // The technician/staff
        penerima: `${customer.name} (${customer.id})`, // The customer with their ID for clarity
        mengetahui: currentUser.name,
        woRoIntNumber: `INSTALL-${assetToInstall.id}`,
        lembar: '1. Menyerahkan',
        items: [{
            id: Date.now(),
            assetId: assetToInstall.id,
            itemName: assetToInstall.name,
            itemTypeBrand: assetToInstall.brand,
            conditionNotes: 'Pemasangan baru ke pelanggan',
            quantity: 1,
            checked: true
        }],
        status: ItemStatus.COMPLETED
      };
      setHandovers(prev => [newHandover, ...prev]);

      addNotification(`Aset ${assetToInstall.name} berhasil dipasang ke pelanggan ${customer.name}.`, 'success');
      setAssetToInstall(null);
  };

  const handleCompleteRequestRegistration = (requestId: string) => {
     setRequests(prev => prev.map(req => 
      req.id === requestId 
        ? { ...req, isRegistered: true, status: ItemStatus.COMPLETED }
        : req
    ));
  }
  
  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard assets={assets} requests={requests} handovers={handovers} dismantles={dismantles} customers={customers} setActivePage={handleNavigate} onShowPreview={setPreviewData} />;
      case 'request':
        return <ItemRequest 
                  currentUser={currentUser} 
                  requests={requests}
                  setRequests={setRequests}
                  assets={assets}
                  onInitiateRegistration={handleInitiateRegistration}
                  initialFilters={initialFilters?.request}
                  onClearInitialFilters={clearInitialFilters}
                  onShowPreview={setPreviewData}
               />;
      case 'registration':
        return <ItemRegistration 
                  currentUser={currentUser}
                  assets={assets}
                  setAssets={setAssets}
                  customers={customers}
                  requests={requests}
                  handovers={handovers}
                  dismantles={dismantles}
                  assetCategories={assetCategories}
                  prefillData={prefillRegData}
                  onClearPrefill={() => setPrefillRegData(null)}
                  onRegistrationComplete={handleCompleteRequestRegistration}
                  onInitiateHandover={handleInitiateHandover}
                  onInitiateDismantle={handleInitiateDismantle}
                  onInitiateInstallation={handleInitiateInstallation}
                  assetToViewId={assetToViewId}
                  initialFilters={initialFilters?.registration}
                  onClearInitialFilters={clearInitialFilters}
                  itemToEdit={itemToEdit}
                  onClearItemToEdit={() => setItemToEdit(null)}
                  onShowPreview={setPreviewData}
               />;
      case 'handover':
        return <ItemHandover
                  currentUser={currentUser}
                  handovers={handovers}
                  setHandovers={setHandovers}
                  assets={assets}
                  prefillData={prefillHoData}
                  onClearPrefill={() => setPrefillHoData(null)}
                  onUpdateAsset={handleUpdateAsset}
                  onShowPreview={setPreviewData}
               />;
      case 'dismantle':
        return <ItemDismantle 
                  currentUser={currentUser}
                  dismantles={dismantles}
                  setDismantles={setDismantles}
                  assets={assets}
                  customers={customers}
                  prefillData={prefillDmData}
                  onClearPrefill={() => setPrefillDmData(null)}
                  onUpdateAsset={handleUpdateAsset}
                  onShowPreview={setPreviewData}
                />;
      case 'stock':
        return <StockOverview assets={assets} setActivePage={handleNavigate} onShowPreview={setPreviewData} />;
      case 'akun':
        return <AccountsAndDivisions currentUser={currentUser} users={users} setUsers={setUsers} divisions={divisions} setDivisions={setDivisions} initialView="users" onNavigate={handleNavigate} />;
      case 'divisi':
        return <AccountsAndDivisions currentUser={currentUser} users={users} setUsers={setUsers} divisions={divisions} setDivisions={setDivisions} initialView="divisions" onNavigate={handleNavigate} />;
      case 'kategori':
        return <CategoryManagement categories={assetCategories} setCategories={setAssetCategories} divisions={divisions} assets={assets} />;
      case 'customers':
        return <CustomerManagement 
                  currentUser={currentUser}
                  customers={customers} 
                  setCustomers={setCustomers} 
                  assets={assets} 
                  onInitiateDismantle={handleInitiateDismantle}
                  onShowPreview={setPreviewData}
                  itemToEdit={itemToEdit}
                  onClearItemToEdit={() => setItemToEdit(null)}
                />;
      default:
        return <Dashboard assets={assets} requests={requests} handovers={handovers} dismantles={dismantles} customers={customers} setActivePage={handleNavigate} onShowPreview={setPreviewData} />;
    }
  };

  return (
      <div className="min-h-screen bg-tm-light">
        <Sidebar 
          currentUser={currentUser}
          activePage={activePage} 
          setActivePage={handleNavigate}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />
        <div className="flex flex-col md:ml-64">
          <header className="sticky top-0 z-20 flex items-center justify-between w-full h-16 px-4 bg-white border-b border-gray-200 md:justify-end">
              <button 
                  onClick={() => setSidebarOpen(true)}
                  className="text-gray-500 md:hidden"
              >
                  <MenuIcon className="w-6 h-6" />
              </button>
              <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setIsGlobalScannerOpen(true)}
                    className="p-2 text-gray-500 rounded-full hover:bg-gray-100 hover:text-tm-primary"
                    title="Pindai QR Aset"
                  >
                    <QrCodeIcon className="w-6 h-6"/>
                  </button>
                  <div className="text-right">
                      <span className="text-sm font-medium text-gray-700">{currentUser.name}</span>
                      <span className={`ml-2 px-2.5 py-0.5 text-xs font-semibold rounded-full ${getRoleClass(currentUser.role)}`}>{currentUser.role}</span>
                  </div>
                  <img className="w-8 h-8 rounded-full" src="https://picsum.photos/100" alt="User Avatar" />
              </div>
          </header>
          <main className="flex-1">
              {renderContent()}
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
        />
      </div>
  );
};

const App: React.FC = () => (
  <NotificationProvider>
    <AppContent />
  </NotificationProvider>
);


export default App;