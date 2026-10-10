package fasilitas

import (
	"backend-ppk/repositories"
	utils "backend-ppk/utilities"
	"log"
	"net/http"
)

func Create_Kategori(w http.ResponseWriter, r *http.Request) {

	err := r.ParseForm()
	if err != nil {
		utils.ResponseJSONMessage(w, "Bad Request", http.StatusBadRequest, false)
		return
	}

	kategori := r.FormValue("nama_kategori")

	if kategori == "" {
		utils.ResponseJSONMessage(w, "Missing field!", http.StatusBadGateway, false)
		return
	}

	if len(kategori) < 3 || len(kategori) > 100 {
		utils.ResponseJSONMessage(w, "Username minimal 5 Huruf dan tidak boleh lebih dari 100 huruf!", http.StatusUnauthorized, false)
		return
	}

	p := repositories.IsKategoriExist(kategori)
	if p {
		utils.ResponseJSONMessage(w, "Kategori ("+kategori+") sudah exist di database!", http.StatusUnauthorized, false)
		return
	}

	//CreateDosenPending(username string, email string, password string, tipeUser string, nidn string, namaLengkap string, prodi string) error {
	errCreate := repositories.CreateKategori(kategori)
	if errCreate != nil {
		log.Printf("Gagal membuat user: %v", errCreate)
		utils.ResponseJSONMessage(w, "Internal server error", http.StatusInternalServerError, false)
		return
	}
	utils.ResponseJSONMessage(w, "Successfully created kategori ("+kategori+")!", 200, true)
}
