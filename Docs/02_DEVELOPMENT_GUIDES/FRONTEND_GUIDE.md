# Panduan Pengembangan Frontend

Dokumen ini menjelaskan arsitektur, pola, dan konvensi yang digunakan dalam pengembangan frontend aplikasi Inventori Aset.

## 1. Prinsip Utama

-   **Modular & Dapat Digunakan Kembali (Reusable)**: Kode diorganisir ke dalam komponen-komponen kecil dan independen yang mudah untuk digunakan kembali dan diuji.
-   **Pemisahan Tanggung Jawab (Separation of Concerns)**: Logika bisnis, logika tampilan (UI), dan manajemen state dipisahkan untuk meningkatkan keterbacaan dan pemeliharaan.
-   **Kinerja**: Aplikasi dirancang agar tetap cepat dan responsif, terutama saat menangani data dalam jumlah besar, dengan menerapkan teknik seperti paginasi dan memoization (`useMemo`).
-   **Pengalaman Pengguna (UX)**: Antarmuka harus intuitif, konsisten, dan memberikan umpan balik yang jelas kepada pengguna (misalnya, state loading, pesan error, notifikasi).

## 2. Peran React & Vite: Koki & Dapur

Penting untuk memahami bahwa **React** dan **Vite** bukanlah teknologi yang bersaing, melainkan **partner yang bekerja sama**.

> **Analogi Sederhana**:
> -   **React adalah Kokinya**: React adalah ahli dalam meracik "hidangan" (komponen UI). Dia tahu resep (`<button>`, `<div>`), logika penyajian (`useState`), dan cara menyusun semuanya menjadi tampilan yang fungsional.
> -   **Vite adalah Dapur Modern & Jasa Pengirimannya**: Vite menyediakan dua fungsi vital untuk si koki (React):
>     1.  **Dapur Super Cepat (Development)**: Saat Anda menjalankan `pnpm run dev`, Vite menyediakan lingkungan pengembangan yang instan. Setiap kali Anda mengubah resep (kode), hasilnya langsung terlihat di browser tanpa menunggu lama.
>     2.  **Sistem Pengemasan & Pengiriman (Build)**: Saat Anda menjalankan `pnpm run build`, Vite akan "mengemas" semua resep dan bahan (kode React, CSS, gambar) menjadi beberapa kotak kecil yang teroptimasi (folder `dist/`). Kotak-kotak inilah yang siap dikirim dan disajikan di "meja pelanggan" (browser pengguna).

Secara singkat: kita menggunakan **React** untuk **membangun** antarmuka, dan **Vite** untuk **mengembangkan dan mem-bundle** aplikasi React tersebut agar siap di-deploy.

## 3. Tumpukan Teknologi

-   **Pustaka UI**: **React 18**
-   **Alat Build & Dev Server**: **Vite**
-   **Bahasa**: **TypeScript**
-   **Styling**: **Tailwind CSS**
-   **Manajemen State**: **React Hooks** (`useState`, `useContext`, `useMemo`). State global diangkat ke komponen root (`App.tsx`) dan didistribusikan ke komponen anak melalui props.
-   **Pustaka Ikon**: **React Icons**

## 4. Struktur Folder (`src`)

Arsitektur folder adalah fondasi dari sebuah *codebase* yang sehat. Struktur yang baik memungkinkan skalabilitas, kemudahan perawatan, dan produktivitas tim. Struktur folder proyek ini dirancang dengan tiga prinsip utama untuk memastikan kualitas jangka panjang:

> **1. Skalabilitas & Modularitas (Siap untuk Masa Depan)**
> Inti dari aplikasi berada di dalam `src/features/`. Setiap fitur bisnis utama (misalnya `itemRequest`, `dashboard`) ditempatkan dalam foldernya sendiri. Ini memungkinkan tim untuk mengerjakan fitur secara terisolasi dan memudahkan penambahan modul baru di masa depan tanpa merombak struktur yang ada.

> **2. Pemisahan Tanggung Jawab (Separation of Concerns)**
> Kami secara tegas memisahkan komponen UI "bodoh" yang dapat digunakan kembali (`src/components/ui/`) dari komponen "pintar" yang mengelola logika bisnis (`src/features/`). Lapisan data (`src/services/api.ts`) dan tipe (`src/types/`) juga terisolasi. Hal ini secara drastis mempercepat proses *debugging* dan pemeliharaan.

> **3. Kemudahan Navigasi (Discoverability)**
> Penamaan file dan folder bersifat deskriptif dan konsisten. Developer baru dapat dengan cepat memahami di mana harus mencari atau menempatkan kode, mengurangi waktu orientasi dan meningkatkan produktivitas tim.

Struktur folder dirancang berdasarkan **fitur** untuk menjaga agar kode yang saling terkait tetap berdekatan. Hierarki detailnya adalah sebagai berikut:

