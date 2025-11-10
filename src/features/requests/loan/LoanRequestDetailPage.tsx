import React, { useRef, useState, useMemo } from 'react';
// FIX: Remove HandoverIcon from types import, as it is a component, not a type.
import { LoanRequest, User, Asset, Division, PreviewData, LoanRequestStatus, AssetStatus, AssetCategory, ParsedScanResult } from '../../../types';
import { DetailPageLayout } from '../../../components/layout/DetailPageLayout';
import { Letterhead } from '../../../components/ui/Letterhead';
import { SignatureStamp } from '../../../components/ui/SignatureStamp';
import { ApprovalStamp } from '../../../components/ui/ApprovalStamp';
import { RejectionStamp } from '../../../components/ui/RejectionStamp';
import { ClickableLink } from '../../../components/ui/ClickableLink';
import { InfoIcon } from '../../../components/icons/InfoIcon';
import { SpinnerIcon } from '../../../components/icons/SpinnerIcon';
import { CheckIcon } from '../../../components/icons/CheckIcon';
import { CloseIcon } from '../../../components/icons/CloseIcon';
// FIX: Import HandoverIcon from its component file.
import { HandoverIcon } from '../../../components/icons/HandoverIcon';
import { ChevronsLeftIcon } from '../../../components/icons/ChevronsLeftIcon';
import { ChevronsRightIcon } from '../../../components/icons/ChevronsRightIcon';
import { PrintIcon } from '../../../components/icons/PrintIcon';
import { DownloadIcon } from '../../../components/icons/DownloadIcon';
import { useNotification } from '../../../providers/NotificationProvider';
import { CustomSelect } from '../../../components/ui/CustomSelect';
import { DismantleIcon } from '../../../components/icons/DismantleIcon';
import { QrCodeIcon } from '../../../components/icons/QrCodeIcon';

interface LoanRequestDetailPageProps {
    loanRequest: LoanRequest;
    currentUser: User;
    assets: Asset[];
    users: User[];
    divisions: Division[];
    assetCategories: AssetCategory[];
    onBackToList: () => void;
    onShowPreview: (data: PreviewData) => void;
    onAssignAndApprove: (request: LoanRequest, assignedAssetIds: Record<number, string[]>) => void;
    onReject: (request: LoanRequest) => void;
    onConfirmReturn: (request: LoanRequest) => void;
    onInitiateReturn: (request: LoanRequest) => void;
    onInitiateHandoverFromLoan: (loanRequest: LoanRequest) => void;
    isLoading: boolean;
    setIsGlobalScannerOpen: (isOpen: boolean) => void;
    setScanContext: (context: 'global' | 'form') => void;
    setFormScanCallback: (callback: ((data: ParsedScanResult) => void) | null) => void;
}

const ActionButton: React.FC<{ onClick?: () => void, text: string, icon?: React.FC<{className?:string}>, color: 'primary'|'success'|'danger'|'info'|'secondary', disabled?: boolean }> = ({ onClick, text, icon: Icon, color, disabled }) => {
    const colors = {
        primary: "bg-tm-primary hover:bg-tm-primary-hover text-white",
        success: "bg-success hover:bg-green-700 text-white",
        danger: "bg-danger hover:bg-red-700 text-white",
        info: "bg-info hover:bg-blue-700 text-white",
        secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
    };
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg shadow-sm transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed ${colors[color]}`}
        >
            {disabled && <SpinnerIcon className="w-4 h-4" />}
            {Icon && <Icon className="w-4 h-4" />}
            {text}
        </button>
    );
};

const LoanStatusIndicator: React.FC<{ status: LoanRequestStatus }> = ({ status }) => {
    const statusDetails: Record<string, { label: string, className: string }> = {
        [LoanRequestStatus.PENDING]: { label: 'Menunggu Persetujuan', className: 'bg-warning-light text-warning-text' },
        [LoanRequestStatus.APPROVED]: { label: 'Disetujui', className: 'bg-sky-100 text-sky-700' },
        [LoanRequestStatus.ON_LOAN]: { label: 'Dipinjam', className: 'bg-info-light text-info-text' },
        [LoanRequestStatus.RETURNED]: { label: 'Dikembalikan', className: 'bg-success-light text-success-text' },
        [LoanRequestStatus.REJECTED]: { label: 'Ditolak', className: 'bg-danger-light text-danger-text' },
        [LoanRequestStatus.OVERDUE]: { label: 'Terlambat', className: 'bg-red-200 text-red-800' },
        [LoanRequestStatus.AWAITING_RETURN]: { label: 'Menunggu Pengembalian', className: 'bg-blue-100 text-blue-800' },
    };
    const details = statusDetails[status] || { label: status, className: 'bg-gray-100 text-gray-800' };

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${details.className}`}>
            {details.label}
        </span>
    );
};

