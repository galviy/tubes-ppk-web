package reservasi

import (
	"backend-ppk/middleware"
	"backend-ppk/models"
	"backend-ppk/repositories"
	utils "backend-ppk/utilities"
	"net/http"
	"strconv"
	"strings"
)

func listReservasi(w http.ResponseWriter, r *http.Request, tipe string) {
	sess, ok := sesiUser(r)
	if !ok || sess.UserId <= 0 {
		utils.ResponseJSONMessage(w, "Unauthorized", http.StatusUnauthorized, false)
		return
	}

	var userId *int
	switch sess.Role {
	case middleware.RolePengguna:
		id := sess.UserId
		userId = &id
	case middleware.RolePetugas, middleware.RoleAdmin:
		userId = nil
	default:
		utils.ResponseJSONMessage(w, "Forbidden", http.StatusForbidden, false)
		return
	}

	if err := repositories.SinkronisasiStatusReservasi(); err != nil {
		utils.ResponseJSONMessage(w, "Gagal menyinkronkan status reservasi", http.StatusInternalServerError, false)
		return
	}

	filter := repositories.ReservasiFilter{
		UserId: userId,
		Tipe:   tipe,
		Limit:  20,
		Offset: 0,
	}

	if nilai := strings.TrimSpace(r.URL.Query().Get("status")); nilai != "" {
		kode, valid := models.ReservasiStatusDariIndonesia(nilai)
		if !valid {
			utils.ResponseJSONMessage(w, "Status reservasi tidak valid", http.StatusBadRequest, false)
			return
		}
		filter.Status = kode
	}

	limit, err := strconv.Atoi(strings.TrimSpace(r.URL.Query().Get("limit")))
	if r.URL.Query().Get("limit") != "" && (err != nil || limit <= 0) {
		utils.ResponseJSONMessage(w, "Limit harus angka positif", http.StatusBadRequest, false)
		return
	}
	if limit > 0 {
		if limit > 100 {
			limit = 100
		}
		filter.Limit = limit
	}

	page := 1
	if nilai := strings.TrimSpace(r.URL.Query().Get("page")); nilai != "" {
		p, err := strconv.Atoi(nilai)
		if err != nil || p <= 0 {
			utils.ResponseJSONMessage(w, "Page harus angka positif", http.StatusBadRequest, false)
			return
		}
		page = p
	}
	if page > 1 {
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
		"limit":   filter.Limit,
		"page":    page,
	})
}

// ListReservasi: seluruh reservasi (ruangan & alat) milik pengguna/petugas.
func ListReservasi(w http.ResponseWriter, r *http.Request) {
	listReservasi(w, r, "")
}

// ListRuangan: hanya reservasi yang memakai ruangan.
func ListRuangan(w http.ResponseWriter, r *http.Request) {
	listReservasi(w, r, models.TipeFasilitasRuangan)
}

// ListAlat: hanya reservasi yang memakai alat.
func ListAlat(w http.ResponseWriter, r *http.Request) {
	listReservasi(w, r, models.TipeFasilitasAlat)
}

// DetailReservasi: satu reservasi lengkap dengan riwayat status.
func DetailReservasi(w http.ResponseWriter, r *http.Request) {
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

	if err := repositories.SinkronisasiStatusReservasi(); err != nil {
		utils.ResponseJSONMessage(w, "Gagal menyinkronkan status reservasi", http.StatusInternalServerError, false)
		return
	}

	reservasi, ada, err := repositories.GetReservasiById(id)
	if err != nil {
		utils.ResponseJSONMessage(w, "Gagal mengambil reservasi", http.StatusInternalServerError, false)
		return
	}
	if !ada {
		utils.ResponseJSONMessage(w, "Reservasi tidak ditemukan", http.StatusNotFound, false)
		return
	}
	if sess.Role == middleware.RolePengguna && reservasi.UserId != sess.UserId {
		utils.ResponseJSONMessage(w, "Reservasi tidak ditemukan", http.StatusNotFound, false)
		return
	}

	utils.ResponseJSON(w, http.StatusOK, map[string]any{
		"success": true,
		"data":    reservasi,
	})
}
