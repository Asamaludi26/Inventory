
import React, { useState, useMemo, useEffect } from 'react';
import { Page, User, Asset, Division, LoanRequest, LoanRequestStatus, ItemStatus, AssetStatus, Handover, AssetCategory, Notification, LoanItem, ParsedScanResult, AssetReturn, AssetReturnStatus } from '../../../types';
import { useSortableData, SortConfig } from '../../../hooks/useSortableData';
import { useNotification } from '../../../providers/NotificationProvider';
import { PaginationControls } from '../../../components/ui/PaginationControls';
import Modal from '../../../components/ui/Modal';
import { InboxIcon } from '../../../components/icons/InboxIcon';
import { SearchIcon } from '../../../components/icons/SearchIcon';
import { SortIcon } from '../../../components/icons/SortIcon';
import { SortAscIcon } from '../../../components/icons/SortAscIcon';
import { SortDescIcon } from '../../../components/icons/SortDescIcon';
import { EyeIcon } from '../../../components/icons/EyeIcon';
import LoanRequestForm from './LoanRequestForm';
import LoanRequestDetailPage from './LoanRequestDetailPage';
import { CheckIcon } from '../../../components/icons/CheckIcon';
import { SpinnerIcon } from '../../../components/icons/SpinnerIcon';
import { generateDocumentNumber } from '../../../utils/documentNumberGenerator';

interface LoanRequestPageProps {
    currentUser: User;
    loanRequests: LoanRequest[];
    setLoanRequests: React.Dispatch<React.SetStateAction<LoanRequest[]>>;
    returns: AssetReturn[];
    assets: Asset[];
    setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
    users: User[];
    divisions: Division[];
    handovers: Handover[];
    setHandovers: React.Dispatch<React.SetStateAction<Handover[]>>;
    setActivePage: (page: Page, filters?: any) => void;
    onShowPreview: (data: any) => void;
    onInitiateHandoverFromLoan: (loanRequest: LoanRequest) => void;
    assetCategories: AssetCategory[];
    addNotification: (notification: Partial<Notification> & { recipientId: number, actorName: string, type: Notification['type'], referenceId: string }) => void;
    setIsGlobalScannerOpen: (isOpen: boolean) => void;
    setScanContext: (context: 'global' | 'form') => void;
    setFormScanCallback: (callback: ((data: ParsedScanResult) => void) | null) => void;
    initialFilters?: any;
}

