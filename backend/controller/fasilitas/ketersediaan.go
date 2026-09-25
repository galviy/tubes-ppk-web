package fasilitas

import (
	"backend-ppk/models"
	"backend-ppk/services"
	utils "backend-ppk/utilities"
	"net/http"
	"strconv"
	"strings"
	"time"
)

// Ketersediaan: status tiap slot 30 menit per fasilitas (US 1).
// Publik, tanpa detail pemohon atau tujuan penggunaan.
func Ketersediaan(w http.ResponseWriter, r *http.Request) {
	tipe := strings.ToLower(strings.TrimSpace(r.URL.Query().Get("tipe")))
	if tipe != "" && tipe != models.TipeFasilitasRuangan && tipe != models.TipeFasilitasAlat {
		utils.ResponseJSONMessage(w, "Tipe fasilitas harus ruangan atau alat", http.StatusBadRequest, false)
		return
	}

	// Jam operasional dan waktu reservasi disimpan sebagai waktu-naif di DB
	// (driver memakai loc UTC), jadi tanggal diminta harus di-parse sebagai UTC
	// agar slot sejajar dengan baris reservasi. Hari ini dihitung dari tanggal
	// kalender lokal supaya batas "tidak boleh tanggal lampau" tetap benar.
	sekarang := time.Now()
	hariIni := time.Date(sekarang.Year(), sekarang.Month(), sekarang.Day(), 0, 0, 0, 0, time.UTC)
	tanggal := hariIni
	if nilai := strings.TrimSpace(r.URL.Query().Get("tanggal")); nilai != "" {
		parsed, err := time.Parse("2006-01-02", nilai)
		if err != nil {
			utils.ResponseJSONMessage(w, "Format tanggal tidak valid! Gunakan YYYY-MM-DD", http.StatusBadRequest, false)
			return
		}
		if parsed.Format("2006-01-02") < hariIni.Format("2006-01-02") {
			utils.ResponseJSONMessage(w, "Jadwal hanya tersedia untuk hari ini dan tanggal berikutnya", http.StatusBadRequest, false)
			return
		}
		tanggal = parsed
	}

	hari := 7
	if nilai := strings.TrimSpace(r.URL.Query().Get("hari")); nilai != "" {
		n, err := strconv.Atoi(nilai)
		if err != nil || n <= 0 {
			utils.ResponseJSONMessage(w, "hari harus angka positif", http.StatusBadRequest, false)
			return
		}
		if n > 30 {
			n = 30
		}
		hari = n
	}

	list, err := services.Ketersediaan(tipe, tanggal, hari)
	if err != nil {
		utils.ResponseJSONMessage(w, "Gagal mengambil ketersediaan fasilitas", http.StatusInternalServerError, false)
		return
	}

	utils.ResponseJSON(w, http.StatusOK, map[string]any{
		"success": true,
		"data":    list,
	})
}
