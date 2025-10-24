# Panduan Deployment

Dokumen ini menjelaskan proses untuk membangun (build) dan men-deploy aplikasi frontend dan backend ke lingkungan produksi.

## 1. Konsep Dasar

Aplikasi ini terdiri dari dua bagian yang di-deploy secara terpisah:
1.  **Frontend (React)**: Sebuah _Single-Page Application_ (SPA). Setelah di-build, hasilnya adalah file statis (HTML, CSS, JS) yang dapat di-host di layanan hosting statis.
2.  **Backend (NestJS)**: Sebuah aplikasi server yang berjalan di lingkungan Node.js. Ini di-deploy sebagai layanan yang terus berjalan (misalnya, dalam sebuah kontainer Docker).

---

## 2. Deployment Frontend (Aplikasi React)

Frontend di-deploy sebagai situs statis. Proses ini sangat cepat dan efisien.

### Langkah 1: Build Aplikasi Frontend
-   Dari direktori root proyek, jalankan perintah build:
    ```bash
    pnpm run build
    ```
-   Perintah ini akan menghasilkan folder `dist/` yang berisi semua file HTML, CSS, dan JavaScript statis yang dioptimalkan untuk produksi.

### Langkah 2: Deploy di Platform Hosting Statis
-   Pilih platform yang dirancang untuk hosting statis. Platform ini biasanya menawarkan performa tinggi melalui CDN (Content Delivery Network).
-   **Rekomendasi Platform**: [Vercel](https://vercel.com/), [Netlify](https://www.netlify.com/), [AWS S3 + CloudFront](https://aws.amazon.com/s3/).

-   **Proses Deployment (Contoh dengan Vercel/Netlify)**:
    1.  Hubungkan repositori Git Anda ke platform.
    2.  **Konfigurasi Build**:
        -   **Build Command**: `pnpm run build`
        -   **Publish Directory**: `dist` (Pastikan ini adalah root direktori, bukan `frontend/dist`)
        -   **Install Command**: `pnpm install`
    3.  **Atur Environment Variables** (jika ada).
    4.  Deploy. Platform akan secara otomatis menjalankan build command setiap kali ada push baru ke cabang `main` (atau `develop`, sesuai konfigurasi).

### Langkah 3: Konfigurasi Proxy di Produksi
Di lingkungan development, Vite menangani _proxying_ request dari `/api` ke `http://localhost:3001`. Di produksi, ini tidak berfungsi. Anda perlu mengkonfigurasi _rewrites_ atau _proxy rules_ di platform hosting Anda untuk meneruskan panggilan API ke server backend.

-   **Contoh Konfigurasi (Vercel - `vercel.json`)**:
    ```json
    {
      "rewrites": [
        {
          "source": "/api/:path*",
          "destination": "https://your-backend-api.com/api/:path*"
        }
      ]
    }
    ```
-   **Contoh Konfigurasi (Netlify - `_redirects` atau `netlify.toml`)**:
    ```toml
    # netlify.toml
    [[redirects]]
      from = "/api/*"
      to = "https://your-backend-api.com/api/:splat"
      status = 200 # 200 untuk rewrite
    ```
Ini memastikan bahwa setiap panggilan dari frontend ke `/api/...` akan diteruskan ke server backend produksi Anda.

---

## 3. Deployment Backend (Target Implementasi)

> **Catatan**: Langkah-langkah berikut berlaku untuk server backend NestJS **setelah selesai dibangun**.

Metode yang direkomendasikan adalah menggunakan **Docker** untuk konsistensi dan portabilitas.

### Langkah-langkah:

1.  **Build Image Docker**:
    -   Dari direktori `backend/`, jalankan perintah build:
        ```bash
        docker build -t inventory-backend:latest .
        ```
    -   Perintah ini akan mengikuti instruksi di `Dockerfile` untuk menginstal dependensi, menjalankan `prisma generate`, membangun aplikasi, dan mengemas semuanya ke dalam sebuah image.

2.  **Push Image ke Container Registry**:
    -   Unggah image ke registry seperti Docker Hub, Google Container Registry (GCR), atau Amazon Elastic Container Registry (ECR).
        ```bash
        # Contoh untuk Docker Hub
        docker tag inventory-backend:latest yourusername/inventory-backend:latest
        docker push yourusername/inventory-backend:latest
        ```

3.  **Deploy di Platform Hosting**:
    -   Pilih platform hosting yang mendukung kontainer, misalnya:
        -   **PaaS (Rekomendasi)**: [Google Cloud Run](https://cloud.google.com/run), [AWS App Runner](https://aws.amazon.com/apprunner/), [DigitalOcean App Platform](https://www.digitalocean.com/products/app-platform).
    -   **Konfigurasi**:
        -   Gunakan image yang telah di-push ke registry.
        -   **Atur Environment Variables**: Masukkan `DATABASE_URL` (untuk database produksi), `JWT_SECRET`, dll. **JANGAN PERNAH** memasukkan nilai produksi ke dalam kode.
        -   **Koneksi Database**: Pastikan layanan backend dapat terhubung ke database PostgreSQL produksi.
        -   **Ekspos Port**: Pastikan port yang diekspos oleh kontainer (misal: port 3001) dipetakan dengan benar.

## 4. Otomatisasi (CI/CD)

Untuk praktik terbaik, proses deployment di atas harus diotomatisasi menggunakan pipeline CI/CD (Continuous Integration/Continuous Deployment) seperti GitHub Actions. Pipeline akan secara otomatis menjalankan tes, membangun image/aset, dan men-deploy ke lingkungan yang sesuai (misal: `staging` atau `production`) setelah merge ke cabang `develop` atau `main`.