const ActionSidebar: React.FC<LoanRequestDetailPageProps & { isExpanded: boolean; onToggleVisibility: () => void; canSubmitAssignment: boolean; onConfirmAssignment: () => void; }> = 
({ loanRequest, currentUser, isLoading, onReject, onConfirmReturn, onInitiateReturn, onInitiateHandoverFromLoan, isExpanded, onToggleVisibility, canSubmitAssignment, onConfirmAssignment }) => {
    
    if (!isExpanded) {
        return (
            <div className="flex flex-col items-center pt-4 space-y-4">
                <button onClick={onToggleVisibility} className="flex items-center justify-center w-10 h-10 bg-white border border-gray-300 rounded-full shadow-md text-gray-500 hover:bg-gray-100 hover:text-tm-primary transition-all">
                    <ChevronsRightIcon className="w-5 h-5" />
                </button>
            </div>
        );
    }

    const isAdmin = currentUser.role === 'Admin Logistik' || currentUser.role === 'Super Admin';
    const isRequester = currentUser.name === loanRequest.requester;
    let actions: React.ReactNode = null;

    switch (loanRequest.status) {
        case LoanRequestStatus.PENDING:
            if (isAdmin) {
                actions = (
                    <div className="space-y-2">
                        <ActionButton onClick={onConfirmAssignment} disabled={isLoading || !canSubmitAssignment} text="Setujui & Tetapkan Aset" icon={CheckIcon} color="success" />
                        <ActionButton onClick={() => onReject(loanRequest)} disabled={isLoading} text="Tolak Peminjaman" icon={CloseIcon} color="danger" />
                    </div>
                );
            }
            break;
        case LoanRequestStatus.APPROVED:
            if (isAdmin) {
                actions = <ActionButton onClick={() => onInitiateHandoverFromLoan(loanRequest)} disabled={isLoading} text="Buat Dokumen Handover" icon={HandoverIcon} color="primary" />;
            }
            break;
        case LoanRequestStatus.ON_LOAN:
        case LoanRequestStatus.OVERDUE:
            if (isAdmin) {
                actions = <ActionButton onClick={() => onConfirmReturn(loanRequest)} disabled={isLoading} text="Konfirmasi Pengembalian" icon={CheckIcon} color="primary" />;
            } else if (isRequester) {
                actions = <ActionButton onClick={() => onInitiateReturn(loanRequest)} disabled={isLoading} text="Kembalikan Aset" icon={DismantleIcon} color="primary" />;
            }
            break;
        case LoanRequestStatus.AWAITING_RETURN:
            if (isAdmin) {
                actions = <ActionButton onClick={() => onConfirmReturn(loanRequest)} disabled={isLoading} text="Konfirmasi Pengembalian" icon={CheckIcon} color="primary" />;
            } else if (isRequester) {
                 actions = (
                    <div className="text-center p-4 bg-blue-50/70 border border-blue-200/60 rounded-lg">
                        <SpinnerIcon className="w-10 h-10 mx-auto mb-3 text-blue-500 animate-spin" />
                        <p className="text-sm font-semibold text-gray-800">Menunggu Konfirmasi</p>
                        <p className="text-xs text-gray-500 mt-1">Admin Logistik akan segera mengkonfirmasi penerimaan aset.</p>
                    </div>
                );
            }
            break;
        default:
            actions = (
                <div className="text-center p-4 bg-gray-50/70 border border-gray-200/60 rounded-lg">
                    <CheckIcon className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                    <p className="text-sm font-semibold text-gray-800">Proses Selesai</p>
                    <p className="text-xs text-gray-500 mt-1">Tidak ada aksi lebih lanjut untuk permintaan ini.</p>
                </div>
            );
    }

    return (
        <div className="p-5 bg-white border border-gray-200/80 rounded-xl shadow-sm">
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2"><InfoIcon className="w-5 h-5 text-gray-400" /><h3 className="text-base font-semibold text-gray-800">Status & Aksi</h3></div>
                    <div className="mt-2"><LoanStatusIndicator status={loanRequest.status} /></div>
                </div>
                <button onClick={onToggleVisibility} className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-gray-400 rounded-full hover:bg-gray-100 hover:text-gray-800"><ChevronsLeftIcon className="w-5 h-5" /></button>
            </div>
            <div className="mt-4 pt-4 border-t">{actions}</div>
        </div>
    );
};

