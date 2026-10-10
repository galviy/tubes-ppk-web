# API Design

## Frontend Routes

/register


/login
/facilities
/facilities/:id

/reservations
/reservations/create

/reports
/reports/create

/officer
/officer/reservations
/officer/reports
/officer/facilities

/admin
/admin/users
/admin/facilities
/admin/officers
/admin/overview

## Backend Routes

> Base URL: `http://127.0.0.1:8080`
> Auth: cookie `session_id` (HttpOnly, berlaku 1 jam). Role: `1 = admin`, `2 = petugas`, `3 = pengguna`.
> Format sukses/gagal umum: `{"message":"...","success":true|false}` kecuali dinyatakan lain.

### AUTHENTICATION


#### - POST   /auth/create_account/mhs

Registrasi mahasiswa. Masuk ke `user` (`isVerified=0`, `user_role=3`) + `mahasiswa_pending`. Bisa login setelah diverifikasi admin. Tanpa auth.

```curl
curl -i -w "\n\n[INFO] Waktu Total Respons: %{time_total} detik\n" \
-X POST http://127.0.0.1:8080/auth/create_account/mhs \
-H "Content-Type: application/x-www-form-urlencoded" \
-d "username=galvin&email=galvindoser@gmail.com&password=Test@123&nim=1921221&angkatan=2024&nama_lengkap=Galvin+Shalahudin&prodi=Informatika"
```

Field form (`application/x-www-form-urlencoded`):

| Field | Wajib | Validasi |
|---|---|---|
| `username` | ya | 5-100 char |
| `email` | ya | format email standar |
| `password` | ya | min 5 char, 1 huruf besar, 1 simbol (`IsPasswordValid`) |
| `nim` | ya | unik di `mahasiswa` |
| `angkatan` | ya | harus angka |
| `nama_lengkap` | ya | 3-100 char |
| `prodi` | ya | harus `nama_prodi` yang exist di tabel `prodi` |

Response sukses

```json
HTTP/1.1 200 OK
Content-Type: application/json

{"message":"Successfully created account with username (galvin), you can login when your account is verified!","success":true}
```

Response gagal

```json
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{"message":"Missing field!","success":false}
```

```json
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{"message":"Username atau email sudah exist sebelumnya!","success":false}
```

```json
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{"message":"Tidak ditemukan prodi dengan nama tersebut!","success":false}
```

```json
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{"message":"Password tidak valid! Harus minimal 5 karakter, mengandung 1 huruf besar, dan 1 simbol!","success":false}
```

```json
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{"message":"Email tidak sesuai dengan standar format email!","success":false}
```

```json
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{"message":"Angkatan harus berupa angka!","success":false}
```

```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"message":"Sudah ada mahasiswa dengan nim (1921221) terdaftar di database kita!","success":false}
```

> Duplikat nim dari pre-check `IsMhsExist` dibalas `400` (register mhs & admin create mhs). Race duplikat yang lolos pre-check (MySQL 1062) dibalas `409 {"message":"Username, email, atau nim sudah terdaftar di database kita!"}`. Berlaku sama untuk dosen (`nidn`) dan staff (`nip`).

#### - POST   /auth/create_account/dosen

Registrasi dosen. Masuk ke `user` (`isVerified=0`) + `dosen_pending`. Tanpa auth.

```curl
curl -i -w "\n\n[INFO] Waktu Total Respons: %{time_total} detik\n" \
-X POST http://127.0.0.1:8080/auth/create_account/dosen \
-H "Content-Type: application/x-www-form-urlencoded" \
-d "username=dosen01&email=dosen01@gmail.com&password=Test@123&nidn=1234567890&nama_lengkap=Dr+Dosen&prodi=Informatika"
```

Field form:

| Field | Wajib | Validasi |
|---|---|---|
| `username` | ya | 5-30 char |
| `email` | ya | format email standar |
| `password` | ya | 8-100 char + `IsPasswordValid` (min 5 char, 1 huruf besar, 1 simbol) |
| `nidn` | ya | tepat 10 char, unik di `dosen` |
| `nama_lengkap` | ya | 3-100 char |
| `prodi` | ya | harus `nama_prodi` yang exist |

Response sukses

```json
HTTP/1.1 200 OK
Content-Type: application/json

{"message":"Successfully created account with username (dosen01)!","success":true}
```

Response gagal

```json
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{"message":"Missing field!","success":false}
```

```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"message":"Sudah ada mahasiswa dengan nim (1921221) terdaftar di database kita!","success":false}
```

```json
HTTP/1.1 409 Conflict
Content-Type: application/json

{"message":"Username, email, atau nim sudah terdaftar di database kita!","success":false}
```

> `409` untuk race duplikat yang lolos pre-check (MySQL 1062).

```json
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{"message":"Username atau email sudah exist sebelumnya!","success":false}
```

```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"message":"Sudah ada Dosen dengan nidn (1234567890) terdaftar di database kita!","success":false}
```

```json
HTTP/1.1 409 Conflict
Content-Type: application/json

{"message":"Username, email, atau nidn sudah terdaftar di database kita!","success":false}
```

#### - POST   /auth/create_account/staff

Registrasi staff mandiri. Masuk ke `user` (`isVerified=0`, `user_role=3`, `tipe_user=Staff`) + tabel `staff` (satu tabel untuk pending & terverifikasi, dibedakan via `user.isVerified`). Tanpa auth. Route terdaftar di `routes/router.go`.

```curl
curl -i -w "\n\n[INFO] Waktu Total Respons: %{time_total} detik\n" \
-X POST http://127.0.0.1:8080/auth/create_account/staff \
-H "Content-Type: application/x-www-form-urlencoded" \
-d "username=staff01&email=staff01@gmail.com&password=Test@123&nip=198001012345&nama_lengkap=Staff+Satu"
```

Field form:

| Field | Wajib | Validasi |
|---|---|---|
| `username` | ya | 5-100 char |
| `email` | ya | format email standar |
| `password` | ya | `IsPasswordValid` (min 5 char, 1 huruf besar, 1 simbol) |
| `nip` | ya | dicek via `IsStaffExist` di tabel `staff.nip` |
| `nama_lengkap` | ya | 3-100 char |

Response sukses

```json
HTTP/1.1 200 OK
Content-Type: application/json

{"message":"Successfully created account with username (staff01), you can login when your account is verified!","success":true}
```

Response gagal

```json
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{"message":"Missing field!","success":false}
```

```json
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{"message":"Username atau email sudah exist sebelumnya!","success":false}
```

```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"message":"Sudah ada staff dengan nip (198001012345) terdaftar di database kita!","success":false}
```

```json
HTTP/1.1 409 Conflict
Content-Type: application/json

{"message":"Username, email, atau nip sudah terdaftar di database kita!","success":false}
```

> `409` di atas untuk race duplikat yang lolos pre-check (MySQL error 1062). `500 Internal server error` murni hanya untuk kegagalan DB/hash di luar itu.

#### - POST   /auth/login

```curl
curl -i -w "\n\n[INFO] Waktu Total Respons: %{time_total} detik\n" \
-X POST http://127.0.0.1:8080/auth/login \
-H "Content-Type: application/x-www-form-urlencoded" \
-d "email=bjorka@gmail.com&password=Test@123"
```

Field form: `email`, `password` (wajib, password harus lolos `IsPasswordValid`, email harus valid). Login hanya berhasil jika `isVerified=1`. Sukses menyet cookie `session_id` (HttpOnly, `Path=/`).

Response Berhasil

```json
HTTP/1.1 200 OK
Content-Type: application/json
Set-Cookie: session_id=fe3d5e16-dcb9-4984-9701-4db661c0f256; Path=/; HttpOnly
Date: Sun, 13 Sep 2026 23:00:39 GMT
Content-Length: 72

{"message":"successfully logged in to bjorka@gmail.com","success":true}


[INFO] Waktu Total Respons: 0.050292 detik
```

Response gagal

```json
HTTP/1.1 401 Unauthorized
Content-Type: application/json
Date: Sun, 13 Sep 2026 23:01:41 GMT
Content-Length: 59

{"message":"Invalid username or password","success":false}


[INFO] Waktu Total Respons: 0.052743 detik
```

Varian gagal lain (dari `controller/auth/login.go`):

```json
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{"message":"Email and Password are required to fill!","success":false}
```

```json
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{"message":"Make sure your account has been verified or you type a invalid username or password","success":false}
```

#### - POST   /auth/logout

Logout pengguna. Menghapus data sesi dari memori server (`session.Sessions[session_id]`) dan membersihkan cookie `session_id` di browser dengan masa berlaku lampau (`Max-Age: -1`). Route terdaftar di `routes/router.go`.

```curl
curl -i -X POST http://127.0.0.1:8080/auth/logout \
-b "session_id=5d6f1c09-78a8-42f8-80f8-c6e47bb462ae"
```

Response Berhasil:

```json
HTTP/1.1 200 OK
Content-Type: application/json
Set-Cookie: session_id=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly

{"message":"Successfully logged out","success":true}
```

### USER

GET /user

```curl
curl -i -w "\n\n[INFO] Waktu Total Respons: %{time_total} detik\n" \
-X GET http://127.0.0.1:8080/user/me \
-H "Content-Type: application/x-www-form-urlencoded" \
-b "session_id=5d6f1c09-78a8-42f8-80f8-c6e47bb462ae"
```

> Route aktual: `GET /user/me` dengan `middleware.Auth` (semua role yang login). Mengembalikan `Username` (huruf `U` besar), `email`, `Role` dari session.

Response berhasil 
```json
HTTP/1.1 200 OK
Content-Type: application/json
Date: Sun, 13 Sep 2026 23:03:04 GMT
Content-Length: 44

{"email":"bjorka@gmail.com","success":true}


[INFO] Waktu Total Respons: 0.000387 detik
```

Bentuk aktual dari `controller/user/me.go`:

```json
HTTP/1.1 200 OK
Content-Type: application/json

{"Role":"3","Username":"galvin","email":"galvindoser@gmail.com","success":true}
```

Response gagal

