package fasilitas

import (
	"backend-ppk/services"
	utils "backend-ppk/utilities"
	"database/sql"
	"errors"
	"net/http"
	"strings"
)

// DetailFasilitas mengambil satu detail fasilitas berdasarkan ID (angka atau "ruangan-1" / "alat-2").
func DetailFasilitas(w http.ResponseWriter, r *http.Request) {
	idStr := strings.TrimSpace(r.PathValue("id"))
	if idStr == "" {
		utils.ResponseJSONMessage(w, "ID fasilitas wajib diisi", http.StatusBadRequest, false)
		return
	}

	fasilitas, err := services.GetFasilitasById(idStr)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) || strings.Contains(err.Error(), "tidak ditemukan") {
			utils.ResponseJSONMessage(w, "Fasilitas tidak ditemukan", http.StatusNotFound, false)
			return
		}
		utils.ResponseJSONMessage(w, "ID fasilitas tidak valid", http.StatusBadRequest, false)
		return
	}

	utils.ResponseJSON(w, http.StatusOK, map[string]any{
		"success": true,
		"data":    fasilitas,
	})
}
