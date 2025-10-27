# Referensi API Backend

## 1. Sumber Daya: `Auth`
### `POST /api/auth/login`
-   **Deskripsi**: Mengautentikasi pengguna dan mengembalikan JWT.
-   **Otorisasi**: Publik
-   **Body**: `{ "email": "string", "password": "string" }`
-   **Response (200)**: `{ "access_token": "string" }`

## 2. Sumber Daya: `Assets`
### `GET /api/assets`
-   **Deskripsi**: Mengambil daftar semua aset dengan paginasi.
-   **Otorisasi**: `Bearer Token` (Semua Peran)
-   **Query Params**: `?page=1&limit=10&search=router&status=IN_USE`
-   **Response (200)**: Objek paginasi berisi `data` (array aset) dan `meta`.

### `POST /api/assets`
-   **Deskripsi**: Membuat aset baru.
-   **Otorisasi**: `Bearer Token` (Hanya `AdminLogistik`, `SuperAdmin`)
-   **Body**: `CreateAssetDto`
-   **Response (201)**: Objek aset yang baru dibuat.

*(...lanjutkan untuk endpoint lainnya...)*
