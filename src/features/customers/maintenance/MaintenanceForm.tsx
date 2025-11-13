import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Customer, Asset, User, Maintenance, ItemStatus, AssetCondition } from '../../../types';
import DatePicker from '../../../components/ui/DatePicker';
import { CustomSelect } from '../../../components/ui/CustomSelect';
import { SpinnerIcon } from '../../../components/icons/SpinnerIcon';
import { Letterhead } from '../../../components/ui/Letterhead';
import { SignatureStamp } from '../../../components/ui/SignatureStamp';
import { PaperclipIcon } from '../../../components/icons/PaperclipIcon';
import { TrashIcon } from '../../../components/icons/TrashIcon';
import { InfoIcon } from '../../../components/icons/InfoIcon';
import { Checkbox } from '../../../components/ui/Checkbox';
import { generateDocumentNumber } from '../../../utils/documentNumberGenerator';
import { CloseIcon } from '../../../components/icons/CloseIcon';

interface MaintenanceFormProps {
    currentUser: User;
    customers: Customer[];
    assets: Asset[];
    users: User[];
    maintenances: Maintenance[];
    onSave: (data: Omit<Maintenance, 'id' | 'status' | 'docNumber'>) => void;
    onCancel: () => void;
    isLoading: boolean;
    prefillCustomerId?: string;
    prefillAssetId?: string;
}

const allWorkTypes = ['Ganti Perangkat', 'Splicing FO', 'Tarik Ulang Kabel', 'Ganti Konektor', 'Backup Sementara', 'Lainnya'];

