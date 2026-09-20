package verifikasi

import (
	"backend-ppk/repositories"
	utils "backend-ppk/utilities"
	"database/sql"
	"errors"
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

	err_verif := repositories.Verif_MHS(id_mhs_convert)
	if err_verif != nil {
		if errors.Is(err_verif, sql.ErrNoRows) {
			utils.ResponseJSONMessage(w, "Data mahasiswa pending dengan id tersebut tidak ditemukan!", http.StatusNotFound, false)
			return
		}
		if utils.IsDuplicateEntry(err_verif) {
			utils.ResponseJSONMessage(w, "Nim tersebut sudah pernah terverifikasi!", http.StatusConflict, false)
			return
		}
		utils.ResponseJSONMessage(w, "Internal server error!", http.StatusInternalServerError, false)
		return
	}
	utils.ResponseJSONMessage(w, "Berhasil melakukan verifikasi user mahasiswa "+id_mhs, http.StatusOK, true)
}
