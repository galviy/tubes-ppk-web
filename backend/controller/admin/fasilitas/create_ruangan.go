package fasilitas

import (
	"backend-ppk/repositories"
	utils "backend-ppk/utilities"

	"log"
	"net/http"
	"strconv"
)

func Create_ruangan(w http.ResponseWriter, r *http.Request) {

	err := r.ParseForm()
	if err != nil {
		utils.ResponseJSONMessage(w, "Bad Request", http.StatusBadRequest, false)
		return
	}

	kategori := r.FormValue("nama_kategori")
	ruangan := r.FormValue("nama_ruangan")
	status := r.FormValue("status")
	kapasitas := r.FormValue("kapasistas")
	lokasi := r.FormValue("lokasi")

	if kategori == "" || ruangan == "" || lokasi == "" {
		utils.ResponseJSONMessage(w, "Missing field!", http.StatusBadGateway, false)
		return
	}

	statuslohya, errStatus := strconv.Atoi(status)
	if errStatus != nil {
		utils.ResponseJSONMessage(w, "status has to be integer pak!", http.StatusBadGateway, false)
		return
	}
	if statuslohya != 0 && statuslohya != 1 {
		utils.ResponseJSONMessage(w, "Status ruangan hanya true (1) atau false (0) pakkk!", http.StatusBadGateway, false)
		return
	}
	kapasitaslohya, errKapasitas := strconv.Atoi(kapasitas)
	if errKapasitas != nil {
		utils.ResponseJSONMessage(w, "kapasitas has to be integer pak!", http.StatusBadGateway, false)
		return
	}

	if len(kategori) < 3 || len(kategori) > 100 {
		utils.ResponseJSONMessage(w, "Username minimal 5 Huruf dan tidak boleh lebih dari 100 huruf!", http.StatusUnauthorized, false)
		return
	}

	p := repositories.IsKategoriExist(kategori)
	if !p {
		utils.ResponseJSONMessage(w, "Kategori ("+kategori+") tidak exist di database!", http.StatusUnauthorized, false)
		return
	}
	p2 := repositories.IsNamaRuanganExist(ruangan)
	if p2 {
		utils.ResponseJSONMessage(w, "Ruangan dengan nama ("+ruangan+") sudah exist di database!", http.StatusBadRequest, false)
		return
	}
	deskripsi := r.FormValue("deskripsi")
	if deskripsi == "" {
		deskripsi = r.FormValue("desc")
	}
	kelengkapan := r.FormValue("kelengkapan")
	if kelengkapan == "" {
		kelengkapan = r.FormValue("amenities")
	}
	foto := r.FormValue("foto")
	if foto == "" {
		foto = r.FormValue("image")
	}

	errCreate := repositories.CreateRuangan(ruangan, statuslohya, kapasitaslohya, lokasi, kategori, deskripsi, kelengkapan, foto)
	if errCreate != nil {
		log.Printf("Gagal membuat user: %v", errCreate)
		utils.ResponseJSONMessage(w, "Internal server error", http.StatusInternalServerError, false)
		return
	}
	utils.ResponseJSONMessage(w, "Successfully created ruangan ("+ruangan+")!", 200, true)
}
