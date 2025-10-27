import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Division, User, UserRole, Page } from '../../types';
import Modal from '../../components/ui/Modal';
import { PencilIcon } from '../../components/icons/PencilIcon';
import { useNotification } from '../../providers/NotificationProvider';
import { InboxIcon } from '../../components/icons/InboxIcon';
import { TrashIcon } from '../../components/icons/TrashIcon';
import { useSortableData, SortConfig } from '../../hooks/useSortableData';
import { SortAscIcon } from '../../components/icons/SortAscIcon';
import { SortDescIcon } from '../../components/icons/SortDescIcon';
import { SortIcon } from '../../components/icons/SortIcon';
import { exportToCSV } from '../../utils/csvExporter';
import { Checkbox } from '../../components/ui/Checkbox';
import { ExportIcon } from '../../components/icons/ExportIcon';
import { useLongPress } from '../../hooks/useLongPress';
import { SpinnerIcon } from '../../components/icons/SpinnerIcon';
import { SearchIcon } from '../../components/icons/SearchIcon';
import { CloseIcon } from '../../components/icons/CloseIcon';
import { PaginationControls } from '../../components/ui/PaginationControls';
import { Avatar } from '../../components/ui/Avatar';
import { ExclamationTriangleIcon } from '../../components/icons/ExclamationTriangleIcon';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { FilterIcon } from '../../components/icons/FilterIcon';

type View = 'users' | 'divisions';

interface AccountsPageProps {
    currentUser: User;
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    divisions: Division[];
    setDivisions: React.Dispatch<React.SetStateAction<Division[]>>;
    setActivePage: (page: Page, initialState?: any) => void;
}

