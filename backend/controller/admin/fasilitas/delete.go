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

// Delete_ruangan menonaktifkan ruangan (soft delete: status nonaktif).
// Hapus fisik tidak dilakukan karena FK reservasi/report mengikat.
func Delete_ruangan(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		utils.ResponseJSONMessage(w, "Bad Request", http.StatusBadRequest, false)
		return
	}
	id, err := strconv.Atoi(r.FormValue("id"))
	if err != nil || id <= 0 {
		utils.ResponseJSONMessage(w, "ID ruangan tidak valid", http.StatusBadRequest, false)
		return
	}
	if err := repositories.SoftDeleteRuangan(id); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			utils.ResponseJSONMessage(w, "Ruangan dengan id tersebut tidak ditemukan!", http.StatusNotFound, false)
			return
		}
		log.Printf("Gagal menonaktifkan ruangan: %v", err)
		utils.ResponseJSONMessage(w, "Internal server error", http.StatusInternalServerError, false)
		return
	}
	utils.ResponseJSONMessage(w, "Ruangan berhasil dinonaktifkan!", 200, true)
}

// Delete_alat menonaktifkan alat (status 0 + stok tampil 0).
func Delete_alat(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		utils.ResponseJSONMessage(w, "Bad Request", http.StatusBadRequest, false)
		return
	}
	id, err := strconv.Atoi(r.FormValue("id"))
	if err != nil || id <= 0 {
		utils.ResponseJSONMessage(w, "ID alat tidak valid", http.StatusBadRequest, false)
		return
	}
	if err := repositories.SoftDeleteAlat(id); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			utils.ResponseJSONMessage(w, "Alat dengan id tersebut tidak ditemukan!", http.StatusNotFound, false)
			return
		}
		log.Printf("Gagal menonaktifkan alat: %v", err)
		utils.ResponseJSONMessage(w, "Internal server error", http.StatusInternalServerError, false)
		return
	}
	utils.ResponseJSONMessage(w, "Alat berhasil dinonaktifkan!", 200, true)
}
