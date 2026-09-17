package middleware

import (
	repositories "backend-ppk/models"
	"fmt"
	"net/http"
)

const (
	RoleAdmin    = "1"
	RolePetugas  = "2"
	RolePengguna = "3"
)

func Auth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		//fmt.Println("Request:", r.Method, r.URL.Path)
		cookie, err := r.Cookie("session_id")
		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		sess, ok := repositories.Sessions[cookie.Value]
		if !ok {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		if !repositories.IsSessionActive(sess) {
			delete(repositories.Sessions, cookie.Value)
			http.Error(w, "Silahkan login kembali", http.StatusUnauthorized)
			/*Semua response baik nya sama untuk mencegah information gathering*/
			return
		}
		next.ServeHTTP(w, r)

		fmt.Println("Request selesai")
	})
}


func RequireRole(next http.Handler, allowedRoles ...string) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("session_id")
		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		sess, ok := repositories.Sessions[cookie.Value]
		if !ok || !repositories.IsSessionActive(sess) {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		for _, role := range allowedRoles {
			if sess.Role == role {
				next.ServeHTTP(w, r)
				return
			}
		}
		http.Error(w, "Forbidden", http.StatusForbidden)
	})
}

func GetCookieInformation(sessionId string) (*repositories.Session, bool) {
	data, ok := repositories.Sessions[sessionId]
	if !ok {
		return nil, false
	}
	return data, true
}
