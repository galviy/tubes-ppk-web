package reservasi

import (
	"backend-ppk/middleware"
	"backend-ppk/repositories"
	utils "backend-ppk/utilities"
	"log"
	"net/http"
	"strconv"
)

func Show_Reservasi_Alat(w http.ResponseWriter, r *http.Request) {

	limit := 10

	if value := r.URL.Query().Get("limit"); value != "" {
		limitParsed, err := strconv.Atoi(value)

		if err != nil || limitParsed <= 0 {
			utils.ResponseJSONMessage(w, "Limit must be a positive number", http.StatusBadRequest, false)
			return
		}

		limit = limitParsed
	}

	cookie, err := r.Cookie("session_id")
	if err != nil {
		utils.ResponseJSONMessage(w, "Unauthorized", http.StatusUnauthorized, false)
		return
	}

	sess, ok := middleware.GetCookieInformation(cookie.Value)

	if !ok || sess.UserId <= 0 {
		utils.ResponseJSONMessage(w, "Unauthorized", http.StatusUnauthorized, false)
		return
	}

	userID := sess.UserId

	users, err := repositories.GetReservasiAlatByID(userID, limit)

	if err != nil {
		log.Printf("ada error cuy: %v", err)
		utils.ResponseJSONMessage(w, "Failed to get users", http.StatusInternalServerError, false)
		return
	}

	var response []map[string]any

	for _, user := range users {

		response = append(response, map[string]any{
			"id":                       user.ID,
			"Waktu_reservasi_dibuat":   user.Waktu_reservasi_dibuat,
			"Waktu_peminjaman":         user.Waktu_peminjaman,
			"Waktu_peminjaman_selesai": user.Waktu_peminjaman_selesai,
			"Status_reservasi":         user.Status_reservasi,
			"Alat_reservasi":           user.Alat_reservasi,
			"Jumlah":                   user.Jumlah,
			"Alasan_penolakan":         user.Alasan_penolakan,
			"Alasan_peminjaman":        user.Alasan_peminjaman,
		})
	}

	data := map[string]any{
		"success": true,
		"data":    response,
	}

	utils.ResponseJSON(w, http.StatusOK, data)
}
