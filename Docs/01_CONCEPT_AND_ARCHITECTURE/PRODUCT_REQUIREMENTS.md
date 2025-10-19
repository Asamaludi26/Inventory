# Product Requirements Document (PRD): Aplikasi Inventori Aset

- **Versi**: 1.0
- **Tanggal**: 08 Agustus 2024
- **Pemilik Dokumen**: Angga Samuludi Septiawan

## 1. Pendahuluan

### 1.1. Latar Belakang & Masalah
Saat ini, PT. Triniti Media Indonesia mengelola aset perusahaan menggunakan metode manual yang rentan terhadap kesalahan, kurang efisien, dan sulit untuk dilacak. Proses mulai dari permintaan barang, pencatatan, serah terima, hingga penarikan kembali aset tidak terpusat, menyebabkan kesulitan dalam audit, potensi kehilangan aset, dan ketidakjelasan status kepemilikan aset.

### 1.2. Visi & Tujuan Proyek
**Visi**: Menciptakan sistem manajemen inventori aset yang terpusat, modern, dan efisien untuk memberikan visibilitas penuh dan kontrol atas seluruh siklus hidup aset di PT. Triniti Media Indonesia.

**Tujuan**:
1.  **Sentralisasi Data**: Mengumpulkan semua data aset dalam satu database yang terstruktur.
2.  **Otomatisasi Alur Kerja**: Mendigitalkan proses permintaan, persetujuan, serah terima, dan penarikan aset.
3.  **Peningkatan Akuntabilitas**: Melacak riwayat setiap aset, termasuk siapa yang bertanggung jawab atasnya pada waktu tertentu.
4.  **Efisiensi Operasional**: Mempercepat proses audit dan pelaporan dengan data yang akurat dan real-time.
5.  **Pengurangan Risiko**: Meminimalkan risiko kehilangan atau kerusakan aset dengan pemantauan yang lebih baik.

### 1.3. Lingkup Proyek
Aplikasi ini akan mencakup fungsionalitas _end-to-end_ untuk manajemen aset, termasuk:
-   **IN-SCOPE**: Manajemen Request, Pencatatan Aset (Individual & Massal), Stok, Handover Internal, Instalasi & Dismantle di Pelanggan, Manajemen Pengguna & Divisi, Manajemen Kategori, Pelaporan, dan Pencetakan Kode QR.
-   **OUT-OF-SCOPE**: Integrasi dengan sistem akuntansi, manajemen _purchase order_ (PO) mendalam, manajemen vendor, fitur depresiasi aset.

---

## 2. Target Pengguna & Peran (User Persona & Roles)

Aplikasi akan memiliki tiga tingkat hak akses utama:

| Peran         | Deskripsi                                                                                                                                                      | Hak Akses Utama                                                                                                                                                                                                                            |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Staff**     | Karyawan dari berbagai divisi yang membutuhkan aset untuk pekerjaan mereka.                                                                                      | - Membuat dan melihat status request aset pribadi/divisi (hanya tipe **Regular Stock**). Pilihan aset yang dapat diminta terbatas pada kategori yang relevan dengan divisi mereka.<br>- Melihat aset yang sedang mereka gunakan. |
| **Manager**   | Peran ini secara spesifik ditujukan untuk Manajer atau Supervisor (SPV) di setiap divisi. Mereka bertanggung jawab atas kebutuhan proyek atau situasi darurat. | - Semua hak akses Staff.<br>- Membuat request aset tipe **Urgent** dan **Project Based** untuk meminimalisir penyalahgunaan tipe order.                                                           |
| **Admin**     | Staf dari Divisi Inventori yang bertanggung jawab atas operasional harian manajemen aset.                                                                        | - Semua hak akses Staff & Manager.<br>- Mengelola (menyetujui/menolak) request aset.<br>- Mencatat aset baru.<br>- Mengelola handover dan dismantle.<br>- Mengelola data pelanggan dan kategori aset. |
| **Super Admin** | Pimpinan atau manajer senior yang memiliki otoritas penuh atas sistem.                                                                                           | - Semua hak akses Admin.<br>- Mengelola akun pengguna dan divisi.<br>- Memberikan persetujuan final untuk request bernilai tinggi.<br>- Mengakses semua laporan dan analitik.                       |

