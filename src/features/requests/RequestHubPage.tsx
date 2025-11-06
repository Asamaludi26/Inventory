import React from 'react';
import { Page, User, Request, Asset, AssetCategory, Division, StandardItem, AssetType, Notification } from '../../types';

// FIX: The import path for NewRequestPage was incorrect, pointing to an empty file. Corrected to point to the actual component location.
import NewRequestPage from './new/NewRequestPage';
import LoanRequestPage from './loan/LoanRequestPage';

// Mendefinisikan semua props yang mungkin dibutuhkan oleh halaman anak
interface RequestHubPageProps {
    activePage: Page;
    currentUser: User;
    requests: Request[];
    setRequests: React.Dispatch<React.SetStateAction<Request[]>>;
    assets: Asset[];
    assetCategories: AssetCategory[];
    divisions: Division[];
    onInitiateRegistration: (request: Request, itemToRegister: any) => void;
    onInitiateHandoverFromRequest: (request: Request) => void;
    initialFilters?: any;
    onClearInitialFilters: () => void;
    onShowPreview: (data: any) => void;
    openModelModal: (category: AssetCategory, type: AssetType, onModelAdded: (model: StandardItem) => void) => void;
    openTypeModal: (category: AssetCategory, typeToEdit: AssetType | null, onTypeAdded: (type: AssetType) => void) => void;
    setActivePage: (page: Page, initialState?: any) => void;
    users: User[];
    notifications: Notification[];
    addNotification: (notification: any) => void;
    markNotificationsAsRead: (referenceId: string) => void;
}

const RequestHubPage: React.FC<RequestHubPageProps> = (props) => {
    const { activePage } = props;

    switch (activePage) {
        case 'request':
            return <NewRequestPage {...props} />;
        case 'request-pinjam':
            return <LoanRequestPage {...props} />;
        default:
            // Fallback ke halaman request baru jika terjadi kondisi yang tidak terduga
            return <NewRequestPage {...props} />;
    }
};

export default RequestHubPage;