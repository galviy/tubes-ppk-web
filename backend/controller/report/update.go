package report

import (
	"backend-ppk/models"
	"backend-ppk/repositories"
	utils "backend-ppk/utilities"
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"
)


var allowedTransitions = map[string][]string{
	models.StatusBaru:     {models.StatusDiproses, models.StatusSelesai, models.StatusDitolak},
	models.StatusDiproses: {models.StatusSelesai, models.StatusDitolak},
}

type updateLaporanBody struct {
	Status          string `json:"status"`
	CatatanResolusi string `json:"catatan_resolusi"`
}

func UpdateLaporan(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil || id <= 0 {
		utils.ResponseJSONMessage(w, "ID laporan tidak valid", http.StatusBadRequest, false)
		return
	}

	var body updateLaporanBody
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		utils.ResponseJSONMessage(w, "Body request tidak valid", http.StatusBadRequest, false)
		return
	}
	status := strings.ToLower(strings.TrimSpace(body.Status))
	switch status {
	case models.StatusBaru, models.StatusDiproses, models.StatusSelesai, models.StatusDitolak:
	default:
		utils.ResponseJSONMessage(w, "Status tidak valid", http.StatusBadRequest, false)
		return
	}

	current, err := repositories.GetReportByIDForPetugas(id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			utils.ResponseJSONMessage(w, "Laporan tidak ditemukan", http.StatusNotFound, false)
			return
		}
		utils.ResponseJSONMessage(w, "Gagal mengambil data laporan", http.StatusInternalServerError, false)
		return
	}

	currentStatus := strings.ToLower(strings.TrimSpace(current.StatusLaporan))
	allowed, ok := allowedTransitions[currentStatus]
	if !ok {
		utils.ResponseJSONMessage(w, "Laporan sudah ditutup dan tidak bisa diubah lagi", http.StatusConflict, false)
		return
	}
	valid := false
	for _, s := range allowed {
		if s == status {
			valid = true
			break
		}
	}
	if !valid {
		utils.ResponseJSONMessage(w, "Transisi status dari "+currentStatus+" ke "+status+" tidak diizinkan", http.StatusBadRequest, false)
		return
	}

	resolved := status == models.StatusSelesai || status == models.StatusDitolak
	catatan := strings.TrimSpace(body.CatatanResolusi)
	if resolved && catatan == "" {
		utils.ResponseJSONMessage(w, "Catatan resolusi wajib diisi saat laporan ditutup", http.StatusBadRequest, false)
		return
	}

	if err := repositories.UpdateReportStatus(id, status,
		sql.NullString{String: catatan, Valid: catatan != ""}, resolved); err != nil {
		utils.ResponseJSONMessage(w, "Gagal memperbarui status laporan", http.StatusInternalServerError, false)
		return
	}

	utils.ResponseJSONMessage(w, "Status laporan berhasil diperbarui", http.StatusOK, true)
}
