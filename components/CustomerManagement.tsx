import React, { useState, useMemo, useEffect } from 'react';
import { Customer, CustomerStatus, Asset } from '../types';
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

interface CustomerManagementProps {
    customers: Customer[];
    setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
    assets: Asset[];
    onInitiateDismantle: (asset: Asset) => void;
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
        });
    }
    return customers;
};

export const mockCustomers = generateMockCustomers();

const getStatusClass = (status: CustomerStatus) => {
    switch (status) {
        case CustomerStatus.ACTIVE: return 'bg-success-light text-success-text';
        case CustomerStatus.INACTIVE: return 'bg-gray-200 text-gray-800';
        case CustomerStatus.SUSPENDED: return 'bg-warning-light text-warning-text';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const CustomerManagement: React.FC<CustomerManagementProps> = ({ customers, setCustomers, assets, onInitiateDismantle }) => {
    const [view, setView] = useState<'list' | 'form'>('list');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    
    const { items: sortedCustomers, requestSort, sortConfig } = useSortableData(customers, { key: 'name', direction: 'ascending' });

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

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterStatus, itemsPerPage]);

    const handleShowDetails = (customer: Customer) => {
        setSelectedCustomer(customer);
        setIsDetailModalOpen(true);
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedCustomer(null);
    };

    return (
        <div className="p-4 sm:p-6 md:p-8">
            <div className="flex flex-col items-start justify-between gap-4 mb-6 md:flex-row md:items-center">
                <h1 className="text-3xl font-bold text-tm-dark">Daftar Pelanggan</h1>
                <div className="flex items-center space-x-2">
                    <button className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 rounded-lg shadow-sm bg-tm-primary hover:bg-tm-primary-hover">
                        Tambah Pelanggan Baru
                    </button>
                </div>
            </div>

            <div className="p-4 mb-4 bg-white border border-gray-200/80 rounded-xl shadow-md">
                <div className="flex flex-col w-full gap-4 sm:flex-row sm:flex-wrap sm:items-center">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <SearchIcon className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Cari ID, Nama, Alamat..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full h-10 py-2 pl-10 pr-4 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-tm-accent focus:border-tm-accent"
                        />
                    </div>
                    <select onChange={e => setFilterStatus(e.target.value)} value={filterStatus} className="w-full h-10 px-3 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-300 rounded-lg sm:w-auto focus:ring-tm-accent focus:border-tm-accent">
                        <option value="">Semua Status</option>
                        {Object.values(CustomerStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            <div className="bg-white border border-gray-200/80 rounded-xl shadow-md">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-sm font-semibold tracking-wider text-left text-gray-500">Pelanggan</th>
                                <th className="px-6 py-3 text-sm font-semibold tracking-wider text-left text-gray-500">Kontak</th>
                                <th className="px-6 py-3 text-sm font-semibold tracking-wider text-left text-gray-500">Status</th>
                                <th className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedCustomers.map(customer => (
                                <tr key={customer.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-semibold text-gray-900">{customer.name}</div>
                                        <div className="text-xs text-gray-500">{customer.id}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-800">{customer.phone}</div>
                                        <div className="text-xs text-gray-500">{customer.address}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(customer.status)}`}>
                                            {customer.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                                        <button onClick={() => handleShowDetails(customer)} className="flex items-center justify-center w-8 h-8 text-gray-500 transition-colors bg-gray-100 rounded-full hover:bg-info-light hover:text-info-text">
                                            <EyeIcon className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={setItemsPerPage}
                    startIndex={startIndex}
                    endIndex={endIndex}
                />
            </div>
            
            {selectedCustomer && (
                <Modal isOpen={isDetailModalOpen} onClose={handleCloseDetailModal} title={`Detail Pelanggan: ${selectedCustomer.name}`} size="2xl">
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-semibold text-gray-800">Informasi Kontak</h3>
                            <dl className="grid grid-cols-2 gap-4 mt-2 text-sm">
                                <div><dt className="font-medium text-gray-500">ID Pelanggan</dt><dd className="text-gray-900">{selectedCustomer.id}</dd></div>
                                <div><dt className="font-medium text-gray-500">Telepon</dt><dd className="text-gray-900">{selectedCustomer.phone}</dd></div>
                                <div className="col-span-2"><dt className="font-medium text-gray-500">Alamat</dt><dd className="text-gray-900">{selectedCustomer.address}</dd></div>
                            </dl>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800">Informasi Layanan</h3>
                            <dl className="grid grid-cols-2 gap-4 mt-2 text-sm">
                                <div><dt className="font-medium text-gray-500">Status</dt><dd><span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(selectedCustomer.status)}`}>{selectedCustomer.status}</span></dd></div>
                                <div><dt className="font-medium text-gray-500">Paket</dt><dd className="text-gray-900">{selectedCustomer.servicePackage}</dd></div>
                                <div><dt className="font-medium text-gray-500">Tanggal Pasang</dt><dd className="text-gray-900">{selectedCustomer.installationDate}</dd></div>
                            </dl>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800">Aset Terpasang</h3>
                            <ul className="mt-2 space-y-2">
                                {assets.filter(a => a.currentUser === selectedCustomer.id).map(asset => (
                                    <li key={asset.id} className="flex items-center justify-between p-3 text-sm bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-semibold text-gray-800">{asset.name}</p>
                                            <p className="text-xs text-gray-500 font-mono">{asset.id} &bull; SN: {asset.serialNumber}</p>
                                        </div>
                                        <button 
                                            onClick={() => {
                                                onInitiateDismantle(asset);
                                                handleCloseDetailModal();
                                            }}
                                            className="inline-flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-semibold text-white transition-all duration-200 bg-danger rounded-md shadow-sm hover:bg-red-700">
                                            <DismantleIcon className="w-4 h-4" />
                                            Tarik Aset
                                        </button>
                                    </li>
                                ))}
                                {assets.filter(a => a.currentUser === selectedCustomer.id).length === 0 && (
                                    <p className="text-sm text-center text-gray-500 py-4">Tidak ada aset yang terpasang.</p>
                                )}
                            </ul>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default CustomerManagement;
