package routes

import (
	"backend-ppk/controller/auth"
	"backend-ppk/controller/user"
	"backend-ppk/middleware"
	"net/http"
)

func SetupRoutes() *http.ServeMux {
	mux := http.NewServeMux()

	mux.HandleFunc("/auth/login", auth.Login)
	mux.HandleFunc("/auth/create_account", auth.Create_Account)

	mux.Handle(
		"/user/me",
		middleware.Auth(http.HandlerFunc(user.Me)),
	)
	return mux
}
