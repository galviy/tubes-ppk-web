package fasilitas

import (
	"backend-ppk/repositories"
	utils "backend-ppk/utilities"

	"database/sql"
	"errors"
	"log"
	"net/http"
	"strconv"
)

// Update_ruangan mengubah spesifikasi ruangan. Field mengikuti konvensi
// Create_ruangan (termasuk ejaan `kapasistas`).
func Update_ruangan(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		utils.ResponseJSONMessage(w, "Bad Request", http.StatusBadRequest, false)
		return
	}

	rawID := r.FormValue("id")
	kategori := r.FormValue("nama_kategori")
	ruangan := r.FormValue("nama_ruangan")
	status := r.FormValue("status")
	kapasitas := r.FormValue("kapasistas")
	lokasi := r.FormValue("lokasi")

	id, err := strconv.Atoi(rawID)
	if err != nil || id <= 0 {
		utils.ResponseJSONMessage(w, "ID ruangan tidak valid", http.StatusBadRequest, false)
		return
	}
	if kategori == "" || ruangan == "" || lokasi == "" {
		utils.ResponseJSONMessage(w, "Missing field!", http.StatusBadGateway, false)
		return
	}
	statusInt, err := strconv.Atoi(status)
	if err != nil || (statusInt != 0 && statusInt != 1) {
		utils.ResponseJSONMessage(w, "Status ruangan hanya true (1) atau false (0) pakkk!", http.StatusBadGateway, false)
		return
	}
	kapasitasInt, err := strconv.Atoi(kapasitas)
	if err != nil || kapasitasInt <= 0 {
		utils.ResponseJSONMessage(w, "kapasitas has to be integer pak!", http.StatusBadGateway, false)
		return
	}
	if len(kategori) < 5 || len(kategori) > 100 {
		utils.ResponseJSONMessage(w, "Username minimal 5 Huruf dan tidak boleh lebih dari 100 huruf!", http.StatusUnauthorized, false)
		return
	}
	if !repositories.IsKategoriExist(kategori) {
		utils.ResponseJSONMessage(w, "Kategori ("+kategori+") tidak exist di database!", http.StatusUnauthorized, false)
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

	if err := repositories.UpdateRuangan(id, ruangan, statusInt, kapasitasInt, lokasi, kategori, deskripsi, kelengkapan, foto); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			utils.ResponseJSONMessage(w, "Ruangan dengan id tersebut tidak ditemukan!", http.StatusNotFound, false)
			return
		}
		if utils.IsDuplicateEntry(err) {
			utils.ResponseJSONMessage(w, "Ruangan dengan nama ("+ruangan+") sudah exist di database!", http.StatusConflict, false)
			return
		}
		log.Printf("Gagal update ruangan: %v", err)
		utils.ResponseJSONMessage(w, "Internal server error", http.StatusInternalServerError, false)
		return
	}
	utils.ResponseJSONMessage(w, "Successfully updated ruangan ("+ruangan+")!", 200, true)
}

// Update_alat mengubah spesifikasi alat.
func Update_alat(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		utils.ResponseJSONMessage(w, "Bad Request", http.StatusBadRequest, false)
		return
	}

	rawID := r.FormValue("id")
	kategori := r.FormValue("nama_kategori")
	alat := r.FormValue("nama_alat")
	status := r.FormValue("status")
	jumlah := r.FormValue("jumlah_tersedia")
	banyak := r.FormValue("banyak_alat")

	id, err := strconv.Atoi(rawID)
	if err != nil || id <= 0 {
		utils.ResponseJSONMessage(w, "ID alat tidak valid", http.StatusBadRequest, false)
		return
	}
	if kategori == "" || alat == "" {
		utils.ResponseJSONMessage(w, "Missing field!", http.StatusBadGateway, false)
		return
	}
	statusInt, err := strconv.Atoi(status)
	if err != nil || (statusInt != 0 && statusInt != 1) {
		utils.ResponseJSONMessage(w, "Status alat hanya true (1) atau false (0)!", http.StatusBadGateway, false)
		return
	}
	jumlahInt, err := strconv.Atoi(jumlah)
	if err != nil || jumlahInt < 0 {
		utils.ResponseJSONMessage(w, "jumlah_tersedia has to be integer pak!", http.StatusBadGateway, false)
		return
	}
	banyakInt, err := strconv.Atoi(banyak)
	if err != nil || banyakInt < 0 {
		utils.ResponseJSONMessage(w, "banyak_alat has to be integer pak!", http.StatusBadGateway, false)
		return
	}
	if len(kategori) < 5 || len(kategori) > 100 {
		utils.ResponseJSONMessage(w, "Username minimal 5 Huruf dan tidak boleh lebih dari 100 huruf!", http.StatusUnauthorized, false)
		return
	}
	if !repositories.IsKategoriExist(kategori) {
		utils.ResponseJSONMessage(w, "Kategori ("+kategori+") tidak exist di database!", http.StatusUnauthorized, false)
		return
	}

	deskripsiAlat := r.FormValue("deskripsi")
	if deskripsiAlat == "" {
		deskripsiAlat = r.FormValue("desc")
	}
	kelengkapanAlat := r.FormValue("kelengkapan")
	if kelengkapanAlat == "" {
		kelengkapanAlat = r.FormValue("amenities")
	}
	fotoAlat := r.FormValue("foto")
	if fotoAlat == "" {
		fotoAlat = r.FormValue("image")
	}

	if err := repositories.UpdateAlat(id, alat, jumlahInt, banyakInt, kategori, statusInt, deskripsiAlat, kelengkapanAlat, fotoAlat); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			utils.ResponseJSONMessage(w, "Alat dengan id tersebut tidak ditemukan!", http.StatusNotFound, false)
			return
		}
		if utils.IsDuplicateEntry(err) {
			utils.ResponseJSONMessage(w, "Alat dengan nama ("+alat+") sudah exist di database!", http.StatusConflict, false)
			return
		}
		log.Printf("Gagal update alat: %v", err)
		utils.ResponseJSONMessage(w, "Internal server error", http.StatusInternalServerError, false)
		return
	}
	utils.ResponseJSONMessage(w, "Successfully updated Alat ("+alat+")!", 200, true)
}
