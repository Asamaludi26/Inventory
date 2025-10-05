import React, { useState, useEffect, useMemo } from 'react';
import { Division, Page, User, UserRole } from '../types';
import Modal from './shared/Modal';
import { PencilIcon } from './icons/PencilIcon';
import { useNotification } from './shared/Notification';
import { InboxIcon } from './icons/InboxIcon';
import { TrashIcon } from './icons/TrashIcon';
import { useSortableData, SortConfig } from '../hooks/useSortableData';
import { SortAscIcon } from './icons/SortAscIcon';
import { SortDescIcon } from './icons/SortDescIcon';
import { SortIcon } from './icons/SortIcon';
import { exportToCSV } from '../utils/csvExporter';
import { Checkbox } from './shared/Checkbox';
import { ExportIcon } from './icons/ExportIcon';
import { useLongPress } from '../hooks/useLongPress';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { SearchIcon } from './icons/SearchIcon';
import { CloseIcon } from './icons/CloseIcon';
import { PaginationControls } from './shared/PaginationControls';
import { Avatar } from './shared/Avatar';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';

type View = 'users' | 'divisions';

interface AccountsAndDivisionsProps {
    currentUser: User;
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    divisions: Division[];
    setDivisions: React.Dispatch<React.SetStateAction<Division[]>>;
    initialView?: View;
    onNavigate: (page: Page, filters?: any) => void;
}


// Mock Data
export const mockDivisions: Division[] = [
    { id: 1, name: 'Inventori' },
    { id: 2, name: 'NOC' },
    { id: 3, name: 'Engineer' },
    { id: 4, name: 'Marketing' },
    { id: 5, name: 'Finance' },
    { id: 6, name: 'Human Resources' },
];

