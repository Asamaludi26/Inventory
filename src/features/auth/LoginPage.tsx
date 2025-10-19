import React, { useState, useEffect } from 'react';
import { TrinitiLogoIcon } from '../../components/icons/TrinitiLogoIcon';
import { SpinnerIcon } from '../../components/icons/SpinnerIcon';
import { User } from '../../types';
import Modal from '../../components/ui/Modal';
import { InfoIcon } from '../../components/icons/InfoIcon';
import { UsersIcon } from '../../components/icons/UsersIcon';
import { useNotification } from '../../providers/NotificationProvider';
import { DemoAccounts } from './components/DemoAccounts';

interface LoginPageProps {
    onLogin: (email: string, pass: string) => Promise<User>;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
    const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

    useEffect(() => {
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            setEmail(rememberedEmail);
            setRememberMe(true);
        }

        const hasSeenNotice = sessionStorage.getItem('hasSeenLoginNotice');
        if (!hasSeenNotice) {
            setIsNoticeModalOpen(true);
        }
    }, []);

    const handleCloseNoticeModal = () => {
        sessionStorage.setItem('hasSeenLoginNotice', 'true');
        setIsNoticeModalOpen(false);
    };

    const demoStartDate = new Date('2025-10-17T00:00:00Z'); // Jumat, 17 Oktober 2025
    const demoEndDate = new Date(demoStartDate);
    demoEndDate.setDate(demoStartDate.getDate() + 7);

    const formattedStartDate = new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(demoStartDate);

    const formattedEndDate = new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(demoEndDate);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email.trim() || !password.trim()) {
            setError('Email dan kata sandi harus diisi.');
            return;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Format email tidak valid.');
            return;
        }
        
        setIsLoading(true);

        if (rememberMe) {
            localStorage.setItem('rememberedEmail', email);
        } else {
            localStorage.removeItem('rememberedEmail');
        }

        try {
            await onLogin(email, password);
            // On success, parent component handles re-rendering.
        } catch (err: any) {
            const message = err.message || 'Gagal untuk login.';
            if (message.includes('not found') || message.includes('Invalid credentials')) {
                 setError('Email atau kata sandi yang Anda masukkan salah.');
            } else {
                 setError('Terjadi kesalahan pada server. Silakan coba lagi.');
            }
            setIsLoading(false);
        }
    };

    return (
        <>
            <Modal
                isOpen={isNoticeModalOpen}
                onClose={handleCloseNoticeModal}
                title="Pemberitahuan Penting: Versi Demo Aplikasi"
                size="md"
                hideDefaultCloseButton
                footerContent={
                    <button
                        onClick={handleCloseNoticeModal}
                        className="w-full px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-sm bg-tm-primary hover:bg-tm-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tm-accent"
                    >
                        Saya Mengerti
                    </button>
                }
            >
                <div className="space-y-4 text-sm text-gray-700">
                    <div className="flex items-start gap-3 p-3 text-blue-800 bg-blue-50/70 rounded-lg border border-blue-200/50">
                        <InfoIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <p>
                            Selamat datang di aplikasi Inventori Aset. Perlu kami sampaikan bahwa versi yang sedang Anda akses saat ini adalah <strong>purwarupa (prototype)</strong> yang ditujukan untuk keperluan demonstrasi.
                        </p>
                    </div>
                    <p>
                        Aplikasi ini masih dalam tahap pengembangan aktif. Fitur dan alur kerja yang ada saat ini memerlukan riset lebih lanjut serta penyempurnaan signifikan untuk dapat memenuhi standar operasional perusahaan secara penuh.
                    </p>
                    <p>
                        Link demo ini diserahkan pada hari <strong>{formattedStartDate}</strong>. Masa uji coba untuk versi demo ini akan berakhir <strong>7 hari</strong> setelahnya, yaitu pada tanggal <strong>{formattedEndDate}</strong>. Setelah tanggal tersebut, akses akan ditutup.
                    </p>
                    <p className="pt-2 font-semibold text-gray-800">
                        Terima kasih atas pengertian Anda. Silakan lanjutkan untuk menjelajahi fungsionalitas yang tersedia.
                    </p>
                </div>
            </Modal>
             <Modal
                isOpen={isDemoModalOpen}
                onClose={() => setIsDemoModalOpen(false)}
                title="Akun Uji Coba (Demo)"
                size="md"
            >
                <DemoAccounts />
            </Modal>
            <div className="flex items-center justify-center min-h-screen bg-tm-light px-4">
                <div className="w-full max-w-md">
                    <div className="flex flex-col items-center justify-center mb-8">
                        <TrinitiLogoIcon className="w-16 h-16 text-tm-primary" />
                        <h1 className="mt-4 text-3xl font-bold tracking-tight text-tm-dark">
                            Triniti<span className="font-light opacity-80">Asset</span>
                        </h1>
                        <p className="mt-1 text-gray-600">Sistem Manajemen Inventori Aset</p>
                    </div>

                    <div className="p-8 bg-white border border-gray-200/80 rounded-xl shadow-md animate-zoom-in">
                        <h2 className="text-xl font-semibold text-center text-gray-800">Selamat Datang</h2>
                        <p className="mt-1 text-sm text-center text-gray-500">Silakan masuk untuk melanjutkan</p>
                        
                        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Alamat Email
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full px-3 py-2 text-gray-900 placeholder-gray-400 bg-gray-50 border border-gray-300 rounded-lg shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-tm-accent focus:border-tm-accent sm:text-sm"
                                        placeholder="anda@triniti.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password"className="block text-sm font-medium text-gray-700">
                                    Kata Sandi
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full px-3 py-2 text-gray-900 placeholder-gray-400 bg-gray-50 border border-gray-300 rounded-lg shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-tm-accent focus:border-tm-accent sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <label htmlFor="remember-me" className="flex items-center cursor-pointer select-none group">
                                    <div className="relative">
                                        <input
                                            id="remember-me"
                                            name="remember-me"
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                        />
                                        <div className="block w-10 h-6 bg-gray-200 rounded-full transition-colors peer-checked:bg-tm-primary group-hover:bg-gray-300 peer-checked:group-hover:bg-tm-primary-hover peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-tm-accent"></div>
                                        <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-4"></div>
                                    </div>
                                    <span className="ml-3 text-sm text-gray-900">
                                        Ingat saya
                                    </span>
                                </label>

                                <div className="text-sm">
                                    <a href="#" className="font-medium text-tm-primary hover:text-tm-primary-hover">
                                        Lupa kata sandi?
                                    </a>
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 text-sm text-center text-red-700 bg-red-100 border-l-4 border-red-500 rounded-r-lg">
                                    {error}
                                </div>
                            )}

                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex items-center justify-center w-full px-4 py-3 text-sm font-semibold text-white transition-all duration-200 border border-transparent rounded-lg shadow-sm bg-tm-primary hover:bg-tm-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tm-accent disabled:bg-tm-primary/70 disabled:cursor-wait"
                                >
                                    {isLoading ? (
                                        <>
                                            <SpinnerIcon className="w-5 h-5 mr-2.5" />
                                            Memproses...
                                        </>
                                    ) : (
                                        'Masuk'
                                    )}
                                </button>
                            </div>
                        </form>
                        <div className="mt-6 text-center">
                            <button
                                onClick={() => setIsDemoModalOpen(true)}
                                className="inline-flex items-center gap-2 text-sm font-medium text-tm-secondary hover:text-tm-primary"
                            >
                                <UsersIcon className="w-4 h-4" />
                                Lihat Akun Demo
                            </button>
                        </div>
                    </div>
                    <p className="mt-8 text-xs text-center text-gray-500">
                        &copy; {new Date().getFullYear()} PT. Triniti Media Indonesia. All rights reserved.
                    </p>
                </div>
            </div>
        </>
    );
};

export default LoginPage;