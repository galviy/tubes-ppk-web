package verifikasi

import (
	"backend-ppk/repositories"
	utils "backend-ppk/utilities"
	"log"
	"net/http"
	"strconv"
)

func Verifikasi_dosen(w http.ResponseWriter, r *http.Request) {
	err := r.ParseForm()
	if err != nil {
		utils.ResponseJSONMessage(w, "Bad Request", http.StatusBadRequest, false)
		return
	}
	id_dosen := r.FormValue("id_dosen")
	if id_dosen == "" {
		utils.ResponseJSONMessage(w, "You need id_dosen to peform this action!", http.StatusBadRequest, false)
		return
	}
	id_dosen_convert, err_conv := strconv.Atoi(id_dosen)
	if err_conv != nil {
		utils.ResponseJSONMessage(w, "You have to input a integer boskuh!", http.StatusBadRequest, false)
		return
	}
	cek_exist, err := repositories.IsNidnExist(id_dosen_convert)
	if err != nil {
		utils.ResponseJSONMessage(w, "You need id_dosen to peform this action!", http.StatusForbidden, false)
		return
	}
	if cek_exist {
		utils.ResponseJSONMessage(w, "nidn tersebut sudah pernah terverifikasi!", http.StatusForbidden, false)
		return
	}
	err_verif := repositories.Verif_Dosen(id_dosen_convert)
	if err_verif != nil {
		log.Printf("Error verifying student: %v", err_verif)
		utils.ResponseJSONMessage(w, "Internal server error!", http.StatusInternalServerError, false)
		return
	}
	utils.ResponseJSONMessage(w, "Berhasil melakukan verifikasi user "+id_dosen, http.StatusOK, false)
}