```json
HTTP/1.1 401 Unauthorized
Content-Type: text/plain; charset=utf-8
X-Content-Type-Options: nosniff
Date: Sun, 13 Sep 2026 23:04:12 GMT
Content-Length: 13

Unauthorized


[INFO] Waktu Total Respons: 0.000369 detik
```

#### - GET /users/{id}

Detail profil pengguna berdasarkan `id` (juga didukung alias `GET /user/{id}`). Auth: login (`middleware.Auth`). Diizinkan untuk Admin, Petugas, atau user pemilik akun (`sess.UserId == id`).

```curl
curl -i -X GET http://127.0.0.1:8080/users/25 \
-b "session_id=USER_SESSION_ID"
```

Response sukses:

```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "data": {
    "id": 25,
    "username": "budi01",
    "email": "budi@undip.ac.id",
    "role": "3",
    "is_verified": true,
    "tipe_user": "Dosen",
    "nama_lengkap": "Dr. Budi Santoso",
    "identifier": "0012345678",
    "prodi": "Informatika"
  },
  "success": true
}
```

Response gagal: `401 Unauthorized`, `403 Forbidden`, `404 User tidak ditemukan`.

#### - PATCH /users/{id}

Update profil pengguna (nama lengkap, email, password baru, angkatan). Auth: login. Diizinkan untuk Admin atau pemilik akun sendiri. Menerima JSON atau Form data.

```curl
curl -i -X PATCH http://127.0.0.1:8080/users/25 \
-H "Content-Type: application/json" \
-b "session_id=USER_SESSION_ID" \
-d '{"nama_lengkap":"Dr. Budi Santoso M.Kom","email":"budi.new@undip.ac.id"}'
```

Response sukses:

```json
HTTP/1.1 200 OK
Content-Type: application/json

{"message":"Profil berhasil diperbarui","success":true}
```

Response gagal: `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 User tidak ditemukan`, `409 Conflict (Email sudah terdaftar)`.

#### - PATCH /users/{id}/status

Suspend atau aktifkan kembali status akun (`isVerified`). Auth: Admin (`role == "1"`). Menerima JSON (`{"is_verified": true|false}`) atau form body (`is_verified=1|0`).

```curl
curl -i -X PATCH http://127.0.0.1:8080/users/25/status \
-H "Content-Type: application/json" \
-H "Cookie: session_id=ADMIN_SESSION_ID" \
-d '{"is_verified": true}'
```

Response sukses:

```json
HTTP/1.1 200 OK
Content-Type: application/json

{"message":"Berhasil memperbarui status user 25","success":true}
```

Response gagal: `400 Bad Request`, `401 Unauthorized`, `403 Forbidden (Tidak bisa menonaktifkan akun sendiri)`, `404 User tidak ditemukan`.


### Admin

> Semua route `/admin/*` memakai `middleware.AdminAuth`: wajib cookie `session_id` valid + `role == "1"`. Gagal selalu:

```json
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{"message":"you are not authorized to access this content","success":false}
```

GET /admin/show_user?limit=3

```curl
curl -i \
-H "Cookie: session_id=ea9eed38-0bdb-441d-90e9-d67482f04757" \ "http://localhost:8080/admin/show_user?limit=3"

```
Response berhasil

HTTP/1.1 200 OK
Content-Type: application/json
Date: Wed, 16 Sep 2026 04:25:29 GMT
Content-Length: 247
```json
{
    "data":[
        {
            "email":"galvindoser2@gmail.com",
            "id":15,
            "role":3,
            "username":"galvin2
        "},
        {
            "email":"galvindoser@gmail.com",
            "id":16,
            "role":1,
            "username":"galvin"
        },
        {
            "email":"galvidawndoser@gmail.com",
            "id":21,"role":3,
            "username":"gawdalvin
        "}
    ],
    "success":true
}
```

Query: `limit` opsional, default `10`, harus angka positif. Field tiap item: `id`, `username`, `email`, `role`.

Response gagal

```json
HTTP/1.1 401 Unauthorized
Content-Type: application/json
Date: Wed, 16 Sep 2026 04:24:07 GMT
Content-Length: 76

{"message":"you are not authorized to access this content","success":false}
```

Varian gagal validasi:

```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"message":"Limit must be a positive number","success":false}
```

#### - GET /admin/show_mhs_pending?limit=10

List mahasiswa yang belum diverifikasi (`mahasiswa_pending` join `user`). Auth: admin.

```curl
curl -i -w "\n\n[INFO] Waktu Total Respons: %{time_total} detik\n" \
-X GET "http://127.0.0.1:8080/admin/show_mhs_pending?limit=10" \
-H "Cookie: session_id=ADMIN_SESSION_ID"
```

Response sukses

```json
HTTP/1.1 200 OK
Content-Type: application/json

{"data":[{"angkatan":2024,"id":1,"nama_lengkap":"Galvin Shalahudin","nim":"1921221","username":"galvin"}],"success":true}
```

Response gagal

```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"message":"Limit must be a positive number","success":false}
```

```json
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{"message":"you are not authorized to access this content","success":false}
```

#### - GET /admin/show_mhs?limit=10

List mahasiswa terverifikasi (`mahasiswa` join `user`). Auth: admin.

```curl
curl -i -w "\n\n[INFO] Waktu Total Respons: %{time_total} detik\n" \
-X GET "http://127.0.0.1:8080/admin/show_mhs?limit=10" \
-H "Cookie: session_id=ADMIN_SESSION_ID"
```

Response sukses

```json
HTTP/1.1 200 OK
Content-Type: application/json

{"data":[{"angkatan":2024,"id":1,"nama_lengkap":"Galvin Shalahudin","nim":"1921221","prodi":1,"username":"galvin"}],"success":true}
```

Field: `id`, `nim`, `nama_lengkap`, `angkatan`, `username`, `prodi` (id prodi).

Response gagal: sama seperti `show_mhs_pending` (400 limit, 401 unauthorized, 500 `Failed to get users`).

#### - GET /admin/show_dosen_pending?limit=10

List dosen belum diverifikasi (`dosen_pending`). Auth: admin.

```curl
curl -i -w "\n\n[INFO] Waktu Total Respons: %{time_total} detik\n" \
-X GET "http://127.0.0.1:8080/admin/show_dosen_pending?limit=10" \
-H "Cookie: session_id=ADMIN_SESSION_ID"
```

Response sukses

```json
HTTP/1.1 200 OK
Content-Type: application/json

{"data":[{"id":1,"nidn":"1234567890","nama_lengkap":"Dr Dosen","prodi_dosen":1}],"success":true}
```

Response gagal

```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"message":"Limit must be a positive number","success":false}
```

#### - GET /admin/show_dosen?limit=10

List dosen terverifikasi (`dosen`). Auth: admin.

```curl
curl -i -w "\n\n[INFO] Waktu Total Respons: %{time_total} detik\n" \
-X GET "http://127.0.0.1:8080/admin/show_dosen?limit=10" \
-H "Cookie: session_id=ADMIN_SESSION_ID"
```

Response sukses

```json
HTTP/1.1 200 OK
Content-Type: application/json

{"data":[{"id":1,"nidn":"1234567890","nama_lengkap":"Dr Dosen","prodi_dosen":1}],"success":true}
```

Response gagal: 400 limit, 401 unauthorized, 500 `Failed to get users`.

#### - GET /admin/show_staff_pending?limit=10

List staff yang belum diverifikasi (`staff` join `user` dengan `u.isVerified = 0`). Auth: admin. Business logic baru: staff sekarang sama seperti mhs/dosen (pending dulu, `isVerified=0`, `user_role=3`), tidak lagi langsung aktif.

```curl
curl -i -w "\n\n[INFO] Waktu Total Respons: %{time_total} detik\n" \
-X GET "http://127.0.0.1:8080/admin/show_staff_pending?limit=10" \
-H "Cookie: session_id=ADMIN_SESSION_ID"
```

Response sukses

```json
HTTP/1.1 200 OK
Content-Type: application/json

{"data":[{"email":"staff01@gmail.com","id":1,"nama_lengkap":"Staff Satu","nip":"198001012345"}],"success":true}
```

Field tiap item: `id` (`staff.id`, bukan `user.id`), `nip`, `nama_lengkap`, `email`.

Response gagal

```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"message":"Limit must be a positive number","success":false}
```

```json
HTTP/1.1 500 Internal Server Error
Content-Type: application/json

{"message":"Failed to get users","success":false}
```

#### - GET /admin/show_staff?limit=10

List staff terverifikasi (`staff` join `user` dengan `u.isVerified = 1`). Auth: admin.

```curl
curl -i -w "\n\n[INFO] Waktu Total Respons: %{time_total} detik\n" \
-X GET "http://127.0.0.1:8080/admin/show_staff?limit=10" \
-H "Cookie: session_id=ADMIN_SESSION_ID"
```

Response sukses

```json
HTTP/1.1 200 OK
Content-Type: application/json

{"data":[{"email":"staff01@gmail.com","id":1,"nama_lengkap":"Staff Satu","nip":"198001012345"}],"success":true}
```

Response gagal: 400 limit, 401 unauthorized, 500 `Failed to get users`.

#### - POST /admin/verifikasi_mhs

Verifikasi satu mahasiswa pending: `UPDATE user SET isVerified=1`, pindah `mahasiswa_pending -> mahasiswa`, hapus pending. Auth: admin. Form: `id_mhs` (id di `mahasiswa_pending`, bukan nim). `id` yang tidak ada dibalas `404` (bukan `500`), duplikat `nim` dibalas `409`.

```curl
curl -i -w "\n\n[INFO] Waktu Total Respons: %{time_total} detik\n" \
-X POST http://127.0.0.1:8080/admin/verifikasi_mhs \
-H "Content-Type: application/x-www-form-urlencoded" \
-H "Cookie: session_id=ADMIN_SESSION_ID" \
-d "id_mhs=1"
```

Response sukses:

```json
HTTP/1.1 200 OK
Content-Type: application/json

{"message":"Berhasil melakukan verifikasi user mahasiswa 1","success":true}
```

Response gagal

```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"message":"Sudah ada Dosen dengan nidn (1234567890) terdaftar di database kita!","success":false}
```

```json
HTTP/1.1 409 Conflict
Content-Type: application/json

{"message":"Username, email, atau nidn sudah terdaftar di database kita!","success":false}
```

