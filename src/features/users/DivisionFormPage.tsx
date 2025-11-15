import React, { useState, useEffect } from 'react';
import { Division } from '../../types';
import { useNotification } from '../../providers/NotificationProvider';
import { SpinnerIcon } from '../../components/icons/SpinnerIcon';
import FormPageLayout from '../../components/layout/FormPageLayout';

interface DivisionFormPageProps {
    onSave: (division: Omit<Division, 'id'>, id?: number) => void;
    onCancel: () => void;
    editingDivision: Division | null;
}

const DivisionFormPage: React.FC<DivisionFormPageProps> = ({ onSave, onCancel, editingDivision }) => {
    const [name, setName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const addNotification = useNotification();

    useEffect(() => {
        if(editingDivision) {
            setName(editingDivision.name);
        } else {
            setName('');
        }
    }, [editingDivision]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) {
            addNotification('Nama divisi wajib diisi.', 'error');
            return;
        }
        setIsSubmitting(true);
        setTimeout(() => {
            onSave({ name }, editingDivision?.id);
            setIsSubmitting(false);
        }, 1000);
    };

    return (
        <FormPageLayout
            title={editingDivision ? 'Edit Divisi' : 'Tambah Divisi Baru'}
            actions={
                <>
                    <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Batal</button>
                    <button type="submit" form="division-form" disabled={isSubmitting} className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 rounded-lg shadow-sm bg-tm-primary hover:bg-tm-primary-hover disabled:bg-tm-primary/70">
                        {isSubmitting && <SpinnerIcon className="w-5 h-5 mr-2" />}
                        {editingDivision ? 'Simpan Perubahan' : 'Simpan Divisi'}
                    </button>
                </>
            }
        >
            <form id="division-form" onSubmit={handleSubmit} className="max-w-xl mx-auto">
                <div>
                    <label htmlFor="divisionName" className="block text-sm font-medium text-gray-700">Nama Divisi</label>
                    <div className="mt-1">
                        <input type="text" id="divisionName" value={name} onChange={e => setName(e.target.value)} required className="block w-full px-3 py-2 mt-1 text-gray-900 placeholder:text-gray-400 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-tm-accent focus:border-tm-accent sm:text-sm" placeholder="Contoh: Finance"/>
                    </div>
                </div>
            </form>
        </FormPageLayout>
    );
};

export default DivisionFormPage;
