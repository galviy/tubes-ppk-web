package auth

import (
	session "backend-ppk/models"
	"backend-ppk/repositories"
	utils "backend-ppk/utilities"

	"net/http"
	"strconv"

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
	if !utils.IsPasswordValid(password) {
		utils.ResponseJSONMessage(w, "Password tidak valid! Harus minimal 5 karakter, mengandung 1 huruf besar, dan 1 simbol!", http.StatusUnauthorized, false)
		return
	}
	if !utils.IsEmailValid(email) {
		utils.ResponseJSONMessage(w, "Email tidak sesuai dengan standar format email!", http.StatusUnauthorized, false)
	}

	var user_login repositories.User

	isCorrect := repositories.IsLoginCorrect(email, password, &user_login)
	if !isCorrect {
		utils.ResponseJSONMessage(w, "Make sure your account has been verified or you type a invalid username or password", http.StatusUnauthorized, false)
		return
	}

	idUser := strconv.Itoa(user_login.ID)
	if user_login.Email == "" || idUser == "" || user_login.Username == "" {
		utils.ResponseJSONMessage(w, "Internal server error", http.StatusInternalServerError, false)
		return
	}

	s := session.NewUser(user_login.ID,user_login.Email, user_login.Role, user_login.Username)

	sessionID := uuid.NewString()
	session.Sessions[sessionID] = s

	http.SetCookie(w, &http.Cookie{
		Name:     "session_id",
		Value:    sessionID,
		Path:     "/",
		HttpOnly: true,
	})

	utils.ResponseJSONMessage(w, "successfully logged in to "+email, 200, true)
}
