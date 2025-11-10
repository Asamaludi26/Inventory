
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Customer, CustomerStatus, Asset, User, ActivityLogEntry, PreviewData, AssetStatus, Page } from '../../../types';
import { useSortableData, SortConfig } from '../../../hooks/useSortableData';
import { useLongPress } from '../../../hooks/useLongPress';
import { useNotification } from '../../../providers/NotificationProvider';
import { exportToCSV } from '../../../utils/csvExporter';
import { SortIcon } from '../../../components/icons/SortIcon';
import { SortAscIcon } from '../../../components/icons/SortAscIcon';
import { SortDescIcon } from '../../../components/icons/SortDescIcon';
import { SearchIcon } from '../../../components/icons/SearchIcon';
import { CloseIcon } from '../../../components/icons/CloseIcon';
import { Checkbox } from '../../../components/ui/Checkbox';
import { PaginationControls } from '../../../components/ui/PaginationControls';
import Modal from '../../../components/ui/Modal';
import { InboxIcon } from '../../../components/icons/InboxIcon';
import { ExportIcon } from '../../../components/icons/ExportIcon';
import { EyeIcon } from '../../../components/icons/EyeIcon';
import { TrashIcon } from '../../../components/icons/TrashIcon';
import { SpinnerIcon } from '../../../components/icons/SpinnerIcon';
import { DismantleIcon } from '../../../components/icons/DismantleIcon';
import { PencilIcon } from '../../../components/icons/PencilIcon';
import DatePicker from '../../../components/ui/DatePicker';
import { ExclamationTriangleIcon } from '../../../components/icons/ExclamationTriangleIcon';
import { ClickableLink } from '../../../components/ui/ClickableLink';
import { CustomSelect } from '../../../components/ui/CustomSelect';
import FloatingActionBar from '../../../components/ui/FloatingActionBar';
import { UsersIcon } from '../../../components/icons/UsersIcon';
import { WrenchIcon } from '../../../components/icons/WrenchIcon';
import { CustomerIcon } from '../../../components/icons/CustomerIcon';
import { FilterIcon } from '../../../components/icons/FilterIcon';
import { CheckIcon } from '../../../components/icons/CheckIcon';

interface CustomerListPageProps {
    currentUser: User;
    customers: Customer[];
    setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
    assets: Asset[];
    onInitiateDismantle: (asset: Asset) => void;
    onShowPreview: (data: PreviewData) => void;
    itemToEdit: { type: string; data: any } | null;
    onClearItemToEdit: () => void;
    setActivePage: (page: Page) => void;
}

