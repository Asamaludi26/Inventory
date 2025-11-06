import React from 'react';
import { Page, User, Request, Asset, AssetCategory, Division, StandardItem, AssetType, Notification } from '../../../types';
import { WrenchIcon } from '../../../components/icons/WrenchIcon';
import { DashboardIcon } from '../../../components/icons/DashboardIcon';

// Menerima semua props yang sama dengan NewRequestPage untuk konsistensi,
// meskipun belum semuanya digunakan.
interface LoanRequestPageProps {
    currentUser: User;
    setActivePage: (page: Page) => void;
    // Tambahkan props lain yang relevan saat fitur ini dikembangkan
}

const LoanRequestPage: React.FC<LoanRequestPageProps> = ({ setActivePage }) => {
    return (
        <div className="flex items-center justify-center h-[calc(100vh-4rem)] p-8 text-center bg-gray-50">
            <div>
                <WrenchIcon className="w-16 h-16 mx-auto text-amber-400" />
                <h1 className="mt-4 text-2xl font-bold text-gray-800">Fitur Request Pinjam</h1>
                <p className="mt-2 text-gray-600">
                    Halaman untuk mengelola permintaan peminjaman aset sedang dalam tahap pengembangan.
                </p>
                <button 
                    onClick={() => setActivePage('dashboard')}
                    className="inline-flex items-center justify-center gap-2 mt-6 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 bg-tm-primary rounded-lg shadow-sm hover:bg-tm-primary-hover"
                >
                    <DashboardIcon className="w-4 h-4" />
                    Kembali ke Dashboard
                </button>
            </div>
        </div>
    );
};

export default LoanRequestPage;
