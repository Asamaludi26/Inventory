





import React from 'react';
import { Page, User, Customer, Asset, PreviewData, Dismantle, ActivityLogEntry, Maintenance, AssetCategory, Installation, Division } from '../../types';
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
    onSaveDismantle: (data: Omit<Dismantle, 'id' | 'status'>) => void;
    maintenances: Maintenance[];
    setMaintenances: React.Dispatch<React.SetStateAction<Maintenance[]>>;
    onSaveMaintenance: (data: Omit<Maintenance, 'id' | 'status' | 'docNumber'>) => void;
    installations: Installation[];
    setInstallations: React.Dispatch<React.SetStateAction<Installation[]>>;
    onSaveInstallation: (data: Omit<Installation, 'id' | 'status'>) => void;
    users: User[];
    divisions: Division[];
    prefillData: any;
    onClearPrefill: () => void;
    pageInitialState: any;
}

const CustomerManagementPage: React.FC<CustomerManagementHubProps> = (props) => {
    const { subPage, currentUser, customers, setCustomers, assets, assetCategories, onInitiateDismantle, onShowPreview, setActivePage, onUpdateAsset, dismantles, setDismantles, onSaveDismantle, maintenances, setMaintenances, onSaveMaintenance, installations, setInstallations, onSaveInstallation, users, divisions, prefillData, onClearPrefill, pageInitialState } = props;

    switch (subPage) {
        case 'list':
            return <CustomerListPage 
                        currentUser={currentUser}
                        customers={customers}
                        setCustomers={setCustomers}
                        assets={assets}
                        onInitiateDismantle={onInitiateDismantle}
                        onShowPreview={onShowPreview}
                        setActivePage={setActivePage}
                        initialFilters={pageInitialState}
                    />;
        case 'new':
        case 'edit':
             return <CustomerFormPage
                        currentUser={currentUser}
                        customers={customers}
                        setCustomers={setCustomers}
                        assets={assets}
                        assetCategories={assetCategories}
                        onUpdateAsset={onUpdateAsset}
                        setActivePage={setActivePage}
                        pageInitialState={pageInitialState}
                    />;
        case 'installation':
            return <InstallationFormPage 
                        currentUser={currentUser}
                        installations={installations}
                        setInstallations={setInstallations}
                        onSaveInstallation={onSaveInstallation}
                        customers={customers}
                        assets={assets}
                        users={users}
                        divisions={divisions}
                        assetCategories={assetCategories}
                        setActivePage={setActivePage}
                        pageInitialState={pageInitialState}
                        onShowPreview={onShowPreview}
                    />;
        case 'maintenance':
            return <MaintenanceFormPage 
                        currentUser={currentUser}
                        maintenances={maintenances}
                        setMaintenances={setMaintenances}
                        onSaveMaintenance={onSaveMaintenance}
                        customers={customers}
                        setCustomers={setCustomers}
                        assets={assets}
                        assetCategories={assetCategories}
                        onUpdateAsset={onUpdateAsset}
                        users={users}
                        setActivePage={setActivePage}
                        pageInitialState={pageInitialState}
                        onShowPreview={onShowPreview}
                    />;
        case 'detail':
            return <CustomerDetailPage 
                        customers={customers}
                        assets={assets}
                        assetCategories={assetCategories}
                        maintenances={maintenances}
                        dismantles={dismantles}
                        installations={installations}
                        initialState={pageInitialState}
                        setActivePage={setActivePage}
                        onShowPreview={onShowPreview}
                        onInitiateDismantle={onInitiateDismantle}
                    />;
        case 'dismantle':
            return <DismantleFormPage
                        currentUser={currentUser}
                        dismantles={dismantles!}
                        setDismantles={setDismantles!}
                        onSaveDismantle={onSaveDismantle}
                        assets={assets}
                        customers={customers}
                        users={users!}
                        prefillData={prefillData}
                        onClearPrefill={onClearPrefill!}
                        onUpdateAsset={onUpdateAsset!}
                        onShowPreview={onShowPreview}
                        setActivePage={setActivePage}
                        pageInitialState={pageInitialState}
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