export const getStatusClass = (status: CustomerStatus) => {
    switch (status) {
        case CustomerStatus.ACTIVE: return 'bg-success-light text-success-text';
        case CustomerStatus.INACTIVE: return 'bg-gray-200 text-gray-800';
        case CustomerStatus.SUSPENDED: return 'bg-warning-light text-warning-text';
        default: return 'bg-gray-100 text-gray-800';
    }
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


const CustomerForm: React.FC<{ 
    customer: Customer | null;
    onSave: (formData: Omit<Customer, 'id' | 'activityLog'>) => void;
    onCancel: () => void;
    isLoading: boolean;
}> = ({ customer, onSave, onCancel, isLoading }) => {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<CustomerStatus>(CustomerStatus.ACTIVE);
    const [installationDate, setInstallationDate] = useState<Date | null>(new Date());
    const [servicePackage, setServicePackage] = useState('');
    
    // Validation states
    const [emailError, setEmailError] = useState('');
    const [addressError, setAddressError] = useState('');

    const footerRef = useRef<HTMLDivElement>(null);
    const [isFooterVisible, setIsFooterVisible] = useState(true);
    const formId = "customer-form";
    const addNotification = useNotification();

    useEffect(() => {
        if (customer) {
            setName(customer.name);
            setAddress(customer.address);
            setPhone(customer.phone);
            setEmail(customer.email);
            setStatus(customer.status);
            setInstallationDate(new Date(customer.installationDate));
            setServicePackage(customer.servicePackage.replace(/\D/g, ''));
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

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => setIsFooterVisible(entry.isIntersecting),
            { root: null, rootMargin: "0px", threshold: 0.1 }
        );
        const currentRef = footerRef.current;
        if (currentRef) observer.observe(currentRef);
        return () => { if (currentRef) observer.unobserve(currentRef); };
    }, []);

    // --- Input Handlers ---
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^[a-zA-Z\s]*$/.test(value)) {
            setName(value);
        }
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const numericValue = value.replace(/[^\d+]/g, ''); // Allow '+' for initial input
        setPhone(numericValue);
    };

    const formatAndValidatePhone = () => {
        let numeric = phone.replace(/\D/g, '');
        if (!numeric) return;

        if (numeric.startsWith('0')) {
            numeric = '62' + numeric.substring(1);
        } else if (!numeric.startsWith('62')) {
            numeric = '62' + numeric;
        }

        const match = numeric.match(/^(\d{2})(\d{3})(\d{4})(\d*)$/);
        if (match) {
            setPhone(`+${match[1]}-${match[2]}-${match[3]}-${match[4]}`);
        } else {
            setPhone(`+${numeric}`);
        }
    };
    
    const validateEmail = () => {
        if (email && !/\S+@\S+\.\S+/.test(email)) {
            setEmailError('Format email tidak valid.');
            return false;
        }
        setEmailError('');
        return true;
    };

    const validateAddress = () => {
        if (address && address.trim().length < 10) {
            setAddressError('Alamat terlalu pendek, harap isi lebih lengkap.');
            return false;
        }
        setAddressError('');
        return true;
    };

    const handlePackageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const numericValue = value.replace(/\D/g, '');
        setServicePackage(numericValue);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const isEmailValid = validateEmail();
        const isAddressValid = validateAddress();

        if (!isEmailValid || !isAddressValid) {
            addNotification('Harap perbaiki data yang tidak valid pada formulir.', 'error');
            return;
        }

        onSave({
            name,
            address,
            phone,
            email,
            status,
            installationDate: installationDate ? installationDate.toISOString().split('T')[0] : '',
            servicePackage: servicePackage ? `${servicePackage} Mbps` : ''
        });
    };
    
     const ActionButtons: React.FC<{ formId?: string }> = ({ formId }) => (
        <>
            <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Batal</button>
            <button type="submit" form={formId} disabled={isLoading} className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 rounded-lg shadow-sm bg-tm-primary hover:bg-tm-primary-hover disabled:bg-tm-primary/70">
                {isLoading && <SpinnerIcon className="w-4 h-4 mr-2" />}
                {customer ? 'Simpan Perubahan' : 'Tambah Pelanggan'}
            </button>
        </>
    );

    return (
        <>
            <form id={formId} onSubmit={handleSubmit} className="space-y-4">
                 <FormSection title="Informasi Kontak" icon={<UsersIcon className="w-6 h-6 mr-3 text-tm-primary" />}>
                     <div className="md:col-span-2">
                        <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">Nama Pelanggan</label>
                        <input type="text" id="customerName" value={name} onChange={handleNameChange} required className="block w-full px-3 py-2 mt-1 text-gray-900 placeholder:text-gray-400 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-tm-accent focus:border-tm-accent sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700">Telepon</label>
                        <input type="tel" id="customerPhone" value={phone} onChange={handlePhoneChange} onBlur={formatAndValidatePhone} required className="block w-full px-3 py-2 mt-1 text-gray-900 placeholder:text-gray-400 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-tm-accent focus:border-tm-accent sm:text-sm" placeholder="+62..." />
                    </div>
                    <div>
                        <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" id="customerEmail" value={email} onChange={e => setEmail(e.target.value)} onBlur={validateEmail} required className={`block w-full px-3 py-2 mt-1 text-gray-900 placeholder:text-gray-400 bg-gray-50 border rounded-lg shadow-sm focus:outline-none focus:ring-tm-accent focus:border-tm-accent sm:text-sm ${emailError ? 'border-red-500' : 'border-gray-300'}`} />
                        {emailError && <p className="mt-1 text-xs text-red-600">{emailError}</p>}
                    </div>
                </FormSection>

                 <FormSection title="Alamat Lengkap" icon={<CustomerIcon className="w-6 h-6 mr-3 text-tm-primary" />}>
                    <div className="md:col-span-2">
                        <label htmlFor="customerAddress" className="block text-sm font-medium text-gray-700">Alamat</label>
                        <textarea id="customerAddress" value={address} onChange={e => setAddress(e.target.value)} onBlur={validateAddress} required rows={3} className={`block w-full px-3 py-2 mt-1 text-gray-900 placeholder:text-gray-400 bg-gray-50 border rounded-lg shadow-sm focus:outline-none focus:ring-tm-accent focus:border-tm-accent sm:text-sm ${addressError ? 'border-red-500' : 'border-gray-300'}`} />
                        {addressError && <p className="mt-1 text-xs text-red-600">{addressError}</p>}
                    </div>
                </FormSection>

                <FormSection title="Detail Layanan & Status" icon={<WrenchIcon className="w-6 h-6 mr-3 text-tm-primary" />}>
                     <div>
                        <label htmlFor="customerPackage" className="block text-sm font-medium text-gray-700">Paket Layanan</label>
                        <div className="relative mt-1">
                            <input type="text" id="customerPackage" value={servicePackage} onChange={handlePackageChange} placeholder="Contoh: 50" required className="block w-full px-3 py-2 pr-12 text-gray-900 placeholder:text-gray-400 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-tm-accent focus:border-tm-accent sm:text-sm" />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">Mbps</span>
                            </div>
                        </div>
                    </div>
                     <div>
                        <label htmlFor="installationDate" className="block text-sm font-medium text-gray-700">Tanggal Instalasi</label>
                        <div className="mt-1"><DatePicker id="installationDate" selectedDate={installationDate} onDateChange={setInstallationDate} /></div>
                    </div>
                    <div>
                        <label htmlFor="customerStatus" className="block text-sm font-medium text-gray-700">Status</label>
                        <div className="mt-1">
                            <CustomSelect
                                options={Object.values(CustomerStatus).map(s => ({ value: s, label: s }))}
                                value={status}
                                onChange={value => setStatus(value as CustomerStatus)}
                            />
                        </div>
                    </div>
                </FormSection>

                <div ref={footerRef} className="flex justify-end pt-5 mt-5 space-x-3 border-t">
                    <ActionButtons />
                </div>
            </form>
            <FloatingActionBar isVisible={!isFooterVisible}>
                <ActionButtons formId={formId} />
            </FloatingActionBar>
        </>
    );
};