> `409` untuk race duplikat yang lolos pre-check (MySQL 1062).

```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"message":"You have to input a integer boskuh!","success":false}
```

```json
HTTP/1.1 404 Not Found
Content-Type: application/json

{"message":"Data mahasiswa pending dengan id tersebut tidak ditemukan!","success":false}
```

```json
HTTP/1.1 409 Conflict
Content-Type: application/json

{"message":"Nim tersebut sudah pernah terverifikasi!","success":false}
```

```json
HTTP/1.1 500 Internal Server Error
Content-Type: application/json

{"message":"Internal server error!","success":false}
```

#### - POST /admin/verifikasi_dosen

Verifikasi satu dosen pending: `UPDATE user SET isVerified=1`, pindah `dosen_pending -> dosen`. Auth: admin. Form: `id_dosen` (id di `dosen_pending`). `id` yang tidak ada dibalas `404` (bukan `500`), duplikat `nidn` dibalas `409`.

```curl
curl -i -w "\n\n[INFO] Waktu Total Respons: %{time_total} detik\n" \
-X POST http://127.0.0.1:8080/admin/verifikasi_dosen \
-H "Content-Type: application/x-www-form-urlencoded" \
-H "Cookie: session_id=ADMIN_SESSION_ID" \
-d "id_dosen=1"
```

Response sukses

```json
HTTP/1.1 200 OK
Content-Type: application/json

{"message":"Berhasil melakukan verifikasi user dosen 1","success":true}
```

Response gagal

```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"message":"You need id_dosen to peform this action!","success":false}
```

```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"message":"You have to input a integer boskuh!","success":false}
```

```json
HTTP/1.1 404 Not Found
Content-Type: application/json

{"message":"Data dosen pending dengan id tersebut tidak ditemukan!","success":false}
```

```json
HTTP/1.1 409 Conflict
Content-Type: application/json

{"message":"nidn tersebut sudah pernah terverifikasi!","success":false}
```

```json
HTTP/1.1 500 Internal Server Error
Content-Type: application/json

{"message":"Internal server error!","success":false}
```

#### - POST /admin/verifikasi_staff

Verifikasi satu staff: `UPDATE user SET isVerified = 1` berdasarkan `id` di tabel `staff` (tidak ada pindah tabel karena `staff` satu tabel untuk pending & aktif, dibedakan via `user.isVerified`). Auth: admin. Form: `id_staff` (id di tabel `staff`, sama seperti yang dikembalikan `GET /admin/show_staff_pending`). `id` yang tidak ada dibalas `404`, staff yang sudah terverifikasi dibalas `409`.

```curl
curl -i -w "\n\n[INFO] Waktu Total Respons: %{time_total} detik\n" \
-X POST http://127.0.0.1:8080/admin/verifikasi_staff \
-H "Content-Type: application/x-www-form-urlencoded" \
-H "Cookie: session_id=ADMIN_SESSION_ID" \
-d "id_staff=1"
```

Response sukses:

```json
HTTP/1.1 200 OK
Content-Type: application/json

{"message":"Berhasil melakukan verifikasi user staff 1","success":true}
```

Response gagal

```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"message":"You need id_staff to peform this action!","success":false}
```

```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"message":"You have to input a integer boskuh!","success":false}
```

```json
HTTP/1.1 404 Not Found
Content-Type: application/json

{"message":"Data staff dengan id tersebut tidak ditemukan!","success":false}
```

```json
HTTP/1.1 409 Conflict
Content-Type: application/json

{"message":"Staff tersebut sudah pernah terverifikasi!","success":false}
```

```json
HTTP/1.1 500 Internal Server Error
Content-Type: application/json

{"message":"Internal server error!","success":false}
```

#### - POST /admin/tolak_mhs

Menolak pendaftaran mahasiswa pending (hapus baris `mahasiswa_pending` + user terkait). Auth: admin. Form: `id_mhs` (id di `mahasiswa_pending`).

```curl
curl -i -w "\n\n[INFO] Waktu Total Respons: %{time_total} detik\n" \
-X POST http://127.0.0.1:8080/admin/tolak_mhs \
-H "Content-Type: application/x-www-form-urlencoded" \
-H "Cookie: session_id=ADMIN_SESSION_ID" \
-d "id_mhs=1"
```

Response sukses:

```json
HTTP/1.1 200 OK
Content-Type: application/json

{"message":"Berhasil menolak pendaftaran mahasiswa 1","success":true}
```

Response gagal: `400 Bad Request (Bad Request | You need id_mhs to peform this action! | You have to input a integer boskuh!)`, `404 Data mahasiswa pending dengan id tersebut tidak ditemukan!`, `500 Internal server error!`.

#### - POST /admin/tolak_dosen

Menolak pendaftaran dosen pending. Auth: admin. Form: `id_dosen` (id di `dosen_pending`).

```curl
curl -i -w "\n\n[INFO] Waktu Total Respons: %{time_total} detik\n" \
-X POST http://127.0.0.1:8080/admin/tolak_dosen \
-H "Content-Type: application/x-www-form-urlencoded" \
-H "Cookie: session_id=ADMIN_SESSION_ID" \
-d "id_dosen=1"
```

Response sukses:

```json
HTTP/1.1 200 OK
Content-Type: application/json

{"message":"Berhasil menolak pendaftaran dosen 1","success":true}
```

Response gagal: `400 Bad Request (Bad Request | You need id_dosen to peform this action! | You have to input a integer boskuh!)`, `404 Data dosen pending dengan id tersebut tidak ditemukan!`, `500 Internal server error!`.

#### - POST /admin/tolak_staff

Menolak pendaftaran staff. Auth: admin. Form: `id_staff` (id di tabel `staff`).

```curl
curl -i -w "\n\n[INFO] Waktu Total Respons: %{time_total} detik\n" \
-X POST http://127.0.0.1:8080/admin/tolak_staff \
-H "Content-Type: application/x-www-form-urlencoded" \
-H "Cookie: session_id=ADMIN_SESSION_ID" \
-d "id_staff=1"
```

Response sukses:

```json
HTTP/1.1 200 OK
Content-Type: application/json

{"message":"Berhasil menolak pendaftaran staff 1","success":true}
```

Response gagal: `400 Bad Request (Bad Request | You need id_staff to peform this action! | You have to input a integer boskuh!)`, `404 Data staff dengan id tersebut tidak ditemukan!`, `500 Internal server error!`.

#### - POST /admin/users/status

Suspend (`is_verified=0`, tidak bisa login) atau aktifkan kembali (`is_verified=1`) akun. Auth: admin. Berbeda dengan `PATCH /users/{id}/status` (menerima JSON): endpoint ini memakai form `application/x-www-form-urlencoded` dengan field `id` + `is_verified`. Menolak suspend akun sendiri (`403`).

```curl
curl -i -w "\n\n[INFO] Waktu Total Respons: %{time_total} detik\n" \
-X POST http://127.0.0.1:8080/admin/users/status \
-H "Content-Type: application/x-www-form-urlencoded" \
-H "Cookie: session_id=ADMIN_SESSION_ID" \
-d "id=25&is_verified=0"
```

Field form:

| Field | Wajib | Validasi |
|---|---|---|
| `id` | ya | integer >0 |
| `is_verified` | ya | hanya `0` atau `1` |

Response sukses:

```json
HTTP/1.1 200 OK
Content-Type: application/json

{"message":"Berhasil memperbarui status user 25","success":true}
```

Response gagal

```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"message":"Missing field! (id, is_verified)","success":false}
```

```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"message":"ID user tidak valid","success":false}
```

```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"message":"is_verified hanya 0 atau 1","success":false}
```

```json
HTTP/1.1 403 Forbidden
Content-Type: application/json

{"message":"Tidak bisa menonaktifkan akun sendiri","success":false}
```

```json
HTTP/1.1 404 Not Found
Content-Type: application/json

{"message":"User dengan id tersebut tidak ditemukan!","success":false}
```

Admin membuat mahasiswa langsung terverifikasi (`isVerified=1` ke `mahasiswa`, bukan pending). Auth: admin. Validasi mirip register mhs, beda: `username` min 5 huruf saja, duplikat nim -> 400.

```curl
curl -i -w "\n\n[INFO] Waktu Total Respons: %{time_total} detik\n" \
-X POST http://127.0.0.1:8080/admin/create_user/mhs \
-H "Content-Type: application/x-www-form-urlencoded" \
-H "Cookie: session_id=ADMIN_SESSION_ID" \
-d "username=galvin&email=galvindoser@gmail.com&password=Test@123&nim=1921221&angkatan=2024&nama_lengkap=Galvin+Shalahudin&prodi=Informatika"
```

Field: `username`, `email`, `password`, `nim`, `angkatan` (angka), `nama_lengkap`, `prodi` (nama_prodi exist). Semua wajib.

Response sukses

```json
HTTP/1.1 200 OK
Content-Type: application/json

{"message":"Successfully created account with username (galvin), you can login when your account is verified!","success":true}
```

Response gagal

```json
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{"message":"Missing field!","success":false}
```

```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"message":"Sudah ada mahasiswa dengan nim (1921221) terdaftar di database kita!","success":false}
```

#### - POST /admin/create_user/dosen

Admin membuat dosen langsung terverifikasi. Auth: admin.

```curl
curl -i -w "\n\n[INFO] Waktu Total Respons: %{time_total} detik\n" \
-X POST http://127.0.0.1:8080/admin/create_user/dosen \
-H "Content-Type: application/x-www-form-urlencoded" \
-H "Cookie: session_id=ADMIN_SESSION_ID" \
-d "username=dosen01&email=dosen01@gmail.com&password=Test@123&nidn=1234567890&nama_lengkap=Dr+Dosen&prodi=Informatika"
```

Field: `username` (min 5), `email`, `password` (`IsPasswordValid`), `nidn` (unik), `nama_lengkap`, `prodi` (nama_prodi exist). Semua wajib.

Response sukses

```json
HTTP/1.1 200 OK
Content-Type: application/json

{"message":"Successfully created account with username (dosen01)!","success":true}
```

Response gagal

```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"message":"Sudah ada Dosen dengan nidn (1234567890) terdaftar di database kita!","success":false}
```