const LoanRequestDetailPage: React.FC<LoanRequestDetailPageProps> = (props) => {
    const { loanRequest, currentUser, assets, users, divisions, assetCategories, onShowPreview, onAssignAndApprove, setIsGlobalScannerOpen, setScanContext, setFormScanCallback } = props;
    const [isActionSidebarExpanded, setIsActionSidebarExpanded] = useState(true);
    const [assignedAssetIds, setAssignedAssetIds] = useState<Record<number, string[]>>(loanRequest.assignedAssetIds || {});
    const printRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const addNotification = useNotification();
    
    const isAdmin = currentUser.role === 'Admin Logistik' || currentUser.role === 'Super Admin';
    const showAssignmentPanel = isAdmin && loanRequest.status === LoanRequestStatus.PENDING;

    const availableAssetsForLoan = useMemo(() => assets.filter(a => a.status === AssetStatus.IN_STORAGE), [assets]);

    const handleAssignmentChange = (itemId: number, index: number, assetId: string) => {
        setAssignedAssetIds(prev => {
            const newAssignments = { ...prev };
            if (!newAssignments[itemId]) {
                newAssignments[itemId] = [];
            }
            newAssignments[itemId][index] = assetId;
            return newAssignments;
        });
    };

    const handleStartScan = (itemId: number, index: number) => {
        setScanContext('form');
        setFormScanCallback(() => (data: ParsedScanResult) => {
            let assetIdToSet: string | undefined = undefined;
            let foundAsset: Asset | undefined;

            if (data.id) {
                foundAsset = availableAssetsForLoan.find(a => a.id === data.id);
            } else if (data.serialNumber) {
                foundAsset = availableAssetsForLoan.find(a => a.serialNumber === data.serialNumber);
            }
            
            if (foundAsset) {
                assetIdToSet = foundAsset.id;
            }
            
            if (assetIdToSet) {
                const allCurrentlyAssignedIds = Object.values(assignedAssetIds).flat();
                if (allCurrentlyAssignedIds.includes(assetIdToSet)) {
                    addNotification('Aset ini sudah ditetapkan di slot lain.', 'error');
                } else {
                    handleAssignmentChange(itemId, index, assetIdToSet);
                    addNotification(`Aset ${assetIdToSet} berhasil dipindai dan ditetapkan.`, 'success');
                }
            } else {
                addNotification('Aset tidak ditemukan atau tidak tersedia di gudang.', 'error');
            }
        });
        setIsGlobalScannerOpen(true);
    };
    
    const canSubmitAssignment = useMemo(() => {
        return loanRequest.items.every(item => 
            assignedAssetIds[item.id] &&
            assignedAssetIds[item.id].length === item.quantity &&
            assignedAssetIds[item.id].every(assetId => assetId)
        );
    }, [loanRequest.items, assignedAssetIds]);
    
    const handleConfirmAssignment = () => {
        if (canSubmitAssignment) {
            onAssignAndApprove(loanRequest, assignedAssetIds);
        } else {
            addNotification('Harap tetapkan aset untuk semua item yang diminta.', 'error');
        }
    };


    const getDivisionForUser = (userName: string): string => {
        const user = users.find(u => u.name === userName);
        if (!user || !user.divisionId) return '';
        const division = divisions.find(d => d.id === user.divisionId);
        return division ? `Divisi ${division.name}` : '';
    };

    const handlePrint = () => { window.print(); };

    const handleDownloadPdf = () => {
        if (!printRef.current) return;
        setIsDownloading(true);
        const { jsPDF } = (window as any).jspdf;
        const html2canvas = (window as any).html2canvas;

        html2canvas(printRef.current, { scale: 2, useCORS: true, logging: false, })
            .then((canvas: HTMLCanvasElement) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;
                const canvasRatio = canvasWidth / canvasHeight;
                const imgHeight = pdfWidth / canvasRatio;
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
                pdf.save(`LoanRequest-${loanRequest.id}.pdf`);
                setIsDownloading(false);
                addNotification('PDF berhasil diunduh.', 'success');
            }).catch(() => {
                addNotification('Gagal membuat PDF.', 'error');
                setIsDownloading(false);
            });
    };

    return (
        <DetailPageLayout
            title={`Detail Pinjam: ${loanRequest.id}`}
            onBack={props.onBackToList}
            headerActions={
                 <div className="flex items-center gap-2">
                    <button onClick={handlePrint} className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border rounded-lg shadow-sm hover:bg-gray-50"><PrintIcon className="w-4 h-4"/> Cetak</button>
                    <button onClick={handleDownloadPdf} disabled={isDownloading} className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-tm-primary rounded-lg shadow-sm hover:bg-tm-primary-hover disabled:bg-tm-primary/70">{isDownloading ? <SpinnerIcon className="w-4 h-4"/> : <DownloadIcon className="w-4 h-4" />}{isDownloading ? 'Mengunduh...' : 'Unduh PDF'}</button>
                </div>
            }
            mainColClassName={isActionSidebarExpanded ? 'lg:col-span-8' : 'lg:col-span-11'}
            asideColClassName={isActionSidebarExpanded ? 'lg:col-span-4' : 'lg:col-span-1'}
            aside={<ActionSidebar {...props} isExpanded={isActionSidebarExpanded} onToggleVisibility={() => setIsActionSidebarExpanded(p => !p)} canSubmitAssignment={canSubmitAssignment} onConfirmAssignment={handleConfirmAssignment} />}
        >
            <div ref={printRef} className="p-8 bg-white border border-gray-200/80 rounded-xl shadow-sm space-y-8">
                <Letterhead />
                <div className="text-center">
                    <h3 className="text-xl font-bold uppercase text-tm-dark">Surat Permintaan Peminjaman Aset</h3>
                    <p className="text-sm text-tm-secondary">Nomor: ${loanRequest.id}</p>
                </div>

                <section><dl className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2 text-sm">
                    <div><label className="block font-medium text-gray-500">Tanggal</label><p className="font-semibold text-gray-800">{new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(loanRequest.requestDate))}</p></div>
                    <div><label className="block font-medium text-gray-500">Nama Pemohon</label><p className="font-semibold text-gray-800">{loanRequest.requester}</p></div>
                    <div><label className="block font-medium text-gray-500">Divisi</label><p className="font-semibold text-gray-800">{loanRequest.division}</p></div>
                    <div><label className="block font-medium text-gray-500">No Dokumen</label><p className="font-semibold text-gray-800">{loanRequest.id}</p></div>
                </dl></section>
                
                <section>
                    <h4 className="font-semibold text-gray-800 border-b pb-1 mb-2">Detail Aset yang Diminta</h4>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-100 text-xs uppercase text-gray-700">
                                <tr>
                                    <th className="p-2 w-10">No.</th>
                                    <th className="p-2">Nama Barang</th>
                                    <th className="p-2 text-center">Jumlah</th>
                                    <th className="p-2">Tgl Kembali</th>
                                    <th className="p-2">Catatan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loanRequest.items.map((item, index) => {
                                    const category = assetCategories.find(c => c.types.some(t => t.standardItems?.some(si => si.name === item.itemName && si.brand === item.brand)));
                                    const type = category?.types.find(t => t.standardItems?.some(si => si.name === item.itemName && si.brand === item.brand));
                                    const unitOfMeasure = type?.unitOfMeasure || 'unit';
                                    
                                    return (
                                        <tr key={item.id} className="border-b">
                                            <td className="p-2 text-center text-gray-800">{index + 1}.</td>
                                            <td className="p-2 font-semibold text-gray-800">{item.itemName} - {item.brand}</td>
                                            <td className="p-2 text-center font-medium text-gray-800">{item.quantity} {unitOfMeasure}</td>
                                            <td className="p-2 text-gray-600">
                                                {item.returnDate 
                                                    ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(item.returnDate)) 
                                                    : <span className="italic text-gray-500">Belum ditentukan</span>}
                                            </td>
                                            <td className="p-2 text-gray-600 text-xs italic">"{item.keterangan || '-'}"</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>
                
                {showAssignmentPanel ? (
                    <section className="p-4 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50/50 no-print">
                        <h4 className="font-bold text-tm-primary mb-4">Panel Penetapan Aset</h4>
                        <div className="space-y-4">
                            {loanRequest.items.map(item => {
                                const matchingAssets = availableAssetsForLoan.filter(a => a.name === item.itemName && a.brand === item.brand);
                                const allCurrentlyAssignedIds = Object.values(assignedAssetIds).flat();

                                return (
                                <div key={item.id} className="p-3 bg-white border rounded-md">
                                    <p className="font-semibold text-gray-800">{item.itemName} - {item.brand}</p>
                                    <p className="text-xs text-gray-500">Dibutuhkan: {item.quantity} unit</p>
                                    <div className="mt-2 space-y-2">
                                        {Array.from({ length: item.quantity }).map((_, i) => {
                                            const currentAssetForThisSlot = assignedAssetIds[item.id]?.[i];
                                            const availableOptions = matchingAssets
                                                .filter(asset => !allCurrentlyAssignedIds.includes(asset.id) || asset.id === currentAssetForThisSlot)
                                                .map(a => ({ value: a.id, label: a.serialNumber ? `${a.id} (SN: ${a.serialNumber})` : `${a.id} (Unit Satuan)` }));
                                            
                                            return (
                                                <div key={i} className="flex items-center gap-2">
                                                    <span className="text-xs font-medium text-gray-600">Unit {i + 1}:</span>
                                                    <div className="flex-1">
                                                        <CustomSelect 
                                                            isSearchable={true}
                                                            options={availableOptions} 
                                                            value={currentAssetForThisSlot || ''} 
                                                            onChange={val => handleAssignmentChange(item.id, i, val)} 
                                                            placeholder="Ketik untuk cari ID/SN aset..."
                                                        />
                                                    </div>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => handleStartScan(item.id, i)}
                                                        className="p-2 text-gray-500 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 hover:text-tm-primary"
                                                        title="Pindai Aset"
                                                    >
                                                        <QrCodeIcon className="w-5 h-5"/>
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )})}
                        </div>
                    </section>
                ) : loanRequest.assignedAssetIds && (
                    <section>
                        <h4 className="font-semibold text-gray-800 border-b pb-1 mb-2">Aset yang Dipinjamkan</h4>
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-100 text-xs uppercase text-gray-700">
                                    <tr>
                                        <th className="p-2 w-10">No.</th>
                                        <th className="p-2">Nama Aset</th>
                                        <th className="p-2">ID Aset</th>
                                        <th className="p-2">Serial Number</th>
                                        <th className="p-2">MAC Address</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.values(loanRequest.assignedAssetIds || {}).flat().map((assetId, index) => {
                                        const asset = assets.find(a => a.id === assetId);
                                        if (!asset) return null;

                                        const category = assetCategories.find(c => c.name === asset.category);
                                        const type = category?.types.find(t => t.name === asset.type);
                                        const isBulk = type?.trackingMethod === 'bulk';

                                        return (
                                            <tr key={assetId} className="border-b">
                                                <td className="p-2 text-center text-gray-800">{index + 1}.</td>
                                                <td className="p-2 font-semibold text-gray-800">
                                                    <ClickableLink onClick={() => onShowPreview({ type: 'asset', id: assetId })}>
                                                        {asset.name}
                                                    </ClickableLink>
                                                </td>
                                                <td className="p-2 text-gray-600 font-mono">{assetId}</td>
                                                <td className="p-2 text-gray-600 font-mono">
                                                    {isBulk ? '-' : (asset.serialNumber || <i className="text-gray-400">Unit Satuan</i>)}
                                                </td>
                                                <td className="p-2 text-gray-600 font-mono">
                                                    {isBulk ? '-' : (asset.macAddress || '-')}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {loanRequest.notes && (<section><h4 className="font-semibold text-gray-800 border-b pb-1 mb-2">Alasan Peminjaman</h4><p className="text-sm text-gray-700 italic p-3 bg-gray-50 border rounded-md">"{loanRequest.notes}"</p></section>)}
                
                <section className="pt-8"><h4 className="font-semibold text-gray-800 border-b pb-1 mb-6">Persetujuan</h4><div className="grid grid-cols-1 text-sm text-center gap-y-6 sm:grid-cols-2">
                    <div><p className="font-semibold text-gray-600">Pemohon,</p><div className="flex items-center justify-center mt-2 h-28"><SignatureStamp signerName={loanRequest.requester} signatureDate={loanRequest.requestDate} signerDivision={getDivisionForUser(loanRequest.requester)} /></div><p className="pt-1 mt-2 border-t border-gray-400">({loanRequest.requester})</p></div>
                    <div><p className="font-semibold text-gray-600">Mengetahui (Admin Logistik),</p><div className="flex items-center justify-center mt-2 h-28">
                        {loanRequest.status === LoanRequestStatus.REJECTED && loanRequest.approver && <RejectionStamp rejectorName={loanRequest.approver} rejectionDate={loanRequest.approvalDate!} />}
                        {loanRequest.status !== LoanRequestStatus.PENDING && loanRequest.status !== LoanRequestStatus.REJECTED && loanRequest.approver && <ApprovalStamp approverName={loanRequest.approver} approvalDate={loanRequest.approvalDate!} />}
                        {loanRequest.status === LoanRequestStatus.PENDING && <span className="italic text-gray-400">Menunggu Persetujuan</span>}
                    </div><p className="pt-1 mt-2 border-t border-gray-400">({loanRequest.approver || '.........................'})</p></div>
                </div></section>
            </div>
        </DetailPageLayout>
    );
};

export default LoanRequestDetailPage;