package auth

import (
	"backend-ppk/repositories"
	utils "backend-ppk/utilities"
	"log"
	"net/http"
	"strconv"
)

func Create_account_Staff(w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodPost {
		utils.ResponseJSONMessage(w, "Method Now Allowed", http.StatusMethodNotAllowed, false)
		return
	}
	err := r.ParseForm()
	if err != nil {
		utils.ResponseJSONMessage(w, "Bad Request", http.StatusBadRequest, false)
		return
	}
	//curl -X POST http://localhost:8080/auth/create_account/mhs \
	//-d "username=galvin&email=galvindoser@gmail.com&password=Test@123&nim=1921221&angkatan=2024&nama_lengkap=Galvin+Shalahudin&prodi=1"

	/*
		username := r.FormValue("username")
		email := r.FormValue("email")
		password := r.FormValue("password")
		nip := r.FormValue("nip")
		nama_lengap := r.FormValue("nama_lengkap")
	*/
	username := r.FormValue("username")
	email := r.FormValue("email")
	password := r.FormValue("password")
	nip := r.FormValue("nip")
	nama_lengkap := r.FormValue("nama_lengkap")

	if username == "" || email == "" || password == "" || nip == "" || nama_lengkap == "" {
		utils.ResponseJSONMessage(w, "Missing field!", http.StatusUnauthorized, false)
		return
	}

	if len(username) < 5 || len(username) > 100 {
		utils.ResponseJSONMessage(w, "Password must be between 8 and 100 characters", http.StatusBadRequest, false)
		return
	}

	// NIP staff: 12-18 digit angka dan nilainya lebih dari 0.
	hanyaAngkaNIP := true
	for _, c := range nip {
		if c < '0' || c > '9' {
			hanyaAngkaNIP = false
			break
		}
	}
	if !hanyaAngkaNIP {
		utils.ResponseJSONMessage(w, "NIP hanya boleh berisi angka!", http.StatusBadRequest, false)
		return
	}
	if len(nip) < 12 || len(nip) > 18 {
		utils.ResponseJSONMessage(w, "NIP staff harus 12 sampai 18 digit angka!", http.StatusBadRequest, false)
		return
	}
	nilaiNIP, err_nip := strconv.ParseInt(nip, 10, 64)
	if err_nip != nil || nilaiNIP <= 0 {
		utils.ResponseJSONMessage(w, "NIP tidak boleh negatif!", http.StatusBadRequest, false)
		return
	}

	if len(nama_lengkap) < 3 || len(nama_lengkap) > 100 {
		utils.ResponseJSONMessage(w, "Full name must be between 3 and 100 characters", http.StatusBadRequest, false)
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
	CheckExist := repositories.IsStaffExist(nip)
	if CheckExist {
		utils.ResponseJSONMessage(w, "Sudah ada staff dengan nip ("+nip+") terdaftar di database kita!", http.StatusBadRequest, false)
		return
	}

	errCreate := repositories.CreateSTAFF(username, email, passwordHash, "Staff", nip, nama_lengkap)
	if errCreate != nil {
		log.Printf("Gagal membuat user: %v", errCreate)
		if utils.IsDuplicateEntry(errCreate) {
			utils.ResponseJSONMessage(w, "Username, email, atau nip sudah terdaftar di database kita!", http.StatusConflict, false)
			return
		}
		utils.ResponseJSONMessage(w, "Internal server error", http.StatusInternalServerError, false)
		return
	}
	utils.ResponseJSONMessage(w, "Successfully created account with username ("+username+"), you can login when your account is verified!", 200, true)
}
