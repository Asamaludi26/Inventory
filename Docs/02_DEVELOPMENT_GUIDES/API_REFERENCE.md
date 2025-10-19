# Referensi API Backend

Dokumen ini berfungsi sebagai panduan bagi developer (terutama frontend) untuk memahami cara berinteraksi dengan API backend.

## 1. Dokumentasi Interaktif (Swagger/OpenAPI)

Sumber kebenaran utama untuk semua endpoint API adalah dokumentasi Swagger yang di-generate secara otomatis oleh backend.

-   **URL (Lokal)**: [http://localhost:3001/api/docs](http://localhost:3001/api/docs)

Di halaman ini, Anda dapat:
-   Melihat daftar lengkap semua endpoint yang tersedia.
-   Melihat skema data (DTO) untuk setiap request dan response.
-   Mencoba mengirim request langsung dari browser (setelah login dan mendapatkan token).

## 2. Autentikasi

Semua endpoint, kecuali `/api/auth/login`, memerlukan autentikasi menggunakan **JWT (JSON Web Token)**.

### Alur Mendapatkan Token

1.  Kirim request `POST` ke `/api/auth/login` dengan body JSON berisi `email` dan `password`.
2.  Jika berhasil, response akan berisi `access_token`.

**Contoh Request (`curl`)**:
```bash
curl --location 'http://localhost:3001/api/auth/login' \
--header 'Content-Type: application/json' \
--data '{
    "email": "alice.johnson@triniti.com",
    "password": "password123"
}'
```

**Contoh Response Sukses**:
```json
{
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Menggunakan Token

Untuk setiap request ke endpoint yang terproteksi, sertakan token tersebut di dalam header `Authorization` dengan prefix `Bearer`.

**Contoh (`curl`)**:
```bash
curl --location 'http://localhost:3001/api/assets' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

## 3. Contoh Request & Response Umum

### Membuat Request Aset Baru

-   **Endpoint**: `POST /api/requests`
-   **Body**:
    ```json
    {
      "requester": "Budi Santoso",
      "division": "NOC",
      "requestDate": "2024-08-05T10:00:00.000Z",
      "order": {
        "type": "Urgent",
        "justification": "Kabel dropcore habis untuk perbaikan darurat."
      },
      "items": [
        {
          "itemName": "Kabel Dropcore 1 Core 150m",
          "itemTypeBrand": "FiberHome",
          "quantity": 2,
          "keterangan": "Untuk perbaikan di area Cengkareng."
        }
      ]
    }
    ```

## 4. Format Response Error

Jika terjadi error, backend akan mengembalikan response dengan format yang konsisten.

### Error Validasi (Status 400 - Bad Request)
Terjadi jika data yang dikirim tidak sesuai dengan DTO.

```json
{
    "statusCode": 400,
    "message": [
        "quantity must be a positive number",
        "itemName should not be empty"
    ],
    "error": "Bad Request"
}
```

### Error Autentikasi (Status 401 - Unauthorized)
Terjadi jika token tidak valid atau tidak disertakan.

```json
{
    "statusCode": 401,
    "message": "Unauthorized"
}
```

### Error Otorisasi (Status 403 - Forbidden)
Terjadi jika pengguna tidak memiliki _role_ yang cukup untuk mengakses endpoint.

```json
{
    "statusCode": 403,
    "message": "Forbidden resource",
    "error": "Forbidden"
}
```

### Error Tidak Ditemukan (Status 404 - Not Found)
Terjadi jika mencoba mengakses sumber daya dengan ID yang tidak ada.

```json
{
    "statusCode": 404,
    "message": "Asset with ID AST-999 not found",
    "error": "Not Found"
}
```