const generateMockUsers = (divisions: Division[]): User[] => {
    const users: User[] = [];
    const firstNames = ['John', 'Alice', 'Bob', 'Charlie', 'Diana', 'Evan', 'Grace', 'Henry', 'Ivy', 'Jack', 'Karen', 'Liam', 'Mia', 'Noah', 'Olivia'];
    const lastNames = ['Doe', 'Johnson', 'Williams', 'Brown', 'Miller', 'Davis', 'Lee', 'Wilson', 'Martinez', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris'];
    
    // Super Admin
    users.push({ id: 99, name: 'John Doe', email: 'john.doe@triniti.com', divisionId: null, role: 'Super Admin' });
    
    // Admins in Inventory
    users.push({ id: 1, name: 'Alice Johnson', email: 'alice@triniti.com', divisionId: 1, role: 'Admin' });

    let userIdCounter = 2;
    for (const division of divisions) {
        // Create 5-10 staff members for each division
        const memberCount = 5 + Math.floor(Math.random() * 6);
        for (let i = 0; i < memberCount; i++) {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const name = `${firstName} ${lastName}`;
            const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@triniti.com`;
            
            users.push({
                id: userIdCounter++,
                name,
                email,
                divisionId: division.id,
                role: 'Staff',
            });
        }
    }
    return users;
};

export const mockUsers: User[] = generateMockUsers(mockDivisions);



const getRoleClass = (role: UserRole) => {
    switch (role) {
        case 'Super Admin': return 'bg-purple-100 text-purple-800';
        case 'Admin': return 'bg-info-light text-info-text';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const userRoles: UserRole[] = ['Admin', 'Staff', 'Super Admin'];

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
    
    const inventoryDivisionId = divisions.find(d => d.name === 'Inventori')?.id.toString();

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
        if (selectedRole === 'Admin' && inventoryDivisionId) {
            setSelectedDivisionId(inventoryDivisionId);
        }
    }, [selectedRole, inventoryDivisionId]);

    const handleDivisionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const divisionId = e.target.value;
        if (divisionId !== inventoryDivisionId && selectedRole === 'Admin') {
            setSelectedRole('Staff');
        }
        setSelectedDivisionId(divisionId);
    }

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
                        <select 
                            id="role"
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                            className="block w-full px-3 py-2 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-tm-accent focus:border-tm-accent sm:text-sm"
                        >
                            <option value="Staff">Staff</option>
                            <option value="Admin">Admin</option>
                            <option value="Super Admin">Super Admin</option>
                        </select>
                    </div>
                    {selectedRole === 'Admin' && <p className="mt-2 text-xs text-gray-500">Role Admin hanya berlaku untuk Divisi Inventori.</p>}
                </div>
                <div>
                    <label htmlFor="division" className="block text-sm font-medium text-gray-700">Divisi</label>
                    <div className="mt-1">
                        <select 
                            id="division" 
                            value={selectedDivisionId}
                            onChange={handleDivisionChange}
                            disabled={selectedRole === 'Super Admin' || selectedRole === 'Admin'}
                            className="block w-full px-3 py-2 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg shadow-sm disabled:bg-gray-200/60 disabled:cursor-not-allowed focus:outline-none focus:ring-tm-accent focus:border-tm-accent sm:text-sm"
                        >
                            {selectedRole === 'Super Admin' 
                                ? <option>N/A</option>
                                : divisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)
                            }
                        </select>
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


const AccountsAndDivisions: React.FC<AccountsAndDivisionsProps> = ({ currentUser, users, setUsers, divisions, setDivisions, initialView = 'users', onNavigate }) => {
    const view = initialView;
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

    // States for new bulk action modals
    const [isMoveDivisionModalOpen, setIsMoveDivisionModalOpen] = useState(false);
    const [isChangeRoleModalOpen, setIsChangeRoleModalOpen] = useState(false);
    const [targetDivisionId, setTargetDivisionId] = useState<number | null>(divisions[0]?.id || null);
    const [targetRole, setTargetRole] = useState<UserRole>('Staff');

    // Filter states for users
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [userFilters, setUserFilters] = useState({ role: '', divisionId: '' });
    const [divisionSearchQuery, setDivisionSearchQuery] = useState('');


    const addNotification = useNotification();

    const isUserFiltering = useMemo(() => {
        return userSearchQuery.trim() !== '' || userFilters.role !== '' || userFilters.divisionId !== '';
    }, [userSearchQuery, userFilters]);

    const handleResetUserFilters = () => {
        setUserSearchQuery('');
        setUserFilters({ role: '', divisionId: '' });
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
    
    // Pagination logic for users
    const totalUserItems = sortedUsers.length;
    const totalUserPages = Math.ceil(totalUserItems / itemsPerPage);
    const userStartIndex = (currentPage - 1) * itemsPerPage;
    const userEndIndex = userStartIndex + itemsPerPage;
    const paginatedUsers = sortedUsers.slice(userStartIndex, userEndIndex);
    
    // Pagination logic for divisions
    const totalDivisionItems = sortedDivisions.length;
    const totalDivisionPages = Math.ceil(totalDivisionItems / itemsPerPage);
    const divisionStartIndex = (currentPage - 1) * itemsPerPage;
    const divisionEndIndex = divisionStartIndex + itemsPerPage;
    const paginatedDivisions = sortedDivisions.slice(divisionStartIndex, divisionEndIndex);

    useEffect(() => {
        setCurrentPage(1);
    }, [view, itemsPerPage, userSearchQuery, userFilters, divisionSearchQuery]);
    
    const { deletableUsersCount, skippableUsersCount } = useMemo(() => {
        if (bulkDeleteConfirmation !== 'users') return { deletableUsersCount: 0, skippableUsersCount: 0 };
        const selected = users.filter(u => selectedUserIds.includes(u.id));
        const skippable = selected.filter(u => u.role === 'Super Admin');
        return {
            deletableUsersCount: selected.length - skippable.length,
            skippableUsersCount: skippable.length,
        };
    }, [bulkDeleteConfirmation, selectedUserIds, users]);

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
    }, [view]);

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
        if (view === 'users') {
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

        if (userToDelete.role === 'Super Admin') {
            addNotification('Akun Super Admin tidak dapat dihapus.', 'error');
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
                    return user && user.role !== 'Super Admin';
                });
                
                setUsers(prev => prev.filter(u => !deletableUserIds.includes(u.id)));

                let message = `${deletableUserIds.length} akun berhasil dihapus.`;
                if (skippableUsersCount > 0) {
                    message += ` ${skippableUsersCount} akun dilewati (Super Admin).`;
                }
                addNotification(message, 'success');
                
            } else if (bulkDeleteConfirmation === 'divisions') {
                const deletableDivisionIds = selectedDivisionIds.filter(id => !users.some(u => u.divisionId === id));
                
                if (deletableDivisionIds.length === 0) {
// FIX: Changed 'warning' to 'error' to match the allowed NotificationType values.
                     addNotification('Tidak ada divisi yang dapat dihapus (semua memiliki anggota).', 'error');
                     setBulkDeleteConfirmation(null);
                     setIsLoading(false);
                     handleCancelBulkMode();
                     return;
                }
                
                setDivisions(prev => prev.filter(d => !deletableDivisionIds.includes(d.id)));
                
                let message = `${deletableDivisionIds.length} divisi berhasil dihapus.`;
                if (skippableDivisionsCount > 0) {
                    message += ` ${skippableDivisionsCount} dilewati karena masih memiliki anggota.`;
                }
                addNotification(message, 'success');
            }
            setBulkDeleteConfirmation(null);
            handleCancelBulkMode();
            setIsLoading(false);
        }, 1000);
    };

    const handleBulkMoveDivision = () => {
        const selectedUsers = users.filter(u => selectedUserIds.includes(u.id));
        if (selectedUsers.some(u => u.role === 'Super Admin')) {
            addNotification('Aksi tidak dapat diterapkan pada Super Admin.', 'error');
            setIsMoveDivisionModalOpen(false);
            return;
        }
        setIsLoading(true);
        setTimeout(() => {
            setUsers(prev => prev.map(user => 
                selectedUserIds.includes(user.id) ? { ...user, divisionId: targetDivisionId } : user
            ));
            const targetDivisionName = divisions.find(d => d.id === targetDivisionId)?.name;
            addNotification(`${selectedUserIds.length} akun berhasil dipindahkan ke divisi "${targetDivisionName}".`, 'success');
            setIsMoveDivisionModalOpen(false);
            handleCancelBulkMode();
            setIsLoading(false);
        }, 1000);
    };

    const handleBulkChangeRole = () => {
        const selectedUsers = users.filter(u => selectedUserIds.includes(u.id));
        if (selectedUsers.some(u => u.role === 'Super Admin')) {
            addNotification('Aksi tidak dapat diterapkan pada Super Admin.', 'error');
            setIsChangeRoleModalOpen(false);
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            const inventoryDivisionId = divisions.find(d => d.name.toLowerCase() === 'inventori')?.id;
            setUsers(prev => prev.map(user => {
                if (selectedUserIds.includes(user.id)) {
                    const newDivisionId = (targetRole === 'Admin' && inventoryDivisionId) ? inventoryDivisionId : user.divisionId;
                    return { ...user, role: targetRole, divisionId: newDivisionId };
                }
                return user;
            }));
            
            addNotification(`${selectedUserIds.length} akun berhasil diubah rolenya menjadi "${targetRole}".`, 'success');
            setIsChangeRoleModalOpen(false);
            handleCancelBulkMode();
            setIsLoading(false);
        }, 1000);
    };

    const UserTable = () => {
        const longPressHandlers = useLongPress(() => setIsBulkSelectMode(true), 500);
        
        const handleRowClick = (user: User) => {
            if (isBulkSelectMode) {
                setSelectedUserIds(p => p.includes(user.id) ? p.filter(id => id !== user.id) : [...p, user.id]);
            }
        };

        return (
            <div className="overflow-x-auto custom-scrollbar">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="sticky top-0 z-10 bg-gray-50">
                        <tr>
                            {isBulkSelectMode && <th className="px-6 py-3"><Checkbox
                                 checked={selectedUserIds.length === paginatedUsers.length && paginatedUsers.length > 0}
                                 onChange={(e) => setSelectedUserIds(e.target.checked ? paginatedUsers.map(u => u.id) : [])}
                            /></th>}
                            <th className="px-6 py-3"><button onClick={() => requestUserSort('name')} className="flex items-center space-x-1 text-sm font-semibold tracking-wider text-left text-gray-500 group"><span>Pengguna</span><span className="opacity-50 group-hover:opacity-100">{userSortConfig?.key === 'name' ? (userSortConfig.direction === 'ascending' ? <SortAscIcon className="w-4 h-4 text-tm-accent" /> : <SortDescIcon className="w-4 h-4 text-tm-accent" />) : <SortIcon className="w-4 h-4 text-gray-400" />}</span></button></th>
                            <th className="px-6 py-3"><button onClick={() => requestUserSort('divisionId')} className="flex items-center space-x-1 text-sm font-semibold tracking-wider text-left text-gray-500 group"><span>Divisi</span><span className="opacity-50 group-hover:opacity-100">{userSortConfig?.key === 'divisionId' ? (userSortConfig.direction === 'ascending' ? <SortAscIcon className="w-4 h-4 text-tm-accent" /> : <SortDescIcon className="w-4 h-4 text-tm-accent" />) : <SortIcon className="w-4 h-4 text-gray-400" />}</span></button></th>
                            <th className="px-6 py-3"><button onClick={() => requestUserSort('role')} className="flex items-center space-x-1 text-sm font-semibold tracking-wider text-left text-gray-500 group"><span>Role</span><span className="opacity-50 group-hover:opacity-100">{userSortConfig?.key === 'role' ? (userSortConfig.direction === 'ascending' ? <SortAscIcon className="w-4 h-4 text-tm-accent" /> : <SortDescIcon className="w-4 h-4 text-tm-accent" />) : <SortIcon className="w-4 h-4 text-gray-400" />}</span></button></th>
                            <th className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedUsers.length > 0 ? (
                            paginatedUsers.map(user => (
                                <tr key={user.id} {...longPressHandlers} onClick={() => handleRowClick(user)} className={`transition-colors cursor-pointer ${selectedUserIds.includes(user.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                                    {isBulkSelectMode && (
                                        <td className="px-6 py-4 align-top" onClick={e => e.stopPropagation()}>
                                            <Checkbox
                                                checked={selectedUserIds.includes(user.id)}
                                                onChange={() => setSelectedUserIds(p => p.includes(user.id) ? p.filter(id => id !== user.id) : [...p, user.id])}
                                                aria-labelledby={`user-name-${user.id}`}
                                            />
                                        </td>
                                    )}
                                    <td id={`user-name-${user.id}`} className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <Avatar name={user.name} className="w-8 h-8 mr-3"/>
                                            <div>
                                                <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                                                <div className="text-xs text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">{getDivisionName(user.divisionId)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleClass(user.role)}`}>{user.role}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button onClick={e => { e.stopPropagation(); handleOpenUserForm(user); }} className="flex items-center justify-center w-8 h-8 text-gray-500 transition-colors bg-gray-100 rounded-full hover:bg-yellow-100 hover:text-yellow-600" title="Edit"><PencilIcon className="w-4 h-4" /></button>
                                            {user.role !== 'Super Admin' && <button onClick={e => { e.stopPropagation(); setUserToDelete(user); }} className="flex items-center justify-center w-8 h-8 text-gray-500 transition-colors bg-gray-100 rounded-full hover:bg-danger-light hover:text-danger-text" title="Hapus"><TrashIcon className="w-5 h-5"/></button>}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={isBulkSelectMode ? 5 : 4} className="px-6 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center">
                                        <InboxIcon className="w-12 h-12 text-gray-400" />
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak Ada Data Akun</h3>
                                        <p className="mt-1 text-sm text-gray-500">Ubah filter atau buat akun baru.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        );
    };

    const DivisionTable = () => {
        const longPressHandlers = useLongPress(() => setIsBulkSelectMode(true), 500);
        
        const handleRowClick = (division: Division) => {
            if (isBulkSelectMode) {
                setSelectedDivisionIds(p => p.includes(division.id) ? p.filter(id => id !== division.id) : [...p, division.id]);
            }
        };

        return (
            <div className="overflow-x-auto custom-scrollbar">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="sticky top-0 z-10 bg-gray-50">
                        <tr>
                            {isBulkSelectMode && <th className="px-6 py-3"><Checkbox
                                checked={selectedDivisionIds.length > 0 && selectedDivisionIds.length === paginatedDivisions.length}
                                onChange={(e) => setSelectedDivisionIds(e.target.checked ? paginatedDivisions.map(d => d.id) : [])}
                            /></th>}
                            <th className="px-6 py-3"><button onClick={() => requestDivisionSort('name')} className="flex items-center space-x-1 text-sm font-semibold tracking-wider text-left text-gray-500 group"><span>Nama Divisi</span><span className="opacity-50 group-hover:opacity-100">{divisionSortConfig?.key === 'name' ? (divisionSortConfig.direction === 'ascending' ? <SortAscIcon className="w-4 h-4 text-tm-accent" /> : <SortDescIcon className="w-4 h-4 text-tm-accent" />) : <SortIcon className="w-4 h-4 text-gray-400" />}</span></button></th>
                            <th className="px-6 py-3 text-sm font-semibold tracking-wider text-left text-gray-500">Jumlah Anggota</th>
                            <th className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedDivisions.length > 0 ? (
                            paginatedDivisions.map(division => {
                                const memberCount = users.filter(u => u.divisionId === division.id).length;
                                return (
                                    <tr key={division.id} {...longPressHandlers} onClick={() => handleRowClick(division)} className={`transition-colors cursor-pointer ${selectedDivisionIds.includes(division.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                                        {isBulkSelectMode && <td className="px-6 py-4" onClick={e => e.stopPropagation()}><Checkbox checked={selectedDivisionIds.includes(division.id)} onChange={() => setSelectedDivisionIds(p => p.includes(division.id) ? p.filter(id => id !== division.id) : [...p, division.id])} /></td>}
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">{division.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onNavigate('akun', { divisionId: division.id.toString() }); }} 
                                                className="font-semibold text-tm-primary hover:underline"
                                                title={`Lihat anggota divisi ${division.name}`}
                                            >
                                                {memberCount} Anggota
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button onClick={(e) => { e.stopPropagation(); handleOpenDivisionForm(division); }} className="flex items-center justify-center w-8 h-8 text-gray-500 transition-colors bg-gray-100 rounded-full hover:bg-yellow-100 hover:text-yellow-600" title="Edit"><PencilIcon className="w-4 h-4" /></button>
                                                <button onClick={e => { e.stopPropagation(); setDivisionToDelete(division); }} className="flex items-center justify-center w-8 h-8 text-gray-500 transition-colors bg-gray-100 rounded-full hover:bg-danger-light hover:text-danger-text" title="Hapus"><TrashIcon className="w-5 h-5"/></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                             <tr>
                                <td colSpan={isBulkSelectMode ? 4 : 3} className="px-6 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center">
                                        <InboxIcon className="w-12 h-12 text-gray-400" />
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak Ada Data Divisi</h3>
                                        <p className="mt-1 text-sm text-gray-500">Buat divisi baru untuk memulai.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        );
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
    
    const pageTitle = view === 'users' ? 'Daftar Akun' : 'Daftar Divisi';
    const addButtonText = view === 'users' ? 'Tambah Akun Baru' : 'Tambah Divisi Baru';

    return (
        <div className="p-4 sm:p-6 md:p-8">
            <div className="flex flex-col items-start justify-between gap-4 mb-6 md:flex-row md:items-center">
                <h1 className="text-3xl font-bold text-tm-dark">{pageTitle}</h1>
                 <div className="flex items-center space-x-2">
                    <button onClick={handleExport} className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 transition-all duration-200 bg-white border rounded-lg shadow-sm hover:bg-gray-50">
                        <ExportIcon className="w-4 h-4"/>
                        Export CSV
                    </button>
                    <button
                        onClick={() => view === 'users' ? handleOpenUserForm(null) : handleOpenDivisionForm(null)}
                        className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 rounded-lg shadow-sm bg-tm-primary hover:bg-tm-primary-hover"
                    >
                        {addButtonText}
                    </button>
                </div>
            </div>

            {view === 'users' ? (
                <div className="p-4 mb-4 bg-white border border-gray-200/80 rounded-xl shadow-md">
                    <div className="flex flex-col w-full gap-4 sm:flex-row sm:flex-wrap sm:items-center">
                        <div className="relative flex-grow">
                             <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <SearchIcon className="w-5 h-5 text-gray-400" />
                            </div>
                            <input 
                                type="text"
                                placeholder="Cari Nama atau Email..."
                                value={userSearchQuery}
                                onChange={e => setUserSearchQuery(e.target.value)}
                                className="w-full h-10 py-2 pl-10 pr-10 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-tm-accent focus:border-tm-accent"
                            />
                             {userSearchQuery && (
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                    <button
                                        type="button"
                                        onClick={() => setUserSearchQuery('')}
                                        className="p-1 text-gray-400 rounded-full hover:bg-gray-200 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-tm-accent"
                                        aria-label="Hapus pencarian"
                                    >
                                        <CloseIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                        <select onChange={e => setUserFilters(f => ({...f, role: e.target.value}))} value={userFilters.role} className="w-full h-10 px-3 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-300 rounded-lg sm:w-auto focus:ring-tm-accent focus:border-tm-accent">
                            <option value="">Semua Role</option>
                            {userRoles.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <select onChange={e => setUserFilters(f => ({...f, divisionId: e.target.value}))} value={userFilters.divisionId} className="w-full h-10 px-3 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-300 rounded-lg sm:w-auto focus:ring-tm-accent focus:border-tm-accent">
                            <option value="">Semua Divisi</option>
                            {divisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                         {isUserFiltering && (
                            <button
                                type="button"
                                onClick={handleResetUserFilters}
                                className="inline-flex items-center justify-center w-full h-10 px-4 text-sm font-semibold text-gray-700 transition-all duration-200 bg-white border border-gray-300 rounded-lg shadow-sm sm:w-auto sm:ml-auto hover:bg-red-50 hover:border-red-500 hover:text-red-600"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                 <div className="p-4 mb-4 bg-white border border-gray-200/80 rounded-xl shadow-md">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <SearchIcon className="w-5 h-5 text-gray-400" />
                        </div>
                        <input 
                            type="text"
                            placeholder="Cari Nama Divisi..."
                            value={divisionSearchQuery}
                            onChange={e => setDivisionSearchQuery(e.target.value)}
                            className="w-full h-10 py-2 pl-10 pr-10 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-tm-accent focus:border-tm-accent"
                        />
                    </div>
                </div>
            )}
            
            {isBulkSelectMode && (
                <div className="p-4 mb-4 bg-blue-50 border-l-4 border-tm-accent rounded-r-lg">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        { (view === 'users' && selectedUserIds.length > 0) || (view === 'divisions' && selectedDivisionIds.length > 0) ? (
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="text-sm font-medium text-tm-primary">{view === 'users' ? selectedUserIds.length : selectedDivisionIds.length} item terpilih</span>
                                <div className="hidden h-5 border-l border-gray-300 sm:block"></div>
                                {view === 'users' && (
                                    <>
                                        <button onClick={() => setIsMoveDivisionModalOpen(true)} className="px-3 py-1.5 text-sm font-semibold text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200">Pindah Divisi</button>
                                        <button onClick={() => setIsChangeRoleModalOpen(true)} className="px-3 py-1.5 text-sm font-semibold text-yellow-600 bg-yellow-100 rounded-md hover:bg-yellow-200">Ubah Role</button>
                                    </>
                                )}
                                <button onClick={() => setBulkDeleteConfirmation(view)} className="px-3 py-1.5 text-sm font-semibold text-red-600 bg-red-100 rounded-md hover:bg-red-200">Hapus</button>
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

            <div className="bg-white border border-gray-200/80 rounded-xl shadow-md">
                {view === 'users' ? <UserTable /> : <DivisionTable />}
                <PaginationControls
                    currentPage={currentPage}
                    totalPages={view === 'users' ? totalUserPages : totalDivisionPages}
                    totalItems={view === 'users' ? totalUserItems : totalDivisionItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={handleItemsPerPageChange}
                    startIndex={view === 'users' ? userStartIndex : divisionStartIndex}
                    endIndex={view === 'users' ? userEndIndex : divisionEndIndex}
                />
            </div>
            
            <Modal
                isOpen={isUserFormModalOpen}
                onClose={() => setIsUserFormModalOpen(false)}
                title={userToEdit ? 'Edit Akun Pengguna' : 'Tambah Akun Baru'}
                hideDefaultCloseButton
                disableContentPadding
            >
                <UserForm 
                    divisions={divisions} 
                    onSave={handleSaveUser} 
                    onClose={() => setIsUserFormModalOpen(false)}
                    editingUser={userToEdit} 
                />
            </Modal>
            
             <Modal
                isOpen={isDivisionFormModalOpen}
                onClose={() => setIsDivisionFormModalOpen(false)}
                title={divisionToEdit ? 'Edit Nama Divisi' : 'Tambah Divisi Baru'}
                hideDefaultCloseButton
                disableContentPadding
            >
                <DivisionForm
                    onSave={handleSaveDivision} 
                    onClose={() => setIsDivisionFormModalOpen(false)}
                    editingDivision={divisionToEdit} 
                />
            </Modal>

            <Modal isOpen={!!userToDelete} onClose={() => setUserToDelete(null)} title="Konfirmasi Hapus" hideDefaultCloseButton>
                <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 mx-auto text-red-600 bg-red-100 rounded-full">
                        <ExclamationTriangleIcon className="w-8 h-8" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-gray-800">Hapus Akun?</h3>
                    <p className="mt-2 text-sm text-gray-600">Anda yakin ingin menghapus akun <span className="font-bold">{userToDelete?.name}</span>?</p>
                </div>
                 <div className="flex items-center justify-end pt-5 mt-5 space-x-3 border-t">
                    <button onClick={() => setUserToDelete(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Batal</button>
                    <button onClick={handleConfirmUserDelete} disabled={isLoading} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-danger rounded-lg hover:bg-red-700">{isLoading && <SpinnerIcon className="w-4 h-4 mr-2"/>}Ya, Hapus</button>
                </div>
            </Modal>
            
            <Modal isOpen={!!divisionToDelete} onClose={() => setDivisionToDelete(null)} title="Konfirmasi Hapus" hideDefaultCloseButton>
                 <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 mx-auto text-red-600 bg-red-100 rounded-full">
                        <ExclamationTriangleIcon className="w-8 h-8" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-gray-800">Hapus Divisi?</h3>
                    <p className="mt-2 text-sm text-gray-600">Anda yakin ingin menghapus divisi <span className="font-bold">{divisionToDelete?.name}</span>? Divisi yang masih memiliki anggota tidak dapat dihapus.</p>
                </div>
                <div className="flex items-center justify-end pt-5 mt-5 space-x-3 border-t">
                    <button onClick={() => setDivisionToDelete(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Batal</button>
                    <button onClick={handleConfirmDivisionDelete} disabled={isLoading} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-danger rounded-lg hover:bg-red-700">{isLoading && <SpinnerIcon className="w-4 h-4 mr-2"/>}Ya, Hapus</button>
                </div>
            </Modal>

            {bulkDeleteConfirmation && (
                <Modal 
                    isOpen={!!bulkDeleteConfirmation} 
                    onClose={() => setBulkDeleteConfirmation(null)} 
                    title="Konfirmasi Hapus Massal" 
                    size="md" 
                    hideDefaultCloseButton
                >
                    {bulkDeleteConfirmation === 'users' ? (
                        <>
                            <div className="text-center">
                                <div className="flex items-center justify-center w-12 h-12 mx-auto text-red-600 bg-red-100 rounded-full">
                                    <ExclamationTriangleIcon className="w-8 h-8" />
                                </div>
                                <h3 className="mt-4 text-lg font-semibold text-gray-800">Hapus {deletableUsersCount} Akun?</h3>
                                <p className="mt-2 text-sm text-gray-600">Anda akan menghapus akun yang dipilih. Akun Super Admin tidak akan dihapus.</p>
                                <div className="w-full p-3 mt-4 text-sm text-left bg-gray-50 border rounded-lg">
                                    <div className="flex justify-between"><span>Total Akun Dipilih:</span><span className="font-semibold">{selectedUserIds.length}</span></div>
                                    <div className="flex justify-between mt-1 text-green-700"><span className="font-medium">Akan Dihapus:</span><span className="font-bold">{deletableUsersCount}</span></div>
                                    {skippableUsersCount > 0 && <div className="flex justify-between mt-1 text-amber-700"><span className="font-medium">Dilewati (Super Admin):</span><span className="font-bold">{skippableUsersCount}</span></div>}
                                </div>
                            </div>
                             <div className="flex items-center justify-end pt-5 mt-5 space-x-3 border-t">
                                <button onClick={() => setBulkDeleteConfirmation(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Batal</button>
                                <button onClick={handleBulkDelete} disabled={isLoading || deletableUsersCount === 0} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-danger rounded-lg hover:bg-red-700 disabled:bg-red-400">{isLoading && <SpinnerIcon className="w-4 h-4 mr-2"/>}Ya, Hapus ({deletableUsersCount})</button>
                            </div>
                        </>
                    ) : (
                        <>
                             <div className="text-center">
                                <div className="flex items-center justify-center w-12 h-12 mx-auto text-red-600 bg-red-100 rounded-full">
                                    <ExclamationTriangleIcon className="w-8 h-8" />
                                </div>
                                <h3 className="mt-4 text-lg font-semibold text-gray-800">Hapus {deletableDivisionsCount} Divisi?</h3>
                                <p className="mt-2 text-sm text-gray-600">Anda akan menghapus divisi yang dipilih. Divisi yang masih memiliki anggota akan dilewati.</p>
                                <div className="w-full p-3 mt-4 text-sm text-left bg-gray-50 border rounded-lg">
                                    <div className="flex justify-between"><span>Total Divisi Dipilih:</span><span className="font-semibold">{selectedDivisionIds.length}</span></div>
                                    <div className="flex justify-between mt-1 text-green-700"><span className="font-medium">Akan Dihapus:</span><span className="font-bold">{deletableDivisionsCount}</span></div>
                                    <div className="flex justify-between mt-1 text-amber-700"><span className="font-medium">Dilewati (memiliki anggota):</span><span className="font-bold">{skippableDivisionsCount}</span></div>
                                </div>
                            </div>
                            <div className="flex items-center justify-end pt-5 mt-5 space-x-3 border-t">
                                <button onClick={() => setBulkDeleteConfirmation(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Batal</button>
                                <button onClick={handleBulkDelete} disabled={isLoading || deletableDivisionsCount === 0} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-danger rounded-lg hover:bg-red-700 disabled:bg-red-400">{isLoading && <SpinnerIcon className="w-4 h-4 mr-2"/>}Ya, Hapus ({deletableDivisionsCount})</button>
                            </div>
                        </>
                    )}
                </Modal>
            )}

            <Modal isOpen={isMoveDivisionModalOpen} onClose={() => setIsMoveDivisionModalOpen(false)} title="Pindahkan Akun ke Divisi Lain" footerContent={<><button onClick={() => setIsMoveDivisionModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Batal</button><button onClick={handleBulkMoveDivision} disabled={isLoading} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-tm-primary rounded-lg hover:bg-tm-primary-hover">{isLoading && <SpinnerIcon className="w-4 h-4 mr-2"/>}Pindahkan</button></>}>
                <p className="mb-4 text-sm text-gray-600">Pilih divisi tujuan untuk <strong>{selectedUserIds.length}</strong> akun yang dipilih.</p>
                <select value={targetDivisionId || ''} onChange={e => setTargetDivisionId(Number(e.target.value))} className="block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md shadow-sm sm:text-sm">
                    {divisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
            </Modal>

            <Modal isOpen={isChangeRoleModalOpen} onClose={() => setIsChangeRoleModalOpen(false)} title="Ubah Role Akun" footerContent={<><button onClick={() => setIsChangeRoleModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Batal</button><button onClick={handleBulkChangeRole} disabled={isLoading} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-tm-primary rounded-lg hover:bg-tm-primary-hover">{isLoading && <SpinnerIcon className="w-4 h-4 mr-2"/>}Ubah Role</button></>}>
                <p className="mb-4 text-sm text-gray-600">Pilih role baru untuk <strong>{selectedUserIds.length}</strong> akun yang dipilih.</p>
                <select value={targetRole} onChange={e => setTargetRole(e.target.value as UserRole)} className="block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md shadow-sm sm:text-sm">
                    {userRoles.filter(r => r !== 'Super Admin').map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                {targetRole === 'Admin' && <p className="mt-2 text-xs text-yellow-600">Akun akan otomatis dipindahkan ke divisi Inventori jika belum.</p>}
            </Modal>

        </div>
    );
};

export default AccountsAndDivisions;