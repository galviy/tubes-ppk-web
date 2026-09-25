package reservasi

import (
	"backend-ppk/middleware"
	"backend-ppk/models"
	"backend-ppk/repositories"
	"backend-ppk/services"
	utils "backend-ppk/utilities"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"strconv"
	"strings"
)

func respondErr(w http.ResponseWriter, err error) {
	var er services.ErrReservasi
	if errors.As(err, &er) {
		utils.ResponseJSONMessage(w, er.Pesan, er.Status, false)
		return
	}
	log.Printf("reservasi petugas error: %v", err)
	utils.ResponseJSONMessage(w, "Internal server error", http.StatusInternalServerError, false)
}

func sesiUser(r *http.Request) (*models.Session, bool) {
	cookie, err := r.Cookie("session_id")
	if err != nil {
		return nil, false
	}
	return middleware.GetCookieInformation(cookie.Value)
}

// List: antrian seluruh reservasi untuk petugas (US 8).
func List(w http.ResponseWriter, r *http.Request) {
	if err := repositories.SinkronisasiStatusReservasi(); err != nil {
		utils.ResponseJSONMessage(w, "Gagal menyinkronkan status reservasi", http.StatusInternalServerError, false)
		return
	}

	filter := repositories.ReservasiFilter{Limit: 20}

	tipe := strings.ToLower(strings.TrimSpace(r.URL.Query().Get("tipe")))
	if tipe != "" && tipe != models.TipeFasilitasRuangan && tipe != models.TipeFasilitasAlat {
		utils.ResponseJSONMessage(w, "Tipe harus ruangan atau alat", http.StatusBadRequest, false)
		return
	}
	filter.Tipe = tipe

	if nilai := strings.TrimSpace(r.URL.Query().Get("status")); nilai != "" {
		kode, valid := models.ReservasiStatusDariIndonesia(nilai)
		if !valid {
			utils.ResponseJSONMessage(w, "Status reservasi tidak valid", http.StatusBadRequest, false)
			return
		}
		filter.Status = kode
	}

	if nilai := strings.TrimSpace(r.URL.Query().Get("limit")); nilai != "" {
		limit, err := strconv.Atoi(nilai)
		if err != nil || limit <= 0 {
			utils.ResponseJSONMessage(w, "Limit harus angka positif", http.StatusBadRequest, false)
			return
		}
		if limit > 100 {
			limit = 100
		}
		filter.Limit = limit
	}
	if nilai := strings.TrimSpace(r.URL.Query().Get("page")); nilai != "" {
		page, err := strconv.Atoi(nilai)
		if err != nil || page <= 0 {
			utils.ResponseJSONMessage(w, "Page harus angka positif", http.StatusBadRequest, false)
			return
		}
		filter.Offset = (page - 1) * filter.Limit
	}

	list, err := repositories.ListReservasi(filter)
	if err != nil {
		utils.ResponseJSONMessage(w, "Gagal mengambil daftar reservasi", http.StatusInternalServerError, false)
		return
	}

	utils.ResponseJSON(w, http.StatusOK, map[string]any{
		"success": true,
		"data":    list,
	})
}

type updateStatusBody struct {
	Status          string `json:"status"`
	AlasanPenolakan string `json:"alasan_penolakan"`
}

// UpdateStatus: petugas menyetujui/menolak reservasi (US 9).
func UpdateStatus(w http.ResponseWriter, r *http.Request) {
	sess, ok := sesiUser(r)
	if !ok || sess.UserId <= 0 {
		utils.ResponseJSONMessage(w, "Unauthorized", http.StatusUnauthorized, false)
		return
	}

	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil || id <= 0 {
		utils.ResponseJSONMessage(w, "ID reservasi tidak valid", http.StatusBadRequest, false)
		return
	}

	var body updateStatusBody
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		utils.ResponseJSONMessage(w, "Body request tidak valid", http.StatusBadRequest, false)
		return
	}

	switch strings.ToLower(strings.TrimSpace(body.Status)) {
	case "disetujui":
		if err := services.ApproveReservasi(id, sess.UserId); err != nil {
			respondErr(w, err)
			return
		}
		utils.ResponseJSONMessage(w, "Reservasi disetujui", http.StatusOK, true)
	case "ditolak":
		if err := services.RejectReservasi(id, sess.UserId, body.AlasanPenolakan); err != nil {
			respondErr(w, err)
			return
		}
		utils.ResponseJSONMessage(w, "Reservasi ditolak", http.StatusOK, true)
	default:
		utils.ResponseJSONMessage(w, "Status harus disetujui atau ditolak", http.StatusBadRequest, false)
	}
}

type cancelBody struct {
	AlasanPembatalan string `json:"alasan_pembatalan"`
}

// Cancel: petugas membatalkan reservasi dalam kondisi mendesak (US 10).
func Cancel(w http.ResponseWriter, r *http.Request) {
	sess, ok := sesiUser(r)
	if !ok || sess.UserId <= 0 {
		utils.ResponseJSONMessage(w, "Unauthorized", http.StatusUnauthorized, false)
		return
	}

	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil || id <= 0 {
		utils.ResponseJSONMessage(w, "ID reservasi tidak valid", http.StatusBadRequest, false)
		return
	}

	var body cancelBody
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		utils.ResponseJSONMessage(w, "Body request tidak valid", http.StatusBadRequest, false)
		return
	}

	if err := services.CancelReservasiPetugas(id, sess.UserId, body.AlasanPembatalan); err != nil {
		respondErr(w, err)
		return
	}

	utils.ResponseJSONMessage(w, "Reservasi berhasil dibatalkan", http.StatusOK, true)
}

// Count: angka antrian untuk dashboard petugas (US 8).
func Count(w http.ResponseWriter, r *http.Request) {
	if err := repositories.SinkronisasiStatusReservasi(); err != nil {
		utils.ResponseJSONMessage(w, "Gagal menyinkronkan status reservasi", http.StatusInternalServerError, false)
		return
	}

	reservasiMenunggu, err := repositories.CountReservasiMenunggu()
	if err != nil {
		utils.ResponseJSONMessage(w, "Gagal menghitung reservasi", http.StatusInternalServerError, false)
		return
	}
	laporanBaru, err := repositories.CountLaporanBaru()
	if err != nil {
		utils.ResponseJSONMessage(w, "Gagal menghitung laporan", http.StatusInternalServerError, false)
		return
	}

	utils.ResponseJSON(w, http.StatusOK, map[string]any{
		"success": true,
		"data": map[string]any{
			"reservasi_menunggu": reservasiMenunggu,
			"laporan_baru":       laporanBaru,
		},
	})
}
