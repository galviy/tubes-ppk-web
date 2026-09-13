package utils

import (
	"encoding/json"
	"net/http"
)

func ResponseJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	json.NewEncoder(w).Encode(data)
}

func ResponseJSONMessage(w http.ResponseWriter, message string, status int, succecss bool) {
	data := map[string]any{
		"success": succecss,
		"message": message,
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)

}
