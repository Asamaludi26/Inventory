import React from 'react';
import { Page, User, Request, Asset, AssetCategory, Division, StandardItem, AssetType, Notification, LoanRequest, Handover } from '../../types';

// FIX: The import path for NewRequestPage was incorrect, pointing to an empty file. Corrected to point to the actual component location.
import NewRequestPage from './new/NewRequestPage';
import LoanRequestPage from './loan/LoanRequestPage';

// Mendefinisikan semua props yang mungkin dibutuhkan oleh halaman anak
interface RequestHubPageProps {
    activePage: Page;
    currentUser: User;
    requests: Request[];
    setRequests: React.Dispatch<React.SetStateAction<Request[]>>;
    loanRequests: LoanRequest[];
    setLoanRequests: React.Dispatch<React.SetStateAction<LoanRequest[]>>;
    assets: Asset[];
    setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
    handovers: Handover[];
    setHandovers: React.Dispatch<React.SetStateAction<Handover[]>>;
    assetCategories: AssetCategory[];
    divisions: Division[];
    onInitiateRegistration: (request: Request, itemToRegister: any) => void;
    onInitiateHandoverFromRequest: (request: Request) => void;
    onInitiateHandoverFromLoan: (loanRequest: LoanRequest) => void;
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
            // Pastikan semua props yang dibutuhkan diteruskan, termasuk addNotification
            return <LoanRequestPage
                currentUser={props.currentUser}
                loanRequests={props.loanRequests}
                setLoanRequests={props.setLoanRequests}
                assets={props.assets}
                setAssets={props.setAssets}
                users={props.users}
                divisions={props.divisions}
                handovers={props.handovers}
                setHandovers={props.setHandovers}
                setActivePage={props.setActivePage}
                onShowPreview={props.onShowPreview}
                onInitiateHandoverFromLoan={props.onInitiateHandoverFromLoan}
                assetCategories={props.assetCategories}
                addNotification={props.addNotification}
            />;
        default:
            // Fallback ke halaman request baru jika terjadi kondisi yang tidak terduga
            return <NewRequestPage {...props} />;
    }
};

export default RequestHubPage;