import React, { useState } from 'react';
import { AssetCategory, Division, Asset, AssetType } from '../types';
import Modal from './shared/Modal';
import { useNotification } from './shared/Notification';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { InboxIcon } from './icons/InboxIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { Checkbox } from './shared/Checkbox';

interface CategoryManagementProps {
    categories: AssetCategory[];
    setCategories: React.Dispatch<React.SetStateAction<AssetCategory[]>>;
    divisions: Division[];
    assets: Asset[];
}

interface CategoryFormData {
    name: string;
    associatedDivisions: number[];
}

export const CategoryManagement: React.FC<CategoryManagementProps> = ({ categories, setCategories, divisions, assets }) => {
    const [openCategoryId, setOpenCategoryId] = useState<number | null>(null);
    
    // Modal states
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Data for modals
    const [editingCategory, setEditingCategory] = useState<AssetCategory | null>(null);
    const [editingType, setEditingType] = useState<AssetType | null>(null);
    const [parentCategoryForType, setParentCategoryForType] = useState<AssetCategory | null>(null);
    const [itemToDelete, setItemToDelete] = useState<{ type: 'category' | 'type', data: any, parent?: AssetCategory } | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const addNotification = useNotification();

    const handleToggleCategory = (id: number) => {
        setOpenCategoryId(prev => (prev === id ? null : id));
    };
    
    // --- Modal Openers ---
    const handleOpenCategoryModal = (category: AssetCategory | null) => {
        setEditingCategory(category);
        setIsCategoryModalOpen(true);
    };

    const handleOpenTypeModal = (type: AssetType | null, parentCategory: AssetCategory) => {
        setEditingType(type);
        setParentCategoryForType(parentCategory);
        setIsTypeModalOpen(true);
    };

    const handleOpenDeleteModal = (item: AssetCategory | AssetType, type: 'category' | 'type', parentCategory?: AssetCategory) => {
        setItemToDelete({ type, data: item, parent: parentCategory });
        setIsDeleteModalOpen(true);
    };
    
    // --- CRUD Handlers ---
    const handleSaveCategory = (formData: CategoryFormData) => {
        setIsLoading(true);
        setTimeout(() => {
            if (editingCategory) { // Update
                setCategories(prev => prev.map(cat => cat.id === editingCategory.id ? { ...cat, name: formData.name, associatedDivisions: formData.associatedDivisions } : cat));
                addNotification(`Kategori "${formData.name}" berhasil diperbarui.`, 'success');
            } else { // Create
                const newCategory: AssetCategory = {
                    id: Date.now(),
                    name: formData.name,
                    types: [],
                    associatedDivisions: formData.associatedDivisions
                };
                setCategories(prev => [...prev, newCategory]);
                addNotification(`Kategori "${formData.name}" berhasil ditambahkan.`, 'success');
            }
            setIsLoading(false);
            setIsCategoryModalOpen(false);
            setEditingCategory(null);
        }, 500);
    };

    const handleSaveType = (typeName: string) => {
        if (!parentCategoryForType) return;
        setIsLoading(true);
        setTimeout(() => {
            if (editingType) { // Update
                setCategories(prev => prev.map(cat => {
                    if (cat.id === parentCategoryForType.id) {
                        return { ...cat, types: cat.types.map(t => t.id === editingType.id ? { ...t, name: typeName } : t) };
                    }
                    return cat;
                }));
                addNotification(`Tipe "${typeName}" berhasil diperbarui.`, 'success');
            } else { // Create
                const newType: AssetType = { id: Date.now(), name: typeName };
                setCategories(prev => prev.map(cat => {
                    if (cat.id === parentCategoryForType.id) {
                        return { ...cat, types: [...cat.types, newType] };
                    }
                    return cat;
                }));
                 addNotification(`Tipe "${typeName}" berhasil ditambahkan ke kategori "${parentCategoryForType.name}".`, 'success');
            }
            setIsLoading(false);
            setIsTypeModalOpen(false);
            setEditingType(null);
            setParentCategoryForType(null);
        }, 500);
    };

    const handleConfirmDelete = () => {
        if (!itemToDelete) return;
        
        // Check if item is in use
        if (itemToDelete.type === 'category') {
            if (assets.some(a => a.category === itemToDelete.data.name)) {
                addNotification(`Kategori "${itemToDelete.data.name}" tidak dapat dihapus karena sedang digunakan oleh aset.`, 'error');
                setIsDeleteModalOpen(false);
                return;
            }
            setCategories(prev => prev.filter(cat => cat.id !== itemToDelete.data.id));
            addNotification(`Kategori "${itemToDelete.data.name}" berhasil dihapus.`, 'success');
        } else if (itemToDelete.type === 'type' && itemToDelete.parent) {
            if (assets.some(a => a.category === itemToDelete.parent!.name && a.type === itemToDelete.data.name)) {
                addNotification(`Tipe "${itemToDelete.data.name}" tidak dapat dihapus karena sedang digunakan oleh aset.`, 'error');
                setIsDeleteModalOpen(false);
                return;
            }
            setCategories(prev => prev.map(cat => {
                if (cat.id === itemToDelete.parent!.id) {
                    return { ...cat, types: cat.types.filter(t => t.id !== itemToDelete.data.id) };
                }
                return cat;
            }));
            addNotification(`Tipe "${itemToDelete.data.name}" berhasil dihapus.`, 'success');
        }

        setIsDeleteModalOpen(false);
        setItemToDelete(null);
    };

    return (
        <div className="p-4 sm:p-6 md:p-8">
            <div className="flex flex-col items-start justify-between gap-4 mb-6 md:flex-row md:items-center">
                <h1 className="text-3xl font-bold text-tm-dark">Manajemen Kategori</h1>
                <button onClick={() => handleOpenCategoryModal(null)} className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 rounded-lg shadow-sm bg-tm-primary hover:bg-tm-primary-hover">
                    Tambah Kategori Baru
                </button>
            </div>
            
            <div className="space-y-4">
                {categories.length > 0 ? categories.map(category => (
                    <div key={category.id} className="overflow-hidden bg-white border border-gray-200/80 rounded-xl shadow-md">
                        {/* Category Header */}
                        <div className="flex items-center justify-between w-full p-4 text-left bg-gray-50/70">
                            <button onClick={() => handleToggleCategory(category.id)} className="flex items-center flex-grow min-w-0 gap-4 group">
                                <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${openCategoryId === category.id ? 'rotate-180' : ''}`} />
                                <div className="min-w-0">
                                    <h3 className="text-lg font-semibold truncate text-tm-dark group-hover:text-tm-primary">{category.name}</h3>
                                    <p className="text-sm text-gray-500">{category.types.length} Tipe Aset</p>
                                </div>
                            </button>
                            <div className="flex items-center flex-shrink-0 gap-2 pl-4">
                                <button onClick={(e) => { e.stopPropagation(); handleOpenCategoryModal(category); }} className="flex items-center justify-center w-8 h-8 text-gray-500 transition-colors bg-gray-100 rounded-full hover:bg-yellow-100 hover:text-yellow-700" title="Edit Kategori"><PencilIcon className="w-4 h-4" /></button>
                                <button onClick={(e) => { e.stopPropagation(); handleOpenDeleteModal(category, 'category'); }} className="flex items-center justify-center w-8 h-8 text-gray-500 transition-colors bg-gray-100 rounded-full hover:bg-red-100 hover:text-red-700" title="Hapus Kategori"><TrashIcon className="w-5 h-5" /></button>
                            </div>
                        </div>

                        {/* Collapsible Content */}
                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openCategoryId === category.id ? 'max-h-[1000px]' : 'max-h-0'}`}>
                            <div className="p-6 border-t border-gray-200">
                                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                                    {/* Asset Types Section */}
                                    <div className="md:col-span-2">
                                        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-200">
                                            <h4 className="text-sm font-semibold tracking-wider text-gray-600 uppercase">Tipe Aset</h4>
                                            <button onClick={() => handleOpenTypeModal(null, category)} className="px-3 py-1 text-xs font-semibold text-white rounded-md shadow-sm bg-tm-accent hover:bg-tm-primary">+ Tambah Tipe</button>
                                        </div>
                                        {category.types.length > 0 ? (
                                            <ul className="space-y-1">
                                                {category.types.map(type => (
                                                    <li key={type.id} className="group flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-50/80">
                                                        <span className="text-sm font-medium text-gray-800">{type.name}</span>
                                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => handleOpenTypeModal(type, category)} className="p-1 text-gray-400 rounded-md hover:bg-gray-200 hover:text-yellow-600" title="Edit Tipe"><PencilIcon className="w-4 h-4" /></button>
                                                            <button onClick={() => handleOpenDeleteModal(type, 'type', category)} className="p-1 text-gray-400 rounded-md hover:bg-gray-200 hover:text-red-600" title="Hapus Tipe"><TrashIcon className="w-4 h-4" /></button>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="py-4 text-sm text-center text-gray-500 border-2 border-dashed rounded-lg">
                                                Belum ada tipe untuk kategori ini.
                                            </div>
                                        )}
                                    </div>
                                    {/* Associated Divisions Section */}
                                    <div>
                                        <div className="pb-3 mb-3 border-b border-gray-200">
                                            <h4 className="text-sm font-semibold tracking-wider text-gray-600 uppercase">Divisi Terkait</h4>
                                        </div>
                                        {category.associatedDivisions.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {category.associatedDivisions.map(divId => {
                                                    const division = divisions.find(d => d.id === divId);
                                                    return (
                                                        <span key={divId} className="px-2.5 py-1 text-xs font-medium text-gray-800 bg-gray-100 rounded-full">
                                                            {division?.name || 'Divisi Tidak Dikenal'}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-sm italic text-gray-500">Berlaku untuk semua divisi.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )) : <div className="text-center text-gray-500 py-12"><InboxIcon className="w-12 h-12 mx-auto" /> <p className="mt-2">Belum ada kategori. Silakan buat yang baru.</p></div>}
            </div>

            {isCategoryModalOpen && (
                <Modal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} title={editingCategory ? "Edit Kategori" : "Tambah Kategori Baru"} hideDefaultCloseButton disableContentPadding>
                    <CategoryFormModal
                        category={editingCategory}
                        divisions={divisions}
                        onSave={handleSaveCategory}
                        onClose={() => setIsCategoryModalOpen(false)}
                        isLoading={isLoading}
                    />
                </Modal>
            )}

            {isTypeModalOpen && (
                 <Modal isOpen={isTypeModalOpen} onClose={() => setIsTypeModalOpen(false)} title={editingType ? `Edit Tipe` : `Tambah Tipe Baru`} hideDefaultCloseButton disableContentPadding>
                    <TypeFormModal
                        type={editingType}
                        onSave={handleSaveType}
                        onClose={() => setIsTypeModalOpen(false)}
                        isLoading={isLoading}
                    />
                </Modal>
            )}
            
            {isDeleteModalOpen && itemToDelete && (
                 <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Konfirmasi Hapus" size="md">
                     <div className="text-center">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto text-red-600 bg-red-100 rounded-full">
                            <ExclamationTriangleIcon className="w-8 h-8" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-gray-800">Hapus {itemToDelete.type === 'category' ? 'Kategori' : 'Tipe'}?</h3>
                        <p className="mt-2 text-sm text-gray-600">Anda yakin ingin menghapus <strong>"{itemToDelete.data.name}"</strong>? Aksi ini tidak dapat diurungkan.</p>
                     </div>
                      <div className="flex items-center justify-end pt-5 mt-5 space-x-3 border-t">
                        <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Batal</button>
                        <button onClick={handleConfirmDelete} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-danger rounded-lg hover:bg-red-700">Ya, Hapus</button>
                    </div>
                </Modal>
            )}

        </div>
    );
};

const CategoryFormModal: React.FC<{ category: AssetCategory | null, divisions: Division[], onSave: (data: CategoryFormData) => void, onClose: () => void, isLoading: boolean }> = ({ category, divisions, onSave, onClose, isLoading }) => {
    const [name, setName] = useState(category?.name || '');
    const [selectedDivisions, setSelectedDivisions] = useState<number[]>(category?.associatedDivisions || []);

    const handleDivisionToggle = (divId: number) => {
        setSelectedDivisions(prev => prev.includes(divId) ? prev.filter(id => id !== divId) : [...prev, divId]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, associatedDivisions: selectedDivisions });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-5">
                <div>
                    <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700">Nama Kategori</label>
                    <input type="text" id="categoryName" value={name} onChange={e => setName(e.target.value)} required className="block w-full px-3 py-2 mt-1 text-gray-900 placeholder:text-gray-400 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-tm-accent focus:border-tm-accent sm:text-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Divisi Terkait</label>
                    <p className="mt-1 text-xs text-gray-500">Batasi kategori ini hanya untuk divisi tertentu. Kosongkan untuk mengizinkan semua divisi.</p>
                    <div className="mt-2 space-y-2 max-h-48 overflow-y-auto custom-scrollbar border p-3 rounded-lg">
                        {divisions.map(div => (
                            <label key={div.id} className="flex items-center space-x-3">
                                <Checkbox
                                    checked={selectedDivisions.includes(div.id)}
                                    onChange={() => handleDivisionToggle(div.id)}
                                />
                                <span className="text-sm text-gray-700">{div.name}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-end px-6 py-4 space-x-3 bg-gray-50 border-t border-gray-200 rounded-b-xl">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Batal</button>
                <button type="submit" disabled={isLoading} className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 rounded-lg shadow-sm bg-tm-primary hover:bg-tm-primary-hover disabled:bg-tm-primary/70">
                    {isLoading && <SpinnerIcon className="w-5 h-5 mr-2" />}
                    Simpan
                </button>
            </div>
        </form>
    );
};

const TypeFormModal: React.FC<{ type: AssetType | null, onSave: (name: string) => void, onClose: () => void, isLoading: boolean }> = ({ type, onSave, onClose, isLoading }) => {
    const [name, setName] = useState(type?.name || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(name);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-1">
                <label htmlFor="typeName" className="block text-sm font-medium text-gray-700">Nama Tipe</label>
                <input type="text" id="typeName" value={name} onChange={e => setName(e.target.value)} required className="block w-full px-3 py-2 mt-1 text-gray-900 placeholder:text-gray-400 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-tm-accent focus:border-tm-accent sm:text-sm" />
            </div>
            <div className="flex items-center justify-end px-6 py-4 space-x-3 bg-gray-50 border-t border-gray-200 rounded-b-xl">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Batal</button>
                <button type="submit" disabled={isLoading} className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 rounded-lg shadow-sm bg-tm-primary hover:bg-tm-primary-hover disabled:bg-tm-primary/70">
                    {isLoading && <SpinnerIcon className="w-5 h-5 mr-2" />}
                    Simpan
                </button>
            </div>
        </form>
    );
};
