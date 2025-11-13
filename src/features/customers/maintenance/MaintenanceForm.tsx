import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Customer, Asset, User, Maintenance, ItemStatus, AssetCondition, StandardItem, AssetCategory, MaintenanceMaterial, MaintenanceReplacement } from '../../../types';
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
import { PlusIcon } from '../../../components/icons/PlusIcon';
import { WrenchIcon } from '../../../components/icons/WrenchIcon';


interface MaintenanceFormProps {
    currentUser: User;
    customers: Customer[];
    assets: Asset[];
    users: User[];
    maintenances: Maintenance[];
    assetCategories: AssetCategory[];
    onSave: (data: Omit<Maintenance, 'id' | 'status' | 'docNumber'>) => void;
    onCancel: () => void;
    isLoading: boolean;
    prefillCustomerId?: string;
    prefillAssetId?: string;
}

const allWorkTypes = ['Ganti Perangkat', 'Splicing FO', 'Tarik Ulang Kabel', 'Ganti Konektor', 'Backup Sementara', 'Lainnya'];

const MaintenanceForm: React.FC<MaintenanceFormProps> = ({ currentUser, customers, assets, users, maintenances, assetCategories, onSave, onCancel, isLoading, prefillCustomerId, prefillAssetId }) => {
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
    
    // State for multiple device replacements
    const [replacements, setReplacements] = useState<Record<string, Partial<MaintenanceReplacement>>>({});

    // State for additional materials
    type AdditionalMaterialItem = { id: number; modelKey: string; quantity: number | '' };
    const [additionalMaterials, setAdditionalMaterials] = useState<AdditionalMaterialItem[]>([]);
    
    // State for dynamic work type input
    const [workTypeInput, setWorkTypeInput] = useState('');
    const workTypeInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (prefillCustomerId) {
            setSelectedCustomerId(prefillCustomerId);
            const customerAssets = assets.filter(a => a.currentUser === prefillCustomerId);
            if (!prefillAssetId && customerAssets.length === 1) {
                handleAssetSelection(customerAssets[0].id);
            }
        }
    }, [prefillCustomerId, prefillAssetId, assets]);

    useEffect(() => {
        if (prefillAssetId) {
            const asset = assets.find(a => a.id === prefillAssetId);
            if (asset && asset.currentUser) {
                setSelectedCustomerId(asset.currentUser);
                handleAssetSelection(prefillAssetId);
            }
        }
    }, [prefillAssetId, assets]);

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
    
    const replacementAssetOptions = useMemo(() => (oldAssetId: string) => {
        const assetToReplace = assets.find(a => a.id === oldAssetId);
        if (!assetToReplace) return [];

        const currentReplacementId = replacements[oldAssetId]?.newAssetId;

        const currentlyUsedInOtherReplacements = Object.entries(replacements)
            .filter(([key]) => key !== oldAssetId)
            .map(([, value]) => value.newAssetId);

        return assets
            .filter(a => 
                a.status === 'Di Gudang' && 
                a.name === assetToReplace.name && 
                a.brand === assetToReplace.brand && 
                a.id !== assetToReplace.id &&
                (!currentlyUsedInOtherReplacements.includes(a.id) || a.id === currentReplacementId)
            )
            .map(a => ({ value: a.id, label: `${a.id} (SN: ${a.serialNumber || 'N/A'})` }));
    }, [assets, replacements]);


    const materialOptions = useMemo(() => {
        const items: { value: string, label: string }[] = [];
        assetCategories.forEach(cat => {
            if (cat.isCustomerInstallable) {
                cat.types.forEach(type => {
                     if (type.trackingMethod === 'bulk') {
                        (type.standardItems || []).forEach(item => {
                            items.push({
                                value: `${item.name}|${item.brand}`,
                                label: `${item.name} - ${item.brand}`
                            });
                        });
                    }
                });
            }
        });
        return items;
    }, [assetCategories]);

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
        const isCurrentlySelected = selectedAssetIds.includes(assetId);
        
        setSelectedAssetIds(prev => 
            isCurrentlySelected ? prev.filter(id => id !== assetId) : [...prev, assetId]
        );
        
        if (isCurrentlySelected) {
            setReplacements(prev => {
                const newReplacements = {...prev};
                delete newReplacements[assetId];
                return newReplacements;
            });
        }
    };


    const toggleReplacement = (assetId: string) => {
        setReplacements(prev => {
            const newReplacements = { ...prev };
            if (newReplacements[assetId]) {
                delete newReplacements[assetId];
            } else {
                newReplacements[assetId] = { oldAssetId: assetId, retrievedAssetCondition: AssetCondition.USED_OKAY };
            }
            return newReplacements;
        });
    };

    const updateReplacementDetail = (oldAssetId: string, field: keyof MaintenanceReplacement, value: any) => {
        setReplacements(prev => ({
            ...prev,
            [oldAssetId]: {
                ...prev[oldAssetId],
                [field]: value
            }
        }));
    };
    
    const addAdditionalMaterial = () => {
        setAdditionalMaterials(prev => [...prev, { id: Date.now(), modelKey: '', quantity: 1 }]);
    };
    
    const removeAdditionalMaterial = (id: number) => {
        setAdditionalMaterials(prev => prev.filter(item => item.id !== id));
    };

    const handleMaterialChange = (id: number, field: keyof AdditionalMaterialItem, value: any) => {
        setAdditionalMaterials(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const customer = customers.find(c => c.id === selectedCustomerId);
        if (!customer || selectedAssetIds.length === 0) return;

        const selectedAssetsInfo = selectedAssetIds.map(id => {
            const asset = assets.find(a => a.id === id);
            return { assetId: id, assetName: asset?.name || 'N/A' };
        });
        
        const finalReplacements = Object.values(replacements)
            .filter(r => r.oldAssetId && r.newAssetId && r.retrievedAssetCondition) as MaintenanceReplacement[];

        const finalWorkTypes = finalReplacements.length > 0 ? [...new Set([...workTypes, 'Ganti Perangkat'])] : workTypes;

        onSave({
            maintenanceDate: maintenanceDate!.toISOString(),
            requestNumber: requestNumber || undefined,
            technician,
            customerId: customer.id,
            customerName: customer.name,
            assets: selectedAssetsInfo,
            problemDescription,
            actionsTaken,
            workTypes: finalWorkTypes,
            priority,
            attachments: [], // Simplified for now
            materialsUsed: additionalMaterials
                .filter(m => m.modelKey && m.quantity)
                .map(m => {
                    const [name, brand] = m.modelKey.split('|');
                    return { itemName: name, brand: brand, quantity: Number(m.quantity) };
                }),
            replacements: finalReplacements
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Letterhead />
            <div className="text-center">
                <h3 className="text-xl font-bold uppercase text-tm-dark">Laporan Kunjungan Maintenance</h3>
            </div>

            {/* Document Info Section */}
            <section className="p-4 border-t border-b">
                <h4 className="font-semibold text-gray-800 border-b pb-1 mb-4">Informasi Dokumen</h4>
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
                </div>
            </section>
            
            {/* Customer Info Section */}
            <section>
                <h4 className="font-semibold text-gray-800 border-b pb-1 mb-4">Informasi Pelanggan</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Pilih Pelanggan</label>
                        <CustomSelect 
                            options={customerOptions} 
                            value={selectedCustomerId} 
                            onChange={(val) => {
                                setSelectedCustomerId(val);
                                setSelectedAssetIds([]);
                            }} 
                            isSearchable 
                            placeholder="Cari pelanggan..." 
                            disabled={!!prefillCustomerId || !!prefillAssetId}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">ID Pelanggan</label>
                        <input type="text" value={selectedCustomerId} readOnly className="w-full mt-1 p-2 bg-gray-100 border border-gray-200 rounded-md text-gray-600" />
                    </div>
                </div>
            </section>

            {/* Asset and Material Details Section */}
            <section>
                <h4 className="font-semibold text-gray-800 border-b pb-1 mb-4">Detail Aset & Material</h4>
                <p className="text-sm text-gray-500 mb-4 -mt-2">Klik pada kartu aset untuk memilihnya sebagai bagian dari lingkup maintenance.</p>
                
                <div className="space-y-4">
                    {assetsForCustomer.map(asset => {
                        const isSelected = selectedAssetIds.includes(asset.id);
                        const isReplacingThis = !!replacements[asset.id];
                        return (
                            <div
                                key={asset.id}
                                onClick={(e) => {
                                    if ((e.target as HTMLElement).closest('button, a, input, select, textarea')) return;
                                    handleAssetSelection(asset.id);
                                }}
                                className={`p-4 border rounded-lg transition-all duration-300 cursor-pointer ${
                                    isSelected 
                                        ? 'bg-blue-50 border-tm-primary ring-2 ring-tm-accent/30' 
                                        : 'bg-white border-gray-200/80 hover:border-gray-400'
                                }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-800">{asset.name}</p>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 mt-2 text-xs">
                                            <div><p className="text-gray-500">ID Aset</p><p className="font-mono text-gray-700">{asset.id}</p></div>
                                            <div><p className="text-gray-500">Serial Number</p><p className="font-mono text-gray-700">{asset.serialNumber || '-'}</p></div>
                                            <div><p className="text-gray-500">MAC Address</p><p className="font-mono text-gray-700">{asset.macAddress || '-'}</p></div>
                                            <div><p className="text-gray-500">Kondisi</p><p className="font-semibold text-gray-700">{asset.condition}</p></div>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); toggleReplacement(asset.id); }}
                                        disabled={!isSelected}
                                        className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white rounded-md shadow-sm transition-colors
                                            ${isReplacingThis ? 'bg-red-500 hover:bg-red-600' : 'bg-tm-accent hover:bg-tm-primary'}
                                            disabled:bg-gray-400 disabled:cursor-not-allowed`}
                                    >
                                        <WrenchIcon className="w-4 h-4"/>
                                        {isReplacingThis ? 'Batal Ganti' : 'Ganti Aset'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    {assetsForCustomer.length === 0 && (
                        <p className="text-sm text-center text-gray-500 py-4">Pelanggan ini tidak memiliki aset terpasang.</p>
                    )}
                </div>

                {Object.keys(replacements).length > 0 && (
                     <div className="mt-6 p-4 border-2 border-dashed rounded-lg bg-gray-50/30 border-gray-200">
                        <h5 className="text-base font-semibold text-gray-800 mb-4">Ringkasan Penggantian Aset</h5>
                        <div className="space-y-4">
                            {Object.values(replacements).map(replacement => {
                                const oldAsset = assets.find(a => a.id === replacement.oldAssetId);
                                if (!oldAsset) return null;
                                return (
                                    <div key={oldAsset.id} className="p-4 bg-white border rounded-lg">
                                        <p className="font-semibold text-gray-800">Mengganti: {oldAsset.name} ({oldAsset.id})</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                                            <div>
                                                <label className="block text-sm font-medium text-red-700">Kondisi Aset Ditarik (Wajib)</label>
                                                <CustomSelect 
                                                    options={Object.values(AssetCondition).map(c => ({ value: c, label: c }))} 
                                                    value={replacement.retrievedAssetCondition || ''} 
                                                    onChange={v => updateReplacementDetail(oldAsset.id, 'retrievedAssetCondition', v as AssetCondition)} 
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-green-700">Pilih Aset Pengganti (Wajib)</label>
                                                <CustomSelect 
                                                    options={replacementAssetOptions(oldAsset.id)} 
                                                    value={replacement.newAssetId || ''} 
                                                    onChange={v => updateReplacementDetail(oldAsset.id, 'newAssetId', v)} 
                                                    placeholder={replacementAssetOptions(oldAsset.id).length > 0 ? "Pilih dari stok gudang..." : "Tidak ada stok pengganti"}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
  
                <section className="p-4 mt-6 border-2 border-dashed rounded-lg bg-gray-50/30 border-gray-200">
                    <h5 className="text-base font-semibold text-gray-800 mb-4">Material Tambahan</h5>
                    <div className="space-y-3">
                        {additionalMaterials.map((material, index) => (
                            <div key={material.id} className="relative grid grid-cols-1 md:grid-cols-5 gap-x-4 gap-y-2 p-3 bg-white/80 border rounded-lg">
                                <div className="md:col-span-3">
                                    <label className="block text-xs font-medium text-gray-500">Material Tambahan #{index + 1}</label>
                                    <CustomSelect options={materialOptions} value={material.modelKey} onChange={val => handleMaterialChange(material.id, 'modelKey', val)} placeholder="Pilih material..." isSearchable/>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-gray-500">Jumlah</label>
                                    <input type="number" value={material.quantity} onChange={e => handleMaterialChange(material.id, 'quantity', e.target.value)} min="1" className="block w-full px-3 py-2 mt-1 text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm sm:text-sm"/>
                                </div>
                                <div className="absolute top-1 right-1">
                                    <button type="button" onClick={() => removeAdditionalMaterial(material.id)} className="p-1 text-gray-400 rounded-full hover:bg-red-100 hover:text-red-500"><TrashIcon className="w-4 h-4" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={addAdditionalMaterial} className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-tm-accent rounded-md shadow-sm hover:bg-tm-primary"><PlusIcon className="w-4 h-4"/>Tambah Material</button>
                </section>
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
                                        <button type="button" onClick={() => removeWorkType(workType)} className="p-0.5 -mr-1 text-white/70 rounded-full hover:bg-white/20"><CloseIcon className="w-3 h-3" /></button>
                                    </span>
                                ))}
                                <input ref={workTypeInputRef} type="text" value={workTypeInput} onChange={handleWorkTypeInputChange} onKeyDown={handleInputKeyDown} placeholder={workTypes.length === 0 ? "Ketik lingkup pekerjaan, lalu Enter..." : ""} className="flex-1 min-w-[200px] h-full p-1 bg-transparent border-none focus:ring-0 text-sm" />
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {availableSuggestions.map(suggestion => (
                                    <button type="button" key={suggestion} onClick={() => addWorkType(suggestion)} className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 hover:text-gray-800">+ {suggestion}</button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Prioritas</label>
                        <CustomSelect options={[{ value: 'Tinggi', label: 'Tinggi' },{ value: 'Sedang', label: 'Sedang' },{ value: 'Rendah', label: 'Rendah' }]} value={priority} onChange={(value) => setPriority(value as 'Tinggi' | 'Sedang' | 'Rendah')} />
                    </div>
                </div>
            </section>
            
            <section>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Laporan Masalah & Diagnosa</label>
                    <textarea value={problemDescription} onChange={e => setProblemDescription(e.target.value)} rows={3} className="block w-full px-3 py-2 mt-1 text-gray-900 placeholder:text-gray-400 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-tm-accent focus:border-tm-accent sm:text-sm" required placeholder="Jelaskan keluhan pelanggan dan hasil diagnosa teknisi." />
                </div>
                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">Catatan Tindakan & Solusi</label>
                    <textarea value={actionsTaken} onChange={e => setActionsTaken(e.target.value)} rows={5} className="block w-full px-3 py-2 mt-1 text-gray-900 placeholder:text-gray-400 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-tm-accent focus:border-tm-accent sm:text-sm" required placeholder="Jelaskan secara detail tindakan yang telah dilakukan."/>
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