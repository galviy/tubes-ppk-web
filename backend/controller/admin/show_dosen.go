package admin

import (
	"backend-ppk/repositories"
	utils "backend-ppk/utilities"
	"log"
	"net/http"
	"strconv"
)

func Show_dosen(w http.ResponseWriter, r *http.Request) {

	limit := 10

	if value := r.URL.Query().Get("limit"); value != "" {
		if value == "" {
			utils.ResponseJSONMessage(w, "Invalid limit id???", http.StatusBadRequest, false)
			return
		}
		limitParsed, err := strconv.Atoi(value)

		if err != nil || limitParsed <= 0 {
			utils.ResponseJSONMessage(w, "Limit must be a positive number", http.StatusBadRequest, false)
			return
		}

		limit = limitParsed
		log.Printf("hasil woy -> %d", limitParsed)
	}

	users, err := repositories.GetDosen(limit)

	if err != nil {
		utils.ResponseJSONMessage(w, "Failed to get users", http.StatusInternalServerError, false)
		return
	}

	var response []map[string]any
	/*
		err := rows.Scan(
			&user.ID,
			&user.Nidn,
			&user.Nama_lengkap,
			&user.Prodi_dosen,
		)
	*/
	for _, user := range users {
		response = append(response, map[string]any{
			"id":           user.ID,
			"nidn":         user.Nidn,
			"nama_lengkap": user.Nama_lengkap,
			"prodi_dosen":  user.Prodi_dosen,
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
