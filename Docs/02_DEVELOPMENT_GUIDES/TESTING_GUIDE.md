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

Menggunakan React Testing Library untuk menguji komponen `Checkbox`.

**File**: `src/components/ui/Checkbox.test.tsx`
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Checkbox } from './Checkbox';

describe('Checkbox Component', () => {
  test('renders unchecked by default', () => {
    render(<Checkbox data-testid="my-checkbox" />);
    const checkbox = screen.getByTestId('my-checkbox');
    expect(checkbox).not.toBeChecked();
  });

  test('renders checked when checked prop is true', () => {
    render(<Checkbox checked data-testid="my-checkbox" />);
    const checkbox = screen.getByTestId('my-checkbox');
    expect(checkbox).toBeChecked();
  });

  test('calls onChange when clicked', () => {
    const handleChange = jest.fn();
    render(<Checkbox onChange={handleChange} data-testid="my-checkbox" />);
    
    const checkbox = screen.getByTestId('my-checkbox');
    fireEvent.click(checkbox);
    
    expect(handleChange).toHaveBeenCalledTimes(1);
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
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';

describe('AssetsController (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtToken: string; // Token untuk autentikasi

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    
    prisma = app.get<PrismaService>(PrismaService);
    
    // Setup: Hapus data lama dan isi dengan data tes
    await prisma.asset.deleteMany({});
    await prisma.asset.create({
      data: { /* ... data aset untuk tes ... */ },
    });

    // Login sebagai user tes untuk mendapatkan token
    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'test-admin@example.com', password: 'password' });
    jwtToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/assets - should return an array of assets', () => {
    return request(app.getHttpServer())
      .get('/api/assets')
      .set('Authorization', `Bearer ${jwtToken}`) 
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);
        expect(res.body.data[0]).toHaveProperty('id');
      });
  });

  it('GET /api/assets - should fail with 401 if no token is provided', () => {
    return request(app.getHttpServer())
      .get('/api/assets')
      .expect(401);
  });
});
```