#### - POST /admin/create_user/staff

Admin membuat staff yang langsung aktif (`user_tipe=Staff`, `user_role=3`, `isVerified=1` + tabel `staff`, via `repositories.CreateSTAFFLangsung`). Auth: admin. Berbeda dengan registrasi mandiri (`POST /auth/create_account/staff`) yang menghasilkan akun pending (`isVerified=0`).

```curl
curl -i -w "\n\n[INFO] Waktu Total Respons: %{time_total} detik\n" \
-X POST http://127.0.0.1:8080/admin/create_user/staff \
-H "Content-Type: application/x-www-form-urlencoded" \
-H "Cookie: session_id=ADMIN_SESSION_ID" \
-d "username=staff01&email=staff01@gmail.com&password=Test@123&nip=198001012345&nama_lengkap=Staff+Satu"
```

Field: `username` (min 5), `email`, `password`, `nip` (unik di `staff.nip`), `nama_lengkap`. Semua wajib.

Response sukses

```json
HTTP/1.1 200 OK
Content-Type: application/json

{"message":"Successfully created account with username (staff01)!","success":true}
```

Response gagal

```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"message":"Sudah ada staff dengan nip (198001012345) terdaftar di database kita!","success":false}
```

```json
HTTP/1.1 409 Conflict
Content-Type: application/json

{"message":"Username, email, atau nip sudah terdaftar di database kita!","success":false}
```

> `409` untuk race duplikat yang lolos pre-check (MySQL 1062).

#### - POST /admin/create_user/petugas

Admin membuat akun petugas (`user_role=2`, `isVerified=1`, `tipe_user=Petugas` via `repositories.CreatePetugas`). Auth: admin. Pastikan baris `Petugas` ada di tabel `user_tipe`; jika tidak, `INSERT` gagal menjadi `500`.

```curl
curl -i -w "\n\n[INFO] Waktu Total Respons: %{time_total} detik\n" \
-X POST http://127.0.0.1:8080/admin/create_user/petugas \
-H "Content-Type: application/x-www-form-urlencoded" \
-H "Cookie: session_id=ADMIN_SESSION_ID" \
-d "username=petugas01&email=petugas01@gmail.com&password=Test@123"
```

Field: `username` (min 5), `email`, `password` (`IsPasswordValid`). Semua wajib.

Response sukses

```json
HTTP/1.1 200 OK
Content-Type: application/json

{"message":"Successfully created account with username (petugas01)!","success":true}
```

Response gagal

```json
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{"message":"Missing field!","success":false}
```

```json
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{"message":"Username atau email sudah exist sebelumnya!","success":false}
```

```json
HTTP/1.1 409 Conflict
Content-Type: application/json

{"message":"Username atau email sudah terdaftar di database kita!","success":false}
```

#### - POST /admin/create_user/admin

Admin membuat akun admin (`user_role=1`, `isVerified=1`, `tipe_user=Admin`). Auth: admin. Pastikan baris `Admin` ada di tabel `user_tipe`; jika tidak, `INSERT` gagal menjadi `500`.

```curl
curl -i -w "\n\n[INFO] Waktu Total Respons: %{time_total} detik\n" \
-X POST http://127.0.0.1:8080/admin/create_user/admin \
-H "Content-Type: application/x-www-form-urlencoded" \
-H "Cookie: session_id=ADMIN_SESSION_ID" \
-d "username=admin02&email=admin02@gmail.com&password=Test@123"
```

Field: `username` (min 5), `email`, `password` (`IsPasswordValid`). Semua wajib.

Response sukses

```json
HTTP/1.1 200 OK
Content-Type: application/json

{"message":"Successfully created account with username (admin02)!","success":true}
```

Response gagal: `401 Missing field!`, `401 Username atau email sudah exist sebelumnya!`, `409 Username atau email sudah terdaftar di database kita!` (race duplikat), `500 Internal server error`.

#### - POST /admin/create_fasilitas/kategori

Buat kategori fasilitas. Auth: admin.

```curl
curl -i -w "\n\n[INFO] Waktu Total Respons: %{time_total} detik\n" \
-X POST http://127.0.0.1:8080/admin/create_fasilitas/kategori \
-H "Content-Type: application/x-www-form-urlencoded" \
-H "Cookie: session_id=ADMIN_SESSION_ID" \
-d "nama_kategori=Ruang+Kelas"
```

Field: `nama_kategori` wajib, 5-100 char, unik.

Response sukses

```json
HTTP/1.1 200 OK
Content-Type: application/json

{"message":"Successfully created kategori (Ruang Kelas)!","success":true}
```

Response gagal

```json
HTTP/1.1 502 Bad Gateway
Content-Type: application/json

{"message":"Missing field!","success":false}
```

```json
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{"message":"Kategori (Ruang Kelas) sudah exist di database!","success":false}
```

#### - POST /admin/create_fasilitas/ruangan

Buat ruangan. Auth: admin. Perhatikan nama field `kapasistas` (apa adanya di code, bukan `kapasitas`).

```curl
curl -i -w "\n\n[INFO] Waktu Total Respons: %{time_total} detik\n" \
-X POST http://127.0.0.1:8080/admin/create_fasilitas/ruangan \
-H "Content-Type: application/x-www-form-urlencoded" \
-H "Cookie: session_id=ADMIN_SESSION_ID" \
-d "nama_kategori=Ruang+Kelas&nama_ruangan=R101&status=1&kapasistas=40&lokasi=Gedung+A"
```

Field:

| Field | Keterangan |
|---|---|
| `nama_kategori` | wajib, 5-100 char, harus exist di `kategori` |
| `nama_ruangan` | wajib, unik |
| `status` | wajib, integer `0`/`1` saja |
| `kapasistas` | wajib, integer (ejaan sesuai code) |
| `lokasi` | wajib |
| `deskripsi` | opsional, deskripsi rincian ruangan (alias: `desc`) |
| `kelengkapan` | opsional, string kelengkapan dipisah koma (alias: `amenities`) |
| `foto` | opsional, data URL base64 atau path/URL foto (alias: `image`) |

Response sukses

```json
HTTP/1.1 200 OK
Content-Type: application/json

{"message":"Successfully created ruangan (R101)!","success":true}
```

Response gagal

```json
HTTP/1.1 502 Bad Gateway
Content-Type: application/json

{"message":"Missing field!","success":false}
```

```json
HTTP/1.1 502 Bad Gateway
Content-Type: application/json

{"message":"Status ruangan hanya true (1) atau false (0) pakkk!","success":false}
```

```json
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{"message":"Kategori (Ruang Kelas) tidak exist di database!","success":false}
```

```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"message":"Ruangan dengan nama (R101) sudah exist di database!","success":false}
```

#### - POST /admin/create_fasilitas/alat

Buat alat. Auth: admin.

```curl
curl -i -w "\n\n[INFO] Waktu Total Respons: %{time_total} detik\n" \
-X POST http://127.0.0.1:8080/admin/create_fasilitas/alat \
-H "Content-Type: application/x-www-form-urlencoded" \
-H "Cookie: session_id=ADMIN_SESSION_ID" \
-d "nama_alat=Proyektor&jumlah_tersedia=5&banyak_alat=10&nama_kategori=Elektronik&status=1"
```

Field: `nama_alat` (unik, wajib), `jumlah_tersedia` (integer >=0), `banyak_alat` (integer >=0), `nama_kategori` (5-100 char, harus exist), `status` (integer 0/1), `deskripsi` (opsional), `kelengkapan` (opsional), `foto` (opsional). `nama_kategori` + `nama_alat` wajib.

Response sukses

```json
HTTP/1.1 200 OK
Content-Type: application/json

{"message":"Successfully created Alat (Proyektor)!","success":true}
```

Response gagal

```json
HTTP/1.1 502 Bad Gateway
Content-Type: application/json

{"message":"Missing field!","success":false}
```

```json
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{"message":"Kategori (Elektronik) tidak exist di database!","success":false}
```

```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"message":"Alat dengan nama (Proyektor) sudah exist di database!","success":false}
```

#### - POST /admin/update_fasilitas/ruangan

Memperbarui spesifikasi ruangan. Auth: admin. `Content-Type: application/x-www-form-urlencoded`. Perhatikan ejaan field `kapasistas` (dengan `s`, sesuai code).

```curl
curl -i -w "\n\n[INFO] Waktu Total Respons: %{time_total} detik\n" \
-X POST http://127.0.0.1:8080/admin/update_fasilitas/ruangan \
-H "Content-Type: application/x-www-form-urlencoded" \
-H "Cookie: session_id=ADMIN_SESSION_ID" \
-d "id=1&nama_kategori=Ruang+Kelas&nama_ruangan=R101&status=1&kapasistas=40&lokasi=Gedung+A"
```

Field:

| Field | Wajib | Validasi |
|---|---|---|
| `id` | ya | integer >0 |
| `nama_kategori` | ya | 5-100 char, harus exist di `kategori` |
| `nama_ruangan` | ya | non-empty, unik |
| `status` | ya | integer `0`/`1` saja |
| `kapasistas` | ya | integer >0 |
| `lokasi` | ya | non-empty |
| `deskripsi` (alias `desc`) | tidak | teks bebas |
| `kelengkapan` (alias `amenities`) | tidak | string dipisah koma |
| `foto` (alias `image`) | tidak | data URL base64 / path / URL foto |

Response sukses:

```json
HTTP/1.1 200 OK
Content-Type: application/json

{"message":"Successfully updated ruangan (R101)!","success":true}
```

Response gagal: `400 ID ruangan tidak valid`, `502 Missing field!`, `502 Status ruangan hanya true (1) atau false (0) pakkk!`, `502 kapasitas has to be integer pak!`, `401 Username minimal 5 Huruf dan tidak boleh lebih dari 100 huruf!` (nama kategori), `401 Kategori (...) tidak exist di database!`, `404 Ruangan dengan id tersebut tidak ditemukan!`, `409 Ruangan dengan nama (...) sudah exist di database!`, `500 Internal server error`.

#### - POST /admin/update_fasilitas/alat

Memperbarui spesifikasi alat. Auth: admin. `Content-Type: application/x-www-form-urlencoded`.

