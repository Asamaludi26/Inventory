import React from 'react';
import { Page, User, Customer, Asset, PreviewData, Dismantle, ActivityLogEntry, Maintenance, AssetCategory } from '../../types';
import CustomerListPage from './list/CustomerListPage';
import InstallationFormPage from './installation/InstallationFormPage';
import MaintenanceFormPage from './maintenance/MaintenanceFormPage';
import DismantleFormPage from './dismantle/DismantleFormPage';
import CustomerDetailPage from './detail/CustomerDetailPage';
import CustomerFormPage from './form/CustomerFormPage';

interface CustomerManagementHubProps {
    subPage: 'list' | 'installation' | 'maintenance' | 'dismantle' | 'detail' | 'new' | 'edit';
    currentUser: User;
    customers: Customer[];
    setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
    assets: Asset[];
    assetCategories: AssetCategory[];
    onInitiateDismantle: (asset: Asset) => void;
    onShowPreview: (data: PreviewData) => void;
    setActivePage: (page: Page, filters?: any) => void;
    onUpdateAsset: (assetId: string, updates: Partial<Asset>, logEntry?: Omit<ActivityLogEntry, 'id' | 'timestamp'>) => void;

    // Props are now required from the unified call in App.tsx
    dismantles: Dismantle[];
    setDismantles: React.Dispatch<React.SetStateAction<Dismantle[]>>;
    maintenances: Maintenance[];
    setMaintenances: React.Dispatch<React.SetStateAction<Maintenance[]>>;
    users: User[];
    prefillData: any;
    onClearPrefill: () => void;
    pageInitialState: any;
}

const CustomerManagementPage: React.FC<CustomerManagementHubProps> = (props) => {
    const { subPage, ...rest } = props;

    switch (subPage) {
        case 'list':
            return <CustomerListPage 
                        currentUser={props.currentUser}
                        customers={props.customers}
                        setCustomers={props.setCustomers}
                        assets={props.assets}
                        onInitiateDismantle={props.onInitiateDismantle}
                        onShowPreview={props.onShowPreview}
                        setActivePage={props.setActivePage}
                        initialFilters={props.pageInitialState}
                    />;
        case 'new':
        case 'edit':
             return <CustomerFormPage
                        currentUser={props.currentUser}
                        customers={props.customers}
                        setCustomers={props.setCustomers}
                        assets={props.assets}
                        onUpdateAsset={props.onUpdateAsset}
                        setActivePage={props.setActivePage}
                        pageInitialState={props.pageInitialState}
                    />;
        case 'installation':
            return <InstallationFormPage setActivePage={props.setActivePage} />;
        case 'maintenance':
            return <MaintenanceFormPage 
                        currentUser={props.currentUser}
                        maintenances={props.maintenances}
                        setMaintenances={props.setMaintenances}
                        customers={props.customers}
                        assets={props.assets}
                        onUpdateAsset={props.onUpdateAsset}
                        users={props.users}
                        setActivePage={props.setActivePage}
                        pageInitialState={props.pageInitialState}
                    />;
        case 'detail':
            return <CustomerDetailPage 
                        customers={props.customers}
                        assets={props.assets}
                        assetCategories={props.assetCategories}
                        initialState={props.pageInitialState}
                        setActivePage={props.setActivePage}
                        onShowPreview={props.onShowPreview}
                        onInitiateDismantle={props.onInitiateDismantle}
                    />;
        case 'dismantle':
            return <DismantleFormPage
                        currentUser={props.currentUser}
                        dismantles={props.dismantles!}
                        setDismantles={props.setDismantles!}
                        assets={props.assets}
                        customers={props.customers}
                        users={props.users!}
                        prefillData={props.prefillData}
                        onClearPrefill={props.onClearPrefill!}
                        onUpdateAsset={props.onUpdateAsset!}
                        onShowPreview={props.onShowPreview}
                        setActivePage={props.setActivePage}
                        pageInitialState={props.pageInitialState}
                    />;
        default:
             return <CustomerListPage 
                        currentUser={props.currentUser}
                        customers={props.customers}
                        setCustomers={props.setCustomers}
                        assets={props.assets}
                        onInitiateDismantle={props.onInitiateDismantle}
                        onShowPreview={props.onShowPreview}
                        setActivePage={props.setActivePage}
                        initialFilters={props.pageInitialState}
                    />;
    }
};

export default CustomerManagementPage;