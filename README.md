# Dokumentasi Aplikasi Inventori Aset

Selamat datang di pusat dokumentasi untuk Aplikasi Inventori Aset PT. Triniti Media Indonesia. Dokumen ini berfungsi sebagai gerbang utama untuk semua sumber daya, panduan, dan referensi yang berkaitan dengan proyek ini.

## Deskripsi Singkat

Aplikasi ini adalah sistem terpusat yang modern, aman, dan efisien untuk mengelola seluruh siklus hidup aset—mulai dari permintaan, pencatatan, serah terima, instalasi di pelanggan, hingga penarikan dan penghapusan.

## Daftar Isi Dokumentasi

Berikut adalah struktur dokumentasi yang dirancang untuk membantu Anda menemukan informasi yang relevan dengan cepat.

| Kategori                                     | Dokumen                                                                              | Deskripsi                                                                                         |
| -------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| **1. Konsep & Arsitektur** <br>_Gambaran besar_  | [**Product Requirements Document (PRD)**](../../01_CONCEPT_AND_ARCHITECTURE/PRODUCT_REQUIREMENTS.md) | **(WAJIB DIBACA)** Dokumen fundamental yang menjelaskan APA yang harus dibangun dan MENGAPA.      |
|                                              | [Arsitektur Sistem](../../01_CONCEPT_AND_ARCHITECTURE/ARCHITECTURE.md)                 | Blueprint dan diagram arsitektur tingkat tinggi yang menjelaskan interaksi antar komponen sistem.   |
|                                              | [Skema Database (ERD)](../../01_CONCEPT_AND_ARCHITECTURE/DATABASE_SCHEMA.md)               | Visualisasi struktur database, relasi antar tabel, dan kamus data.                                |
|                                              | [Tumpukan Teknologi](../../01_CONCEPT_AND_ARCHITECTURE/TECHNOLOGY_STACK.md)                | Rincian teknologi yang digunakan dan alasan di balik setiap pilihan.                              |
|                                              | [Catatan Keputusan Arsitektural (ADR)](../../01_CONCEPT_AND_ARCHITECTURE/ADR/)             | Kumpulan catatan keputusan teknis penting yang dibuat selama pengembangan.                        |
| **2. Panduan Pengembangan** <br>_Mulai koding_ | [**Panduan Memulai (Wajib)**](../../02_DEVELOPMENT_GUIDES/GETTING_STARTED.md)              | Panduan langkah demi langkah untuk menyiapkan lingkungan pengembangan lokal.                        |
|                                              | [Panduan Frontend](../../02_DEVELOPMENT_GUIDES/FRONTEND_GUIDE.md)                          | Penjelasan mendalam tentang arsitektur sisi klien (React), state management, dan styling.       |
|                                              | [Panduan Backend](../../02_DEVELOPMENT_GUIDES/BACKEND_GUIDE.md)                            | Penjelasan mendalam tentang arsitektur sisi server (NestJS), database, dan API.                 |
|                                              | [Referensi API](../../02_DEVELOPMENT_GUIDES/API_REFERENCE.md)                              | Panduan untuk menggunakan API backend, termasuk contoh dan penjelasan format error.               |
|                                              | [Panduan Testing](../../02_DEVELOPMENT_GUIDES/TESTING_GUIDE.md)                            | Strategi dan cara menulis serta menjalankan pengujian (testing) untuk aplikasi.                 |
| **3. Standar & Proses** <br>_Kerja tim_        | [Standar Koding](../../03_STANDARDS_AND_PROCEDURES/CODING_STANDARDS.md)                     | Aturan dan konvensi untuk version control (Git), format commit, dan gaya penulisan kode.          |
|                                              | [Panduan Kontribusi](../../03_STANDARDS_AND_PROCEDURES/CONTRIBUTING.md)                     | Alur kerja untuk berkontribusi pada proyek, termasuk proses Pull Request dan code review.         |
|                                              | [Panduan Keamanan](../../03_STANDARDS_AND_PROCEDURES/SECURITY_GUIDE.md)                     | Merangkum semua aspek keamanan aplikasi, dari otentikasi hingga pencegahan kerentanan.          |
| **4. Operasi** <br>_Menuju produksi_          | [Panduan Deployment](../../04_OPERATIONS/DEPLOYMENT.md)                                  | Instruksi untuk proses build dan deployment aplikasi ke lingkungan produksi.                      |
|                                              | [Monitoring & Logging](../../04_OPERATIONS/MONITORING_AND_LOGGING.md)                      | Strategi operasional untuk memantau kesehatan dan kinerja aplikasi di produksi.                   |
|                                              | [Backup & Recovery](../../04_OPERATIONS/BACKUP_AND_RECOVERY.md)                            | Prosedur standar untuk mencadangkan data dan memulihkan sistem jika terjadi kegagalan.            |
| **5. Dokumentasi Pengguna** <br>_Cara pakai_ | [Panduan Pengguna](../../05_USER_DOCUMENTATION/USER_GUIDE.md)                              | Panduan fungsional aplikasi dari perspektif pengguna akhir (Staff, Admin).                        |
| **Dokumen Bisnis** <br>_Legal & Penawaran_  | [Proposal Penawaran](../../Business/quotation.md)                                       | Dokumen proposal awal yang merinci lingkup proyek dan opsi investasi.                             |
|                                              | [Perjanjian Kerja](../../Business/perjanjian.md)                                        | Dokumen legal yang mengikat perjanjian kerja antara pengembang dan klien.                         |
