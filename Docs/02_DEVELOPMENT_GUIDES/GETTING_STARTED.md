# Panduan Memulai (Getting Started)

Dokumen ini berisi panduan langkah demi langkah untuk menyiapkan dan menjalankan **prototipe frontend** Aplikasi Inventori Aset di lingkungan pengembangan lokal.

## 1. Status Proyek Saat Ini

Penting untuk dipahami bahwa proyek yang akan Anda jalankan adalah **aplikasi frontend mandiri (standalone)**.
-   **Tidak ada backend**: Aplikasi ini **tidak** memerlukan server backend atau database untuk berjalan.
-   **Simulasi Data**: Semua data (aset, pengguna, request, dll.) disimulasikan menggunakan **Mock API** yang menyimpan data di `localStorage` browser Anda. Ini berarti data akan tetap ada saat Anda me-refresh halaman, tetapi akan hilang jika Anda membersihkan data situs di browser.

Tujuan dari setup ini adalah untuk memungkinkan pengembangan, pengujian, dan demonstrasi UI/UX secara penuh tanpa ketergantungan pada backend.

## 2. Prasyarat

Pastikan perangkat lunak berikut telah terinstal di komputer Anda:

-   **Node.js**: Versi 18.x atau yang lebih baru.
-   **pnpm**: Manajer paket yang direkomendasikan. Jika belum terinstal, jalankan:
    ```bash
    npm install -g pnpm
    ```
-   **Git**: Sistem kontrol versi.

## 3. Proses Setup

1.  **Clone Repositori**:
    Buka terminal Anda dan clone repositori proyek ke direktori lokal.
    ```bash
    git clone <url-repositori-proyek>
    cd <nama-folder-proyek>
    ```

2.  **Instal Dependensi**:
    Aplikasi ini menggunakan `pnpm` untuk mengelola dependensi. Jalankan perintah berikut dari direktori root proyek:
    ```bash
    pnpm install
    ```
    Perintah ini akan membaca file `pnpm-lock.yaml` dan menginstal semua paket yang dibutuhkan.

3.  **Jalankan Server Pengembangan**:
    Setelah instalasi selesai, jalankan server pengembangan Vite:
    ```bash
    pnpm run dev
    ```

4.  **Buka Aplikasi**:
    Server akan memulai dan menampilkan URL di terminal Anda, biasanya:
    -   **Local**: `http://localhost:5173`

    Buka URL tersebut di browser web modern (Chrome, Firefox, Edge). Aplikasi sekarang siap digunakan.

## 4. Cara Kerja Mock API

-   **Lokasi Kode**: Logika untuk simulasi API berada di `src/services/api.ts`.
-   **Penyimpanan**: Data awal dimuat dari `src/data/mockData.ts` saat pertama kali aplikasi dijalankan. Setiap perubahan (membuat, mengedit, menghapus data) akan disimpan ke `localStorage` browser Anda.
-   **Inspeksi Data**: Anda dapat melihat data yang tersimpan dengan membuka Developer Tools di browser Anda (`F12` atau `Ctrl+Shift+I`), pergi ke tab `Application`, dan lihat di bawah `Local Storage`. Anda akan menemukan kunci seperti `app_assets`, `app_requests`, dll.

## 5. Troubleshooting (Masalah Umum)

-   **Error: `pnpm: command not found`**
    -   **Penyebab**: `pnpm` tidak terinstal secara global atau path-nya tidak ada di environment variable sistem Anda.
    -   **Solusi**: Jalankan `npm install -g pnpm`. Tutup dan buka kembali terminal Anda.

-   **Aplikasi menampilkan halaman kosong atau error saat dijalankan.**
    -   **Penyebab**: Dependensi mungkin tidak terinstal dengan benar atau ada masalah dengan cache.
    -   **Solusi**:
        1.  Hentikan server pengembangan (`Ctrl+C`).
        2.  Hapus folder `node_modules`: `rm -rf node_modules`.
        3.  Jalankan kembali `pnpm install`.
        4.  Jalankan kembali `pnpm run dev`.

-   **Data kembali ke kondisi awal.**
    -   **Penyebab**: Anda mungkin membersihkan data situs (`Clear site data`) di browser, yang akan menghapus `localStorage`.
    -   **Solusi**: Ini adalah perilaku yang diharapkan dari Mock API. Data akan dimuat ulang dari file mock saat Anda me-refresh halaman.

## 6. Langkah Selanjutnya

Setelah berhasil menjalankan aplikasi, Anda siap untuk mulai berkontribusi!
1.  **Jelajahi Kode**: Lihat struktur folder di [Panduan Frontend](./FRONTEND_GUIDE.md).
2.  **Buat Perubahan Kecil**: Coba ubah teks di salah satu komponen dan lihat perubahan langsung di browser berkat *Hot Module Replacement* (HMR) dari Vite.
3.  **Pelajari Alur Kerja Kontribusi**: Baca [Panduan Kontribusi](../03_STANDARDS_AND_PROCEDURES/CONTRIBUTING.md) sebelum memulai pekerjaan pada fitur baru.

Selamat! Lingkungan pengembangan frontend Anda telah siap.