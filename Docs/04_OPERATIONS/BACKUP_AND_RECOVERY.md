# Rencana Backup dan Pemulihan Bencana

Dokumen ini menjelaskan prosedur standar untuk mencadangkan (backup) data aplikasi dan langkah-langkah untuk memulihkan layanan jika terjadi kegagalan sistem atau kehilangan data.

## 1. Strategi Backup

### 1.1. Objek Backup
-   **Target Utama**: Database **PostgreSQL** yang berisi semua data operasional (aset, pengguna, request, dll).
-   **Target Sekunder**: File lampiran yang diunggah oleh pengguna (jika disimpan di file system server). Jika menggunakan layanan penyimpanan objek seperti AWS S3, backup diatur oleh kebijakan _versioning_ S3.

### 1.2. Metode & Jadwal Backup

Kami menerapkan strategi backup berlapis untuk menyeimbangkan antara RPO (Recovery Point Objective) dan biaya.

1.  **Backup Penuh Harian (Daily Full Backup)**
    -   **Metode**: Menggunakan `pg_dump` untuk membuat salinan logis lengkap dari seluruh database.
    -   **Jadwal**: Dijalankan secara otomatis setiap hari pada jam 02:00 pagi (di luar jam sibuk).
    -   **RPO**: Hingga 24 jam. Kehilangan data bisa terjadi hingga 24 jam terakhir jika hanya mengandalkan backup ini.

2.  **Point-in-Time Recovery (PITR)**
    -   **Metode**: Menggunakan _Write-Ahead Logging_ (WAL) archiving. Ini secara kontinu mengarsipkan log transaksi database.
    -   **Tujuan**: Memungkinkan pemulihan ke titik waktu mana pun di antara dua backup penuh.
    -   **RPO**: Kurang dari 5 menit. Meminimalkan kehilangan data secara signifikan.

_Catatan: Jika menggunakan layanan database terkelola (seperti AWS RDS atau Google Cloud SQL), fitur backup harian dan PITR biasanya sudah tersedia dan dapat diaktifkan dengan beberapa klik._

## 2. Kebijakan Penyimpanan & Retensi

Untuk melindungi dari kegagalan server atau bencana regional, backup harus disimpan di lokasi yang aman dan terpisah.

-   **Lokasi Penyimpanan**: **Cloud Object Storage** (misal: AWS S3, Google Cloud Storage) yang dikonfigurasi dengan kelas penyimpanan _infrequent access_ untuk menghemat biaya. Backup harus direplikasi ke setidaknya satu region geografis yang berbeda.
-   **Kebijakan Retensi**:
    -   Backup **harian** disimpan selama **14 hari**.
    -   Backup **mingguan** (salah satu backup harian) disimpan selama **1 bulan**.
    -   Backup **bulanan** (backup hari pertama setiap bulan) disimpan selama **12 bulan**.

## 3. Rencana Pemulihan Bencana (Disaster Recovery Plan)

Rencana ini diaktifkan jika terjadi skenario kegagalan kritis.

### 3.1. Skenario Kegagalan
-   **Skenario A**: Korupsi data (misal: penghapusan tabel yang tidak disengaja).
-   **Skenario B**: Kegagalan total server database.

### 3.2. Prosedur Pemulihan (Langkah-demi-Langkah)

1.  **Komunikasi**: Tim DevOps/Infrastruktur segera memberitahu semua _stakeholder_ bahwa proses pemulihan sedang berlangsung dan memberikan estimasi waktu (ETA).

2.  **Isolasi**: Matikan akses publik ke aplikasi untuk mencegah data baru yang tidak konsisten.

3.  **Provisioning Server Baru**: Siapkan server database baru (jika terjadi kegagalan hardware) dengan spesifikasi yang sama atau lebih baik.

4.  **Identifikasi Titik Pemulihan**:
    -   Untuk **Skenario A (Korupsi Data)**: Tentukan waktu tepat sebelum data rusak. Gunakan log aplikasi atau laporan pengguna untuk mengidentifikasi titik ini.
    -   Untuk **Skenario B (Kegagalan Server)**: Titik pemulihan adalah waktu terakhir yang terekam di WAL archive sebelum server gagal.

5.  **Proses Restore**:
    -   **Langkah 1**: Ambil file backup penuh harian **terbaru** dari Cloud Storage.
    -   **Langkah 2**: Lakukan restore database menggunakan file backup tersebut.
        ```bash
        # Contoh perintah
        pg_restore -d new_database_name latest_backup.dump
        ```
    -   **Langkah 3 (Hanya jika PITR diaktifkan)**: Terapkan file-file WAL archive secara berurutan hingga mencapai titik waktu pemulihan yang diinginkan.

6.  **Verifikasi Data**: Setelah proses restore selesai, tim teknis harus melakukan serangkaian pemeriksaan untuk memastikan integritas dan konsistensi data.

7.  **Alihkan Koneksi**: Perbarui konfigurasi backend untuk menunjuk ke server database yang baru dipulihkan.

8.  **Aktifkan Kembali Akses**: Buka kembali akses publik ke aplikasi.

9.  **Post-Mortem**: Setelah layanan pulih sepenuhnya, lakukan analisis _post-mortem_ untuk mendokumentasikan penyebab kegagalan dan mengidentifikasi cara untuk mencegahnya di masa depan.

### 3.3. Target Recovery
-   **RTO (Recovery Time Objective)**: Waktu maksimal yang dibutuhkan untuk memulihkan layanan setelah bencana. Target: **2 jam**.
-   **RPO (Recovery Point Objective)**: Jumlah data maksimal yang bisa hilang. Target: **5 menit**.
