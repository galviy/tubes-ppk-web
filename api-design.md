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

### AUTHENTICATION

#### - POST   /auth/register

```curl
curl -i -w "\n\n[INFO] Waktu Total Respons: %{time_total} detik\n" \
-X POST http://127.0.0.1:8080/auth/create_account \
-H "Content-Type: application/x-www-form-urlencoded" \
-d "username=bjorka&password=Test@123&email=bjorka@gmail.com"
```

Response sukses

```json
HTTP/1.1 200 OK
Content-Type: application/json
Date: Sun, 13 Sep 2026 22:59:14 GMT
Content-Length: 83

{"message":"Successfully created account with username (bjorkaa)!","success":true}


[INFO] Waktu Total Respons: 0.054513 detik
```

Response gagal

```json
HTTP/1.1 401 Unauthorized
Content-Type: application/json
Date: Sun, 13 Sep 2026 22:59:06 GMT
Content-Length: 74

{"message":"Username atau email sudah exist sebelumnya!","success":false}


[INFO] Waktu Total Respons: 0.001167 detik
```

#### - POST   /auth/login

```curl
curl -i -w "\n\n[INFO] Waktu Total Respons: %{time_total} detik\n" \
-X POST http://127.0.0.1:8080/auth/login \
-H "Content-Type: application/x-www-form-urlencoded" \
-d "email=bjorka@gmail.com&password=Test@123"
```

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


#### - POST   /auth/logout

### USER

GET /user

```curl
curl -i -w "\n\n[INFO] Waktu Total Respons: %{time_total} detik\n" \
-X GET http://127.0.0.1:8080/user/me \
-H "Content-Type: application/x-www-form-urlencoded" \
-b "session_id=5d6f1c09-78a8-42f8-80f8-c6e47bb462ae"
```

Response berhasil 
```json
HTTP/1.1 200 OK
Content-Type: application/json
Date: Sun, 13 Sep 2026 23:03:04 GMT
Content-Length: 44

{"email":"bjorka@gmail.com","success":true}


[INFO] Waktu Total Respons: 0.000387 detik
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

GET    /users/:id
PATCH  /users/:id
PATCH  /users/:id/status


### Admin


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

Response gagal

```json
HTTP/1.1 401 Unauthorized
Content-Type: application/json
Date: Wed, 16 Sep 2026 04:24:07 GMT
Content-Length: 76

{"message":"you are not authorized to access this content","success":false}
```

### FACILITIES
GET    /facilities
GET    /facilities/:id
GET    /facilities/:id/availability
POST   /facilities
PATCH  /facilities/:id
PATCH  /facilities/:id/status

### RESERVATIONS
GET    /reservations
GET    /reservations/:id
POST   /reservations
PATCH  /reservations/:id

#### REPORTS
GET    /reports
GET    /reports/:id
POST   /reports
PATCH  /reports/:id

### DASHBOARD
GET    /dashboard/overview
GET    /dashboard/occupancy/export
