import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Dismantle, ItemStatus, Asset, AssetStatus, AssetCondition, Customer, User, ActivityLogEntry, PreviewData, Page, Attachment } from '../../../types';
import Modal from '../../../components/ui/Modal';
import { EyeIcon } from '../../../components/icons/EyeIcon';
import { TrashIcon } from '../../../components/icons/TrashIcon';
import { useNotification } from '../../../providers/NotificationProvider';
import { InboxIcon } from '../../../components/icons/InboxIcon';
import { useSortableData, SortConfig } from '../../../hooks/useSortableData';
import { SortAscIcon } from '../../../components/icons/SortAscIcon';
import { SortDescIcon } from '../../../components/icons/SortDescIcon';
import { SortIcon } from '../../../components/icons/SortIcon';
import { exportToCSV } from '../../../utils/csvExporter';
import { ExportIcon } from '../../../components/icons/ExportIcon';
import { useLongPress } from '../../../hooks/useLongPress';
import { Checkbox } from '../../../components/ui/Checkbox';
import { SpinnerIcon } from '../../../components/icons/SpinnerIcon';
import { SearchIcon } from '../../../components/icons/SearchIcon';
import { CloseIcon } from '../../../components/icons/CloseIcon';
import { PaginationControls } from '../../../components/ui/PaginationControls';
import DatePicker from '../../../components/ui/DatePicker';
import { SignatureStamp } from '../../../components/ui/SignatureStamp';
import { ApprovalStamp } from '../../../components/ui/ApprovalStamp';
import FloatingActionBar from '../../../components/ui/FloatingActionBar';
import { ExclamationTriangleIcon } from '../../../components/icons/ExclamationTriangleIcon';
import { ClickableLink } from '../../../components/ui/ClickableLink';
import { CustomSelect } from '../../../components/ui/CustomSelect';
import { FilterIcon } from '../../../components/icons/FilterIcon';
import { CheckIcon } from '../../../components/icons/CheckIcon';
import { DismantleIcon } from '../../../components/icons/DismantleIcon';
import { Letterhead } from '../../../components/ui/Letterhead';
import { AssetIcon } from '../../../components/icons/AssetIcon';
import { CustomerIcon } from '../../../components/icons/CustomerIcon';
import { DownloadIcon } from '../../../components/icons/DownloadIcon';
import { PaperclipIcon } from '../../../components/icons/PaperclipIcon';


interface DismantleFormPageProps {
    currentUser: User;
    dismantles: Dismantle[];
    setDismantles: React.Dispatch<React.SetStateAction<Dismantle[]>>;
    assets: Asset[];
    customers: Customer[];
    users: User[];
    prefillData?: Asset | null;
    onClearPrefill: () => void;
    onUpdateAsset: (assetId: string, updates: Partial<Asset>, logEntry?: Omit<ActivityLogEntry, 'id' | 'timestamp'>) => void;
    onShowPreview: (data: PreviewData) => void;
    setActivePage: (page: Page, initialState?: any) => void;
}

