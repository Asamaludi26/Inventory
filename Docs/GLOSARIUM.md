# Glosarium Istilah

Dokumen ini berisi daftar definisi untuk istilah, akronim, dan konsep yang sering digunakan dalam proyek Aplikasi Inventori Aset. Tujuannya adalah untuk menciptakan pemahaman yang seragam di antara semua anggota tim.

---

### A

-   **Admin Logistik**
    Peran pengguna dari Divisi Logistik yang bertanggung jawab atas operasional gudang, pencatatan aset, serah terima, penarikan, dan manajemen perbaikan.

-   **Admin Purchase**
    Peran pengguna yang bertanggung jawab atas proses pengadaan, termasuk memproses, menyetujui, atau menolak permintaan aset.

-   **ADR (Architectural Decision Record)**
    Dokumen yang mencatat keputusan arsitektural penting yang dibuat selama pengembangan. Setiap ADR menjelaskan konteks, keputusan yang diambil, dan konsekuensinya. Lihat di [`/Docs/01_CONCEPT_AND_ARCHITECTURE/ADR/`](./01_CONCEPT_AND_ARCHITECTURE/ADR/).

-   **Aset**
    Barang fisik milik perusahaan yang dicatat dan dilacak oleh sistem, memiliki ID unik, dan siklus hidup yang dapat dipantau (misal: laptop, router, kabel).

-   **Ambang Batas (Threshold)**
    Jumlah minimum stok untuk sebuah item di gudang. Jika jumlah stok berada di bawah ambang batas ini, item tersebut dianggap "Stok Menipis".

### B

-   **BAK (Berita Acara Kerjasama)**
    Dokumen formal yang merangkum poin-poin kesepakatan kerjasama teknis dan operasional antara klien dan pengembang.
    
-   **BAST (Berita Acara Serah Terima)**
    Dokumen formal yang mencatat proses serah terima aset. Di aplikasi ini, BAST direpresentasikan oleh modul **Handover** (untuk serah terima internal) dan **Dismantle** (untuk penarikan dari pelanggan).
    
-   **Bulk Actions (Aksi Massal)**
    Fitur yang memungkinkan pengguna (biasanya Admin) untuk melakukan satu aksi (seperti Hapus, Setujui, Tolak) pada beberapa item terpilih sekaligus dari halaman daftar.

### C

-   **CPE (Customer Premises Equipment)**
    Perangkat jaringan yang dipasang di lokasi pelanggan untuk menyediakan layanan (misal: modem, router WiFi, ONT/ONU). Dalam aplikasi ini, CPE biasanya termasuk dalam kategori aset yang "dapat dipasang ke pelanggan".

### D

-   **Disposisi (Disposition)**
    Instruksi atau arahan dari manajemen tingkat atas (Super Admin/CEO) untuk memprioritaskan sebuah request. Menghasilkan notifikasi khusus untuk tim Admin.

-   **Dismantle**
    Proses penarikan kembali aset yang sebelumnya terpasang di lokasi pelanggan. Alur kerja ini menghasilkan Berita Acara Dismantle.

-   **DTO (Data Transfer Object)**
    Objek yang mendefinisikan bagaimana data dikirim melalui jaringan (misal: dari frontend ke backend). Di backend NestJS, DTO digunakan bersama `class-validator` untuk memastikan data yang masuk memiliki format yang benar.

### H

-   **Handover**
    Proses serah terima aset dari satu pengguna internal ke pengguna lain (misal: dari admin gudang ke teknisi lapangan). Alur kerja ini menghasilkan Berita Acara Serah Terima Internal.

### J

-   **JWT (JSON Web Token)**
    Standar token yang ringkas dan aman untuk autentikasi. Digunakan untuk memverifikasi identitas pengguna pada setiap permintaan API setelah mereka berhasil login.

### L

-   **Leader**
    Peran pengguna yang ditujukan untuk Manajer atau Supervisor (SPV) di setiap divisi. Memiliki hak akses lebih tinggi dari Staff, seperti membuat request tipe `Urgent` atau `Project Based`.

### M

-   **Mock API**
    Lapisan simulasi di frontend (`src/services/api.ts`) yang meniru perilaku API backend dengan membaca dan menulis data ke `localStorage`. Ini memungkinkan pengembangan frontend secara independen.

### O

-   **ORM (Object-Relational Mapper)**
    Pustaka (dalam proyek ini: **Prisma**) yang memungkinkan developer berinteraksi dengan database relasional menggunakan objek dan metode dalam bahasa pemrograman (TypeScript), alih-alih menulis query SQL mentah.

### P

-   **PITR (Point-in-Time Recovery)**
    Metode pencadangan database tingkat lanjut yang memungkinkan pemulihan data ke titik waktu yang sangat spesifik (misal: memulihkan database ke kondisi 5 menit sebelum terjadi error), bukan hanya ke backup harian terakhir.
    
-   **Preview Modal**
    Jendela modal (*popup*) yang digunakan di seluruh aplikasi untuk menampilkan ringkasan detail dari sebuah item (aset, pelanggan, request, dll.) tanpa harus meninggalkan halaman saat ini.

-   **PR (Pull Request)**
    Mekanisme di Git untuk mengajukan perubahan kode dari satu *branch* ke *branch* lain (biasanya dari *branch* fitur ke `develop`). Ini memicu proses *code review* sebelum perubahan digabungkan.

### R

-   **RBAC (Role-Based Access Control)**
    Model keamanan di mana hak akses pengguna ke sistem ditentukan oleh peran mereka (misal: `Staff`, `Leader`, `Admin Logistik`, `Admin Purchase`, `Super Admin`).

-   **REST API (Representational State Transfer Application Programming Interface)**
    Gaya arsitektur yang digunakan untuk komunikasi antara frontend dan backend. Frontend mengirim request (misal: `GET`, `POST`) ke URL tertentu di backend, dan backend merespons dengan data (biasanya dalam format JSON).

### S

-   **SPA (Single-Page Application)**
    Aplikasi web (seperti yang dibuat dengan React) yang memuat satu halaman HTML tunggal dan secara dinamis memperbarui kontennya saat pengguna berinteraksi, tanpa perlu memuat ulang seluruh halaman.
