package facility

import (
	"backend-ppk/repositories"
	utils "backend-ppk/utilities"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
)


const (
	StatusAktif          = "aktif"
	StatusNonaktif       = "nonaktif"
	StatusDalamPerbaikan = "dalam_perbaikan"
)

const (
	TipeRuangan = "ruangan"
	TipeAlat    = "alat"
)

type updateStatusBody struct {
	Status string `json:"status"`
	Tipe string `json:"tipe"`
}


func UpdateStatus(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil || id <= 0 {
		utils.ResponseJSONMessage(w, "ID fasilitas tidak valid", http.StatusBadRequest, false)
		return
	}

	var body updateStatusBody
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		utils.ResponseJSONMessage(w, "Body request tidak valid", http.StatusBadRequest, false)
		return
	}
	status := strings.ToLower(strings.TrimSpace(body.Status))
	switch status {
	case StatusAktif, StatusNonaktif, StatusDalamPerbaikan:
	default:
		utils.ResponseJSONMessage(w, "Status fasilitas tidak valid", http.StatusBadRequest, false)
		return
	}
	tipe := strings.ToLower(strings.TrimSpace(body.Tipe))
	if tipe == "" {
		tipe = TipeRuangan
	}
	if tipe != TipeRuangan && tipe != TipeAlat {
		utils.ResponseJSONMessage(w, "Tipe fasilitas harus ruangan atau alat", http.StatusBadRequest, false)
		return
	}

	if tipe == TipeRuangan {
		if !repositories.CheckRuanganById(id) {
			utils.ResponseJSONMessage(w, "Ruangan tidak ditemukan", http.StatusNotFound, false)
			return
		}
		if err := repositories.UpdateRuanganStatus(id, status); err != nil {
			utils.ResponseJSONMessage(w, "Gagal memperbarui status fasilitas", http.StatusInternalServerError, false)
			return
		}
	} else {
		total, ok := repositories.GetAlatBanyak(id)
		if !ok {
			utils.ResponseJSONMessage(w, "Alat tidak ditemukan", http.StatusNotFound, false)
			return
		}
		jumlah := 0
		if status == StatusAktif {
			jumlah = total
		}
		if err := repositories.UpdateAlatTersedia(id, jumlah); err != nil {
			utils.ResponseJSONMessage(w, "Gagal memperbarui status fasilitas", http.StatusInternalServerError, false)
			return
		}
	}

	utils.ResponseJSONMessage(w, "Status fasilitas berhasil diperbarui", http.StatusOK, true)
}
