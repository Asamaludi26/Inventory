import React, { useState, useEffect } from 'react';
import { Page, User, Asset, Request, Handover, Dismantle, ItemStatus, AssetStatus, Customer, CustomerStatus } from './types';
import { Sidebar } from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ItemRequest, { initialMockRequests } from './components/ItemRequest';
import ItemRegistration, { mockAssets } from './components/ItemRegistration';
import ItemHandover, { mockHandovers } from './components/ItemHandover';
import { ItemDismantle, mockDismantles } from './components/ItemDismantle';
import AccountsAndDivisions from './components/AccountsAndDivisions';
import CustomerManagement, { mockCustomers } from './components/CustomerManagement';
import { MenuIcon } from './components/icons/MenuIcon';
import { NotificationProvider, useNotification } from './components/shared/Notification';
import Modal from './components/shared/Modal';
import { SpinnerIcon } from './components/icons/SpinnerIcon';

const currentUser: User = {
    id: 99,
    name: 'John Doe',
    email: 'john.doe@triniti.com',
    divisionId: 1,
    role: 'Super Admin',
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
        if (customers.length > 0) {
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
            footerContent={
                <>
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Batal</button>
                    <button onClick={handleConfirm} disabled={!selectedCustomerId || isLoading} className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-tm-primary rounded-lg shadow-sm hover:bg-tm-primary-hover disabled:bg-tm-primary/70">
                        {isLoading && <SpinnerIcon className="w-4 h-4 mr-2" />}
                        Konfirmasi Pemasangan
                    </button>
                </>
            }
        >
            <div className="space-y-4 text-sm">
                <p>Anda akan memasang aset berikut:</p>
                <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-semibold text-tm-dark">{asset.name}</p>
                    <p className="text-xs text-gray-500">{asset.id} &bull; SN: {asset.serialNumber}</p>
                </div>
                <div>
                    <label htmlFor="customer-select" className="block font-medium text-gray-700">Pilih Pelanggan</label>
                    <select
                        id="customer-select"
                        value={selectedCustomerId}
                        onChange={e => setSelectedCustomerId(e.target.value)}
                        className="block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md shadow-sm"
                    >
                        <option value="" disabled>-- Daftar Pelanggan --</option>
                        {customers.filter(c => c.status === CustomerStatus.ACTIVE).map(c => (
                            <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
                        ))}
                    </select>
                </div>
            </div>
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
  
  // State for pre-filling forms & cross-module modals
  const [prefillRegData, setPrefillRegData] = useState<Request | null>(null);
  const [prefillHoData, setPrefillHoData] = useState<Asset | null>(null);
  const [prefillDmData, setPrefillDmData] = useState<Asset | null>(null);
  const [assetToInstall, setAssetToInstall] = useState<Asset | null>(null);
  
  const addNotification = useNotification();

  // Handlers for cross-component communication
  const handleNavigate = (page: Page) => {
    setActivePage(page);
    setPrefillRegData(null);
    setPrefillHoData(null);
    setPrefillDmData(null);
  };
  
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
    setAssetToInstall(asset);
  };
  
  const handleConfirmInstallation = (customerId: string) => {
      if (!assetToInstall) return;
      const customer = customers.find(c => c.id === customerId);
      if (!customer) return;

      // 1. Update the asset
      handleUpdateAsset(assetToInstall.id, {
        status: AssetStatus.IN_USE,
        currentUser: customer.id,
        location: customer.address,
      });

      // 2. Create a handover record for audit trail
      const newHandover: Handover = {
        id: `HO-${String(handovers.length + 1).padStart(3, '0')}`,
        handoverDate: new Date().toISOString().split('T')[0],
        menyerahkan: currentUser.name, // The technician/staff
        penerima: customer.name, // The customer
        mengetahui: 'Sistem',
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


  const handleUpdateAsset = (assetId: string, updates: Partial<Asset>) => {
    setAssets(prev => prev.map(asset => asset.id === assetId ? { ...asset, ...updates } : asset));
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
        return <Dashboard assets={assets} requests={requests} handovers={handovers} dismantles={dismantles} customers={customers} setActivePage={handleNavigate} />;
      case 'request':
        return <ItemRequest 
                  currentUser={currentUser} 
                  requests={requests}
                  setRequests={setRequests}
                  assets={assets}
                  onInitiateRegistration={handleInitiateRegistration} 
               />;
      case 'registration':
        return <ItemRegistration 
                  assets={assets}
                  setAssets={setAssets}
                  prefillData={prefillRegData}
                  onClearPrefill={() => setPrefillRegData(null)}
                  onRegistrationComplete={handleCompleteRequestRegistration}
                  onInitiateHandover={handleInitiateHandover}
                  onInitiateDismantle={handleInitiateDismantle}
                  onInitiateInstallation={handleInitiateInstallation}
               />;
      case 'handover':
        return <ItemHandover 
                  handovers={handovers}
                  setHandovers={setHandovers}
                  assets={assets}
                  prefillData={prefillHoData}
                  onClearPrefill={() => setPrefillHoData(null)}
                  onUpdateAsset={handleUpdateAsset}
               />;
      case 'dismantle':
        return <ItemDismantle 
                  dismantles={dismantles}
                  setDismantles={setDismantles}
                  assets={assets}
                  customers={customers}
                  prefillData={prefillDmData}
                  onClearPrefill={() => setPrefillDmData(null)}
                  onUpdateAsset={handleUpdateAsset}
                />;
      case 'accounts':
        return <AccountsAndDivisions />;
      case 'customers':
        return <CustomerManagement 
                  customers={customers} 
                  setCustomers={setCustomers} 
                  assets={assets} 
                  onInitiateDismantle={handleInitiateDismantle}
                />;
      default:
        return <Dashboard assets={assets} requests={requests} handovers={handovers} dismantles={dismantles} customers={customers} setActivePage={handleNavigate} />;
    }
  };

  return (
      <div className="min-h-screen bg-tm-light">
        <Sidebar 
          activePage={activePage} 
          setActivePage={handleNavigate}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />
        <div className="flex flex-col md:ml-64">
          <header className="sticky top-0 z-10 flex items-center justify-between w-full h-16 px-4 bg-white border-b border-gray-200 md:justify-end">
              <button 
                  onClick={() => setSidebarOpen(true)}
                  className="text-gray-500 md:hidden"
              >
                  <MenuIcon className="w-6 h-6" />
              </button>
              <div className="flex items-center">
                  <div className="text-right">
                      <span className="text-sm font-medium text-gray-700">{currentUser.name}</span>
                      <span className={`ml-2 px-2.5 py-0.5 text-xs font-semibold rounded-full ${getRoleClass(currentUser.role)}`}>{currentUser.role}</span>
                  </div>
                  <img className="w-8 h-8 ml-3 rounded-full" src="https://picsum.photos/100" alt="User Avatar" />
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
      </div>
  );
};

const App: React.FC = () => (
  <NotificationProvider>
    <AppContent />
  </NotificationProvider>
);


export default App;