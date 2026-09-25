package tolak

import (
	"backend-ppk/repositories"
	utils "backend-ppk/utilities"
	"database/sql"
	"errors"
	"net/http"
	"strconv"
)

func parsePendingID(w http.ResponseWriter, r *http.Request, field string) (int, bool) {
	if err := r.ParseForm(); err != nil {
		utils.ResponseJSONMessage(w, "Bad Request", http.StatusBadRequest, false)
		return 0, false
	}
	raw := r.FormValue(field)
	if raw == "" {
		utils.ResponseJSONMessage(w, "You need "+field+" to peform this action!", http.StatusBadRequest, false)
		return 0, false
	}
	id, err := strconv.Atoi(raw)
	if err != nil {
		utils.ResponseJSONMessage(w, "You have to input a integer boskuh!", http.StatusBadRequest, false)
		return 0, false
	}
	return id, true
}

func Tolak_MHS(w http.ResponseWriter, r *http.Request) {
	id, ok := parsePendingID(w, r, "id_mhs")
	if !ok {
		return
	}
	if err := repositories.TolakMHS(id); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			utils.ResponseJSONMessage(w, "Data mahasiswa pending dengan id tersebut tidak ditemukan!", http.StatusNotFound, false)
			return
		}
		utils.ResponseJSONMessage(w, "Internal server error!", http.StatusInternalServerError, false)
		return
	}
	utils.ResponseJSONMessage(w, "Berhasil menolak pendaftaran mahasiswa "+strconv.Itoa(id), http.StatusOK, true)
}

func Tolak_Dosen(w http.ResponseWriter, r *http.Request) {
	id, ok := parsePendingID(w, r, "id_dosen")
	if !ok {
		return
	}
	if err := repositories.TolakDosen(id); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			utils.ResponseJSONMessage(w, "Data dosen pending dengan id tersebut tidak ditemukan!", http.StatusNotFound, false)
			return
		}
		utils.ResponseJSONMessage(w, "Internal server error!", http.StatusInternalServerError, false)
		return
	}
	utils.ResponseJSONMessage(w, "Berhasil menolak pendaftaran dosen "+strconv.Itoa(id), http.StatusOK, true)
}

func Tolak_Staff(w http.ResponseWriter, r *http.Request) {
	id, ok := parsePendingID(w, r, "id_staff")
	if !ok {
		return
	}
	if err := repositories.TolakStaff(id); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			utils.ResponseJSONMessage(w, "Data staff dengan id tersebut tidak ditemukan!", http.StatusNotFound, false)
			return
		}
		utils.ResponseJSONMessage(w, "Internal server error!", http.StatusInternalServerError, false)
		return
	}
	utils.ResponseJSONMessage(w, "Berhasil menolak pendaftaran staff "+strconv.Itoa(id), http.StatusOK, true)
}
