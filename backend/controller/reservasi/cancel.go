package reservasi

import (
	"backend-ppk/services"
	utils "backend-ppk/utilities"
	"encoding/json"
	"net/http"
	"strconv"
)

type cancelBody struct {
	AlasanPembatalan string `json:"alasan_pembatalan"`
}

// CancelReservasi: pengguna membatalkan reservasi miliknya sendiri.
func CancelReservasi(w http.ResponseWriter, r *http.Request) {
	sess, ok := sesiUser(r)
	if !ok || sess.UserId <= 0 {
		utils.ResponseJSONMessage(w, "Unauthorized", http.StatusUnauthorized, false)
		return
	}

	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil || id <= 0 {
		utils.ResponseJSONMessage(w, "ID reservasi tidak valid", http.StatusBadRequest, false)
		return
	}

	var body cancelBody
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		utils.ResponseJSONMessage(w, "Body request tidak valid", http.StatusBadRequest, false)
		return
	}

	if err := services.CancelReservasiPengguna(id, sess.UserId, body.AlasanPembatalan); err != nil {
		respondErr(w, err)
		return
	}

	utils.ResponseJSONMessage(w, "Reservasi berhasil dibatalkan", http.StatusOK, true)
}
