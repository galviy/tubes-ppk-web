package routes

import (
	"backend-ppk/controller/admin"
	createuser "backend-ppk/controller/admin/create_user"
	fasilitas "backend-ppk/controller/admin/fasilitas"
	"backend-ppk/controller/admin/verifikasi"
	akademik "backend-ppk/controller/akademik"
	"backend-ppk/controller/auth"
	publik_fasilitas "backend-ppk/controller/fasilitas"
	petugas_fasilitas "backend-ppk/controller/petugas/fasilitas"
	petugas_report "backend-ppk/controller/petugas/report"
	"backend-ppk/controller/report"
	"backend-ppk/controller/reservasi"
	"backend-ppk/controller/user"
	"backend-ppk/middleware"
	"net/http"
)

func SetupRoutes() *http.ServeMux {
	mux := http.NewServeMux()

	mux.HandleFunc("/auth/login", auth.Login)
	mux.HandleFunc("/auth/create_account/dosen", auth.Create_Account_Dosen)
	mux.HandleFunc("/auth/create_account/mhs", auth.Create_Account_MHS)
	mux.HandleFunc("/auth/create_account/staff", auth.Create_account_Staff)

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
		"GET /admin/show_staff_pending",
		middleware.AdminAuth(http.HandlerFunc(admin.Show_staff_pending)),
	)

	mux.Handle(
		"GET /admin/show_staff",
		middleware.AdminAuth(http.HandlerFunc(admin.Show_staff)),
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
		"POST /admin/verifikasi_staff",
		middleware.AdminAuth(http.HandlerFunc(verifikasi.Verifikasi_Staff)),
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

	mux.Handle(
		"POST /admin/create_user/petugas",
		middleware.AdminAuth(http.HandlerFunc(createuser.Create_Petugas)),
	)
	mux.Handle(
		"POST /admin/create_user/admin",
		middleware.AdminAuth(http.HandlerFunc(createuser.Create_Admin)),
	)
	mux.Handle(
		"POST /admin/create_fasilitas/kategori",
		middleware.AdminAuth(http.HandlerFunc(fasilitas.Create_Kategori)),
	)
	mux.Handle(
		"POST /admin/create_fasilitas/ruangan",
		middleware.AdminAuth(http.HandlerFunc(fasilitas.Create_ruangan)),
	)
	mux.Handle(
		"POST /admin/create_fasilitas/alat",
		middleware.AdminAuth(http.HandlerFunc(fasilitas.Create_Alat)),
	)
	mux.HandleFunc("GET /fakultas", akademik.ListFakultas)
	mux.HandleFunc("GET /prodi", akademik.ListProdi)

	mux.HandleFunc("GET /fasilitas", publik_fasilitas.ListFasilitas)
	mux.HandleFunc("GET /fasilitas/ruangan", publik_fasilitas.ListRuangan)
	mux.HandleFunc("GET /fasilitas/alat", publik_fasilitas.ListAlat)

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
		"POST /reservasi/create_reservasi",
		middleware.Auth(http.HandlerFunc(reservasi.Create_reservasi)),
	)
	mux.Handle(
		"GET /petugas/reports",
		middleware.Auth(middleware.RequireRole(
			http.HandlerFunc(petugas_report.ListAllLaporan),
			middleware.RolePetugas, middleware.RoleAdmin,
		)),
	)
	mux.Handle(
		"GET /petugas/reports/{id}",
		middleware.Auth(middleware.RequireRole(
			http.HandlerFunc(petugas_report.DetailLaporanOfficer),
			middleware.RolePetugas, middleware.RoleAdmin,
		)),
	)
	mux.Handle(
		"PATCH /petugas/reports/{id}",
		middleware.Auth(middleware.RequireRole(
			http.HandlerFunc(petugas_report.UpdateLaporan),
			middleware.RolePetugas, middleware.RoleAdmin,
		)),
	)
	mux.Handle(
		"PATCH /petugas/facilities/{id}/status",
		middleware.Auth(middleware.RequireRole(
			http.HandlerFunc(petugas_fasilitas.UpdateStatus),
			middleware.RolePetugas, middleware.RoleAdmin,
		)),
	)
	return mux
}
