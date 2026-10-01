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

#### - POST /admin/create_user/mhs

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

### FACILITIES

Endpoint katalog, detail, dan status fasilitas. Tersedia format route bahasa Indonesia (`/fasilitas/*`) maupun alias RESTful (`/facilities/*`).

- `GET /fasilitas` (alias `GET /facilities`): List seluruh fasilitas dengan filter query (`q`, `lokasi`, `kapasitas_min`, `tipe=ruangan|alat`, `page`, `limit`).
- `GET /fasilitas/{id}` (alias `GET /facilities/{id}`): Detail satu fasilitas (ruangan atau alat) berdasarkan ID (misal `1`, `ruangan-1`, atau `alat-2`).
- `GET /fasilitas/ketersediaan` (alias `GET /facilities/{id}/availability` dan `GET /jadwal`): Ketersediaan slot waktu jadwal peminjaman.
- `POST /admin/create_fasilitas/ruangan` & `POST /admin/create_fasilitas/alat`: Pembuatan fasilitas oleh admin.
- `POST /admin/update_fasilitas/ruangan` & `POST /admin/update_fasilitas/alat`: Pembaruan spesifikasi fasilitas oleh admin.
- `POST /admin/delete_fasilitas/ruangan` & `POST /admin/delete_fasilitas/alat`: Penghapusan fasilitas oleh admin.
- `PATCH /petugas/facilities/{id}/status`: Pembaruan status operasional fasilitas (aktif, nonaktif, dalam_perbaikan).

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

#### - POST /reservasi/create_reservasi

Buat reservasi ruangan. Auth: login semua role (`middleware.Auth`, `user_reservasi` diambil dari session `session_id`). `Content-Type: application/x-www-form-urlencoded`. Status awal selalu `PENDING`. Cek bentrok hanya terhadap reservasi berstatus `APPROVED` (`repositories.IsReservasiBentrok`).

```curl
curl -i -w "\n\n[INFO] Waktu Total Respons: %{time_total} detik\n" \
-X POST http://127.0.0.1:8080/reservasi/create_reservasi \
-H "Content-Type: application/x-www-form-urlencoded" \
-H "Cookie: session_id=USER_SESSION_ID" \
-d "ruangan_reservasi=1&waktu_peminjaman=2026-09-23+08%3A00%3A00&waktu_peminjaman_selesai=2026-09-23+09%3A00%3A00"
```

Field form:

| Field | Wajib | Validasi |
|---|---|---|
| `ruangan_reservasi` | ya | integer, harus exist di `ruangan` (`CheckRuanganById`) |
| `waktu_peminjaman` | ya | format `YYYY-MM-DD HH:MM:SS`, menit `00`/`30`, detik `00`, jam 07:00-20:00 |
| `waktu_peminjaman_selesai` | ya | format `YYYY-MM-DD HH:MM:SS`, menit `00`/`30`, detik `00`, jam 07:00-20:00, harus setelah `waktu_peminjaman` |

Jam operasional: `07:00 - 20:00` (`operasionalMulai = 7*60`, `operasionalSelesai = 20*60`). Slot valid hanya kelipatan 30 menit.

Response sukses

```json
HTTP/1.1 201 Created
Content-Type: application/json

{"message":"Reservasi berhasil dibuat!","success":true}
```

Response gagal

```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"message":"Missing field!","success":false}
```

```json
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{"message":"ID Ruangan tidak Valid!!","success":false}
```

```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"message":"Format waktu peminjaman tidak valid! Gunakan YYYY-MM-DD HH:MM:SS","success":false}
```

```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"message":"Format waktu selesai tidak valid! Gunakan YYYY-MM-DD HH:MM:SS","success":false}
```

```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"message":"Reservasi hanya dapat dilakukan pada jam 07:00 - 20:00!","success":false}
```

```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"message":"Waktu reservasi harus menggunakan slot 30 menit!","success":false}
```

```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"message":"Waktu selesai harus setelah waktu mulai!","success":false}
```

```json
HTTP/1.1 404 Not Found
Content-Type: application/json

{"message":"Ruangan tidak ditemukan!","success":false}
```

```json
HTTP/1.1 404 Not Found
Content-Type: application/json

{"message":"User tidak ditemukan!","success":false}
```

```json
HTTP/1.1 409 Conflict
Content-Type: application/json

{"message":"Ruangan sudah digunakan pada waktu tersebut!","success":false}
```

```json
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{"message":"Unauthorized","success":false}
```

```json
HTTP/1.1 500 Internal Server Error
Content-Type: application/json

{"message":"Internal server error","success":false}
```

#### REPORTS

> Model `ReportDetail`: `id`, `waktu_dibuat`, `foto` (nullable), `user_report`, `alasan`, `kategori_laporan`, `status_laporan` (`baru|diproses|selesai|ditolak`), `catatan_resolusi` (nullable), `resolved_at` (nullable), `report_ruangan` (nullable), `report_alat` (nullable), `nama_ruangan` (nullable), `nama_alat` (nullable).

#### - POST /reports

Buat laporan kerusakan. Auth: login semua role (`middleware.Auth`). `Content-Type: multipart/form-data` (max total 5MB). Foto disimpan di `uploads/reports/`.

```curl
curl -i -w "\n\n[INFO] Waktu Total Respons: %{time_total} detik\n" \
-X POST http://127.0.0.1:8080/reports \
-H "Cookie: session_id=USER_SESSION_ID" \
-F "alasan=AC tidak dingin" \
-F "kategori=AC/Pendingin" \
-F "ruangan_id=1" \
-F "foto=@/tmp/foto.jpg;type=image/jpeg"
```

Atau untuk alat:

```curl
curl -i -w "\n\n[INFO] Waktu Total Respons: %{time_total} detik\n" \
-X POST http://127.0.0.1:8080/reports \
-H "Cookie: session_id=USER_SESSION_ID" \
-F "alasan=Proyektor mati" \
-F "kategori=Elektronik" \
-F "alat_id=2"
```

Field:

| Field | Wajib | Validasi |
|---|---|---|
| `alasan` | ya | 1-255 char |
| `kategori` | ya | `Kebersihan` / `AC/Pendingin` / `Elektronik` / `Lainnya` |
| `ruangan_id` | salah satu | integer >0, harus exist; isi tepat satu dari `ruangan_id` / `alat_id` |
| `alat_id` | salah satu | integer >0, harus exist |
| `foto` | tidak | `jpg`/`jpeg`/`png`, max 2MB |

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

#### - GET /dashboard/occupancy/export

Mengekspor rekap okupansi dan utilisasi fasilitas beserta jumlah pengaduan kerusakan ke file dokumen resmi (asli **PDF binary**, **Excel**, atau **CSV**). Menghasilkan file unduhan langsung (`Content-Disposition: attachment`), bukan mencetak tampilan halaman browser (`window.print()`).

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

#### - GET /reports/export

Mengekspor daftar laporan kerusakan fasilitas ke file PDF dokumen resmi atau CSV. Auth: login (`middleware.Auth`), juga tersedia di `/petugas/reports/export`.

Query parameters:

| Parameter | Tipe | Default | Keterangan |
|---|---|---|---|
| `format` | string | `pdf` | Format: `pdf` atau `csv` |
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

