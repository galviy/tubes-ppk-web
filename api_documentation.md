#  Dokumentasi API


## Contoh


GET /api/reports

Mengambil daftar report yang tersedia.

Request:

```js
GET /api/reports
Authorization: Bearer <token>
``

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 12,
      "reason_id": 2,
      "description": "Konten melanggar ketentuan",
      "status": "pending"
    }
  ]
}

```