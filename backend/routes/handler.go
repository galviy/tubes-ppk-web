package router

import (
	"backend-ppk/middleware"
	"backend-ppk/auth"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/google/uuid"
)

func Login(w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodPost {
		http.Error(w, "Unauthorized post method", http.StatusMethodNotAllowed)
		return
	}
	err := r.ParseForm()
	if err != nil {
		http.Error(w, "Gagal memproses form", http.StatusBadRequest)
		return
	}

	email := r.FormValue("email")
	password := r.FormValue("password")
	if email == "" || password == "" {
		http.Error(w, "Email dan password tidak boleh kosong", http.StatusBadRequest)
		return
	}

	s := repositories.NewUser(1, "galvin@gmail.com", "admin")

	sessionID := uuid.NewString()
	repositories.Sessions[sessionID] = s

	http.SetCookie(w, &http.Cookie{
		Name:     "session_id",
		Value:    sessionID,
		Path:     "/",
		HttpOnly: true,
	})

	fmt.Fprintf(w, "Login berhasil")
}

func Dashboard(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("session_id")
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	p, ok := middleware.GetCookieInformation(cookie.Value)
	if !ok {
		http.Error(w, "Session tidak ditemukan", http.StatusUnauthorized)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(p)
}