```curl
curl -i -w "\n\n[INFO] Waktu Total Respons: %{time_total} detik\n" \
-X POST http://127.0.0.1:8080/admin/update_fasilitas/alat \
-H "Content-Type: application/x-www-form-urlencoded" \
-H "Cookie: session_id=ADMIN_SESSION_ID" \
-d "id=2&nama_kategori=Elektronik&nama_alat=Proyektor&status=1&jumlah_tersedia=5&banyak_alat=10"
```

Field:

| Field | Wajib | Validasi |
|---|---|---|
| `id` | ya | integer >0 |
| `nama_kategori` | ya | 5-100 char, harus exist di `kategori` |
| `nama_alat` | ya | non-empty, unik |
| `status` | ya | integer `0`/`1` saja |
| `jumlah_tersedia` | ya | integer >=0 |
| `banyak_alat` | ya | integer >=0 |
| `deskripsi` (alias `desc`) | tidak | teks bebas |
| `kelengkapan` (alias `amenities`) | tidak | string dipisah koma |
| `foto` (alias `image`) | tidak | data URL base64 / path / URL foto |

Response sukses:

```json
HTTP/1.1 200 OK
Content-Type: application/json

{"message":"Successfully updated Alat (Proyektor)!","success":true}
```

Response gagal: `400 ID alat tidak valid`, `502 Missing field!`, `502 Status alat hanya true (1) atau false (0)!`, `502 jumlah_tersedia has to be integer pak!`, `502 banyak_alat has to be integer pak!`, `401 Username minimal 5 Huruf dan tidak boleh lebih dari 100 huruf!`, `401 Kategori (...) tidak exist di database!`, `404 Alat dengan id tersebut tidak ditemukan!`, `409 Alat dengan nama (...) sudah exist di database!`, `500 Internal server error`.

#### - POST /admin/delete_fasilitas/ruangan

Nonaktifkan ruangan (soft delete, bukan hapus fisik karena FK reservasi/laporan). Auth: admin. Form: `id` (integer >0).

```curl
curl -i -w "\n\n[INFO] Waktu Total Respons: %{time_total} detik\n" \
-X POST http://127.0.0.1:8080/admin/delete_fasilitas/ruangan \
-H "Content-Type: application/x-www-form-urlencoded" \
-H "Cookie: session_id=ADMIN_SESSION_ID" \
-d "id=1"
```

Response sukses:

```json
HTTP/1.1 200 OK
Content-Type: application/json

{"message":"Ruangan berhasil dinonaktifkan!","success":true}
```

Response gagal: `400 ID ruangan tidak valid`, `404 Ruangan dengan id tersebut tidak ditemukan!`, `500 Internal server error`.

#### - POST /admin/delete_fasilitas/alat

Nonaktifkan alat (`status=0`, stok tampil `0`). Auth: admin. Form: `id` (integer >0).

```curl
curl -i -w "\n\n[INFO] Waktu Total Respons: %{time_total} detik\n" \
-X POST http://127.0.0.1:8080/admin/delete_fasilitas/alat \
-H "Content-Type: application/x-www-form-urlencoded" \
-H "Cookie: session_id=ADMIN_SESSION_ID" \
-d "id=2"
```

Response sukses:

```json
HTTP/1.1 200 OK
Content-Type: application/json

{"message":"Alat berhasil dinonaktifkan!","success":true}
```

Response gagal: `400 ID alat tidak valid`, `404 Alat dengan id tersebut tidak ditemukan!`, `500 Internal server error`.

### AKADEMIK

Referensi fakultas & prodi untuk form registrasi. Tanpa auth (publik).

#### - GET /fakultas

List fakultas beserta prodi di dalamnya.

```curl
curl -i -X GET http://127.0.0.1:8080/fakultas
```

Response sukses:

```json
HTTP/1.1 200 OK
Content-Type: application/json

{"data":[...],"success":true}
```

Response gagal: `500 Gagal mengambil daftar fakultas`.

#### - GET /prodi

List seluruh prodi (dipakai validasi field `prodi` saat registrasi).

```curl
curl -i -X GET http://127.0.0.1:8080/prodi
```

Response sukses:

```json
HTTP/1.1 200 OK
Content-Type: application/json

{"data":[...],"success":true}
```

Response gagal: `500 Gagal mengambil daftar prodi`.

### FACILITIES

Endpoint katalog, detail, dan status fasilitas. Tersedia format route bahasa Indonesia (`/fasilitas/*`) maupun alias RESTful (`/facilities/*`).

- `GET /fasilitas` (alias `GET /facilities`): List seluruh fasilitas dengan filter query (`q`, `lokasi`, `kapasitas_min`, `tipe=ruangan|alat`, `page`, `limit`).
- `GET /fasilitas/{id}` (alias `GET /facilities/{id}`): Detail satu fasilitas (ruangan atau alat) berdasarkan ID (misal `1`, `ruangan-1`, atau `alat-2`).
- `GET /fasilitas/ketersediaan` (alias `GET /facilities/{id}/availability` dan `GET /jadwal`): Ketersediaan slot waktu jadwal peminjaman.
- `POST /admin/create_fasilitas/ruangan` & `POST /admin/create_fasilitas/alat`: Pembuatan fasilitas oleh admin.
- `POST /admin/update_fasilitas/ruangan` & `POST /admin/update_fasilitas/alat`: Pembaruan spesifikasi fasilitas oleh admin.
- `POST /admin/delete_fasilitas/ruangan` & `POST /admin/delete_fasilitas/alat`: Penghapusan fasilitas oleh admin.
- `PATCH /petugas/facilities/{id}/status`: Pembaruan status operasional fasilitas (aktif, nonaktif, dalam_perbaikan).

#### - GET /fasilitas & GET /facilities

List seluruh fasilitas (ruangan + alat) dengan filter. Tanpa auth (publik). Alias `GET /facilities` memakai handler sama.

```curl
curl -i -X GET "http://127.0.0.1:8080/fasilitas?q=kelas&tipe=ruangan&page=1&limit=10"
```

Query:

| Parameter | Keterangan |
|---|---|
| `tipe` | opsional: `ruangan` / `alat` (case-insensitive). Selain itu → `400 Tipe fasilitas harus ruangan atau alat` |
| `q` | opsional, kata kunci nama |
| `lokasi` | opsional, filter lokasi |
| `kapasitas_min` | opsional, integer >=0 → `400 kapasitas_min harus angka positif` |
| `page` | opsional, default `1`, integer >0 → `400 page harus angka positif` |
| `limit` | opsional, default tanpa limit, integer >0 (di-clamp 100) → `400 limit harus angka positif` |

Response sukses:

```json
HTTP/1.1 200 OK
Content-Type: application/json

{"data":[...],"limit":10,"page":1,"success":true,"total":24}
```

Response gagal: `500 Gagal mengambil daftar fasilitas`.

#### - GET /fasilitas/ruangan & GET /fasilitas/alat

Sama seperti di atas tetapi `tipe` dipaksa (`ruangan` / `alat`). Tanpa auth (publik).

```curl
curl -i -X GET "http://127.0.0.1:8080/fasilitas/ruangan?lokasi=Gedung+A"
curl -i -X GET "http://127.0.0.1:8080/fasilitas/alat?q=proyektor"
```

#### - GET /fasilitas/ketersediaan (& /jadwal, /facilities/{id}/availability)

Ketersediaan slot waktu 30 menit per fasilitas untuk N hari ke depan. Tanpa auth (publik). Path `{id}` pada alias `facilities/{id}/availability` diabaikan — yang dipakai hanya query.

```curl
curl -i -X GET "http://127.0.0.1:8080/fasilitas/ketersediaan?tanggal=2026-10-12&hari=7&tipe=ruangan"
```

Query:

| Parameter | Default | Keterangan |
|---|---|---|
| `tanggal` | hari ini (WIB) | format `YYYY-MM-DD`. Mundur ke masa lalu → `400 Jadwal hanya tersedia untuk hari ini dan tanggal berikutnya` |
| `hari` | `7` | integer >0, di-clamp 30 → `400 hari harus angka positif` |
| `tipe` | semua | `ruangan` / `alat` → `400 Tipe fasilitas harus ruangan atau alat` |

Response sukses: `200 {"data":[...],"success":true}`. Response gagal: `400 Format tanggal tidak valid! Gunakan YYYY-MM-DD`, `500 Gagal mengambil ketersediaan fasilitas`.

#### - GET /fasilitas/{id}

Detail satu fasilitas. Tanpa auth (publik). Mendukung parameter id berupa angka (misal `1`), atau dengan prefix tipe (`ruangan-1` atau `alat-2`).

```curl
curl -i -X GET http://127.0.0.1:8080/fasilitas/1
```

Response sukses:

```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "data": {
    "id": "ruangan-1",
    "ref_id": 1,
    "tipe": "ruangan",
    "name": "Ruang Kelas 101",
    "type": "Ruang Kelas",
    "loc": "Gedung A Lt. 1",
    "cap": 40,
    "jumlah_tersedia": 0,
    "desc": "Ruang kelas perkuliahan",
    "amenities": ["AC", "Proyektor", "Papan Tulis"],
    "status": "avail",
    "image": null
  },
  "success": true
}
```

Response gagal: `400 Bad Request (ID tidak valid)`, `404 Not Found (Fasilitas tidak ditemukan)`.

#### - PATCH /petugas/facilities/{id}/status

Update status ruangan/alat. Auth: login + role `petugas (2)` / `admin (1)`. `Content-Type: application/json`.

```curl
curl -i -w "\n\n[INFO] Waktu Total Respons: %{time_total} detik\n" \
-X PATCH http://127.0.0.1:8080/petugas/facilities/1/status \
-H "Content-Type: application/json" \
-H "Cookie: session_id=PETUGAS_SESSION_ID" \
-d '{"status":"dalam_perbaikan","tipe":"ruangan"}'
```

Path: `id` integer > 0. Body JSON:

| Field | Nilai |
|---|---|
| `status` | `aktif` / `nonaktif` / `dalam_perbaikan` (case-insensitive) |
| `tipe` | `ruangan` (default jika kosong) / `alat` |

