package report

import (
	"backend-ppk/repositories"
	utils "backend-ppk/utilities"
	"database/sql"
	"errors"
	"net/http"
	"strconv"
)

func ListAllLaporan(w http.ResponseWriter, r *http.Request) {
	list, err := repositories.ListAllReports()
	if err != nil {
		utils.ResponseJSONMessage(w, "Gagal mengambil daftar laporan", http.StatusInternalServerError, false)
		return
	}

	utils.ResponseJSON(w, http.StatusOK, map[string]any{
		"success": true,
		"data":    list,
	})
}

func DetailLaporanOfficer(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil || id <= 0 {
		utils.ResponseJSONMessage(w, "ID laporan tidak valid", http.StatusBadRequest, false)
		return
	}

	d, err := repositories.GetReportByIDForPetugas(id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			utils.ResponseJSONMessage(w, "Laporan tidak ditemukan", http.StatusNotFound, false)
			return
		}
		utils.ResponseJSONMessage(w, "Gagal mengambil detail laporan", http.StatusInternalServerError, false)
		return
	}

	utils.ResponseJSON(w, http.StatusOK, map[string]any{
		"success": true,
		"data":    d,
	})
}
