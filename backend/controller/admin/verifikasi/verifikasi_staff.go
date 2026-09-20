package verifikasi

import (
	"backend-ppk/repositories"
	utils "backend-ppk/utilities"
	"database/sql"
	"errors"
	"net/http"
	"strconv"
)

func Verifikasi_Staff(w http.ResponseWriter, r *http.Request) {
	err := r.ParseForm()
	if err != nil {
		utils.ResponseJSONMessage(w, "Bad Request", http.StatusBadRequest, false)
		return
	}
	id_staff := r.FormValue("id_staff")
	if id_staff == "" {
		utils.ResponseJSONMessage(w, "You need id_staff to peform this action!", http.StatusBadRequest, false)
		return
	}
	id_staff_convert, err_conv := strconv.Atoi(id_staff)
	if err_conv != nil {
		utils.ResponseJSONMessage(w, "You have to input a integer boskuh!", http.StatusBadRequest, false)
		return
	}

	err_verif := repositories.Verifikasi_Staff(id_staff_convert)
	if err_verif != nil {
		if errors.Is(err_verif, sql.ErrNoRows) {
			utils.ResponseJSONMessage(w, "Data staff dengan id tersebut tidak ditemukan!", http.StatusNotFound, false)
			return
		}
		if errors.Is(err_verif, repositories.ErrAlreadyVerified) {
			utils.ResponseJSONMessage(w, "Staff tersebut sudah pernah terverifikasi!", http.StatusConflict, false)
			return
		}
		utils.ResponseJSONMessage(w, "Internal server error!", http.StatusInternalServerError, false)
		return
	}
	utils.ResponseJSONMessage(w, "Berhasil melakukan verifikasi user staff "+id_staff, http.StatusOK, true)
}
