import React, { useMemo } from 'react';
import { Customer, Asset, Page, PreviewData, AssetCategory } from '../../../types';
import { DetailPageLayout } from '../../../components/layout/DetailPageLayout';
import { getStatusClass } from '../list/CustomerListPage';
import { PencilIcon } from '../../../components/icons/PencilIcon';
import { CustomerIcon } from '../../../components/icons/CustomerIcon';
import { WrenchIcon } from '../../../components/icons/WrenchIcon';
import { ClickableLink } from '../../../components/ui/ClickableLink';
import { DismantleIcon } from '../../../components/icons/DismantleIcon';
import { Tooltip } from '../../../components/ui/Tooltip';

interface CustomerDetailPageProps {
    customers: Customer[];
    assets: Asset[];
    assetCategories: AssetCategory[];
    initialState: { customerId: string };
    setActivePage: (page: Page, filters?: any) => void;
    onShowPreview: (data: PreviewData) => void;
    onInitiateDismantle: (asset: Asset) => void;
}

const DetailItem: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div>
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="mt-1 text-base text-gray-900">{children}</dd>
    </div>
);

const CustomerDetailPage: React.FC<CustomerDetailPageProps> = ({ customers, assets, assetCategories, initialState, setActivePage, onShowPreview }) => {
    const customer = useMemo(() => customers.find(c => c.id === initialState.customerId), [customers, initialState.customerId]);
    const customerAssets = useMemo(() => assets.filter(a => a.currentUser === initialState.customerId), [assets, initialState.customerId]);

    const individualAssets = useMemo(() => {
        return customerAssets.filter(asset => {
            const category = assetCategories.find(c => c.name === asset.category);
            const type = category?.types.find(t => t.name === asset.type);
            return type?.trackingMethod !== 'bulk';
        });
    }, [customerAssets, assetCategories]);


    if (!customer) {
        return (
            <div className="p-8 text-center text-gray-500">
                Pelanggan tidak ditemukan.
                <button onClick={() => setActivePage('customers')} className="mt-4 block mx-auto text-tm-primary hover:underline">
                    Kembali ke Daftar Pelanggan
                </button>
            </div>
        );
    }
    
    const handleEditClick = () => {
        setActivePage('customer-edit', { customerId: customer.id });
    };

    const MainContent = (
        <div className="space-y-8">
            {/* Contact Info */}
            <div className="p-6 bg-white border border-gray-200/80 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">Informasi Kontak</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                    <div className="space-y-4">
                        <DetailItem label="ID Pelanggan">{customer.id}</DetailItem>
                        <DetailItem label="Email">{customer.email}</DetailItem>
                    </div>
                    <div className="space-y-4">
                        <DetailItem label="Telepon">{customer.phone}</DetailItem>
                        <DetailItem label="Alamat">{customer.address}</DetailItem>
                    </div>
                </dl>

                {/* Service Info */}
                 <h3 className="text-lg pt-6 font-semibold text-gray-900 border-b pb-3 mb-4">Informasi Layanan</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                    <DetailItem label="Paket Layanan">{customer.servicePackage}</DetailItem>
                    <DetailItem label="Tanggal Instalasi">{new Date(customer.installationDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</DetailItem>
                </dl>

                {/* Installed Devices */}
                <h3 className="text-lg pt-6 font-semibold text-gray-900 border-b pb-3 mb-4">Aset Terpasang (Perangkat) ({individualAssets.length})</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Aset</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Aset</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial Number</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MAC Address</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kondisi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {individualAssets.length > 0 ? individualAssets.map(asset => (
                                <tr key={asset.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <ClickableLink onClick={() => onShowPreview({ type: 'asset', id: asset.id })}>
                                            <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                                        </ClickableLink>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-500 font-mono">{asset.id}</div></td>
                                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-500 font-mono">{asset.serialNumber || '-'}</div></td>
                                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-500 font-mono">{asset.macAddress || '-'}</div></td>
                                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-800">{asset.condition}</div></td>
                                </tr>
                            )) : (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">Tidak ada perangkat terpasang.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Installed Materials */}
                <h3 className="text-lg pt-6 font-semibold text-gray-900 border-b pb-3 mb-4">Material Terpasang ({customer.installedMaterials?.length || 0})</h3>
                <div className="overflow-x-auto">
                     <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Material</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Pemasangan</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {customer.installedMaterials && customer.installedMaterials.length > 0 ? customer.installedMaterials.map((material, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{material.itemName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{material.brand}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{material.quantity} {material.unit}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(material.installationDate).toLocaleDateString('id-ID')}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500">Tidak ada material yang tercatat.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
    
    const AsideContent = (
         <div className="space-y-6">
            <div className="p-5 bg-white border border-gray-200/80 rounded-xl shadow-sm">
                <h3 className="text-base font-semibold text-gray-800 mb-3">Status Pelanggan</h3>
                <span className={`px-2.5 py-1 text-sm font-bold rounded-full ${getStatusClass(customer.status)}`}>
                    {customer.status}
                </span>
            </div>
            <div className="p-5 bg-white border border-gray-200/80 rounded-xl shadow-sm">
                <h3 className="text-base font-semibold text-gray-800 mb-4">Aksi Cepat</h3>
                <div className="space-y-3">
                    <Tooltip text={customerAssets.length === 0 ? "Pelanggan tidak memiliki aset untuk di-maintenance" : "Buat laporan maintenance untuk aset pelanggan"}>
                        <div className="w-full">
                            <button
                                onClick={() => setActivePage('customer-maintenance-form', { prefillCustomer: customer.id })}
                                disabled={customerAssets.length === 0}
                                className="w-full justify-center inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-warning-text bg-warning/20 rounded-lg shadow-sm hover:bg-warning/30 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                            >
                                <WrenchIcon className="w-4 h-4"/>
                                Maintenance
                            </button>
                        </div>
                    </Tooltip>

                    <Tooltip text={customerAssets.length === 0 ? "Pelanggan tidak memiliki aset untuk ditarik" : "Mulai proses penarikan aset dari pelanggan"}>
                        <div className="w-full">
                            <button
                                onClick={() => setActivePage('customer-dismantle', { prefillCustomerId: customer.id })}
                                disabled={customerAssets.length === 0}
                                className="w-full justify-center inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-danger rounded-lg shadow-sm hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                <DismantleIcon className="w-4 h-4"/>
                                Dismantle
                            </button>
                        </div>
                    </Tooltip>
                </div>
                <div className="mt-6 pt-4 border-t">
                     <button
                        onClick={() => setActivePage('customer-installation-form')}
                        className="w-full justify-center inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-success rounded-lg shadow-sm hover:bg-green-700"
                    >
                        <CustomerIcon className="w-4 h-4"/>
                        Instalasi
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <DetailPageLayout
            title={customer.name}
            onBack={() => setActivePage('customers')}
            aside={AsideContent}
            headerActions={
                <button onClick={handleEditClick} className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-tm-primary rounded-lg shadow-sm hover:bg-tm-primary-hover">
                    <PencilIcon className="w-4 h-4" />
                    Edit
                </button>
            }
        >
            {MainContent}
        </DetailPageLayout>
    );
};

export default CustomerDetailPage;