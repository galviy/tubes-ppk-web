package createfasilitas

import (
	"backend-ppk/repositories"
	utils "backend-ppk/utilities"

	"log"
	"net/http"
	"strconv"
)

func Create_Alat(w http.ResponseWriter, r *http.Request) {

	err := r.ParseForm()
	if err != nil {
		utils.ResponseJSONMessage(w, "Bad Request", http.StatusBadRequest, false)
		return
	}
	alat := r.FormValue("nama_alat")
	jumlah_tersedia := r.FormValue("jumlah_tersedia")
	banyak_alat := r.FormValue("banyak_alat")
	kategori := r.FormValue("nama_kategori")
	status := r.FormValue("status")

	if kategori == "" || alat == "" {
		utils.ResponseJSONMessage(w, "Missing field!", http.StatusBadGateway, false)
		return
	}

	banyakAlat, errBanyakAlat := strconv.Atoi(banyak_alat)
	if errBanyakAlat != nil {
		utils.ResponseJSONMessage(w, "banyak alat has to be integer pak!", http.StatusBadGateway, false)
		return
	}
	jumlahTersedia, errJumlahTersedia := strconv.Atoi(jumlah_tersedia)
	if errJumlahTersedia != nil {
		utils.ResponseJSONMessage(w, "jumlah tersedia has to be integer pak!", http.StatusBadGateway, false)
		return
	}
	statusInt, errStatus := strconv.Atoi(status)
	if errStatus != nil {
		utils.ResponseJSONMessage(w, "jumlah tersedia has to be integer pak!", http.StatusBadGateway, false)
		return
	}
	if statusInt != 0 && statusInt != 1 {
		utils.ResponseJSONMessage(w, "Status alat hanya true (1) atau false (0) pakkk!", http.StatusBadGateway, false)
		return
	}

	if banyakAlat < 0 {
		utils.ResponseJSONMessage(w, "Harus lebih dari nol dong!", http.StatusBadGateway, false)
		return
	}
	if jumlahTersedia < 0 {
		utils.ResponseJSONMessage(w, "Harus lebih dari nol dong!", http.StatusBadGateway, false)
		return
	}

	if len(kategori) < 5 || len(kategori) > 100 {
		utils.ResponseJSONMessage(w, "Jenis kategori minimal 5 Huruf dan tidak boleh lebih dari 100 huruf!", http.StatusUnauthorized, false)
		return
	}

	p := repositories.IsKategoriExist(kategori)
	if !p {
		utils.ResponseJSONMessage(w, "Kategori ("+kategori+") tidak exist di database!", http.StatusUnauthorized, false)
		return
	}
	p2 := repositories.IsNamaAlatExist(alat)
	if p2 {
		utils.ResponseJSONMessage(w, "Alat dengan nama ("+alat+") sudah exist di database!", http.StatusBadRequest, false)
		return
	}
	//func CreateAlat(nama_alat string, jumlah_tersedia string, banyak_alat int, kategori string, status int) error {

	errCreate := repositories.CreateAlat(alat, jumlahTersedia, banyakAlat, kategori, statusInt)
	if errCreate != nil {
		log.Printf("Gagal membuat user: %v", errCreate)
		utils.ResponseJSONMessage(w, "Internal server error", http.StatusInternalServerError, false)
		return
	}
	utils.ResponseJSONMessage(w, "Successfully created Alat ("+alat+")!", 200, true)
}
