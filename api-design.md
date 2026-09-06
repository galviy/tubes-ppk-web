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
-X POST http://127.0.0.1:1337/auth/register \
-H "Content-Type: application/json" \
-d '{"username": "galvintest", "password": "galvin123", "email": "galvindoserr@gmail.com", "no_tlp": "0848992297874"}'
```

```json
HTTP/1.1 200 OK
Content-Type: application/json;charset=utf-8
Date: Sun, 28 Jun 2026 08:39:23 GMT
Content-Length: 93

{"success":true,"message":"Successfully created galvintest please relogin to get session_id"}

[INFO] Waktu Total Respons: 0.099673 detik
```

#### - POST   /auth/login

```curl
curl -i -w "\n\n[INFO] Waktu Total Respons: %{time_total} detik\n" \
-X POST http://127.0.0.1:1337/auth/login \
-H "Content-Type: application/json" \
-d '{"username": "galvintest", "password": "galvin123"}'
```

Response dari Server

```json
HTTP/1.1 200 OK
set-cookie: session=2aA9dEHvjblIeSZhKbTTnOwbuufZIgeqy6TQGj2LDc1w6pStytZRbd7A1kG5dORH_auBr5BJCKImhlTEAzmnu7hJeOJ2oBIN_kjOVAc5Ju_NAWUor-B97tEzaEtbQlQJiFIP5eJ8tZzZG4C85uPSGRXDooHOlHnJLCFs68qzDcg4ilZVk1Rd3tYdrb4gQhBeUUWmBvoPNmm7Nn_Gqgjir_wWSQdUcP3upgs; HttpOnly; Path=/; Max-Age=86400
Content-Type: application/json;charset=utf-8
Date: Sun, 28 Jun 2026 08:40:53 GMT
Content-Length: 16

{"success":true,"csrf_token":"AAABn3PEyJWpntozVFUxIcOmCNxn3ukeAAAAAAUmXAC7OKZTptt1zWlOQtPB6uab7wDqAXbD2ye_Rw3pVdqIfA"}

[INFO] Waktu Total Respons: 0.094432 detik
```

#### - POST   /auth/logout

### USERS
GET    /users
GET    /users/:id
PATCH  /users/:id
PATCH  /users/:id/status


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
