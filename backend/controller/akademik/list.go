package akademik

import (
	"backend-ppk/services"
	utils "backend-ppk/utilities"
	"net/http"
)

// ListFakultas menampilkan fakultas beserta prodi di bawahnya.
func ListFakultas(w http.ResponseWriter, r *http.Request) {
	list, err := services.ListFakultasDenganProdi()
	if err != nil {
		utils.ResponseJSONMessage(w, "Gagal mengambil daftar fakultas", http.StatusInternalServerError, false)
		return
	}

	utils.ResponseJSON(w, http.StatusOK, map[string]any{
		"success": true,
		"data":    list,
	})
}

// ListProdi menampilkan daftar prodi beserta fakultasnya.
func ListProdi(w http.ResponseWriter, r *http.Request) {
	list, err := services.ListProdi()
	if err != nil {
		utils.ResponseJSONMessage(w, "Gagal mengambil daftar prodi", http.StatusInternalServerError, false)
		return
	}

	utils.ResponseJSON(w, http.StatusOK, map[string]any{
		"success": true,
		"data":    list,
	})
}