Efek: `tipe=ruangan` -> `UPDATE ruangan SET status=?`; `tipe=alat` -> `UPDATE alat SET jumlah_tersedia=?` (`total` jika `aktif`, `0` jika lainnya).

Response sukses

```json
HTTP/1.1 200 OK
Content-Type: application/json

{"message":"Status fasilitas berhasil diperbarui","success":true}
```

Response gagal

```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"message":"ID fasilitas tidak valid","success":false}
```

```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"message":"Status fasilitas tidak valid","success":false}
```

```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"message":"Tipe fasilitas harus ruangan atau alat","success":false}
```

```json
HTTP/1.1 404 Not Found
Content-Type: application/json

{"message":"Ruangan tidak ditemukan","success":false}
```

```json
HTTP/1.1 404 Not Found
Content-Type: application/json

{"message":"Alat tidak ditemukan","success":false}
```

```json
HTTP/1.1 401 Unauthorized
Content-Type: text/plain; charset=utf-8

Unauthorized
```

```json
HTTP/1.1 403 Forbidden
Content-Type: text/plain; charset=utf-8

Forbidden
```

### RESERVATIONS

Endpoint pengajuan, daftar, detail, pembatalan, dan persetujuan reservasi fasilitas. Tersedia format route bahasa Indonesia (`/reservasi/*`) maupun alias RESTful (`/reservations/*`).

- `POST /reservasi/create_reservasi/ruangan`: Pengajuan reservasi ruangan oleh pengguna.
- `POST /reservasi/create_reservasi/alat`: Pengajuan peminjaman alat oleh pengguna.
- `GET /reservasi` (alias `GET /reservations`): Riwayat reservasi milik pengguna login.
- `GET /reservasi/{id}` (alias `GET /reservations/{id}`): Detail satu reservasi.
- `PATCH /reservasi/{id}/cancel` (alias `PATCH /reservations/{id}`): Pembatalan mandiri oleh pengguna (minimal 2 jam sebelum jadwal).
- `GET /petugas/reservasi`: Antrean seluruh pengajuan reservasi untuk ditinjau petugas/admin.
- `PATCH /petugas/reservasi/{id}`: Persetujuan (*approve*) atau penolakan (*reject*) reservasi oleh petugas.
- `PATCH /petugas/reservasi/{id}/cancel`: Pembatalan reservasi oleh petugas disertai alasan.
- `GET /petugas/dashboard/count`: Hitungan antrean reservasi pending & laporan baru untuk dashboard petugas.

#### - POST /reservasi/create_reservasi/ruangan

Buat reservasi ruangan (+ alat tambahan opsional). Auth: login semua role (`middleware.Auth`, `user_reservasi` diambil dari session `session_id`). `Content-Type: application/x-www-form-urlencoded`. Status awal selalu `PENDING`.

```curl
curl -i -w "\n\n[INFO] Waktu Total Respons: %{time_total} detik\n" \
-X POST http://127.0.0.1:8080/reservasi/create_reservasi/ruangan \
-H "Content-Type: application/x-www-form-urlencoded" \
-H "Cookie: session_id=USER_SESSION_ID" \
-d "ruangan_reservasi=1&jumlah_peserta=30&waktu_peminjaman=2026-10-14+08%3A00%3A00&waktu_peminjaman_selesai=2026-10-14+09%3A00%3A00&alasan_peminjaman=Kuliah+pengganti"
```

Field form:

| Field | Wajib | Validasi |
|---|---|---|
| `ruangan_reservasi` | ya | integer >0, harus exist di `ruangan` |
| `jumlah_peserta` | ya (jika ada ruangan) | integer >0, ≤ kapasitas ruangan |
| `waktu_peminjaman` | ya | `YYYY-MM-DD HH:MM:SS`, menit `00`/`30`, detik `00`, jam 07:00-20:00 |
| `waktu_peminjaman_selesai` | ya | sama, harus setelah mulai |
| `alasan_peminjaman` | ya | 1-255 char |
| `alat_reservasi[]` | tidak | array id alat, integer >0, unik, stok cukup, status aktif |
| `jumlah_peminjaman[]` | tidak | jika ada, panjang harus sama dengan `alat_reservasi[]`, integer >0 (default 1) |

Aturan bisnis (`services`): slot kelipatan 30 menit, jam operasional `07:00-20:00`, pengajuan minimal H+2, ruangan harus berstatus aktif, tidak boleh double-booking diri sendiri, tidak boleh menabrak reservasi `APPROVED` / stok global.

Response sukses (`201`): `{"message":"Reservasi berhasil dibuat!","success":true,"id":<int64>}`.

#### - POST /reservasi/create_reservasi/alat

Buat peminjaman alat saja (tanpa ruangan). Auth & aturan waktu/alasan sama seperti di atas. Minimal satu alat harus dipilih.

```curl
curl -i -w "\n\n[INFO] Waktu Total Respons: %{time_total} detik\n" \
-X POST http://127.0.0.1:8080/reservasi/create_reservasi/alat \
-H "Content-Type: application/x-www-form-urlencoded" \
-H "Cookie: session_id=USER_SESSION_ID" \
-d "alat_reservasi[]=2&jumlah_peminjaman[]=1&waktu_peminjaman=2026-10-14+08%3A00%3A00&waktu_peminjaman_selesai=2026-10-14+09%3A00%3A00&alasan_peminjaman=Praktikum"
```

Response sukses (`201`): sama, `{"message":"Reservasi berhasil dibuat!","success":true,"id":<int64>}`.

Response gagal (berlaku untuk kedua endpoint create):

`400`: `Ruangan wajib diisi untuk endpoint ini` (ruangan) / `Minimal satu alat harus dipilih` (alat), `ID ruangan tidak valid`, `ID alat tidak valid`, `Jumlah peminjaman tidak valid`, `Jumlah data alat dan jumlah peminjaman tidak cocok`, `Jumlah peserta tidak valid`, `Format waktu peminjaman tidak valid! Gunakan YYYY-MM-DD HH:MM:SS`, `Format waktu selesai tidak valid! Gunakan YYYY-MM-DD HH:MM:SS`, `Reservasi harus memuat minimal satu ruangan atau alat`, `Alasan peminjaman wajib diisi`, `Alasan peminjaman maksimal 255 karakter`, `Waktu selesai harus setelah waktu mulai`, `Waktu reservasi harus menggunakan slot 30 menit`, `Reservasi hanya dapat dilakukan pada jam 07:00 - 20:00`, `Reservasi paling cepat diajukan untuk 2 hari ke depan`, `Jumlah peserta wajib diisi untuk reservasi ruangan`, `Jumlah peserta harus lebih dari nol`, `Jumlah peserta melebihi kapasitas ruangan (...)`, `Alat yang sama tidak boleh diminta dua kali`, `Jumlah alat ... harus lebih dari nol`, `Jumlah ... melebihi stok (...)`.

`404`: `Ruangan tidak ditemukan`, `Alat dengan id ... tidak ditemukan`.

`409`: `Ruangan sedang tidak dapat dipakai`, `Alat ... sedang tidak dapat dipakai`, `Kamu sudah punya reservasi di ruangan ini pada slot waktu tersebut`, `Kamu sudah punya reservasi untuk alat ini pada slot waktu tersebut`, `Ruangan sudah dipakai pada waktu tersebut`, `Stok ... tidak cukup pada slot waktu tersebut`.

`401 Unauthorized`, `500 Internal server error`.

#### - GET /reservasi (& /reservasi/ruangan, /reservasi/alat, alias /reservations)

Riwayat reservasi. Auth: login. `pengguna` hanya melihat milik sendiri; `petugas`/`admin` melihat semua. Alias `GET /reservations` identik dengan `GET /reservasi`.

```curl
curl -i -X GET "http://127.0.0.1:8080/reservasi?status=menunggu&limit=20&page=1" \
-H "Cookie: session_id=USER_SESSION_ID"
```

Query:

| Parameter | Keterangan |
|---|---|
| `status` | opsional: `menunggu`/`disetujui`/`ditolak`/`dibatalkan`/`selesai` (case-insensitive) → `400 Status reservasi tidak valid` |
| `limit` | opsional, default `20`, max 100 → `400 Limit harus angka positif` |
| `page` | opsional, default `1` → `400 Page harus angka positif` |

Response sukses: `200 {"data":[...],"limit":20,"page":1,"success":true}`. Response gagal: `401 Unauthorized`, `403 Forbidden`, `500 Gagal menyinkronkan status reservasi` / `Gagal mengambil daftar reservasi`.

#### - GET /reservasi/{id} (alias /reservations/{id})

Detail satu reservasi (+ riwayat status). Auth: login; `pengguna` hanya boleh milik sendiri (milik orang lain disamarkan jadi `404`).

```curl
curl -i -X GET http://127.0.0.1:8080/reservasi/1 \
-H "Cookie: session_id=USER_SESSION_ID"
```

Response sukses: `200 {"data":{...},"success":true}`. Response gagal: `400 ID reservasi tidak valid`, `404 Reservasi tidak ditemukan`, `500 Gagal mengambil reservasi`.

#### - PATCH /reservasi/{id}/cancel (alias PATCH /reservations/{id})

Pembatalan mandiri oleh pengguna pemilik reservasi. Auth: login. `Content-Type: application/json` dengan body `{"alasan_pembatalan":"..."}` (wajib). Hanya status `PENDING`/`APPROVED` yang bisa dibatalkan, paling lambat 2 jam sebelum mulai.

```curl
curl -i -X PATCH http://127.0.0.1:8080/reservasi/1/cancel \
-H "Content-Type: application/json" \
-H "Cookie: session_id=USER_SESSION_ID" \
-d '{"alasan_pembatalan":"Jadwal kuliah digeser"}'
```

Response sukses: `200 {"message":"Reservasi berhasil dibatalkan","success":true}`. Response gagal: `400 ID reservasi tidak valid` / `Body request tidak valid` / `Alasan pembatalan wajib diisi`, `404 Reservasi tidak ditemukan`, `409 Reservasi sudah tidak bisa dibatalkan` / `Pembatalan paling lambat 2 jam sebelum waktu mulai`.

#### - GET /petugas/reservasi

