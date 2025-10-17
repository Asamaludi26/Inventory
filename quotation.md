<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Proposal Pengembangan Aplikasi Inventori Aset</title>
    <style>
        @import url('https://rsms.me/inter/inter.css');
        body {
            font-family: 'Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            background-color: #F3F4F6;
            color: #374151;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 8.5in;
            min-height: 11in;
            margin: auto;
            background-color: #FFFFFF;
            padding: 50px 60px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            border-radius: 8px;
            border-top: 8px solid #1D4ED8;
        }
        h1, h2, h3, h4 {
            color: #111827;
            font-weight: 700;
            margin-top: 1.5em;
            margin-bottom: 0.8em;
        }
        h1 { font-size: 24pt; text-align: center; margin-top: 0; color: #1D4ED8; }
        h2 { font-size: 16pt; border-bottom: 2px solid #E5E7EB; padding-bottom: 8px; }
        h3 { font-size: 14pt; color: #1D4ED8; }
        h4 { font-size: 12pt; font-weight: 600; }
        p { font-size: 11pt; }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            margin-bottom: 20px;
            font-size: 10pt;
        }
        th, td {
            border: 1px solid #D1D5DB;
            padding: 12px;
            text-align: left;
            vertical-align: top;
        }
        th {
            background-color: #F3F4F6;
            font-weight: 600;
            color: #111827;
            text-align: center;
        }
        .total-row td, .subtotal-row td {
            font-weight: 700;
            background-color: #F3F4F6;
        }
        .header-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 1px solid #E5E7EB;
        }
        .header-section .client-info { text-align: left; }
        .header-section .developer-info { text-align: right; }
        .header-section b { color: #111827; }
        .header-section .logo { display: flex; align-items: center; justify-content: flex-start; gap: 12px; }
        .header-section .logo-text { font-size: 18pt; font-weight: 700; color: #111827; }
        .header-section .logo-text span { font-weight: 300; opacity: 0.8; }
        ul { padding-left: 20px; margin-top: 5px; list-style-type: '✓  '; }
        li { margin-bottom: 8px; padding-left: 8px; }
        .note {
            font-size: 10pt;
            background-color: #F9FAFB;
            border-left: 4px solid #6B7280;
            padding: 15px;
            margin-top: 20px;
            border-radius: 4px;
        }
        .option-box {
            border: 2px solid #DBEAFE;
            border-radius: 8px;
            padding: 25px;
            margin-bottom: 30px;
            background-color: #F9FAFB;
        }
        .option-box h3 {
            margin-top: 0;
            background-color: #DBEAFE;
            color: #1E40AF;
            padding: 10px 15px;
            margin: -25px -25px 25px -25px;
            border-top-left-radius: 6px;
            border-top-right-radius: 6px;
            border-bottom: 2px solid #DBEAFE;
        }
        .signature-block {
            margin-top: 80px;
        }
        .signature-block .line {
            border-top: 1px solid #111827;
            width: 250px;
            margin-top: 70px;
        }
    </style>
</head>
<body>
    <div class="container">

        <div class="header-section">
            <div class="client-info">
                <div class="logo">
                    <svg width="40" height="40" fill="none" stroke="#1D4ED8" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.75 6.75h14.5"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.75v10.5"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 21.25a9.5 9.5 0 100-19 9.5 9.5 0 000 19z"/>
                    </svg>
                    <div class="logo-text">Triniti<span>Asset</span></div>
                </div>
                <p style="margin-top: 15px;">
                    <b>Kepada Yth,</b><br>
                    Pimpinan PT. Triniti Media Indonesia<br>
                    Di Tempat
                </p>
            </div>
            <div class="developer-info">
                <b>Angga Samuludi Septiawan</b><br>
                Full-Stack Developer<br>
                <a href="mailto:a.samaludi@gmail.com" style="color: #1D4ED8; text-decoration: none;">a.samaludi@gmail.com</a><br>
                0812-8978-9568
            </div>
        </div>

        <h1>PROPOSAL PENGEMBANGAN APLIKASI INVENTORI ASET</h1>
        <p style="text-align: center; margin-top: -1em; font-size: 11pt; color: #6B7280;">
            No. Penawaran: Q-INV/AS/VIII/2024/001 | Tanggal: 08 Agustus 2024
        </p>

        <h2>Ringkasan Eksekutif</h2>
        <p>Proposal ini merinci penawaran untuk pengembangan **Aplikasi Inventori Aset** dengan model **jual putus (outright sale)**. Solusi ini dirancang untuk memberikan PT. Triniti Media Indonesia sebuah sistem terpusat yang modern, aman, dan efisien untuk mengelola seluruh siklus hidup aset—mulai dari permintaan, pencatatan, serah terima, instalasi di pelanggan, hingga penarikan dan penghapusan. Dengan kepemilikan penuh atas kode sumber (*source code*), aplikasi ini menjadi investasi jangka panjang yang dapat disesuaikan dengan kebutuhan bisnis di masa depan tanpa biaya lisensi berkelanjutan.</p>

        <h2>Lingkup Proyek & Fitur Utama</h2>
        <p>Aplikasi yang dikembangkan akan mencakup fungsionalitas komprehensif yang terbagi dalam beberapa modul utama:</p>
        
        <table>
            <thead>
                <tr>
                    <th style="width: 30%;">MODUL</th>
                    <th>DETAIL FITUR & FUNGSI</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><b>Dashboard Analitis</b></td>
                    <td>
                        <ul>
                            <li>Ringkasan statistik dan visualisasi data aset secara real-time.</li>
                            <li>Panel tugas mendesak untuk persetujuan (approval) yang tertunda.</li>
                            <li>Log aktivitas terbaru untuk pemantauan sistem.</li>
                        </ul>
                    </td>
                </tr>
                <tr>
                    <td><b>Manajemen Aset (End-to-End)</b></td>
                    <td>
                        <ul>
                            <li><b>Request Aset:</b> Alur pengajuan dan persetujuan multi-level.</li>
                            <li><b>Pencatatan Aset:</b> Formulir pencatatan detail dengan dukungan input massal.</li>
                            <li><b>Stok Aset:</b> Tampilan agregat stok per tipe barang dengan notifikasi stok menipis.</li>
                            <li><b>Handover Internal:</b> Pencatatan serah terima aset antar staf/divisi.</li>
                            <li><b>Instalasi & Dismantle:</b> Manajemen aset yang terpasang di lokasi pelanggan.</li>
                        </ul>
                    </td>
                </tr>
                <tr>
                    <td><b>Manajemen Pelanggan & Pengguna</b></td>
                    <td>
                        <ul>
                            <li>Database pelanggan terpusat dengan riwayat aset terpasang.</li>
                            <li>Manajemen akun pengguna dan divisi dengan sistem hak akses berbasis peran (Role-Based Access Control).</li>
                        </ul>
                    </td>
                </tr>
                 <tr>
                    <td><b>Pengaturan & Konfigurasi</b></td>
                    <td>
                        <ul>
                            <li>Manajemen dinamis untuk Kategori, Tipe, dan Model Standar Aset.</li>
                            <li>Pengaturan hak akses divisi terhadap kategori aset tertentu.</li>
                        </ul>
                    </td>
                </tr>
                <tr>
                    <td><b>Fitur Teknis Lanjutan</b></td>
                    <td>
                        <ul>
                            <li>Fungsi pencarian & filter cerdas di setiap halaman.</li>
                            <li>Ekspor data ke format CSV untuk kebutuhan pelaporan.</li>
                            <li>Integrasi pemindai Kode QR untuk identifikasi aset via kamera.</li>
                            <li>Dukungan Aksi Massal (Bulk Actions) untuk efisiensi manajemen data.</li>
                        </ul>
                    </td>
                </tr>
            </tbody>
        </table>

        <h2>Opsi Investasi</h2>
        <p>Kami menawarkan dua opsi fleksibel yang dapat disesuaikan dengan kebutuhan dan strategi PT. Triniti Media Indonesia.</p>

        <div class="option-box">
            <h3>OPSI 1: PENGEMBANGAN PENUH (JUAL PUTUS)</h3>
            <p>Opsi ini memberikan kepemilikan penuh atas aplikasi (backend, frontend, dan database) beserta seluruh kode sumbernya. Ini adalah solusi komprehensif dan permanen untuk manajemen aset perusahaan.</p>
            
            <h4>Rincian Biaya Pengembangan</h4>
            <table>
                <thead>
                    <tr>
                        <th style="width: 5%;">NO</th>
                        <th>FASE PENGEMBANGAN</th>
                        <th style="width: 25%;">ESTIMASI WAKTU</th>
                        <th style="width: 25%;">INVESTASI (Rp)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="text-align: center;">1.</td>
                        <td><b>Analisis & Desain Sistem</b> (UI/UX & Arsitektur)</td>
                        <td style="text-align: center;">1 Minggu</td>
                        <td style="text-align: right;">3.000.000</td>
                    </tr>
                    <tr>
                        <td style="text-align: center;">2.</td>
                        <td><b>Pengembangan Backend</b> (API NestJS, Database PostgreSQL)</td>
                        <td style="text-align: center;">4 Minggu</td>
                        <td style="text-align: right;">10.000.000</td>
                    </tr>
                    <tr>
                        <td style="text-align: center;">3.</td>
                        <td><b>Integrasi Frontend</b> (React) dengan API</td>
                        <td style="text-align: center;">3 Minggu</td>
                        <td style="text-align: right;">7.000.000</td>
                    </tr>
                    <tr>
                        <td style="text-align: center;">4.</td>
                        <td><b>Pengujian Sistem</b> (Quality Assurance) & Keamanan</td>
                        <td style="text-align: center;">1 Minggu</td>
                        <td style="text-align: right;">4.000.000</td>
                    </tr>
                     <tr>
                        <td style="text-align: center;">5.</td>
                        <td><b>Deployment</b>, Pelatihan Pengguna & Dokumentasi</td>
                        <td style="text-align: center;">1 Minggu</td>
                        <td style="text-align: right;">2.500.000</td>
                    </tr>
                    <tr class="subtotal-row">
                        <td colspan="3" style="text-align: right;">Subtotal</td>
                        <td style="text-align: right;">26.500.000</td>
                    </tr>
                    <tr class="subtotal-row">
                        <td colspan="3" style="text-align: right; color: #16A34A;">Diskon Paket Pengembangan</td>
                        <td style="text-align: right; color: #16A34A;">- 1.500.000</td>
                    </tr>
                    <tr class="total-row">
                        <td colspan="3" style="text-align: right; font-size: 12pt;">TOTAL INVESTASI</td>
                        <td style="text-align: right; font-size: 12pt;">25.000.000</td>
                    </tr>
                </tbody>
            </table>

            <h4>Deliverables (Hasil yang Diterima):</h4>
            <ul>
                <li>Aplikasi web fungsional yang terpasang di server pilihan klien.</li>
                <li>Seluruh kode sumber (source code) untuk aplikasi frontend (React) dan backend (NestJS).</li>
                <li>Dokumentasi teknis arsitektur dan API.</li>
                <li>Satu sesi pelatihan untuk administrator sistem.</li>
            </ul>
        </div>
        
        <div class="option-box">
            <h3>OPSI 2: PROYEK UJI COBA (PROTOTYPE INTERAKTIF)</h3>
            <p>Opsi ini dirancang untuk evaluasi mendalam terhadap fungsionalitas dan antarmuka pengguna (UI/UX) sebelum investasi penuh. Kami akan menyediakan aplikasi frontend interaktif dengan data simulasi, termasuk sistem login berbasis peran untuk memberikan gambaran alur kerja yang nyata.</p>

            <table>
                <thead>
                    <tr>
                        <th>LINGKUP PEKERJAAN UJI COBA</th>
                        <th style="width: 25%;">ESTIMASI WAKTU</th>
                        <th style="width: 25%;">INVESTASI (Rp)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <b>Implementasi Frontend Fungsional & Sistem Login Simulasi</b>
                            <br>
                            <small>Menyediakan 3 akun demo (Super Admin, Admin, Staff) dengan pembatasan fitur sesuai peran untuk memberikan gambaran alur kerja nyata.</small>
                        </td>
                        <td style="text-align: center;">1 - 2 Minggu</td>
                        <td style="text-align: right;">4.500.000</td>
                    </tr>
                    <tr class="total-row">
                        <td colspan="2" style="text-align: right;">TOTAL INVESTASI PROYEK UJI COBA</td>
                        <td style="text-align: right;">4.500.000</td>
                    </tr>
                </tbody>
            </table>
            <p class="note" style="font-size: 10pt;">
                <b>Catatan Penting:</b> Proyek ini tidak termasuk backend permanen; data akan hilang saat sesi berakhir. Jika dilanjutkan ke Opsi 1, <strong>50% dari biaya uji coba (Rp 2.250.000)</strong> akan menjadi potongan harga dari total investasi pengembangan penuh.
            </p>
        </div>

        <div class="option-box">
            <h3>LAYANAN TAMBAHAN (OPSIONAL)</h3>
            <p>Untuk memastikan aplikasi berjalan optimal dan aman setelah masa garansi berakhir, kami menawarkan paket dukungan teknis dan pemeliharaan berkelanjutan.</p>
            <table>
                <thead>
                    <tr>
                        <th>LAYANAN</th>
                        <th>DESKRIPSI</th>
                        <th style="width: 25%;">INVESTASI (Rp)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="font-weight: 600;">Dukungan & Pemeliharaan<br><small style="font-weight: normal;">(Per Bulan)</small></td>
                        <td>
                            <ul style="margin: 0; padding-left: 20px; list-style-type: '✓  ';">
                                <li style="margin-bottom: 4px; padding-left: 4px;">Pemantauan server dan performa aplikasi.</li>
                                <li style="margin-bottom: 4px; padding-left: 4px;">Perbaikan bug minor yang ditemukan pasca-garansi.</li>
                                <li style="margin-bottom: 4px; padding-left: 4px;">Pembaruan keamanan rutin.</li>
                                <li style="margin-bottom: 0; padding-left: 4px;">Dukungan teknis prioritas (24-48 jam respon).</li>
                            </ul>
                        </td>
                        <td style="text-align: right; font-weight: 600;">1.500.000 / bulan</td>
                    </tr>
                </tbody>
            </table>
            <div class="note" style="background-color: #DBEAFE; border-left-color: #1D4ED8; color: #1E40AF;">
                <b>Catatan:</b> Layanan ini bersifat opsional dan ditagihkan setiap bulan, dimulai setelah masa garansi 3 bulan berakhir.
            </div>
        </div>

        <h2>Syarat & Ketentuan</h2>
        <ul style="font-size: 10pt; list-style-type: disc;">
            <li>Harga yang tertera belum termasuk PPN 11%.</li>
            <li>Biaya infrastruktur (server/cloud hosting, domain) menjadi tanggung jawab klien.</li>
            <li><b>Skema Pembayaran:</b> 50% uang muka saat penandatanganan kontrak, 50% pelunasan setelah serah terima aplikasi.</li>
            <li><b>Garansi:</b> Garansi perbaikan bug selama 3 (tiga) bulan setelah serah terima untuk semua fitur yang disepakati.</li>
            <li>Penambahan fitur di luar lingkup proposal ini akan diatur dalam adendum terpisah.</li>
            <li><b>Pembayaran via Transfer:</b> Bank BCA, No. Rek: 391-022-4823 a.n. Angga Samuludi Septiawan.</li>
        </ul>

        <p>Demikian proposal ini saya sampaikan. Saya siap untuk berdiskusi lebih lanjut mengenai detail teknis dan kebutuhan spesifik dari PT. Triniti Media Indonesia. Atas perhatian dan kesempatan yang diberikan, saya ucapkan terima kasih.</p>
        
        <div class="signature-block">
            Hormat saya,
            <div class="line"></div>
            <b>Angga Samuludi Septiawan</b>
        </div>
    </div>
</body>
</html>