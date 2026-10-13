package reservasi

import (
	"backend-ppk/services"
	utils "backend-ppk/utilities"
	"net/http"
)

// Create_reservasi_alat: reservasi alat saja (tanpa ruangan), boleh banyak alat sekaligus.
func Create_reservasi_alat(w http.ResponseWriter, r *http.Request) {
	sess, ok := sesiUser(r)
	if !ok || sess.UserId <= 0 {
		utils.ResponseJSONMessage(w, "Unauthorized", http.StatusUnauthorized, false)
		return
	}

	if err := r.ParseForm(); err != nil {
		utils.ResponseJSONMessage(w, "Bad Request", http.StatusBadRequest, false)
		return
	}

	alat, err := parseAlatForm(r)
	if err != nil {
		respondErr(w, err)
		return
	}

	// Reservasi alat tidak menyimpan jumlah peserta, tetapi tetap divalidasi
	// agar nilai negatif ditolak sama seperti reservasi ruangan.
	if _, err := parseJumlahPeserta(r); err != nil {
		respondErr(w, err)
		return
	}
	if len(alat) == 0 {
		utils.ResponseJSONMessage(w, "Minimal satu alat harus dipilih", http.StatusBadRequest, false)
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
		Alat:         alat,
		WaktuMulai:   mulai,
		WaktuSelesai: selesai,
		Alasan:       r.FormValue("alasan_peminjaman"),
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