```
src/
│
├── App.tsx             # Komponen root, menangani routing, layout utama, dan state global.
├── index.tsx           # Titik masuk aplikasi React.
│
├── components/         # Komponen UI "bodoh" (dumb) yang dapat digunakan kembali di seluruh aplikasi.
│   ├── icons/          # Kumpulan komponen ikon (misal: AssetIcon.tsx, CloseIcon.tsx).
│   ├── layout/         # Komponen untuk struktur halaman (misal: Sidebar.tsx, FormPageLayout.tsx).
│   └── ui/             # Komponen UI dasar & interaktif (misal: Modal.tsx, CustomSelect.tsx, DatePicker.tsx).
│
├── features/           # Folder utama untuk setiap fitur/halaman bisnis. Setiap folder adalah modul mandiri.
│   ├── auth/           # Alur login dan autentikasi.
│   ├── assetRegistration/ # Halaman dan logika untuk mencatat aset.
│   ├── dashboard/      # Halaman utama setelah login.
│   ├── itemRequest/    # Alur kerja permintaan aset baru.
│   ├── handover/       # Alur kerja serah terima aset.
│   ├── dismantle/      # Alur kerja penarikan aset.
│   ├── repair/         # Alur kerja manajemen perbaikan aset.
│   ├── stock/          # Halaman ringkasan stok aset.
│   ├── customers/      # Manajemen data pelanggan.
│   ├── users/          # Manajemen akun pengguna.
│   ├── categories/     # Manajemen kategori, tipe, dan model aset.
│   └── preview/        # Modal pratinjau detail yang dapat digunakan lintas fitur.
│
├── hooks/              # Custom React Hooks yang dapat digunakan kembali.
│   ├── useSortableData.ts
│   ├── useLongPress.ts
│
├── providers/          # Penyedia konteks (React Context) untuk fungsionalitas global.
│   └── NotificationProvider.tsx # Mengelola sistem notifikasi (toast) di seluruh aplikasi.
│
├── services/           # Modul untuk berkomunikasi dengan API backend (saat ini Mock API).
│   └── api.ts          # Berisi semua fungsi untuk mengambil atau mengirim data.
│
├── types/              # Definisi tipe dan interface TypeScript global.
│   └── index.ts        # File tunggal untuk semua tipe data (Asset, Request, User, dll).
│
└── utils/              # Fungsi utilitas murni (pure functions) yang tidak terkait dengan React.
    ├── csvExporter.ts  # Fungsi untuk mengekspor data ke format CSV.
    └── scanner.ts      # Logika untuk mem-parsing data dari pemindai QR/Barcode.
```

## 5. Alur Data & Manajemen State

State global (seperti daftar aset, request, pengguna) dikelola di komponen `AppContent.tsx` menggunakan `useState`. Data ini kemudian dioper ke bawah ke komponen-komponen fitur melalui `props`.

Setiap perubahan pada state global (misalnya, menambah aset baru) dilakukan melalui fungsi yang juga dioper sebagai `props`. Fungsi ini akan memanggil `api.ts` untuk menyimpan perubahan ke `localStorage`, lalu memperbarui state di `AppContent.tsx`, yang secara otomatis memicu re-render pada komponen yang relevan.

**Diagram Alur Data Sederhana:**

```mermaid
graph TD
    subgraph App.tsx
        A[<b>State Global</b><br>(assets, requests, dll.)]
        B[<b>Fungsi Update</b><br>(setAssets, setRequests)]
    end
    
    subgraph "Komponen Halaman"
        C[ItemRequestPage.tsx]
    end

    subgraph "Service Layer"
        D[api.ts]
    end
    
    subgraph "Penyimpanan Browser"
        E[localStorage]
    end

    A -- "Props (data)" --> C
    B -- "Props (fungsi)" --> C
    
    C -- "1. Pengguna membuat request baru" --> B
    B -- "2. Memanggil api.updateData()" --> D
    D -- "3. Menyimpan data ke localStorage" --> E
    D -- "4. Mengembalikan data baru" --> B
    B -- "5. Memperbarui state global" --> A

    style A fill:#ffe4b5
    style B fill:#ffe4b5
    style C fill:#bde4ff
    style D fill:#c1f0c1
    style E fill:#d3d3d3
```

## 6. Filosofi Komponen

-   **Komponen UI (`src/components/ui`)**:
    -   Komponen ini bersifat **presentasional** (bodoh/dumb).
    -   Mereka tidak tahu tentang logika bisnis atau dari mana data berasal.
    -   Mereka menerima data dan fungsi callback melalui `props`.
    -   Contoh: `Modal.tsx`, `CustomSelect.tsx`.

-   **Komponen Fitur (`src/features/...`)**:
    -   Komponen ini bersifat **pintar** (smart) atau _container_.
    -   Mereka bertanggung jawab atas logika bisnis, mengambil data, dan mengelola state untuk sebuah fitur.
    -   Mereka menggunakan komponen UI untuk membangun antarmuka.
    -   Contoh: `ItemRequestPage.tsx` mengelola logika untuk membuat dan menampilkan request, menggunakan `Modal`, `DatePicker`, dan komponen UI lainnya.

## 7. Interaksi dengan API (Simulasi)

-   **Mock API Layer (`src/services/api.ts`)**: Semua logika untuk berkomunikasi dengan data terpusat di file ini.
-   **Prinsip Kerja**:
    1.  Saat aplikasi dimuat, fungsi `fetchAllData` memeriksa `localStorage`.
    2.  Jika data tidak ada, data awal dari `src/data/mockData.ts` akan dimuat.
    3.  Setiap operasi "tulis" memanggil `updateData`, yang menyimpan state kembali ke `localStorage`.
-   **Rencana Integrasi**: Ketika backend siap, fungsi-fungsi di `api.ts` akan diganti dengan panggilan `fetch` atau `axios` ke endpoint REST API, tanpa perlu mengubah logika komponen secara signifikan.