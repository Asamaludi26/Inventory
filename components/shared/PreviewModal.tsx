import React, { useState, useEffect } from 'react';
import { Asset, Customer, User, Request, Handover, Dismantle, Division, AssetStatus } from '../../types';
import Modal from './Modal';
import { ClickableLink } from './ClickableLink';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { ChevronRightIcon } from '../icons/ChevronRightIcon';
import { getStatusClass as getRequestStatusClass } from '../ItemRequest';
import { getStatusClass as getAssetStatusClass } from '../ItemRegistration';
import { getStatusClass as getCustomerStatusClass } from '../CustomerManagement';
import { PencilIcon } from '../icons/PencilIcon';

export type PreviewData = {
    type: 'asset' | 'customer' | 'user' | 'request' | 'handover' | 'dismantle' | 'customerAssets' | 'stockItemAssets';
    id: string | number;
};

interface PreviewModalProps {
    previewData: PreviewData | null;
    onClose: () => void;
    onShowPreview: (data: PreviewData) => void;
    onEditItem: (data: PreviewData) => void;
    assets: Asset[];
    customers: Customer[];
    users: User[];
    requests: Request[];
    handovers: Handover[];
    dismantles: Dismantle[];
    divisions: Division[];
}

const PreviewItem: React.FC<{ label: string; value?: React.ReactNode; children?: React.ReactNode; fullWidth?: boolean }> = ({ label, value, children, fullWidth = false }) => (
    <div className={fullWidth ? 'sm:col-span-2' : ''}>
        <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</dt>
        <dd className="mt-1 text-sm text-gray-800">{value || children || '-'}</dd>
    </div>
);

// Local helper for role badge styling
const getRoleClass = (role: User['role']) => {
    switch(role) {
        case 'Super Admin': return 'bg-purple-100 text-purple-800';
        case 'Admin': return 'bg-info-light text-info-text';
        default: return 'bg-gray-100 text-gray-800';
    }
}