Antrean seluruh pengajuan untuk ditinjau. Auth: login + role `petugas`/`admin`.

```curl
curl -i -X GET "http://127.0.0.1:8080/petugas/reservasi?tipe=ruangan&status=menunggu&limit=20&page=1" \
-H "Cookie: session_id=PETUGAS_SESSION_ID"
```

Query: `tipe` (`ruangan`/`alat` → `400 Tipe harus ruangan atau alat`), `status`, `limit`, `page` (aturan sama seperti list pengguna). Response sukses: `200 {"data":[...],"success":true}` (tanpa `limit`/`page`).

#### - PATCH /petugas/reservasi/{id}

Setujui (`disetujui`) atau tolak (`ditolak`) reservasi. Auth: login + role **`petugas` saja (admin ditolak)**. Body JSON `{"status":"disetujui|ditolak","alasan_penolakan":"..."}` (alasan wajib saat menolak). Hanya reservasi `menunggu` yang bisa diproses; approve mengecek ketersediaan ruangan/stok slot.

```curl
curl -i -X PATCH http://127.0.0.1:8080/petugas/reservasi/1 \
-H "Content-Type: application/json" \
-H "Cookie: session_id=PETUGAS_SESSION_ID" \
-d '{"status":"disetujui"}'
```

Response sukses: `200 {"message":"Reservasi disetujui","success":true}` / `{"message":"Reservasi ditolak","success":true}`. Response gagal: `400 Status harus disetujui atau ditolak` / `Alasan penolakan wajib diisi`, `404 Reservasi tidak ditemukan`, `409 Hanya reservasi berstatus menunggu yang bisa disetujui/ditolak` + varian konflik slot (`Ruangan sudah dipakai pada slot tersebut, tidak bisa disetujui`, `Stok ... tidak cukup pada slot tersebut, tidak bisa disetujui`, `Ruangan/alat sudah tidak tersedia...`).

#### - PATCH /petugas/reservasi/{id}/cancel

Pembatalan oleh petugas (semua reservasi, tanpa cek kepemilikan). Auth: `petugas` saja. Body `{"alasan_pembatalan":"..."}` wajib; aturan status & batas 2 jam sama seperti pembatalan pengguna.

```curl
curl -i -X PATCH http://127.0.0.1:8080/petugas/reservasi/1/cancel \
-H "Content-Type: application/json" \
-H "Cookie: session_id=PETUGAS_SESSION_ID" \
-d '{"alasan_pembatalan":"Ruangan dipakai acara fakultas"}'
```

#### - GET /petugas/dashboard/count

Hitungan badge dashboard petugas. Auth: `petugas` saja. Tanpa parameter.

```curl
curl -i -X GET http://127.0.0.1:8080/petugas/dashboard/count \
-H "Cookie: session_id=PETUGAS_SESSION_ID"
```

Response sukses:

```json
HTTP/1.1 200 OK
Content-Type: application/json

{"data":{"laporan_baru":5,"reservasi_menunggu":8},"success":true}
```

Response gagal: `500 Gagal menyinkronkan status reservasi` / `Gagal menghitung reservasi` / `Gagal menghitung laporan`.

Response sukses: `200 {"message":"Reservasi berhasil dibatalkan","success":true}`. Response gagal: `400 ID reservasi tidak valid` / `Body request tidak valid` / `Alasan pembatalan wajib diisi`, `404 Reservasi tidak ditemukan`, `409 Reservasi sudah tidak bisa dibatalkan` / `Pembatalan paling lambat 2 jam sebelum waktu mulai`.

#### REPORTS

> Model `ReportDetail`: `id`, `waktu_dibuat`, `foto` (nullable), `user_report`, `alasan`, `kategori_laporan`, `status_laporan` (`baru|diproses|selesai|ditolak`), `catatan_resolusi` (nullable), `resolved_at` (nullable), `report_ruangan` (nullable), `report_alat` (nullable), `nama_ruangan` (nullable), `nama_alat` (nullable).

#### - POST /reports

Buat laporan kerusakan. Auth: login semua role (`middleware.Auth`). Foto **tidak lagi disimpan sebagai file di `uploads/`** — melainkan data-URL base64 (`data:image/jpeg;base64,...` / `data:image/png;base64,...`) yang disimpan langsung di kolom `report.foto` (`MEDIUMTEXT`).

`Content-Type` yang diterima (`controller/report/create.go` → `parseLaporanInput`):

1. `application/json` (disarankan, dipakai frontend): `{"alasan","kategori","ruangan_id","alat_id","foto"}` (body max 6MB).
2. `multipart/form-data` (backward-compatible): field teks `alasan`, `kategori`, `ruangan_id`, `alat_id`, `foto` (base64/data-URL), **atau** field file `foto` (`jpg`/`jpeg`/`png` ≤2MB, dikonversi ke base64 di server).
3. `application/x-www-form-urlencoded` (fallback).

```curl
curl -i -w "\n\n[INFO] Waktu Total Respons: %{time_total} detik\n" \
-X POST http://127.0.0.1:8080/reports \
-H "Content-Type: application/json" \
-H "Cookie: session_id=USER_SESSION_ID" \
-d '{"alasan":"AC tidak dingin","kategori":"AC/Pendingin","ruangan_id":1,"foto":"data:image/jpeg;base64,/9j/4AAQ..."}'
```

Atau untuk alat (tanpa foto):

```curl
curl -i -w "\n\n[INFO] Waktu Total Respons: %{time_total} detik\n" \
-X POST http://127.0.0.1:8080/reports \
-H "Content-Type: application/json" \
-H "Cookie: session_id=USER_SESSION_ID" \
-d '{"alasan":"Proyektor mati","kategori":"Elektronik","alat_id":2}'
```

Field:

| Field | Wajib | Validasi |
|---|---|---|
| `alasan` | ya | 1-255 char |
| `kategori` | ya | `Kebersihan` / `AC/Pendingin` / `Elektronik` / `Lainnya` |
| `ruangan_id` | salah satu | integer >0, harus exist; isi tepat satu dari `ruangan_id` / `alat_id` |
| `alat_id` | salah satu | integer >0, harus exist |
| `foto` | tidak | data-URL/base64 `jpeg`/`png`, binary hasil decode max 2MB (base64 max ~4MB char). Mime dikanonisasi dari byte aktual, bukan klaim header |

> Kompatibilitas baca: `GET` laporan mengembalikan `foto` sebagai data-URL apa adanya; path legacy `uploads/...` yang masih tersisa di DB lama dibaca dari disk lalu di-inline sebagai data-URL (best-effort, `repositories/report.go` → `resolveFotoValue`). File statis legacy tetap dilayani `GET /uploads/` (wajib login).

Status awal selalu `baru`.

Response sukses

```json
HTTP/1.1 201 Created
Content-Type: application/json

{"message":"Laporan berhasil dibuat","success":true}
```

Response gagal

```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"message":"Alasan wajib diisi","success":false}
```

```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"message":"Alasan maksimal 255 karakter","success":false}
```

```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"message":"ID ruangan tidak valid","success":false}
```

```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"message":"ID alat tidak valid","success":false}
```

```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"message":"Gagal membaca body JSON","success":false}
```

```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"message":"Gagal membaca form","success":false}
```

```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"message":"Kategori tidak valid","success":false}
```

```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"message":"Pilih salah satu: ruangan atau alat","success":false}
```

```json
HTTP/1.1 404 Not Found
Content-Type: application/json

{"message":"Ruangan tidak ditemukan","success":false}
```

```json
HTTP/1.1 404 Not Found
Content-Type: application/json

{"message":"Alat tidak ditemukan","success":false}
```

```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"message":"Ukuran foto maksimal 2MB","success":false}
```

```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"message":"Format foto harus jpg, jpeg, atau png","success":false}
```

```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"message":"Format foto harus base64 jpg, jpeg, atau png","success":false}
```

> `Format foto harus jpg, jpeg, atau png` untuk file multipart yang mime-nya terdeteksi bukan gambar; `... base64 ...` untuk string base64/data-URL yang tidak valid.

#### - GET /uploads/{path}

Melayani file statis legacy di folder `uploads/` (mis. bukti laporan lama sebelum migrasi base64). Auth: login (`middleware.Auth`, `<img>` same-origin otomatis mengirim cookie `session_id`). Bukan JSON: `401 Unauthorized` (plain-text) bila belum login, `404` bila file tidak ada.

```curl
curl -i -X GET http://127.0.0.1:8080/uploads/reports/aabcfe78-1205-487b-a52e-04e319c5f9d6.jpeg \
-H "Cookie: session_id=USER_SESSION_ID"
```

#### - GET /reports

List laporan milik user yang login. Auth: login.

```curl
curl -i -w "\n\n[INFO] Waktu Total Respons: %{time_total} detik\n" \
-X GET http://127.0.0.1:8080/reports \
-H "Cookie: session_id=USER_SESSION_ID"
```

Response sukses

```json
HTTP/1.1 200 OK
Content-Type: application/json

{"data":[{"alasan":"AC tidak dingin","id":1,"kategori_laporan":"AC/Pendingin","status_laporan":"baru","user_report":16}],"success":true}
```

Response gagal

```json
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{"message":"Unauthorized","success":false}
```

#### - GET /reports/{id}

Detail satu laporan milik user yang login (difilter `id` + `user_report`). Auth: login.

```curl
curl -i -w "\n\n[INFO] Waktu Total Respons: %{time_total} detik\n" \
-X GET http://127.0.0.1:8080/reports/1 \
-H "Cookie: session_id=USER_SESSION_ID"
```

Response sukses

```json
HTTP/1.1 200 OK
Content-Type: application/json

{"data":{"alasan":"AC tidak dingin","id":1,"kategori_laporan":"AC/Pendingin","status_laporan":"baru","user_report":16},"success":true}
```

Response gagal

```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"message":"ID laporan tidak valid","success":false}
```

```json
HTTP/1.1 404 Not Found
Content-Type: application/json

{"message":"Laporan tidak ditemukan","success":false}
```

#### - GET /petugas/reports

> Di-rename dari `GET /officer/reports` di `routes/router.go` (handler pindah `controller/report` -> `controller/petugas`, tanpa perubahan logic). Path lama `/officer/reports` sekarang `404`.