const MaintenanceForm: React.FC<MaintenanceFormProps> = ({ currentUser, customers, assets, users, maintenances, onSave, onCancel, isLoading, prefillCustomerId, prefillAssetId }) => {
    const [maintenanceDate, setMaintenanceDate] = useState<Date | null>(new Date());
    const [docNumber, setDocNumber] = useState('');
    const [requestNumber, setRequestNumber] = useState('');
    const [technician, setTechnician] = useState(currentUser.name);
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
    const [problemDescription, setProblemDescription] = useState('');
    const [actionsTaken, setActionsTaken] = useState('');
    const [attachments, setAttachments] = useState<File[]>([]);
    const [workTypes, setWorkTypes] = useState<string[]>([]);
    const [priority, setPriority] = useState<'Tinggi' | 'Sedang' | 'Rendah'>('Sedang');
    
    // State for device replacement
    const [retrievedAssetCondition, setRetrievedAssetCondition] = useState<AssetCondition>(AssetCondition.USED_OKAY);
    const [replacementAssetId, setReplacementAssetId] = useState('');
    
    // State for dynamic work type input
    const [workTypeInput, setWorkTypeInput] = useState('');
    const workTypeInputRef = useRef<HTMLInputElement>(null);

    const showReplacementSection = useMemo(() => workTypes.includes('Ganti Perangkat'), [workTypes]);

    useEffect(() => {
        if (prefillCustomerId) {
            setSelectedCustomerId(prefillCustomerId);
            const customerAssets = assets.filter(a => a.currentUser === prefillCustomerId);
            if (!prefillAssetId && customerAssets.length === 1) {
                setSelectedAssetIds([customerAssets[0].id]);
            }
        }
    }, [prefillCustomerId, prefillAssetId, assets]);

    useEffect(() => {
        if (prefillAssetId) {
            setSelectedAssetIds([prefillAssetId]);
        }
    }, [prefillAssetId]);

    const availableSuggestions = useMemo(() => {
        return allWorkTypes.filter(
            wt => !workTypes.includes(wt) && wt.toLowerCase().includes(workTypeInput.toLowerCase())
        );
    }, [workTypes, workTypeInput]);

    useEffect(() => {
        if (!maintenanceDate) {
            setDocNumber('[Otomatis]');
            return;
        }
        const newDocNumber = generateDocumentNumber('MNT', maintenances, maintenanceDate);
        setDocNumber(newDocNumber);
    }, [maintenanceDate, maintenances]);

    const customerOptions = useMemo(() => customers.map(c => ({ value: c.id, label: `${c.name} (${c.id})` })), [customers]);
    const technicianOptions = useMemo(() => users.filter(u => u.divisionId === 3).map(u => ({ value: u.name, label: u.name })), [users]);
    const assetsForCustomer = useMemo(() => assets.filter(a => a.currentUser === selectedCustomerId), [assets, selectedCustomerId]);
    
    const selectedAssetForReplacement = useMemo(() => assets.find(a => a.id === selectedAssetIds[0]), [assets, selectedAssetIds]);
    
    const replacementAssetOptions = useMemo(() => {
        if (!selectedAssetForReplacement) return [];
        return assets
            .filter(a => a.status === 'Di Gudang' && a.name === selectedAssetForReplacement.name && a.brand === selectedAssetForReplacement.brand && a.id !== selectedAssetForReplacement.id)
            .map(a => ({ value: a.id, label: `${a.id} (SN: ${a.serialNumber || 'N/A'})` }));
    }, [assets, selectedAssetForReplacement]);

    const handleWorkTypeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setWorkTypeInput(e.target.value);
    };

    const addWorkType = (workType: string) => {
        const trimmed = workType.trim();
        if (trimmed && !workTypes.includes(trimmed)) {
            setWorkTypes(prev => [...prev, trimmed]);
        }
        setWorkTypeInput('');
        workTypeInputRef.current?.focus();
    };

    const removeWorkType = (workTypeToRemove: string) => {
        setWorkTypes(prev => prev.filter(wt => wt !== workTypeToRemove));
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (workTypeInput) {
                addWorkType(workTypeInput);
            }
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setAttachments(prev => [...prev, ...Array.from(event.target.files!)]);
        }
    };

    const removeAttachment = (fileName: string) => {
        setAttachments(prev => prev.filter(file => file.name !== fileName));
    };

    const handleAssetSelection = (assetId: string) => {
        setSelectedAssetIds(prev => 
            prev.includes(assetId) ? prev.filter(id => id !== assetId) : [...prev, assetId]
        );
    };

    const handleSelectAllAssets = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedAssetIds(assetsForCustomer.map(a => a.id));
        } else {
            setSelectedAssetIds([]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const customer = customers.find(c => c.id === selectedCustomerId);
        if (!customer || selectedAssetIds.length === 0) return;

        const selectedAssetsInfo = selectedAssetIds.map(id => {
            const asset = assets.find(a => a.id === id);
            return { assetId: id, assetName: asset?.name || 'N/A' };
        });

        onSave({
            maintenanceDate: maintenanceDate!.toISOString(),
            requestNumber: requestNumber || undefined,
            technician,
            customerId: customer.id,
            customerName: customer.name,
            assets: selectedAssetsInfo,
            problemDescription,
            actionsTaken,
            workTypes,
            priority,
            attachments: [], // Simplified for now
            retrievedAssetCondition: showReplacementSection ? retrievedAssetCondition : undefined,
            replacementAssetId: showReplacementSection ? replacementAssetId : undefined,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Letterhead />
            <div className="text-center">
                <h3 className="text-xl font-bold uppercase text-tm-dark">Laporan Kunjungan Maintenance</h3>
            </div>

            <section className="p-4 border-t border-b">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Tanggal Kunjungan</label>
                        <DatePicker id="maintenanceDate" selectedDate={maintenanceDate} onDateChange={setMaintenanceDate} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Teknisi</label>
                        <CustomSelect options={technicianOptions} value={technician} onChange={setTechnician} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nomor Dokumen</label>
                        <input type="text" value={docNumber} readOnly className="w-full mt-1 p-2 bg-gray-100 border border-gray-200 rounded-md text-gray-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nomor Request Terkait</label>
                        <input type="text" value={requestNumber} onChange={e => setRequestNumber(e.target.value)} className="w-full mt-1 p-2 bg-white border border-gray-300 rounded-md shadow-sm" placeholder="Opsional, cth: REQ-001" />
                    </div>
                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700">Pelanggan</label>
                        <CustomSelect 
                            options={customerOptions} 
                            value={selectedCustomerId} 
                            onChange={(val) => {
                                setSelectedCustomerId(val);
                                setSelectedAssetIds([]); // Reset asset selection on customer change
                            }} 
                            isSearchable 
                            placeholder="Cari pelanggan..." 
                            disabled={!!prefillCustomerId}
                        />
                    </div>
                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700">Aset yang Dicek</label>
                        {assetsForCustomer.length > 1 ? (
                            <div className="mt-1 p-3 border rounded-lg bg-gray-50/50 space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                                <div className="flex items-center space-x-3 border-b pb-2 mb-2">
                                    <Checkbox id="select-all-assets" checked={selectedAssetIds.length === assetsForCustomer.length} onChange={handleSelectAllAssets} />
                                    <label htmlFor="select-all-assets" className="text-sm font-semibold text-gray-700 cursor-pointer">Pilih Semua Aset</label>
                                </div>
                                {assetsForCustomer.map(asset => (
                                    <div key={asset.id} className="flex items-center space-x-3">
                                        <Checkbox id={`asset-${asset.id}`} checked={selectedAssetIds.includes(asset.id)} onChange={() => handleAssetSelection(asset.id)} />
                                        <label htmlFor={`asset-${asset.id}`} className="text-sm text-gray-800 cursor-pointer">{asset.name} ({asset.id})</label>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <CustomSelect 
                                options={assetsForCustomer.map(a => ({ value: a.id, label: `${a.name} (${a.id})` }))}
                                value={selectedAssetIds[0] || ''} 
                                onChange={(val) => setSelectedAssetIds(val ? [val] : [])} 
                                disabled={!selectedCustomerId || !!prefillAssetId} 
                                placeholder="Pilih aset..." 
                            />
                        )}
                    </div>
                </div>
            </section>

             <section>
                <h4 className="font-semibold text-gray-800 border-b pb-1 mb-4">Lingkup Pekerjaan & Prioritas</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lingkup Pekerjaan</label>
                        <div className="relative">
                            <div className="flex flex-wrap items-center gap-2 p-2 border border-gray-300 rounded-lg min-h-[42px] bg-gray-50">
                                {workTypes.map(workType => (
                                    <span key={workType} className="inline-flex items-center gap-2 px-2.5 py-1 text-sm font-medium text-white bg-tm-primary rounded-full">
                                        {workType}
                                        <button type="button" onClick={() => removeWorkType(workType)} className="p-0.5 -mr-1 text-white/70 rounded-full hover:bg-white/20">
                                            <CloseIcon className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                                <input
                                    ref={workTypeInputRef}
                                    type="text"
                                    value={workTypeInput}
                                    onChange={handleWorkTypeInputChange}
                                    onKeyDown={handleInputKeyDown}
                                    placeholder={workTypes.length === 0 ? "Ketik lingkup pekerjaan, lalu Enter..." : ""}
                                    className="flex-1 min-w-[200px] h-full p-1 bg-transparent border-none focus:ring-0 text-sm"
                                />
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {availableSuggestions.map(suggestion => (
                                    <button
                                        type="button"
                                        key={suggestion}
                                        onClick={() => addWorkType(suggestion)}
                                        className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 hover:text-gray-800"
                                    >
                                        + {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Prioritas Pekerjaan</label>
                        <CustomSelect
                            options={[
                                { value: 'Tinggi', label: 'Tinggi' },
                                { value: 'Sedang', label: 'Sedang' },
                                { value: 'Rendah', label: 'Rendah' },
                            ]}
                            value={priority}
                            onChange={(value) => setPriority(value as 'Tinggi' | 'Sedang' | 'Rendah')}
                        />
                    </div>
                </div>
            </section>
            
            <section>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Laporan Masalah & Diagnosa</label>
                    <textarea value={problemDescription} onChange={e => setProblemDescription(e.target.value)} rows={3} className="block w-full px-3 py-2 mt-1 text-gray-900 placeholder:text-gray-400 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-tm-accent focus:border-tm-accent sm:text-sm" required placeholder="Jelaskan keluhan pelanggan dan hasil diagnosa teknisi di lapangan." />
                </div>
                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">Catatan Tindakan & Solusi</label>
                    <textarea value={actionsTaken} onChange={e => setActionsTaken(e.target.value)} rows={5} className="block w-full px-3 py-2 mt-1 text-gray-900 placeholder:text-gray-400 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-tm-accent focus:border-tm-accent sm:text-sm" required placeholder="Jelaskan secara detail tindakan yang telah dilakukan untuk menyelesaikan masalah."/>
                </div>
            </section>

<section>
                <h4 className="font-semibold text-gray-800 border-b pb-1 mb-4">Detail Aset & Material</h4>
                <div className="space-y-4">
                    {selectedAssetIds.length > 0 ? (
                        selectedAssetIds.map(assetId => {
                            const asset = assets.find(a => a.id === assetId);
                            if (!asset) return null;
                            return (
                                <div key={asset.id} className="p-4 border rounded-lg bg-gray-50/70">
                                    <p className="font-semibold text-gray-800">{asset.name}</p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 mt-2 text-xs">
                                        <div>
                                            <p className="text-gray-500">ID Aset</p>
                                            <p className="font-mono text-gray-700">{asset.id}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Serial Number</p>
                                            <p className="font-mono text-gray-700">{asset.serialNumber || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">MAC Address</p>
                                            <p className="font-mono text-gray-700">{asset.macAddress || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Kondisi</p>
                                            <p className="font-semibold text-gray-700">{asset.condition}</p>
                                        </div>
                                    </div>

                // Pilih Aset disini
                <section className={`p-4 pt-6 border-2 border-dashed rounded-lg transition-all duration-300 ${showReplacementSection ? 'border-blue-300 bg-blue-50/30' : 'border-gray-200 bg-gray-50/30'}`}>
                <div className="flex items-start space-x-3">
                    <p className={`text-base font-semibold ${showReplacementSection ? 'text-gray-800' : 'text-gray-400'}`}>Tindakan Penggantian Perangkat</p>
                </div>
                {showReplacementSection && (
                    <div className="mt-4 pt-4 border-t border-dashed space-y-4">
                        <div className="p-3 bg-blue-50/70 border border-blue-200/50 rounded-lg text-sm text-blue-800 flex items-start gap-3">
                            <InfoIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            {selectedAssetIds.length > 1 ? (
                                <p className="text-amber-800 font-semibold">Penggantian perangkat dinonaktifkan jika lebih dari satu aset dipilih.</p>
                            ) : (
                                <p>Sistem akan secara otomatis memperbarui status aset lama menjadi "Di Gudang" dan menetapkan aset baru ke pelanggan.</p>
                            )}
                        </div>
                        <fieldset disabled={selectedAssetIds.length > 1} className="disabled:opacity-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-red-700">Kondisi Aset Saat Ditarik (Wajib)</label>
                                    <CustomSelect 
                                        options={Object.values(AssetCondition).map(c => ({ value: c, label: c }))}
                                        value={retrievedAssetCondition}
                                        onChange={v => setRetrievedAssetCondition(v as AssetCondition)}
                                    />
                                </div>
                                <div>
                                     <label className="block text-sm font-medium text-green-700">Pilih Aset Pengganti (Wajib)</label>
                                     <CustomSelect
                                        options={replacementAssetOptions}
                                        value={replacementAssetId}
                                        onChange={setReplacementAssetId}
                                        disabled={!selectedAssetForReplacement}
                                        placeholder={replacementAssetOptions.length > 0 ? "Pilih dari stok gudang..." : "Tidak ada stok pengganti"}
                                     />
                                </div>
                            </div>
                        </fieldset>
                    </div>
                )}
            </section>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-4 text-sm text-gray-500">
                            Pilih aset di atas untuk melihat detailnya di sini.
                        </div>
                    )}
                </div>
            </section>


            <section>
                 <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">Lampiran (Foto)</label>
                    <div className="flex items-center justify-center w-full px-6 pt-5 pb-6 mt-1 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                        <PaperclipIcon className="w-10 h-10 mx-auto text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                                <label htmlFor="file-upload" className="relative font-medium bg-white rounded-md cursor-pointer text-tm-primary hover:text-tm-accent focus-within:outline-none">
                                    <span>Pilih file</span><input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={handleFileChange} />
                                </label>
                                <p className="pl-1">atau tarik dan lepas</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG hingga 10MB</p>
                        </div>
                    </div>
                    {attachments.length > 0 && (
                        <div className="mt-4 space-y-2">
                            {attachments.map(file => (
                                <div key={file.name} className="flex items-center justify-between p-2 text-sm text-gray-700 bg-gray-100 border border-gray-200 rounded-md">
                                    <span className="truncate">{file.name}</span>
                                    <button type="button" onClick={() => removeAttachment(file.name)} className="text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4" /></button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <section className="pt-8 border-t">
                <div className="grid grid-cols-2 text-center text-sm">
                    <div>
                        <p className="font-semibold text-gray-600">Teknisi,</p>
                        <div className="flex items-center justify-center mt-2 h-28"><SignatureStamp signerName={technician} signatureDate={maintenanceDate?.toISOString() || ''} /></div>
                        <p className="pt-1 mt-2 border-t border-gray-400">({technician})</p>
                    </div>
                     <div>
                        <p className="font-semibold text-gray-600">Pelanggan,</p>
                        <div className="h-28 mt-2"></div>
                        <p className="pt-1 mt-2 border-t border-gray-400">(.........................)</p>
                    </div>
                </div>
            </section>

            <div className="flex justify-end pt-4 border-t">
                <button type="button" onClick={onCancel} className="px-4 py-2 mr-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Batal</button>
                <button type="submit" disabled={isLoading} className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-tm-primary rounded-lg shadow-sm hover:bg-tm-primary-hover disabled:bg-tm-primary/70">
                    {isLoading && <SpinnerIcon className="w-4 h-4 mr-2" />}Simpan Laporan
                </button>
            </div>
        </form>
    );
};

export default MaintenanceForm;
