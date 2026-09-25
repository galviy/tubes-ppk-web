package reservasi

import (
	"backend-ppk/services"
	utils "backend-ppk/utilities"
	"net/http"
	"strconv"
	"strings"
)

// Create_reservasi: reservasi berbasis ruangan, boleh sekaligus membawa banyak alat.
func Create_reservasi(w http.ResponseWriter, r *http.Request) {
	sess, ok := sesiUser(r)
	if !ok || sess.UserId <= 0 {
		utils.ResponseJSONMessage(w, "Unauthorized", http.StatusUnauthorized, false)
		return
	}

	if err := r.ParseForm(); err != nil {
		utils.ResponseJSONMessage(w, "Bad Request", http.StatusBadRequest, false)
		return
	}

	ruanganStr := strings.TrimSpace(r.FormValue("ruangan_reservasi"))
	if ruanganStr == "" {
		utils.ResponseJSONMessage(w, "Ruangan wajib diisi untuk endpoint ini", http.StatusBadRequest, false)
		return
	}
	ruanganID, err := strconv.Atoi(ruanganStr)
	if err != nil || ruanganID <= 0 {
		utils.ResponseJSONMessage(w, "ID ruangan tidak valid", http.StatusBadRequest, false)
		return
	}

	alat, err := parseAlatForm(r)
	if err != nil {
		respondErr(w, err)
		return
	}

	jumlahPeserta, err := parseJumlahPeserta(r)
	if err != nil {
		respondErr(w, err)
		return
	}

	mulai, err := services.ParseWaktu(r.FormValue("waktu_peminjaman"))
	if err != nil {
		utils.ResponseJSONMessage(w, "Format waktu peminjaman tidak valid! Gunakan YYYY-MM-DD HH:MM:SS", http.StatusBadRequest, false)
		return
	}
	selesai, err := services.ParseWaktu(r.FormValue("waktu_peminjaman_selesai"))
	if err != nil {
		utils.ResponseJSONMessage(w, "Format waktu selesai tidak valid! Gunakan YYYY-MM-DD HH:MM:SS", http.StatusBadRequest, false)
		return
	}

	id, err := services.BuatReservasi(sess.UserId, services.BuatReservasiInput{
		RuanganID:     &ruanganID,
		Alat:          alat,
		WaktuMulai:    mulai,
		WaktuSelesai:  selesai,
		Alasan:        r.FormValue("alasan_peminjaman"),
		JumlahPeserta: jumlahPeserta,
	})
	if err != nil {
		respondErr(w, err)
		return
	}

	utils.ResponseJSON(w, http.StatusCreated, map[string]any{
		"success": true,
		"message": "Reservasi berhasil dibuat!",
		"id":      id,
	})
}
