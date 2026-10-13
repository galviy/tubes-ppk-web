package createuser

import (
	"backend-ppk/repositories"
	utils "backend-ppk/utilities"
	"log"
	"net/http"
	"strconv"
	"strings"
)

func Create_Petugas(w http.ResponseWriter, r *http.Request) {

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
	nip := strings.TrimSpace(r.FormValue("nip"))

	if username == "" || email == "" || password == "" || nip == "" {
		utils.ResponseJSONMessage(w, "Missing field! (NIP petugas wajib diisi)", http.StatusUnauthorized, false)
		return
	}

	if len(username) < 5 {
		utils.ResponseJSONMessage(w, "Username minimal 5 Huruf!", http.StatusUnauthorized, false)
		return
	}
	// NIP petugas: 12-18 digit angka dan nilainya lebih dari 0.
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
		utils.ResponseJSONMessage(w, "NIP petugas harus 12 sampai 18 digit angka!", http.StatusBadRequest, false)
		return
	}
	nilaiNIP, err_nip := strconv.ParseInt(nip, 10, 64)
	if err_nip != nil || nilaiNIP <= 0 {
		utils.ResponseJSONMessage(w, "NIP tidak boleh negatif!", http.StatusBadRequest, false)
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
	//Memakai CreatePetugas agar user_role = 2 (petugas), bukan admin.
	errCreate := repositories.CreatePetugas(username, email, passwordHash, "Petugas")
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
