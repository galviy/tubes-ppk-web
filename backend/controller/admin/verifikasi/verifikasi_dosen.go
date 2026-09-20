package verifikasi

import (
	"backend-ppk/repositories"
	utils "backend-ppk/utilities"
	"database/sql"
	"errors"
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
	err_verif := repositories.Verif_Dosen(id_dosen_convert)
	if err_verif != nil {
		log.Printf("Error verifying dosen: %v", err_verif)
		if errors.Is(err_verif, sql.ErrNoRows) {
			utils.ResponseJSONMessage(w, "Data dosen pending dengan id tersebut tidak ditemukan!", http.StatusNotFound, false)
			return
		}
		if utils.IsDuplicateEntry(err_verif) {
			utils.ResponseJSONMessage(w, "nidn tersebut sudah pernah terverifikasi!", http.StatusConflict, false)
			return
		}
		utils.ResponseJSONMessage(w, "Internal server error!", http.StatusInternalServerError, false)
		return
	}
	utils.ResponseJSONMessage(w, "Berhasil melakukan verifikasi user dosen "+id_dosen, http.StatusOK, true)
}