const getStatusClass = (status: LoanRequestStatus) => {
    switch (status) {
        case LoanRequestStatus.PENDING: return 'bg-warning-light text-warning-text';
        case LoanRequestStatus.APPROVED: return 'bg-sky-100 text-sky-700';
        case LoanRequestStatus.ON_LOAN: return 'bg-info-light text-info-text';
        case LoanRequestStatus.RETURNED: return 'bg-success-light text-success-text';
        case LoanRequestStatus.REJECTED: return 'bg-danger-light text-danger-text';
        case LoanRequestStatus.OVERDUE: return 'bg-red-200 text-red-800 font-bold';
        case LoanRequestStatus.AWAITING_RETURN: return 'bg-blue-100 text-blue-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const getReturnStatusClass = (status: AssetReturnStatus) => {
    switch (status) {
        case AssetReturnStatus.PENDING_APPROVAL: return 'bg-warning-light text-warning-text';
        case AssetReturnStatus.APPROVED: return 'bg-success-light text-success-text';
        case AssetReturnStatus.REJECTED: return 'bg-danger-light text-danger-text';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const SortableHeader: React.FC<{
    children: React.ReactNode;
    columnKey: keyof LoanRequest;
    sortConfig: SortConfig<LoanRequest> | null;
    requestSort: (key: keyof LoanRequest) => void;
}> = ({ children, columnKey, sortConfig, requestSort }) => {
    const isSorted = sortConfig?.key === columnKey;
    const direction = isSorted ? sortConfig.direction : undefined;
    const getSortIcon = () => {
        if (!isSorted) return <SortIcon className="w-4 h-4 text-gray-400" />;
        if (direction === 'ascending') return <SortAscIcon className="w-4 h-4 text-tm-accent" />;
        return <SortDescIcon className="w-4 h-4 text-tm-accent" />;
    };
    return (
        <th scope="col" className="px-6 py-3 text-sm font-semibold tracking-wider text-left text-gray-500">
            <button onClick={() => requestSort(columnKey)} className="flex items-center space-x-1 group">
                <span>{children}</span>
                <span className="opacity-50 group-hover:opacity-100">{getSortIcon()}</span>
            </button>
        </th>
    );
};

const LoanRequestTable: React.FC<{ 
    requests: LoanRequest[], 
    onDetailClick: (req: LoanRequest) => void, 
    sortConfig: SortConfig<LoanRequest> | null, 
    requestSort: (key: keyof LoanRequest) => void 
}> = ({ requests, onDetailClick, sortConfig, requestSort }) => (
    <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
            <tr>
                <SortableHeader columnKey="id" sortConfig={sortConfig} requestSort={requestSort}>ID / Tgl Request</SortableHeader>
                <SortableHeader columnKey="requester" sortConfig={sortConfig} requestSort={requestSort}>Pemohon</SortableHeader>
                <th scope="col" className="px-6 py-3 text-sm font-semibold tracking-wider text-left text-gray-500">Detail Permintaan</th>
                <SortableHeader columnKey="status" sortConfig={sortConfig} requestSort={requestSort}>Status</SortableHeader>
                <th className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>
            </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
            {requests.length > 0 ? requests.map(req => (
                <tr key={req.id} onClick={() => onDetailClick(req)} className="cursor-pointer hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-semibold text-gray-900">{req.id}</div><div className="text-xs text-gray-500">{new Date(req.requestDate).toLocaleDateString('id-ID')}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{req.requester}</div><div className="text-xs text-gray-500">{req.division}</div></td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="font-medium text-gray-800">{req.items.length} jenis item</div>
                        <div className="text-xs truncate text-gray-500 max-w-[200px]" title={req.items.map(i => i.itemName).join(', ')}>
                            {req.items.map(i => i.itemName).join(', ')}
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusClass(req.status)}`}>{req.status}</span></td>
                    <td className="px-6 py-4 text-sm font-medium text-right"><button className="p-2 text-gray-500 rounded-full hover:bg-info-light hover:text-info-text"><EyeIcon className="w-5 h-5"/></button></td>
                </tr>
            )) : (
                <tr><td colSpan={5} className="py-12 text-center text-gray-500"><InboxIcon className="w-12 h-12 mx-auto text-gray-300" /><p className="mt-2 font-semibold">Tidak ada data.</p></td></tr>
            )}
        </tbody>
    </table>
);

const ReturnRequestTable: React.FC<{ 
    returns: AssetReturn[], 
    onDetailClick: (ret: AssetReturn) => void,
}> = ({ returns, onDetailClick }) => (
    <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
            <tr>
                <th scope="col" className="px-6 py-3 text-sm font-semibold tracking-wider text-left text-gray-500">No. Dokumen / Tgl Kembali</th>
                <th scope="col" className="px-6 py-3 text-sm font-semibold tracking-wider text-left text-gray-500">Aset yang Dikembalikan</th>
                <th scope="col" className="px-6 py-3 text-sm font-semibold tracking-wider text-left text-gray-500">Pihak Terlibat</th>
                <th scope="col" className="px-6 py-3 text-sm font-semibold tracking-wider text-left text-gray-500">Kondisi</th>
                <th scope="col" className="px-6 py-3 text-sm font-semibold tracking-wider text-left text-gray-500">Status</th>
                <th className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>
            </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
            {returns.length > 0 ? returns.map(ret => (
                <tr key={ret.id} onClick={() => onDetailClick(ret)} className="cursor-pointer hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-semibold text-gray-900">{ret.docNumber}</div><div className="text-xs text-gray-500">{new Date(ret.returnDate).toLocaleDateString('id-ID')}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{ret.assetName}</div><div className="text-xs text-gray-500 font-mono">{ret.assetId}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{ret.returnedBy}</div><div className="text-xs text-gray-500">ke {ret.receivedBy}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{ret.returnedCondition}</span></td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getReturnStatusClass(ret.status)}`}>
                            {ret.status}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-right"><button className="p-2 text-gray-500 rounded-full hover:bg-info-light hover:text-info-text"><EyeIcon className="w-5 h-5"/></button></td>
                </tr>
            )) : (
                <tr><td colSpan={6} className="py-12 text-center text-gray-500"><InboxIcon className="w-12 h-12 mx-auto text-gray-300" /><p className="mt-2 font-semibold">Tidak ada data pengembalian.</p></td></tr>
            )}
        </tbody>
    </table>
);


// --- Specific Return Modal ---
const SpecificReturnModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    request: LoanRequest | null;
    assetId: string | null;
    assets: Asset[];
    onConfirm: (request: LoanRequest, assetId: string) => void;
    isLoading: boolean;
}> = ({ isOpen, onClose, request, assetId, assets, onConfirm, isLoading }) => {
    if (!request || !assetId) return null;
    
    const asset = assets.find(a => a.id === assetId);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Konfirmasi Pengembalian Aset"
            size="md"
            hideDefaultCloseButton
            footerContent={
                <>
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Batal</button>
                    <button onClick={() => onConfirm(request, assetId)} disabled={isLoading} className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-tm-primary rounded-lg shadow-sm hover:bg-tm-primary-hover disabled:bg-tm-primary/70">
                        {isLoading && <SpinnerIcon className="w-4 h-4 mr-2" />}
                        Konfirmasi Pengembalian
                    </button>
                </>
            }
        >
            <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <h4 className="font-semibold text-blue-900 mb-1">{asset?.name}</h4>
                    <p className="text-sm text-blue-700 font-mono mb-2">{asset?.id}</p>
                    <div className="text-xs text-blue-600">
                        SN: {asset?.serialNumber || 'N/A'}
                    </div>
                </div>
                <p className="text-sm text-gray-600">
                    Anda akan mengembalikan aset ini dari peminjaman <span className="font-semibold text-gray-900">#{request.id}</span>. 
                    Status aset akan kembali menjadi <strong>"Di Gudang"</strong>.
                </p>
            </div>
        </Modal>
    );
};


