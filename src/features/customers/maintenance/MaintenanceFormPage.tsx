
import React from 'react';
import { Page } from '../../../types';
import { WrenchIcon } from '../../../components/icons/WrenchIcon';
import { DashboardIcon } from '../../../components/icons/DashboardIcon';

interface MaintenanceFormPageProps {
    setActivePage: (page: Page) => void;
}

const MaintenanceFormPage: React.FC<MaintenanceFormPageProps> = ({ setActivePage }) => {
    return (
        <div className="flex items-center justify-center h-[calc(100vh-8rem)] p-8 text-center bg-gray-50">
            <div>
                <WrenchIcon className="w-16 h-16 mx-auto text-amber-400" />
                <h1 className="mt-4 text-2xl font-bold text-gray-800">Formulir Maintenance Pelanggan</h1>
                <p className="mt-2 text-gray-600">Fitur ini sedang dalam tahap pengembangan dan akan segera tersedia.</p>
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

export default MaintenanceFormPage;