export const PreviewModal: React.FC<PreviewModalProps> = (props) => {
    const { previewData, onClose, onShowPreview, onEditItem, assets, customers, users, requests, handovers, dismantles, divisions } = props;
    const [history, setHistory] = useState<PreviewData[]>([]);

    useEffect(() => {
        if (previewData && !history.some(h => h.id === previewData.id && h.type === previewData.type)) {
            setHistory(prev => [...prev, previewData]);
        } else if (!previewData) {
            setHistory([]);
        }
    }, [previewData, history]);

    const handleBreadcrumbClick = (index: number) => {
        const targetData = history[index];
        setHistory(prev => prev.slice(0, index + 1));
        onShowPreview(targetData);
    };
    
    const handleClose = () => {
        setHistory([]);
        onClose();
    };

    const currentData = history[history.length - 1];

    const getDisplayName = (data: PreviewData) => {
        let item: any = null;
        switch(data.type) {
            case 'asset': item = assets.find(i => i.id === data.id); return item?.name || `Aset ${data.id}`;
            case 'customer': item = customers.find(i => i.id === data.id); return item?.name || `Pelanggan ${data.id}`;
            case 'user': item = users.find(i => i.id === data.id || i.name === data.id); return item?.name || `Pengguna ${data.id}`;
            case 'request': return `Request ${data.id}`;
            case 'handover': return `Handover ${data.id}`;
            case 'dismantle': return `Dismantle ${data.id}`;
            case 'customerAssets': item = customers.find(i => i.id === data.id); return `Aset Milik ${item?.name || data.id}`;
            case 'stockItemAssets': {
                const [name, , status] = (data.id as string).split('|');
                return status === 'ALL' ? `Stok: ${name}` : `Aset ${status}: ${name}`;
            }
            default: return 'Detail';
        }
    };

    const renderContent = () => {
        if (!currentData) return null;

        switch (currentData.type) {
            case 'asset':
                const asset = assets.find(a => a.id === currentData.id);
                if (!asset) return <p className="text-gray-700">Aset tidak ditemukan.</p>;
                return (
                     <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                        <PreviewItem label="ID Aset" value={asset.id} fullWidth />
                        <PreviewItem label="Kategori" value={asset.category} />
                        <PreviewItem label="Brand" value={asset.brand} />
                        <PreviewItem label="Nomor Seri" value={<span className="font-mono">{asset.serialNumber}</span>} />
                        <PreviewItem label="Status" value={<span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getAssetStatusClass(asset.status)}`}>{asset.status}</span>} />
                        <PreviewItem label="Lokasi" value={asset.location} />
                        <PreviewItem label="Pengguna" value={asset.currentUser?.startsWith('TMI-') ? <ClickableLink onClick={() => onShowPreview({type: 'customer', id: asset.currentUser!})}>{asset.currentUser}</ClickableLink> : asset.currentUser} />
                    </dl>
                );
            
            case 'customer':
                const customer = customers.find(c => c.id === currentData.id);
                 if (!customer) return <p className="text-gray-700">Pelanggan tidak ditemukan.</p>;
                return (
                     <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                        <PreviewItem label="ID Pelanggan" value={customer.id} />
                        <PreviewItem label="Status" value={<span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getCustomerStatusClass(customer.status)}`}>{customer.status}</span>} />
                        <PreviewItem label="Telepon" value={customer.phone} />
                        <PreviewItem label="Email" value={customer.email} />
                        <PreviewItem label="Alamat" value={customer.address} fullWidth/>
                        <PreviewItem label="Aset Terpasang" fullWidth>
                           <ClickableLink onClick={() => onShowPreview({type: 'customerAssets', id: customer.id})}>Lihat {assets.filter(a => a.currentUser === customer.id).length} aset</ClickableLink>
                        </PreviewItem>
                    </dl>
                );
            
            case 'customerAssets':
                const customerForAssets = customers.find(c => c.id === currentData.id);
                if (!customerForAssets) return <p className="text-gray-700">Pelanggan tidak ditemukan.</p>;
                const customerAssets = assets.filter(a => a.currentUser === customerForAssets.id);
                return (
                    <div>
                        <h4 className="mb-4 pb-2 text-lg font-semibold text-gray-900 border-b">Aset untuk {customerForAssets.name}:</h4>
                        <ul className="space-y-2">
                            {customerAssets.length > 0 ? customerAssets.map(asset => (
                                <li key={asset.id} className="p-2 text-sm border rounded-md bg-gray-50">
                                   <ClickableLink onClick={() => onShowPreview({type: 'asset', id: asset.id})}>{asset.name} ({asset.id})</ClickableLink>
                                </li>
                            )) : <p className="text-sm text-gray-500">Tidak ada aset terpasang.</p>}
                        </ul>
                    </div>
                );

            case 'stockItemAssets': {
                const [name, brand, status] = (currentData.id as string).split('|');
                if (!name || !brand || !status) return <p className="text-gray-700">Data stok tidak valid.</p>;

                const stockAssets = assets.filter(a => 
                    a.name === name && 
                    a.brand === brand && 
                    (status === 'ALL' ? a.status !== AssetStatus.DECOMMISSIONED : a.status === status)
                );

                const title = status === 'ALL'
                    ? `Semua Aset untuk ${name} (${brand})`
                    : `Aset Status '${status}' untuk ${name} (${brand})`;

                return (
                    <div>
                        <h4 className="mb-4 pb-2 text-lg font-semibold text-gray-900 border-b">{title}</h4>
                        <ul className="space-y-2 max-h-[50vh] overflow-y-auto custom-scrollbar">
                            {stockAssets.length > 0 ? stockAssets.map(asset => (
                                <li key={asset.id} className="p-2 text-sm border rounded-md bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <ClickableLink onClick={() => onShowPreview({type: 'asset', id: asset.id})}>{asset.id}</ClickableLink>
                                            <div className="text-xs text-gray-500 font-mono">SN: {asset.serialNumber}</div>
                                        </div>
                                        <div className="text-xs">
                                            <span className={`px-2 py-0.5 font-semibold rounded-full ${getAssetStatusClass(asset.status)}`}>{asset.status}</span>
                                        </div>
                                    </div>
                                </li>
                            )) : <p className="text-sm text-center text-gray-500">Tidak ada aset yang cocok.</p>}
                        </ul>
                    </div>
                );
            }

            case 'user':
                 const user = users.find(u => u.id === currentData.id || u.name === currentData.id); // Allow lookup by name
                 if (!user) return <p className="text-gray-700">Pengguna tidak ditemukan.</p>;
                 const divisionName = user.divisionId ? divisions.find(d => d.id === user.divisionId)?.name : 'N/A';
                 return (
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                        <PreviewItem label="Email" value={user.email} />
                        <PreviewItem label="Role">
                            <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleClass(user.role)}`}>
                                {user.role}
                            </span>
                        </PreviewItem>
                        <PreviewItem label="Divisi" value={divisionName} />
                    </dl>
                 );

            case 'request':
                const request = requests.find(r => r.id === currentData.id);
                if (!request) return <p className="text-gray-700">Request tidak ditemukan.</p>;
                 return (
                    <div className="space-y-4">
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-3">
                            <PreviewItem label="Tanggal" value={request.requestDate} />
                            <PreviewItem label="Pemohon" value={request.requester} />
                            <PreviewItem label="Status" value={<span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getRequestStatusClass(request.status)}`}>{request.status}</span>} />
                        </dl>
                        <div>
                            <h4 className="text-sm font-semibold text-gray-600 uppercase border-b pb-2 mb-2">Item</h4>
                            <ul className="mt-2 space-y-2">
                               {request.items.map(item => (
                                   <li key={item.id} className="p-2 text-xs border rounded-md bg-gray-50">
                                       <div className="flex justify-between font-semibold"><span>{item.itemName}</span> <span>{item.quantity} unit</span></div>
                                   </li>
                               ))}
                            </ul>
                        </div>
                    </div>
                 );
            
            case 'handover':
                const handover = handovers.find(h => h.id === currentData.id);
                if (!handover) return <p className="text-gray-700">Handover tidak ditemukan.</p>;
                return (
                     <div className="space-y-4">
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                            <PreviewItem label="Tanggal" value={handover.handoverDate} />
                            <PreviewItem label="No. WO" value={handover.woRoIntNumber || '-'} />
                            <PreviewItem label="Menyerahkan" value={<ClickableLink onClick={() => onShowPreview({type: 'user', id: handover.menyerahkan})}>{handover.menyerahkan}</ClickableLink>} />
                            <PreviewItem label="Penerima" value={<ClickableLink onClick={() => onShowPreview({type: 'user', id: handover.penerima})}>{handover.penerima}</ClickableLink>} />
                        </dl>
                        <div>
                            <h4 className="text-sm font-semibold text-gray-600 uppercase border-b pb-2 mb-2">Item</h4>
                            <ul className="mt-2 space-y-2">
                               {handover.items.map(item => (
                                   <li key={item.id} className="p-2 text-xs border rounded-md bg-gray-50">
                                        <ClickableLink onClick={() => onShowPreview({type: 'asset', id: item.assetId!})}>{item.itemName} ({item.assetId})</ClickableLink>
                                   </li>
                               ))}
                            </ul>
                        </div>
                    </div>
                );

            case 'dismantle':
                const dismantle = dismantles.find(d => d.id === currentData.id);
                 if (!dismantle) return <p className="text-gray-700">Dismantle tidak ditemukan.</p>;
                return (
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                        <PreviewItem label="Tanggal" value={dismantle.dismantleDate} />
                        <PreviewItem label="Teknisi" value={<ClickableLink onClick={() => onShowPreview({type: 'user', id: dismantle.technician})}>{dismantle.technician}</ClickableLink>} />
                        <PreviewItem label="Pelanggan" value={<ClickableLink onClick={() => onShowPreview({type: 'customer', id: dismantle.customerId})}>{dismantle.customerName}</ClickableLink>} />
                        <PreviewItem label="Aset Ditarik" value={<ClickableLink onClick={() => onShowPreview({type: 'asset', id: dismantle.assetId})}>{dismantle.assetName}</ClickableLink>} />
                        <PreviewItem label="Kondisi" value={dismantle.retrievedCondition} />
                    </dl>
                );

            default:
                return <p className="text-gray-700">Tipe pratinjau tidak dikenal.</p>;
        }
    };
    
    const canEdit = currentData && ['asset', 'customer'].includes(currentData.type);

    return (
        <Modal
            isOpen={!!previewData}
            onClose={handleClose}
            title={history.length > 1 ? '' : (currentData ? getDisplayName(currentData) : 'Pratinjau')}
            size="xl"
            zIndex="z-[60]"
            footerContent={
                <div className="flex items-center justify-between w-full">
                    <div>
                        {history.length > 1 && (
                            <button
                                type="button"
                                onClick={() => handleBreadcrumbClick(history.length - 2)}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
                            >
                                <ChevronLeftIcon className="w-4 h-4" />
                                Kembali
                            </button>
                        )}
                    </div>
                    {canEdit && (
                         <button
                            type="button"
                            onClick={() => onEditItem(currentData)}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 bg-tm-primary rounded-lg shadow-sm hover:bg-tm-primary-hover"
                        >
                            <PencilIcon className="w-4 h-4" />
                            Edit
                        </button>
                    )}
                </div>
            }
        >
            {history.length > 1 && (
                <nav className="flex items-center text-sm font-medium text-gray-500 mb-4 -mt-2" aria-label="Breadcrumb">
                    {history.map((item, index) => (
                        <React.Fragment key={`${item.type}-${item.id}-${index}`}>
                            {index > 0 && <ChevronRightIcon className="w-4 h-4 mx-1 text-gray-400" />}
                            <button 
                                onClick={() => handleBreadcrumbClick(index)} 
                                className={`truncate max-w-[150px] ${index === history.length - 1 ? 'text-tm-primary font-semibold' : 'hover:underline'}`}
                                disabled={index === history.length - 1}
                            >
                                {getDisplayName(item)}
                            </button>
                        </React.Fragment>
                    ))}
                </nav>
            )}
            {renderContent()}
        </Modal>
    );
};