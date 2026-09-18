package createuser

import (
	"backend-ppk/repositories"
	utils "backend-ppk/utilities"
	"log"
	"net/http"
	"strconv"
)

func Create_MHS(w http.ResponseWriter, r *http.Request) {

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

	username := r.FormValue("username")
	email := r.FormValue("email")
	password := r.FormValue("password")
	nim := r.FormValue("nim")
	angkatan := r.FormValue("angkatan")
	nama_lengkap := r.FormValue("nama_lengkap")
	prodi := r.FormValue("prodi")

	if username == "" || email == "" || password == "" || nim == "" || angkatan == "" || nama_lengkap == "" || prodi == "" {
		utils.ResponseJSONMessage(w, "Missing field!", http.StatusUnauthorized, false)
		return
	}

	if len(username) < 5 {
		utils.ResponseJSONMessage(w, "Username minimal 5 Huruf!", http.StatusUnauthorized, false)
		return
	}
	_, err_conv := strconv.Atoi(angkatan)
	if err_conv != nil {
		utils.ResponseJSONMessage(w, "Angkatan harus berupa angka!", http.StatusUnauthorized, false)
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
	CheckProdiExist := repositories.IsProdiExist(prodi)
	if !CheckProdiExist {
		utils.ResponseJSONMessage(w, "Tidak ditemukan prodi dengan nama tersebut!", http.StatusUnauthorized, false)
		return
	}

	passwordHash, err := utils.HashPassword(password)
	if err != nil {
		log.Printf("Gagal hashing password!")
		utils.ResponseJSONMessage(w, "Internal server error", http.StatusInternalServerError, false)
		return
	}
	CheckExist := repositories.IsMhsExist(nim)
	if CheckExist {
		utils.ResponseJSONMessage(w, "Sudah ada mahasiswa dengan nim ("+nim+") terdaftar di database kita!", http.StatusBadRequest, false)
		return
	}

	//func CreateMahasiswaPending(username string, email string, password string, tipeUser string, nim string, angkatan string, namaLengkap string, prodi int) error {
	errCreate := repositories.CreateMHSLangsung(username, email, passwordHash, "mhs", nim, angkatan, nama_lengkap, prodi)
	if errCreate != nil {
		log.Printf("Gagal membuat user: %v", errCreate)
		utils.ResponseJSONMessage(w, "Internal server error", http.StatusInternalServerError, false)
		return
	}
	utils.ResponseJSONMessage(w, "Successfully created account with username ("+username+"), you can login when your account is verified!", 200, true)
}