const getStatusClass = (status: ItemStatus) => {
    switch (status) {
        case ItemStatus.COMPLETED: return 'bg-success-light text-success-text';
        case ItemStatus.IN_PROGRESS: return 'bg-info-light text-info-text';
        case ItemStatus.PENDING: return 'bg-warning-light text-warning-text';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const SortableHeader: React.FC<{
    children: React.ReactNode;
    columnKey: keyof Dismantle;
    sortConfig: SortConfig<Dismantle> | null;
    requestSort: (key: keyof Dismantle) => void;
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

interface DismantleTableProps {
    dismantles: Dismantle[];
    onDetailClick: (dismantle: Dismantle) => void;
    onDeleteClick: (id: string) => void;
    sortConfig: SortConfig<Dismantle> | null;
    requestSort: (key: keyof Dismantle) => void;
    selectedDismantleIds: string[];
    onSelectOne: (id: string) => void;
    onSelectAll: (event: React.ChangeEvent<HTMLInputElement>) => void;
    isBulkSelectMode: boolean;
    onEnterBulkMode: () => void;
}

const DismantleTable: React.FC<DismantleTableProps> = ({ dismantles, onDetailClick, onDeleteClick, sortConfig, requestSort, selectedDismantleIds, onSelectOne, onSelectAll, isBulkSelectMode, onEnterBulkMode }) => {
    const longPressHandlers = useLongPress(onEnterBulkMode, 500);

    const handleRowClick = (d: Dismantle) => {
        if (isBulkSelectMode) {
            onSelectOne(d.id);
        } else {
            onDetailClick(d);
        }
    };
    
    return (
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="sticky top-0 z-10 bg-gray-50">
                <tr>
                    {isBulkSelectMode && (
                        <th scope="col" className="px-6 py-3">
                            <Checkbox
                                checked={selectedDismantleIds.length === dismantles.length && dismantles.length > 0}
                                onChange={onSelectAll}
                                aria-label="Pilih semua data dismantle"
                            />
                        </th>
                    )}
                    <SortableHeader columnKey="id" sortConfig={sortConfig} requestSort={requestSort}>ID / Tanggal</SortableHeader>
                    <th scope="col" className="px-6 py-3 text-sm font-semibold tracking-wider text-left text-gray-500">Aset & Pelanggan</th>
                    <SortableHeader columnKey="technician" sortConfig={sortConfig} requestSort={requestSort}>Teknisi</SortableHeader>
                    <SortableHeader columnKey="status" sortConfig={sortConfig} requestSort={requestSort}>Status</SortableHeader>
                    <th className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {dismantles.length > 0 ? (
                    dismantles.map((d) => (
                        <tr 
                            key={d.id}
                            {...longPressHandlers}
                            onClick={() => handleRowClick(d)}
                            className={`transition-colors cursor-pointer ${selectedDismantleIds.includes(d.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                        >
                            {isBulkSelectMode && (
                                <td className="px-6 py-4 align-top" onClick={(e) => e.stopPropagation()}>
                                    <Checkbox
                                        checked={selectedDismantleIds.includes(d.id)}
                                        onChange={() => onSelectOne(d.id)}
                                        aria-labelledby={`dismantle-id-${d.id}`}
                                    />
                                </td>
                            )}
                            <td id={`dismantle-id-${d.id}`} className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-semibold text-gray-900">{d.id}</div>
                                <div className="text-xs text-gray-500">{d.dismantleDate}</div>
                            </td>
                             <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{d.assetName}</div>
                                <div className="text-xs text-gray-500">dari {d.customerName}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">{d.technician}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(d.status)}`}>
                                    {d.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                                 <div className="flex items-center justify-end space-x-2">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onDetailClick(d); }}
                                        className="flex items-center justify-center w-8 h-8 text-gray-500 transition-colors bg-gray-100 rounded-full hover:bg-info-light hover:text-info-text" title="Lihat Detail"
                                    >
                                      <EyeIcon className="w-5 h-5"/>
                                    </button>
                                     <button onClick={(e) => { e.stopPropagation(); onDeleteClick(d.id); }} className="flex items-center justify-center w-8 h-8 text-gray-500 transition-colors bg-gray-100 rounded-full hover:bg-danger-light hover:text-danger-text" title="Hapus">
                                      <TrashIcon className="w-5 h-5"/>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={isBulkSelectMode ? 6 : 5} className="px-6 py-12 text-center text-gray-500">
                            <div className="flex flex-col items-center">
                                <InboxIcon className="w-12 h-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak Ada Data Dismantle</h3>
                                <p className="mt-1 text-sm text-gray-500">Ubah filter atau mulai proses dismantle baru.</p>
                            </div>
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    );
};

const DismantleForm: React.FC<{
    currentUser: User;
    onSave: (data: Omit<Dismantle, 'id' | 'status'>) => void;
    customers: Customer[];
    users: User[];
    prefillData?: Asset | null;
    setActivePage: (page: Page, initialState?: any) => void;
}> = ({ currentUser, onSave, customers, users, prefillData, setActivePage }) => {
    const [dismantleDate, setDismantleDate] = useState<Date | null>(new Date());
    const [technician, setTechnician] = useState('');
    const [retrievedCondition, setRetrievedCondition] = useState<AssetCondition>(AssetCondition.USED_OKAY);
    const [notes, setNotes] = useState<string>('');
    const [acknowledgerName, setAcknowledgerName] = useState('');
    const [attachments, setAttachments] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFooterVisible, setIsFooterVisible] = useState(true);
    const footerRef = useRef<HTMLDivElement>(null);
    const formId = "dismantle-form";
    const addNotification = useNotification();

    const prefilledAsset = prefillData;
    const prefilledCustomer = prefilledAsset ? customers.find(c => c.id === prefilledAsset.currentUser) : null;
    
    useEffect(() => {
        setTechnician(currentUser.name);
    }, [currentUser]);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => setIsFooterVisible(entry.isIntersecting), { threshold: 0.1 });
        const currentRef = footerRef.current;
        if (currentRef) observer.observe(currentRef);
        return () => { if (currentRef) observer.unobserve(currentRef); };
    }, []);

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
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setAttachments(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
            e.dataTransfer.clearData();
        }
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!prefilledAsset || !prefilledCustomer) {
            addNotification('Aset atau pelanggan tidak valid.', 'error');
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
                assetId: prefilledAsset.id,
                assetName: prefilledAsset.name,
                dismantleDate: dismantleDate!.toISOString().split('T')[0],
                technician,
                customerName: prefilledCustomer.name,
                customerId: prefilledCustomer.id,
                customerAddress: prefilledCustomer.address,
                retrievedCondition,
                notes: notes.trim() || null,
                acknowledger: acknowledgerName.trim() || null,
                attachments: processedAttachments,
            });
            setIsSubmitting(false);
        }, 1000);
    };

     const ActionButtons: React.FC<{ formId?: string }> = ({ formId }) => (
        <button 
            type="submit" 
            form={formId}
            disabled={isSubmitting || !prefilledAsset}
            className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 rounded-lg shadow-sm bg-tm-primary hover:bg-tm-primary-hover disabled:bg-tm-primary/70 disabled:cursor-not-allowed">
             {isSubmitting ? <SpinnerIcon className="w-5 h-5 mr-2" /> : null}
            {isSubmitting ? 'Memproses...' : 'Proses Dismantle'}
        </button>
    );

    return (
        <>
            <form id={formId} onSubmit={handleSubmit} className="space-y-6">
                <div className="mb-6 space-y-2 text-center">
                    <h4 className="text-xl font-bold text-tm-dark">TRINITY MEDIA INDONESIA</h4>
                    <p className="font-semibold text-tm-secondary">BERITA ACARA PENARIKAN ASET (DISMANTLE)</p>
                </div>

                <div className="p-4 bg-gray-50 border rounded-lg">
                    <h3 className="text-base font-semibold text-gray-800">Detail Aset & Pelanggan</h3>
                    {!prefilledAsset ? (
                        <div className="text-center p-4">
                            <p className="text-sm text-red-600">Aset tidak dipilih.</p>
                            <button
                                type="button"
                                onClick={() => setActivePage('registration')}
                                className="mt-2 inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white transition-all duration-200 rounded-lg shadow-sm bg-tm-primary hover:bg-tm-primary-hover"
                            >
                                Kembali ke daftar aset untuk memulai
                            </button>
                        </div>
                    ) : !prefilledCustomer ? (
                        <p className="text-sm text-center text-red-600">Pelanggan untuk aset ini tidak ditemukan.</p>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 mt-4 text-sm md:grid-cols-2">
                            <div><span className="font-semibold text-gray-500">Aset:</span><span className="pl-2 font-medium text-gray-900">{prefilledAsset.name} ({prefilledAsset.id})</span></div>
                            <div><span className="font-semibold text-gray-500">Pelanggan:</span><span className="pl-2 font-medium text-gray-900">{prefilledCustomer.name} ({prefilledCustomer.id})</span></div>
                            <div className="md:col-span-2"><span className="font-semibold text-gray-500">Alamat:</span><span className="pl-2 text-gray-900">{prefilledCustomer.address}</span></div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-b border-gray-200">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tanggal Penarikan</label>
                            <DatePicker id="dismantleDate" selectedDate={dismantleDate} onDateChange={setDismantleDate} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Teknisi</label>
                            <CustomSelect options={users.map(u => ({ value: u.name, label: u.name }))} value={technician} onChange={setTechnician} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Kondisi Aset Saat Ditarik</label>
                            <CustomSelect options={Object.values(AssetCondition).map(c => ({ value: c, label: c }))} value={retrievedCondition} onChange={v => setRetrievedCondition(v as AssetCondition)} />
                        </div>
                        <div className="md:col-span-3">
                            <label className="block text-sm font-medium text-gray-700">Catatan Penarikan</label>
                            <textarea id="dismantleNotes" value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="block w-full px-3 py-2 mt-1 text-gray-900 placeholder:text-gray-400 bg-gray-50 border border-gray-300 rounded-lg shadow-sm sm:text-sm" placeholder="Contoh: Unit ditarik karena pelanggan upgrade, kondisi fisik baik..."></textarea>
                        </div>
                         <div className="md:col-span-3">
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
                    <div className="grid grid-cols-1 text-center gap-y-8 md:grid-cols-2 md:gap-x-8">
                        <div>
                            <p className="font-medium text-gray-700">Teknisi</p>
                            <div className="flex items-center justify-center mt-2 h-28">
                                {technician && <SignatureStamp signerName={technician} signatureDate={dismantleDate?.toISOString() || ''} />}
                            </div>
                            <p className="pt-1 mt-2 text-sm text-gray-600">( {technician || 'Nama Jelas'} )</p>
                        </div>
                        <div>
                            <label htmlFor="acknowledgerName" className="font-medium text-gray-700">Mengetahui (Pihak Pelanggan)</label>
                             <div className="flex items-center justify-center mt-2 h-28">
                                <span className="text-sm italic text-gray-400">Tanda Tangan Pelanggan</span>
                             </div>
                            <div className="mt-2 pt-1">
                                <input id="acknowledgerName" type="text" value={acknowledgerName} onChange={e => setAcknowledgerName(e.target.value)} placeholder="( Nama Jelas )" className="w-full p-1 text-sm text-center bg-transparent border-0 focus:ring-0" />
                            </div>
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

const DismantleFormPage: React.FC<DismantleFormPageProps> = (props) => {
    const { currentUser, dismantles, setDismantles, assets, customers, users, prefillData, onClearPrefill, onUpdateAsset, onShowPreview, setActivePage } = props;
    const addNotification = useNotification();
    
    const [view, setView] = useState<'list' | 'form'>('list');
    const [selectedDismantle, setSelectedDismantle] = useState<Dismantle | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [dismantleToDeleteId, setDismantleToDeleteId] = useState<string | null>(null);
    const [bulkDeleteConfirmation, setBulkDeleteConfirmation] = useState(false);
    const [isBulkSelectMode, setIsBulkSelectMode] = useState(false);
    const [selectedDismantleIds, setSelectedDismantleIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    
    const initialFilterState = { status: '', technician: '', startDate: null, endDate: null };
    const [filters, setFilters] = useState<{ status: string; technician: string; startDate: Date | null; endDate: Date | null; }>(initialFilterState);
    const [tempFilters, setTempFilters] = useState(filters);
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const filterPanelRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        if (prefillData) setView('form');
    }, [prefillData]);

    const handleSetView = (newView: 'list' | 'form') => {
        if (newView === 'list' && prefillData) onClearPrefill();
        setView(newView);
    };

    const handleCreateDismantle = (data: Omit<Dismantle, 'id' | 'status'>) => {
        const newDismantle: Dismantle = {
            ...data,
            id: `DSM-${String(dismantles.length + 1).padStart(3, '0')}`,
            status: ItemStatus.IN_PROGRESS,
        };
        setDismantles(prev => [newDismantle, ...prev]);

        addNotification('Berita acara dismantle berhasil dibuat dan menunggu penyelesaian.', 'success');
        handleSetView('list');
    };

    const handleCompleteDismantle = () => {
        if (!selectedDismantle) return;
        setIsLoading(true);

        setTimeout(() => {
            const updatedDismantle: Dismantle = { ...selectedDismantle, status: ItemStatus.COMPLETED, acknowledger: currentUser.name };
            
            setDismantles(prev => prev.map(d => d.id === updatedDismantle.id ? updatedDismantle : d));

            onUpdateAsset(selectedDismantle.assetId, {
                status: AssetStatus.IN_STORAGE,
                condition: selectedDismantle.retrievedCondition,
                currentUser: null,
                location: 'Gudang Inventori',
                isDismantled: true,
                dismantleInfo: {
                    customerId: selectedDismantle.customerId,
                    customerName: selectedDismantle.customerName,
                    dismantleDate: selectedDismantle.dismantleDate,
                    dismantleId: selectedDismantle.id,
                }
            }, {
                user: currentUser.name, // The user who acknowledges it
                action: 'Dismantle Selesai',
                details: `Aset dari pelanggan ${selectedDismantle.customerName} telah diterima di gudang.`,
                referenceId: selectedDismantle.id,
            });
            
            addNotification('Dismantle telah diselesaikan dan aset kembali ke stok.', 'success');
            setIsLoading(false);
            setIsDetailModalOpen(false);
            setSelectedDismantle(null);
        }, 1000);
    }

    const handleShowDetails = (dismantle: Dismantle) => {
        setSelectedDismantle(dismantle);
        setIsDetailModalOpen(true);
    };
    
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (filterPanelRef.current && !filterPanelRef.current.contains(event.target as Node)) {
                setIsFilterPanelOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => { document.removeEventListener("mousedown", handleClickOutside); };
    }, [filterPanelRef]);

    const activeFilterCount = useMemo(() => {
        return Object.values(filters).filter(Boolean).length;
    }, [filters]);

    const handleResetFilters = () => {
        setFilters(initialFilterState);
        setTempFilters(initialFilterState);
        setIsFilterPanelOpen(false);
    };

    const handleApplyFilters = () => {
        setFilters(tempFilters);
        setIsFilterPanelOpen(false);
    };

    const filteredDismantles = useMemo(() => {
        let tempDismantles = dismantles;

        if (currentUser.role === 'Staff') {
            tempDismantles = tempDismantles.filter(d => d.technician === currentUser.name);
        }

        return tempDismantles
            .filter(d => {
                const searchLower = searchQuery.toLowerCase();
                return (
                    d.id.toLowerCase().includes(searchLower) ||
                    d.assetName.toLowerCase().includes(searchLower) ||
                    d.customerName.toLowerCase().includes(searchLower) ||
                    d.technician.toLowerCase().includes(searchLower)
                );
            })
            .filter(d => filters.status ? d.status === filters.status : true)
            .filter(d => filters.technician ? d.technician === filters.technician : true)
            .filter(d => {
                if (!filters.startDate || !filters.endDate) return true;
                const dismantleDate = new Date(d.dismantleDate);
                return dismantleDate >= filters.startDate && dismantleDate <= filters.endDate;
            });
    }, [dismantles, searchQuery, filters, currentUser]);

    const { items: sortedDismantles, requestSort, sortConfig } = useSortableData(filteredDismantles, { key: 'dismantleDate', direction: 'descending' });
    
    const totalItems = sortedDismantles.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedDismantles = sortedDismantles.slice(startIndex, endIndex);

    useEffect(() => { setCurrentPage(1); }, [searchQuery, filters, itemsPerPage]);

    const handleConfirmDelete = () => {
        if (!dismantleToDeleteId) return;
        setIsLoading(true);
        setTimeout(() => {
            setDismantles(prev => prev.filter(d => d.id !== dismantleToDeleteId));
            addNotification(`Dismantle ${dismantleToDeleteId} berhasil dihapus.`, 'success');
            setDismantleToDeleteId(null);
            setIsLoading(false);
        }, 1000);
    };

    const { deletableDismantlesCount, skippableDismantlesCount } = useMemo(() => {
        if (!bulkDeleteConfirmation) return { deletableDismantlesCount: 0, skippableDismantlesCount: 0 };
        
        const selected = dismantles.filter(d => selectedDismantleIds.includes(d.id));
        const skippable = selected.filter(d => d.status === ItemStatus.IN_PROGRESS);
        
        return {
            deletableDismantlesCount: selected.length - skippable.length,
            skippableDismantlesCount: skippable.length,
        };
    }, [bulkDeleteConfirmation, selectedDismantleIds, dismantles]);

    const handleBulkDelete = () => {
        const deletableIds = selectedDismantleIds.filter(id => {
            const d = dismantles.find(dismantle => dismantle.id === id);
            return d && d.status !== ItemStatus.IN_PROGRESS;
        });

        if (deletableIds.length === 0) {
            addNotification('Tidak ada data yang dapat dihapus (semua sedang dalam proses).', 'error');
            setBulkDeleteConfirmation(false);
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            setDismantles(prev => prev.filter(d => !deletableIds.includes(d.id)));
            
            let message = `${deletableIds.length} data dismantle berhasil dihapus.`;
            if (skippableDismantlesCount > 0) {
                message += ` ${skippableDismantlesCount} data dilewati karena berstatus "Dalam Proses".`;
            }
            addNotification(message, 'success');
            
            setBulkDeleteConfirmation(false);
            handleCancelBulkMode();
            setIsLoading(false);
        }, 1000);
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedDismantleIds(paginatedDismantles.map(d => d.id));
        } else {
            setSelectedDismantleIds([]);
        }
    };
    
    const handleSelectOne = (id: string) => {
        setSelectedDismantleIds(prev => prev.includes(id) ? prev.filter(currentId => currentId !== id) : [...prev, id]);
    };
    
    const handleCancelBulkMode = () => {
        setIsBulkSelectMode(false);
        setSelectedDismantleIds([]);
    };

    const statusOptions = Object.values(ItemStatus).filter(s => [ItemStatus.COMPLETED, ItemStatus.IN_PROGRESS, ItemStatus.PENDING].includes(s)).map(s => ({ value: s, label: s }));
    const technicianOptions = [...new Set(dismantles.map(d => d.technician))].map(t => ({ value: t, label: t }));


    const renderContent = () => {
        if (view === 'form') {
            return (
                <div className="p-4 sm:p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl font-bold text-tm-dark">Buat Berita Acara Dismantle</h1>
                        <button onClick={() => handleSetView('list')} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">
                            Kembali ke Daftar
                        </button>
                    </div>
                    <div className="p-4 sm:p-6 bg-white border border-gray-200/80 rounded-xl shadow-md pb-24">
                        <DismantleForm 
                            currentUser={currentUser}
                            onSave={handleCreateDismantle}
                            customers={customers}
                            users={users}
                            prefillData={prefillData}
                            setActivePage={setActivePage}
                        />
                    </div>
                </div>
            );
        }

        return (
            <div className="p-4 sm:p-6 md:p-8">
                <div className="flex flex-col items-start justify-between gap-4 mb-6 md:flex-row md:items-center">
                    <h1 className="text-3xl font-bold text-tm-dark">Daftar Dismantle Aset</h1>
                     <button
                        onClick={() => exportToCSV(sortedDismantles, `dismantle_aset_${new Date().toISOString().split('T')[0]}.csv`)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 transition-all duration-200 bg-white border rounded-lg shadow-sm hover:bg-gray-50"
                    >
                        <ExportIcon className="w-4 h-4"/>
                        Export CSV
                    </button>
                </div>

                 <div className="p-4 mb-4 bg-white border border-gray-200/80 rounded-xl shadow-md">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative flex-grow">
                             <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <SearchIcon className="w-5 h-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Cari ID, Aset, Pelanggan..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full h-10 py-2 pl-10 pr-10 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-tm-accent focus:border-tm-accent"
                            />
                            {searchQuery && (
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        className="p-1 text-gray-400 rounded-full hover:bg-gray-200 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-tm-accent"
                                        aria-label="Hapus pencarian"
                                    >
                                        <CloseIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="relative" ref={filterPanelRef}>
                            <button
                                onClick={() => {
                                    setTempFilters(filters);
                                    setIsFilterPanelOpen(p => !p);
                                }}
                                className="inline-flex items-center justify-center gap-2 w-full h-10 px-4 text-sm font-semibold text-gray-700 transition-all duration-200 bg-white border border-gray-300 rounded-lg shadow-sm sm:w-auto hover:bg-gray-50"
                            >
                                <FilterIcon className="w-4 h-4" />
                                <span>Filter</span>
                                {activeFilterCount > 0 && (
                                    <span className="px-2 py-0.5 text-xs font-bold text-white rounded-full bg-tm-primary">{activeFilterCount}</span>
                                )}
                            </button>
                            {isFilterPanelOpen && (
                                <>
                                    <div onClick={() => setIsFilterPanelOpen(false)} className="fixed inset-0 z-20 bg-black/25 sm:hidden" />
                                    <div className="fixed top-32 inset-x-4 z-30 origin-top rounded-xl border border-gray-200 bg-white shadow-lg sm:absolute sm:top-full sm:inset-x-auto sm:right-0 sm:mt-2 sm:w-80">
                                        <div className="flex items-center justify-between p-4 border-b">
                                            <h3 className="text-lg font-semibold text-gray-800">Filter Dismantle</h3>
                                            <button onClick={() => setIsFilterPanelOpen(false)} className="p-1 text-gray-400 rounded-full hover:bg-gray-100"><CloseIcon className="w-5 h-5"/></button>
                                        </div>
                                        <div className="p-4 space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                                                <CustomSelect options={[{value: '', label: 'Semua Status'}, ...statusOptions]} value={tempFilters.status} onChange={v => setTempFilters(f => ({...f, status: v}))} />
                                            </div>
                                             <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Teknisi</label>
                                                <CustomSelect options={[{value: '', label: 'Semua Teknisi'}, ...technicianOptions]} value={tempFilters.technician} onChange={v => setTempFilters(f => ({...f, technician: v}))} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Rentang Tanggal</label>
                                                <div className="flex items-center gap-2">
                                                    <DatePicker id="startDate" selectedDate={tempFilters.startDate} onDateChange={d => setTempFilters(f => ({...f, startDate: d}))}/>
                                                    <span>-</span>
                                                    <DatePicker id="endDate" selectedDate={tempFilters.endDate} onDateChange={d => setTempFilters(f => ({...f, endDate: d}))}/>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-gray-50 border-t">
                                            <button onClick={handleResetFilters} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Reset</button>
                                            <button onClick={handleApplyFilters} className="px-4 py-2 text-sm font-semibold text-white bg-tm-primary rounded-lg shadow-sm hover:bg-tm-primary-hover">Terapkan</button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {isBulkSelectMode && (
                    <div className="p-4 mb-4 bg-blue-50 border-l-4 border-tm-accent rounded-r-lg">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-tm-primary">{selectedDismantleIds.length} item terpilih</span>
                                <div className="h-5 border-l border-gray-300"></div>
                                <button onClick={() => setBulkDeleteConfirmation(true)} className="px-3 py-1.5 text-sm font-semibold text-red-600 bg-red-100 rounded-md hover:bg-red-200">
                                    Hapus
                                </button>
                            </div>
                            <button onClick={handleCancelBulkMode} className="px-3 py-1.5 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
                                Batal
                            </button>
                        </div>
                    </div>
                )}

                <div className="overflow-hidden bg-white border border-gray-200/80 rounded-xl shadow-md">
                    <div className="overflow-x-auto custom-scrollbar">
                        <DismantleTable dismantles={paginatedDismantles} onDetailClick={handleShowDetails} onDeleteClick={setDismantleToDeleteId} sortConfig={sortConfig} requestSort={requestSort} selectedDismantleIds={selectedDismantleIds} onSelectAll={handleSelectAll} onSelectOne={handleSelectOne} isBulkSelectMode={isBulkSelectMode} onEnterBulkMode={() => setIsBulkSelectMode(true)} />
                    </div>
                    <PaginationControls currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} onItemsPerPageChange={size => { setItemsPerPage(size); setCurrentPage(1);}} startIndex={startIndex} endIndex={endIndex} />
                </div>
            </div>
        );
    };

    return (
        <>
            {renderContent()}
            {selectedDismantle && (
                <Modal 
                    isOpen={isDetailModalOpen} 
                    onClose={() => setIsDetailModalOpen(false)} 
                    title="" 
                    size="3xl"
                    disableContentPadding
                    footerContent={
                        selectedDismantle.status === ItemStatus.IN_PROGRESS && (currentUser.role === 'Admin Logistik' || currentUser.role === 'Super Admin') ? (
                            <button onClick={handleCompleteDismantle} disabled={isLoading} className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-success rounded-lg shadow-sm hover:bg-green-700 disabled:bg-green-400">
                                {isLoading ? <SpinnerIcon className="w-4 h-4" /> : <CheckIcon className="w-4 h-4" />}
                                {isLoading ? 'Memproses...' : 'Acknowledge & Complete'}
                            </button>
                        ) : null
                    }
                >
                      <div className="p-6">
                        <Letterhead />
                        <div className="text-center mb-6">
                            <h3 className="text-xl font-bold uppercase text-tm-dark">Berita Acara Penarikan Aset</h3>
                            <p className="text-sm text-tm-secondary">Nomor: {selectedDismantle.id}</p>
                        </div>
                        
                        <div className="space-y-6 text-sm">
                           <section>
                                <h4 className="font-semibold text-gray-800 border-b pb-1 mb-2">I. Informasi Umum</h4>
                                <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-3">
                                    <div><dt className="text-gray-500">Tanggal Penarikan</dt><dd className="font-medium text-gray-900">{selectedDismantle.dismantleDate}</dd></div>
                                    <div><dt className="text-gray-500">Nomor Dokumen</dt><dd className="font-medium text-gray-900">{selectedDismantle.id}</dd></div>
                                    <div><dt className="text-gray-500">Teknisi</dt><dd className="font-medium text-gray-900"><ClickableLink onClick={() => onShowPreview({type: 'user', id: selectedDismantle.technician})}>{selectedDismantle.technician}</ClickableLink></dd></div>
                                </dl>
                            </section>

                           <section>
                                <h4 className="font-semibold text-gray-800 border-b pb-1 mb-4">II. Detail Objek Penarikan</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Asset Card */}
                                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                        <div className="flex items-center gap-2 mb-3">
                                            <AssetIcon className="w-5 h-5 text-gray-500" />
                                            <h5 className="font-semibold text-gray-700">Aset yang Ditarik</h5>
                                        </div>
                                        <dl className="space-y-2">
                                            <div>
                                                <dt className="text-xs text-gray-500">Nama Aset</dt>
                                                <dd className="font-medium text-gray-900">
                                                    <ClickableLink onClick={() => onShowPreview({type: 'asset', id: selectedDismantle.assetId})}>
                                                        {selectedDismantle.assetName}
                                                    </ClickableLink>
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-xs text-gray-500">ID Aset</dt>
                                                <dd className="font-mono text-gray-700">{selectedDismantle.assetId}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-xs text-gray-500">Kondisi Saat Ditarik</dt>
                                                <dd className="font-medium text-gray-900">{selectedDismantle.retrievedCondition}</dd>
                                            </div>
                                        </dl>
                                    </div>
                                    {/* Customer Card */}
                                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                        <div className="flex items-center gap-2 mb-3">
                                            <CustomerIcon className="w-5 h-5 text-gray-500" />
                                            <h5 className="font-semibold text-gray-700">Ditarik Dari Pelanggan</h5>
                                        </div>
                                        <dl className="space-y-2">
                                            <div>
                                                <dt className="text-xs text-gray-500">Nama Pelanggan</dt>
                                                <dd className="font-medium text-gray-900">
                                                    <ClickableLink onClick={() => onShowPreview({type: 'customer', id: selectedDismantle.customerId})}>
                                                        {selectedDismantle.customerName}
                                                    </ClickableLink>
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-xs text-gray-500">ID Pelanggan</dt>
                                                <dd className="font-mono text-gray-700">{selectedDismantle.customerId}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-xs text-gray-500">Alamat</dt>
                                                <dd className="text-gray-700">{selectedDismantle.customerAddress}</dd>
                                            </div>
                                        </dl>
                                    </div>
                                </div>
                                {selectedDismantle.notes && (
                                    <div className="mt-4">
                                        <h5 className="text-sm font-semibold text-gray-700">Catatan Teknisi:</h5>
                                        <p className="text-sm italic text-gray-800 p-3 bg-gray-50 rounded-md mt-1 border">"{selectedDismantle.notes}"</p>
                                    </div>
                                )}
                            </section>

                            {selectedDismantle.attachments && selectedDismantle.attachments.length > 0 && (
                                <section>
                                    <h4 className="font-semibold text-gray-800 border-b pb-1 mb-4">III. Lampiran</h4>
                                    <div className="space-y-3">
                                        {selectedDismantle.attachments.map(att => (
                                            <div key={att.id} className="flex items-center justify-between p-3 text-sm bg-gray-50 border rounded-lg">
                                                <div>
                                                    <p className="font-semibold text-gray-800">{att.name}</p>
                                                    <p className="text-xs text-gray-500">{att.type === 'image' ? 'Gambar' : att.type === 'pdf' ? 'Dokumen PDF' : 'Lainnya'}</p>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <a href={att.url} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-500 rounded-full hover:bg-gray-200" title="Lihat"><EyeIcon className="w-4 h-4" /></a>
                                                    <a href={att.url} download={att.name} className="p-2 text-gray-500 rounded-full hover:bg-gray-200" title="Unduh"><DownloadIcon className="w-4 h-4" /></a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                            
                            <section className="pt-6">
                                <h4 className="font-semibold text-gray-800 border-b pb-1 mb-6">{selectedDismantle.attachments && selectedDismantle.attachments.length > 0 ? 'IV.' : 'III.'} Status & Persetujuan</h4>
                                <p className="text-xs text-center text-gray-500 mb-6">Demikian Berita Acara ini dibuat untuk dipergunakan sebagaimana mestinya.</p>
                                <div className="grid grid-cols-1 text-sm text-center gap-y-6 sm:grid-cols-2">
                                    <div>
                                        <p className="font-semibold text-gray-600">Teknisi Lapangan,</p>
                                        <div className="flex items-center justify-center mt-2 h-28"><SignatureStamp signerName={selectedDismantle.technician} signatureDate={selectedDismantle.dismantleDate} signerDivision="Divisi Engineer" /></div>
                                        <div className="pt-1 mt-2"><p className="text-gray-800">({selectedDismantle.technician})</p></div>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-600">Diterima oleh Gudang,</p>
                                        <div className="flex items-center justify-center mt-2 h-28">
                                            {selectedDismantle.status === ItemStatus.COMPLETED && selectedDismantle.acknowledger ? (
                                                <ApprovalStamp approverName={selectedDismantle.acknowledger} approvalDate={new Date().toISOString()} approverDivision='Divisi Inventori' />
                                            ) : (
                                                <span className="italic text-gray-400">Menunggu Konfirmasi</span>
                                            )}
                                        </div>
                                        <div className="pt-1 mt-2"><p className="text-gray-500">({selectedDismantle.acknowledger || '_________________________'})</p></div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </Modal>
            )}

            {dismantleToDeleteId && (
                <Modal isOpen={!!dismantleToDeleteId} onClose={() => setDismantleToDeleteId(null)} title="Konfirmasi Hapus" hideDefaultCloseButton>
                    <div className="text-center">
                        <ExclamationTriangleIcon className="w-12 h-12 mx-auto text-red-500" />
                        <h3 className="mt-4 text-lg font-semibold text-gray-800">Hapus Data Dismantle?</h3>
                        <p className="mt-2 text-sm text-gray-600">Anda yakin ingin menghapus data dismantle <strong>{dismantleToDeleteId}</strong>? Tindakan ini tidak dapat diurungkan.</p>
                    </div>
                    <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                        <button onClick={() => setDismantleToDeleteId(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Batal</button>
                        <button onClick={handleConfirmDelete} disabled={isLoading} className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-danger rounded-lg shadow-sm hover:bg-red-700">
                            {isLoading && <SpinnerIcon className="w-4 h-4 mr-2"/>} Hapus
                        </button>
                    </div>
                </Modal>
            )}

             {bulkDeleteConfirmation && (
                <Modal
                    isOpen={bulkDeleteConfirmation}
                    onClose={() => setBulkDeleteConfirmation(false)}
                    title="Konfirmasi Hapus Massal"
                    size="md"
                    hideDefaultCloseButton
                >
                     <div className="text-center">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto text-red-600 bg-red-100 rounded-full">
                            <ExclamationTriangleIcon className="w-8 h-8" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-gray-800">Hapus {deletableDismantlesCount} Data Dismantle?</h3>
                        <p className="mt-2 text-sm text-gray-600">
                            Anda akan menghapus data dismantle yang dipilih. Aksi ini tidak dapat diurungkan.
                        </p>
                        <div className="w-full p-3 mt-4 text-sm text-left bg-gray-50 border rounded-lg">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Dipilih:</span>
                                <span className="font-semibold text-gray-800">{selectedDismantleIds.length}</span>
                            </div>
                            <div className="flex justify-between mt-1 text-green-700">
                                <span className="font-medium">Akan Dihapus:</span>
                                <span className="font-bold">{deletableDismantlesCount}</span>
                            </div>
                            <div className="flex justify-between mt-1 text-amber-700">
                                <span className="font-medium">Dilewati (status "Dalam Proses"):</span>
                                <span className="font-bold">{skippableDismantlesCount}</span>
                            </div>
                        </div>

                        {deletableDismantlesCount === 0 && skippableDismantlesCount > 0 && (
                            <p className="mt-4 text-sm font-semibold text-red-700">
                                Tidak ada data yang dapat dihapus. Semua yang dipilih sedang dalam proses.
                            </p>
                        )}
                    </div>
                     <div className="flex items-center justify-end pt-5 mt-5 space-x-3 border-t">
                        <button onClick={() => setBulkDeleteConfirmation(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Batal</button>
                        <button onClick={handleBulkDelete} disabled={isLoading || deletableDismantlesCount === 0} className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-danger rounded-lg shadow-sm hover:bg-red-400">
                           {isLoading && <SpinnerIcon className="w-4 h-4 mr-2"/>} Hapus ({deletableDismantlesCount})
                        </button>
                    </div>
                </Modal>
            )}
        </>
    );
};

export default DismantleFormPage;