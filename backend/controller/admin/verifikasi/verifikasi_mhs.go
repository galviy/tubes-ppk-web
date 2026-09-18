package verifikasi

import (
	"backend-ppk/repositories"
	utils "backend-ppk/utilities"
	"net/http"
	"strconv"
)

func Verifikasi_MHS(w http.ResponseWriter, r *http.Request) {
	err := r.ParseForm()
	if err != nil {
		utils.ResponseJSONMessage(w, "Bad Request", http.StatusBadRequest, false)
		return
	}
	id_mhs := r.FormValue("id_mhs")
	if id_mhs == "" {
		utils.ResponseJSONMessage(w, "You need id_mhs to peform this action!", http.StatusBadRequest, false)
		return
	}
	id_mhs_convert, err_conv := strconv.Atoi(id_mhs)
	if err_conv != nil {
		utils.ResponseJSONMessage(w, "You have to input a integer boskuh!", http.StatusBadRequest, false)
		return
	}
	cek_exist, err := repositories.IsNimExist(id_mhs_convert)
	if err != nil {
		utils.ResponseJSONMessage(w, "You need id_mhs to peform this action!", http.StatusForbidden, false)
		return
	}
	if cek_exist {
		utils.ResponseJSONMessage(w, "Nim tersebut sudah pernah terverifikasi!", http.StatusForbidden, false)
		return
	}
	err_verif := repositories.Verif_MHS(id_mhs_convert)
	if err_verif != nil {
		utils.ResponseJSONMessage(w, "Internal server error!", http.StatusInternalServerError, false)
		return
	}
	utils.ResponseJSONMessage(w, "Berhasil melakukan verifikasi user "+id_mhs, http.StatusOK, false)
}
