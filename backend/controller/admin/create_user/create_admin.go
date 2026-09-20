package createuser

import (
	"backend-ppk/repositories"
	utils "backend-ppk/utilities"
	"log"
	"net/http"
)

func Create_Admin(w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodPost {
		utils.ResponseJSONMessage(w, "Method Now Allowed", http.StatusMethodNotAllowed, false)
		return
	}
	err := r.ParseForm()
	if err != nil {
		utils.ResponseJSONMessage(w, "Bad Request", http.StatusBadRequest, false)
		return
	}

	username := r.FormValue("username")
	email := r.FormValue("email")
	password := r.FormValue("password")

	if username == "" || email == "" || password == "" {
		utils.ResponseJSONMessage(w, "Missing field!", http.StatusUnauthorized, false)
		return
	}

	if len(username) < 5 {
		utils.ResponseJSONMessage(w, "Username minimal 5 Huruf!", http.StatusUnauthorized, false)
		return
	}
	if !utils.IsPasswordValid(password) {
		utils.ResponseJSONMessage(w, "Password tidak valid! Harus minimal 5 karakter, mengandung 1 huruf besar, dan 1 simbol!", http.StatusUnauthorized, false)
		return
	}
	if !utils.IsEmailValid(email) {
		utils.ResponseJSONMessage(w, "Email tidak sesuai dengan standar format email!", http.StatusUnauthorized, false)
		return
	}

	p := repositories.IsUserExist(email, username)
	if p {
		utils.ResponseJSONMessage(w, "Username atau email sudah exist sebelumnya!", http.StatusUnauthorized, false)
		return
	}

	passwordHash, err := utils.HashPassword(password)
	if err != nil {
		log.Printf("Gagal hashing password!")
		utils.ResponseJSONMessage(w, "Internal server error", http.StatusInternalServerError, false)
		return
	}
	//CreateSTAFF(username string, email string, password string, tipeUser string, nip string, namaLengkap string)
	errCreate := repositories.CreateAdmin(username, email, passwordHash, "Admin")
	if errCreate != nil {
		log.Printf("Gagal membuat user: %v", errCreate)
		if utils.IsDuplicateEntry(errCreate) {
			utils.ResponseJSONMessage(w, "Username atau email sudah terdaftar di database kita!", http.StatusConflict, false)
			return
		}
		utils.ResponseJSONMessage(w, "Internal server error", http.StatusInternalServerError, false)
		return
	}
	utils.ResponseJSONMessage(w, "Successfully created account with username ("+username+")!", 200, true)
}
