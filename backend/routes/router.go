package routes

import (
	"backend-ppk/controller/admin"
	"backend-ppk/controller/auth"
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
		middleware.AdminAuth(http.HandlerFunc(admin.Show_mhs_pending)),
	)
	mux.Handle(
		"GET /admin/show_dosen_pending",
		middleware.AdminAuth(http.HandlerFunc(admin.Show_dosen_pending)),
	)
	mux.Handle(
		"GET /user/me",
		middleware.Auth(http.HandlerFunc(user.Me)),
	)
	mux.Handle(
		"POST /reports",
		middleware.Auth(http.HandlerFunc(report.CreateLaporan)),
	)
	return mux
}
