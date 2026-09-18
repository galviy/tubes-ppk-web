package admin

import (
	"backend-ppk/repositories"
	utils "backend-ppk/utilities"
	"net/http"
	"strconv"
)

func Show_user(w http.ResponseWriter, r *http.Request) {

	limit := 10

	if value := r.URL.Query().Get("limit"); value != "" {
		limitParsed, err := strconv.Atoi(value)

		if err != nil || limitParsed <= 0 {
			utils.ResponseJSONMessage(w, "Limit must be a positive number", http.StatusBadRequest, false)
			return
		}

		limit = limitParsed
	}

	users, err := repositories.GetUsers(limit)

	if err != nil {
		utils.ResponseJSONMessage(w, "Failed to get users", http.StatusInternalServerError, false)
		return
	}

	var response []map[string]any

	for _, user := range users {
		response = append(response, map[string]any{
			"id":       user.ID,
			"username": user.Username,
			"email":    user.Email,
			"role":     user.Role,
		})
	}

	w.Header().Set("Content-Type", "application/json")

	data := map[string]any{
		"success": true,
		"data":    response,
	}
	utils.ResponseJSON(w, http.StatusOK, data)

}
