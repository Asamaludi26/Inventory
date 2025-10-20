# Panduan Keamanan Aplikasi

Dokumen ini merangkum semua aspek dan praktik keamanan yang diterapkan dalam Aplikasi Inventori Aset untuk melindungi data dan memastikan integritas sistem.

## 1. Model Keamanan

Aplikasi ini mengadopsi model keamanan berlapis (_defense-in-depth_), di mana keamanan diterapkan pada setiap level: dari antarmuka pengguna, komunikasi jaringan, hingga server dan database.

## 2. Autentikasi

Autentikasi adalah proses verifikasi identitas pengguna. Kami menggunakan alur **JSON Web Token (JWT)** yang _stateless_.

**Alur Kerja:**
1.  Pengguna mengirim `email` dan `password` ke endpoint `POST /api/auth/login`.
2.  Backend memverifikasi kredensial terhadap hash password yang tersimpan di database.
3.  Jika berhasil, backend membuat sebuah JWT yang berisi _payload_ (seperti `userId`, `email`, `role`) dan menandatanganinya dengan sebuah _secret key_ (`JWT_SECRET`).
4.  Token ini dikirim kembali ke frontend.
5.  Frontend menyimpan token ini (misalnya di `localStorage`) dan menyertakannya di header `Authorization: Bearer <token>` untuk setiap permintaan API berikutnya.
6.  Backend, melalui `JwtAuthGuard`, akan memvalidasi token ini di setiap permintaan yang terproteksi. Jika token tidak valid atau kedaluwarsa, akses akan ditolak dengan status `401 Unauthorized`.

## 3. Otorisasi

Otorisasi adalah proses menentukan apakah pengguna yang sudah terautentikasi memiliki izin untuk melakukan tindakan tertentu. Kami menerapkan **Role-Based Access Control (RBAC)**.

**Peran yang Didefinisikan:**
-   **`Staff`**: Hak akses paling terbatas. Hanya bisa membuat dan melihat request pribadi.
-   **`Manager`**: Dapat membuat request tipe `Urgent` dan `Project Based`.
-   **`Admin`**: Hak akses operasional. Bisa mengelola aset, request, handover, dll.
-   **`Super Admin`**: Hak akses penuh, termasuk mengelola pengguna dan divisi.

**Implementasi Teknis:**
-   Peran pengguna disimpan dalam _payload_ JWT.
-   Di backend (NestJS), _decorator_ `@Roles('Admin', 'Super Admin')` digunakan pada _endpoint controller_ untuk mendefinisikan peran mana yang diizinkan.
-   Sebuah `RolesGuard` akan memeriksa peran pengguna dari token terhadap peran yang diizinkan oleh _endpoint_. Jika tidak cocok, akses ditolak dengan status `403 Forbidden`.

## 4. Keamanan Data

### 4.1. Data Saat Transit (In-Transit)
-   Semua komunikasi antara frontend dan backend **wajib** menggunakan **HTTPS (TLS)**. Ini memastikan bahwa semua data, termasuk token autentikasi dan data sensitif, dienkripsi selama transmisi.

### 4.2. Data Saat Disimpan (At-Rest)
-   **Password Pengguna**: Kata sandi **TIDAK PERNAH** disimpan sebagai teks biasa. Kata sandi di-hash menggunakan algoritma **bcrypt** sebelum disimpan ke database.
-   **Data Sensitif**: Saat ini, aplikasi tidak menyimpan data yang sangat sensitif seperti nomor kartu kredit. Jika di masa depan ada kebutuhan seperti itu, data tersebut harus dienkripsi di level aplikasi sebelum disimpan ke database.

## 5. Pencegahan Kerentanan Umum (OWASP Top 10)

-   **A01: Broken Access Control**: Diatasi dengan implementasi RBAC yang ketat melalui `JwtAuthGuard` dan `RolesGuard`.
-   **A02: Cryptographic Failures**: Diatasi dengan penggunaan HTTPS untuk data transit dan bcrypt untuk hashing password.
-   **A03: Injection**: Diatasi dengan menggunakan **Prisma ORM**, yang secara otomatis melakukan _parameterized queries_ untuk mencegah SQL Injection.
-   **A05: Security Misconfiguration**: Diatasi dengan menggunakan _framework_ modern (NestJS) dengan konfigurasi keamanan default yang baik, serta penggunaan **Helmet** di backend untuk mengatur header HTTP yang aman (XSS protection, HSTS, dll).
-   **A07: Identification and Authentication Failures**: Diatasi dengan alur JWT yang aman, termasuk masa berlaku token yang terbatas.
-   **A08: Software and Data Integrity Failures**: Diatasi dengan proses _code review_ yang ketat dan manajemen dependensi yang baik.

## 6. Manajemen Dependensi

-   Gunakan `pnpm audit` secara berkala untuk memeriksa dependensi proyek (baik frontend maupun backend) dari kerentanan keamanan yang diketahui.
-   Segera perbarui pustaka yang memiliki celah keamanan kritis.

## 7. Penanganan Insiden (Prosedur Dasar)

Jika terjadi insiden keamanan (misalnya, kebocoran data):
1.  **Identifikasi & Isolasi**: Segera identifikasi komponen yang terpengaruh dan isolasi dari sistem produksi jika memungkinkan.
2.  **Invalidasi Sesi**: Putar `JWT_SECRET` untuk membatalkan semua sesi login yang aktif.
3.  **Analisis**: Lakukan analisis log untuk memahami bagaimana insiden terjadi.
4.  **Perbaikan**: Terapkan perbaikan untuk menutup celah keamanan.
5.  **Pemberitahuan**: Beri tahu pihak terkait sesuai dengan kebijakan perusahaan.
