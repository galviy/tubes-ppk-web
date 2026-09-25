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

	tanggal := time.Now().AddDate(0, 0, 2)
	if nilai := strings.TrimSpace(r.URL.Query().Get("tanggal")); nilai != "" {
		parsed, err := time.Parse("2006-01-02", nilai)
		if err != nil {
			utils.ResponseJSONMessage(w, "Format tanggal tidak valid! Gunakan YYYY-MM-DD", http.StatusBadRequest, false)
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
