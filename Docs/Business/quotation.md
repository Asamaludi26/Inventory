<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Proposal Strategis: Platform Manajemen Aset Digital v3.3</title>
    <!-- 
        PROPOSAL STRATEGIS PENGEMBANGAN PLATFORM MANAJEMEN ASET DIGITAL
        Versi: 3.3 (Finalisasi dengan Jaminan Risiko & Proses Aktivasi)
        Disusun oleh: Angga Samuludi Septiawan
        Peran: Business Analyst, Senior Lead Marketing, Fullstack Developer
        Target: PT. Triniti Media Indonesia
    -->
    <style>
      /* ====== Google Fonts & Global Reset ====== */
      @import url("https://rsms.me/inter/inter.css");

      :root {
        --primary-color: #1d4ed8; /* Blue-700 */
        --primary-light: #dbeafe; /* Blue-100 */
        --primary-dark: #1e3a8a; /* Blue-800 */
        --text-dark: #111827; /* Gray-900 */
        --text-normal: #374151; /* Gray-700 */
        --text-light: #6b7280; /* Gray-500 */
        --border-color: #d1d5db; /* Gray-300 */
        --background-light: #f9fafb; /* Gray-50 */
        --background-white: #ffffff;
        --success-color: #16a34a; /* Green-600 */
        --danger-color: #dc2626; /* Red-600 */
        --warning-color: #f59e0b; /* Amber-500 */
      }

      *,
      *::before,
      *::after {
        box-sizing: border-box;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      /* ====== Body & Page Layout ====== */
      body {
        font-family: "Inter", "Segoe UI", "Roboto", "Helvetica Neue", Arial,
          sans-serif;
        line-height: 1.75;
        background-color: #e5e7eb;
        color: var(--text-normal);
        margin: 0;
        padding: 2rem;
        font-size: 11pt;
      }

      .page {
        max-width: 8.5in;
        min-height: 11in;
        margin: 2rem auto;
        background-color: var(--background-white);
        padding: 50px 65px;
        box-shadow: 0 10px 35px rgba(0, 0, 0, 0.1);
        border-radius: 6px;
        border-top: 10px solid var(--primary-color);
        display: flex;
        flex-direction: column;
        page-break-before: always;
        position: relative;
        overflow: hidden;
      }
      .page:first-of-type {
        page-break-before: auto;
      }

      /* ====== Typography ====== */
      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        font-weight: 700;
        color: var(--text-dark);
        margin-top: 1.5em;
        margin-bottom: 0.7em;
        letter-spacing: -0.025em;
        scroll-margin-top: 30px;
      }
      h1 {
        font-size: 24pt;
        color: var(--primary-color);
        margin-top: 0;
      }
      h2 {
        font-size: 18pt;
        border-bottom: 2px solid var(--border-color);
        padding-bottom: 10px;
      }
      h3 {
        font-size: 15pt;
        color: var(--primary-dark);
        margin-top: 2em;
      }
      h4 {
        font-size: 12pt;
        font-weight: 600;
        color: var(--text-dark);
      }
      p {
        margin-bottom: 1.25em;
      }
      strong {
        font-weight: 600;
        color: var(--text-dark);
      }
      a {
        color: var(--primary-color);
        text-decoration: none;
        transition: color 0.2s ease;
        font-weight: 500;
      }
      a:hover {
        color: var(--primary-dark);
      }
      hr {
        border: 0;
        border-top: 1px solid #e5e7eb;
        margin: 3em 0;
      }
      ul {
        padding-left: 20px;
        list-style-type: none;
      }
      ul li {
        padding-left: 1.5em;
        position: relative;
        margin-bottom: 0.8em;
      }
      ul li::before {
        content: "✓";
        position: absolute;
        left: 0;
        color: var(--success-color);
        font-weight: 900;
      }
      .ul-numeric {
        list-style-type: decimal;
        padding-left: 20px;
      }
      .ul-numeric li::before {
        content: "";
      }

      /* ====== Cover Page Specifics ====== */
      .cover-page {
        justify-content: center;
        align-items: center;
        text-align: center;
        border-top: none;
        background: linear-gradient(
          to bottom,
          var(--primary-light),
          var(--background-white) 70%
        );
      }
      .cover-page .logo-placeholder {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        background-color: #e0e7ff;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 2rem;
      }
      .cover-page .main-title {
        font-size: 34pt;
        font-weight: 800;
        letter-spacing: -2px;
        line-height: 1.1;
        margin-bottom: 0.5rem;
        color: var(--text-dark);
      }
      .cover-page .subtitle {
        font-size: 22pt;
        color: var(--primary-color);
        font-weight: 300;
        margin-bottom: 3rem;
      }
      .cover-page .prepared-for {
        margin-bottom: auto;
      }
      .cover-page .prepared-for span {
        display: block;
        font-size: 10pt;
        color: var(--text-light);
        font-weight: 500;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        margin-bottom: 0.5rem;
      }
      .cover-page .prepared-for p {
        font-size: 16pt;
        color: var(--text-dark);
        font-weight: 600;
        margin: 0;
      }
      .cover-page .meta-info {
        width: 100%;
        text-align: center;
        padding-bottom: 1rem;
        margin-top: 3rem;
        font-size: 9pt;
        color: var(--text-light);
      }

      /* ====== Reusable Components ====== */
      .value-box {
        background-color: #eff6ff;
        border-left: 4px solid var(--primary-color);
        padding: 20px 25px;
        margin: 25px 0;
        border-radius: 0 6px 6px 0;
      }
      .value-box h4 {
        margin-top: 0;
        color: var(--primary-dark);
        font-size: 13pt;
      }
      .warning-box {
        background-color: #fffbeb;
        border-left: 4px solid var(--warning-color);
        padding: 20px 25px;
        margin: 25px 0;
        border-radius: 0 6px 6px 0;
      }
      .warning-box h4 {
        margin-top: 0;
        color: #b45309;
        font-size: 13pt;
      }

      .toc {
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 25px;
        background: var(--background-light);
      }
      .toc ol {
        list-style-type: decimal;
        padding-left: 25px;
      }
      .toc li {
        font-size: 11pt;
        color: var(--primary-color);
        font-weight: 500;
        padding-left: 10px;
      }
      .toc li::before {
        content: "";
      }
      .toc li a {
        display: block;
        padding: 4px 0;
      }

      .signature-block {
        margin-top: auto;
        padding-top: 60px;
      }
      .signature-line {
        border-top: 1.5px solid var(--text-dark);
        width: 280px;
        margin-top: 70px;
      }

      /* ====== Tables ====== */
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 25px 0;
        font-size: 10.5pt;
      }
      th,
      td {
        border: 1px solid var(--border-color);
        padding: 12px 14px;
        text-align: left;
        vertical-align: top;
      }
      th {
        background-color: var(--background-light);
        font-weight: 600;
        color: var(--text-dark);
        font-size: 11pt;
      }
      td small {
        color: var(--text-light);
        line-height: 1.5;
        font-size: 9.5pt;
      }

      .feature-comparison-table th,
      .feature-comparison-table td {
        text-align: center;
      }
      .feature-comparison-table td:first-child {
        text-align: left;
        font-weight: 500;
      }
      .category-row {
        background-color: #e5e7eb !important;
        font-weight: bold;
        color: var(--text-dark);
      }
      .check-icon {
        color: var(--success-color);
        font-weight: bold;
        font-size: 1.2em;
      }
      .cross-icon {
        color: var(--danger-color);
        opacity: 0.7;
        font-size: 1.2em;
      }

      .investment-table th:nth-child(2),
      .investment-table th:nth-child(3) {
        text-align: right;
      }
      .investment-table td:nth-child(2),
      .investment-table td:nth-child(3) {
        text-align: right;
        font-family: "Inter", monospace;
      }
      .investment-table tfoot td {
        font-weight: 700;
        background-color: var(--background-light);
        color: var(--text-dark);
      }

      /* ====== Investment Packages ====== */
      .package-container {
        display: flex;
        gap: 25px;
        margin-top: 25px;
        align-items: stretch;
      }
      .package {
        flex: 1;
        border: 1px solid var(--border-color);
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        position: relative;
        overflow: hidden;
      }
      .package:hover {
        transform: translateY(-6px);
        box-shadow: 0 12px 35px rgba(0, 0, 0, 0.08);
      }
      .package-header {
        padding: 20px 25px;
        border-bottom: 1px solid var(--border-color);
      }
      .package-header h3 {
        margin: 0;
        font-size: 17pt;
      }
      .package-header p {
        margin: 5px 0 0;
        font-size: 10pt;
        color: var(--text-light);
        line-height: 1.5;
      }
      .package-body {
        padding: 25px;
        flex-grow: 1;
      }
      .package-body ul {
        font-size: 10pt;
      }
      .package-footer {
        padding: 20px 25px;
        background: var(--background-light);
        border-top: 1px solid var(--border-color);
        text-align: center;
      }
      .package-price {
        font-size: 20pt;
        font-weight: 700;
        color: var(--primary-color);
        margin: 0;
      }
      .package-timeline {
        font-size: 9pt;
        color: var(--text-light);
        margin-top: 5px;
      }
      .package.recommended {
        border-width: 2px;
        border-color: var(--primary-color);
      }
      .recommended-ribbon {
        position: absolute;
        top: 22px;
        right: -38px;
        width: 160px;
        text-align: center;
        background-color: var(--primary-color);
        color: white;
        padding: 5px 0;
        font-size: 9pt;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        transform: rotate(45deg);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 1;
      }

      /* ====== Timeline ====== */
      .timeline {
        border-left: 3px solid var(--primary-light);
        margin-top: 30px;
      }
      .timeline-item {
        padding-left: 30px;
        margin-bottom: 30px;
        position: relative;
      }
      .timeline-item::before {
        content: "";
        position: absolute;
        left: -9.5px;
        top: 5px;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background-color: var(--primary-color);
        border: 4px solid var(--background-white);
      }
      .timeline-item.completed::before {
        background-color: var(--success-color);
      }
      .timeline-item h4 {
        margin-top: 0;
        font-size: 12pt;
      }
      .timeline-item p {
        font-size: 10pt;
        color: var(--text-light);
        margin-bottom: 0.5em;
      }
      .timeline-item .output-label {
        font-size: 9pt;
        font-weight: 600;
        color: var(--text-dark);
        display: block;
        margin-top: 0.8em;
        margin-bottom: 0.3em;
      }

      /* ====== Next Steps ====== */
      .next-steps-list {
        list-style-type: none;
        counter-reset: step-counter;
        padding-left: 0;
        margin-top: 30px;
      }
      .next-steps-list li {
        counter-increment: step-counter;
        display: flex;
        align-items: flex-start;
        margin-bottom: 20px;
        padding-left: 0;
      }
      .next-steps-list li::before {
        content: counter(step-counter);
        background: var(--primary-light);
        color: var(--primary-dark);
        font-weight: 700;
        border-radius: 50%;
        width: 36px;
        height: 36px;
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-right: 18px;
        font-size: 14pt;
      }
      .next-steps-list li div h4 {
        margin: 5px 0 5px;
      }
      .next-steps-list li div p {
        margin: 0;
        font-size: 10.5pt;
        color: var(--text-light);
      }

      /* ====== Appendix & Legal ====== */
      .appendix-section {
        margin-top: 25px;
      }
      .appendix-section h4 {
        border-bottom: 1px solid var(--border-color);
        padding-bottom: 8px;
        font-size: 12pt;
      }
      .appendix-section ul {
        list-style-type: disc;
        padding-left: 20px;
        font-size: 9.5pt;
      }
      .appendix-section ul li::before {
        content: "";
      }
    </style>
  </head>
  <body>
    <!-- =================================================================== -->
    <!--                       PAGE 1: COVER PAGE                            -->
    <!-- =================================================================== -->
    <div class="page cover-page">
      <div
        style="
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        "
      >
        <div class="logo-placeholder">
          <svg
            width="60"
            height="60"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style="color: var(--primary-color)"
          >
            <path
              d="M4.75 6.75h14.5M12 6.75v10.5M12 21.25a9.5 9.5 0 100-19 9.5 9.5 0 000 19z"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <h1 class="main-title">Proposal Kemitraan Strategis</h1>
        <h2 class="subtitle">Transformasi Manajemen Aset Digital</h2>
        <div class="prepared-for">
          <span>Dipersiapkan Secara Khusus Untuk</span>
          <p><strong>Manajemen PT. Triniti Media Indonesia</strong></p>
        </div>
      </div>
      <div class="meta-info">
        Disusun oleh: Angga Samuludi Septiawan | No. Penawaran:
        Q-INV/AS/X/2025/001<br />
        Tanggal Dokumen: 25 Oktober 2025 | Versi: 3.3 (Final)
      </div>
    </div>

    <!-- =================================================================== -->
    <!--                     PAGE 2: TABLE OF CONTENTS                       -->
    <!-- =================================================================== -->
    <div class="page toc-page">
      <h1>Daftar Isi</h1>
      <p>
        Dokumen ini menyajikan cetak biru untuk kemitraan strategis, menguraikan
        tantangan operasional, solusi yang diusulkan, nilai investasi, dan visi
        jangka panjang untuk keunggulan operasional PT. Triniti Media Indonesia.
      </p>
      <div class="toc">
        <ol>
          <li>
            <a href="#surat_pengantar"
              >Surat Pengantar: Undangan Kemitraan Strategis</a
            >
          </li>
          <li>
            <a href="#ringkasan_eksekutif"
              >Ringkasan Eksekutif: Visi & Proposisi Nilai</a
            >
          </li>
          <li>
            <a href="#analisis_masalah"
              >Analisis Masalah: Biaya Tersembunyi dari Proses Manual</a
            >
          </li>
          <li>
            <a href="#solusi_strategis"
              >Solusi Strategis: Platform Digital Terintegrasi</a
            >
          </li>
          <li>
            <a href="#detail_fitur"
              >Rincian Modul & Kebutuhan Pengguna yang Terjawab</a
            >
          </li>
          <li>
            <a href="#paket_investasi"
              >Paket Investasi & Perbandingan Komprehensif</a
            >
          </li>
          <li><a href="#jaminan_risiko">Jaminan & Mitigasi Risiko Anda</a></li>
          <li>
            <a href="#teknologi"
              >Jaminan Kualitas, Arsitektur, & Tumpukan Teknologi</a
            >
          </li>
          <li>
            <a href="#metodologi">Metodologi & Proyeksi Jadwal Implementasi</a>
          </li>
          <li>
            <a href="#kemitraan"
              >Kemitraan Jangka Panjang: Dukungan & Peta Jalan Produk</a
            >
          </li>
          <li>
            <a href="#tentang_kami">Mengapa Memilih Kami Sebagai Mitra Anda?</a>
          </li>
          <li>
            <a href="#langkah_selanjutnya"
              >Langkah Selanjutnya & Proses Aktivasi</a
            >
          </li>
          <li><a href="#lampiran">Lampiran: Syarat & Ketentuan Detail</a></li>
        </ol>
      </div>
    </div>

    <!-- =================================================================== -->
    <!--                      PAGE 3: COVER LETTER                           -->
    <!-- =================================================================== -->
    <div class="page" id="surat_pengantar">
      <h3 style="margin-top: 0; font-size: 16pt">
        Perihal: Undangan Kemitraan Strategis untuk Transformasi Manajemen Aset
        Digital
      </h3>
      <p>
        <strong>Kepada Yth,</strong><br />Bapak/Ibu Pimpinan PT. Triniti Media
        Indonesia
      </p>
      <p>Dengan hormat,</p>
      <p>
        Menindaklanjuti diskusi kita, proposal ini saya susun sebagai sebuah
        cetak biru—bukan sekadar penawaran—untuk mentransformasi operasional
        manajemen aset di PT. Triniti Media Indonesia. Kami memahami bahwa
        proses manual yang ada saat ini, meskipun berjalan, menyimpan
        <strong>biaya tersembunyi</strong> yang signifikan: jam kerja yang
        terbuang untuk rekonsiliasi, risiko finansial dari aset yang tidak
        terlacak, dan keputusan strategis yang tertunda karena data yang tidak
        akurat.
      </p>
      <p>
        Ini adalah <strong>gesekan operasional</strong> yang secara diam-diam
        menghambat profitabilitas dan agilitas perusahaan Anda. Oleh karena itu,
        kami tidak menawarkan sekadar perangkat lunak, melainkan sebuah
        <strong>kemitraan strategis</strong> untuk menghilangkan gesekan
        tersebut.
      </p>
      <p>
        Kami mengusulkan pembangunan
        <strong>Platform Manajemen Aset Digital</strong> yang dirancang khusus
        untuk alur kerja Anda. Solusi ini bukan biaya, melainkan
        <strong>investasi pada efisiensi</strong>, dengan model
        <strong>jual putus (outright ownership)</strong> yang akan menjadikannya
        aset intelektual berharga milik perusahaan Anda sepenuhnya. Platform ini
        akan memberikan visibilitas <strong>real-time</strong>, mengotomatisasi
        tugas repetitif, dan memberdayakan tim Anda dengan data yang akurat.
      </p>
      <p>
        Saya sangat antusias untuk mendemonstrasikan bagaimana kemitraan ini
        dapat membuka potensi efisiensi yang luar biasa dan memberikan
        keunggulan kompetitif bagi PT. Triniti Media Indonesia. Terima kasih
        atas waktu dan kesempatan yang diberikan.
      </p>
      <div class="signature-block">
        Hormat saya,
        <div class="signature-line"></div>
        <strong>Angga Samuludi Septiawan</strong><br />
        <a href="mailto:a.samaludi@gmail.com">a.samaludi@gmail.com</a> |
        0812-8978-9568
      </div>
    </div>

    <!-- =================================================================== -->
    <!--                    PAGE 4: EXECUTIVE SUMMARY                        -->
    <!-- =================================================================== -->
    <div class="page" id="ringkasan_eksekutif">
      <h2>1. Ringkasan Eksekutif: Visi & Proposisi Nilai</h2>
      <p>
        Proposal ini menguraikan penawaran untuk merancang, mengembangkan, dan
        mengimplementasikan sebuah
        <strong>Platform Manajemen Aset Digital</strong> yang dibuat khusus
        untuk PT. Triniti Media Indonesia, menggantikan proses manual berbasis
        spreadsheet dengan ekosistem digital terpusat yang efisien, transparan,
        dan dapat diskalakan.
      </p>
      <div class="value-box">
        <h4>Proposisi Nilai Inti (Core Value Proposition)</h4>
        <p>
          Investasi dalam platform ini diproyeksikan memberikan imbal hasil
          terukur dengan cara:
        </p>
        <ul>
          <li>
            <strong>Meningkatkan Efisiensi Operasional hingga 40%:</strong>
            Mengotomatisasi alur kerja dari permintaan hingga penghapusan,
            membebaskan waktu tim untuk fokus pada tugas bernilai tambah.
          </li>
          <li>
            <strong>Mengurangi Risiko Kehilangan Aset hingga 95%:</strong>
            Menyediakan jejak audit digital yang tak terbantahkan untuk setiap
            aset, meningkatkan akuntabilitas dan visibilitas secara drastis.
          </li>
          <li>
            <strong>Mempercepat Pengambilan Keputusan hingga 60%:</strong>
            Menyajikan data aset yang akurat dan
            <strong>real-time</strong> melalui dashboard analitis, memungkinkan
            perencanaan pengadaan yang proaktif dan berbasis data.
          </li>
        </ul>
      </div>
      <h4>Model Investasi & Kemitraan</h4>
      <p>
        Kami menawarkan model
        <strong>investasi jual putus (one-time purchase)</strong>, yang
        memberikan PT. Triniti Media Indonesia
        <strong>kepemilikan 100% atas kode sumber (source code)</strong>. Ini
        menghilangkan biaya lisensi berulang dan menjadikan platform ini aset
        intelektual milik perusahaan yang dapat dikembangkan lebih lanjut. Untuk
        memastikan keselarasan, kami menawarkan
        <strong>Program Pilot Gratis selama 7 hari</strong> sebelum komitmen
        finansial apa pun.
      </p>
    </div>

    <!-- =================================================================== -->
    <!--                     PAGE 5: PROBLEM ANALYSIS                        -->
    <!-- =================================================================== -->
    <div class="page" id="analisis_masalah">
      <h2>2. Analisis Masalah: Biaya Tersembunyi dari Proses Manual</h2>
      <p>
        Meskipun sistem manual saat ini mungkin tampak "cukup baik", analisis
        mendalam mengungkapkan adanya biaya peluang dan inefisiensi signifikan
        yang menghambat potensi pertumbuhan. Ini adalah
        <strong>pajak operasional</strong> yang dibayar setiap hari.
      </p>
      <div class="warning-box">
        <h4>Biaya Inaction (The Cost of Inaction)</h4>
        <p>Mempertahankan status quo membawa konsekuensi nyata:</p>
        <ul>
          <li>
            <strong>Kerugian Produktivitas:</strong> Diperkirakan
            <strong>10-15 jam kerja per minggu</strong> dihabiskan tim terkait
            untuk tugas administratif (pencarian data, rekonsiliasi, pelaporan
            manual) yang dapat diotomatisasi.
          </li>
          <li>
            <strong>Risiko Finansial:</strong> Tanpa pelacakan
            <strong>real-time</strong>, aset (terutama perangkat IT) berisiko
            tinggi hilang atau tidak terhitung, mengakibatkan kerugian langsung
            dan pembengkakan anggaran pengadaan.
          </li>
          <li>
            <strong>Hambatan Skalabilitas:</strong> Seiring pertumbuhan
            perusahaan, sistem manual akan menjadi semakin tidak terkendali,
            lambat, dan pada akhirnya menjadi penghambat ekspansi bisnis.
          </li>
          <li>
            <strong>Keputusan Reaktif:</strong> Ketergantungan pada data usang
            dari spreadsheet memaksa manajemen membuat keputusan pengadaan dan
            alokasi secara reaktif, bukan berdasarkan prediksi dan tren.
          </li>
        </ul>
      </div>
      <p>
        Solusi yang diusulkan secara langsung dirancang untuk menghilangkan
        biaya-biaya ini dan mengubah departemen operasional dari pusat biaya
        menjadi pendorong efisiensi strategis.
      </p>
    </div>

    <!-- =================================================================== -->
    <!--                 PAGE 6: STRATEGIC SOLUTION & FEATURES               -->
    <!-- =================================================================== -->
    <div class="page" id="solusi_strategis">
      <h2>3. Solusi Strategis: Platform Digital Terintegrasi</h2>
      <p>
        Kami mengusulkan platform terintegrasi yang mencakup seluruh siklus
        hidup aset dalam satu dasbor yang intuitif. Setiap modul dirancang untuk
        memecahkan masalah spesifik dan memberikan dampak bisnis terukur,
        selaras dengan kebutuhan yang telah dianalisis.
      </p>

      <h3 id="detail_fitur">
        4. Rincian Modul & Kebutuhan Pengguna yang Terjawab
      </h3>
      <p>
        Setiap fitur yang kami usulkan adalah jawaban langsung atas kebutuhan
        fungsional yang telah diidentifikasi dalam dokumen
        <strong>Product Requirements Document (PRD)</strong>.
      </p>
      <table>
        <thead>
          <tr>
            <th style="width: 25%">Modul / Fitur</th>
            <th>Hasil Bisnis yang Diharapkan</th>
            <th style="width: 35%">Kebutuhan Pengguna yang Terjawab</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Dashboard Analitis Terpusat</strong></td>
            <td>
              Mempercepat identifikasi masalah, meningkatkan visibilitas
              operasional, dan menjadi dasar pengambilan keputusan berbasis
              data.
            </td>
            <td>
              Manajemen memerlukan ringkasan data visual yang cepat untuk
              pengambilan keputusan strategis.
            </td>
          </tr>
          <tr>
            <td><strong>Manajemen Siklus Hidup Aset (End-to-End)</strong></td>
            <td>
              Menyediakan jejak audit digital lengkap (Permintaan, Pencatatan,
              Stok, Serah Terima, Penghapusan), menghilangkan ambiguitas, dan
              mengurangi kehilangan aset.
            </td>
            <td>
              Tim operasional perlu melacak setiap perpindahan aset secara
              digital (serah terima, penarikan, dll.) untuk akuntabilitas.
            </td>
          </tr>
          <tr>
            <td><strong>Manajemen Pengguna & Kontrol Akses (RBAC)</strong></td>
            <td>
              Meningkatkan keamanan data, memastikan akuntabilitas, dan
              menyederhanakan alur kerja sesuai peran (Staff, Manager, Admin,
              Super Admin).
            </td>
            <td>
              Sistem harus mampu membatasi akses dan fitur sesuai dengan peran
              dan tanggung jawab masing-masing pengguna demi keamanan.
            </td>
          </tr>
          <tr>
            <td><strong>Fitur Produktivitas Super</strong></td>
            <td>
              Menghemat waktu admin secara signifikan melalui Aksi Massal,
              Ekspor ke CSV, pencarian cerdas, dan filter dinamis.
            </td>
            <td>
              Admin memerlukan cara cepat untuk mengelola data dalam jumlah
              besar dan membuat laporan ad-hoc.
            </td>
          </tr>
          <tr>
            <td><strong>Generasi & Pemindaian Kode QR/Barcode</strong></td>
            <td>
              Mempercepat proses inventarisasi fisik hingga 70%, mengurangi
              kesalahan input data, dan memudahkan pelacakan aset di lapangan.
            </td>
            <td>
              Tim lapangan membutuhkan cara instan untuk mengidentifikasi dan
              mengaudit aset fisik tanpa input manual.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- =================================================================== -->
    <!--                   PAGE 7: INVESTMENT PACKAGES                       -->
    <!-- =================================================================== -->
    <div class="page" id="paket_investasi">
      <h2>5. Paket Investasi & Perbandingan Komprehensif</h2>
      <p>
        Kami menawarkan model <strong>kepemilikan penuh (jual putus)</strong>.
        Ini adalah investasi satu kali untuk sebuah
        <strong>aset digital</strong> yang akan menjadi milik PT. Triniti Media
        Indonesia selamanya. Berbeda dengan model berlangganan (SaaS),
        pendekatan ini memberikan keuntungan strategis:
      </p>
      <ul>
        <li>
          <strong>Tanpa Biaya Berulang:</strong> Hilangkan biaya lisensi bulanan
          atau tahunan yang tidak terduga.
        </li>
        <li>
          <strong>Kontrol Penuh:</strong> Anda memiliki kebebasan penuh untuk
          memodifikasi, mengintegrasikan, dan mengembangkan platform sesuai
          kebutuhan bisnis di masa depan.
        </li>
        <li>
          <strong>Keamanan Data Maksimal:</strong> Data dan aplikasi berada
          sepenuhnya di bawah kendali infrastruktur Anda.
        </li>
      </ul>

      <div class="package-container">
        <div class="package">
          <div class="package-header">
            <h3>UI/UX Blueprint</h3>
            <p>
              Fondasi visual & antarmuka interaktif yang siap dikembangkan lebih
              lanjut.
            </p>
          </div>
          <div class="package-body">
            <h5>Fokus Utama & Hasil:</h5>
            <ul>
              <li>Mendapatkan desain antarmuka profesional yang sudah jadi.</li>
              <li>Aset kode sumber (source code) frontend yang modern.</li>
              <li>
                Menjadi dasar (Fase 1) untuk pengembangan backend di masa depan.
              </li>
            </ul>
          </div>
          <div class="package-footer">
            <p class="package-price">Rp 8.500.000</p>
            <p class="package-timeline">
              Waktu Penyerahan: <strong>2 Minggu</strong>
            </p>
          </div>
        </div>
        <div class="package">
          <div class="package-header">
            <h3>Growth Foundation</h3>
            <p>
              Solusi esensial untuk mendigitalkan dan memusatkan operasional
              inti Anda.
            </p>
          </div>
          <div class="package-body">
            <h5>Fokus Utama & Hasil:</h5>
            <ul>
              <li>Transformasi dari spreadsheet ke sistem terpusat.</li>
              <li>Pelacakan aset dasar (pencatatan, status, lokasi).</li>
              <li>Alur kerja permintaan dan persetujuan yang terstruktur.</li>
              <li>Fondasi yang solid untuk skalabilitas di masa depan.</li>
            </ul>
          </div>
          <div class="package-footer">
            <p class="package-price">Rp 14.000.000</p>
            <p class="package-timeline">
              Estimasi Pengerjaan: <strong>5 Minggu</strong>
            </p>
          </div>
        </div>
        <div class="package recommended">
          <div class="recommended-ribbon">Direkomendasikan</div>
          <div class="package-header">
            <h3><strong>Enterprise Accelerator</strong></h3>
            <p>
              Solusi komprehensif yang dirancang untuk efisiensi maksimal dan
              keunggulan kompetitif.
            </p>
          </div>
          <div class="package-body">
            <h5>Fokus Utama & Hasil:</h5>
            <ul>
              <li>Otomatisasi penuh siklus hidup aset (end-to-end).</li>
              <li>
                Peningkatan produktivitas drastis dengan fitur-fitur canggih.
              </li>
              <li>
                Visibilitas operasional mendalam melalui dashboard analitis.
              </li>
              <li>
                Kontrol keamanan granular dengan hak akses berbasis peran.
              </li>
            </ul>
          </div>
          <div class="package-footer">
            <p class="package-price">Rp 25.000.000</p>
            <p class="package-timeline">
              Estimasi Pengerjaan: <strong>10 Minggu</strong>
            </p>
          </div>
        </div>
      </div>

      <h3 style="margin-top: 2.5em">Perbandingan Rinci Fitur</h3>
      <table class="feature-comparison-table">
        <thead>
          <tr>
            <th style="text-align: left; width: 34%">Fitur</th>
            <th>UI/UX Blueprint</th>
            <th>Growth Foundation</th>
            <th>Enterprise Accelerator</th>
          </tr>
        </thead>
        <tbody>
          <tr class="category-row">
            <td colspan="4"><strong>Antarmuka & Desain (Frontend)</strong></td>
          </tr>
          <tr>
            <td>Desain UI/UX Profesional</td>
            <td><span class="check-icon">✓</span></td>
            <td><span class="check-icon">✓</span></td>
            <td><span class="check-icon">✓</span></td>
          </tr>
          <tr>
            <td>Semua Komponen Antarmuka</td>
            <td><span class="check-icon">✓</span></td>
            <td><span class="check-icon">✓</span></td>
            <td><span class="check-icon">✓</span></td>
          </tr>

          <tr class="category-row">
            <td colspan="4">
              <strong>Logika Bisnis & Server (Backend)</strong>
            </td>
          </tr>
          <tr>
            <td>Fungsionalitas Penuh</td>
            <td><span class="cross-icon">✗</span></td>
            <td><span class="check-icon">✓</span></td>
            <td><span class="check-icon">✓</span></td>
          </tr>
          <tr>
            <td>Database & API</td>
            <td><span class="cross-icon">✗</span></td>
            <td><span class="check-icon">✓</span></td>
            <td><span class="check-icon">✓</span></td>
          </tr>
          <tr>
            <td>Manajemen Siklus Hidup Aset</td>
            <td><span class="cross-icon">✗</span></td>
            <td><span class="check-icon">✓</span></td>
            <td><span class="check-icon">✓</span></td>
          </tr>

          <tr class="category-row">
            <td colspan="4"><strong>Administrasi & Keamanan</strong></td>
          </tr>
          <tr>
            <td>Manajemen Pengguna & Divisi</td>
            <td><span class="cross-icon">✗</span></td>
            <td><span class="check-icon">✓</span></td>
            <td><span class="check-icon">✓</span></td>
          </tr>
          <tr>
            <td>Role-Based Access Control (RBAC)</td>
            <td><span class="cross-icon">✗</span></td>
            <td>Dasar</td>
            <td><span class="check-icon">✓</span> (Custom Roles)</td>
          </tr>
          <tr>
            <td>Log Aktivitas Pengguna</td>
            <td><span class="cross-icon">✗</span></td>
            <td><span class="cross-icon">✗</span></td>
            <td><span class="check-icon">✓</span></td>
          </tr>

          <tr class="category-row">
            <td colspan="4"><strong>Produktivitas & Otomatisasi</strong></td>
          </tr>
          <tr>
            <td>Pencarian Cerdas & Filter</td>
            <td>Tampilan</td>
            <td><span class="check-icon">✓</span></td>
            <td><span class="check-icon">✓</span> (Filter Lanjutan)</td>
          </tr>
          <tr>
            <td>Generasi & Cetak Kode QR Individual</td>
            <td>Tampilan</td>
            <td><span class="check-icon">✓</span></td>
            <td><span class="check-icon">✓</span></td>
          </tr>
          <tr>
            <td>Ekspor Data ke CSV/Excel</td>
            <td><span class="cross-icon">✗</span></td>
            <td><span class="cross-icon">✗</span></td>
            <td><span class="check-icon">✓</span></td>
          </tr>
          <tr>
            <td>Aksi Massal (Bulk Actions)</td>
            <td><span class="cross-icon">✗</span></td>
            <td><span class="cross-icon">✗</span></td>
            <td><span class="check-icon">✓</span></td>
          </tr>
          <tr>
            <td>Pemindai Kode QR/Barcode Terintegrasi</td>
            <td><span class="cross-icon">✗</span></td>
            <td><span class="cross-icon">✗</span></td>
            <td><span class="check-icon">✓</span></td>
          </tr>

          <tr class="category-row">
            <td colspan="4"><strong>Hasil Akhir (Deliverables)</strong></td>
          </tr>
          <tr>
            <td>Kode Sumber (Frontend)</td>
            <td><span class="check-icon">✓</span></td>
            <td><span class="check-icon">✓</span></td>
            <td><span class="check-icon">✓</span></td>
          </tr>
          <tr>
            <td>Kode Sumber (Backend)</td>
            <td><span class="cross-icon">✗</span></td>
            <td><span class="check-icon">✓</span></td>
            <td><span class="check-icon">✓</span></td>
          </tr>
          <tr>
            <td>Dokumentasi Desain & Teknis</td>
            <td>Dasar</td>
            <td>Lengkap</td>
            <td><span class="check-icon">✓</span> (Komprehensif)</td>
          </tr>
        </tbody>
      </table>

      <h3>Rincian Alokasi Biaya Investasi (UI/UX Blueprint)</h3>
      <p>
        Nilai investasi sebesar <strong>Rp 8.500.000</strong> mencakup alokasi
        sumber daya untuk menghasilkan aset frontend yang berkualitas tinggi:
      </p>
      <table class="investment-table">
        <thead>
          <tr>
            <th>Fase Penyerahan</th>
            <th style="width: 20%">Estimasi Waktu</th>
            <th style="width: 25%">Investasi (Rp)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>Desain UI/UX & Prototipe</strong><br /><small
                >Desain high-fidelity dan pembuatan prototipe interaktif.</small
              >
            </td>
            <td>1 Minggu</td>
            <td>4.500.000</td>
          </tr>
          <tr>
            <td>
              <strong>Pengembangan Komponen Frontend</strong><br /><small
                >Implementasi desain menjadi komponen React yang siap
                pakai.</small
              >
            </td>
            <td>1 Minggu</td>
            <td>4.000.000</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2">Total Estimasi Investasi</td>
            <td>Rp 8.500.000</td>
          </tr>
        </tfoot>
      </table>

      <h3>Rincian Alokasi Biaya Investasi (Growth Foundation)</h3>
      <p>
        Nilai investasi sebesar <strong>Rp 14.000.000</strong> mencakup alokasi
        sumber daya profesional di seluruh siklus pengembangan esensial:
      </p>
      <table class="investment-table">
        <thead>
          <tr>
            <th>Fase Pengembangan</th>
            <th style="width: 20%">Estimasi Waktu</th>
            <th style="width: 25%">Investasi (Rp)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>Perencanaan & Desain UI/UX</strong><br /><small
                >Workshop kebutuhan, pemetaan alur kerja inti, dan desain
                antarmuka.</small
              >
            </td>
            <td>1 Minggu</td>
            <td>2.100.000</td>
          </tr>
          <tr>
            <td>
              <strong>Pengembangan Backend Inti</strong><br /><small
                >Pembangunan API dasar, logika bisnis esensial, dan struktur
                database.</small
              >
            </td>
            <td>2 Minggu</td>
            <td>5.600.000</td>
          </tr>
          <tr>
            <td>
              <strong>Pengembangan Frontend Inti</strong><br /><small
                >Implementasi fitur-fitur utama pada antarmuka pengguna.</small
              >
            </td>
            <td>1.5 Minggu</td>
            <td>4.900.000</td>
          </tr>
          <tr>
            <td>
              <strong>Pengujian & Peluncuran</strong><br /><small
                >Pengujian fungsional dasar, deployment, dan sesi serah
                terima.</small
              >
            </td>
            <td>0.5 Minggu</td>
            <td>1.400.000</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2">Total Estimasi Investasi</td>
            <td>Rp 14.000.000</td>
          </tr>
        </tfoot>
      </table>

      <h3>Rincian Alokasi Biaya Investasi (Enterprise Accelerator)</h3>
      <p>
        Nilai investasi sebesar <strong>Rp 25.000.000</strong> mencakup alokasi
        sumber daya profesional di seluruh siklus pengembangan komprehensif:
      </p>
      <table class="investment-table">
        <thead>
          <tr>
            <th>Fase Pengembangan</th>
            <th style="width: 20%">Estimasi Waktu</th>
            <th style="width: 25%">Investasi (Rp)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>Fase 1: Penemuan & Perencanaan Strategis</strong
              ><br /><small
                >Workshop kebutuhan, pemetaan proses, dan perancangan
                arsitektur.</small
              >
            </td>
            <td>1 Minggu</td>
            <td>2.500.000</td>
          </tr>
          <tr>
            <td>
              <strong>Fase 2: Desain UI/UX & Prototipe Interaktif</strong
              ><br /><small
                >Wireframing, desain high-fidelity, dan pembuatan
                prototipe.</small
              >
            </td>
            <td>1 Minggu</td>
            <td>3.750.000</td>
          </tr>
          <tr>
            <td>
              <strong>Fase 3: Pengembangan Backend & Database</strong
              ><br /><small
                >Pembangunan API, logika bisnis, skema database, autentikasi,
                dan keamanan.</small
              >
            </td>
            <td>4 Minggu</td>
            <td>8.750.000</td>
          </tr>
          <tr>
            <td>
              <strong>Fase 4: Pengembangan Frontend & Integrasi</strong
              ><br /><small
                >Implementasi UI, pengembangan komponen interaktif, dan
                integrasi API.</small
              >
            </td>
            <td>3 Minggu</td>
            <td>7.500.000</td>
          </tr>
          <tr>
            <td>
              <strong>Fase 5: Pengujian, Peluncuran & Pelatihan</strong
              ><br /><small
                >QA, UAT, deployment, sesi pelatihan, dan serah terima kode
                sumber.</small
              >
            </td>
            <td>1 Minggu</td>
            <td>2.500.000</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2">Total Estimasi Investasi</td>
            <td>Rp 25.000.000</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- =================================================================== -->
    <!--                PAGE 8: GUARANTEE & RISK MITIGATION                  -->
    <!-- =================================================================== -->
    <div class="page" id="jaminan_risiko">
      <h2>6. Jaminan & Mitigasi Risiko Anda</h2>
      <p>
        Kami memahami bahwa investasi teknologi adalah keputusan penting. Oleh
        karena itu, kami secara proaktif menghilangkan potensi kekhawatiran Anda
        dengan jaminan berikut:
      </p>
      <div class="value-box">
        <h4>Janji Ketenangan Pikiran Anda (Peace of Mind Guarantee)</h4>
        <ul>
          <li>
            <strong>Investasi dengan Harga Tetap (Fixed Price):</strong> Nilai
            investasi yang tertera adalah final untuk ruang lingkup yang
            disepakati. Tidak ada biaya tersembunyi atau biaya tak terduga.
          </li>
          <li>
            <strong>Transparansi Penuh Selama Proses:</strong> Anda akan
            menerima laporan kemajuan mingguan dan memiliki akses ke sesi umpan
            balik di setiap fase penting untuk memastikan hasil akhir selaras
            dengan visi Anda.
          </li>
          <li>
            <strong>Kepemilikan Kode Sumber 100%:</strong> Setelah proyek
            selesai dan dilunasi, Anda memiliki kendali penuh atas aset digital
            ini, memberikan kebebasan untuk pengembangan mandiri di masa depan.
          </li>
          <li>
            <strong>Garansi Purna-Jual:</strong> Kami memberikan garansi
            perbaikan bug selama 90 hari setelah serah terima untuk memastikan
            transisi yang mulus dan bebas masalah ke lingkungan produksi.
          </li>
        </ul>
      </div>
      <p>
        Kemitraan dengan kami adalah investasi yang aman, transparan, dan
        berorientasi pada hasil jangka panjang.
      </p>
    </div>

    <!-- =================================================================== -->
    <!--                PAGE 9: TECHNOLOGY & ARCHITECTURE                    -->
    <!-- =================================================================== -->
    <div class="page" id="teknologi">
      <h2>7. Jaminan Kualitas, Arsitektur, & Tumpukan Teknologi</h2>
      <p>
        Kami membangun solusi di atas fondasi teknologi modern, teruji, dan
        dapat diandalkan. Pilihan ini didasarkan pada prinsip skalabilitas,
        keamanan, dan kemudahan pemeliharaan untuk melindungi investasi jangka
        panjang Anda.
      </p>
      <h4>Tumpukan Teknologi (Sesuai Dokumen Arsitektur)</h4>
      <table>
        <thead>
          <tr>
            <th>Komponen</th>
            <th>Teknologi</th>
            <th>
              Alasan Pemilihan (Dari
              <a
                href="../01_CONCEPT_AND_ARCHITECTURE/TECHNOLOGY_STACK.md"
                target="_blank"
                >Dok. Teknologi</a
              >)
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Frontend (Antarmuka)</strong></td>
            <td>React & TypeScript</td>
            <td>
              Ekosistem matang, arsitektur berbasis komponen, dan
              <strong>type-safety</strong> untuk mengurangi bug dan meningkatkan
              pemeliharaan.
            </td>
          </tr>
          <tr>
            <td><strong>Backend (Logika Server)</strong></td>
            <td>NestJS & TypeScript</td>
            <td>
              Framework terstruktur dan modular dengan arsitektur kuat yang
              ideal untuk aplikasi skala perusahaan dan mudah diuji.
            </td>
          </tr>
          <tr>
            <td><strong>Database</strong></td>
            <td>PostgreSQL & Prisma</td>
            <td>
              Keandalan tinggi dari PostgreSQL, dikombinasikan dengan akses
              database yang <strong>type-safe</strong> dan modern dari Prisma
              ORM.
            </td>
          </tr>
          <tr>
            <td><strong>DevOps</strong></td>
            <td>Docker</td>
            <td>
              Memastikan konsistensi lingkungan antara development dan produksi,
              menyederhanakan proses deployment.
            </td>
          </tr>
        </tbody>
      </table>
      <h4>Jaminan Kualitas & Keamanan</h4>
      <ul>
        <li>
          <strong>Kode yang Bersih & Terdokumentasi:</strong> Kami mengikuti
          standar koding yang ketat, memastikan kode sumber yang Anda terima
          mudah dibaca, dipelihara, dan dikembangkan di masa depan.
        </li>
        <li>
          <strong>Keamanan sebagai Prioritas:</strong> Kami menerapkan praktik
          keamanan standar industri (JWT, RBAC, proteksi terhadap XSS, CSRF, SQL
          Injection) sesuai dengan
          <a
            href="../03_STANDARDS_AND_PROCEDURES/SECURITY_GUIDE.md"
            target="_blank"
            >Panduan Keamanan</a
          >.
        </li>
        <li>
          <strong>Pengujian Multi-Lapis:</strong> Proses QA kami mencakup
          pengujian unit, fungsional, dan User Acceptance Testing (UAT) untuk
          memastikan aplikasi bebas dari bug kritis.
        </li>
      </ul>
    </div>

    <!-- =================================================================== -->
    <!--              PAGE 10: METHODOLOGY & TIMELINE                        -->
    <!-- =================================================================== -->
    <div class="page" id="metodologi">
      <h2>8. Metodologi & Proyeksi Jadwal Implementasi</h2>
      <p>
        Kami menggunakan pendekatan <strong>Hybrid Agile</strong>. Ini berarti
        kita melakukan perencanaan besar di awal untuk menentukan lingkup dan
        arsitektur secara matang, namun eksekusi pengembangan dilakukan dalam
        "sprint" pendek yang memungkinkan Anda untuk memberikan masukan dan
        melihat kemajuan secara berkala. Pendekatan ini memberikan <b>kepastian
        jadwal</b> dari metode tradisional sekaligus <b>fleksibilitas<b> dari metode
        Agile.
      </p>

      <h4>Proyeksi Jadwal untuk Paket Enterprise Accelerator (10 Minggu)</h4>
      <div class="timeline">
        <div class="timeline-item completed">
          <h4>
            Fase 1: Penemuan & Perencanaan Strategis (Minggu 1: ✅ Telah
            Selesai)
          </h4>
          <p>
            <strong>Aktivitas Kunci:</strong> Sesi pendalaman kebutuhan,
            pemetaan alur kerja detail, dan finalisasi arsitektur teknis telah
            diselesaikan dalam meeting kita pada
            <strong>Selasa, 14 Oktober 2025</strong>.
          </p>
          <span class="output-label">Output Utama:</span>
          <p>
            Dokumen finalisasi kebutuhan (final PRD) dan desain arsitektur
            sistem.
          </p>
        </div>
        <div class="timeline-item completed">
          <h4>Fase 2: Desain UI/UX & Prototipe (Minggu 2: ✅ Telah Selesai)</h4>
          <p>
            <strong>Aktivitas Kunci:</strong> Pembuatan wireframe, desain
            antarmuka visual (high-fidelity), dan pengembangan prototipe
            interaktif telah kami serahkan pada
            <strong>Jumat, 17 Oktober 2025</strong>.
          </p>
          <span class="output-label">Output Utama:</span>
          <p>
            Purwarupa (prototype) interaktif yang telah Anda terima dan uji
            coba.
          </p>
        </div>
        <div class="value-box" style="padding: 15px 20px; margin: 30px 0">
          <p style="margin: 0; font-size: 10.5pt">
            <strong>Langkah Berikutnya:</strong> Finalisasi kemitraan dalam
            pertemuan kita pada <strong>Sabtu, 25 Oktober 2025</strong> untuk
            memulai fase pengembangan selanjutnya.
          </p>
        </div>
        <div class="timeline-item">
          <h4>Fase 3: Pengembangan Backend & Database (Minggu 3-6)</h4>
          <p>
            <strong>Aktivitas Kunci:</strong> Pembangunan struktur database,
            pengembangan API endpoints, implementasi logika bisnis inti, dan
            sistem autentikasi & otorisasi.
          </p>
          <span class="output-label">Output Utama:</span>
          <p>
            API yang fungsional dan terdokumentasi, siap untuk diintegrasikan
            dengan frontend.
          </p>
        </div>
        <div class="timeline-item">
          <h4>Fase 4: Pengembangan Frontend & Integrasi (Minggu 7-9)</h4>
          <p>
            <strong>Aktivitas Kunci:</strong> Implementasi desain UI menjadi
            komponen React, menghubungkan antarmuka dengan API backend, dan
            pengembangan fitur-fitur interaktif.
          </p>
          <span class="output-label">Output Utama:</span>
          <p>Aplikasi web fungsional yang siap untuk tahap pengujian akhir.</p>
        </div>
        <div class="timeline-item">
          <h4>Fase 5: Pengujian, Peluncuran & Pelatihan (Minggu 10)</h4>
          <p>
            <strong>Aktivitas Kunci:</strong> Pengujian jaminan kualitas (QA),
            User Acceptance Test (UAT) oleh tim Anda, perbaikan bug final,
            deployment ke server, dan sesi pelatihan.
          </p>
          <span class="output-label">Output Utama:</span>
          <p>
            Aplikasi yang telah ter-deploy, laporan hasil UAT, dokumentasi
            lengkap, dan serah terima kode sumber.
          </p>
        </div>
      </div>

      <h4 style="margin-top: 2.5em">
        Proyeksi Jadwal untuk Paket Growth Foundation (5 Minggu)
      </h4>
      <div class="timeline">
        <div class="timeline-item completed">
          <h4>
            Fase 1: Perencanaan & Desain Cepat (Minggu 1: ✅ Telah Selesai)
          </h4>
          <p>
            <strong>Aktivitas Kunci:</strong> Pemetaan alur kerja esensial dan
            desain antarmuka (UI) telah didiskusikan (14 Okt) dan
            didemonstrasikan melalui prototipe (17 Okt).
          </p>
          <span class="output-label">Output Utama:</span>
          <p>
            Desain antarmuka pengguna (UI) final dan rencana proyek yang
            disetujui.
          </p>
        </div>
        <div class="value-box" style="padding: 15px 20px; margin: 30px 0">
          <p style="margin: 0; font-size: 10.5pt">
            <strong>Langkah Berikutnya:</strong> Finalisasi kemitraan dalam
            pertemuan kita pada <strong>Sabtu, 25 Oktober 2025</strong> untuk
            memulai fase pengembangan selanjutnya.
          </p>
        </div>
        <div class="timeline-item">
          <h4>Fase 2: Pengembangan Fitur Inti (Minggu 2-4)</h4>
          <p>
            <strong>Aktivitas Kunci:</strong> Pembangunan struktur database,
            pengembangan API & logika bisnis esensial, serta implementasi
            antarmuka pengguna (frontend) untuk fitur-fitur utama.
          </p>
          <span class="output-label">Output Utama:</span>
          <p>
            Aplikasi web fungsional versi beta yang mencakup semua fitur inti
            dan siap untuk diuji.
          </p>
        </div>
        <div class="timeline-item">
          <h4>Fase 3: Pengujian Final & Peluncuran (Minggu 5)</h4>
          <p>
            <strong>Aktivitas Kunci:</strong> Pengujian jaminan kualitas (QA),
            User Acceptance Test (UAT) oleh tim Anda, perbaikan bug final,
            deployment ke server, dan sesi serah terima.
          </p>
          <span class="output-label">Output Utama:</span>
          <p>
            Aplikasi yang telah ter-deploy, laporan hasil UAT, dan dokumentasi
            dasar.
          </p>
        </div>
      </div>

      <h4 style="margin-top: 2.5em">
        Proyeksi Jadwal untuk Paket UI/UX Blueprint (2 Minggu)
      </h4>
      <div class="timeline">
        <div class="timeline-item completed">
          <h4>Fase 1: Desain UI/UX & Prototipe (Minggu 1: ✅ Telah Selesai)</h4>
          <p>
            <strong>Aktivitas Kunci:</strong> Pembuatan desain antarmuka visual
            (high-fidelity) dan pengembangan prototipe interaktif telah
            diserahkan pada <strong>Jumat, 17 Oktober 2025</strong>.
          </p>
          <span class="output-label">Output Utama:</span>
          <p>
            Purwarupa (prototype) interaktif yang telah diterima dan diuji coba.
          </p>
        </div>
        <div class="value-box" style="padding: 15px 20px; margin: 30px 0">
          <p style="margin: 0; font-size: 10.5pt">
            <strong>Langkah Berikutnya:</strong> Finalisasi kemitraan dalam
            pertemuan kita pada <strong>Sabtu, 25 Oktober 2025</strong> untuk
            memulai fase implementasi.
          </p>
        </div>
        <div class="timeline-item">
          <h4>Fase 2: Implementasi Frontend & Penyerahan (Minggu 2)</h4>
          <p>
            <strong>Aktivitas Kunci:</strong> Implementasi desain menjadi
            komponen React yang bersih dan terdokumentasi, serta finalisasi kode
            untuk penyerahan.
          </p>
          <span class="output-label">Output Utama:</span>
          <p>
            Seluruh kode sumber (source code) frontend, dokumentasi komponen
            dasar, dan file build statis yang siap di-deploy.
          </p>
        </div>
      </div>

      <h4>Komunikasi & Keterlibatan Anda</h4>
      <p>
        Kemitraan adalah kunci. Kami akan menjaga transparansi penuh selama
        proyek melalui:
      </p>
      <ul>
        <li>
          <strong>Laporan Kemajuan Mingguan:</strong> Setiap akhir minggu, Anda
          akan menerima email ringkasan yang merinci apa yang telah diselesaikan
          dan rencana untuk minggu berikutnya.
        </li>
        <li>
          <strong>Sesi Umpan Balik (Feedback Session):</strong> Sesi khusus akan
          dijadwalkan setelah fase desain (Fase 2) dan sebelum peluncuran (Fase
          5) untuk memastikan solusi selaras dengan ekspektasi Anda.
        </li>
        <li>
          <strong>User Acceptance Testing (UAT):</strong> Di akhir pengembangan,
          tim Anda akan memiliki kesempatan untuk menguji aplikasi secara
          menyeluruh dan memberikan daftar revisi final.
        </li>
      </ul>
    </div>

    <!-- =================================================================== -->
    <!--            PAGE 11: LONG-TERM PARTNERSHIP & ROADMAP                 -->
    <!-- =================================================================== -->
    <div class="page" id="kemitraan">
      <h2>9. Kemitraan Jangka Panjang: Dukungan & Peta Jalan Produk</h2>
      <p>
        Peluncuran aplikasi adalah awal dari perjalanan. Kami melihat diri kami
        sebagai mitra jangka panjang yang berkomitmen untuk memastikan platform
        ini terus memberikan nilai seiring pertumbuhan bisnis Anda.
      </p>
      <h4>Paket Dukungan & Pemeliharaan (Opsional setelah 3 bulan garansi)</h4>
      <p>
        Untuk ketenangan pikiran dan memastikan platform Anda selalu dalam
        kondisi prima, kami menawarkan paket retainer bulanan.
      </p>
      <table>
        <thead>
          <tr>
            <th>Paket</th>
            <th>Cakupan</th>
            <th>Investasi Bulanan</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Standard Support</strong></td>
            <td>
              <ul>
                <li>Pembaruan keamanan rutin</li>
                <li>Pemantauan kinerja server</li>
                <li>Perbaikan bug prioritas (SLA 72 jam)</li>
                <li>2 jam konsultasi teknis / bulan</li>
              </ul>
            </td>
            <td>Mulai dari<br /><strong>Rp 1.500.000 / bulan</strong></td>
          </tr>
          <tr>
            <td><strong>Premium Support</strong></td>
            <td>
              <ul>
                <li>Semua di Standard Support</li>
                <li>Perbaikan bug kritis (SLA 24 jam)</li>
                <li>Bantuan pengembangan fitur minor</li>
                <li>5 jam konsultasi teknis / bulan</li>
              </ul>
            </td>
            <td>Mulai dari<br /><strong>Rp 3.000.000 / bulan</strong></td>
          </tr>
        </tbody>
      </table>
      <h4>Visi & Peta Jalan Produk Masa Depan (Strategic Roadmap)</h4>
      <p>
        Platform ini dibangun dengan fondasi yang dapat dikembangkan. Berikut
        adalah beberapa potensi evolusi di masa depan:
      </p>
      <ul>
        <li>
          <strong>Fase 2 - Intelijen Keuangan:</strong> Modul untuk menghitung
          depresiasi aset, melacak biaya pemeliharaan (OPEX), dan analisis Total
          Cost of Ownership (TCO).
        </li>
        <li>
          <strong>Fase 3 - Mobilitas Lapangan:</strong> Aplikasi Mobile (PWA)
          untuk teknisi agar dapat memperbarui status aset, mengunggah foto, dan
          melakukan serah terima langsung dari perangkat seluler.
        </li>
        <li>
          <strong>Fase 4 - Integrasi Ekosistem:</strong> API untuk terhubung
          dengan sistem akuntansi (misalnya, Jurnal, Accurate) atau sistem HRIS.
        </li>
      </ul>
    </div>

    <!-- =================================================================== -->
    <!--                      PAGE 12: WHY CHOOSE US?                        -->
    <!-- =================================================================== -->
    <div class="page" id="tentang_kami">
      <h2>10. Mengapa Memilih Kami Sebagai Mitra Anda?</h2>
      <p>
        Di tengah banyaknya pilihan, kami menawarkan proposisi nilai yang unik
        yang berakar pada pemahaman bisnis, keunggulan teknis, dan komitmen
        terhadap kesuksesan jangka panjang Anda.
      </p>
      <div class="value-box">
        <h4>Kombinasi Unik Tiga Keahlian</h4>
        <ul>
          <li>
            <strong>Wawasan Business Analyst:</strong> Kami mulai dengan
            "mengapa", memastikan setiap baris kode bertujuan memecahkan masalah
            nyata dan memberikan ROI.
          </li>
          <li>
            <strong>Perspektif Senior Lead Marketing:</strong> Kami membangun
            solusi yang tidak hanya fungsional, tetapi juga intuitif dan mudah
            digunakan, memastikan adopsi internal yang tinggi.
          </li>
          <li>
            <strong>Eksekusi Fullstack Developer:</strong> Keahlian teknis
            end-to-end untuk mewujudkan visi menjadi produk berkualitas tinggi.
          </li>
        </ul>
      </div>
      <h4>Janji Kemitraan Kami</h4>
      <ul>
        <li>
          <strong>Transparansi Radikal:</strong> Anda akan selalu tahu status
          proyek. Keberadaan dokumentasi teknis yang komprehensif dari awal
          adalah bukti komitmen kami terhadap transparansi.
        </li>
        <li>
          <strong>Fokus pada Kualitas:</strong> Kode yang kami serahkan bersih,
          teruji, dan terdokumentasi, menjadikannya aset berharga untuk jangka
          panjang, bukan beban teknis.
        </li>
        <li>
          <strong>Kemitraan yang Terdokumentasi Penuh:</strong> Sebagai bukti
          komitmen kami terhadap profesionalisme, proyek ini sejak awal telah
          dilengkapi dengan dokumentasi komprehensif—mulai dari analisis
          kebutuhan, desain arsitektur, hingga rencana operasional. Ini adalah
          aset yang akan kami serahkan sepenuhnya, memastikan Anda memiliki
          kontrol dan pemahaman penuh atas solusi yang dibangun.
        </li>
        <li>
          <strong>Kemitraan, Bukan Transaksi:</strong> Kesuksesan kami diukur
          dari kesuksesan Anda. Kami berkomitmen memberikan solusi yang berhasil
          dan siap mendukung Anda bahkan setelah proyek selesai.
        </li>
      </ul>
    </div>

    <!-- =================================================================== -->
    <!--                      PAGE 13: NEXT STEPS                            -->
    <!-- =================================================================== -->
    <div class="page" id="langkah_selanjutnya">
      <h2>11. Langkah Selanjutnya & Proses Aktivasi</h2>
      <p>
        Menindaklanjuti sesi demo aplikasi kita yang produktif pada
        <strong>Selasa, 14 Oktober 2025</strong>, di mana kami telah menjabarkan
        detail fungsionalitas aplikasi, langkah-langkah berikutnya dirancang
        untuk memfinalisasi diskusi investasi kita dan memulai kemitraan secara
        resmi.
      </p>
      <ol class="next-steps-list">
        <li>
          <div>
            <h4>Diskusi Investasi Mendalam (Meeting)</h4>
            <p>
              Sesuai kesepakatan, kita akan mengadakan pertemuan khusus pada
              hari <strong>Sabtu, 25 Oktober 2025</strong>. Agenda utama adalah
              untuk melanjutkan diskusi investasi yang belum tuntas karena
              keterbatasan waktu dalam pertemuan kita sebelumnya. Pertemuan ini
              akan menjadi kesempatan untuk membahas secara rinci justifikasi
              nilai di balik harga yang ditawarkan (mulai dari Rp 25.000.000)
              dan memastikan paket yang dipilih selaras sempurna dengan tujuan
              strategis PT. Triniti Media Indonesia.
            </p>
          </div>
        </li>
        <li>
          <div>
            <h4>Konfirmasi Kemitraan & Penandatanganan Perjanjian</h4>
            <p>
              Setelah kesepakatan harga tercapai dalam pertemuan, langkah
              selanjutnya adalah penandatanganan Perjanjian Kerja untuk
              meresmikan kemitraan dan mengunci jadwal pengembangan.
            </p>
          </div>
        </li>
        <li>
          <div>
            <h4>Aktivasi & Onboarding Proyek (24-48 Jam Setelah Perjanjian)</h4>
            <p>
              Segera setelah perjanjian ditandatangani, kami akan langsung
              memulai proses aktivasi yang terstruktur:
            </p>
            <ul
              class="ul-numeric"
              style="
                margin-left: 20px;
                font-size: 10.5pt;
                color: var(--text-light);
              "
            >
              <li style="margin-bottom: 0.5em">
                <strong>Langkah 3a (Administratif):</strong> Penerbitan kuitansi
                bermeterai untuk pembayaran uang muka sebesar 50%.
              </li>
              <li style="margin-bottom: 0.5em">
                <strong>Langkah 3b (Komunikasi):</strong> Pembuatan kanal
                komunikasi khusus (misalnya: grup WhatsApp) untuk koordinasi
                harian dan laporan kemajuan.
              </li>
              <li style="margin-bottom: 0.5em">
                <strong>Langkah 3c (Penjadwalan):</strong> Penjadwalan sesi
                kick-off proyek resmi untuk memfinalisasi timeline, menentukan
                PIC dari kedua belah pihak, dan memulai fase pengembangan
                pertama.
              </li>
            </ul>
          </div>
        </li>
      </ol>
      <p style="margin-top: 30px">
        Kami sangat menantikan pertemuan kita pada hari
        <strong>Sabtu, 25 Oktober 2025</strong> untuk membahas bagaimana solusi
        ini dapat memberikan nilai maksimal bagi PT. Triniti Media Indonesia.
      </p>
    </div>

    <!-- =================================================================== -->
    <!--                      PAGE 14: APPENDIX                              -->
    <!-- =================================================================== -->
    <div class="page" id="lampiran">
      <h2>12. Lampiran: Syarat & Ketentuan Detail</h2>
      <p>
        Syarat dan ketentuan ini berlaku untuk proyek pengembangan, selaras
        dengan dokumen
        <a href="../Business/perjanjian.md" target="_blank">Perjanjian Kerja</a
        >.
      </p>
      <div class="appendix-section">
        <h4>A. Ruang Lingkup & Hasil Proyek (Deliverables)</h4>
        <ul>
          <li>
            Hasil akhir proyek meliputi: (a) Seluruh kode sumber (frontend dan
            backend), (b) Dokumentasi teknis dan pengguna, dan (c) Satu sesi
            pelatihan.
          </li>
          <li>
            Permintaan fitur di luar ruang lingkup yang disepakati akan dianggap
            sebagai <strong>Change Request</strong> dan dapat dikenakan biaya
            tambahan.
          </li>
        </ul>
      </div>
      <div class="appendix-section">
        <h4>B. Investasi & Skema Pembayaran</h4>
        <ul>
          <li>
            Skema pembayaran adalah: <strong>50% Uang Muka</strong> (untuk
            memulai proyek) dan <strong>50% Pelunasan</strong> (setelah UAT dan
            sebelum serah terima kode sumber).
          </li>
          <li>
            Pembayaran dapat dilakukan ke:
            <strong
              >Bank BCA, No. Rek: 391-022-4823 a.n. Angga Samuludi
              Septiawan.</strong
            >
          </li>
          <li>
            <strong>Catatan Penting:</strong> Sebagai pengembang perorangan
            (individu), PIHAK KEDUA tidak dapat menerbitkan Faktur Pajak.
            Sebagai bukti pembayaran yang sah, akan diterbitkan
            <strong>kuitansi resmi bermeterai</strong> untuk setiap termin
            pembayaran.
          </li>
        </ul>
      </div>
      <div class="appendix-section">
        <h4>C. Hak Kekayaan Intelektual (Intellectual Property)</h4>
        <ul>
          <li>
            Setelah pelunasan penuh diterima, seluruh hak kekayaan intelektual
            atas kode sumber akan menjadi milik Klien sepenuhnya.
          </li>
        </ul>
      </div>
      <div class="appendix-section">
        <h4>D. Garansi & Dukungan</h4>
        <ul>
          <li>
            Pengembang memberikan masa garansi selama
            <strong>90 (sembilan puluh) hari kalender</strong> sejak tanggal
            serah terima.
          </li>
          <li>
            Garansi ini mencakup perbaikan bug atau cacat fungsional dari kode
            yang diserahkan.
          </li>
        </ul>
      </div>
    </div>
  </body>
</html>
