
import React, { useState, useEffect } from 'react';
import { Division, User, UserRole, Permission } from '../../types';
import { useNotification } from '../../providers/NotificationProvider';
import { SpinnerIcon } from '../../components/icons/SpinnerIcon';
import { CustomSelect } from '../../components/ui/CustomSelect';
import FormPageLayout from '../../components/layout/FormPageLayout';
import { hasPermission } from '../../utils/permissions';
import { PermissionManager } from './components/PermissionManager';
import { LockIcon } from '../../components/icons/LockIcon';

const userRoles: UserRole[] = ['Staff', 'Leader', 'Admin Logistik', 'Admin Purchase', 'Super Admin'];

interface UserFormPageProps {
    currentUser: User;
    divisions: Division[];
    onSave: (user: Omit<User, 'id'>, id?: number) => void;
    onCancel: () => void;
    editingUser: User | null;
}

const UserFormPage: React.FC<UserFormPageProps> = ({ currentUser, divisions, onSave, onCancel, editingUser }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [selectedRole, setSelectedRole] = useState<UserRole>('Staff');
    const [selectedDivisionId, setSelectedDivisionId] = useState<string>(divisions[0]?.id.toString() || '');
    const [permissions, setPermissions] = useState<Permission[]>([]);
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const addNotification = useNotification();

    const inventoryDivisionId = divisions.find(d => d.name === 'Logistik')?.id.toString();
    const canManagePermissions = hasPermission(currentUser, 'users:manage-permissions');

    useEffect(() => {
        if (editingUser) {
            setName(editingUser.name);
            setEmail(editingUser.email);
            setSelectedRole(editingUser.role);
            setSelectedDivisionId(editingUser.divisionId?.toString() || '');
            setPermissions(editingUser.permissions || []);
        } else {
            setName('');
            setEmail('');
            setSelectedRole('Staff');
            setSelectedDivisionId(divisions[0]?.id.toString() || '');
            setPermissions([]); // Start with no permissions for a new user
        }
    }, [editingUser, divisions]);

    useEffect(() => {
        if (selectedRole === 'Admin Logistik' && inventoryDivisionId) {
            setSelectedDivisionId(inventoryDivisionId);
        }
    }, [selectedRole, inventoryDivisionId]);

    const handleDivisionChange = (divisionId: string) => {
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
                permissions,
            }, editingUser?.id);
            setIsSubmitting(false);
        }, 1000);
    };

    return (
        <FormPageLayout
            title={editingUser ? 'Edit Akun Pengguna' : 'Tambah Akun Pengguna Baru'}
            actions={
                <>
                    <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Batal</button>
                    <button type="submit" form="user-form" disabled={isSubmitting} className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 rounded-lg shadow-sm bg-tm-primary hover:bg-tm-primary-hover disabled:bg-tm-primary/70">
                        {isSubmitting && <SpinnerIcon className="w-5 h-5 mr-2" />}
                        {editingUser ? 'Simpan Perubahan' : 'Simpan Akun'}
                    </button>
                </>
            }
        >
            <form id="user-form" onSubmit={handleSubmit} className="mx-auto space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                options={userRoles.map(r => ({ value: r, label: r }))}
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
                                disabled={selectedRole === 'Super Admin' || selectedRole === 'Admin Logistik'}
                                placeholder="Pilih Divisi"
                            />
                        </div>
                    </div>
                </div>

                {canManagePermissions && (
                    <div className="pt-6 border-t">
                        <div className="flex items-center gap-3 mb-4">
                            <LockIcon className="w-6 h-6 text-tm-primary" />
                            <h3 className="text-lg font-semibold text-tm-dark">Manajemen Hak Akses (Permissions)</h3>
                        </div>
                        <PermissionManager
                            currentPermissions={permissions}
                            onChange={setPermissions}
                        />
                    </div>
                )}
            </form>
        </FormPageLayout>
    );
};

export default UserFormPage;