const LoanRequestPage: React.FC<LoanRequestPageProps> = (props) => {
    const { currentUser, loanRequests, setLoanRequests, returns, assets, setAssets, users, divisions, handovers, setHandovers, onShowPreview, onInitiateHandoverFromLoan, assetCategories, addNotification, setIsGlobalScannerOpen, setScanContext, setFormScanCallback, initialFilters, setActivePage } = props;
    const [view, setView] = useState<'list' | 'form' | 'detail'>('list');
    const [activeTab, setActiveTab] = useState<'loans' | 'returns'>('loans');
    const [selectedRequest, setSelectedRequest] = useState<LoanRequest | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({ status: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isLoading, setIsLoading] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    
    // State for Specific Return Modal
    const [specificReturnData, setSpecificReturnData] = useState<{ request: LoanRequest, assetId: string } | null>(null);

    const addNotificationUI = useNotification();

    // Effect to handle deep linking and actions from other pages
    useEffect(() => {
        if (initialFilters?.openDetailForId) {
            const request = loanRequests.find(req => req.id === initialFilters.openDetailForId);
            if (request) {
                // If a specific asset ID is provided for return, open the SpecificReturnModal directly
                // instead of navigating to the full detail page.
                if (initialFilters.preselectReturnAssetId) {
                    setSpecificReturnData({
                        request,
                        assetId: initialFilters.preselectReturnAssetId
                    });
                    // Don't change view to 'detail' here
                } else {
                    // Otherwise, open the detail view as usual
                    setSelectedRequest(request);
                    setView('detail');
                }
            }
        }
    }, [initialFilters, loanRequests]);

    const filteredRequests = useMemo(() => {
        let tempRequests = [...loanRequests];
        if (!['Admin Logistik', 'Super Admin'].includes(currentUser.role)) {
            tempRequests = tempRequests.filter(req => req.requester === currentUser.name);
        }
        return tempRequests.filter(req => {
            const searchLower = searchQuery.toLowerCase();
            return req.id.toLowerCase().includes(searchLower) ||
                   req.requester.toLowerCase().includes(searchLower) ||
                   req.items.some(i => i.itemName.toLowerCase().includes(searchLower));
        }).filter(req => filters.status ? req.status === filters.status : true);
    }, [loanRequests, currentUser, searchQuery, filters]);

    const { items: sortedRequests, requestSort, sortConfig } = useSortableData(filteredRequests, { key: 'requestDate', direction: 'descending' });

    const totalItems = activeTab === 'loans' ? sortedRequests.length : returns.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedRequests = sortedRequests.slice(startIndex, startIndex + itemsPerPage);
    const paginatedReturns = returns.slice(startIndex, startIndex + itemsPerPage); // Simple pagination for now

    useEffect(() => { setCurrentPage(1); }, [searchQuery, filters, itemsPerPage, activeTab]);

    const handleCreateRequest = (data: { loanItems: LoanItem[]; notes: string; }) => {
        const userDivision = divisions.find(d => d.id === currentUser.divisionId)?.name || 'N/A';
        const newRequest: LoanRequest = {
            id: `LREQ-${(loanRequests.length + 1).toString().padStart(3, '0')}`,
            requester: currentUser.name,
            division: userDivision,
            requestDate: new Date().toISOString(),
            status: LoanRequestStatus.PENDING,
            items: data.loanItems,
            notes: data.notes,
        };
        
        setLoanRequests(prev => [newRequest, ...prev]);
        addNotificationUI('Permintaan peminjaman berhasil dibuat.', 'success');
        setView('list');
    };

    const handleAssignAndApprove = (request: LoanRequest, result: { itemStatuses: any, assignedAssetIds: any }) => {
        setIsLoading(true);
        setTimeout(() => {
            const { itemStatuses, assignedAssetIds } = result;
            const allStatuses = Object.values(itemStatuses).map((s: any) => s.status);
            const allRejected = allStatuses.every(s => s === 'rejected');
            const newStatus = allRejected ? LoanRequestStatus.REJECTED : LoanRequestStatus.APPROVED;
            
            const updatedRequest: LoanRequest = {
                ...request,
                status: newStatus,
                approver: currentUser.name,
                approvalDate: new Date().toISOString(),
                assignedAssetIds,
                itemStatuses,
                rejectionReason: allRejected ? "Semua item ditolak oleh Admin." : undefined
            };

            setLoanRequests(prev => prev.map(req => req.id === request.id ? updatedRequest : req));
            setSelectedRequest(updatedRequest); 
            
            if (allRejected) {
                addNotificationUI(`Request pinjam ${request.id} telah ditolak sepenuhnya.`, 'warning');
            } else {
                addNotificationUI(`Request pinjam ${request.id} disetujui dengan revisi/penetapan aset.`, 'success');
            }
            setIsLoading(false);
        }, 1000);
    };

    const handleRejection = () => {
        if (!selectedRequest || !rejectionReason.trim()) {
            addNotificationUI('Alasan penolakan harus diisi.', 'error');
            return;
        }
        setIsLoading(true);
        setTimeout(() => {
            setLoanRequests(prev => prev.map(req => req.id === selectedRequest.id ? { ...req, status: LoanRequestStatus.REJECTED, approver: currentUser.name, approvalDate: new Date().toISOString(), rejectionReason: rejectionReason.trim() } : req));
            addNotificationUI(`Request pinjam ${selectedRequest.id} ditolak.`, 'warning');
            setIsLoading(false);
            setIsRejectModalOpen(false);
            setView('list');
        }, 1000);
    };
    
    const handleConfirmReturn = (request: LoanRequest, assetIds: string[]) => {
        setIsLoading(true);
        setTimeout(() => {
            const currentReturnedIds = request.returnedAssetIds || [];
            const newReturnedIds = [...new Set([...currentReturnedIds, ...assetIds])];

            const allAssignedIds = Object.values(request.assignedAssetIds || {}).flat();
            const isFullyReturned = allAssignedIds.every(id => newReturnedIds.includes(id));

            const now = new Date();
            const handoverDate = new Date(); // Handover date is now
            const handoverDocNumber = generateDocumentNumber('HO-RET', handovers, handoverDate);
            const handoverId = `HO-${String(handovers.length + 1).padStart(3, '0')}`;

            // Generate Handover Item
            const returnedAssets = assets.filter(a => assetIds.includes(a.id));
            const handoverItems = returnedAssets.map(asset => ({
                id: Date.now() + Math.random(),
                assetId: asset.id,
                itemName: asset.name,
                itemTypeBrand: asset.brand,
                conditionNotes: asset.condition || 'Dikembalikan dari Peminjaman',
                quantity: 1,
                checked: true,
            }));

            // Create Handover Record
            const newHandover: Handover = {
                id: handoverId,
                docNumber: handoverDocNumber,
                handoverDate: handoverDate.toISOString().split('T')[0],
                menyerahkan: request.requester, // Peminjam mengembalikan
                penerima: currentUser.name, // Admin menerima
                mengetahui: 'N/A', 
                woRoIntNumber: request.id,
                items: handoverItems,
                status: ItemStatus.COMPLETED,
            };

            setHandovers(prev => [newHandover, ...prev]);

            setLoanRequests(prev => prev.map(req => req.id === request.id ? { 
                ...req, 
                status: isFullyReturned ? LoanRequestStatus.RETURNED : LoanRequestStatus.ON_LOAN, 
                actualReturnDate: isFullyReturned ? now.toISOString() : req.actualReturnDate,
                returnedAssetIds: newReturnedIds
            } : req));

            setAssets(prev => prev.map(asset => assetIds.includes(asset.id) ? { ...asset, status: AssetStatus.IN_STORAGE, currentUser: null, location: 'Gudang Inventori' } : asset));
            
            addNotificationUI(isFullyReturned ? `Semua aset untuk ${request.id} telah dikembalikan. Handover #${newHandover.docNumber} dibuat.` : `Aset telah dikembalikan. Handover #${newHandover.docNumber} dibuat.`, 'success');
            
            // Update selected request if open
            if (selectedRequest && selectedRequest.id === request.id) {
                const updatedReq = { ...request, status: isFullyReturned ? LoanRequestStatus.RETURNED : LoanRequestStatus.ON_LOAN, returnedAssetIds: newReturnedIds };
                setSelectedRequest(updatedReq);
            }
            
            // Close specific modal if open
            setSpecificReturnData(null);
            setIsLoading(false);
        }, 1000);
    };

    const handleInitiateReturn = (request: LoanRequest) => {
        setIsLoading(true);
        setTimeout(() => {
            const updatedRequest = { ...request, status: LoanRequestStatus.AWAITING_RETURN };
            setLoanRequests(prev => prev.map(req => req.id === request.id ? updatedRequest : req));
            
            const logisticAdmins = users.filter(u => u.role === 'Admin Logistik');
            logisticAdmins.forEach(admin => {
                addNotification({
                    recipientId: admin.id,
                    actorName: currentUser.name,
                    type: 'STATUS_CHANGE', 
                    referenceId: request.id,
                    message: `memulai proses pengembalian untuk #${request.id}. Mohon konfirmasi penerimaan.`
                });
            });
            
            addNotificationUI('Proses pengembalian telah dimulai. Admin akan mengkonfirmasi penerimaan aset.', 'success');
            setSelectedRequest(updatedRequest);
            setIsLoading(false);
        }, 1000);
    };

    const renderContent = () => {
        if (view === 'form') {
            return <div className="p-4 sm:p-6 md:p-8"><div className="flex items-center justify-between mb-6"><h1 className="text-3xl font-bold text-tm-dark">Buat Request Peminjaman Aset</h1><button onClick={() => setView('list')} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Kembali</button></div><div className="p-4 sm:p-6 bg-white border border-gray-200/80 rounded-xl shadow-md pb-24"><LoanRequestForm availableAssets={assets.filter(a => a.status === AssetStatus.IN_STORAGE)} onSave={handleCreateRequest} onCancel={() => setView('list')} currentUser={currentUser} divisions={divisions}/></div></div>;
        }
        if (view === 'detail' && selectedRequest) {
            return <LoanRequestDetailPage 
                loanRequest={selectedRequest} 
                currentUser={currentUser} 
                assets={assets} 
                users={users} 
                divisions={divisions} 
                assetCategories={assetCategories}
                onBackToList={() => { setView('list'); setSelectedRequest(null); }} 
                onShowPreview={onShowPreview} 
                onAssignAndApprove={handleAssignAndApprove} 
                onReject={() => setIsRejectModalOpen(true)} 
                onConfirmReturn={handleConfirmReturn} 
                onInitiateReturn={handleInitiateReturn}
                onInitiateHandoverFromLoan={onInitiateHandoverFromLoan} 
                isLoading={isLoading}
                setIsGlobalScannerOpen={setIsGlobalScannerOpen}
                setScanContext={setScanContext}
                setFormScanCallback={setFormScanCallback}
                 />;
        }
        return (
            <div className="p-4 sm:p-6 md:p-8">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6"><h1 className="text-3xl font-bold text-tm-dark">Request Peminjaman</h1><button onClick={() => setView('form')} className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 rounded-lg shadow-sm bg-tm-primary hover:bg-tm-primary-hover">Buat Request Pinjam</button></div>
                
                <div className="mb-6 border-b border-gray-200">
                    <nav className="flex -mb-px space-x-6" aria-label="Tabs">
                        <button onClick={() => setActiveTab('loans')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'loans' ? 'border-tm-primary text-tm-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Request Peminjaman</button>
                        <button onClick={() => setActiveTab('returns')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'returns' ? 'border-tm-primary text-tm-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Request Pengembalian</button>
                    </nav>
                </div>
                
                <div className="p-4 mb-4 bg-white border border-gray-200/80 rounded-xl shadow-md"><div className="relative"><SearchIcon className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 top-1/2 left-3" /><input type="text" placeholder="Cari ID, pemohon, aset..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full h-10 py-2 pl-10 pr-4 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-tm-accent focus:border-tm-accent" /></div></div>
                <div className="overflow-hidden bg-white border border-gray-200/80 rounded-xl shadow-md">
                    <div className="overflow-x-auto custom-scrollbar">
                        {activeTab === 'loans' ? (
                            <LoanRequestTable requests={paginatedRequests} onDetailClick={(req) => { setSelectedRequest(req); setView('detail'); }} sortConfig={sortConfig} requestSort={requestSort} />
                        ) : (
                            <ReturnRequestTable returns={paginatedReturns} onDetailClick={(ret) => setActivePage('return-detail', { returnId: ret.id })} />
                        )}
                    </div>
                    <PaginationControls currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} onItemsPerPageChange={setItemsPerPage} startIndex={startIndex} endIndex={startIndex + (activeTab === 'loans' ? paginatedRequests.length : paginatedReturns.length)} />
                </div>
            </div>
        );
    };

    return (
        <>
            {renderContent()}
            
            <Modal isOpen={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)} title="Tolak Permintaan Pinjam">
                <div className="space-y-4"><p className="text-sm text-gray-600">Alasan penolakan untuk <strong className="font-semibold">{selectedRequest?.id}</strong>.</p><textarea value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} rows={3} className="w-full text-sm border-gray-300 rounded-md focus:ring-tm-accent focus:border-tm-accent " placeholder="Contoh: Aset tidak tersedia..."></textarea></div>
                <div className="flex justify-end gap-2 mt-6 pt-4 border-t"><button onClick={() => setIsRejectModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Batal</button><button onClick={handleRejection} disabled={isLoading || !rejectionReason.trim()} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-danger rounded-lg shadow-sm hover:bg-red-700">Konfirmasi Tolak</button></div>
            </Modal>

            {/* Specific Return Modal */}
            <SpecificReturnModal 
                isOpen={!!specificReturnData}
                onClose={() => setSpecificReturnData(null)}
                request={specificReturnData?.request || null}
                assetId={specificReturnData?.assetId || null}
                assets={assets}
                isLoading={isLoading}
                onConfirm={(req, assetId) => handleConfirmReturn(req, [assetId])}
            />
        </>
    );
};

export default LoanRequestPage;
