# Tumpukan Teknologi (Technology Stack)

Dokumen ini merinci tumpukan teknologi yang dipilih untuk pengembangan Aplikasi Inventori Aset, beserta alasan strategis di balik setiap pilihan.

> **Catatan Penting**: Tumpukan teknologi backend yang dijelaskan di bawah ini adalah **arsitektur target** yang direkomendasikan untuk implementasi sisi server. Prototipe saat ini menggunakan **Mock API** di dalam frontend yang memanfaatkan `localStorage` browser untuk simulasi persistensi data.

## Frontend (Client-Side) - Telah Diimplementasikan

| Teknologi          | Peran                    | Alasan Pemilihan                                                                                                                                                                                            |
| ------------------ | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **React**          | Framework UI             | Ekosistem yang sangat matang, dukungan komunitas yang luas, dan arsitektur berbasis komponen yang mendorong reusabilitas kode. Ideal untuk membangun antarmuka pengguna yang interaktif dan kompleks.           |
| **TypeScript**     | Bahasa Pemrograman       | Menambahkan _static typing_ di atas JavaScript, mengurangi bug runtime, meningkatkan _developer experience_ melalui _autocompletion_, dan membuat _codebase_ lebih mudah dipelihara saat proyek berkembang.   |
| **React Hooks**    | Manajemen State          | Menggunakan hooks bawaan (`useState`, `useContext`, `useMemo`) untuk manajemen state. State global diangkat ke komponen root (`App.tsx`) dan didistribusikan ke bawah, memberikan solusi sederhana dan efektif untuk skala prototipe ini. |
| **Tailwind CSS**   | Framework CSS            | Pendekatan _utility-first_ mempercepat proses styling, memastikan konsistensi visual, dan menghilangkan kebutuhan untuk menulis CSS kustom yang berlebihan. Sangat mudah untuk membuat desain yang responsif. |
| **React Icons**    | Pustaka Ikon             | Menyediakan akses mudah ke ribuan ikon populer dari berbagai set ikon sebagai komponen React, memastikan konsistensi dan kemudahan penggunaan.                        |
| **Mock API Layer** | Simulasi Backend         | Sebuah lapisan layanan (`src/services/api.ts`) yang meniru perilaku API backend dengan membaca dan menulis data ke `localStorage`. Ini memungkinkan pengembangan dan pengujian frontend secara penuh dan independen. |

## Backend (Server-Side) - Target Implementasi

| Teknologi           | Peran                          | Alasan Pemilihan                                                                                                                                                                                                                             |
| ------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Node.js**         | Runtime Environment            | Memungkinkan penggunaan JavaScript/TypeScript di sisi server, menciptakan keseragaman bahasa di seluruh tumpukan teknologi (_full-stack_) dan memanfaatkan ekosistem NPM yang sangat besar.                                                   |
| **NestJS**          | Framework Backend              | Framework berbasis TypeScript yang terstruktur dan modular, terinspirasi oleh Angular. Menyediakan arsitektur yang kuat (_Dependency Injection_, Modules, Controllers, Services) yang ideal untuk aplikasi skala perusahaan dan mudah diuji. |
| **PostgreSQL**      | Database                       | Sistem database relasional _open-source_ yang sangat andal, kuat, dan kaya fitur. Mendukung tipe data JSONB, _full-text search_, dan memiliki performa yang terbukti untuk beban kerja yang besar.                                       |
| **Prisma**          | ORM (Object-Relational Mapper) | ORM generasi baru yang menyediakan _type-safety_ dari database hingga ke kode aplikasi. Skema deklaratifnya (`schema.prisma`) menjadi _single source of truth_ yang mempercepat pengembangan dan mengurangi error.                         |
| **Passport.js**     | Middleware Autentikasi         | Pustaka yang fleksibel dan modular untuk menangani autentikasi di Node.js. Terintegrasi dengan baik di NestJS dan mendukung berbagai strategi, termasuk JWT yang kita gunakan.                                                              |
| **JWT**             | Standar Token Autentikasi      | _JSON Web Tokens_ adalah standar industri untuk autentikasi _stateless_ di API. Ini memungkinkan klien (frontend) untuk mengautentikasi setiap permintaan tanpa server perlu menyimpan state sesi.                                           |
| **Docker**          | Kontainerisasi                 | Memastikan konsistensi lingkungan antara development dan production. Memudahkan proses setup database (via `docker-compose`) dan menyederhanakan proses deployment backend.                                                                |

## Alat Pendukung (DevOps & Tooling)

| Teknologi      | Peran                | Alasan Pemilihan                                                                                                                                             |
| -------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Git**        | Version Control      | Standar industri untuk kontrol versi, memungkinkan kolaborasi tim yang efisien, pelacakan riwayat perubahan, dan manajemen cabang yang kuat.                   |
| **pnpm**       | Package Manager      | Manajer paket yang cepat dan efisien dalam penggunaan ruang disk.                                                                                            |
| **ESLint**     | Linter               | Menganalisis kode secara statis untuk menemukan masalah, bug, dan inkonsistensi gaya penulisan kode. Membantu menjaga kualitas kode.                            |
| **Prettier**   | Formatter Kode       | Memformat kode secara otomatis sesuai dengan aturan yang telah ditentukan, memastikan gaya penulisan yang konsisten di seluruh proyek tanpa perdebatan manual.   |