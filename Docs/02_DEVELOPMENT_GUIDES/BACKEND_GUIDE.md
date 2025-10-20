# Panduan Pengembangan Backend

Dokumen ini memberikan panduan teknis mendalam mengenai arsitektur, pola, dan praktik terbaik untuk pengembangan sisi server (backend) aplikasi Inventori Aset.

## 1. Tumpukan Teknologi

Backend dibangun di atas tumpukan teknologi modern berbasis TypeScript untuk memastikan _type-safety_, skalabilitas, dan kemudahan pemeliharaan.

-   **Framework**: **NestJS** ([https://nestjs.com/](https://nestjs.com/))
-   **Database**: **PostgreSQL**
-   **ORM (Object-Relational Mapping)**: **Prisma** ([https://www.prisma.io/](https://www.prisma.io/))
-   **Autentikasi**: **JWT (JSON Web Tokens)** dengan **Passport.js**

## 2. Struktur Proyek (`backend/src`)

NestJS mendorong arsitektur modular. Setiap domain bisnis (fitur) dikemas dalam modulnya sendiri. Berikut adalah struktur detailnya:

```
src/
│
├── main.ts             # Titik masuk aplikasi: inisialisasi server, pipe validasi global, filter error, dll.
├── app.module.ts       # Modul root yang mengimpor semua modul fitur dan konfigurasi global.
│
├── auth/               # Modul untuk autentikasi (login, register) dan manajemen profil.
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   ├── strategies/
│   │   └── jwt.strategy.ts   # Memvalidasi JWT dari header Authorization.
│   └── decorators/
│       └── roles.decorator.ts    # Menetapkan role yang diizinkan untuk sebuah endpoint.
│
├── assets/             # Contoh modul fitur untuk manajemen Aset.
│   ├── assets.module.ts
│   ├── assets.controller.ts
│   ├── assets.service.ts
│   └── dto/
│       ├── create-asset.dto.ts # DTO untuk validasi data saat membuat aset baru.
│       └── update-asset.dto.ts # DTO untuk validasi data saat memperbarui aset.
│
└── shared/             # Modul/layanan bersama yang digunakan di banyak modul fitur.
    └── prisma/
        ├── prisma.module.ts
        └── prisma.service.ts # Service yang menyediakan akses ke Prisma Client.
```

## 3. Alur Autentikasi & Otorisasi

Diagram berikut menggambarkan alur bagaimana seorang pengguna login dan mengakses endpoint yang terproteksi.

```mermaid
sequenceDiagram
    participant Pengguna
    participant Controller
    participant AuthService
    participant JwtStrategy
    participant RolesGuard

    Pengguna ->> Controller: 1. POST /api/auth/login (email, pass)
    Controller ->> AuthService: 2. Panggil login(user)
    activate AuthService
    AuthService ->> AuthService: 3. Validasi user & generate JWT
    AuthService -->> Controller: 4. Kembalikan access_token
    Controller -->> Pengguna: 5. Response { access_token }
    deactivate AuthService

    Note over Pengguna, RolesGuard: Beberapa saat kemudian...

    Pengguna ->> Controller: 6. GET /assets (dengan 'Authorization: Bearer <token>' header)
    Controller ->> JwtStrategy: 7. NestJS memicu JwtAuthGuard
    activate JwtStrategy
    JwtStrategy ->> JwtStrategy: 8. Validasi & decode JWT
    JwtStrategy -->> Controller: 9. Attach user ke request
    deactivate JwtStrategy
    
    Controller ->> RolesGuard: 10. NestJS memicu RolesGuard (jika ada @Roles)
    activate RolesGuard
    RolesGuard ->> RolesGuard: 11. Cek role user vs role endpoint
    RolesGuard -->> Controller: 12. Akses diizinkan
    deactivate RolesGuard

    Controller ->> Controller: 13. Eksekusi logika endpoint
    Controller -->> Pengguna: 14. Response data aset
```

**Langkah-langkah:**
1.  **Login**: Pengguna mengirim kredensial. `AuthService` memvalidasinya dan mengembalikan sebuah JWT.
2.  **Akses Terproteksi**: Klien mengirimkan JWT di setiap header `Authorization` untuk request berikutnya.
3.  **Verifikasi Token**: `JwtAuthGuard` (melalui `JwtStrategy`) secara otomatis memverifikasi token. Jika valid, data pengguna dari payload token akan ditambahkan ke objek `request`.
4.  **Otorisasi Peran**: `RolesGuard` (jika digunakan) memeriksa apakah peran pengguna (`request.user.role`) diizinkan untuk mengakses endpoint tersebut.
5.  Jika semua pemeriksaan berhasil, logika di _controller_ akan dieksekusi.

## 4. Database & Prisma

-   **Single Source of Truth**: File `prisma/schema.prisma` adalah satu-satunya tempat di mana model data, relasi, dan tipe data didefinisikan.
-   **Migrasi**: Setiap perubahan pada `schema.prisma` harus diikuti dengan pembuatan file migrasi baru.
    ```bash
    # Membuat file migrasi baru dan menerapkannya ke database development
    pnpm prisma migrate dev --name <nama-migrasi-deskriptif>
    ```
-   **Prisma Client**: Klien database yang di-generate secara otomatis dan sepenuhnya _type-safe_. Digunakan di dalam _services_ untuk semua operasi database (CRUD).

## 5. Contoh Lengkap: Menambah Fitur Baru (Modul "Suppliers")

Gunakan contoh ini sebagai **templat** untuk membuat modul fitur baru.

### Langkah 1: Buat Kerangka Modul
Gunakan NestJS CLI untuk membuat semua file boilerplate.
```bash
nest g resource suppliers --no-spec
```

### Langkah 2: Update Skema Database
Buka `prisma/schema.prisma` dan tambahkan model `Supplier`.
```prisma
// prisma/schema.prisma

model Supplier {
  id           Int      @id @default(autoincrement())
  name         String   @unique
  contactPerson String?
  phone        String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

### Langkah 3: Jalankan Migrasi
Buat file migrasi dan terapkan ke database.
```bash
pnpm prisma migrate dev --name add-suppliers-table
```

### Langkah 4: Buat DTO
Buat file `src/suppliers/dto/create-supplier.dto.ts` untuk validasi.
```typescript
// src/suppliers/dto/create-supplier.dto.ts
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSupplierDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  contactPerson?: string;

  @IsString()
  @IsOptional()
  phone?: string;
}
```

### Langkah 5: Implementasikan Service
Tulis logika bisnis di `src/suppliers/suppliers.service.ts`.
```typescript
// src/suppliers/suppliers.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  create(createSupplierDto: CreateSupplierDto) {
    return this.prisma.supplier.create({
      data: createSupplierDto,
    });
  }

  findAll() {
    return this.prisma.supplier.findMany();
  }

  findOne(id: number) {
    return this.prisma.supplier.findUnique({ where: { id } });
  }
}
```

### Langkah 6: Implementasikan Controller
Buat endpoint di `src/suppliers/suppliers.controller.ts`.
```typescript
// src/suppliers/suppliers.controller.ts
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('suppliers')
@UseGuards(JwtAuthGuard, RolesGuard) // Lindungi semua endpoint di controller ini
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @Roles('Admin', 'Super Admin') // Hanya Admin & Super Admin yang bisa membuat
  create(@Body() createSupplierDto: CreateSupplierDto) {
    return this.suppliersService.create(createSupplierDto);
  }

  @Get()
  @Roles('Admin', 'Super Admin', 'Manager') // Semua peran kecuali Staff bisa melihat
  findAll() {
    return this.suppliersService.findAll();
  }

  @Get(':id')
  @Roles('Admin', 'Super Admin', 'Manager')
  findOne(@Param('id') id: string) {
    return this.suppliersService.findOne(+id);
  }
}
```

### Langkah 7: Daftarkan Modul
Pastikan `SuppliersModule` diimpor ke dalam `src/app.module.ts`.
```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
// ... other imports
import { SuppliersModule } from './suppliers/suppliers.module';

@Module({
  imports: [
    // ... other modules
    SuppliersModule,
  ],
  // ...
})
export class AppModule {}
```
Sekarang, modul "Suppliers" Anda sudah siap digunakan.

## 6. Pilar Profesional Backend

-   **Validasi**: Gunakan `class-validator` dan `class-transformer` dalam DTOs dan aktifkan `ValidationPipe` secara global di `main.ts`.
-   **Penanganan Error**: Gunakan filter `HttpExceptionFilter` global untuk menangkap semua `HttpException` dan format _response_ error secara konsisten.
-   **Logging**: Gunakan `Logger` bawaan NestJS.
-   **Dokumentasi API**: Manfaatkan `@nestjs/swagger` untuk mendokumentasikan DTOs dan _endpoints_.
-   **Keamanan**: Gunakan `Helmet` untuk mengamankan header HTTP dan aktifkan `CORS` dengan konfigurasi yang ketat di `main.ts`.
