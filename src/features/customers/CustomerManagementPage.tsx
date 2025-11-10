import React from 'react';
import { Page, User, Customer, Asset, PreviewData, Dismantle, ActivityLogEntry } from '../../types';
import CustomerListPage from './list/CustomerListPage';
import InstallationFormPage from './installation/InstallationFormPage';
import MaintenanceFormPage from './maintenance/MaintenanceFormPage';
import DismantleFormPage from './dismantle/DismantleFormPage';

interface CustomerManagementHubProps {
    subPage: 'list' | 'installation' | 'maintenance' | 'dismantle';
    currentUser: User;
    customers: Customer[];
    setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
    assets: Asset[];
    onInitiateDismantle: (asset: Asset) => void;
    onShowPreview: (data: PreviewData) => void;
    itemToEdit: { type: string; data: any } | null;
    onClearItemToEdit: () => void;
    setActivePage: (page: Page, filters?: any) => void;
    // Props for DismantleFormPage (made optional)
    dismantles?: Dismantle[];
    setDismantles?: React.Dispatch<React.SetStateAction<Dismantle[]>>;
    users?: User[];
    prefillData?: any;
    onClearPrefill?: () => void;
    onUpdateAsset?: (assetId: string, updates: Partial<Asset>, logEntry?: Omit<ActivityLogEntry, 'id' | 'timestamp'>) => void;
}

const CustomerManagementPage: React.FC<CustomerManagementHubProps> = (props) => {
    const { subPage, ...rest } = props;

    switch (subPage) {
        case 'list':
            return <CustomerListPage {...rest} />;
        case 'installation':
            return <InstallationFormPage setActivePage={props.setActivePage} />;
        case 'maintenance':
            return <MaintenanceFormPage setActivePage={props.setActivePage} />;
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
                    />;
        default:
            // Fallback to the customer list page if subPage is invalid
            return <CustomerListPage {...rest} />;
    }
};

export default CustomerManagementPage;