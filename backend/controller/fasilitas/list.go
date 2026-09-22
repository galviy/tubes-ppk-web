package fasilitas

import (
	"backend-ppk/models"
	"backend-ppk/services"
	utils "backend-ppk/utilities"
	"net/http"
	"strings"
)

func ListFasilitas(w http.ResponseWriter, r *http.Request) {
	tipe := strings.ToLower(strings.TrimSpace(r.URL.Query().Get("tipe")))
	if tipe != "" && tipe != models.TipeFasilitasRuangan && tipe != models.TipeFasilitasAlat {
		utils.ResponseJSONMessage(w, "Tipe fasilitas harus ruangan atau alat", http.StatusBadRequest, false)
		return
	}
	respondList(w, tipe)
}

// ListRuangan menampilkan katalog ruangan saja.
func ListRuangan(w http.ResponseWriter, r *http.Request) {
	respondList(w, models.TipeFasilitasRuangan)
}

// ListAlat menampilkan katalog alat saja.
func ListAlat(w http.ResponseWriter, r *http.Request) {
	respondList(w, models.TipeFasilitasAlat)
}

func respondList(w http.ResponseWriter, tipe string) {
	list, err := services.ListFasilitas(tipe)
	if err != nil {
		utils.ResponseJSONMessage(w, "Gagal mengambil daftar fasilitas", http.StatusInternalServerError, false)
		return
	}

	utils.ResponseJSON(w, http.StatusOK, map[string]any{
		"success": true,
		"data":    list,
	})
}
