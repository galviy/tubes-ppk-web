package reservasi

import (
	"backend-ppk/middleware"
	"backend-ppk/models"
	"backend-ppk/repositories"
	"backend-ppk/services"
	utils "backend-ppk/utilities"
	"errors"
	"log"
	"net/http"
	"strconv"
	"strings"
)

func sesiUser(r *http.Request) (*models.Session, bool) {
	cookie, err := r.Cookie("session_id")
	if err != nil {
		return nil, false
	}
	return middleware.GetCookieInformation(cookie.Value)
}

func respondErr(w http.ResponseWriter, err error) {
	var er services.ErrReservasi
	if errors.As(err, &er) {
		utils.ResponseJSONMessage(w, er.Pesan, er.Status, false)
		return
	}
	log.Printf("reservasi error: %v", err)
	utils.ResponseJSONMessage(w, "Internal server error", http.StatusInternalServerError, false)
}

// parseAlatForm membaca banyak alat dari form urlencoded:
// alat_reservasi[]=2&jumlah_peminjaman[]=1&alat_reservasi[]=3&jumlah_peminjaman[]=2
func parseAlatForm(r *http.Request) ([]repositories.ReservasiAlatRequest, error) {
	ids := r.Form["alat_reservasi[]"]
	if len(ids) == 0 {
		ids = r.Form["alat_reservasi"]
	}
	jumlahs := r.Form["jumlah_peminjaman[]"]
	if len(jumlahs) == 0 {
		jumlahs = r.Form["jumlah_peminjaman"]
	}

	if len(ids) == 0 {
		return nil, nil
	}
	if len(jumlahs) > 0 && len(jumlahs) != len(ids) {
		return nil, services.ErrReservasi{Status: http.StatusBadRequest, Pesan: "Jumlah data alat dan jumlah peminjaman tidak cocok"}
	}

	result := make([]repositories.ReservasiAlatRequest, 0, len(ids))
	for i, idStr := range ids {
		id, err := strconv.Atoi(strings.TrimSpace(idStr))
		if err != nil || id <= 0 {
			return nil, services.ErrReservasi{Status: http.StatusBadRequest, Pesan: "ID alat tidak valid"}
		}
		jumlah := 1
		if len(jumlahs) > 0 {
			jumlah, err = strconv.Atoi(strings.TrimSpace(jumlahs[i]))
			if err != nil || jumlah <= 0 {
				return nil, services.ErrReservasi{Status: http.StatusBadRequest, Pesan: "Jumlah peminjaman tidak valid"}
			}
		}
		result = append(result, repositories.ReservasiAlatRequest{AlatId: id, Jumlah: jumlah})
	}
	return result, nil
}

func parseJumlahPeserta(r *http.Request) (*int, error) {
	nilai := strings.TrimSpace(r.FormValue("jumlah_peserta"))
	if nilai == "" {
		return nil, nil
	}
	// Hanya digit murni: Atoi masih menerima "+30" dan spasi, itu tidak boleh.
	for _, c := range nilai {
		if c < '0' || c > '9' {
			return nil, services.ErrReservasi{Status: http.StatusBadRequest, Pesan: "Jumlah peserta hanya boleh berisi angka"}
		}
	}
	n, err := strconv.Atoi(nilai)
	if err != nil {
		return nil, services.ErrReservasi{Status: http.StatusBadRequest, Pesan: "Jumlah peserta tidak valid"}
	}
	if n < 0 {
		return nil, services.ErrReservasi{Status: http.StatusBadRequest, Pesan: "Jumlah peserta tidak boleh negatif"}
	}
	return &n, nil
}
