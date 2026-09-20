package report

import (
	"backend-ppk/middleware"
	"backend-ppk/repositories"
	utils "backend-ppk/utilities"
	"database/sql"
	"errors"
	"net/http"
	"strconv"
)

func getSessionUserId(w http.ResponseWriter, r *http.Request) (int, bool) {
	cookie, err := r.Cookie("session_id")
	if err != nil {
		utils.ResponseJSONMessage(w, "Unauthorized", http.StatusUnauthorized, false)
		return 0, false
	}
	sess, ok := middleware.GetCookieInformation(cookie.Value)
	if !ok || sess.UserId <= 0 {
		utils.ResponseJSONMessage(w, "Unauthorized", http.StatusUnauthorized, false)
		return 0, false
	}
	return sess.UserId, true
}

func ListLaporan(w http.ResponseWriter, r *http.Request) {
	userId, ok := getSessionUserId(w, r)
	if !ok {
		return
	}

	list, err := repositories.ListByUser(userId)
	if err != nil {
		utils.ResponseJSONMessage(w, "Gagal mengambil daftar laporan", http.StatusInternalServerError, false)
		return
	}

	utils.ResponseJSON(w, http.StatusOK, map[string]any{
		"success": true,
		"data":    list,
	})
}

func DetailLaporan(w http.ResponseWriter, r *http.Request) {
	userId, ok := getSessionUserId(w, r)
	if !ok {
		return
	}

	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil || id <= 0 {
		utils.ResponseJSONMessage(w, "ID laporan tidak valid", http.StatusBadRequest, false)
		return
	}

	d, err := repositories.GetReportByID(id, userId)
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
