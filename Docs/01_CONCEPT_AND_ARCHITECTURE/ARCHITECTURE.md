# Arsitektur Sistem & Konsep

Dokumen ini menjelaskan blueprint arsitektural tingkat tinggi dari Aplikasi Inventori Aset. Tujuannya adalah untuk memberikan pemahaman konseptual tentang bagaimana komponen-komponen utama sistem saling terhubung dan berinteraksi.

---

## 1. Visi Arsitektur

Aplikasi ini dirancang dengan arsitektur **Client-Server** yang modern dan terpisah (_decoupled_). Ini memungkinkan pengembangan, penskalaan, dan pemeliharaan yang independen antara antarmuka pengguna (Frontend) dan logika bisnis (Backend).

-   **Frontend (Client)**: Aplikasi React yang berjalan di browser pengguna. Bertanggung jawab penuh atas UI/UX, menampilkan data, dan menangkap input pengguna.
-   **Backend (Server)**: Aplikasi NestJS yang berjalan di server. Bertanggung jawab atas logika bisnis, validasi data, keamanan, dan interaksi dengan database.
-   **Database**: PostgreSQL sebagai penyimpan data persisten.
-   **Komunikasi**: Frontend dan Backend berkomunikasi melalui **REST API** yang aman menggunakan format JSON.

Untuk detail teknologi yang digunakan, silakan lihat dokumen [**Tumpukan Teknologi**](./TECHNOLOGY_STACK.md).

---

## 2. Diagram Arsitektur (C4 Model)

Diagram berikut menggunakan notasi C4 untuk memvisualisasikan arsitektur dalam berbagai tingkat detail.

### Level 1: Diagram Konteks Sistem

Diagram ini menunjukkan gambaran besar: bagaimana sistem aplikasi inventori berinteraksi dengan pengguna dan sistem lain (potensial).

```mermaid
graph TD
    subgraph "Pengguna Internal"
        A[Staff / Manajer]
        B[Admin / Super Admin]
    end

    C(Aplikasi Inventori Aset)

    A -- "Menggunakan (Web Browser)" --> C
    B -- "Mengelola (Web Browser)" --> C
    
    style A fill:#9f7aea,stroke:#333,stroke-width:2px
    style B fill:#9f7aea,stroke:#333,stroke-width:2px
    style C fill:#4299e1,stroke:#333,stroke-width:2px
```

### Level 2: Diagram Kontainer

Diagram ini memperbesar "Aplikasi Inventori Aset" untuk menunjukkan komponen-komponen utama di dalamnya.

```mermaid
graph TD
    A["Pengguna <br> (Staff/Admin)"]

    subgraph "Infrastruktur Server"
        subgraph "Aplikasi Inventori Aset"
            F["<b>Aplikasi Frontend</b><br>[React SPA]<br><br>Menyajikan antarmuka pengguna<br>dan logika sisi klien."]
            G["<b>API Backend</b><br>[Server NestJS]<br><br>Menangani logika bisnis, otentikasi,<br>dan akses data."]
        end
        
        H["<b>Database</b><br>[PostgreSQL]<br><br>Menyimpan semua data<br>aset, pengguna, request, dll."]
    end

    A -- "Mengakses via HTTPS" --> F
    F -- "Memanggil API via HTTPS<br>[JSON]" --> G
    G -- "Membaca/Menulis Data via TCP/IP" --> H

    style F fill:#63b3ed,stroke:#333,stroke-width:2px
    style G fill:#4299e1,stroke:#333,stroke-width:2px
    style H fill:#3182ce,stroke:#333,stroke-width:2px
```

---

## 3. Alur Data Utama

### 3.1. Proses Request Aset

Diagram berikut menggambarkan alur data dan interaksi antar komponen saat seorang staf membuat permintaan aset baru hingga disetujui.

```mermaid
sequenceDiagram
    participant Staff
    participant Frontend
    participant Backend
    participant Database

    Staff ->> Frontend: Mengisi & Mengajukan Form Request
    Frontend ->> Backend: POST /api/requests (data request)
    activate Backend
    Backend ->> Backend: Validasi data (DTO)
    Backend ->> Database: Simpan request baru (status: PENDING)
    activate Database
    Database -->> Backend: Data request tersimpan
    deactivate Database
    Backend -->> Frontend: Response 201 Created (request baru)
    deactivate Backend
    Frontend ->> Staff: Tampilkan notifikasi "Request Berhasil Dibuat"

    Note over Frontend, Database: Beberapa saat kemudian...

    participant Admin
    Admin ->> Frontend: Membuka detail request
    Frontend ->> Backend: GET /api/requests/:id
    activate Backend
    Backend ->> Database: Ambil data request
    activate Database
    Database -->> Backend: Data request
    deactivate Database
    Backend -->> Frontend: Response 200 OK (data request)
    deactivate Backend
    Frontend ->> Admin: Tampilkan detail request

    Admin ->> Frontend: Klik tombol "Setujui"
    Frontend ->> Backend: POST /api/requests/:id/approve
    activate Backend
    Backend ->> Backend: Cek Otorisasi (Admin Role)
    Backend ->> Database: Update status request menjadi LOGISTIC_APPROVED
    activate Database
    Database -->> Backend: Data request terupdate
    deactivate Database
    Backend -->> Frontend: Response 200 OK (request terupdate)
    deactivate Backend
    Frontend ->> Admin: Tampilkan notifikasi "Request Disetujui"
```

### 3.2. Alur Serah Terima Aset (Handover)

Diagram ini mengilustrasikan proses serah terima aset internal dari Admin ke seorang Staff.

```mermaid
sequenceDiagram
    participant Admin
    participant Frontend
    participant Backend
    participant Database

    Admin->>Frontend: Mengisi form Handover (pilih aset, penerima)
    Frontend->>Backend: POST /api/handovers (data handover)
    activate Backend

    Backend->>Backend: Validasi data & otorisasi
    Backend->>Database: 1. Buat record Handover baru
    activate Database
    Database-->>Backend: Record Handover tersimpan
    deactivate Database

    Backend->>Database: 2. Update status & currentUser pada record Asset
    activate Database
    Database-->>Backend: Record Asset terupdate
    deactivate Database

    Backend-->>Frontend: Response 201 Created (data handover)
    deactivate Backend
    Frontend->>Admin: Tampilkan notifikasi "Handover Berhasil"
```

---

## 4. Referensi Lanjutan

Untuk detail implementasi yang lebih spesifik, silakan merujuk ke dokumen berikut:

-   [**Panduan Pengembangan Frontend**](../02_DEVELOPMENT_GUIDES/FRONTEND_GUIDE.md)
-   [**Panduan Pengembangan Backend**](../02_DEVELOPMENT_GUIDES/BACKEND_GUIDE.md)
