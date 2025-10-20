# Panduan Pengujian (Testing)

Pengujian adalah bagian krusial dari siklus pengembangan untuk memastikan kualitas, keandalan, dan stabilitas aplikasi. Dokumen ini mendefinisikan strategi dan panduan untuk menulis tes di proyek ini.

## 1. Filosofi Pengujian

Kami mengadopsi pendekatan **Piramida Pengujian**, dengan fokus pada:
-   **Unit Tests (Dasar Piramida)**: Porsi terbesar dari tes. Menguji unit-unit kecil (fungsi, komponen UI) secara terisolasi. Cepat dijalankan dan memberikan umpan balik instan.
-   **Integration Tests (Tengah Piramida)**: Menguji interaksi antara beberapa unit. Contoh: komponen yang mengambil data dari sebuah hook, atau endpoint controller yang berinteraksi dengan service.
-   **End-to-End (E2E) Tests (Puncak Piramida)**: Porsi terkecil. Mensimulasikan alur kerja pengguna secara lengkap dari antarmuka hingga ke database. Lambat dijalankan tetapi memberikan kepercayaan tertinggi.

## 2. Tools yang Digunakan

-   **Test Runner & Framework**: **Jest**
-   **Frontend Testing**: **React Testing Library (RTL)** untuk merender komponen dan mensimulasikan interaksi pengguna.
-   **Backend Testing**: Modul `@nestjs/testing` untuk membuat lingkungan pengujian yang terisolasi.
-   **E2E Testing (Rekomendasi)**: **Cypress** atau **Playwright**.

## 3. Setup Lingkungan Tes

-   **Frontend**: Tidak ada setup khusus yang diperlukan. `create-vite-app` sudah menyertakan konfigurasi dasar untuk Jest.
-   **Backend**: Untuk tes integrasi yang memerlukan database, kita akan menggunakan database terpisah khusus untuk testing.
    -   Konfigurasikan `DATABASE_URL` di `.env.test` untuk menunjuk ke database tes.
    -   Gunakan skrip untuk membersihkan dan mengisi ulang database sebelum setiap rangkaian tes dijalankan.

## 4. Cara Menjalankan Tes

Jalankan perintah berikut dari folder masing-masing (`frontend/` atau `backend/`):

```bash
# Menjalankan semua tes
pnpm run test

# Menjalankan tes dalam mode watch (interaktif)
pnpm run test:watch
```

## 5. Contoh Penulisan Tes

### Contoh 1: Unit Test Komponen React (Frontend)

Menggunakan React Testing Library untuk menguji komponen `Button`.

**File**: `src/components/ui/Button.test.tsx`
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button Component', () => {
  test('renders with correct text', () => {
    render(<Button>Klik Saya</Button>);
    // Cari elemen button dengan teks "Klik Saya"
    const buttonElement = screen.getByText(/Klik Saya/i);
    expect(buttonElement).toBeInTheDocument();
  });

  test('calls onClick prop when clicked', () => {
    const handleClick = jest.fn(); // Buat mock function
    render(<Button onClick={handleClick}>Klik</Button>);
    
    fireEvent.click(screen.getByText(/Klik/i));
    
    // Pastikan fungsi mock dipanggil tepat satu kali
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    const buttonElement = screen.getByText(/Disabled/i);
    expect(buttonElement).toBeDisabled();
  });
});
```

### Contoh 2: Tes Integrasi Endpoint NestJS (Backend)

Menggunakan `@nestjs/testing` dan `supertest` untuk menguji endpoint `GET /assets`.

**File**: `src/assets/assets.controller.integration.spec.ts`
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';

describe('AssetsController (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    
    prisma = app.get<PrismaService>(PrismaService);
    
    // Setup: Hapus data lama dan isi dengan data tes
    await prisma.asset.deleteMany({});
    await prisma.asset.create({
      data: { /* ... data aset untuk tes ... */ },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/assets - should return an array of assets', () => {
    return request(app.getHttpServer())
      .get('/api/assets')
      // Asumsikan endpoint dilindungi, perlu token
      // .set('Authorization', `Bearer ${jwtToken}`) 
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0]).toHaveProperty('id');
      });
  });
});
```
