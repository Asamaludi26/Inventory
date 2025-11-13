import React, { useState, useMemo, useEffect } from 'react';
// FIX: Add AssetCategory to type imports.
import { Page, Maintenance, User, Customer, Asset, ItemStatus, AssetStatus, ActivityLogEntry, AssetCategory, InstalledMaterial } from '../../../types';
import { useSortableData, SortConfig } from '../../../hooks/useSortableData';
import { useNotification } from '../../../providers/NotificationProvider';
import { PaginationControls } from '../../../components/ui/PaginationControls';
import { SearchIcon } from '../../../components/icons/SearchIcon';
import { InboxIcon } from '../../../components/icons/InboxIcon';
import { SortIcon } from '../../../components/icons/SortIcon';
import { SortAscIcon } from '../../../components/icons/SortAscIcon';
import { SortDescIcon } from '../../../components/icons/SortDescIcon';
import { EyeIcon } from '../../../components/icons/EyeIcon';
import MaintenanceForm from './MaintenanceForm';
import MaintenanceDetailPage from './MaintenanceDetailPage';
import { generateDocumentNumber } from '../../../utils/documentNumberGenerator';

interface MaintenanceManagementPageProps {
    currentUser: User;
    maintenances: Maintenance[];
    setMaintenances: React.Dispatch<React.SetStateAction<Maintenance[]>>;
    customers: Customer[];
    setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
    assets: Asset[];
    users: User[];
    assetCategories: AssetCategory[];
    setActivePage: (page: Page, filters?: any) => void;
    onUpdateAsset: (assetId: string, updates: Partial<Asset>, logEntry?: Omit<ActivityLogEntry, 'id' | 'timestamp'>) => void;
    pageInitialState?: { prefillCustomer?: string; prefillAsset?: string };
}

