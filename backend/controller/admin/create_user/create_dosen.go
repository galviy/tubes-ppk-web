package createuser

import (
	"backend-ppk/repositories"
	utils "backend-ppk/utilities"
	"log"
	"net/http"
	"strconv"
)

func Create_Dosen(w http.ResponseWriter, r *http.Request) {

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
	nidn := r.FormValue("nidn")
	nama_lengap := r.FormValue("nama_lengkap")
	prodi_dosen := r.FormValue("prodi")
	if username == "" || email == "" || password == "" || nidn == "" || nama_lengap == "" || prodi_dosen == "" {
		utils.ResponseJSONMessage(w, "Missing field!", http.StatusUnauthorized, false)
		return
	}

	if len(username) < 5 {
		utils.ResponseJSONMessage(w, "Username minimal 5 Huruf!", http.StatusUnauthorized, false)
		return
	}
	// NIDN harus 10 digit angka dan nilainya lebih dari 0.
	hanyaAngkaNIDN := true
	for _, c := range nidn {
		if c < '0' || c > '9' {
			hanyaAngkaNIDN = false
			break
		}
	}
	if !hanyaAngkaNIDN {
		utils.ResponseJSONMessage(w, "NIDN hanya boleh berisi angka!", http.StatusBadRequest, false)
		return
	}
	if len(nidn) != 10 {
		utils.ResponseJSONMessage(w, "NIDN harus tepat 10 digit angka!", http.StatusBadRequest, false)
		return
	}
	nilaiNIDN, err_nidn := strconv.ParseInt(nidn, 10, 64)
	if err_nidn != nil || nilaiNIDN <= 0 {
		utils.ResponseJSONMessage(w, "NIDN tidak boleh negatif!", http.StatusBadRequest, false)
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
	CheckProdiExist := repositories.IsProdiExist(prodi_dosen)
	if !CheckProdiExist {
		utils.ResponseJSONMessage(w, "Tidak ditemukan prodi dengan nama tersebut!", http.StatusUnauthorized, false)
		return
	}
	p := repositories.IsUserExist(email, username)
	if p {
		utils.ResponseJSONMessage(w, "Username atau email sudah exist sebelumnya!", http.StatusUnauthorized, false)
		return
	}

	CheckExist := repositories.IsDosenExist(nidn)
	if CheckExist {
		utils.ResponseJSONMessage(w, "Sudah ada Dosen dengan nidn ("+nidn+") terdaftar di database kita!", http.StatusBadRequest, false)
		return
	}

	passwordHash, err := utils.HashPassword(password)
	if err != nil {
		log.Printf("Gagal hashing password!")
		utils.ResponseJSONMessage(w, "Internal server error", http.StatusInternalServerError, false)
		return
	}
	//CreateDosenPending(username string, email string, password string, tipeUser string, nidn string, namaLengkap string, prodi string) error {
	errCreate := repositories.CreateDosenLangsung(username, email, passwordHash, "dosen", nidn, nama_lengap, prodi_dosen)
	if errCreate != nil {
		log.Printf("Gagal membuat user: %v", errCreate)
		if utils.IsDuplicateEntry(errCreate) {
			utils.ResponseJSONMessage(w, "Username, email, atau nidn sudah terdaftar di database kita!", http.StatusConflict, false)
			return
		}
		utils.ResponseJSONMessage(w, "Internal server error", http.StatusInternalServerError, false)
		return
	}
	utils.ResponseJSONMessage(w, "Successfully created account with username ("+username+")!", 200, true)
}
