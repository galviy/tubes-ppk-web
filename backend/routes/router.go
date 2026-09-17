package routes

import (
	"backend-ppk/controller/auth"
	"backend-ppk/controller/facility"
	"backend-ppk/controller/report"
	"backend-ppk/controller/user"
	"backend-ppk/middleware"
	"net/http"
)

func SetupRoutes() *http.ServeMux {
	mux := http.NewServeMux()

	mux.HandleFunc("/auth/login", auth.Login)
	mux.HandleFunc("/auth/create_account/dosen", auth.Create_Account_Dosen)
	mux.HandleFunc("/auth/create_account/mhs", auth.Create_Account_MHS)

	mux.Handle(
		"/user/me",
		middleware.Auth(http.HandlerFunc(user.Me)),
	)

	mux.Handle(
		"POST /reports",
		middleware.Auth(http.HandlerFunc(report.CreateLaporan)),
	)
	mux.Handle(
		"GET /reports",
		middleware.Auth(http.HandlerFunc(report.ListLaporan)),
	)
	mux.Handle(
		"GET /reports/{id}",
		middleware.Auth(http.HandlerFunc(report.DetailLaporan)),
	)
	mux.Handle(
		"GET /officer/reports",
		middleware.Auth(middleware.RequireRole(
			http.HandlerFunc(report.ListAllLaporan),
			middleware.RolePetugas, middleware.RoleAdmin,
		)),
	)
	mux.Handle(
		"GET /officer/reports/{id}",
		middleware.Auth(middleware.RequireRole(
			http.HandlerFunc(report.DetailLaporanOfficer),
			middleware.RolePetugas, middleware.RoleAdmin,
		)),
	)
	mux.Handle(
		"PATCH /reports/{id}",
		middleware.Auth(middleware.RequireRole(
			http.HandlerFunc(report.UpdateLaporan),
			middleware.RolePetugas, middleware.RoleAdmin,
		)),
	)
	mux.Handle(
		"PATCH /facilities/{id}/status",
		middleware.Auth(middleware.RequireRole(
			http.HandlerFunc(facility.UpdateStatus),
			middleware.RolePetugas, middleware.RoleAdmin,
		)),
	)
	return mux
}