const getStatusClass = (status: ItemStatus) => {
    switch (status) {
        case ItemStatus.COMPLETED: return 'bg-success-light text-success-text';
        case ItemStatus.IN_PROGRESS: return 'bg-info-light text-info-text';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const SortableHeader: React.FC<{
    children: React.ReactNode;
    columnKey: keyof Maintenance;
    sortConfig: SortConfig<Maintenance> | null;
    requestSort: (key: keyof Maintenance) => void;
}> = ({ children, columnKey, sortConfig, requestSort }) => {
    const isSorted = sortConfig?.key === columnKey;
    const direction = isSorted ? sortConfig.direction : undefined;
    const getSortIcon = () => {
        if (!isSorted) return <SortIcon className="w-4 h-4 text-gray-400" />;
        if (direction === 'ascending') return <SortAscIcon className="w-4 h-4 text-tm-accent" />;
        return <SortDescIcon className="w-4 h-4 text-tm-accent" />;
    };
    return (
        <th scope="col" className="px-6 py-3 text-sm font-semibold tracking-wider text-left text-gray-500">
            <button onClick={() => requestSort(columnKey)} className="flex items-center space-x-1 group">
                <span>{children}</span>
                <span className="opacity-50 group-hover:opacity-100">{getSortIcon()}</span>
            </button>
        </th>
    );
};

const MaintenanceTable: React.FC<{
    maintenances: Maintenance[];
    onDetailClick: (maintenance: Maintenance) => void;
    sortConfig: SortConfig<Maintenance> | null;
    requestSort: (key: keyof Maintenance) => void;
}> = ({ maintenances, onDetailClick, sortConfig, requestSort }) => (
    <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
            <tr>
                <SortableHeader columnKey="docNumber" sortConfig={sortConfig} requestSort={requestSort}>No. Dokumen / Tanggal</SortableHeader>
                <SortableHeader columnKey="customerName" sortConfig={sortConfig} requestSort={requestSort}>Pelanggan & Aset</SortableHeader>
                <SortableHeader columnKey="technician" sortConfig={sortConfig} requestSort={requestSort}>Teknisi</SortableHeader>
                <SortableHeader columnKey="status" sortConfig={sortConfig} requestSort={requestSort}>Status</SortableHeader>
                <th className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>
            </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
            {maintenances.map(m => (
                <tr key={m.id} onClick={() => onDetailClick(m)} className="cursor-pointer hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-semibold text-gray-900">{m.docNumber}</div><div className="text-xs text-gray-500">{new Date(m.maintenanceDate).toLocaleDateString('id-ID')}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{m.customerName}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[200px]" title={(m.assets || []).map(a => a.assetName).join(', ')}>
                            {(m.assets || []).map(a => a.assetName).join(', ')}
                        </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">{m.technician}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusClass(m.status)}`}>{m.status}</span></td>
                    <td className="px-6 py-4 text-sm font-medium text-right"><button className="p-2 text-gray-500 rounded-full hover:bg-info-light hover:text-info-text"><EyeIcon className="w-5 h-5"/></button></td>
                </tr>
            ))}
        </tbody>
    </table>
);

const MaintenanceFormPage: React.FC<MaintenanceManagementPageProps> = (props) => {
    const { currentUser, maintenances, setMaintenances, customers, setCustomers, assets, users, onUpdateAsset, pageInitialState, assetCategories } = props;
    const prefillCustomerId = pageInitialState?.prefillCustomer;
    const prefillAssetId = pageInitialState?.prefillAsset;
    const [view, setView] = useState<'list' | 'form' | 'detail'>(prefillCustomerId || prefillAssetId ? 'form' : 'list');
    
    const [selectedMaintenance, setSelectedMaintenance] = useState<Maintenance | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isLoading, setIsLoading] = useState(false);
    const addNotification = useNotification();

    const filteredMaintenances = useMemo(() => {
        return maintenances.filter(m => {
            const searchLower = searchQuery.toLowerCase();
            return m.docNumber.toLowerCase().includes(searchLower) ||
                   m.customerName.toLowerCase().includes(searchLower) ||
                   (m.assets || []).some(a => a.assetName.toLowerCase().includes(searchLower)) ||
                   m.technician.toLowerCase().includes(searchLower);
        });
    }, [maintenances, searchQuery]);

    const { items: sortedMaintenances, requestSort, sortConfig } = useSortableData(filteredMaintenances, { key: 'maintenanceDate', direction: 'descending' });
    
    const paginatedMaintenances = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedMaintenances.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedMaintenances, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(sortedMaintenances.length / itemsPerPage);

    const handleSave = (formData: Omit<Maintenance, 'id' | 'status' | 'docNumber'>) => {
        setIsLoading(true);
        setTimeout(() => {
            const newDocNumber = generateDocumentNumber('MNT', maintenances, new Date(formData.maintenanceDate));
            const newMaintenance: Maintenance = {
                ...formData,
                id: `MNT-${Date.now()}`,
                docNumber: newDocNumber,
                status: ItemStatus.COMPLETED,
            };

            // Asset Replacement Logic
            if (formData.replacements && formData.replacements.length > 0) {
                formData.replacements.forEach(rep => {
                    onUpdateAsset(rep.oldAssetId, { status: AssetStatus.IN_STORAGE, condition: rep.retrievedAssetCondition, currentUser: null, location: 'Gudang Inventori' }, { user: currentUser.name, action: 'Ditarik saat Maintenance', details: `Aset ditarik karena rusak dan diganti. Ref: ${newDocNumber}`, referenceId: newDocNumber });
                    onUpdateAsset(rep.newAssetId, { status: AssetStatus.IN_USE, currentUser: formData.customerId, location: `Terpasang di: ${formData.customerName}` }, { user: currentUser.name, action: 'Dipasang saat Maintenance', details: `Aset dipasang sebagai pengganti. Ref: ${newDocNumber}`, referenceId: newDocNumber });
                });
                addNotification('Penggantian aset berhasil diproses.', 'success');
            }

            // Update Customer's Installed Materials
            const materialsToInstall: InstalledMaterial[] = (newMaintenance.materialsUsed || []).map(material => {
                let unit = 'pcs';
                for (const cat of assetCategories) {
                    for (const type of cat.types) {
                        if (type.trackingMethod === 'bulk' && type.standardItems?.some(item => item.name === material.itemName && item.brand === material.brand)) {
                            unit = type.baseUnitOfMeasure || 'pcs';
                            break;
                        }
                    }
                }
                return {
                    itemName: material.itemName,
                    brand: material.brand,
                    quantity: material.quantity,
                    unit: unit,
                    installationDate: newMaintenance.maintenanceDate,
                };
            });

            if (materialsToInstall.length > 0) {
                setCustomers(prevCustomers => prevCustomers.map(c => {
                    if (c.id === newMaintenance.customerId) {
                        const existingMaterials = c.installedMaterials || [];
                        const updatedMaterials = [...existingMaterials];
                        
                        materialsToInstall.forEach(newMat => {
                            const existingMatIndex = updatedMaterials.findIndex(em => em.itemName === newMat.itemName && em.brand === newMat.brand);
                            if (existingMatIndex > -1) {
                                updatedMaterials[existingMatIndex] = {
                                    ...updatedMaterials[existingMatIndex],
                                    quantity: updatedMaterials[existingMatIndex].quantity + newMat.quantity
                                };
                            } else {
                                updatedMaterials.push(newMat);
                            }
                        });

                        return { ...c, installedMaterials: updatedMaterials };
                    }
                    return c;
                }));
            }
            
            setMaintenances(prev => [newMaintenance, ...prev]);
            addNotification('Laporan maintenance berhasil dibuat.', 'success');
            setView('list');
            setIsLoading(false);
        }, 800);
    };

    const handleComplete = () => {
        if (!selectedMaintenance) return;
        setIsLoading(true);
        setTimeout(() => {
            const updatedMaintenance: Maintenance = {
                ...selectedMaintenance,
                status: ItemStatus.COMPLETED,
                completedBy: currentUser.name,
                completionDate: new Date().toISOString(),
            };
            setMaintenances(prev => prev.map(m => m.id === selectedMaintenance.id ? updatedMaintenance : m));
            addNotification('Laporan maintenance telah diselesaikan.', 'success');
            setView('list');
            setIsLoading(false);
        }, 800);
    };

    if (view === 'form') {
        return (
            <div className="p-4 sm:p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-tm-dark">Buat Laporan Maintenance</h1>
                    <button onClick={() => setView('list')} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Kembali</button>
                </div>
                <div className="p-4 sm:p-6 bg-white border border-gray-200/80 rounded-xl shadow-md pb-24">
                    <MaintenanceForm 
                        currentUser={currentUser}
                        customers={customers}
                        assets={assets}
                        users={users}
                        maintenances={maintenances}
                        assetCategories={assetCategories}
                        onSave={handleSave}
                        onCancel={() => setView('list')}
                        isLoading={isLoading}
                        prefillCustomerId={prefillCustomerId}
                        prefillAssetId={prefillAssetId}
                    />
                </div>
            </div>
        );
    }
    
    if (view === 'detail' && selectedMaintenance) {
        return (
            <MaintenanceDetailPage
                maintenance={selectedMaintenance}
                onBackToList={() => { setView('list'); setSelectedMaintenance(null); }}
                onComplete={handleComplete}
                isLoading={isLoading}
                currentUser={currentUser}
                assets={assets}
            />
        );
    }

    return (
        <div className="p-4 sm:p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                <h1 className="text-3xl font-bold text-tm-dark">Manajemen Maintenance</h1>
                <button onClick={() => setView('form')} className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 rounded-lg shadow-sm bg-tm-primary hover:bg-tm-primary-hover">Buat Laporan Baru</button>
            </div>
            <div className="p-4 mb-4 bg-white border border-gray-200/80 rounded-xl shadow-md">
                <div className="relative"><SearchIcon className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 top-1/2 left-3" /><input type="text" placeholder="Cari No. Dokumen, Pelanggan, Aset..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full h-10 py-2 pl-10 pr-4 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-tm-accent focus:border-tm-accent" /></div>
            </div>
            <div className="overflow-hidden bg-white border border-gray-200/80 rounded-xl shadow-md">
                <div className="overflow-x-auto custom-scrollbar">
                    {paginatedMaintenances.length > 0 ? (
                        <MaintenanceTable maintenances={paginatedMaintenances} onDetailClick={(m) => { setSelectedMaintenance(m); setView('detail'); }} sortConfig={sortConfig} requestSort={requestSort} />
                    ) : (
                        <div className="py-12 text-center text-gray-500"><InboxIcon className="w-12 h-12 mx-auto text-gray-300" /><p className="mt-2 font-semibold">Tidak ada data maintenance.</p></div>
                    )}
                </div>
                {sortedMaintenances.length > 0 && <PaginationControls currentPage={currentPage} totalPages={totalPages} totalItems={sortedMaintenances.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} onItemsPerPageChange={setItemsPerPage} startIndex={(currentPage - 1) * itemsPerPage} endIndex={(currentPage - 1) * itemsPerPage + paginatedMaintenances.length} />}
            </div>
        </div>
    );
};

export default MaintenanceFormPage;