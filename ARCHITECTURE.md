# Arsitektur Aplikasi Inventori Aset (Client-Server)

Dokumen ini merinci blueprint arsitektural untuk mentransformasi aplikasi dari prototipe mandiri (client-side only) menjadi aplikasi skala perusahaan dengan arsitektur client-server yang modern dan profesional.

## 1. Konsep & Arsitektur Umum

Aplikasi akan dipecah menjadi dua entitas utama yang terpisah:

1.  **Frontend (Client)**: Aplikasi React yang sudah ada, yang akan dimodifikasi untuk fokus pada User Interface (UI) dan User Experience (UX). Tanggung jawab utamanya adalah menampilkan data dari server dan mengirimkan aksi pengguna ke server.
2.  **Backend (Server)**: Aplikasi baru yang akan dibangun untuk menangani semua logika bisnis, manajemen data, dan keamanan.

### Tumpukan Teknologi yang Direkomendasikan:

-   **Framework**: **NestJS** (berbasis Node.js & TypeScript)
-   **Database**: **PostgreSQL**
-   **ORM**: **Prisma** (untuk type-safety dari database ke frontend)
-   **Autentikasi**: **JWT (JSON Web Tokens)** dengan Passport.js
-   **Penyimpanan File**: Layanan seperti **AWS S3** atau sejenisnya.

---

## 2. Struktur Proyek

Struktur proyek akan diorganisir ke dalam dua folder utama di root: `frontend/` dan `backend/`.

```bash
/ (Direktori Proyek Utama)
│
├── frontend/                  # Folder ini berisi semua kode React Anda (yang sudah dimodifikasi).
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.tsx            # Dimodifikasi untuk mengambil data dari API, bukan mock data.
│   │   ├── index.tsx
│   │   ├── types.ts           # Definisi tipe yang bisa dibagikan dengan backend.
│   │   │
│   │   ├── components/        # Semua komponen UI (logika internal diubah untuk API calls).
│   │   ├── hooks/             # Custom hooks (tetap relevan).
│   │   │
│   │   ├── services/          # BARU! Folder untuk mengelola semua panggilan API.
│   │   │   └── api.ts         # BARU! Pusat fungsi seperti `fetchAssets()`, `createRequest()`.
│   │   │
│   │   └── utils/             # Utilitas sisi klien.
│   │
│   ├── package.json           # Konfigurasi proyek frontend.
│   └── tsconfig.json
│
└── backend/                   # Folder BARU! Berisi semua kode server.
    ├── prisma/                # BARU! Untuk skema dan migrasi database.
    │   └── schema.prisma      # BARU! Sumber kebenaran untuk struktur data Anda.
    ├── src/
    │   ├── main.ts            # Titik masuk aplikasi backend.
    │   ├── app.module.ts
    │   │
    │   ├── auth/              # Modul untuk autentikasi (login, JWT).
    │   ├── assets/            # Modul untuk logika manajemen aset.
    │   ├── requests/          # Modul untuk logika manajemen request.
    │   ├── users/             # Modul untuk logika manajemen user & divisi.
    │   ├── customers/         # Modul untuk logika manajemen pelanggan.
    │   ├── handovers/         # Modul untuk logika manajemen handover.
    │   ├── dismantles/        # Modul untuk logika manajemen dismantle.
    │   └── ... (dan modul-modul lainnya)
    │
    ├── .env                   # BARU! Menyimpan variabel rahasia (koneksi database, dll.).
    ├── package.json           # Konfigurasi proyek backend.
    └── tsconfig.json
```

---

## 3. Desain Database (`prisma/schema.prisma`)

File ini akan menjadi satu-satunya sumber kebenaran (Single Source of Truth) untuk model data Anda. Ini mendefinisikan tabel, kolom, tipe data, dan relasi.

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Enums
enum UserRole {
  Staff
  Admin
  SuperAdmin
}

enum ItemStatus {
  PENDING
  LOGISTIC_APPROVED
  APPROVED
  REJECTED
  COMPLETED
  IN_PROGRESS
  PURCHASING
  IN_DELIVERY
  ARRIVED
}

enum AssetStatus {
  IN_USE
  IN_STORAGE
  DAMAGED
  DECOMMISSIONED
}

