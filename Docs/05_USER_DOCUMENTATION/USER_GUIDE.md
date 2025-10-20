# Panduan Pengguna Aplikasi Inventori Aset

Selamat datang di Panduan Pengguna Aplikasi Inventori Aset PT. Triniti Media Indonesia. Dokumen ini bertujuan untuk membantu Anda memahami dan menggunakan fitur-fitur aplikasi secara efektif sesuai dengan peran Anda.

## 1. Memulai

### 1.1. Login
- Buka aplikasi melalui browser Anda.
- Masukkan **alamat email** dan **kata sandi** yang telah terdaftar.
- Anda dapat mencentang "Ingat saya" agar tidak perlu memasukkan email saat login berikutnya.

`[Screenshot: Halaman login dengan field email, password, dan tombol 'Ingat saya' disorot]`

- Setelah berhasil login, Anda akan diarahkan ke halaman **Dashboard**.

### 1.2. Navigasi Utama
- **Sidebar (Menu Kiri)**: Merupakan pusat navigasi utama. Klik pada menu untuk berpindah antar halaman seperti Dashboard, Request Aset, Catat Aset, dll.
- **Header (Bagian Atas)**:
    - **Tombol Notifikasi (Lonceng)**: Menampilkan notifikasi terbaru yang relevan untuk Anda.
    - **Tombol Pindai QR**: Membuka kamera untuk memindai kode QR atau barcode aset.
    - **Menu Profil**: Klik pada nama Anda untuk melihat role Anda dan tombol **Logout**.

`[Screenshot: Tampilan utama aplikasi dengan panah menunjuk ke Sidebar dan Header]`

## 2. Dashboard

Halaman Dashboard memberikan gambaran umum kondisi inventori dan tugas-tugas yang memerlukan perhatian Anda.
- **Ringkasan Statistik**: Menampilkan jumlah total aset, nilai stok, dan jumlah aset yang sedang digunakan.
- **Item Perlu Tindakan**: Panel ini berisi pintasan cepat ke tugas-tugas penting, seperti:
    - **Perlu Persetujuan**: Request aset yang menunggu persetujuan Anda.
    - **Siap Dicatat**: Barang yang sudah tiba di gudang dan perlu dicatat sebagai aset.
    - **Aset Rusak**: Daftar aset yang dilaporkan rusak dan memerlukan tindakan.
- **Analitik & Riwayat**: Menampilkan grafik distribusi aset dan daftar aktivitas terbaru di dalam sistem.

`[Screenshot: Halaman Dashboard dengan area 'Item Perlu Tindakan' disorot]`

## 3. Fitur Utama (Berdasarkan Peran)

### 3.1. Untuk Semua Pengguna (Staff & Admin)

#### Membuat Request Aset
Ini adalah fitur untuk mengajukan permintaan pengadaan barang/aset baru.
1.  Buka halaman **Manajemen Aset > Request Aset**.
2.  Klik tombol **"Buat Request Baru"**.
3.  Isi detail formulir:
    - **Tanggal & Tipe Order**: Pilih tipe order (Regular, Urgent, atau Project). Jika _Urgent_, isi justifikasi.
    - **Detail Permintaan Barang**: Klik **"Tambah Item"** untuk menambahkan barang yang diminta. Pilih Kategori, Tipe, dan Model. Jumlah stok yang tersedia akan muncul otomatis.
    > **Catatan untuk Staff**: Pilihan Kategori Aset yang tersedia akan disesuaikan dengan divisi Anda.
4.  Setelah semua item terisi, klik **"Ajukan Permintaan"**.
5.  Anda dapat memantau status request Anda di halaman daftar request.

`[GIF singkat: Proses mengisi form request aset dan mengklik tombol 'Ajukan Permintaan']`

#### Melakukan Follow-up
Jika request Anda belum diproses, Anda dapat mengirim notifikasi pengingat kepada Admin.
1.  Di halaman daftar **Request Aset**, cari request Anda.
2.  Klik tombol **"Follow Up"** pada baris request tersebut. Admin akan menerima notifikasi.

### 3.2. Untuk Admin & Super Admin

