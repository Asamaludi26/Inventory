

import { User, Permission } from '../types';

export const ALL_PERMISSIONS: { group: string; permissions: { key: Permission; label: string }[] }[] = [
    {
        group: 'Dashboard',
        permissions: [{ key: 'dashboard:view', label: 'Melihat Dashboard' }],
    },
    {
        group: 'Request Aset (Baru)',
        permissions: [
            { key: 'requests:view:own', label: 'Melihat request pribadi' },
            { key: 'requests:view:all', label: 'Melihat semua request' },
            { key: 'requests:create', label: 'Membuat request baru (Regular)' },
            { key: 'requests:create:urgent', label: 'Membuat request Urgent & Project' },
            { key: 'requests:approve:logistic', label: 'Menyetujui (tahap Logistik)' },
            { key: 'requests:approve:purchase', label: 'Mengisi detail & menyetujui (tahap Purchase)' },
            { key: 'requests:approve:final', label: 'Memberikan persetujuan final (CEO)' },
            { key: 'requests:cancel:own', label: 'Membatalkan request pribadi' },
            { key: 'requests:delete', label: 'Menghapus request orang lain' },
        ],
    },
    {
        group: 'Request Aset (Pinjam)',
        permissions: [
            { key: 'loan-requests:view:own', label: 'Melihat request pinjam pribadi' },
            { key: 'loan-requests:view:all', label: 'Melihat semua request pinjam' },
            { key: 'loan-requests:create', label: 'Membuat request pinjam' },
            { key: 'loan-requests:approve', label: 'Menyetujui & menetapkan aset pinjaman' },
            { key: 'loan-requests:return', label: 'Mengkonfirmasi pengembalian aset pinjaman' },
        ],
    },
    {
        group: 'Manajemen Aset',
        permissions: [
            { key: 'assets:view', label: 'Melihat daftar aset & stok' },
            { key: 'assets:create', label: 'Mencatat aset baru' },
            { key: 'assets:edit', label: 'Mengedit data aset' },
            { key: 'assets:delete', label: 'Menghapus data aset' },
            { key: 'assets:handover', label: 'Melakukan serah terima (handover)' },
            { key: 'assets:dismantle', label: 'Melakukan penarikan (dismantle)' },
            { key: 'assets:install', label: 'Melakukan instalasi ke pelanggan' },
            { key: 'assets:repair:report', label: 'Melaporkan kerusakan aset' },
            { key: 'assets:repair:manage', label: 'Mengelola alur perbaikan aset' },
        ],
    },
    {
        group: 'Manajemen Pelanggan',
        permissions: [
            { key: 'customers:view', label: 'Melihat data pelanggan' },
            { key: 'customers:create', label: 'Menambah pelanggan baru' },
            { key: 'customers:edit', label: 'Mengedit data pelanggan' },
            { key: 'customers:delete', label: 'Menghapus data pelanggan' },
        ],
    },
    {
        group: 'Pengaturan',
        permissions: [
            { key: 'users:view', label: 'Melihat daftar pengguna & divisi' },
            { key: 'users:create', label: 'Membuat pengguna baru' },
            { key: 'users:edit', label: 'Mengedit data pengguna' },
            { key: 'users:delete', label: 'Menghapus pengguna' },
            { key: 'users:reset-password', label: 'Reset kata sandi pengguna' },
            { key: 'users:manage-permissions', label: 'Mengelola hak akses pengguna' },
            { key: 'divisions:manage', label: 'Mengelola divisi' },
            { key: 'categories:manage', label: 'Mengelola kategori, tipe, & model aset' },
            { key: 'account:manage', label: 'Mengelola akun pribadi' },
        ],
    },
];

export const ALL_PERMISSION_KEYS = ALL_PERMISSIONS.flatMap(group => group.permissions.map(p => p.key));

/**
 * Checks if a user has a specific permission.
 * Super Admins are always granted permission.
 * @param user The user object.
 * @param permission The permission key to check.
 * @returns True if the user has the permission, false otherwise.
 */
export const hasPermission = (user: User | null, permission: Permission): boolean => {
    if (!user) {
        return false;
    }
    // Super Admin has all permissions implicitly.
    if (user.role === 'Super Admin') {
        return true;
    }
    return user.permissions.includes(permission);
};