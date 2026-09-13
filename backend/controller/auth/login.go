package auth

import (
	repositories "backend-ppk/models"
	utils "backend-ppk/utilities"
	"net/http"

	"github.com/google/uuid"
)

func Login(w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodPost {
		utils.ResponseJSONMessage(w, "Method Now Allowed", http.StatusMethodNotAllowed, false)
		return
	}
	err := r.ParseForm()
	if err != nil {
		utils.ResponseJSONMessage(w, "Bad Request", http.StatusBadRequest, false)
		return
	}

	email := r.FormValue("email")
	password := r.FormValue("password")
	if email == "" || password == "" {
		utils.ResponseJSONMessage(w, "Email and Password are required to fill!", http.StatusUnauthorized, false)
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

	utils.ResponseJSONMessage(w, "successfully logged in to "+email, 200, true)
}
