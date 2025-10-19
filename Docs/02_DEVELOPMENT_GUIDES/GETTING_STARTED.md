# Panduan Memulai (Getting Started)

Dokumen ini berisi panduan langkah demi langkah untuk menyiapkan lingkungan pengembangan lokal untuk proyek **Aplikasi Inventori Aset**.

## 1. Prasyarat

Pastikan perangkat lunak berikut telah terinstal di komputer Anda:

-   **Node.js**: Versi 18.x atau yang lebih baru.
-   **pnpm**: Manajer paket yang direkomendasikan. (`npm install -g pnpm`)
-   **Git**: Sistem kontrol versi.
-   **Docker** dan **Docker Compose**: Untuk menjalankan database PostgreSQL.

## 2. Struktur Proyek

Proyek ini menggunakan _monorepo-style_ dengan dua folder utama:
-   `frontend/`: Berisi aplikasi React (sisi klien).
-   `backend/`: Berisi aplikasi NestJS (sisi server).

## 3. Setup Backend (Server)

Backend bertanggung jawab atas logika bisnis, API, dan interaksi database.

1.  **Navigasi ke Folder Backend**:
    ```bash
    cd backend
    ```

2.  **Instal Dependensi**:
    ```bash
    pnpm install
    ```

3.  **Setup Database (PostgreSQL dengan Docker)**:
    -   Pastikan Docker sedang berjalan.
    -   Dari dalam folder `backend/`, jalankan perintah berikut untuk memulai kontainer database:
        ```bash
        docker-compose up -d
        ```
    -   Ini akan membuat dan menjalankan database PostgreSQL berdasarkan konfigurasi di `docker-compose.yml`.

4.  **Konfigurasi Environment**:
    -   Buat salinan file `.env.example` dan namai `.env`.
        ```bash
        cp .env.example .env
        ```
    -   File `.env` sudah dikonfigurasi untuk terhubung ke database Docker. Anda tidak perlu mengubah `DATABASE_URL` jika menggunakan Docker.
    -   Ubah `JWT_SECRET` dengan string acak yang kuat untuk keamanan.

5.  **Jalankan Migrasi Database**:
    -   Perintah ini akan membuat tabel-tabel di database Anda berdasarkan skema di `prisma/schema.prisma`.
        ```bash
        pnpm prisma migrate dev
        ```

6.  **Jalankan Server Backend**:
    ```bash
    pnpm run start:dev
    ```
    -   Server akan berjalan dalam mode _watch_ (otomatis me-restart saat ada perubahan kode).
    -   Secara default, server akan tersedia di `http://localhost:3001`.
    -   Dokumentasi API (Swagger) dapat diakses di `http://localhost:3001/api/docs`.

## 4. Setup Frontend (Client)

Frontend bertanggung jawab atas semua yang dilihat dan diinteraksikan oleh pengguna.

1.  **Buka Terminal Baru**: Biarkan server backend tetap berjalan di terminal sebelumnya.

2.  **Navigasi ke Folder Frontend**:
    ```bash
    cd frontend
    ```

3.  **Instal Dependensi**:
    ```bash
    pnpm install
    ```

4.  **Jalankan Server Frontend**:
    ```bash
    pnpm run dev
    ```
    -   Server pengembangan Vite akan dimulai.
    -   Aplikasi frontend akan tersedia di `http://localhost:5173` (atau port lain jika 5173 sudah digunakan).
    -   Frontend sudah dikonfigurasi untuk berkomunikasi dengan backend di `http://localhost:3001` melalui _proxy_.

## 5. Menjalankan Aplikasi

Setelah kedua server (backend dan frontend) berjalan, buka `http://localhost:5173` di browser Anda untuk mulai menggunakan aplikasi.

---

## 6. Troubleshooting (Masalah Umum)

-   **Error: "connect ECONNREFUSED 127.0.0.1:5432" di Backend**
    -   **Penyebab**: Server backend tidak dapat terhubung ke database PostgreSQL.
    -   **Solusi**:
        1.  Pastikan Docker dan kontainer database sedang berjalan. Jalankan `docker ps` untuk memeriksa.
        2.  Jika tidak berjalan, jalankan `docker-compose up -d` di folder `backend/`.
        3.  Pastikan tidak ada aplikasi lain yang menggunakan port 5432.

-   **Error CORS di Frontend Browser Console**
    -   **Penyebab**: Frontend mencoba menghubungi backend, tetapi _proxy_ tidak berfungsi dengan benar atau backend tidak mengizinkan koneksi.
    -   **Solusi**:
        1.  Pastikan server backend (`localhost:3001`) berjalan.
        2.  Pastikan `vite.config.ts` di folder `frontend/` memiliki konfigurasi proxy yang benar.
        3.  Coba restart server frontend.

-   **Perintah `pnpm` tidak ditemukan**
    -   **Penyebab**: PNPM tidak terinstal secara global.
    -   **Solusi**: Jalankan `npm install -g pnpm`.

## 7. Langkah Anda Selanjutnya

Setelah berhasil menjalankan aplikasi, Anda siap untuk mulai berkontribusi!
1.  **Jelajahi Kode**: Lihat struktur folder di [Panduan Frontend](./FRONTEND_GUIDE.md) dan [Panduan Backend](./BACKEND_GUIDE.md).
2.  **Buat Perubahan Kecil**: Coba ubah teks di salah satu komponen frontend dan lihat perubahan langsung di browser.
3.  **Pelajari Alur Kerja Kontribusi**: Baca [Panduan Kontribusi](../../03_STANDARDS_AND_PROCESSES/CONTRIBUTING.md) sebelum memulai pekerjaan pada fitur baru.

Selamat! Lingkungan pengembangan Anda telah siap.