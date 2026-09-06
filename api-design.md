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
POST   /auth/register
POST   /auth/login
POST   /auth/logout

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