const getRoleClass = (role: UserRole) => {
    switch (role) {
        case 'Super Admin': return 'bg-purple-100 text-purple-800';
        // FIX: Replaced incorrect role names with 'Admin Logistik', 'Admin Purchase', and 'Leader' to align with UserRole type.
        case 'Admin Logistik': return 'bg-info-light text-info-text';
        case 'Admin Purchase': return 'bg-teal-100 text-teal-800';
        case 'Leader': return 'bg-sky-100 text-sky-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

// FIX: Replaced incorrect role names with 'Admin Logistik', 'Admin Purchase', and 'Leader' to align with UserRole type.
const userRoles: UserRole[] = ['Staff', 'Leader', 'Admin Logistik', 'Admin Purchase', 'Super Admin'];


const UserForm: React.FC<{ 
    divisions: Division[], 
    onSave: (user: Omit<User, 'id'>, id?: number) => void,
    onClose: () => void,
    editingUser: User | null 
}> = ({ divisions, onSave, onClose, editingUser }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [selectedRole, setSelectedRole] = useState<UserRole>('Staff');
    const [selectedDivisionId, setSelectedDivisionId] = useState<string>(divisions[0]?.id.toString() || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const addNotification = useNotification();
    
    // FIX: Corrected division name from 'Inventori' to 'Logistik' to match mock data.
    const inventoryDivisionId = divisions.find(d => d.name === 'Logistik')?.id.toString();

    useEffect(() => {
        if (editingUser) {
            setName(editingUser.name);
            setEmail(editingUser.email);
            setSelectedRole(editingUser.role);
            setSelectedDivisionId(editingUser.divisionId?.toString() || '');
        } else {
            setName('');
            setEmail('');
            setSelectedRole('Staff');
            setSelectedDivisionId(divisions[0]?.id.toString() || '');
        }
    }, [editingUser, divisions]);

    useEffect(() => {
        // FIX: Use 'Admin Logistik' to match UserRole type and corrected division name logic.
        if (selectedRole === 'Admin Logistik' && inventoryDivisionId) {
            setSelectedDivisionId(inventoryDivisionId);
        }
    }, [selectedRole, inventoryDivisionId]);

    const handleDivisionChange = (divisionId: string) => {
        // FIX: Use 'Admin Logistik' to match UserRole type.
        if (divisionId !== inventoryDivisionId && selectedRole === 'Admin Logistik') {
            setSelectedRole('Staff');
        }
        setSelectedDivisionId(divisionId);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email) {
            addNotification('Nama dan Email wajib diisi.', 'error');
            return;
        }
        setIsSubmitting(true);
        setTimeout(() => { // Simulate API Call
            onSave({
                name,
                email,
                role: selectedRole,
                divisionId: selectedRole === 'Super Admin' ? null : parseInt(selectedDivisionId),
            }, editingUser?.id);
            setIsSubmitting(false);
        }, 1000);
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                    <div className="mt-1">
                        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="block w-full px-3 py-2 mt-1 text-gray-900 placeholder:text-gray-400 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-tm-accent focus:border-tm-accent sm:text-sm" />
                    </div>
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <div className="mt-1">
                        <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="block w-full px-3 py-2 mt-1 text-gray-900 placeholder:text-gray-400 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-tm-accent focus:border-tm-accent sm:text-sm" />
                    </div>
                </div>
                <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                    <div className="mt-1">
                        <CustomSelect
                            // FIX: Replaced incorrect role options to align with UserRole type.
                             options={[
                                { value: 'Staff', label: 'Staff' },
                                { value: 'Leader', label: 'Leader' },
                                { value: 'Admin Logistik', label: 'Admin Logistik' },
                                { value: 'Admin Purchase', label: 'Admin Purchase' },
                                { value: 'Super Admin', label: 'Super Admin' },
                            ]}
                             value={selectedRole}
                             onChange={(value) => setSelectedRole(value as UserRole)}
                        />
                    </div>
                    {selectedRole === 'Admin Logistik' && <p className="mt-2 text-xs text-gray-500">Role Admin Logistik hanya berlaku untuk Divisi Logistik.</p>}
                </div>
                <div>
                    <label htmlFor="division" className="block text-sm font-medium text-gray-700">Divisi</label>
                    <div className="mt-1">
                        <CustomSelect
                             options={selectedRole === 'Super Admin'
                                ? [{ value: '', label: 'N/A' }]
                                : divisions.map(d => ({ value: d.id.toString(), label: d.name }))
                            }
                             value={selectedDivisionId}
                            onChange={handleDivisionChange}
                            // FIX: Use 'Admin Logistik' to match UserRole type.
                            disabled={selectedRole === 'Super Admin' || selectedRole === 'Admin Logistik'}
                            placeholder="Pilih Divisi"
                        />
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-end px-6 py-4 space-x-3 bg-gray-50 border-t border-gray-200 rounded-b-xl">
                 <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Batal</button>
                <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 rounded-lg shadow-sm bg-tm-primary hover:bg-tm-primary-hover disabled:bg-tm-primary/70">
                    {isSubmitting && <SpinnerIcon className="w-5 h-5 mr-2" />}
                    {editingUser ? 'Simpan Perubahan' : 'Simpan Akun'}
                </button>
            </div>
        </form>
    );
};

const DivisionForm: React.FC<{ 
    onSave: (division: Omit<Division, 'id'>, id?: number) => void,
    onClose: () => void,
    editingDivision: Division | null
}> = ({ onSave, onClose, editingDivision }) => {
    const [name, setName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const addNotification = useNotification();

    useEffect(() => {
        if(editingDivision) {
            setName(editingDivision.name);
        } else {
            setName('');
        }
    }, [editingDivision]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) {
            addNotification('Nama divisi wajib diisi.', 'error');
            return;
        }
        setIsSubmitting(true);
        setTimeout(() => {
            onSave({ name }, editingDivision?.id);
            setIsSubmitting(false);
        }, 1000);
    };

    return (
         <form onSubmit={handleSubmit}>
            <div className="p-6">
                <div>
                    <label htmlFor="divisionName" className="block text-sm font-medium text-gray-700">Nama Divisi</label>
                    <div className="mt-1">
                        <input type="text" id="divisionName" value={name} onChange={e => setName(e.target.value)} required className="block w-full px-3 py-2 mt-1 text-gray-900 placeholder:text-gray-400 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-tm-accent focus:border-tm-accent sm:text-sm" placeholder="Contoh: Finance"/>
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-end px-6 py-4 space-x-3 bg-gray-50 border-t border-gray-200 rounded-b-xl">
                 <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Batal</button>
                <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 rounded-lg shadow-sm bg-tm-primary hover:bg-tm-primary-hover disabled:bg-tm-primary/70">
                    {isSubmitting && <SpinnerIcon className="w-5 h-5 mr-2" />}
                    {editingDivision ? 'Simpan Perubahan' : 'Simpan Divisi'}
                </button>
            </div>
        </form>
    );
};


const AccountsPage: React.FC<AccountsPageProps> = ({ currentUser, users, setUsers, divisions, setDivisions, setActivePage }) => {
    const [activeView, setActiveView] = useState<View>('users');
    const [isUserFormModalOpen, setIsUserFormModalOpen] = useState(false);
    const [isDivisionFormModalOpen, setIsDivisionFormModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [divisionToEdit, setDivisionToEdit] = useState<Division | null>(null);

    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [divisionToDelete, setDivisionToDelete] = useState<Division | null>(null);
    const [bulkDeleteConfirmation, setBulkDeleteConfirmation] = useState<View | null>(null);
    const [isBulkSelectMode, setIsBulkSelectMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
    const [selectedDivisionIds, setSelectedDivisionIds] = useState<number[]>([]);
    
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [isMoveDivisionModalOpen, setIsMoveDivisionModalOpen] = useState(false);
    const [isChangeRoleModalOpen, setIsChangeRoleModalOpen] = useState(false);
    const [targetDivisionId, setTargetDivisionId] = useState<number | null>(divisions[0]?.id || null);
    const [targetRole, setTargetRole] = useState<UserRole>('Staff');

    const [userSearchQuery, setUserSearchQuery] = useState('');
    const initialUserFilterState = { role: '', divisionId: '' };
    const [userFilters, setUserFilters] = useState(initialUserFilterState);
    const [tempUserFilters, setTempUserFilters] = useState(userFilters);
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const filterPanelRef = useRef<HTMLDivElement>(null);
    const [divisionSearchQuery, setDivisionSearchQuery] = useState('');

    const addNotification = useNotification();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (filterPanelRef.current && !filterPanelRef.current.contains(event.target as Node)) {
                setIsFilterPanelOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => { document.removeEventListener("mousedown", handleClickOutside); };
    }, [filterPanelRef]);

    const activeUserFilterCount = useMemo(() => {
        return Object.values(userFilters).filter(Boolean).length;
    }, [userFilters]);

    const handleResetUserFilters = () => {
        setUserFilters(initialUserFilterState);
        setTempUserFilters(initialUserFilterState);
        setIsFilterPanelOpen(false);
    };

    const handleApplyUserFilters = () => {
        setUserFilters(tempUserFilters);
        setIsFilterPanelOpen(false);
    };
    
    const filteredUsers = useMemo(() => {
        return users
            .filter(user => {
                const searchLower = userSearchQuery.toLowerCase();
                return (
                    user.name.toLowerCase().includes(searchLower) ||
                    user.email.toLowerCase().includes(searchLower)
                );
            })
            .filter(user => userFilters.role ? user.role === userFilters.role : true)
            .filter(user => userFilters.divisionId ? user.divisionId?.toString() === userFilters.divisionId : true);
    }, [users, userSearchQuery, userFilters]);

    const filteredDivisions = useMemo(() => {
        return divisions.filter(d => d.name.toLowerCase().includes(divisionSearchQuery.toLowerCase()));
    }, [divisions, divisionSearchQuery]);


    const { items: sortedUsers, requestSort: requestUserSort, sortConfig: userSortConfig } = useSortableData<User>(filteredUsers, { key: 'name', direction: 'ascending' });
    const { items: sortedDivisions, requestSort: requestDivisionSort, sortConfig: divisionSortConfig } = useSortableData<Division>(filteredDivisions, { key: 'name', direction: 'ascending' });
    
    const totalUserItems = sortedUsers.length;
    const totalUserPages = Math.ceil(totalUserItems / itemsPerPage);
    const userStartIndex = (currentPage - 1) * itemsPerPage;
    const userEndIndex = userStartIndex + itemsPerPage;
    const paginatedUsers = sortedUsers.slice(userStartIndex, userEndIndex);
    
    const totalDivisionItems = sortedDivisions.length;
    const totalDivisionPages = Math.ceil(totalDivisionItems / itemsPerPage);
    const divisionStartIndex = (currentPage - 1) * itemsPerPage;
    const divisionEndIndex = divisionStartIndex + itemsPerPage;
    const paginatedDivisions = sortedDivisions.slice(divisionStartIndex, divisionEndIndex);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeView, itemsPerPage, userSearchQuery, userFilters, divisionSearchQuery]);
    
    const { deletableUsersCount, skippableUsersCount } = useMemo(() => {
        if (bulkDeleteConfirmation !== 'users') return { deletableUsersCount: 0, skippableUsersCount: 0 };
        const selected = users.filter(u => selectedUserIds.includes(u.id));
        const skippable = selected.filter(u => u.role === 'Super Admin' || u.id === currentUser.id);
        return {
            deletableUsersCount: selected.length - skippable.length,
            skippableUsersCount: skippable.length,
        };
    }, [bulkDeleteConfirmation, selectedUserIds, users, currentUser.id]);

    const { deletableDivisionsCount, skippableDivisionsCount } = useMemo(() => {
        if (bulkDeleteConfirmation !== 'divisions') return { deletableDivisionsCount: 0, skippableDivisionsCount: 0 };
        const deletableIds = selectedDivisionIds.filter(id => !users.some(u => u.divisionId === id));
        return {
            deletableDivisionsCount: deletableIds.length,
            skippableDivisionsCount: selectedDivisionIds.length - deletableIds.length,
        };
    }, [bulkDeleteConfirmation, selectedDivisionIds, users]);
    
    const handleItemsPerPageChange = (newSize: number) => {
        setItemsPerPage(newSize);
        setCurrentPage(1);
    };

    const handleCancelBulkMode = () => {
        setIsBulkSelectMode(false);
        setSelectedUserIds([]);
        setSelectedDivisionIds([]);
    };
    
    useEffect(() => {
        handleCancelBulkMode();
    }, [activeView]);

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

    const getDivisionName = (divisionId: number | null): React.ReactNode => {
        if (divisionId === null) {
            return <span className="italic text-gray-500">N/A</span>;
        }
        return divisions.find(d => d.id === divisionId)?.name || 'N/A';
    };
    
    const handleExport = () => {
        if (activeView === 'users') {
             const dataToExport = sortedUsers.map(u => ({...u, divisionName: getDivisionName(u.divisionId)?.toString() }));
             exportToCSV(dataToExport, 'daftar_akun');
        } else {
             const dataToExport = sortedDivisions.map(d => ({...d, memberCount: users.filter(u => u.divisionId === d.id).length }));
             exportToCSV(dataToExport, 'daftar_divisi');
        }
    }

    const handleOpenUserForm = (user: User | null) => {
        setUserToEdit(user);
        setIsUserFormModalOpen(true);
    };

    const handleOpenDivisionForm = (division: Division | null) => {
        setDivisionToEdit(division);
        setIsDivisionFormModalOpen(true);
    };

    const handleSaveUser = (userData: Omit<User, 'id'>, id?: number) => {
        if(id) { // Update
            setUsers(prev => prev.map(u => u.id === id ? { ...u, ...userData } : u));
            addNotification('Akun berhasil diperbarui.', 'success');
        } else { // Create
            const newUser = { ...userData, id: Math.max(...users.map(u => u.id), 0) + 1 };
            setUsers(prev => [newUser, ...prev]);
            addNotification('Akun baru berhasil ditambahkan.', 'success');
        }
        setIsUserFormModalOpen(false);
        setUserToEdit(null);
    };

    const handleSaveDivision = (divisionData: Omit<Division, 'id'>, id?: number) => {
        if(id) { // Update
            setDivisions(prev => prev.map(d => d.id === id ? { ...d, ...divisionData } : d));
            addNotification('Divisi berhasil diperbarui.', 'success');
        } else { // Create
            const newDivision = { ...divisionData, id: Math.max(...divisions.map(d => d.id), 0) + 1 };
            setDivisions(prev => [newDivision, ...prev]);
            addNotification('Divisi baru berhasil ditambahkan.', 'success');
        }
        setIsDivisionFormModalOpen(false);
        setDivisionToEdit(null);
    };
    
    const handleConfirmUserDelete = () => {
        if (!userToDelete) return;

        if (userToDelete.role === 'Super Admin' || userToDelete.id === currentUser.id) {
            addNotification('Akun Super Admin atau akun Anda sendiri tidak dapat dihapus.', 'error');
            setUserToDelete(null);
            return;
        }
        
        setIsLoading(true);
        setTimeout(() => {
            setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
            addNotification(`Akun ${userToDelete.name} berhasil dihapus.`, 'success');
            setUserToDelete(null);
            setIsLoading(false);
        }, 1000);
    };

    const handleConfirmDivisionDelete = () => {
        if (!divisionToDelete) return;

        const isDivisionInUse = users.some(user => user.divisionId === divisionToDelete.id);
        if (isDivisionInUse) {
            addNotification('Divisi tidak dapat dihapus karena masih memiliki anggota.', 'error');
            setDivisionToDelete(null);
            return;
        }
        
        setIsLoading(true);
        setTimeout(() => {
            setDivisions(prev => prev.filter(d => d.id !== divisionToDelete.id));
            addNotification(`Divisi ${divisionToDelete.name} berhasil dihapus.`, 'success');
            setDivisionToDelete(null);
            setIsLoading(false);
        }, 1000);
    };

    const handleBulkDelete = () => {
        setIsLoading(true);
        setTimeout(() => {
            if (bulkDeleteConfirmation === 'users') {
                const deletableUserIds = selectedUserIds.filter(id => {
                    const user = users.find(u => u.id === id);
                    return user && user.role !== 'Super Admin' && user.id !== currentUser.id;
                });
                
                setUsers(prev => prev.filter(u => !deletableUserIds.includes(u.id)));

                let message = `${deletableUserIds.length} akun berhasil dihapus.`;
                if (skippableUsersCount > 0) {
                    message += ` ${skippableUsersCount} akun dilewati (Super Admin / akun Anda).`;
                }
                addNotification(message, 'success');
            } else if (bulkDeleteConfirmation === 'divisions') {
                const deletableDivisionIds = selectedDivisionIds.filter(id => !users.some(u => u.divisionId === id));
                
                setDivisions(prev => prev.filter(d => !deletableDivisionIds.includes(d.id)));

                let message = `${deletableDivisionIds.length} divisi berhasil dihapus.`;
                if (skippableDivisionsCount > 0) {
                    message += ` ${skippableDivisionsCount} divisi dilewati karena masih memiliki anggota.`;
                }
                 addNotification(message, 'success');
            }
            
            setBulkDeleteConfirmation(null);
            handleCancelBulkMode();
            setIsLoading(false);
        }, 1000);
    };

    const handleBulkMoveDivision = () => {
        if (!targetDivisionId) {
            addNotification('Pilih divisi tujuan.', 'error');
            return;
        }
        setIsLoading(true);
        setTimeout(() => {
            setUsers(prev => prev.map(u => selectedUserIds.includes(u.id) ? { ...u, divisionId: targetDivisionId } : u));
            addNotification(`${selectedUserIds.length} akun berhasil dipindahkan.`, 'success');
            setIsLoading(false);
            setIsMoveDivisionModalOpen(false);
            handleCancelBulkMode();
        }, 1000);
    };

    const handleBulkChangeRole = () => {
        setIsLoading(true);
        setTimeout(() => {
            setUsers(prev => prev.map(u => {
                if (selectedUserIds.includes(u.id)) {
                    const updatedUser = { ...u, role: targetRole };
                    if (targetRole === 'Super Admin') {
                        updatedUser.divisionId = null;
                    // FIX: Use 'Admin Logistik' to match UserRole type and corrected division name logic.
                    } else if (targetRole === 'Admin Logistik') {
                        const inventoryDivision = divisions.find(d => d.name === 'Logistik');
                        if (inventoryDivision) {
                            updatedUser.divisionId = inventoryDivision.id;
                        }
                    }
                    return updatedUser;
                }
                return u;
            }));
            addNotification(`${selectedUserIds.length} akun berhasil diubah rolenya.`, 'success');
            setIsLoading(false);
            setIsChangeRoleModalOpen(false);
            handleCancelBulkMode();
        }, 1000);
    };

    const longPressHandlers = useLongPress(() => setIsBulkSelectMode(true), 500);

    const SortableUserHeader: React.FC<any> = ({ children, columnKey, sortConfig, requestSort, className }) => {
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

    const SortableDivisionHeader: React.FC<any> = ({ children, columnKey, sortConfig, requestSort, className }) => {
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

    return (
        <div className="p-4 sm:p-6 md:p-8">
            <div className="flex flex-col items-start justify-between gap-4 mb-6 md:flex-row md:items-center">
                <h1 className="text-3xl font-bold text-tm-dark">Akun & Divisi</h1>
                <div className="flex items-center space-x-2">
                    <button onClick={handleExport} className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border rounded-lg shadow-sm hover:bg-gray-50">
                        <ExportIcon className="w-4 h-4"/> Export CSV
                    </button>
                    <button
                        onClick={() => activeView === 'users' ? handleOpenUserForm(null) : handleOpenDivisionForm(null)}
                        className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 rounded-lg shadow-sm bg-tm-primary hover:bg-tm-primary-hover"
                    >
                        {activeView === 'users' ? 'Tambah Akun' : 'Tambah Divisi'}
                    </button>
                </div>
            </div>

            <div className="mb-6 border-b border-gray-200">
                <nav className="flex -mb-px space-x-6" aria-label="Tabs">
                    <button onClick={() => setActiveView('users')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeView === 'users' ? 'border-tm-primary text-tm-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                        Manajemen Akun ({users.length})
                    </button>
                    <button onClick={() => setActiveView('divisions')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeView === 'divisions' ? 'border-tm-primary text-tm-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                        Manajemen Divisi ({divisions.length})
                    </button>
                </nav>
            </div>

            {activeView === 'users' ? (
                // Users View
                <div>
                     <div className="p-4 mb-4 bg-white border border-gray-200/80 rounded-xl shadow-md">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="relative flex-grow">
                                <SearchIcon className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 top-1/2 left-3" />
                                <input type="text" placeholder="Cari nama atau email..." value={userSearchQuery} onChange={e => setUserSearchQuery(e.target.value)} className="w-full h-10 py-2 pl-10 pr-4 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-tm-accent focus:border-tm-accent" />
                            </div>
                            <div className="relative" ref={filterPanelRef}>
                                <button
                                    onClick={() => { setTempUserFilters(userFilters); setIsFilterPanelOpen(p => !p); }}
                                    className="inline-flex items-center justify-center gap-2 w-full h-10 px-4 text-sm font-semibold text-gray-700 transition-all duration-200 bg-white border border-gray-300 rounded-lg shadow-sm sm:w-auto hover:bg-gray-50"
                                >
                                    <FilterIcon className="w-4 h-4" /> <span>Filter</span> {activeUserFilterCount > 0 && <span className="px-2 py-0.5 text-xs font-bold text-white rounded-full bg-tm-primary">{activeUserFilterCount}</span>}
                                </button>
                                {isFilterPanelOpen && (
                                    <>
                                        <div onClick={() => setIsFilterPanelOpen(false)} className="fixed inset-0 z-20 bg-black/25 sm:hidden" />
                                        <div className="fixed top-32 inset-x-4 z-30 origin-top rounded-xl border border-gray-200 bg-white shadow-lg sm:absolute sm:top-full sm:inset-x-auto sm:right-0 sm:mt-2 sm:w-72">
                                            <div className="flex items-center justify-between p-4 border-b">
                                                <h3 className="text-lg font-semibold text-gray-800">Filter Akun</h3>
                                                <button onClick={() => setIsFilterPanelOpen(false)} className="p-1 text-gray-400 rounded-full hover:bg-gray-100"><CloseIcon className="w-5 h-5"/></button>
                                            </div>
                                            <div className="p-4 space-y-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                                                    <CustomSelect options={[{value: '', label: 'Semua Role'}, ...userRoles.map(r => ({value: r, label: r}))]} value={tempUserFilters.role} onChange={v => setTempUserFilters(f => ({...f, role: v}))} />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Divisi</label>
                                                    <CustomSelect options={[{value: '', label: 'Semua Divisi'}, ...divisions.map(d => ({value: d.id.toString(), label: d.name}))]} value={tempUserFilters.divisionId} onChange={v => setTempUserFilters(f => ({...f, divisionId: v}))} />
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between p-4 bg-gray-50 border-t">
                                                <button onClick={handleResetUserFilters} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Reset</button>
                                                <button onClick={handleApplyUserFilters} className="px-4 py-2 text-sm font-semibold text-white bg-tm-primary rounded-lg shadow-sm hover:bg-tm-primary-hover">Terapkan</button>
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
                                    <span className="text-sm font-medium text-tm-primary">{selectedUserIds.length} item terpilih</span>
                                    <div className="h-5 border-l border-gray-300"></div>
                                    <button onClick={() => setIsChangeRoleModalOpen(true)} className="px-3 py-1.5 text-sm font-semibold text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200">Ubah Role</button>
                                    <button onClick={() => setIsMoveDivisionModalOpen(true)} className="px-3 py-1.5 text-sm font-semibold text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200">Pindah Divisi</button>
                                    <button onClick={() => setBulkDeleteConfirmation('users')} className="px-3 py-1.5 text-sm font-semibold text-red-600 bg-red-100 rounded-md hover:bg-red-200">Hapus</button>
                                </div>
                                <button onClick={handleCancelBulkMode} className="px-3 py-1.5 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Batal</button>
                            </div>
                        </div>
                    )}
                    <div className="overflow-hidden bg-white border border-gray-200/80 rounded-xl shadow-md">
                         <div className="overflow-x-auto custom-scrollbar">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {isBulkSelectMode && <th className="px-6 py-3"><Checkbox checked={selectedUserIds.length > 0 && selectedUserIds.length === paginatedUsers.length} onChange={e => setSelectedUserIds(e.target.checked ? paginatedUsers.map(u => u.id) : [])} /></th>}
                                        <SortableUserHeader columnKey="name" sortConfig={userSortConfig} requestSort={requestUserSort}>Nama</SortableUserHeader>
                                        <SortableUserHeader columnKey="email" sortConfig={userSortConfig} requestSort={requestUserSort}>Email</SortableUserHeader>
                                        <th scope="col" className="px-6 py-3 text-sm font-semibold tracking-wider text-left text-gray-500">Divisi</th>
                                        <SortableUserHeader columnKey="role" sortConfig={userSortConfig} requestSort={requestUserSort}>Role</SortableUserHeader>
                                        <th className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paginatedUsers.map(user => (
                                        <tr key={user.id} {...longPressHandlers} onClick={() => isBulkSelectMode && setSelectedUserIds(prev => prev.includes(user.id) ? prev.filter(id => id !== user.id) : [...prev, user.id])} className={`cursor-pointer transition-colors ${selectedUserIds.includes(user.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                                            {isBulkSelectMode && <td className="px-6 py-4" onClick={e => e.stopPropagation()}><Checkbox checked={selectedUserIds.includes(user.id)} onChange={() => setSelectedUserIds(prev => prev.includes(user.id) ? prev.filter(id => id !== user.id) : [...prev, user.id])} /></td>}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <Avatar name={user.name} className="w-8 h-8 text-xs"/>
                                                    <div>
                                                        <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                                                        {user.id === currentUser.id && <span className="text-xs text-tm-primary font-bold">(Anda)</span>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">{user.email}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">{getDivisionName(user.divisionId)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getRoleClass(user.role)}`}>{user.role}</span></td>
                                            <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button onClick={(e) => { e.stopPropagation(); handleOpenUserForm(user); }} className="p-2 text-gray-500 rounded-full hover:bg-yellow-100 hover:text-yellow-600"><PencilIcon className="w-4 h-4"/></button>
                                                    <button onClick={(e) => { e.stopPropagation(); setUserToDelete(user); }} className="p-2 text-gray-500 rounded-full hover:bg-red-100 hover:text-red-600"><TrashIcon className="w-4 h-4"/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <PaginationControls currentPage={currentPage} totalPages={totalUserPages} totalItems={totalUserItems} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} onItemsPerPageChange={handleItemsPerPageChange} startIndex={userStartIndex} endIndex={userEndIndex} />
                    </div>
                </div>
            ) : (
                // Divisions View
                 <div>
                     <div className="p-4 mb-4 bg-white border border-gray-200/80 rounded-xl shadow-md">
                        <div className="relative">
                            <SearchIcon className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 top-1/2 left-3" />
                            <input type="text" placeholder="Cari nama divisi..." value={divisionSearchQuery} onChange={e => setDivisionSearchQuery(e.target.value)} className="w-full h-10 py-2 pl-10 pr-4 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-tm-accent focus:border-tm-accent" />
                        </div>
                    </div>
                    {isBulkSelectMode && (
                        <div className="p-4 mb-4 bg-blue-50 border-l-4 border-tm-accent rounded-r-lg">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="text-sm font-medium text-tm-primary">{selectedDivisionIds.length} item terpilih</span>
                                    <div className="h-5 border-l border-gray-300"></div>
                                    <button onClick={() => setBulkDeleteConfirmation('divisions')} className="px-3 py-1.5 text-sm font-semibold text-red-600 bg-red-100 rounded-md hover:bg-red-200">Hapus</button>
                                </div>
                                <button onClick={handleCancelBulkMode} className="px-3 py-1.5 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Batal</button>
                            </div>
                        </div>
                    )}
                    <div className="overflow-hidden bg-white border border-gray-200/80 rounded-xl shadow-md">
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {isBulkSelectMode && <th className="px-6 py-3"><Checkbox checked={selectedDivisionIds.length > 0 && selectedDivisionIds.length === paginatedDivisions.length} onChange={e => setSelectedDivisionIds(e.target.checked ? paginatedDivisions.map(d => d.id) : [])} /></th>}
                                        <SortableDivisionHeader columnKey="name" sortConfig={divisionSortConfig} requestSort={requestDivisionSort}>Nama Divisi</SortableDivisionHeader>
                                        <th scope="col" className="px-6 py-3 text-sm font-semibold tracking-wider text-left text-gray-500">Jumlah Anggota</th>
                                        <th className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paginatedDivisions.map(division => (
                                        <tr key={division.id} {...longPressHandlers} onClick={() => isBulkSelectMode && setSelectedDivisionIds(prev => prev.includes(division.id) ? prev.filter(id => id !== division.id) : [...prev, division.id])} className={`cursor-pointer transition-colors ${selectedDivisionIds.includes(division.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                                            {isBulkSelectMode && <td className="px-6 py-4" onClick={e => e.stopPropagation()}><Checkbox checked={selectedDivisionIds.includes(division.id)} onChange={() => setSelectedDivisionIds(prev => prev.includes(division.id) ? prev.filter(id => id !== division.id) : [...prev, division.id])} /></td>}
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">{division.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">{users.filter(u => u.divisionId === division.id).length}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button onClick={(e) => { e.stopPropagation(); handleOpenDivisionForm(division); }} className="p-2 text-gray-500 rounded-full hover:bg-yellow-100 hover:text-yellow-600"><PencilIcon className="w-4 h-4"/></button>
                                                    <button onClick={(e) => { e.stopPropagation(); setDivisionToDelete(division); }} className="p-2 text-gray-500 rounded-full hover:bg-red-100 hover:text-red-600"><TrashIcon className="w-4 h-4"/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <PaginationControls currentPage={currentPage} totalPages={totalDivisionPages} totalItems={totalDivisionItems} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} onItemsPerPageChange={handleItemsPerPageChange} startIndex={divisionStartIndex} endIndex={divisionEndIndex} />
                    </div>
                </div>
            )}
            
            {isUserFormModalOpen && <Modal isOpen={isUserFormModalOpen} onClose={() => setIsUserFormModalOpen(false)} title={userToEdit ? 'Edit Akun' : 'Tambah Akun Baru'} hideDefaultCloseButton disableContentPadding><UserForm divisions={divisions} onSave={handleSaveUser} onClose={() => setIsUserFormModalOpen(false)} editingUser={userToEdit} /></Modal>}
            {isDivisionFormModalOpen && <Modal isOpen={isDivisionFormModalOpen} onClose={() => setIsDivisionFormModalOpen(false)} title={divisionToEdit ? 'Edit Divisi' : 'Tambah Divisi Baru'} hideDefaultCloseButton disableContentPadding><DivisionForm onSave={handleSaveDivision} onClose={() => setIsDivisionFormModalOpen(false)} editingDivision={divisionToEdit} /></Modal>}

            {userToDelete && <Modal isOpen={!!userToDelete} onClose={() => setUserToDelete(null)} title="Konfirmasi Hapus Akun" size="md">
                <p className="text-sm text-gray-600">Anda yakin ingin menghapus akun <strong>{userToDelete.name}</strong>? Tindakan ini tidak dapat diurungkan.</p>
                <div className="flex justify-end gap-2 mt-6 pt-4 border-t"><button onClick={() => setUserToDelete(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Batal</button><button onClick={handleConfirmUserDelete} disabled={isLoading} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-danger rounded-lg shadow-sm hover:bg-red-700">{isLoading && <SpinnerIcon className="w-4 h-4 mr-2"/>} Hapus</button></div>
            </Modal>}
             {divisionToDelete && <Modal isOpen={!!divisionToDelete} onClose={() => setDivisionToDelete(null)} title="Konfirmasi Hapus Divisi" size="md">
                <p className="text-sm text-gray-600">Anda yakin ingin menghapus divisi <strong>{divisionToDelete.name}</strong>? Aksi ini tidak dapat diurungkan.</p>
                <div className="flex justify-end gap-2 mt-6 pt-4 border-t"><button onClick={() => setDivisionToDelete(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Batal</button><button onClick={handleConfirmDivisionDelete} disabled={isLoading} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-danger rounded-lg shadow-sm hover:bg-red-700">{isLoading && <SpinnerIcon className="w-4 h-4 mr-2"/>} Hapus</button></div>
            </Modal>}
            
             <Modal isOpen={bulkDeleteConfirmation !== null} onClose={() => setBulkDeleteConfirmation(null)} title="Konfirmasi Hapus Massal" size="md">
                <div className="text-center">
                    <ExclamationTriangleIcon className="w-12 h-12 mx-auto text-red-500" />
                    <h3 className="mt-4 text-lg font-semibold text-gray-800">Hapus {bulkDeleteConfirmation === 'users' ? `${deletableUsersCount} Akun` : `${deletableDivisionsCount} Divisi`}?</h3>
                    {bulkDeleteConfirmation === 'users' && <p className="mt-2 text-sm text-gray-600">Total {selectedUserIds.length} akun dipilih. {skippableUsersCount} akun (Super Admin/Anda) akan dilewati.</p>}
                    {bulkDeleteConfirmation === 'divisions' && <p className="mt-2 text-sm text-gray-600">Total {selectedDivisionIds.length} divisi dipilih. {skippableDivisionsCount} divisi yang masih memiliki anggota akan dilewati.</p>}
                </div>
                <div className="flex justify-end gap-2 mt-6 pt-4 border-t"><button onClick={() => setBulkDeleteConfirmation(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Batal</button><button onClick={handleBulkDelete} disabled={isLoading} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-danger rounded-lg shadow-sm hover:bg-red-700">{isLoading && <SpinnerIcon className="w-4 h-4 mr-2"/>} Ya, Hapus</button></div>
            </Modal>
            
            <Modal isOpen={isMoveDivisionModalOpen} onClose={() => setIsMoveDivisionModalOpen(false)} title={`Pindah ${selectedUserIds.length} Akun`}>
                <p className="mb-4 text-sm text-gray-600">Pilih divisi tujuan.</p>
                <CustomSelect options={divisions.map(d => ({value: d.id.toString(), label: d.name}))} value={targetDivisionId?.toString() || ''} onChange={v => setTargetDivisionId(parseInt(v))} />
                 <div className="flex justify-end gap-2 mt-6 pt-4 border-t"><button onClick={() => setIsMoveDivisionModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Batal</button><button onClick={handleBulkMoveDivision} disabled={isLoading} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-tm-primary rounded-lg shadow-sm hover:bg-tm-primary-hover">{isLoading && <SpinnerIcon className="w-4 h-4 mr-2"/>}Pindahkan</button></div>
            </Modal>
            
            <Modal isOpen={isChangeRoleModalOpen} onClose={() => setIsChangeRoleModalOpen(false)} title={`Ubah Role untuk ${selectedUserIds.length} Akun`}>
                <p className="mb-4 text-sm text-gray-600">Pilih role baru.</p>
                <CustomSelect options={userRoles.map(r => ({value: r, label: r}))} value={targetRole} onChange={v => setTargetRole(v as UserRole)} />
                 <div className="flex justify-end gap-2 mt-6 pt-4 border-t"><button onClick={() => setIsChangeRoleModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Batal</button><button onClick={handleBulkChangeRole} disabled={isLoading} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-tm-primary rounded-lg shadow-sm hover:bg-tm-primary-hover">{isLoading && <SpinnerIcon className="w-4 h-4 mr-2"/>}Ubah Role</button></div>
            </Modal>
        </div>
    );
};

export default AccountsPage;