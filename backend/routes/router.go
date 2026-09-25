package routes

import (
	"backend-ppk/controller/admin"
	createuser "backend-ppk/controller/admin/create_user"
	fasilitas "backend-ppk/controller/admin/fasilitas"
	"backend-ppk/controller/admin/verifikasi"
	akademik "backend-ppk/controller/akademik"
	"backend-ppk/controller/auth"
	tolak "backend-ppk/controller/admin/tolak"
	publik_fasilitas "backend-ppk/controller/fasilitas"
	petugas_fasilitas "backend-ppk/controller/petugas/fasilitas"
	petugas_report "backend-ppk/controller/petugas/report"
	petugas_reservasi "backend-ppk/controller/petugas/reservasi"
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
	mux.Handle(
		"POST /admin/tolak_mhs",
		middleware.AdminAuth(http.HandlerFunc(tolak.Tolak_MHS)),
	)
	mux.Handle(
		"POST /admin/tolak_dosen",
		middleware.AdminAuth(http.HandlerFunc(tolak.Tolak_Dosen)),
	)
	mux.Handle(
		"POST /admin/tolak_staff",
		middleware.AdminAuth(http.HandlerFunc(tolak.Tolak_Staff)),
	)
	mux.Handle(
		"POST /admin/users/status",
		middleware.AdminAuth(http.HandlerFunc(admin.Users_Status)),
	)
	mux.Handle(
		"POST /admin/update_fasilitas/ruangan",
		middleware.AdminAuth(http.HandlerFunc(fasilitas.Update_ruangan)),
	)
	mux.Handle(
		"POST /admin/update_fasilitas/alat",
		middleware.AdminAuth(http.HandlerFunc(fasilitas.Update_alat)),
	)
	mux.Handle(
		"POST /admin/delete_fasilitas/ruangan",
		middleware.AdminAuth(http.HandlerFunc(fasilitas.Delete_ruangan)),
	)
	mux.Handle(
		"POST /admin/delete_fasilitas/alat",
		middleware.AdminAuth(http.HandlerFunc(fasilitas.Delete_alat)),
	)
	mux.HandleFunc("GET /fakultas", akademik.ListFakultas)
	mux.HandleFunc("GET /prodi", akademik.ListProdi)

	mux.HandleFunc("GET /fasilitas", publik_fasilitas.ListFasilitas)
	mux.HandleFunc("GET /fasilitas/ruangan", publik_fasilitas.ListRuangan)
	mux.HandleFunc("GET /fasilitas/alat", publik_fasilitas.ListAlat)
	mux.HandleFunc("GET /fasilitas/ketersediaan", publik_fasilitas.Ketersediaan)

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
		"POST /reservasi/create_reservasi/ruangan",
		middleware.Auth(http.HandlerFunc(reservasi.Create_reservasi)),
	)
	mux.Handle(
		"POST /reservasi/create_reservasi/alat",
		middleware.Auth(http.HandlerFunc(reservasi.Create_reservasi_alat)),
	)
	mux.Handle(
		"GET /reservasi",
		middleware.Auth(http.HandlerFunc(reservasi.ListReservasi)),
	)
	mux.Handle(
		"GET /reservasi/ruangan",
		middleware.Auth(http.HandlerFunc(reservasi.ListRuangan)),
	)
	mux.Handle(
		"GET /reservasi/alat",
		middleware.Auth(http.HandlerFunc(reservasi.ListAlat)),
	)
	mux.Handle(
		"GET /reservasi/{id}",
		middleware.Auth(http.HandlerFunc(reservasi.DetailReservasi)),
	)
	mux.Handle(
		"PATCH /reservasi/{id}/cancel",
		middleware.Auth(http.HandlerFunc(reservasi.CancelReservasi)),
	)
	mux.Handle(
		"GET /petugas/reservasi",
		middleware.Auth(middleware.RequireRole(
			http.HandlerFunc(petugas_reservasi.List),
			middleware.RolePetugas, middleware.RoleAdmin,
		)),
	)
	mux.Handle(
		"PATCH /petugas/reservasi/{id}",
		middleware.Auth(middleware.RequireRole(
			http.HandlerFunc(petugas_reservasi.UpdateStatus),
			middleware.RolePetugas,
		)),
	)
	mux.Handle(
		"PATCH /petugas/reservasi/{id}/cancel",
		middleware.Auth(middleware.RequireRole(
			http.HandlerFunc(petugas_reservasi.Cancel),
			middleware.RolePetugas,
		)),
	)
	mux.Handle(
		"GET /petugas/dashboard/count",
		middleware.Auth(middleware.RequireRole(
			http.HandlerFunc(petugas_reservasi.Count),
			middleware.RolePetugas,
		)),
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
	// File bukti laporan (uploads/reports/<uuid>.png). Wajib login:
	// <img> same-origin otomatis mengirim cookie session_id.
	// StripPrefix agar /uploads/x -> file uploads/x (relatif ke backend/).
	mux.Handle(
		"GET /uploads/",
		middleware.Auth(http.StripPrefix("/uploads/", http.FileServer(http.Dir("uploads")))),
	)
	return mux
}
