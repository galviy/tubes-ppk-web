package admin

import (
	"backend-ppk/middleware"
	"backend-ppk/repositories"
	utils "backend-ppk/utilities"
	"database/sql"
	"errors"
	"net/http"
	"strconv"
)

// Users_Status men-suspend (is_verified=0, tidak bisa login) atau
// mengaktifkan kembali (is_verified=1) akun. Menolak suspend diri sendiri
// agar admin tidak mengunci akunnya sendiri.
func Users_Status(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		utils.ResponseJSONMessage(w, "Bad Request", http.StatusBadRequest, false)
		return
	}
	rawID := r.FormValue("id")
	rawVerified := r.FormValue("is_verified")
	if rawID == "" || rawVerified == "" {
		utils.ResponseJSONMessage(w, "Missing field! (id, is_verified)", http.StatusBadRequest, false)
		return
	}
	id, err := strconv.Atoi(rawID)
	if err != nil || id <= 0 {
		utils.ResponseJSONMessage(w, "ID user tidak valid", http.StatusBadRequest, false)
		return
	}
	verified, err := strconv.Atoi(rawVerified)
	if err != nil || (verified != 0 && verified != 1) {
		utils.ResponseJSONMessage(w, "is_verified hanya 0 atau 1", http.StatusBadRequest, false)
		return
	}

	cookie, err := r.Cookie("session_id")
	if err == nil {
		if sess, ok := middleware.GetCookieInformation(cookie.Value); ok {
			if sess.UserId == id && verified == 0 {
				utils.ResponseJSONMessage(w, "Tidak bisa menonaktifkan akun sendiri", http.StatusForbidden, false)
				return
			}
		}
	}

	if err := repositories.SetUserVerified(id, verified == 1); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			utils.ResponseJSONMessage(w, "User dengan id tersebut tidak ditemukan!", http.StatusNotFound, false)
			return
		}
		utils.ResponseJSONMessage(w, "Internal server error!", http.StatusInternalServerError, false)
		return
	}
	utils.ResponseJSONMessage(w, "Berhasil memperbarui status user "+rawID, http.StatusOK, true)
}
