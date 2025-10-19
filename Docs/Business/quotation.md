
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
            line-height: 1.7;
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
            display: flex;
            flex-direction: column;
            page-break-before: always;
        }
        .container:first-of-type {
            page-break-before: auto;
        }
        .title-page {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            min-height: 10.5in;
            border: none;
            box-shadow: none;
            padding: 0;
            page-break-after: always;
        }
        .title-page .main-title { font-family: 'Inter', sans-serif; font-size: 34pt; color: #111827; font-weight: 800; letter-spacing: -1.5px; margin-bottom: 0.2em; }
        .title-page .subtitle { font-size: 22pt; color: #1D4ED8; font-weight: 300; margin-bottom: 4em; }
        .title-page .client-name { font-size: 16pt; color: #374151; font-weight: 500; }
        .title-page .meta-info { position: absolute; bottom: 50px; font-size: 10pt; color: #6B7280; }
        
        h1, h2, h3, h4 {
            color: #111827;
            font-weight: 700;
            margin-top: 1.5em;
            margin-bottom: 0.8em;
            scroll-margin-top: 20px;
        }
        h1 { font-size: 26pt; text-align: center; margin-top: 0; color: #1D4ED8; letter-spacing: -0.5px; }
        h2 { font-size: 18pt; border-bottom: 2px solid #E5E7EB; padding-bottom: 10px; letter-spacing: -0.5px;}
        h3 { font-size: 15pt; color: #1D4ED8; margin-top: 2.2em; }
        h4 { font-size: 13pt; font-weight: 600; }
        p { font-size: 11.5pt; }
        hr { border: 0; border-top: 1px solid #E5E7EB; margin: 2.5em 0; }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            margin-bottom: 20px;
            font-size: 11pt;
        }
        th, td {
            border: 1px solid #D1D5DB;
            padding: 14px 16px;
            text-align: left;
            vertical-align: top;
        }
        th {
            background-color: #F9FAFB;
            font-weight: 600;
            color: #111827;
        }
        tbody tr:nth-child(even) {
            background-color: #F9FAFB;
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
            border: 1px solid #E5E7EB;
            border-radius: 8px;
            padding: 25px;
            margin-bottom: 30px;
            background-color: #FFFFFF;
            position: relative;
            overflow: hidden;
            transition: box-shadow 0.3s ease, transform 0.3s ease;
        }
        .option-box:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.07);
        }
        .option-box h3 {
            margin-top: 0;
            background-color: #F9FAFB;
            color: #374151;
            padding: 10px 15px;
            margin: -25px -25px 25px -25px;
            border-bottom: 1px solid #E5E7EB;
            font-size: 15pt;
        }
        .recommended-badge {
            position: absolute;
            top: 20px;
            right: -45px;
            background-color: #1D4ED8;
            color: white;
            padding: 6px 40px;
            font-size: 9pt;
            font-weight: 700;
            transform: rotate(45deg);
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .trial-box {
            border: 2px dashed #1D4ED8;
            background-color: #EFF6FF;
            padding: 25px;
            text-align: center;
            border-radius: 8px;
            margin: 30px 0;
        }
        .trial-box h3 {
            color: #1D4ED8;
            margin-top: 0;
        }
        .trial-box p { font-size: 11.5pt; color: #1E40AF; }
        .next-steps ol { list-style-type: none; counter-reset: step-counter; padding-left: 0; }
        .next-steps li {
            counter-increment: step-counter;
            display: flex;
            align-items: flex-start;
            margin-bottom: 15px;
            padding-left: 0;
        }
        .next-steps li::before {
            content: counter(step-counter);
            background: #DBEAFE;
            color: #1D4ED8;
            font-weight: 700;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            flex-shrink: 0;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            margin-top: 2px;
        }
        .signature-block {
            margin-top: auto;
            padding-top: 60px;
        }
        .signature-block .line {
            border-top: 1px solid #111827;
            width: 250px;
            margin-top: 70px;
        }
        .challenge-box {
            border: 1px solid #E5E7EB; border-radius: 8px; padding: 20px;
            display: flex; align-items: flex-start; gap: 15px;
        }
        .challenge-box svg { flex-shrink: 0; color: #F59E0B; } /* Amber-500 */
        .feature-icon { width: 32px; height: 32px; color: #1D4ED8; }

        /* Timeline */
        .timeline { border-left: 3px solid #DBEAFE; padding-left: 30px; position: relative; }
        .timeline-item { margin-bottom: 30px; position: relative; }
        .timeline-item::before {
            content: '';
            position: absolute;
            left: -38px;
            top: 5px;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background-color: #1D4ED8;
            border: 3px solid #DBEAFE;
        }
    </style>
</head>
<body>
    <div class="container title-page">
        <svg class="w-24 h-24 text-blue-700" width="100" height="100" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M14 2V8H20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 18L12 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M10 16L12 18L14 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>

        <h1 class="main-title">PROPOSAL PENGEMBANGAN APLIKASI INVENTORI ASET</h1>
        <h2 class="subtitle">Solusi Digital untuk Manajemen Aset Terpusat & Efisien</h2>
        <h3 class="client-name">PT. TRINITI MEDIA INDONESIA</h3>
        <div class="meta-info">
            Disusun oleh: Angga Samuludi Septiawan | No. Penawaran: Q-INV/AS/VIII/2024/002 | Tanggal: 08 Agustus 2024
        </div>
    </div>

    <div class="container">
        <div class="header-section">
            <div class="client-info">
                <div class="logo">
                     <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="#1D4ED8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M14 2V8H20" stroke="#1D4ED8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M12 18L12 12" stroke="#1D4ED8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M10 16L12 18L14 16" stroke="#1D4ED8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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
                Full-Stack Developer & System Analyst<br>
                <a href="mailto:a.samaludi@gmail.com" style="color: #1D4ED8; text-decoration: none;">a.samaludi@gmail.com</a><br>
                0812-8978-9568
            </div>
        </div>

        <h2>Ringkasan Eksekutif</h2>
        <p>Proposal ini merinci penawaran pengembangan <b>Aplikasi Inventori Aset</b>—sebuah solusi digital terpusat yang dirancang untuk mentransformasi cara PT. Triniti Media Indonesia mengelola aset. Dengan mendigitalkan seluruh siklus hidup aset, mulai dari permintaan hingga penghapusan, aplikasi ini secara langsung menjawab tantangan operasional terkait **efisiensi, visibilitas, dan akuntabilitas**. Tujuannya adalah untuk secara signifikan <b>mengurangi risiko kehilangan aset, mempercepat alur kerja, dan menyediakan data akurat</b> untuk pengambilan keputusan strategis. Penawaran ini bersifat <b>jual putus (outright sale)</b>, memberikan kepemilikan penuh atas kode sumber (*source code*) sebagai investasi jangka panjang yang dapat dikembangkan seiring pertumbuhan bisnis. Kami menawarkan struktur investasi yang fleksibel dan <b>uji coba gratis selama 7 hari</b> untuk membuktikan nilai nyata solusi ini bagi perusahaan Anda.</p>
        
        <h2>Tantangan Bisnis Anda</h2>
        <p>Kami memahami bahwa seiring pertumbuhan perusahaan, pengelolaan aset secara manual menimbulkan berbagai tantangan yang dapat menghambat produktivitas dan meningkatkan risiko operasional. Solusi ini dirancang untuk mengatasi masalah-masalah berikut:</p>
        <div class="challenge-box" style="margin-top: 20px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.25 10.25v-.5a5-5 0 10-10 0v.5m-2.5 3.5h15l-1.55 7.75a2 2 0 01-1.95 1.5H8.25a2 2 0 01-1.95-1.5L4.75 13.75z"/>
            </svg>
            <div>
                <h4>Proses Manual yang Lambat & Rentan Error</h4>
                <p style="font-size:10pt;">Alur kerja berbasis spreadsheet dan formulir fisik memakan waktu, sulit dilacak, dan rentan terhadap kesalahan manusia (*human error*), menyebabkan keterlambatan dalam pengadaan dan distribusi aset.</p>
            </div>
        </div>
        <div class="challenge-box" style="margin-top: 20px;">
             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.25 6.75l-10.5 10.5m0-10.5l10.5 10.5"/>
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 21.25a9.25 9.25 0 100-18.5 9.25 9.25 0 000 18.5z"/>
            </svg>
            <div>
                <h4>Kurangnya Visibilitas & Akuntabilitas</h4>
                <p style="font-size:10pt;">Sulit untuk mengetahui secara *real-time* di mana sebuah aset berada, siapa yang bertanggung jawab, dan bagaimana riwayat penggunaannya. Hal ini melemahkan akuntabilitas dan mempersulit audit.</p>
            </div>
        </div>

        <h2>Solusi Strategis: Aplikasi Inventori Aset</h2>
        <p>Aplikasi ini menyediakan platform terpusat untuk memberikan kontrol penuh dan visibilitas *real-time* atas seluruh aset perusahaan. Setiap modul dirancang untuk menyederhanakan alur kerja, meningkatkan akuntabilitas, dan memberdayakan tim Anda dengan data yang akurat.</p>
        
        <table>
            <thead>
                <tr>
                    <th style="width: 5%;"></th>
                    <th style="width: 25%;">MODUL</th>
                    <th>DETAIL MANFAAT & FUNGSI</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><svg class="feature-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.75 5.75h14.5m-14.5 6h14.5m-14.5 6h14.5m-11.5-16v14m-3-10v8m9-11v5"/></svg></td>
                    <td style="vertical-align: middle;"><b>Dashboard Analitis</b></td>
                    <td>
                        <b>Pengambilan Keputusan Cepat:</b> Visualisasikan kesehatan inventori secara <i>real-time</i>. Dashboard menyediakan ringkasan statistik, panel tugas mendesak, dan log aktivitas terbaru untuk pemantauan operasional.
                        <h4 style="margin-top:10px; margin-bottom: 5px;">Dampak Bisnis:</h4>
                        <ul style="font-size: 10pt; margin-top:0;">
                            <li>Identifikasi cepat masalah operasional (misal: stok menipis).</li>
                            <li>Tingkatkan kecepatan respon terhadap permintaan baru.</li>
                        </ul>
                    </td>
                </tr>
                <tr>
                    <td><svg class="feature-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.75 8.75a2 2 0 012-2h10.5a2 2 0 012 2v6.5a2 2 0 01-2 2H6.75a2 2 0 01-2-2v-6.5zm.5 2.5h13.5m-12.5-4v-1.5a1 1 0 011-1h1a1 1 0 011 1V7.25m5 0v-1.5a1 1 0 011-1h1a1 1 0 011 1V7.25"/></svg></td>
                    <td style="vertical-align: middle;"><b>Manajemen Aset End-to-End</b></td>
                    <td>
                        <b>Siklus Hidup Aset Terpusat:</b> Kelola seluruh alur kerja dari satu tempat: <b>Request</b>, <b>Pencatatan</b>, <b>Stok</b>, <b>Handover</b> internal, hingga <b>Dismantle</b> dari pelanggan.
                        <h4 style="margin-top:10px; margin-bottom: 5px;">Dampak Bisnis:</h4>
                        <ul style="font-size: 10pt; margin-top:0;">
                            <li>Mengurangi risiko kehilangan aset dengan pelacakan yang jelas.</li>
                            <li>Mempercepat siklus pengadaan dan distribusi aset.</li>
                        </ul>
                    </td>
                </tr>
                <tr>
                    <td><svg class="feature-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5.75 8.75c0-1.1046.8954-2 2-2h8.5c1.1046 0 2 .8954 2 2v6.5c0 1.1046-.8954 2-2 2h-8.5c-1.1046 0-2-.8954-2-2v-6.5z"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8.75 6.75v-.5a3.25 3.25 0 116.5 0v.5m-8.5 6h10.5"/></svg></td>
                    <td style="vertical-align: middle;"><b>Manajemen Pelanggan & Pengguna</b></td>
                    <td>
                        <b>Kontrol Akses Berlapis:</b> Database pelanggan terpusat dengan riwayat aset, serta manajemen akun pengguna dengan hak akses berbasis peran (<i>Role-Based Access Control</i>).
                        <h4 style="margin-top:10px; margin-bottom: 5px;">Dampak Bisnis:</h4>
                        <ul style="font-size: 10pt; margin-top:0;">
                            <li>Meningkatkan keamanan data dengan membatasi akses sesuai peran.</li>
                            <li>Memperkuat akuntabilitas pengguna melalui jejak digital.</li>
                        </ul>
                    </td>
                </tr>
                 <tr>
                    <td><svg class="feature-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.75L15.25 8 12 11.25 8.75 8 12 4.75zM8 12l3.25 3.25L14.5 12 11.25 8.75 8 12zM4.75 8L8 11.25 4.75 14.5 1.5 11.25 4.75 8zM16 8l3.25 3.25L16 14.5 12.75 11.25 16 8zM8.75 16L12 19.25 15.25 16 12 12.75 8.75 16z"/></svg></td>
                    <td style="vertical-align: middle;"><b>Pengaturan Dinamis</b></td>
                    <td>
                        <b>Adaptasi Cepat Tanpa Koding:</b> Kelola secara mandiri <b>Kategori, Tipe, dan Model Standar Aset</b>. Sistem dapat beradaptasi dengan jenis aset baru di masa depan.
                        <h4 style="margin-top:10px; margin-bottom: 5px;">Dampak Bisnis:</h4>
                        <ul style="font-size: 10pt; margin-top:0;">
                            <li>Menghemat biaya pengembangan di masa depan saat ada aset baru.</li>
                            <li>Memberikan fleksibilitas jangka panjang bagi operasional.</li>
                        </ul>
                    </td>
                </tr>
                <tr>
                    <td><svg class="feature-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.75 12c0-4.002 3.248-7.25 7.25-7.25s7.25 3.248 7.25 7.25-3.248 7.25-7.25 7.25-7.25-3.248-7.25-7.25zm5.5-2.25l2.5 4.5 2.5-2.5"/></svg></td>
                    <td style="vertical-align: middle;"><b>Fitur Produktivitas & Efisiensi</b></td>
                    <td>
                        <b>Mempercepat Alur Kerja Harian:</b> Pencarian cerdas, filter data, <b>Ekspor ke CSV</b> untuk pelaporan, <b>Aksi Massal</b>, serta <b>pemindai Kode QR/Barcode</b> untuk identifikasi aset instan.
                         <h4 style="margin-top:10px; margin-bottom: 5px;">Dampak Bisnis:</h4>
                        <ul style="font-size: 10pt; margin-top:0;">
                            <li>Menghemat waktu admin secara signifikan melalui otomatisasi tugas.</li>
                            <li>Mempercepat proses audit dan inventarisasi fisik.</li>
                        </ul>
                    </td>
                </tr>
            </tbody>
        </table>

        <div class="trial-box">
            <h3>Coba Dulu, Baru Putuskan: Uji Coba Gratis 7 Hari</h3>
            <p>Kami percaya pada nilai solusi yang kami tawarkan. Oleh karena itu, kami menyediakan <b>akses penuh tanpa batas ke semua fitur aplikasi selama 7 hari, sepenuhnya gratis</b>. Rasakan sendiri bagaimana aplikasi ini dapat mentransformasi manajemen aset di perusahaan Anda, tanpa risiko dan tanpa komitmen pembelian.</p>
        </div>

        <h2>Struktur Investasi Strategis</h2>
        <p>Kami menawarkan dua paket jual putus yang dapat disesuaikan dengan skala kebutuhan dan anggaran Anda. Kedua paket memberikan Anda kepemilikan penuh atas kode sumber.</p>

        <div class="option-box" style="border-color: #1D4ED8; border-width: 2px;">
            <div class="recommended-badge">REKOMENDASI</div>
            <h3>PAKET PROFESIONAL</h3>
            <p><b>Ideal untuk:</b> Transformasi digital penuh dan perusahaan yang menginginkan kontrol, efisiensi, dan analitik maksimal di seluruh operasional asetnya.</p>
            
            <h4>Rincian Investasi:</h4>
            <table>
                <thead>
                    <tr>
                        <th style="width: 40%;">Fase Pengembangan</th>
                        <th style="width: 25%;">Estimasi Waktu</th>
                        <th style="text-align: right;">Investasi (Rp)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><b>Fase 1:</b> Analisis Kebutuhan & Desain Sistem (UI/UX)</td>
                        <td>1 Minggu</td>
                        <td style="text-align: right;">3.750.000</td>
                    </tr>
                    <tr>
                        <td><b>Fase 2:</b> Pengembangan Backend (API & Database)</td>
                        <td>4 Minggu</td>
                        <td style="text-align: right;">10.000.000</td>
                    </tr>
                     <tr>
                        <td><b>Fase 3:</b> Pengembangan Frontend (Antarmuka Pengguna)</td>
                        <td>3 Minggu</td>
                        <td style="text-align: right;">7.500.000</td>
                    </tr>
                    <tr>
                        <td><b>Fase 4:</b> Integrasi, Pengujian Sistem (QA), & Keamanan</td>
                        <td>1 Minggu</td>
                        <td style="text-align: right;">2.500.000</td>
                    </tr>
                     <tr>
                        <td><b>Fase 5:</b> Deployment, Pelatihan, & Dokumentasi</td>
                        <td>1 Minggu</td>
                        <td style="text-align: right;">1.250.000</td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <th colspan="2" style="text-align: left;">Total Estimasi Waktu Pengembangan</th>
                        <th style="text-align: right;">10 Minggu</th>
                    </tr>
                    <tr>
                        <th colspan="2" style="text-align: left; font-size: 13pt;">Total Investasi</th>
                        <th style="text-align: right; font-size: 15pt; color: #1D4ED8;">25.000.000</th>
                    </tr>
                </tfoot>
            </table>
            <p class="note" style="background-color: #DBEAFE; border-left-color: #1D4ED8; color: #1E40AF;">
                <b>Fitur Lengkap Termasuk:</b> Dashboard Analitis Lanjutan, Manajemen Pelanggan, Pengaturan Lanjutan, Fitur Produktivitas Super (Aksi Massal, Ekspor CSV, Input Massal), dan Pemindai Kode QR/Barcode.
            </p>
        </div>
        
        <div class="option-box">
            <h3>PAKET ESENSIAL</h3>
            <p><b>Ideal untuk:</b> Perusahaan yang ingin memulai digitalisasi manajemen aset dengan fokus pada fitur-fitur fundamental yang paling krusial untuk operasional harian.</p>
            
            <h4>Rincian Investasi:</h4>
            <table>
                <thead>
                    <tr>
                        <th style="width: 40%;">Fase Pengembangan</th>
                        <th style="width: 25%;">Estimasi Waktu</th>
                        <th style="text-align: right;">Investasi (Rp)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><b>Fase 1:</b> Desain & Pengembangan Sistem Inti (Backend & Frontend)</td>
                        <td>4 Minggu</td>
                        <td style="text-align: right;">11.200.000</td>
                    </tr>
                    <tr>
                        <td><b>Fase 2:</b> Pengujian Inti & Deployment</td>
                        <td>1 Minggu</td>
                        <td style="text-align: right;">2.800.000</td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <th colspan="2" style="text-align: left;">Total Estimasi Waktu Pengembangan</th>
                        <th style="text-align: right;">5 Minggu</th>
                    </tr>
                    <tr>
                        <th colspan="2" style="text-align: left; font-size: 13pt;">Total Investasi</th>
                        <th style="text-align: right; font-size: 15pt; color: #1D4ED8;">14.000.000</th>
                    </tr>
                </tfoot>
            </table>
            <p class="note">
                <b>Fitur yang Termasuk:</b> Dashboard Fundamental, Manajemen Aset Inti (Request, Catat, Stok, Handover, Dismantle), Manajemen Pengguna Dasar, Pencarian & Filter, serta Generasi & Cetak Kode QR.
            </p>
        </div>

        <h2>Proyeksi Alur & Waktu Pengerjaan (Paket Profesional)</h2>
        <p>Kami menerapkan pendekatan pengembangan yang terstruktur untuk memastikan kualitas dan ketepatan waktu. Berikut adalah proyeksi alur kerja untuk Paket Profesional:</p>
        <div class="timeline">
            <div class="timeline-item">
                <h4>Fase 1: Analisis & Desain (Minggu 1)</h4>
                <p style="font-size:10pt;">Workshop kebutuhan mendalam, finalisasi alur kerja, desain UI/UX, dan perancangan arsitektur sistem serta database.</p>
            </div>
            <div class="timeline-item">
                <h4>Fase 2: Pengembangan Backend (Minggu 2-5)</h4>
                <p style="font-size:10pt;">Pembangunan API, logika bisnis, skema database, serta implementasi sistem autentikasi dan otorisasi.</p>
            </div>
            <div class="timeline-item">
                <h4>Fase 3: Pengembangan Frontend (Minggu 6-8)</h4>
                <p style="font-size:10pt;">Implementasi antarmuka pengguna (UI) berdasarkan desain yang disetujui, integrasi dengan API backend, dan pembangunan fitur interaktif.</p>
            </div>
            <div class="timeline-item">
                <h4>Fase 4: Pengujian & Integrasi (Minggu 9)</h4>
                <p style="font-size:10pt;">Pengujian sistem menyeluruh (*Quality Assurance*), pengujian keamanan, perbaikan bug, dan memastikan semua modul bekerja secara harmonis.</p>
            </div>
            <div class="timeline-item">
                <h4>Fase 5: Deployment & Pelatihan (Minggu 10)</h4>
                <p style="font-size:10pt;">Deployment aplikasi ke server produksi, sesi pelatihan untuk pengguna, dan serah terima dokumentasi teknis serta kode sumber.</p>
            </div>
        </div>
        
        <h2>Komitmen Kami</h2>
        <p>Kami tidak hanya membangun perangkat lunak, kami membangun kemitraan. Komitmen kami adalah memberikan solusi berkualitas tinggi yang benar-benar menjawab kebutuhan bisnis Anda.</p>
        <ul>
            <li><b>Kualitas Terjamin:</b> Kami menerapkan standar koding modern, praktik terbaik keamanan, dan pengujian menyeluruh untuk memastikan aplikasi yang andal dan stabil.</li>
            <li><b>Transparansi Penuh:</b> Anda akan mendapatkan visibilitas penuh atas progres pengembangan melalui komunikasi yang teratur dan proses yang terdokumentasi dengan baik.</li>
            <li><b>Kemitraan Jangka Panjang:</b> Dengan penyerahan penuh kode sumber dan garansi teknis, kami memastikan investasi Anda aman dan siap untuk berkembang di masa depan.</li>
        </ul>

        <h2>Langkah Selanjutnya</h2>
        <p>Kami siap membantu Anda memulai transformasi digital manajemen aset. Berikut adalah langkah-langkah yang kami rekomendasikan:</p>
        <div class="next-steps">
            <ol>
                <li><b>Jadwalkan Sesi Diskusi & Demo:</b> Mari kita diskusikan lebih dalam mengenai kebutuhan spesifik Anda. Saya akan memandu Anda melalui demo aplikasi untuk menunjukkan bagaimana fitur-fitur kami dapat menyelesaikan tantangan operasional Anda.</li>
                <li><b>Mulai Uji Coba Gratis 7 Hari:</b> Setelah sesi demo, kami akan memberikan akses penuh ke aplikasi agar tim Anda dapat mencoba dan merasakan langsung manfaatnya tanpa risiko.</li>
                <li><b>Finalisasi Perjanjian:</b> Jika Anda puas dengan aplikasi selama masa uji coba, kita dapat melanjutkan ke tahap penandatanganan perjanjian kerja untuk memulai proyek pengembangan sesuai paket yang dipilih.</li>
            </ol>
        </div>


        <h2>Syarat & Ketentuan</h2>
        <ul style="font-size: 10pt; list-style-type: disc;">
            <li>Harga yang tertera belum termasuk PPN 11%.</li>
            <li>Biaya infrastruktur (server/cloud hosting, domain) menjadi tanggung jawab klien.</li>
            <li><b>Deliverables (Hasil yang Diterima):</b> Aplikasi web fungsional, seluruh kode sumber (frontend & backend), dokumentasi teknis, dan satu sesi pelatihan.</li>
            <li><b>Skema Pembayaran:</b> 50% uang muka saat penandatanganan kontrak, 50% pelunasan setelah serah terima aplikasi.</li>
            <li><b>Garansi:</b> Garansi perbaikan bug selama 3 (tiga) bulan setelah serah terima untuk semua fitur yang disepakati.</li>
            <li>Penambahan fitur di luar lingkup paket yang dipilih akan diatur dalam adendum terpisah.</li>
            <li><b>Pembayaran via Transfer:</b> Bank BCA, No. Rek: 391-022-4823 a.n. Angga Samuludi Septiawan.</li>
        </ul>

        <div class="signature-block">
            <p>Demikian proposal ini saya sampaikan. Saya sangat antusias untuk berdiskusi lebih lanjut dan menunjukkan bagaimana solusi ini dapat memberikan nilai nyata bagi PT. Triniti Media Indonesia. Atas perhatian dan kesempatan yang diberikan, saya ucapkan terima kasih.</p>
            <br>
            Hormat saya,
            <div class="line"></div>
            <b>Angga Samuludi Septiawan</b>
        </div>
    </div>
</body>
</html>