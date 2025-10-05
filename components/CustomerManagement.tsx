import React, { useState, useMemo, useEffect } from 'react';
import { Customer, CustomerStatus, Asset, User, ActivityLogEntry } from '../types';
import { useSortableData, SortConfig } from '../hooks/useSortableData';
import { useLongPress } from '../hooks/useLongPress';
import { useNotification } from './shared/Notification';
import { exportToCSV } from '../utils/csvExporter';
import { SortIcon } from './icons/SortIcon';
import { SortAscIcon } from './icons/SortAscIcon';
import { SortDescIcon } from './icons/SortDescIcon';
import { SearchIcon } from './icons/SearchIcon';
import { CloseIcon } from './icons/CloseIcon';
import { Checkbox } from './shared/Checkbox';
import { PaginationControls } from './shared/PaginationControls';
import Modal from './shared/Modal';
import { InboxIcon } from './icons/InboxIcon';
import { ExportIcon } from './icons/ExportIcon';
import { EyeIcon } from './icons/EyeIcon';
import { TrashIcon } from './icons/TrashIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { DismantleIcon } from './icons/DismantleIcon';
import { PencilIcon } from './icons/PencilIcon';
import DatePicker from './shared/DatePicker';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { PreviewData } from './shared/PreviewModal';
import { ClickableLink } from './shared/ClickableLink';

interface CustomerManagementProps {
    currentUser: User;
    customers: Customer[];
    setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
    assets: Asset[];
    onInitiateDismantle: (asset: Asset) => void;
    onShowPreview: (data: PreviewData) => void;
    itemToEdit: { type: string; data: any } | null;
    onClearItemToEdit: () => void;
}

