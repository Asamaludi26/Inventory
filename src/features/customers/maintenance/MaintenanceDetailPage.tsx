
import React, { useMemo, useState } from 'react';
import { Maintenance, User, ItemStatus, Asset } from '../../../types';
import { DetailPageLayout } from '../../../components/layout/DetailPageLayout';
import { Letterhead } from '../../../components/ui/Letterhead';
import { SignatureStamp } from '../../../components/ui/SignatureStamp';
import { ApprovalStamp } from '../../../components/ui/ApprovalStamp';
import { InfoIcon } from '../../../components/icons/InfoIcon';
import { SpinnerIcon } from '../../../components/icons/SpinnerIcon';
import { CheckIcon } from '../../../components/icons/CheckIcon';
import { BsArrowRight } from 'react-icons/bs';

interface MaintenanceDetailPageProps {
    maintenance: Maintenance;
    currentUser: User;
    assets: Asset[];
    onBackToList: () => void;
    onComplete: () => void;
    isLoading: boolean;
}

const DetailItem: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div><dt className="text-sm font-medium text-gray-500">{label}</dt><dd className="mt-1 text-gray-900">{children}</dd></div>
);

const getPriorityClass = (priority?: 'Tinggi' | 'Sedang' | 'Rendah') => {
    switch (priority) {
        case 'Tinggi': return 'bg-danger-light text-danger-text';
        case 'Sedang': return 'bg-warning-light text-warning-text';
        case 'Rendah': return 'bg-info-light text-info-text';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const MaintenanceDetailPage: React.FC<MaintenanceDetailPageProps> = ({ maintenance, currentUser, assets, onBackToList, onComplete, isLoading }) => {
    
    const canComplete = maintenance.status === ItemStatus.IN_PROGRESS && (currentUser.role === 'Admin Logistik' || currentUser.role === 'Super Admin');
    
    const HeaderActions = () => (
        <>
            {canComplete && (
                <button onClick={onComplete} disabled={isLoading} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-success rounded-lg shadow-sm hover:bg-green-700">
                    {isLoading ? <SpinnerIcon /> : <CheckIcon />} Selesaikan
                </button>
            )}
        </>
    );

    return (
        <DetailPageLayout title={`Laporan Maintenance: ${maintenance.docNumber}`} onBack={onBackToList} headerActions={<HeaderActions />}>
            <div className="p-8 bg-white border rounded-lg shadow-sm">
                <Letterhead />
                <div className="text-center my-8">
                    <h3 className="text-xl font-bold uppercase text-tm-dark">Laporan Kunjungan Maintenance</h3>
                    <p className="text-sm text-tm-secondary">Nomor: {maintenance.docNumber}</p>
                </div>
                
                <section className="space-y-4 text-sm">
                    <div className="grid grid-cols-2 gap-6">
                        <DetailItem label="Tanggal Kunjungan">{new Date(maintenance.maintenanceDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</DetailItem>
                        <DetailItem label="Teknisi">{maintenance.technician}</DetailItem>
                        <DetailItem label="Pelanggan">{maintenance.customerName} ({maintenance.customerId})</DetailItem>
                        <DetailItem label="Nomor Request Terkait">{maintenance.requestNumber || '-'}</DetailItem>
                        <DetailItem label="Prioritas">
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getPriorityClass(maintenance.priority)}`}>
                                {maintenance.priority || 'Tidak diatur'}
                            </span>
                        </DetailItem>
                    </div>
                </section>
                
                <section className="mt-6 pt-6 border-t">
                     <h4 className="font-semibold text-gray-800 border-b pb-1 mb-4">Detail Pekerjaan</h4>
                     <div className="space-y-4 text-sm">
                        {maintenance.assets && maintenance.assets.length > 0 && (
                            <DetailItem label="Aset yang Dicek">
                                <ul className="list-disc list-inside mt-1 space-y-1">
                                    {maintenance.assets.map(asset => (
                                        <li key={asset.assetId} className="text-gray-800">{asset.assetName} ({asset.assetId})</li>
                                    ))}
                                </ul>
                            </DetailItem>
                        )}
                        {maintenance.workTypes && maintenance.workTypes.length > 0 && (
                             <div>
                                <DetailItem label="Lingkup Pekerjaan yang Dilakukan">
                                    <ul className="list-disc list-inside mt-1 space-y-1">
                                        {maintenance.workTypes.map(wt => (
                                            <li key={wt} className="text-gray-800">{wt}</li>
                                        ))}
                                    </ul>
                                </DetailItem>
                            </div>
                        )}
                        <div>
                            <DetailItem label="Laporan Masalah & Diagnosa"><p className="p-2 bg-gray-50 border rounded-md">{maintenance.problemDescription}</p></DetailItem>
                        </div>
                        <div>
                            <DetailItem label="Catatan Tindakan & Solusi"><p className="p-2 bg-gray-50 border rounded-md">{maintenance.actionsTaken}</p></DetailItem>
                        </div>
                     </div>
                </section>

                {maintenance.materialsUsed && maintenance.materialsUsed.length > 0 && (
                    <section className="mt-8 pt-6 border-t">
                        <h4 className="font-semibold text-gray-800 border-b pb-1 mb-4">Material yang Digunakan</h4>
                        <div className="overflow-x-auto border rounded-lg">
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="p-3 font-semibold text-left text-gray-600">Nama Material</th>
                                        <th className="p-3 font-semibold text-left text-gray-600">Brand</th>
                                        <th className="p-3 font-semibold text-center text-gray-600">Jumlah</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {maintenance.materialsUsed.map((material, index) => (
                                        <tr key={index}>
                                            <td className="p-3 text-gray-800">{material.itemName}</td>
                                            <td className="p-3 text-gray-600">{material.brand}</td>
                                            <td className="p-3 text-center font-medium text-gray-800">{material.quantity}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {maintenance.replacements && maintenance.replacements.length > 0 && (
                    <section className="mt-8 pt-6 border-t">
                        <h4 className="font-semibold text-gray-800 border-b pb-1 mb-4">Detail Penggantian Perangkat</h4>
                        <div className="overflow-x-auto border rounded-lg">
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="p-3 font-semibold text-left text-gray-600">Aset Ditarik</th>
                                        <th className="p-3 font-semibold text-left text-gray-600">Kondisi Ditarik</th>
                                        <th className="p-3 font-semibold text-left text-gray-600">Aset Pengganti</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {maintenance.replacements.map((rep, index) => {
                                        const oldAsset = assets.find(a => a.id === rep.oldAssetId);
                                        const newAsset = assets.find(a => a.id === rep.newAssetId);
                                        return (
                                            <tr key={index}>
                                                <td className="p-3">
                                                    <p className="font-semibold text-gray-800">{oldAsset?.name}</p>
                                                    <p className="text-xs font-mono text-gray-500">{oldAsset?.id}</p>
                                                </td>
                                                <td className="p-3 font-semibold text-red-700">{rep.retrievedAssetCondition}</td>
                                                <td className="p-3">
                                                    <p className="font-semibold text-gray-800">{newAsset?.name}</p>
                                                    <p className="text-xs font-mono text-gray-500">{newAsset?.id}</p>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                <section className="pt-10 mt-10 border-t">
                    <div className="grid grid-cols-2 text-center text-sm">
                        <div>
                            <p className="font-semibold text-gray-600">Teknisi,</p>
                            <div className="flex items-center justify-center mt-2 h-28"><SignatureStamp signerName={maintenance.technician} signatureDate={maintenance.maintenanceDate} /></div>
                            <p className="pt-1 mt-2 border-t border-gray-400">({maintenance.technician})</p>
                        </div>
                         <div>
                            <p className="font-semibold text-gray-600">Diselesaikan Oleh,</p>
                            <div className="flex items-center justify-center mt-2 h-28">
                                {maintenance.status === ItemStatus.COMPLETED && maintenance.completedBy ? (
                                    <ApprovalStamp approverName={maintenance.completedBy} approvalDate={maintenance.completionDate!} />
                                ) : (
                                    <span className="italic text-gray-400">Dalam Proses</span>
                                )}
                            </div>
                            <p className="pt-1 mt-2 border-t border-gray-400">({maintenance.completedBy || '.........................'})</p>
                        </div>
                    </div>
                </section>
            </div>
        </DetailPageLayout>
    );
};

export default MaintenanceDetailPage;