enum AssetCondition {
  BRAND_NEW
  GOOD
  USED_OKAY
  MINOR_DAMAGE
  MAJOR_DAMAGE
  FOR_PARTS
}

enum TrackingMethod {
  individual
  bulk
}

// Models
model User {
  id         Int       @id @default(autoincrement())
  name       String
  email      String    @unique
  password   String // Hash dari password
  role       UserRole  @default(Staff)
  divisionId Int?
  division   Division? @relation(fields: [divisionId], references: [id])
  
  createdAssets Asset[] @relation("RecordedBy")
  ownedAssets   Asset[] @relation("CurrentUserAssets")

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Division {
  id    Int    @id @default(autoincrement())
  name  String @unique
  users User[]
  
  assetCategoryVisibility AssetCategory[]
}

model Customer {
  id               String         @id @default(cuid())
  name             String
  address          String
  phone            String
  email            String         @unique
  status           String
  installationDate DateTime
  servicePackage   String
  assets           Asset[]
  activityLog      Json?
}

model Asset {
  id              String         @id @default(cuid())
  name            String
  serialNumber    String?        @unique
  macAddress      String?        @unique
  purchaseDate    DateTime
  purchasePrice   Float?
  vendor          String?
  poNumber        String?
  invoiceNumber   String?
  warrantyEndDate DateTime?
  location        String?
  locationDetail  String?
  woRoIntNumber   String?
  status          AssetStatus
  condition       AssetCondition
  notes           String?
  isDismantled    Boolean        @default(false)
  dismantleInfo   Json?

  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  
  // Relasi
  category        AssetCategory  @relation(fields: [categoryId], references: [id])
  categoryId      Int
  type            AssetType      @relation(fields: [typeId], references: [id])
  typeId          Int
  brand           String

  recordedBy      User          @relation("RecordedBy", fields: [recordedById], references: [id])
  recordedById    Int
  currentUser     User?          @relation("CurrentUserAssets", fields: [currentUserId], references: [id])
  currentUserId   Int?
  currentCustomer Customer?      @relation(fields: [currentCustomerId], references: [id])
  currentCustomerId String?

  attachments     Attachment[]
  activityLog     Json?
}

model AssetCategory {
  id                    Int       @id @default(autoincrement())
  name                  String    @unique
  isCustomerInstallable Boolean   @default(false)
  
  types                 AssetType[]
  assets                Asset[]
  visibleToDivisions    Division[]
}

model AssetType {
  id                Int           @id @default(autoincrement())
  name              String
  trackingMethod    TrackingMethod @default(individual)
  unitOfMeasure     String?
  baseUnitOfMeasure String?
  quantityPerUnit   Float?

  category          AssetCategory @relation(fields: [categoryId], references: [id])
  categoryId        Int
  standardItems     StandardItem[]
  assets            Asset[]
  
  @@unique([name, categoryId])
}

model StandardItem {
  id     Int       @id @default(autoincrement())
  name   String
  brand  String
  type   AssetType @relation(fields: [typeId], references: [id])
  typeId Int
  
  @@unique([name, brand])
}

model Attachment {
  id      Int    @id @default(autoincrement())
  name    String
  url     String // URL dari S3
  type    String
  asset   Asset  @relation(fields: [assetId], references: [id])
  assetId String
}

model Request {
  id                   String      @id @default(cuid())
  requester            String
  division             String
  requestDate          DateTime
  status               ItemStatus
  order                String?
  lembar               String
  items                RequestItem[]
  isRegistered         Boolean     @default(false)
  
  logisticApprover     String?
  logisticApprovalDate DateTime?
  finalApprover        String?
  finalApprovalDate    DateTime?
  rejectionReason      String?
  rejectedBy           String?
  rejectionDate        DateTime?
  rejectedByDivision   String?
}

model RequestItem {
  id            Int     @id @default(autoincrement())
  itemName      String
  itemTypeBrand String
  stock         Int
  quantity      Int
  keterangan    String
  request       Request @relation(fields: [requestId], references: [id])
  requestId     String
}

model Handover {
  id            String       @id @default(cuid())
  handoverDate  DateTime
  menyerahkan   String
  penerima      String
  mengetahui    String
  woRoIntNumber String?
  lembar        String
  items         HandoverItem[]
  status        ItemStatus
}

model HandoverItem {
  id              Int      @id @default(autoincrement())
  itemName        String
  itemTypeBrand   String
  conditionNotes  String
  quantity        Int
  checked         Boolean
  assetId         String?
  handover        Handover @relation(fields: [handoverId], references: [id])
  handoverId      String
}

model Dismantle {
  id                 String         @id @default(cuid())
  assetId            String
  assetName          String
  dismantleDate      DateTime
  technician         String
  customerName       String
  customerId         String
  customerAddress    String
  retrievedCondition AssetCondition
  acknowledger       String?
  status             ItemStatus
}
```

---

## 4. Desain API Endpoint (REST API)

-   **Autentikasi (`/api/auth`)**
    -   `POST /login`
    -   `GET /profile`
-   **Aset (`/api/assets`)**
    -   `GET /`
    -   `POST /`
    -   `GET /:id`
    -   `PATCH /:id`
    -   `DELETE /:id`
-   **Request (`/api/requests`)**
    -   `GET /`
    -   `POST /`
    -   `GET /:id`
    -   `POST /:id/approve`
    -   `POST /:id/reject`
-   **Pengguna & Divisi (`/api/users`, `/api/divisions`)**
-   **Pelanggan (`/api/customers`)**
-   **Handover (`/api/handovers`)**
-   **Dismantle (`/api/dismantles`)**
-   **Kategori (`/api/categories`)**
-   **Dashboard (`/api/dashboard`)**
    -   `GET /summary`

---

## 5. Rencana Modifikasi Frontend

1.  **Hapus Mock Data**: Semua `mockAssets`, `initialMockRequests`, dll. akan dihapus.
2.  **Buat Service Layer**: Buat folder `src/services` dengan file `api.ts` untuk mengelola semua `fetch` request.
3.  **Ganti Logika Lokal dengan API Calls**: Ubah fungsi handler (misal, `handleCreateRequest`) untuk memanggil fungsi dari `api.ts`.
4.  **Gunakan `useEffect` untuk Mengambil Data**: Ambil data dari API saat komponen dimuat.
5.  **Tambahkan State Loading & Error**: Tampilkan indikator loading dan pesan error.
6.  **Manajemen State Global**: Adopsi pustaka manajemen state seperti **Zustand** atau **Redux Toolkit** untuk menyederhanakan akses dan modifikasi data di seluruh aplikasi, menggantikan *prop drilling*.
7.  **Optimasi Performa**: Implementasikan **Paginasi di Sisi Server** untuk menangani data dalam jumlah besar. Untuk daftar yang sangat panjang, gunakan teknik **Virtualisasi Daftar** (misal, dengan `TanStack Virtual`) untuk memastikan UI tetap responsif.

---

## 6. Pilar Arsitektur Profesional

Berikut adalah pilar-pilar penting untuk memastikan backend Anda siap produksi, aman, dan mudah dikelola.

### 6.1. Konfigurasi & Manajemen Environment

**Mengapa?** Aplikasi perlu berjalan di lingkungan berbeda (development di laptop Anda, staging untuk testing, production untuk pengguna akhir) dengan konfigurasi yang berbeda (misal, database yang berbeda).

**Implementasi:** Gunakan file `.env` dan modul `ConfigModule` dari NestJS.

*   **`backend/.env.example`** (Contoh file environment)
    ```env
    # Application
    PORT=3001

    # Database
    DATABASE_URL="postgresql://user:password@localhost:5432/mydatabase?schema=public"

    # JWT
    JWT_SECRET="your-super-secret-key"
    JWT_EXPIRATION_TIME="3600s"
    ```

### 6.2. Strategi Autentikasi & Otorisasi

**Mengapa?** Untuk melindungi data dan memastikan hanya pengguna yang berhak yang bisa melakukan aksi tertentu.

**Implementasi:** Alur JWT (JSON Web Token) dengan Passport.js dan `RolesGuard` kustom.

1.  **Login Flow**:
    -   User mengirim `email` dan `password` ke `POST /api/auth/login`.
    -   Backend memvalidasi kredensial.
    -   Jika valid, backend membuat JWT yang berisi `userId` dan `role`, lalu mengirimkannya kembali ke frontend.
    -   Frontend menyimpan token ini (misal di `localStorage`) dan menyertakannya di header `Authorization: Bearer <token>` untuk setiap request selanjutnya.
2.  **`RolesGuard`**: Sebuah *guard* yang memeriksa `role` dari payload JWT.

*   **`backend/src/auth/guards/roles.guard.ts`**
    ```typescript
    import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
    import { Reflector } from '@nestjs/core';
    import { UserRole } from '@prisma/client';

    @Injectable()
    export class RolesGuard implements CanActivate {
      constructor(private reflector: Reflector) {}

      canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
          context.getHandler(),
          context.getClass(),
        ]);
        if (!requiredRoles) {
          return true; // Jika tidak ada role yang dibutuhkan, izinkan
        }
        const { user } = context.switchToHttp().getRequest();
        return requiredRoles.some((role) => user.role?.includes(role));
      }
    }
    ```
*   **Penggunaan di Controller:**
    ```typescript
    import { Post, UseGuards, SetMetadata } from '@nestjs/common';
    import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
    import { RolesGuard } from './auth/guards/roles.guard';
    
    // ...
    @Post()
    @SetMetadata('roles', [UserRole.Admin, UserRole.SuperAdmin]) // Hanya Admin & Super Admin
    @UseGuards(JwtAuthGuard, RolesGuard)
    createAsset(@Body() createAssetDto: CreateAssetDto) {
      // ...
    }
    ```

### 6.3. Penanganan Error Terpusat

**Mengapa?** Agar frontend selalu menerima format error yang konsisten, memudahkan penanganan error di sisi klien.

**Implementasi:** Gunakan `HttpExceptionFilter`.

*   **`backend/src/common/filters/http-exception.filter.ts`**
    ```typescript
    import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
    import { Request, Response } from 'express';

    @Catch(HttpException)
    export class HttpExceptionFilter implements ExceptionFilter {
      catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();

        response
          .status(status)
          .json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: exception.message,
          });
      }
    }
    ```
*   **Aktivasi di `main.ts`:**
    ```typescript
    // backend/src/main.ts
    async function bootstrap() {
      const app = await NestFactory.create(AppModule);
      app.useGlobalFilters(new HttpExceptionFilter()); // Tambahkan ini
      await app.listen(3001);
    }
    ```

### 6.4. Dokumentasi API (Swagger/OpenAPI)

**Mengapa?** Membuat dokumentasi interaktif secara otomatis, sangat membantu pengembangan frontend dan kolaborasi.

**Implementasi:** Gunakan `@nestjs/swagger`.

*   **Instalasi:** `npm install @nestjs/swagger`
*   **Aktivasi di `main.ts`:**
    ```typescript
    // backend/src/main.ts
    import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

    async function bootstrap() {
      const app = await NestFactory.create(AppModule);

      const config = new DocumentBuilder()
        .setTitle('Inventori Aset API')
        .setDescription('API untuk manajemen aset PT. Triniti Media')
        .setVersion('1.0')
        .addBearerAuth() // Untuk JWT
        .build();
      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api/docs', app, document); // Akses di http://localhost:3001/api/docs

      await app.listen(3001);
    }
    ```

### 6.5. Keamanan Tambahan

**Mengapa?** Melindungi API dari serangan web umum.

**Implementasi:**
-   **CORS**: Aktifkan di `main.ts` untuk mengizinkan request dari domain frontend Anda. `app.enableCors();`
-   **Helmet**: Middleware untuk mengatur header HTTP yang aman. `npm install helmet`, lalu `app.use(helmet());` di `main.ts`.
-   **Rate Limiting**: Mencegah serangan brute-force. `npm install --save @nestjs/throttler`, lalu konfigurasikan di `app.module.ts`.

### 6.6. Strategi Testing

**Mengapa?** Untuk memastikan setiap bagian kode berfungsi seperti yang diharapkan dan mencegah regresi (bug baru saat mengubah kode lama).

**Implementasi:** NestJS sudah terintegrasi dengan Jest.
-   **Unit Tests**: Tes satu fungsi atau kelas secara terisolasi. Contoh: `requests.service.spec.ts`.
-   **Integration Tests**: Tes bagaimana beberapa unit bekerja sama (misal, controller + service).
-   **E2E (End-to-End) Tests**: Tes seluruh alur API dari request hingga response. NestJS menyediakan kerangka kerja untuk ini di folder `test/`.

### 6.7. Logging

**Mengapa?** Untuk melacak apa yang terjadi di aplikasi, terutama saat terjadi error di production.

**Implementasi:** Gunakan Logger bawaan NestJS atau integrasikan dengan library seperti `Winston`.
-   **Contoh Penggunaan:**
    ```typescript
    import { Injectable, Logger } from '@nestjs/common';

    @Injectable()
    export class MyService {
      private readonly logger = new Logger(MyService.name);

      doSomething() {
        this.logger.log('Melakukan sesuatu...');
        try {
          // ...
        } catch (error) {
          this.logger.error('Gagal melakukan sesuatu', error.stack);
        }
      }
    }
    ```

### 6.8. Deployment (Docker)

**Mengapa?** Untuk mengemas aplikasi dan dependensinya ke dalam sebuah *container* yang bisa dijalankan di mana saja secara konsisten.

**Implementasi:** Buat `Dockerfile` di root folder `backend/`.

*   **`backend/Dockerfile`**
    ```dockerfile
    # Base image
    FROM node:18-alpine

    # Create app directory
    WORKDIR /usr/src/app

    # Install app dependencies
    COPY package*.json ./
    RUN npm install

    # Bundle app source
    COPY . .

    # Run prisma generate
    RUN npx prisma generate

    # Build the app
    RUN npm run build

    # Expose port and start app
    EXPOSE 3001
    CMD [ "node", "dist/main" ]
    ```
---

## 7. Contoh Kode Awal (Starter Code)

### Backend (NestJS)

1.  **Instalasi NestJS CLI:**
    ```bash
    npm i -g @nestjs/cli
    ```
2.  **Buat Proyek Backend Baru:**
    ```bash
    nest new backend
    ```
3.  **Setup Prisma:**
    ```bash
    cd backend
    npm install prisma
    npx prisma init
    # Edit .env dan schema.prisma, lalu jalankan:
    npx prisma migrate dev --name init
    ```
4.  **Contoh Modul `requests`:**
    
    *   **`backend/src/requests/dto/create-request.dto.ts`** (Validasi Input)
        ```typescript
        import { IsString, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
        import { Type } from 'class-transformer';

        class CreateRequestItemDto {
          @IsString()
          @IsNotEmpty()
          itemName: string;
          // ... tambahkan properti lain dengan validator
        }

        export class CreateRequestDto {
          @IsString()
          @IsNotEmpty()
          requester: string;

          @IsString()
          @IsNotEmpty()
          division: string;
          
          @IsArray()
          @ValidateNested({ each: true })
          @Type(() => CreateRequestItemDto)
          items: CreateRequestItemDto[];
        }
        ```
    *   **`backend/src/prisma/prisma.service.ts`** (Buat service ini untuk dependency injection)
        ```typescript
        import { Injectable, OnModuleInit } from '@nestjs/common';
        import { PrismaClient } from '@prisma/client';

        @Injectable()
        export class PrismaService extends PrismaClient implements OnModuleInit {
          async onModuleInit() {
            await this.$connect();
          }
        }
        ```
    *   **`backend/src/requests/requests.service.ts`** (Logika Bisnis)
        ```typescript
        import { Injectable } from '@nestjs/common';
        import { PrismaService } from '../prisma/prisma.service';
        import { CreateRequestDto } from './dto/create-request.dto';

        @Injectable()
        export class RequestsService {
          constructor(private prisma: PrismaService) {}

          async create(createRequestDto: CreateRequestDto) {
            // Prisma akan menangani pembuatan request dan item-itemnya secara transaksional
            return this.prisma.request.create({
              data: {
                ...createRequestDto,
                items: {
                  create: createRequestDto.items,
                },
              },
            });
          }

          async findAll() {
            return this.prisma.request.findMany({ include: { items: true } });
          }

          // ... (findOne, update, remove, approve, reject)
        }
        ```
    *   **`backend/src/requests/requests.controller.ts`** (API Endpoints)
        ```typescript
        import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
        import { RequestsService } from './requests.service';
        import { CreateRequestDto } from './dto/create-request.dto';

        @Controller('api/requests') // Prefix untuk semua rute di controller ini
        export class RequestsController {
          constructor(private readonly requestsService: RequestsService) {}

          @Post()
          create(@Body() createRequestDto: CreateRequestDto) {
            return this.requestsService.create(createRequestDto);
          }

          @Get()
          findAll() {
            return this.requestsService.findAll();
          }
        }
        ```
    *   **`backend/src/requests/requests.module.ts`** (Menyatukan Modul)
        ```typescript
        import { Module } from '@nestjs/common';
        import { RequestsService } from './requests.service';
        import { RequestsController } from './requests.controller';
        import { PrismaModule } from '../prisma/prisma.module'; // Pastikan PrismaModule diexport

        @Module({
          imports: [PrismaModule],
          controllers: [RequestsController],
          providers: [RequestsService],
        })
        export class RequestsModule {}
        ```

### Frontend (React)

1.  **Contoh Service Layer:**
    
    *   **`frontend/src/services/api.ts`**
        ```typescript
        import { Request } from '../types'; // Import tipe dari file types.ts

        const API_BASE_URL = '/api'; // URL backend Anda

        // Fungsi helper untuk menangani respons
        async function handleResponse<T>(response: Response): Promise<T> {
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Terjadi kesalahan pada server');
          }
          return response.json();
        }

        // Contoh fungsi untuk mengambil semua request
        export const fetchRequests = async (): Promise<Request[]> => {
          const response = await fetch(`${API_BASE_URL}/requests`);
          return handleResponse<Request[]>(response);
        };

        // Contoh fungsi untuk membuat request baru
        export const createRequest = async (requestData: Omit<Request, 'id' | 'status' | 'logisticApprover' | 'logisticApprovalDate' | 'finalApprover' | 'finalApprovalDate' | 'rejectionReason' | 'rejectedBy' | 'rejectionDate' | 'rejectedByDivision'>): Promise<Request> => {
          const response = await fetch(`${API_BASE_URL}/requests`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              // 'Authorization': `Bearer ${token}` // Tambahkan token jika sudah ada auth
            },
            body: JSON.stringify(requestData),
          });
          return handleResponse<Request>(response);
        };
        ```

2.  **Contoh Modifikasi Komponen:**
    
    *   **`frontend/src/components/ItemRequest.tsx`**
        ```tsx
        import React, { useState, useEffect } from 'react';
        import * as api from '../services/api'; // Import service API
        import { Request } from '../types';

        const ItemRequest = () => {
          const [requests, setRequests] = useState<Request[]>([]);
          const [isLoading, setIsLoading] = useState(true);
          const [error, setError] = useState<string | null>(null);

          // Mengambil data dari backend saat komponen dimuat
          useEffect(() => {
            const loadRequests = async () => {
              try {
                setIsLoading(true);
                const data = await api.fetchRequests();
                setRequests(data);
                setError(null);
              } catch (err: any) {
                setError(err.message);
              } finally {
                setIsLoading(false);
              }
            };
            loadRequests();
          }, []);

          // Mengganti fungsi handler untuk menggunakan API
          const handleCreateRequest = async (data: Omit<Request, 'id' | 'status' | 'logisticApprover' | 'logisticApprovalDate' | 'finalApprover' | 'finalApprovalDate' | 'rejectionReason' | 'rejectedBy' | 'rejectionDate' | 'rejectedByDivision'>) => {
            try {
              const newRequest = await api.createRequest(data);
              setRequests(prev => [newRequest, ...prev]); // Optimistic update
              // addNotification('Request berhasil dibuat!', 'success');
            } catch (err: any) {
              // addNotification(err.message, 'error');
            }
          };

          if (isLoading) return <div>Loading...</div>;
          if (error) return <div>Error: {error}</div>;

          // ... sisa JSX Anda untuk menampilkan data `requests`
          return <div>...</div>
        };
        ```