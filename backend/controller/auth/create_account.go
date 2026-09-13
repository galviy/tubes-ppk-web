package auth

import (
	"backend-ppk/repositories"
	utils "backend-ppk/utilities"
	"log"
	"net/http"
)

func Create_Account(w http.ResponseWriter, r *http.Request) {

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
	}
	errCreate := repositories.CreateUser(username, email, password)
	if errCreate != nil {
		log.Printf("Gagal membuat user: %v", errCreate)
		utils.ResponseJSONMessage(w, "Internal server error", http.StatusInternalServerError, true)
		return
	}

	//fmt.Println("User berhasil ditambahkan ke database!")
	repositories.CreateUser(username, email, password)
	utils.ResponseJSONMessage(w, "Successfully created account with username ("+username+")!", 200, true)
}