#### Mengelola Request Aset
1.  Buka halaman **Manajemen Aset > Request Aset**.
2.  Request yang memerlukan persetujuan akan muncul di bagian atas atau dapat difilter.
3.  Klik pada sebuah request untuk melihat detailnya.
4.  Di halaman detail, Anda dapat:
    - **Menyetujui**: Klik tombol **"Setujui (Logistik)"** atau **"Setujui Final"** (tergantung peran dan status).
    - **Menolak**: Klik tombol **"Tolak"** dan isi alasan penolakan.
    - **Memulai Pengadaan**: Setelah disetujui, klik **"Mulai Pengadaan"** untuk mengubah status dan memasukkan estimasi tanggal tiba.

`[Screenshot: Modal detail request dengan tombol 'Setujui' dan 'Tolak' disorot]`

#### Mencatat Aset Baru
Fitur ini digunakan untuk mendaftarkan barang yang telah tiba ke dalam sistem sebagai aset.
1.  **Dari Request**: Di halaman **Request Aset**, cari request yang statusnya **"Telah Tiba"**. Klik tombol **"Catat Aset"**.
2.  **Manual**: Buka halaman **Manajemen Aset > Catat Aset** dan klik **"Catat Aset Baru"**.
3.  Isi formulir pencatatan secara lengkap:
    - **Informasi Dasar**: Kategori, Tipe, dan Model Aset.
    - **Detail Unit**: Masukkan Nomor Seri dan MAC Address. Anda bisa menggunakan tombol **Pindai QR** untuk mengisinya secara otomatis. Jika mencatat lebih dari satu unit, klik **"Tambah Unit"**.
    - **Informasi Pembelian**: Harga, vendor, tanggal beli, dan garansi.
    - **Lokasi & Kondisi**: Tentukan kondisi aset saat diterima dan lokasi penyimpanannya.
4.  Klik **"Simpan Aset Baru"**. Aset akan tercatat dan statusnya menjadi "Disimpan".

#### Mengelola Handover (Serah Terima Internal)
Fitur ini mencatat perpindahan aset dari satu staf/divisi ke staf/divisi lain.
1.  Buka halaman **Manajemen Aset > Handover Aset**.
2.  Klik **"Buat Handover Baru"**.
3.  Isi formulir Berita Acara:
    - **Pihak Terlibat**: Tentukan siapa yang menyerahkan, menerima, dan mengetahui.
    - **Detail Barang**: Klik **"Tambah Aset"** dan pilih aset yang akan diserahkan dari daftar aset yang tersedia di gudang.
4.  Klik **"Proses Handover"**. Status aset akan otomatis berubah menjadi "Digunakan" dan lokasinya diperbarui.

#### Mengelola Dismantle (Penarikan Aset dari Pelanggan)
Fitur ini digunakan saat aset ditarik kembali dari lokasi pelanggan.
1.  Buka halaman **Daftar Pelanggan** atau **Catat Aset** untuk menemukan aset yang terpasang.
2.  Dari detail pelanggan atau detail aset, klik tombol **"Tarik dari Pelanggan"**.
3.  Anda akan diarahkan ke formulir Berita Acara Dismantle dengan data yang sudah terisi.
4.  Lengkapi informasi yang diperlukan, seperti kondisi aset saat ditarik dan catatan.
5.  Klik **"Proses Dismantle"**. Dokumen akan dibuat.
6.  Setelah aset fisik tiba di gudang, Admin Gudang harus membuka detail dismantle ini dan mengklik **"Acknowledge & Complete"** untuk menyelesaikan proses dan mengembalikan aset ke stok.

#### Mengelola Pelanggan & Pengguna
- **Pelanggan**: Buka **Daftar Pelanggan** untuk menambah, mengedit, atau melihat detail pelanggan, termasuk aset apa saja yang terpasang.
- **Akun & Divisi**: Buka **Pengaturan > Akun & Divisi** untuk mengelola akun pengguna dan daftar divisi perusahaan.

#### Mengelola Kategori
Buka **Pengaturan > Kategori & Model** untuk menambah atau mengubah Kategori, Tipe, dan Model Standar Aset. Ini memungkinkan sistem untuk beradaptasi dengan jenis-jenis aset baru di masa depan.
