# Panduan Pengembangan Frontend

Dokumen ini menjelaskan arsitektur, pola, dan konvensi yang digunakan dalam pengembangan frontend aplikasi Inventori Aset.

## 1. Prinsip Utama

-   **Modular & Dapat Digunakan Kembali (Reusable)**: Kode diorganisir ke dalam komponen-komponen kecil dan independen yang mudah untuk digunakan kembali dan diuji.
-   **Pemisahan Tanggung Jawab (Separation of Concerns)**: Logika bisnis, logika tampilan (UI), dan manajemen state dipisahkan untuk meningkatkan keterbacaan dan pemeliharaan.
-   **Kinerja**: Aplikasi dirancang agar tetap cepat dan responsif, terutama saat menangani data dalam jumlah besar, dengan menerapkan teknik seperti paginasi dan memoization (`useMemo`).
-   **Pengalaman Pengguna (UX)**: Antarmuka harus intuitif, konsisten, dan memberikan umpan balik yang jelas kepada pengguna (misalnya, state loading, pesan error, notifikasi).

## 2. Tumpukan Teknologi

-   **Framework**: **React 18**
-   **Bahasa**: **TypeScript**
-   **Styling**: **Tailwind CSS**
-   **Manajemen State**: **React Hooks** (`useState`, `useContext`, `useMemo`). State global diangkat ke komponen root (`App.tsx`) dan didistribusikan ke komponen anak melalui props.
-   **Pustaka Ikon**: **React Icons**

## 3. Struktur Folder (`src`)

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

## 4. Alur Data & Manajemen State

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

## 5. Filosofi Komponen

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

## 6. Styling dengan Tailwind CSS

-   **Utility-First**: Gunakan kelas utilitas Tailwind secara langsung di dalam JSX.
-   **Konfigurasi Tema**: Warna kustom (`tm-primary`, `tm-accent`), font, dan ekstensi lainnya didefinisikan di `index.html`.
-   **Kelas Kustom**: Untuk properti yang lebih kompleks (seperti scrollbar atau animasi), kelas CSS global didefinisikan di `index.html`.

## 7. Interaksi dengan API (Simulasi)

-   **Mock API Layer (`src/services/api.ts`)**: Semua logika untuk berkomunikasi dengan data terpusat di file ini.
-   **Prinsip Kerja**:
    1.  Saat aplikasi dimuat, fungsi `fetchAllData` memeriksa `localStorage`.
    2.  Jika data tidak ada di `localStorage`, data awal dari `src/data/mockData.ts` akan dimuat dan disimpan.
    3.  Jika data ada, data dari `localStorage` yang akan digunakan.
    4.  Setiap operasi "tulis" (membuat, mengedit, menghapus) memanggil fungsi `updateData`, yang akan menyimpan keseluruhan state (misal: seluruh array `assets`) kembali ke `localStorage`.
-   **Tujuan**: Pendekatan ini memungkinkan pengembangan frontend yang sepenuhnya independen dan memberikan pengalaman persistensi data yang realistis selama sesi pengembangan.
-   **Rencana Integrasi**: Ketika backend siap, fungsi-fungsi di dalam `api.ts` akan diganti dengan panggilan `fetch` atau `axios` ke endpoint REST API yang sesungguhnya, tanpa perlu mengubah logika di dalam komponen React secara signifikan.

## 8. Pemetaan Tipe Data
File `src/types/index.ts` adalah satu-satunya sumber kebenaran (*single source of truth*) untuk semua bentuk data di aplikasi. Tipe-tipe ini (seperti `Asset`, `Request`, `User`) harus dijaga agar tetap sinkron dengan skema database dan DTO di backend.