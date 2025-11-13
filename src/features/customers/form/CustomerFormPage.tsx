

import React, { useMemo } from 'react';
import { Customer, Page, User, Asset, ActivityLogEntry, AssetStatus } from '../../../types';
import FormPageLayout from '../../../components/layout/FormPageLayout';
import CustomerForm from './CustomerForm';
import { useNotification } from '../../../providers/NotificationProvider';

interface CustomerFormPageProps {
    currentUser: User;
    customers: Customer[];
    setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
    assets: Asset[];
    onUpdateAsset: (assetId: string, updates: Partial<Asset>, logEntry?: Omit<ActivityLogEntry, 'id' | 'timestamp'>) => void;
    setActivePage: (page: Page, filters?: any) => void;
    pageInitialState?: { customerId?: string };
}

const CustomerFormPage: React.FC<CustomerFormPageProps> = (props) => {
    const { currentUser, customers, setCustomers, assets, onUpdateAsset, setActivePage, pageInitialState } = props;
    
    const customerToEdit = useMemo(() => {
        if (pageInitialState?.customerId) {
            return customers.find(c => c.id === pageInitialState.customerId) || null;
        }
        return null;
    }, [customers, pageInitialState]);

    const isEditing = !!customerToEdit;
    const addNotification = useNotification();

    const handleSaveCustomer = (
        formData: Omit<Customer, 'id' | 'activityLog'>,
        newlyAssignedAssetIds: string[],
        unassignedAssetIds: string[]
    ) => {
        // --- 1. Update Assets ---
        unassignedAssetIds.forEach(assetId => {
            onUpdateAsset(assetId, {
                currentUser: null,
                location: 'Gudang Inventori',
                // FIX: Use AssetStatus enum member instead of string literal.
                status: AssetStatus.IN_STORAGE,
            }, {
                user: currentUser.name,
                action: 'Penarikan dari Pelanggan',
                details: `Aset ditarik dari pelanggan ${formData.name} melalui form edit.`
            });
        });

        newlyAssignedAssetIds.forEach(assetId => {
            onUpdateAsset(assetId, {
                currentUser: customerToEdit?.id || `TMI-NEW-${Date.now()}`, // Placeholder for new customer
                location: `Terpasang di: ${formData.address}`,
                // FIX: Use AssetStatus enum member instead of string literal.
                status: AssetStatus.IN_USE,
            }, {
                user: currentUser.name,
                action: 'Instalasi Pelanggan',
                details: `Aset dipasang untuk pelanggan ${formData.name} melalui form.`
            });
        });

        // --- 2. Update Customer ---
        if (isEditing) {
            const updatedCustomer = { 
                ...customerToEdit, 
                ...formData,
                activityLog: [
                    ...(customerToEdit.activityLog || []),
                    {
                        id: `log-update-${Date.now()}`,
                        timestamp: new Date().toISOString(),
                        user: currentUser.name,
                        action: 'Data Diperbarui',
                        details: `Data pelanggan telah diperbarui.`
                    }
                ]
            };
            setCustomers(prev => prev.map(c => c.id === customerToEdit.id ? updatedCustomer : c));
            addNotification('Data pelanggan berhasil diperbarui.', 'success');
            // Navigate to detail page after edit
            setActivePage('customer-detail', { customerId: customerToEdit.id });
        } else {
            const newCustomerId = `TMI-${String(1000 + customers.length + 1).padStart(5, '0')}`;
            const newCustomer: Customer = {
                ...formData,
                id: newCustomerId,
                activityLog: [{
                    id: `log-create-${Date.now()}`,
                    timestamp: new Date().toISOString(),
                    user: currentUser.name,
                    action: 'Pelanggan Dibuat',
                    details: 'Data pelanggan baru telah ditambahkan.'
                }]
            };

            // Post-process asset updates for new customer
            newlyAssignedAssetIds.forEach(assetId => {
                onUpdateAsset(assetId, { currentUser: newCustomerId });
            });

            setCustomers(prev => [newCustomer, ...prev]);
            addNotification('Pelanggan baru berhasil ditambahkan.', 'success');
            // Navigate to new customer's detail page
            setActivePage('customer-detail', { customerId: newCustomerId });
        }
    };

    return (
        <FormPageLayout title={isEditing ? 'Edit Pelanggan' : 'Tambah Pelanggan Baru'}>
            <CustomerForm
                customer={customerToEdit}
                assets={assets}
                onSave={handleSaveCustomer}
                onCancel={() => setActivePage(isEditing ? 'customer-detail' : 'customers', { customerId: customerToEdit?.id })}
            />
        </FormPageLayout>
    );
};

export default CustomerFormPage;
