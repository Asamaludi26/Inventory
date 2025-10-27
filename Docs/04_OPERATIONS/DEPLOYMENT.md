# Panduan Deployment Produksi

Dokumen ini menjelaskan proses teknis untuk membangun (build) dan men-deploy aplikasi **full-stack** (frontend dan backend) ke server produksi, seperti server milik PT. Triniti.

## 1. Konsep Arsitektur Deployment

Kita akan men-deploy dua aplikasi berbeda yang bekerja sama di satu server, diatur oleh sebuah **Reverse Proxy (Nginx)**.

-   **Aplikasi Frontend (React)**: Hasil build-nya adalah **file statis** (HTML, CSS, JS). Nginx akan bertugas menyajikan file-file ini langsung ke pengguna.
-   **Aplikasi Backend (NestJS)**: Hasil build-nya adalah aplikasi **Node.js**. Aplikasi ini akan berjalan sebagai layanan (*service*) di latar belakang pada port internal (misal: `3001`) menggunakan manajer proses seperti **PM2**.
-   **Nginx (Reverse Proxy)**: Bertindak sebagai pintu gerbang utama. Ia akan menerima semua trafik dari domain publik (misal: `aset.trinitimedia.com`) dan meneruskannya ke layanan yang tepat:
    -   Request ke `/api/*` akan diteruskan ke aplikasi backend.
    -   Semua request lainnya akan dilayani oleh file statis frontend.

**Diagram Alur Produksi:**
```mermaid
graph TD
    User[Pengguna] -- "HTTP Request ke aset.trinitimedia.com" --> Nginx

    subgraph "Server Produksi"
        Nginx
        
        subgraph "Aplikasi Backend (Berjalan via PM2)"
            Backend[Proses NestJS @ localhost:3001]
        end

        subgraph "File Statis Frontend"
            Frontend[Direktori /var/www/assetflow/frontend]
        end
    end
    
    Nginx -- "Jika request adalah '/api/*'" --> Backend
    Nginx -- "Jika request BUKAN '/api/*'" --> Frontend
```

---

## 2. Persiapan Server

Pastikan server Linux (misal: Ubuntu) sudah terinstal perangkat lunak berikut:
-   **Nginx**: `sudo apt install nginx`
-   **Node.js** (v18+): Gunakan `nvm` atau `nodesource` untuk instalasi.
-   **pnpm**: `npm install -g pnpm`
-   **PM2**: `pnpm add -g pm2`

---

## 3. Proses Deployment (Langkah-demi-Langkah)

### Langkah 1: Build Kedua Aplikasi di Mesin Lokal
Sebelum men-deploy, kita perlu membuat versi produksi dari kedua aplikasi.

1.  **Build Frontend**:
    ```bash
    cd frontend
    pnpm install
    pnpm run build
    ```
    -   **Hasil**: Folder baru `frontend/dist/`. Folder inilah yang akan kita deploy.

2.  **Build Backend**:
    ```bash
    cd backend
    pnpm install
    pnpm run build
    ```
    -   **Hasil**: Folder baru `backend/dist/`.

### Langkah 2: Deploy File ke Server
Salin file yang relevan dari komputer lokal Anda ke server produksi. Anda bisa menggunakan `scp` atau `rsync`.

1.  **Salin Build Frontend**:
    Salin **isi** dari folder `frontend/dist/` ke direktori di server.
    ```bash
    # Contoh menggunakan rsync
    rsync -avz frontend/dist/ user@your_server_ip:/var/www/assetflow/frontend
    ```
    > **Penting**: Buat direktori `/var/www/assetflow/frontend` di server jika belum ada.

2.  **Salin Folder Backend**:
    Salin **seluruh folder** `backend/` ke server. Kita membutuhkan `package.json` untuk menginstal dependensi produksi.
    ```bash
    # Contoh menggunakan rsync
    rsync -avz backend/ user@your_server_ip:/var/www/assetflow/backend
    ```

### Langkah 3: Setup dan Jalankan Backend di Server
SSH ke server Anda dan jalankan perintah berikut.

1.  **Masuk ke Direktori Backend**:
    ```bash
    cd /var/www/assetflow/backend
    ```

2.  **Instal Dependensi Produksi**:
    Perintah ini hanya akan menginstal paket yang dibutuhkan untuk produksi, bukan dependensi pengembangan.
    ```bash
    pnpm install --production
    ```
    
3.  **Setup File `.env`**:
    Buat file `.env` di dalam direktori `backend/` dan isi dengan konfigurasi produksi.
    ```env
    DATABASE_URL="postgresql://USER:PASSWORD@HOST_PROD:PORT/DATABASE_PROD?schema=public"
    JWT_SECRET="<your-long-random-secret-key>"
    ```

4.  **Jalankan Aplikasi dengan PM2**:
    PM2 adalah manajer proses yang akan menjaga aplikasi Node.js tetap berjalan dan akan me-restartnya secara otomatis jika terjadi _crash_.
    ```bash
    # Memulai aplikasi dan memberinya nama
    pm2 start dist/main.js --name assetflow-backend

    # Menyimpan daftar proses agar otomatis berjalan saat server reboot
    pm2 save
    ```

5.  **Verifikasi**:
    Pastikan aplikasi backend berjalan dengan `pm2 list`. Anda akan melihat `assetflow-backend` dengan status `online`.

### Langkah 4: Konfigurasi Nginx sebagai Reverse Proxy
Langkah terakhir adalah memberitahu Nginx bagaimana cara menangani trafik.

1.  **Buat File Konfigurasi Nginx Baru**:
    ```bash
    sudo nano /etc/nginx/sites-available/assetflow
    ```

2.  **Isi File Konfigurasi**:
    Salin dan tempel konfigurasi berikut. **Ganti `aset.trinitimedia.com` dengan domain Anda**.
    ```nginx
    server {
        listen 80;
        server_name aset.trinitimedia.com;

        # Logging
        access_log /var/log/nginx/assetflow-access.log;
        error_log /var/log/nginx/assetflow-error.log;

        # Aturan untuk API Backend
        # Semua request yang dimulai dengan /api/ akan diteruskan ke aplikasi NestJS
        location /api/ {
            proxy_pass http://localhost:3001;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # Aturan untuk menyajikan file Frontend
        # Semua request lain akan dilayani oleh file statis React
        location / {
            root /var/www/assetflow/frontend;
            try_files $uri /index.html;
        }
    }
    ```

3.  **Aktifkan Situs dan Restart Nginx**:
    ```bash
    # Buat symbolic link untuk mengaktifkan konfigurasi
    sudo ln -s /etc/nginx/sites-available/assetflow /etc/nginx/sites-enabled/

    # Tes konfigurasi untuk memastikan tidak ada error
    sudo nginx -t

    # Jika tes berhasil, restart Nginx untuk menerapkan perubahan
    sudo systemctl restart nginx
    ```

Aplikasi Anda sekarang seharusnya sudah aktif dan dapat diakses melalui domain yang telah dikonfigurasi.