const SummaryCard: React.FC<{
    title: string;
    value: number;
    icon: React.FC<{ className?: string }>;
    onClick: () => void;
    isActive: boolean;
    color: 'blue' | 'green' | 'amber' | 'gray';
}> = ({ title, value, icon: Icon, onClick, isActive, color }) => {
    const colorClasses = {
        blue: { text: 'text-blue-700', bg: 'bg-blue-100', border: 'border-blue-500' },
        green: { text: 'text-green-700', bg: 'bg-green-100', border: 'border-green-500' },
        amber: { text: 'text-amber-700', bg: 'bg-amber-100', border: 'border-amber-500' },
        gray: { text: 'text-gray-700', bg: 'bg-gray-100', border: 'border-gray-500' },
    };

    const currentColors = colorClasses[color];

    return (
        <div
            onClick={onClick}
            className={`p-4 bg-white rounded-lg cursor-pointer transition-all duration-200 border-l-4 hover:shadow-md hover:border-l-tm-primary ${
                isActive ? `ring-2 ring-offset-1 ${currentColors.border} ring-opacity-60` : 'border-gray-200/80'
            } ${currentColors.border}`}
        >
            <div className="flex items-center gap-4">
                <div className={`flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-full ${currentColors.bg}`}>
                    <Icon className={`w-5 h-5 ${currentColors.text}`} />
                </div>
                <div className="flex-1">
                    <p className="text-2xl font-bold text-tm-dark">{value}</p>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
                </div>
            </div>
        </div>
    );
};


