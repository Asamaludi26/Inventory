import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Asset, Customer, User, AssetCondition, Attachment, Page, AssetStatus, Dismantle } from '../../../types';
import DatePicker from '../../../components/ui/DatePicker';
import { useNotification } from '../../../providers/NotificationProvider';
import FloatingActionBar from '../../../components/ui/FloatingActionBar';
import { Letterhead } from '../../../components/ui/Letterhead';
import { SignatureStamp } from '../../../components/ui/SignatureStamp';
import { CustomSelect } from '../../../components/ui/CustomSelect';
import { PaperclipIcon } from '../../../components/icons/PaperclipIcon';
import { TrashIcon } from '../../../components/icons/TrashIcon';
import { SpinnerIcon } from '../../../components/icons/SpinnerIcon';
import { generateDocumentNumber } from '../../../utils/documentNumberGenerator';

interface DismantleFormProps {
    currentUser: User;
    dismantles: Dismantle[];
    onSave: (data: Omit<Dismantle, 'id' | 'status'>) => void;
    onCancel: () => void;
    customers: Customer[];
    users: User[];
    assets: Asset[];
    prefillData?: Asset | null;
    setActivePage: (page: Page, initialState?: any) => void;
}

const DismantleForm: React.FC<DismantleFormProps> = ({ currentUser, dismantles, onSave, onCancel, customers, users, assets, prefillData }) => {
    // --- STATE MANAGEMENT ---
    const [dismantleDate, setDismantleDate] = useState<Date | null>(new Date());
    const [docNumber, setDocNumber] = useState('');
    const [requestNumber, setRequestNumber] = useState('');
    const [technician, setTechnician] = useState('');
    const [retrievedCondition, setRetrievedCondition] = useState<AssetCondition>(AssetCondition.USED_OKAY);
    const [notes, setNotes] = useState<string>('');
    const [acknowledgerName, setAcknowledgerName] = useState('');
    const [attachments, setAttachments] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFooterVisible, setIsFooterVisible] = useState(true);
    const footerRef = useRef<HTMLDivElement>(null);
    const formId = "dismantle-form";
    const addNotification = useNotification();

    // --- DERIVED STATE & OPTIONS ---
    const selectedAsset = useMemo(() => assets.find(a => a.id === selectedAssetId) || null, [assets, selectedAssetId]);
    const selectedCustomer = useMemo(() => selectedAsset ? customers.find(c => c.id === selectedAsset.currentUser) : null, [customers, selectedAsset]);

    const technicianOptions = useMemo(() => 
        users.filter(u => u.divisionId === 3).map(u => ({ value: u.name, label: u.name })), 
    [users]);
    
    const availableAssetsForDismantle = useMemo(() => 
        assets.filter(asset => asset.status === AssetStatus.IN_USE && asset.currentUser && asset.currentUser.startsWith('TMI-')),
    [assets]);
    
    const assetOptions = useMemo(() => availableAssetsForDismantle.map(asset => {
        const customer = customers.find(c => c.id === asset.currentUser);
        return {
            value: asset.id,
            label: `${asset.name} (${asset.id}) - Pelanggan: ${customer?.name || 'N/A'}`
        }
    }), [availableAssetsForDismantle, customers]);

    // --- EFFECTS ---
     useEffect(() => {
        setTechnician(currentUser.name);
        if (prefillData) {
            setSelectedAssetId(prefillData.id);
        }
    }, [currentUser, prefillData]);

    useEffect(() => {
        if (!dismantleDate) {
            setDocNumber('[Otomatis]');
            return;
        }
        const newDocNumber = generateDocumentNumber('DSM', dismantles, dismantleDate);
        setDocNumber(newDocNumber);
    }, [dismantleDate, dismantles]);

    useEffect(() => {
        setRequestNumber(selectedAsset?.poNumber || '');
    }, [selectedAsset]);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => setIsFooterVisible(entry.isIntersecting), { threshold: 0.1 });
        const currentRef = footerRef.current;
        if (currentRef) observer.observe(currentRef);
        return () => { if (currentRef) observer.unobserve(currentRef); };
    }, []);
    
    useEffect(() => {
        if (selectedAssetId && !prefillData && !availableAssetsForDismantle.some(a => a.id === selectedAssetId)) {
            addNotification('Aset yang dipilih tidak lagi valid untuk dismantle.', 'warning');
            setSelectedAssetId(null);
        }
    }, [selectedAssetId, availableAssetsForDismantle, prefillData, addNotification]);

    // --- EVENT HANDLERS ---
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setAttachments(prev => [...prev, ...Array.from(event.target.files!)]);
        }
    };

    const removeAttachment = (fileName: string) => {
        setAttachments(prev => prev.filter(file => file.name !== fileName));
    };
    
    const handleDragEvents = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') setIsDragging(true);
        else if (e.type === 'dragleave') setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files?.length > 0) {
            setAttachments(prev => [...prev, ...Array.from(e.dataTransfer.files!)]);
            e.dataTransfer.clearData();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAsset || !selectedCustomer) {
            addNotification('Aset atau pelanggan tidak valid. Harap pilih aset yang akan ditarik.', 'error');
            return;
        }
        setIsSubmitting(true);
        setTimeout(() => {
            const processedAttachments: Attachment[] = attachments.map((file, index) => ({
                id: Date.now() + index,
                name: file.name,
                url: URL.createObjectURL(file), 
                type: file.type.startsWith('image/') ? 'image' : (file.type === 'application/pdf' ? 'pdf' : 'other'),
            }));

            onSave({
                docNumber,
                requestNumber: requestNumber || undefined,
                assetId: selectedAsset.id,
                assetName: selectedAsset.name,
                dismantleDate: dismantleDate!.toISOString().split('T')[0],
                technician,
                customerName: selectedCustomer.name,
                customerId: selectedCustomer.id,
                customerAddress: selectedCustomer.address,
                retrievedCondition,
                notes: notes.trim() || null,
                acknowledger: acknowledgerName.trim() || null,
                attachments: processedAttachments,
            });
            setIsSubmitting(false);
        }, 1000);
    };

    // --- SUB-COMPONENTS ---
     const ActionButtons: React.FC<{ formId?: string }> = ({ formId }) => (
        <>
            <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">
                Batal
            </button>
            <button 
                type="submit" 
                form={formId}
                disabled={isSubmitting || !selectedAsset}
                className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 rounded-lg shadow-sm bg-tm-primary hover:bg-tm-primary-hover disabled:bg-tm-primary/70 disabled:cursor-not-allowed">
                {isSubmitting ? <SpinnerIcon className="w-5 h-5 mr-2" /> : null}
                {isSubmitting ? 'Memproses...' : 'Buat Berita Acara'}
            </button>
        </>
    );

    return (
        <>
            <form id={formId} onSubmit={handleSubmit} className="space-y-6">
                <Letterhead />
                <div className="text-center">
                    <h3 className="text-xl font-bold uppercase text-tm-dark">Berita Acara Penarikan Aset</h3>
                </div>

                <div className="p-4 border-t border-b border-gray-200">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tanggal Penarikan</label>
                            <DatePicker id="dismantleDate" selectedDate={dismantleDate} onDateChange={setDismantleDate} />
                        </div>
                        <div>
                            <label htmlFor="docNumber" className="block text-sm font-medium text-gray-700">No. Dokumen</label>
                            <input type="text" id="docNumber" readOnly value={docNumber} className="block w-full px-3 py-2 mt-1 text-gray-700 bg-gray-100 border border-gray-200 rounded-lg shadow-sm sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="requestNumber" className="block text-sm font-medium text-gray-700">No. Request Terkait</label>
                            <input type="text" id="requestNumber" readOnly value={requestNumber || 'N/A'} className="block w-full px-3 py-2 mt-1 text-gray-700 bg-gray-100 border border-gray-200 rounded-lg shadow-sm sm:text-sm" />
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 border rounded-lg">
                    <h3 className="text-base font-semibold text-gray-800">Detail Aset & Pelanggan</h3>
                    {!prefillData ? (
                         <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Pilih Aset yang Akan Ditarik</label>
                            <CustomSelect
                                options={assetOptions}
                                value={selectedAssetId || ''}
                                onChange={setSelectedAssetId}
                                placeholder="-- Cari aset berdasarkan nama, ID, atau pelanggan --"
                                isSearchable
                            />
                        </div>
                    ) : null}

                    {selectedAsset && selectedCustomer ? (
                        <div className="grid grid-cols-1 gap-4 mt-4 text-sm md:grid-cols-2">
                            <div><span className="font-semibold text-gray-500">Aset:</span><span className="pl-2 font-medium text-gray-900">{selectedAsset.name} ({selectedAsset.id})</span></div>
                            <div><span className="font-semibold text-gray-500">Pelanggan:</span><span className="pl-2 font-medium text-gray-900">{selectedCustomer.name} ({selectedCustomer.id})</span></div>
                            <div className="md:col-span-2"><span className="font-semibold text-gray-500">Alamat:</span><span className="pl-2 text-gray-900">{selectedCustomer.address}</span></div>
                        </div>
                    ) : prefillData ? (
                         <p className="mt-2 text-sm text-center text-red-600">Pelanggan untuk aset ini tidak ditemukan.</p>
                    ) : null}
                </div>

                <div className="p-4 border-t border-b border-gray-200">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Teknisi</label>
                            <CustomSelect options={technicianOptions} value={technician} onChange={setTechnician} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Kondisi Aset Saat Ditarik</label>
                            <CustomSelect options={Object.values(AssetCondition).map(c => ({ value: c, label: c }))} value={retrievedCondition} onChange={v => setRetrievedCondition(v as AssetCondition)} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Catatan Penarikan</label>
                            <textarea id="dismantleNotes" value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="block w-full px-3 py-2 mt-1 text-gray-900 placeholder:text-gray-400 bg-gray-50 border border-gray-300 rounded-lg shadow-sm sm:text-sm" placeholder="Contoh: Unit ditarik karena pelanggan upgrade, kondisi fisik baik..."></textarea>
                        </div>
                         <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Lampiran (Foto Kondisi, dll)</label>
                            <div 
                                onDragEnter={handleDragEvents} 
                                onDragOver={handleDragEvents} 
                                onDragLeave={handleDragEvents} 
                                onDrop={handleDrop}
                                className={`flex items-center justify-center w-full px-6 pt-5 pb-6 mt-1 border-2 border-dashed rounded-md transition-colors
                                    ${isDragging ? 'border-tm-primary bg-blue-50' : 'border-gray-300'}`
                                }
                            >
                                <div className="space-y-1 text-center">
                                <PaperclipIcon className="w-10 h-10 mx-auto text-gray-400" />
                                    <div className="flex text-sm text-gray-600">
                                        <label htmlFor="file-upload" className="relative font-medium bg-transparent rounded-md cursor-pointer text-tm-primary hover:text-tm-accent focus-within:outline-none">
                                            <span>Pilih file</span>
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={handleFileChange} />
                                        </label>
                                        <p className="pl-1">atau tarik dan lepas</p>
                                    </div>
                                    <p className="text-xs text-gray-500">PNG, JPG, PDF hingga 10MB</p>
                                </div>
                            </div>
                            {attachments.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    {attachments.map(file => (
                                        <div key={file.name} className="flex items-center justify-between p-2 text-sm text-gray-700 bg-gray-100 border border-gray-200 rounded-md">
                                            <span className="truncate">{file.name}</span>
                                            <button type="button" onClick={() => removeAttachment(file.name)} className="text-red-500 hover:text-red-700">
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="pt-8 mt-6 border-t border-gray-200">
                    <div className="flex justify-center">
                        <div>
                            <p className="font-medium text-center text-gray-700">Teknisi</p>
                            <div className="flex items-center justify-center mt-2 h-28">
                                {technician && <SignatureStamp signerName={technician} signatureDate={dismantleDate?.toISOString() || ''} />}
                            </div>
                            <p className="pt-1 mt-2 text-sm text-center text-gray-600">( {technician || 'Nama Jelas'} )</p>
                        </div>
                    </div>
                </div>

                <div ref={footerRef} className="flex justify-end pt-4 mt-4 border-t border-gray-200">
                    <ActionButtons />
                </div>
            </form>
            <FloatingActionBar isVisible={!isFooterVisible}>
                <ActionButtons formId={formId} />
            </FloatingActionBar>
        </>
    );
};

export default DismantleForm;