const generateMockCustomers = (): Customer[] => {
    const customers: Customer[] = [];
    const firstNames = ['Andi', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fajar', 'Gita', 'Hadi', 'Indah', 'Joko'];
    const lastNames = ['Susanto', 'Wijaya', 'Lestari', 'Setiawan', 'Pratama', 'Nugroho', 'Wahyuni', 'Gunawan', 'Saputra', 'Rahayu'];
    const statuses = Object.values(CustomerStatus);
    const packages = ['30 Mbps', '50 Mbps', '100 Mbps', 'Business 200 Mbps'];
    const streets = ['Jl. Merdeka', 'Jl. Sudirman', 'Jl. Pahlawan', 'Jl. Gatot Subroto', 'Jl. Diponegoro'];

    for (let i = 1; i <= 75; i++) {
        const firstName = firstNames[i % firstNames.length];
        const lastName = lastNames[i % lastNames.length];
        const name = `${firstName} ${lastName}`;
        customers.push({
            id: `TMI-${String(1000 + i).padStart(5, '0')}`,
            name: name,
            address: `${streets[i % streets.length]} No. ${i * 3}, Jakarta`,
            phone: `0812${String(Math.floor(10000000 + Math.random() * 90000000))}`,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
            status: statuses[i % statuses.length],
            installationDate: new Date(2023, i % 12, (i % 28) + 1).toISOString().split('T')[0],
            servicePackage: packages[i % packages.length],
            activityLog: [{
                id: `log-create-${i}`,
                timestamp: new Date(2023, i % 12, (i % 28) + 1).toISOString(),
                user: 'System',
                action: 'Pelanggan Dibuat',
                details: 'Data pelanggan awal dibuat oleh sistem.'
            }]
        });
    }
    return customers;
};

export const mockCustomers = generateMockCustomers();

export const getStatusClass = (status: CustomerStatus) => {
    switch (status) {
        case CustomerStatus.ACTIVE: return 'bg-success-light text-success-text';
        case CustomerStatus.INACTIVE: return 'bg-gray-200 text-gray-800';
        case CustomerStatus.SUSPENDED: return 'bg-warning-light text-warning-text';
        default: return 'bg-gray-100 text-gray-800';
    }
};

interface CustomerFormProps {
    customer: Customer | null;
    onSave: (formData: Omit<Customer, 'id' | 'activityLog'>) => void;
    onCancel: () => void;
    isLoading: boolean;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ customer, onSave, onCancel, isLoading }) => {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<CustomerStatus>(CustomerStatus.ACTIVE);
    const [installationDate, setInstallationDate] = useState<Date | null>(new Date());
    const [servicePackage, setServicePackage] = useState('');

    useEffect(() => {
        if (customer) {
            setName(customer.name);
            setAddress(customer.address);
            setPhone(customer.phone);
            setEmail(customer.email);
            setStatus(customer.status);
            setInstallationDate(new Date(customer.installationDate));
            setServicePackage(customer.servicePackage);
        } else {
            // Reset form for new customer
            setName('');
            setAddress('');
            setPhone('');
            setEmail('');
            setStatus(CustomerStatus.ACTIVE);
            setInstallationDate(new Date());
            setServicePackage('');
        }
    }, [customer]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            name,
            address,
            phone,
            email,
            status,
            installationDate: installationDate ? installationDate.toISOString().split('T')[0] : '',
            servicePackage
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">Nama Pelanggan</label>
                <input type="text" id="customerName" value={name} onChange={e => setName(e.target.value)} required className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm sm:text-sm" />
            </div>
            <div>
                <label htmlFor="customerAddress" className="block text-sm font-medium text-gray-700">Alamat</label>
                <textarea id="customerAddress" value={address} onChange={e => setAddress(e.target.value)} required rows={3} className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm sm:text-sm" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                 <div>
                    <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700">Telepon</label>
                    <input type="tel" id="customerPhone" value={phone} onChange={e => setPhone(e.target.value)} required className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" id="customerEmail" value={email} onChange={e => setEmail(e.target.value)} required className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm sm:text-sm" />
                </div>
            </div>
             <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                 <div>
                    <label htmlFor="customerStatus" className="block text-sm font-medium text-gray-700">Status</label>
                    <select id="customerStatus" value={status} onChange={e => setStatus(e.target.value as CustomerStatus)} className="block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md shadow-sm sm:text-sm">
                        {Object.values(CustomerStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="customerPackage" className="block text-sm font-medium text-gray-700">Paket Layanan</label>
                    <input type="text" id="customerPackage" value={servicePackage} onChange={e => setServicePackage(e.target.value)} placeholder="Contoh: 50 Mbps" required className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm sm:text-sm" />
                </div>
            </div>
             <div>
                <label htmlFor="installationDate" className="block text-sm font-medium text-gray-700">Tanggal Instalasi</label>
                <DatePicker id="installationDate" selectedDate={installationDate} onDateChange={setInstallationDate} />
            </div>
            <div className="flex items-center justify-end pt-5 mt-5 space-x-3 border-t">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Batal</button>
                <button type="submit" disabled={isLoading} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-tm-primary rounded-lg shadow-sm hover:bg-tm-primary-hover disabled:bg-tm-primary/70">
                    {isLoading && <SpinnerIcon className="w-4 h-4 mr-2" />}
                    {customer ? 'Simpan Perubahan' : 'Tambah Pelanggan'}
                </button>
            </div>
        </form>
    );
};


const CustomerManagement: React.FC<CustomerManagementProps> = ({ currentUser, customers, setCustomers, assets, onInitiateDismantle, onShowPreview, itemToEdit, onClearItemToEdit }) => {
    const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [activeDetailTab, setActiveDetailTab] = useState<'info' | 'assets' | 'history'>('info');

    const [isBulkSelectMode, setIsBulkSelectMode] = useState(false);
    const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
    
    const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
    const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
    const [isBulkStatusModalOpen, setIsBulkStatusModalOpen] = useState(false);
    const [targetStatus, setTargetStatus] = useState<CustomerStatus>(CustomerStatus.ACTIVE);
    const [isLoading, setIsLoading] = useState(false);

    const addNotification = useNotification();
    
    const { items: sortedCustomers, requestSort, sortConfig } = useSortableData(customers, { key: 'name', direction: 'ascending' });

    const handleOpenFormModal = (customer: Customer | null = null) => {
        setCustomerToEdit(customer);
        setIsFormModalOpen(true);
    };

    useEffect(() => {
        if (itemToEdit && itemToEdit.type === 'customer') {
            handleOpenFormModal(itemToEdit.data as Customer);
            onClearItemToEdit();
        }
    }, [itemToEdit, onClearItemToEdit]);

    const filteredCustomers = useMemo(() => {
        return sortedCustomers
            .filter(c => {
                const searchLower = searchQuery.toLowerCase();
                return (
                    c.id.toLowerCase().includes(searchLower) ||
                    c.name.toLowerCase().includes(searchLower) ||
                    c.address.toLowerCase().includes(searchLower)
                );
            })
            .filter(c => filterStatus ? c.status === filterStatus : true);
    }, [sortedCustomers, searchQuery, filterStatus]);
    
    const totalItems = filteredCustomers.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

    useEffect(() => { setCurrentPage(1); }, [searchQuery, filterStatus, itemsPerPage]);
    
    const { deletableCustomersCount, skippableCustomersCount } = useMemo(() => {
        if (!isBulkDeleteModalOpen) return { deletableCustomersCount: 0, skippableCustomersCount: 0 };
        
        const deletableIds = selectedCustomerIds.filter(id => !assets.some(a => a.currentUser === id));
        return {
            deletableCustomersCount: deletableIds.length,
            skippableCustomersCount: selectedCustomerIds.length - deletableIds.length,
        };
    }, [isBulkDeleteModalOpen, selectedCustomerIds, assets]);

    const handleShowDetails = (customer: Customer) => {
        setSelectedCustomer(customer);
        setActiveDetailTab('info');
        setIsDetailModalOpen(true);
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedCustomer(null);
    };

    const handleCloseFormModal = () => {
        setCustomerToEdit(null);
        setIsFormModalOpen(false);
    };
    
    const handleSaveCustomer = (formData: Omit<Customer, 'id' | 'activityLog'>) => {
        setIsLoading(true);
        setTimeout(() => {
            if (customerToEdit) {
                // Update
                setCustomers(prev => prev.map(c => c.id === customerToEdit.id ? { 
                    ...customerToEdit, 
                    ...formData,
                    activityLog: [
                        ...(c.activityLog || []),
                        {
                            id: `log-update-${Date.now()}`,
                            timestamp: new Date().toISOString(),
                            user: currentUser.name,
                            action: 'Data Diperbarui',
                            details: `Data pelanggan telah diperbarui.`
                        }
                    ]
                } : c));
                addNotification('Data pelanggan berhasil diperbarui.', 'success');
            } else {
                // Create
                const newCustomer: Customer = {
                    ...formData,
                    id: `TMI-${String(1000 + customers.length + 1).padStart(5, '0')}`,
                    activityLog: [{
                        id: `log-create-${Date.now()}`,
                        timestamp: new Date().toISOString(),
                        user: currentUser.name,
                        action: 'Pelanggan Dibuat',
                        details: 'Data pelanggan baru telah ditambahkan.'
                    }]
                };
                setCustomers(prev => [newCustomer, ...prev]);
                addNotification('Pelanggan baru berhasil ditambahkan.', 'success');
            }
            setIsLoading(false);
            handleCloseFormModal();
        }, 1000);
    };
    
    const handleConfirmDelete = () => {
        if (!customerToDelete) return;

        const hasAssets = assets.some(a => a.currentUser === customerToDelete.id);
        if (hasAssets) {
            addNotification('Pelanggan tidak dapat dihapus karena masih memiliki aset terpasang.', 'error');
            setCustomerToDelete(null);
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            setCustomers(prev => prev.filter(c => c.id !== customerToDelete.id));
            addNotification(`Pelanggan ${customerToDelete.name} berhasil dihapus.`, 'success');
            setCustomerToDelete(null);
            setIsLoading(false);
        }, 1000);
    };
    
     const handleBulkDelete = () => {
        const deletableCustomerIds = selectedCustomerIds.filter(id => !assets.some(a => a.currentUser === id));

        if (deletableCustomerIds.length === 0) {
            addNotification('Tidak ada pelanggan yang dapat dihapus (semua memiliki aset terpasang).', 'warning');
            setIsBulkDeleteModalOpen(false);
            return;
        }
        
        setIsLoading(true);
        setTimeout(() => {
            setCustomers(prev => prev.filter(c => !deletableCustomerIds.includes(c.id)));
            
            let message = `${deletableCustomerIds.length} pelanggan berhasil dihapus.`;
            if (skippableCustomersCount > 0) {
                message += ` ${skippableCustomersCount} pelanggan dilewati karena memiliki aset.`;
            }
            addNotification(message, 'success');

            setIsBulkDeleteModalOpen(false);
            setSelectedCustomerIds([]);
            setIsBulkSelectMode(false);
            setIsLoading(false);
        }, 1000);
    };
    
    const handleBulkStatusChange = () => {
        setIsLoading(true);
        setTimeout(() => {
            setCustomers(prev => prev.map(c => selectedCustomerIds.includes(c.id) ? { 
                ...c, 
                status: targetStatus,
                activityLog: [
                    ...(c.activityLog || []),
                    {
                        id: `log-status-${Date.now()}`,
                        timestamp: new Date().toISOString(),
                        user: currentUser.name,
                        action: 'Status Diubah',
                        details: `Status pelanggan diubah menjadi "${targetStatus}".`
                    }
                ]
            } : c));
            addNotification(`${selectedCustomerIds.length} pelanggan diubah statusnya menjadi "${targetStatus}".`, 'success');
            setIsBulkStatusModalOpen(false);
            setSelectedCustomerIds([]);
            setIsBulkSelectMode(false);
            setIsLoading(false);
        }, 1000);
    };


    if (currentUser.role === 'Staff') {
        return (
            <div className="flex items-center justify-center h-full p-8 text-center">
                <div>
                    <h1 className="text-2xl font-bold text-danger-text">Akses Ditolak</h1>
                    <p className="mt-2 text-gray-600">Anda tidak memiliki izin untuk mengakses halaman ini. Silakan hubungi administrator.</p>
                </div>
            </div>
        );
    }
    
    const longPressHandlers = useLongPress(() => setIsBulkSelectMode(true), 500);

    return (
        <div className="p-4 sm:p-6 md:p-8">
            <div className="flex flex-col items-start justify-between gap-4 mb-6 md:flex-row md:items-center">
                <h1 className="text-3xl font-bold text-tm-dark">Daftar Pelanggan</h1>
                <div className="flex items-center space-x-2">
                     <button onClick={() => exportToCSV(customers, 'daftar_pelanggan.csv')} className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border rounded-lg shadow-sm hover:bg-gray-50">
                        <ExportIcon className="w-4 h-4" /> Export CSV
                    </button>
                    <button onClick={() => handleOpenFormModal()} className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 rounded-lg shadow-sm bg-tm-primary hover:bg-tm-primary-hover">
                        Tambah Pelanggan
                    </button>
                </div>
            </div>

            <div className="p-4 mb-4 bg-white border border-gray-200/80 rounded-xl shadow-md">
                <div className="flex flex-col w-full gap-4 sm:flex-row sm:flex-wrap sm:items-center">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <SearchIcon className="w-5 h-5 text-gray-400" />
                        </div>
                        <input type="text" placeholder="Cari ID, Nama, Alamat..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full h-10 py-2 pl-10 pr-4 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-tm-accent focus:border-tm-accent" />
                    </div>
                    <select onChange={e => setFilterStatus(e.target.value)} value={filterStatus} className="w-full h-10 px-3 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-300 rounded-lg sm:w-auto focus:ring-tm-accent focus:border-tm-accent">
                        <option value="">Semua Status</option>
                        {Object.values(CustomerStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>

             {isBulkSelectMode && (
                <div className="p-4 mb-4 bg-blue-50 border-l-4 border-tm-accent rounded-r-lg">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="text-sm font-medium text-tm-primary">{selectedCustomerIds.length} pelanggan terpilih</span>
                            <div className="h-5 border-l border-gray-300"></div>
                            <button onClick={() => setIsBulkStatusModalOpen(true)} className="px-3 py-1.5 text-sm font-semibold text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200">Ubah Status</button>
                            <button onClick={() => setIsBulkDeleteModalOpen(true)} className="px-3 py-1.5 text-sm font-semibold text-red-600 bg-red-100 rounded-md hover:bg-red-200">Hapus</button>
                        </div>
                        <button onClick={() => { setIsBulkSelectMode(false); setSelectedCustomerIds([]); }} className="px-3 py-1.5 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Batal</button>
                    </div>
                </div>
            )}


            <div className="bg-white border border-gray-200/80 rounded-xl shadow-md">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {isBulkSelectMode && <th className="px-6 py-3"><Checkbox checked={selectedCustomerIds.length > 0 && selectedCustomerIds.length === paginatedCustomers.length} onChange={e => setSelectedCustomerIds(e.target.checked ? paginatedCustomers.map(c => c.id) : [])} /></th>}
                                <th className="px-6 py-3 text-sm font-semibold tracking-wider text-left text-gray-500">Pelanggan</th>
                                <th className="px-6 py-3 text-sm font-semibold tracking-wider text-left text-gray-500">Kontak</th>
                                <th className="px-6 py-3 text-sm font-semibold tracking-wider text-left text-gray-500">Jumlah Aset</th>
                                <th className="px-6 py-3 text-sm font-semibold tracking-wider text-left text-gray-500">Status</th>
                                <th className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedCustomers.map(customer => {
                                const assetCount = assets.filter(a => a.currentUser === customer.id).length;
                                return (
                                <tr key={customer.id} {...longPressHandlers} onClick={() => isBulkSelectMode ? setSelectedCustomerIds(prev => prev.includes(customer.id) ? prev.filter(id => id !== customer.id) : [...prev, customer.id]) : handleShowDetails(customer)} className={`cursor-pointer transition-colors ${selectedCustomerIds.includes(customer.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                                    {isBulkSelectMode && <td className="px-6 py-4" onClick={e => e.stopPropagation()}><Checkbox checked={selectedCustomerIds.includes(customer.id)} onChange={() => setSelectedCustomerIds(prev => prev.includes(customer.id) ? prev.filter(id => id !== customer.id) : [...prev, customer.id])} /></td>}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-semibold text-gray-900">{customer.name}</div>
                                        <div className="text-xs text-gray-500">{customer.id}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-800">{customer.phone}</div>
                                        <div className="text-xs text-gray-500">{customer.address}</div>
                                    </td>
                                     <td className="px-6 py-4 text-sm font-medium text-center text-gray-800 whitespace-nowrap">
                                        {assetCount > 0 ? (
                                            <button onClick={(e) => { e.stopPropagation(); onShowPreview({type: 'customerAssets', id: customer.id})}} className="font-semibold text-tm-primary hover:underline">{assetCount}</button>
                                        ) : (
                                            <span>{assetCount}</span>
                                        )}
                                     </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(customer.status)}`}>
                                            {customer.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button onClick={(e) => { e.stopPropagation(); handleShowDetails(customer); }} className="flex items-center justify-center w-8 h-8 text-gray-500 transition-colors bg-gray-100 rounded-full hover:bg-info-light hover:text-info-text"><EyeIcon className="w-5 h-5" /></button>
                                            <button onClick={(e) => { e.stopPropagation(); handleOpenFormModal(customer); }} className="flex items-center justify-center w-8 h-8 text-gray-500 transition-colors bg-gray-100 rounded-full hover:bg-yellow-100 hover:text-yellow-600"><PencilIcon className="w-4 h-4" /></button>
                                            <button onClick={(e) => { e.stopPropagation(); setCustomerToDelete(customer); }} className="flex items-center justify-center w-8 h-8 text-gray-500 transition-colors bg-gray-100 rounded-full hover:bg-danger-light hover:text-danger-text"><TrashIcon className="w-5 h-5" /></button>
                                        </div>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
                <PaginationControls currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} onItemsPerPageChange={setItemsPerPage} startIndex={startIndex} endIndex={endIndex} />
            </div>
            
            {selectedCustomer && (
                <Modal isOpen={isDetailModalOpen} onClose={handleCloseDetailModal} title={`Detail Pelanggan: ${selectedCustomer.name}`} size="2xl">
                    <div className="border-b border-gray-200">
                        <nav className="flex -mb-px space-x-6" aria-label="Tabs">
                            <button onClick={() => setActiveDetailTab('info')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeDetailTab === 'info' ? 'border-tm-primary text-tm-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Detail Info</button>
                            <button onClick={() => setActiveDetailTab('assets')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeDetailTab === 'assets' ? 'border-tm-primary text-tm-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Aset Terpasang</button>
                            <button onClick={() => setActiveDetailTab('history')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeDetailTab === 'history' ? 'border-tm-primary text-tm-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Riwayat Aktivitas</button>
                        </nav>
                    </div>
                    <div className="pt-6">
                        {activeDetailTab === 'info' && (
                             <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 text-sm">
                                <div><dt className="font-medium text-gray-500">ID Pelanggan</dt><dd className="text-gray-900">{selectedCustomer.id}</dd></div>
                                <div><dt className="font-medium text-gray-500">Telepon</dt><dd className="text-gray-900">{selectedCustomer.phone}</dd></div>
                                <div className="sm:col-span-2"><dt className="font-medium text-gray-500">Alamat</dt><dd className="text-gray-900">{selectedCustomer.address}</dd></div>
                                <div><dt className="font-medium text-gray-500">Status</dt><dd><span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusClass(selectedCustomer.status)}`}>{selectedCustomer.status}</span></dd></div>
                                <div><dt className="font-medium text-gray-500">Paket</dt><dd className="text-gray-900">{selectedCustomer.servicePackage}</dd></div>
                                <div><dt className="font-medium text-gray-500">Tgl Pasang</dt><dd className="text-gray-900">{selectedCustomer.installationDate}</dd></div>
                            </dl>
                        )}
                         {activeDetailTab === 'assets' && (
                            <ul className="space-y-2">
                                {assets.filter(a => a.currentUser === selectedCustomer.id).map(asset => (
                                    <li key={asset.id} className="flex items-center justify-between p-3 text-sm bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-semibold text-gray-800">
                                                 <ClickableLink onClick={() => onShowPreview({type: 'asset', id: asset.id})}>
                                                    {asset.name}
                                                </ClickableLink>
                                            </p>
                                            <p className="text-xs text-gray-500 font-mono">{asset.id} &bull; SN: {asset.serialNumber}</p>
                                        </div>
                                        <button onClick={() => { onInitiateDismantle(asset); handleCloseDetailModal(); }} className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-danger rounded-md hover:bg-red-700"><DismantleIcon className="w-4 h-4" /> Tarik Aset</button>
                                    </li>
                                ))}
                                {assets.filter(a => a.currentUser === selectedCustomer.id).length === 0 && <p className="text-sm text-center text-gray-500 py-4">Tidak ada aset terpasang.</p>}
                            </ul>
                        )}
                        {activeDetailTab === 'history' && (
                             <ol className="relative border-l border-gray-200 ml-2">
                                {(selectedCustomer.activityLog || []).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((log, index) => (
                                <li key={index} className="mb-6 ml-6">
                                    <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-4 ring-white">
                                        <PencilIcon className="w-3.5 h-3.5 text-blue-800" />
                                    </span>
                                    <time className="block mb-1 text-xs font-normal leading-none text-gray-400">{new Date(log.timestamp).toLocaleString('id-ID')}</time>
                                    <h3 className="text-sm font-semibold text-gray-900">{log.action}</h3>
                                    <p className="text-sm font-normal text-gray-500">{log.details} oleh {log.user}.</p>
                                </li>
                                ))}
                            </ol>
                        )}
                    </div>
                </Modal>
            )}

            <Modal isOpen={isFormModalOpen} onClose={handleCloseFormModal} title={customerToEdit ? 'Edit Pelanggan' : 'Tambah Pelanggan Baru'} hideDefaultCloseButton>
                <CustomerForm customer={customerToEdit} onSave={handleSaveCustomer} onCancel={handleCloseFormModal} isLoading={isLoading} />
            </Modal>
            
            <Modal isOpen={!!customerToDelete} onClose={() => setCustomerToDelete(null)} title="Konfirmasi Hapus" footerContent={<><button onClick={() => setCustomerToDelete(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Batal</button><button onClick={handleConfirmDelete} disabled={isLoading} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-danger rounded-lg shadow-sm hover:bg-red-700">{isLoading && <SpinnerIcon className="w-4 h-4 mr-2"/>}Konfirmasi Hapus</button></>}>
                <p className="text-sm text-gray-600">Anda yakin ingin menghapus <strong>{customerToDelete?.name}</strong>? Aksi ini tidak dapat diurungkan.</p>
            </Modal>

            <Modal isOpen={isBulkDeleteModalOpen} onClose={() => setIsBulkDeleteModalOpen(false)} title="Konfirmasi Hapus Pelanggan Massal" size="md" hideDefaultCloseButton>
                <div className="flex flex-col items-center text-center">
                    <div className="flex items-center justify-center w-12 h-12 mb-4 text-red-600 bg-red-100 rounded-full">
                        <ExclamationTriangleIcon className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">
                        Hapus {deletableCustomersCount} Pelanggan?
                    </h3>
                    <p className="mt-2 text-sm text-gray-600">
                        Anda akan menghapus pelanggan yang dipilih secara permanen. Aksi ini tidak dapat diurungkan.
                    </p>

                    <div className="w-full p-3 mt-4 text-sm text-left bg-gray-50 border rounded-lg">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Total Pelanggan Dipilih:</span>
                            <span className="font-semibold text-gray-800">{selectedCustomerIds.length}</span>
                        </div>
                        <div className="flex justify-between mt-1 text-green-700">
                            <span className="font-medium">Akan Dihapus:</span>
                            <span className="font-bold">{deletableCustomersCount}</span>
                        </div>
                        <div className="flex justify-between mt-1 text-amber-700">
                            <span className="font-medium">Dilewati (memiliki aset):</span>
                            <span className="font-bold">{skippableCustomersCount}</span>
                        </div>
                    </div>
                    
                    {deletableCustomersCount === 0 && skippableCustomersCount > 0 && (
                        <p className="mt-4 text-sm font-semibold text-red-700">
                            Tidak ada pelanggan yang dapat dihapus. Semua pelanggan yang dipilih memiliki aset terpasang.
                        </p>
                    )}
                </div>
                 <div className="flex items-center justify-end pt-5 mt-5 space-x-3 border-t">
                    <button type="button" onClick={() => setIsBulkDeleteModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Batal</button>
                    <button type="button" onClick={handleBulkDelete} disabled={isLoading || deletableCustomersCount === 0} className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-danger rounded-lg shadow-sm hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed">
                        {isLoading && <SpinnerIcon className="w-4 h-4 mr-2"/>}
                        Ya, Hapus ({deletableCustomersCount}) Pelanggan
                    </button>
                </div>
            </Modal>

            <Modal isOpen={isBulkStatusModalOpen} onClose={() => setIsBulkStatusModalOpen(false)} title="Ubah Status Pelanggan" footerContent={<><button onClick={() => setIsBulkStatusModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Batal</button><button onClick={handleBulkStatusChange} disabled={isLoading} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-tm-primary rounded-lg shadow-sm hover:bg-tm-primary-hover">{isLoading && <SpinnerIcon className="w-4 h-4 mr-2"/>}Ubah Status</button></>}>
                <p className="mb-4 text-sm text-gray-600">Pilih status baru untuk <strong>{selectedCustomerIds.length}</strong> pelanggan yang dipilih.</p>
                <select value={targetStatus} onChange={e => setTargetStatus(e.target.value as CustomerStatus)} className="block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md shadow-sm sm:text-sm">
                    {Object.values(CustomerStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </Modal>
        </div>
    );
};

export default CustomerManagement;