const CustomerListPage: React.FC<CustomerListPageProps> = ({ currentUser, customers, setCustomers, assets, onInitiateDismantle, onShowPreview, itemToEdit, onClearItemToEdit }) => {
    const [view, setView] = useState<'list' | 'form'>('list');
    const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    
    const [searchQuery, setSearchQuery] = useState('');
    const initialFilterState = { status: '' };
    const [filters, setFilters] = useState(initialFilterState);
    const [tempFilters, setTempFilters] = useState(filters);
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const filterPanelRef = useRef<HTMLDivElement>(null);

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

    const handleOpenForm = (customer: Customer | null = null) => {
        setCustomerToEdit(customer);
        setView('form');
    };

    useEffect(() => {
        if (itemToEdit && itemToEdit.type === 'customer') {
            handleOpenForm(itemToEdit.data as Customer);
            onClearItemToEdit();
        }
    }, [itemToEdit, onClearItemToEdit]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (filterPanelRef.current && !filterPanelRef.current.contains(event.target as Node)) {
                setIsFilterPanelOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => { document.removeEventListener("mousedown", handleClickOutside); };
    }, [filterPanelRef]);

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

    const summary = useMemo(() => {
        const counts = {
            [CustomerStatus.ACTIVE]: 0,
            [CustomerStatus.INACTIVE]: 0,
            [CustomerStatus.SUSPENDED]: 0,
        };
        customers.forEach(customer => {
            if (counts[customer.status] !== undefined) {
                counts[customer.status]++;
            }
        });
        return {
            active: counts[CustomerStatus.ACTIVE],
            inactive: counts[CustomerStatus.INACTIVE],
            suspended: counts[CustomerStatus.SUSPENDED],
            total: customers.length,
        };
    }, [customers]);

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
            .filter(c => filters.status ? c.status === filters.status : true);
    }, [sortedCustomers, searchQuery, filters]);
    
    const totalItems = filteredCustomers.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

    useEffect(() => { setCurrentPage(1); }, [searchQuery, filters, itemsPerPage]);
    
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
            setView('list');
            setCustomerToEdit(null);
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
            addNotification('Tidak ada pelanggan yang dapat dihapus (semua memiliki aset terpasang).', 'error');
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

    const statusOptions = Object.values(CustomerStatus).map(s => ({ value: s, label: s }));

    const renderContent = () => {
        if (view === 'form') {
            return (
                <div className="p-4 sm:p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl font-bold text-tm-dark">{customerToEdit ? 'Edit Pelanggan' : 'Tambah Pelanggan Baru'}</h1>
                        <button
                            onClick={() => setView('list')}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tm-accent"
                        >
                            Kembali ke Daftar
                        </button>
                    </div>
                    <div className="p-4 sm:p-6 bg-white border border-gray-200/80 rounded-xl shadow-md pb-24">
                        <CustomerForm customer={customerToEdit} onSave={handleSaveCustomer} onCancel={() => setView('list')} isLoading={isLoading} />
                    </div>
                </div>
            );
        }

        return (
             <div className="p-4 sm:p-6 md:p-8">
                <div className="flex flex-col items-start justify-between gap-4 mb-6 md:flex-row md:items-center">
                    <h1 className="text-3xl font-bold text-tm-dark">Daftar Pelanggan</h1>
                    <div className="flex items-center space-x-2">
                        <button onClick={() => exportToCSV(customers, 'daftar_pelanggan.csv')} className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border rounded-lg shadow-sm hover:bg-gray-50">
                            <ExportIcon className="w-4 h-4" /> Export CSV
                        </button>
                        <button onClick={() => handleOpenForm()} className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 rounded-lg shadow-sm bg-tm-primary hover:bg-tm-primary-hover">
                            Tambah Pelanggan
                        </button>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 gap-5 mb-6 sm:grid-cols-2 lg:grid-cols-4">
                    <SummaryCard
                        title="Total Pelanggan"
                        value={summary.total}
                        icon={UsersIcon}
                        color="blue"
                        isActive={filters.status === ''}
                        onClick={() => {
                            const newStatus = '';
                            setFilters(f => ({ ...f, status: newStatus }));
                            setTempFilters(f => ({ ...f, status: newStatus }));
                        }}
                    />
                    <SummaryCard
                        title="Pelanggan Aktif"
                        value={summary.active}
                        icon={CheckIcon}
                        color="green"
                        isActive={filters.status === CustomerStatus.ACTIVE}
                        onClick={() => {
                            const newStatus = CustomerStatus.ACTIVE;
                            setFilters(f => ({ ...f, status: newStatus }));
                            setTempFilters(f => ({ ...f, status: newStatus }));
                        }}
                    />
                    <SummaryCard
                        title="Pelanggan Suspend"
                        value={summary.suspended}
                        icon={ExclamationTriangleIcon}
                        color="amber"
                        isActive={filters.status === CustomerStatus.SUSPENDED}
                        onClick={() => {
                            const newStatus = CustomerStatus.SUSPENDED;
                            setFilters(f => ({ ...f, status: newStatus }));
                            setTempFilters(f => ({ ...f, status: newStatus }));
                        }}
                    />
                    <SummaryCard
                        title="Pelanggan Tidak Aktif"
                        value={summary.inactive}
                        icon={CloseIcon}
                        color="gray"
                        isActive={filters.status === CustomerStatus.INACTIVE}
                        onClick={() => {
                            const newStatus = CustomerStatus.INACTIVE;
                            setFilters(f => ({ ...f, status: newStatus }));
                            setTempFilters(f => ({ ...f, status: newStatus }));
                        }}
                    />
                </div>

                <div className="p-4 mb-4 bg-white border border-gray-200/80 rounded-xl shadow-md">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative flex-grow">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <SearchIcon className="w-5 h-5 text-gray-400" />
                            </div>
                            <input type="text" placeholder="Cari ID, Nama, Alamat..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full h-10 py-2 pl-10 pr-4 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-tm-accent focus:border-tm-accent" />
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
                                            <h3 className="text-lg font-semibold text-gray-800">Filter Pelanggan</h3>
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


                <div className="overflow-hidden bg-white border border-gray-200/80 rounded-xl shadow-md">
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
                                                <button onClick={(e) => { e.stopPropagation(); handleOpenForm(customer); }} className="flex items-center justify-center w-8 h-8 text-gray-500 transition-colors bg-gray-100 rounded-full hover:bg-yellow-100 hover:text-yellow-600"><PencilIcon className="w-4 h-4" /></button>
                                                <button onClick={(e) => { e.stopPropagation(); setCustomerToDelete(customer); }} className="flex items-center justify-center w-8 h-8 text-gray-500 transition-colors bg-gray-100 rounded-full hover:bg-danger-light hover:text-danger-text"><TrashIcon className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                )})}
                            </tbody>
                        </table>
                    </div>
                    <PaginationControls currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} onItemsPerPageChange={setItemsPerPage} startIndex={startIndex} endIndex={endIndex} />
                </div>
            </div>
        )
    }

    return (
        <>
            {renderContent()}

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
                <CustomSelect
                    options={Object.values(CustomerStatus).map(s => ({ value: s, label: s }))}
                    value={targetStatus}
                    onChange={value => setTargetStatus(value as CustomerStatus)}
                />
            </Modal>
        </>
    );
};

export default CustomerListPage;