---

## 3. User Stories & Use Cases

### 3.1. Alur Kerja Permintaan Aset (Request)
-   **US-1**: **Sebagai seorang Staff**, saya ingin bisa mengisi formulir permintaan aset baru dengan memilih item dari daftar standar agar prosesnya cepat dan tidak ada kesalahan pengetikan.
-   **US-2**: **Sebagai seorang Staff**, saya ingin bisa melihat status semua permintaan yang pernah saya ajukan (menunggu, disetujui, ditolak) agar saya tahu progresnya.
-   **US-3**: **Sebagai seorang Manager**, saya ingin bisa membuat request 'Urgent' dengan menyertakan justifikasi agar kebutuhan mendesak dapat segera diproses.
-   **US-4**: **Sebagai seorang Admin**, saya ingin menerima notifikasi ketika ada request baru agar saya bisa segera memprosesnya.
-   **US-5**: **Sebagai seorang Admin**, saya ingin bisa menyetujui atau menolak sebuah request dengan memberikan catatan agar keputusan saya transparan.
-   **US-6**: **Sebagai seorang Super Admin**, saya harus memberikan persetujuan final untuk request dengan nilai total di atas ambang batas tertentu (misal: Rp 10.000.000) untuk menjaga kontrol anggaran.

### 3.2. Alur Kerja Pencatatan Aset
-   **US-7**: **Sebagai seorang Admin**, setelah barang dari request tiba, saya ingin bisa mencatatnya sebagai aset baru dengan mudah, dengan data yang sebagian sudah terisi dari request aslinya.
-   **US-8**: **Sebagai seorang Admin**, saya ingin bisa mencetak label Kode QR untuk setiap aset yang baru dicatat agar mudah diidentifikasi dan dilacak di kemudian hari.
-   **US-9**: **Sebagai seorang Admin**, saya ingin bisa mencatat aset dalam jumlah banyak (bulk) untuk item yang tidak memerlukan pelacakan individual (misal: kabel, konektor).

### 3.3. Alur Kerja Serah Terima & Penarikan
-   **US-10**: **Sebagai seorang Admin**, saya ingin membuat Berita Acara Serah Terima (BAST) digital saat menyerahkan aset (misal: laptop) kepada seorang Staff, yang mencatat siapa yang menyerahkan dan menerima.
-   **US-11**: **Sebagai seorang Teknisi (Staff)**, saat menarik kembali aset (misal: router) dari lokasi pelanggan, saya ingin bisa membuat Berita Acara Dismantle yang mencatat kondisi aset saat ditarik.
-   **US-12**: **Sebagai seorang Admin**, saya ingin status aset otomatis kembali menjadi "Disimpan" (In Storage) setelah proses dismantle diselesaikan.

### 3.4. Pelaporan & Pencarian
-   **US-13**: **Sebagai seorang Super Admin**, saya ingin melihat dashboard yang menampilkan ringkasan jumlah aset, statusnya (digunakan, disimpan, rusak), dan nilai total inventori.
-   **US-14**: **Sebagai pengguna mana pun**, saya ingin bisa dengan cepat mencari aset berdasarkan ID, nama, atau nomor seri menggunakan fitur pencarian atau dengan memindai Kode QR-nya.
-   **US-15**: **Sebagai seorang Admin**, saya ingin bisa mengekspor daftar aset atau request ke dalam format CSV untuk keperluan pelaporan offline.

---

## 4. Persyaratan Non-Fungsional

-   **Keamanan**: Aplikasi harus memiliki sistem login yang aman dan hak akses berbasis peran.
-   **Performa**: Waktu muat halaman tidak boleh lebih dari 3 detik. Operasi pencarian dan filter harus terasa instan.
-   **Usability**: Antarmuka harus bersih, intuitif, dan mudah digunakan bahkan oleh pengguna non-teknis.
-   **Skalabilitas**: Arsitektur harus mampu menangani penambahan jumlah aset dan pengguna di masa depan tanpa penurunan performa yang signifikan.
-   **Kompatibilitas**: Aplikasi harus berjalan dengan baik di browser modern versi terbaru (Chrome, Firefox, Safari, Edge).