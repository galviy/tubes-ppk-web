package routes

import (
	"backend-ppk/controller/admin"
	createfasilitas "backend-ppk/controller/admin/create_fasilitas"
	createuser "backend-ppk/controller/admin/create_user"
	"backend-ppk/controller/admin/verifikasi"
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
		"GET /admin/show_user",
		middleware.AdminAuth(http.HandlerFunc(admin.Show_user)),
	)
	mux.Handle(
		"GET /admin/show_mhs_pending",
		middleware.AdminAuth(http.HandlerFunc(admin.Show_mhs_pending)),
	)

	mux.Handle(
		"GET /admin/show_mhs",
		middleware.AdminAuth(http.HandlerFunc(admin.Show_mhs)),
	)
	mux.Handle(
		"GET /admin/show_dosen_pending",
		middleware.AdminAuth(http.HandlerFunc(admin.Show_dosen_pending)),
	)

	mux.Handle(
		"GET /admin/show_dosen",
		middleware.AdminAuth(http.HandlerFunc(admin.Show_dosen)),
	)

	mux.Handle(
		"POST /admin/verifikasi_mhs",
		middleware.AdminAuth(http.HandlerFunc(verifikasi.Verifikasi_MHS)),
	)
	mux.Handle(
		"POST /admin/verifikasi_dosen",
		middleware.AdminAuth(http.HandlerFunc(verifikasi.Verifikasi_dosen)),
	)

	mux.Handle(
		"POST /admin/create_user/mhs",
		middleware.AdminAuth(http.HandlerFunc(createuser.Create_MHS)),
	)

	mux.Handle(
		"POST /admin/create_user/dosen",
		middleware.AdminAuth(http.HandlerFunc(createuser.Create_Dosen)),
	)

	mux.Handle(
		"POST /admin/create_user/staff",
		middleware.AdminAuth(http.HandlerFunc(createuser.Create_staff)),
	)
	///admin/create_fasilitas/fasilitas
	mux.Handle(
		"POST /admin/create_fasilitas/kategori",
		middleware.AdminAuth(http.HandlerFunc(createfasilitas.Create_Kategori)),
	)
	mux.Handle(
		"POST /admin/create_fasilitas/ruangan",
		middleware.AdminAuth(http.HandlerFunc(createfasilitas.Create_ruangan)),
	)
	mux.Handle(
		"POST /admin/create_fasilitas/alat",
		middleware.AdminAuth(http.HandlerFunc(createfasilitas.Create_Alat)),
	)
	mux.Handle(
		"GET /user/me",
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
