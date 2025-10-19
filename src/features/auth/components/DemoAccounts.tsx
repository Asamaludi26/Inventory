import React, { useState } from 'react';
import { CopyIcon } from '../../../components/icons/CopyIcon';
import { CheckIcon } from '../../../components/icons/CheckIcon';
import { useNotification } from '../../../providers/NotificationProvider';

export const DemoAccounts: React.FC = () => {
    const addNotification = useNotification();
    const [copiedItem, setCopiedItem] = useState<string | null>(null);

    const handleCopy = (text: string, identifier: string) => {
        navigator.clipboard.writeText(text).then(() => {
            addNotification('Berhasil disalin ke clipboard!', 'success');
            setCopiedItem(identifier);
            setTimeout(() => setCopiedItem(null), 1500);
        }, () => {
            addNotification('Gagal menyalin.', 'error');
        });
    };

    const demoUsers = [
        { role: 'Super Admin', email: 'john.doe@triniti.com', password: 'password123' },
        { role: 'Admin', email: 'alice.johnson@triniti.com', password: 'password123' },
        { role: 'Manager', email: 'manager.noc@triniti.com', password: 'password123' },
        { role: 'Staff', email: 'citra.lestari0@triniti.com', password: 'password123' },
    ];

    const getRoleClass = (role: string) => {
        switch(role) {
            case 'Super Admin': return 'bg-purple-100 text-purple-800';
            case 'Admin': return 'bg-info-light text-info-text';
            case 'Manager': return 'bg-sky-100 text-sky-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    return (
        <div className="space-y-4">
            <p className="text-sm text-gray-600">
                Gunakan akun di bawah ini untuk masuk dan mencoba aplikasi dengan hak akses yang berbeda.
            </p>
            {demoUsers.map(user => (
                <div key={user.email} className="p-4 bg-gray-50/70 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold text-gray-800">{user.role}</h3>
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getRoleClass(user.role)}`}>
                            {user.role}
                        </span>
                    </div>
                    <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Email: <span className="font-mono text-gray-800">{user.email}</span></span>
                             <button onClick={() => handleCopy(user.email, `${user.role}-email`)} className="p-1.5 text-gray-500 rounded-md hover:bg-gray-100 hover:text-tm-primary">
                                {copiedItem === `${user.role}-email` ? <CheckIcon className="w-4 h-4 text-success" /> : <CopyIcon className="w-4 h-4" />}
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Password: <span className="font-mono text-gray-800">{user.password}</span></span>
                            <button onClick={() => handleCopy(user.password, `${user.role}-pass`)} className="p-1.5 text-gray-500 rounded-md hover:bg-gray-100 hover:text-tm-primary">
                                {copiedItem === `${user.role}-pass` ? <CheckIcon className="w-4 h-4 text-success" /> : <CopyIcon className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};