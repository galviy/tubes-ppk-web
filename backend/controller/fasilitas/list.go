package fasilitas

import (
	"backend-ppk/models"
	"backend-ppk/services"
	utils "backend-ppk/utilities"
	"net/http"
	"strconv"
	"strings"
)

func ListFasilitas(w http.ResponseWriter, r *http.Request) {
	tipe := strings.ToLower(strings.TrimSpace(r.URL.Query().Get("tipe")))
	if tipe != "" && tipe != models.TipeFasilitasRuangan && tipe != models.TipeFasilitasAlat {
		utils.ResponseJSONMessage(w, "Tipe fasilitas harus ruangan atau alat", http.StatusBadRequest, false)
		return
	}
	respondList(w, r, tipe)
}

// ListRuangan menampilkan katalog ruangan saja.
func ListRuangan(w http.ResponseWriter, r *http.Request) {
	respondList(w, r, models.TipeFasilitasRuangan)
}

// ListAlat menampilkan katalog alat saja.
func ListAlat(w http.ResponseWriter, r *http.Request) {
	respondList(w, r, models.TipeFasilitasAlat)
}

func respondList(w http.ResponseWriter, r *http.Request, tipe string) {
	query := r.URL.Query()

	kapasitasMin := 0
	if nilai := strings.TrimSpace(query.Get("kapasitas_min")); nilai != "" {
		n, err := strconv.Atoi(nilai)
		if err != nil || n < 0 {
			utils.ResponseJSONMessage(w, "kapasitas_min harus angka positif", http.StatusBadRequest, false)
			return
		}
		kapasitasMin = n
	}

	page := 1
	if nilai := strings.TrimSpace(query.Get("page")); nilai != "" {
		n, err := strconv.Atoi(nilai)
		if err != nil || n <= 0 {
			utils.ResponseJSONMessage(w, "page harus angka positif", http.StatusBadRequest, false)
			return
		}
		page = n
	}

	limit := 0
	if nilai := strings.TrimSpace(query.Get("limit")); nilai != "" {
		n, err := strconv.Atoi(nilai)
		if err != nil || n <= 0 {
			utils.ResponseJSONMessage(w, "limit harus angka positif", http.StatusBadRequest, false)
			return
		}
		if n > 100 {
			n = 100
		}
		limit = n
	}

	list, total, err := services.ListFasilitasFiltered(
		tipe,
		query.Get("q"),
		query.Get("lokasi"),
		kapasitasMin,
		page,
		limit,
	)
	if err != nil {
		utils.ResponseJSONMessage(w, "Gagal mengambil daftar fasilitas", http.StatusInternalServerError, false)
		return
	}

	utils.ResponseJSON(w, http.StatusOK, map[string]any{
		"success": true,
		"data":    list,
		"total":   total,
		"page":    page,
		"limit":   limit,
	})
}
