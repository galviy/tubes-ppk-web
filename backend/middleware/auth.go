package middleware

import (
	"backend-ppk/repositories"
	"fmt"
	"net/http"
)

func Auth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("Request:", r.Method, r.URL.Path)
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

func GetCookieInformation(sessionId string) (*repositories.Session, bool) {
	data, ok := repositories.Sessions[sessionId]
	if !ok {
		return nil, false
	}
	return data, true
}