List semua laporan. Auth: login + role `petugas (2)` / `admin (1)`.

```curl
curl -i -w "\n\n[INFO] Waktu Total Respons: %{time_total} detik\n" \
-X GET http://127.0.0.1:8080/petugas/reports \
-H "Cookie: session_id=PETUGAS_SESSION_ID"
```

Response sukses

```json
HTTP/1.1 200 OK
Content-Type: application/json

{"data":[{"alasan":"AC tidak dingin","id":1,"kategori_laporan":"AC/Pendingin","status_laporan":"baru","user_report":16}],"success":true}
```

Response gagal: `401 Unauthorized` (belum login), `403 Forbidden` (role pengguna).

#### - GET /petugas/reports/{id}

> Di-rename dari `GET /officer/reports/{id}`. Path lama sekarang `404`.

Detail satu laporan untuk petugas (tanpa filter user). Auth: `petugas` / `admin`.

```curl
curl -i -w "\n\n[INFO] Waktu Total Respons: %{time_total} detik\n" \
-X GET http://127.0.0.1:8080/petugas/reports/1 \
-H "Cookie: session_id=PETUGAS_SESSION_ID"
```

Response sukses

```json
HTTP/1.1 200 OK
Content-Type: application/json

{"data":{"alasan":"AC tidak dingin","id":1,"kategori_laporan":"AC/Pendingin","status_laporan":"baru","user_report":16},"success":true}
```

Response gagal

```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"message":"ID laporan tidak valid","success":false}
```

```json
HTTP/1.1 404 Not Found
Content-Type: application/json

{"message":"Laporan tidak ditemukan","success":false}
```

#### - PATCH /petugas/reports/{id}

> Di-rename dari `PATCH /reports/{id}`. Path lama sekarang `404`.

Update status laporan oleh petugas. Auth: login + role `petugas` / `admin`. `Content-Type: application/json`.

Transisi yang diizinkan: `baru -> diproses|selesai|ditolak`, `diproses -> selesai|ditolak`. `selesai`/`ditolak` sudah tutup (409). Menutup (`selesai`/`ditolak`) wajib `catatan_resolusi`.

```curl
curl -i -w "\n\n[INFO] Waktu Total Respons: %{time_total} detik\n" \
-X PATCH http://127.0.0.1:8080/petugas/reports/1 \
-H "Content-Type: application/json" \
-H "Cookie: session_id=PETUGAS_SESSION_ID" \
-d '{"status":"diproses","catatan_resolusi":""}'
```

Contoh menutup laporan:

```curl
curl -i -w "\n\n[INFO] Waktu Total Respons: %{time_total} detik\n" \
-X PATCH http://127.0.0.1:8080/petugas/reports/1 \
-H "Content-Type: application/json" \
-H "Cookie: session_id=PETUGAS_SESSION_ID" \
-d '{"status":"selesai","catatan_resolusi":"AC sudah diperbaiki"}'
```

Response sukses

```json
HTTP/1.1 200 OK
Content-Type: application/json

{"message":"Status laporan berhasil diperbarui","success":true}
```

Response gagal

```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"message":"Status tidak valid","success":false}
```

```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"message":"Transisi status dari baru ke diproses tidak diizinkan","success":false}
```

```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"message":"Catatan resolusi wajib diisi saat laporan ditutup","success":false}
```

```json
HTTP/1.1 404 Not Found
Content-Type: application/json

{"message":"Laporan tidak ditemukan","success":false}
```

```json
HTTP/1.1 409 Conflict
Content-Type: application/json

{"message":"Laporan sudah ditutup dan tidak bisa diubah lagi","success":false}
```

### DASHBOARD & EKSPOR LAPORAN

#### - GET /dashboard/overview

Mengambil ringkasan statistik dan metrik komprehensif sistem (fasilitas, reservasi, laporan pengaduan, pengguna, okupansi). Auth: login (`middleware.Auth`).

```curl
curl -i -X GET http://127.0.0.1:8080/dashboard/overview \
-b "session_id=ADMIN_SESSION_ID"
```

Response sukses:

```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "data": {
    "fasilitas": {
      "total": 24,
      "ruangan": 15,
      "alat": 9,
      "aktif": 20,
      "dalam_perbaikan": 3,
      "nonaktif": 1
    },
    "reservasi": {
      "total": 120,
      "menunggu": 8,
      "disetujui": 95,
      "ditolak": 10,
      "dibatalkan": 7,
      "selesai": 0
    },
    "laporan": {
      "total": 35,
      "baru": 5,
      "diproses": 12,
      "selesai": 15,
      "ditolak": 3
    },
    "pengguna": {
      "total": 340,
      "terverifikasi": 320,
      "menunggu_verifikasi": 20,
      "mahasiswa": 280,
      "dosen": 35,
      "staff": 15,
      "petugas": 8,
      "admin": 2
    },
    "okupansi": {
      "total_jam_pemakaian": 248.5,
      "total_disetujui": 95
    }
  },
  "success": true
}
```

Response gagal: `401 Unauthorized`.

#### - GET /reservasi/export

Mengekspor rekap pengajuan reservasi ke PDF/Excel/CSV. Auth: **admin** (`middleware.AdminAuth`).

Query:

| Parameter | Default | Keterangan |
|---|---|---|
| `format` | `pdf` | `pdf`, `excel`/`xls`/`xlsx`, atau `csv` |
| `status` | semua | filter status pengajuan |
| `tipe` | semua | `ruangan` / `alat` (selain itu → `400 Tipe fasilitas harus ruangan atau alat`) |
| `dari` | - | filter tanggal pengajuan awal |
| `sampai` | - | filter tanggal pengajuan akhir |
| `fasilitas` | - | filter id fasilitas |
| `q` | - | kata kunci pencarian |

```curl
curl -i -X GET "http://127.0.0.1:8080/reservasi/export?format=excel&tipe=ruangan" \
-b "session_id=ADMIN_SESSION_ID" \
-o rekap-reservasi.xls
```

Response sukses (`200`, file unduhan): `application/pdf` (`rekap-reservasi.pdf`) / `application/vnd.ms-excel` (`rekap-reservasi.xls`) / `text/csv` (`rekap-reservasi.csv`). Response gagal: `500 Gagal mengambil data reservasi untuk ekspor`.

#### - GET /users/export

Mengekspor rekap akun pengguna ke PDF/Excel/CSV. Auth: **admin** (`middleware.AdminAuth`).

Query:

| Parameter | Default | Keterangan |
|---|---|---|
| `format` | `pdf` | `pdf`, `excel`/`xls`/`xlsx`, atau `csv` |
| `role` | semua | filter peran |
| `q` | - | kata kunci pencarian |

```curl
curl -i -X GET "http://127.0.0.1:8080/users/export?format=csv" \
-b "session_id=ADMIN_SESSION_ID" \
-o rekap-akun.csv
```

Response sukses (`200`, file unduhan): `application/pdf` (`rekap-akun.pdf`) / `application/vnd.ms-excel` (`rekap-akun.xls`) / `text/csv` (`rekap-akun.csv`). Response gagal: `500 Gagal mengambil data akun untuk ekspor`.

#### - GET /dashboard/occupancy/export

Mengekspor rekap okupansi dan utilisasi fasilitas beserta jumlah pengaduan kerusakan ke file dokumen resmi (asli **PDF binary**, **Excel**, atau **CSV**). **Tanpa auth (publik)**. Menghasilkan file unduhan langsung (`Content-Disposition: attachment`), bukan mencetak tampilan halaman browser (`window.print()`).

Query parameters:

| Parameter | Tipe | Default | Keterangan |
|---|---|---|---|
| `format` | string | `pdf` | Format ekspor: `pdf`, `excel` / `xls`, atau `csv` |
| `mode` | string | `semua` | Mode filter: `semua`, `gedung`, atau `fasilitas` |
| `gedung` | string | - | Nama gedung / lokasi fasilitas jika `mode=gedung` |
| `fasilitas_id` | string | - | ID fasilitas spesifik (misal `ruangan-1` atau `1`) jika `mode=fasilitas` |

```curl
# Ekspor PDF Resmi
curl -i -X GET "http://127.0.0.1:8080/dashboard/occupancy/export?format=pdf&mode=semua" \
-b "session_id=ADMIN_SESSION_ID" \
-o rekap-okupansi.pdf

# Ekspor Excel
curl -i -X GET "http://127.0.0.1:8080/dashboard/occupancy/export?format=excel&mode=semua" \
-b "session_id=ADMIN_SESSION_ID" \
-o rekap-okupansi.xls

# Ekspor CSV
curl -i -X GET "http://127.0.0.1:8080/dashboard/occupancy/export?format=csv&mode=semua" \
-b "session_id=ADMIN_SESSION_ID" \
-o rekap-okupansi.csv
```

Response sukses (PDF):

```http
HTTP/1.1 200 OK
Content-Type: application/pdf
Content-Disposition: attachment; filename="rekap-okupansi.pdf"

[PDF Binary Data]
```

#### - GET /reports/export (& /petugas/reports/export)

Mengekspor daftar laporan kerusakan fasilitas ke file PDF dokumen resmi, Excel, atau CSV. `GET /reports/export` **tanpa auth (publik)**; alias `GET /petugas/reports/export` wajib login role `petugas`/`admin`. Handler dan query sama.

Query parameters:

| Parameter | Tipe | Default | Keterangan |
|---|---|---|---|
| `format` | string | `pdf` | Format: `pdf`, `excel` / `xls`, atau `csv` |
| `status` | string | `semua` | Filter status: `baru`, `diproses`, `selesai`, `ditolak` |
| `kategori` | string | `semua` | Filter kategori |
| `q` | string | - | Kata kunci pencarian nama fasilitas / pelapor / keluhan |

```curl
curl -i -X GET "http://127.0.0.1:8080/reports/export?format=pdf" \
-b "session_id=PETUGAS_SESSION_ID" \
-o laporan-kerusakan.pdf
```

Response sukses:

```http
HTTP/1.1 200 OK
Content-Type: application/pdf
Content-Disposition: attachment; filename="rekap-laporan.pdf"

[PDF Binary Data]
```

