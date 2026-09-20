package admin

import (
	"backend-ppk/repositories"
	utils "backend-ppk/utilities"
	"net/http"
	"strconv"
)

func Show_staff_pending(w http.ResponseWriter, r *http.Request) {

	limit := 10

	if value := r.URL.Query().Get("limit"); value != "" {
		limitParsed, err := strconv.Atoi(value)

		if err != nil || limitParsed <= 0 {
			utils.ResponseJSONMessage(w, "Limit must be a positive number", http.StatusBadRequest, false)
			return
		}

		limit = limitParsed
	}

	users, err := repositories.GetStaffPending(limit)

	if err != nil {
		utils.ResponseJSONMessage(w, "Failed to get users", http.StatusInternalServerError, false)
		return
	}

	var response []map[string]any
	/*

		&user.ID,
		&user.nip,
		&user.nama_lengkap,
		&user.email,

	*/
	for _, user := range users {
		response = append(response, map[string]any{
			"id":           user.ID,
			"nip":          user.Nip,
			"nama_lengkap": user.Nama_lengkap,
			"email":        user.Email,
		})
	}
	/*
		UPDATE user
		SET isVerified = 1, user_role = 1
		WHERE email = 'galvindoser@gmail.com';

	*/

	w.Header().Set("Content-Type", "application/json")

	data := map[string]any{
		"success": true,
		"data":    response,
	}
	utils.ResponseJSON(w, http.StatusOK, data)

}
