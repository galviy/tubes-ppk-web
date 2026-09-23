package reservasi

import (
	"backend-ppk/middleware"
	"backend-ppk/repositories"
	utils "backend-ppk/utilities"
	"log"
	"net/http"
	"strconv"
)

func Show_Reservasi(w http.ResponseWriter, r *http.Request) {

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
	sess, ok := middleware.GetCookieInformation(cookie.Value)

	userID := sess.UserId

	if !ok || userID <= 0 {
		utils.ResponseJSONMessage(w, "Unauthorized", http.StatusUnauthorized, false)
		return
	}

	users, err := repositories.GetReservasiByID(userID, limit)

	if err != nil {
		log.Printf("ada error cuy: %v", err)
		utils.ResponseJSONMessage(w, "Failed to get users", http.StatusInternalServerError, false)
		return
	}

	var response []map[string]any
	/*
			ID                       int
		Waktu_reservasi_dibuat   string
		Waktu_peminjaman         string
		Waktu_peminjaman_selesai string
		Status_reservasi         string
	*/
	for _, user := range users {

		response = append(response, map[string]any{
			"id":                       user.ID,
			"Waktu_reservasi_dibuat":   user.Waktu_reservasi_dibuat,
			"Waktu_peminjaman":         user.Waktu_peminjaman,
			"Waktu_peminjaman_selesai": user.Waktu_peminjaman_selesai,
			"Status_reservasi":         user.Status_reservasi,
			"Ruangan_reservasi":        user.Ruangan_reservasi,
			"Alasan_penolakan":         user.Alasan_penolakan,
			"Alasan_peminjaman":        user.Alasan_peminjaman,
		})
	}
	/*
		UPDATE user
		SET isVerified = 1, user_role = 1
		WHERE email = 'galvindoser@gmail.com';

	*/

	data := map[string]any{
		"success": true,
		"data":    response,
	}
	utils.ResponseJSON(w, http.StatusOK, data)

}
