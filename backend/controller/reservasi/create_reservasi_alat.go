package reservasi

import (
	"backend-ppk/middleware"
	"backend-ppk/repositories"
	utils "backend-ppk/utilities"
	"log"
	"net/http"
	"strconv"
	"time"
)

func Create_reservasi_alat(w http.ResponseWriter, r *http.Request) {

	err := r.ParseForm()
	if err != nil {
		utils.ResponseJSONMessage(w, "Bad Request", http.StatusBadRequest, false)
		return
	}
	cookie, err := r.Cookie("session_id")
	sess, ok := middleware.GetCookieInformation(cookie.Value)
	userID := sess.UserId
	if !ok || userID <= 0 {
		utils.ResponseJSONMessage(w, "Unauthorized", http.StatusUnauthorized, false)
		return
	}
	alat := r.FormValue("alat_reservasi")
	waktuMulai := r.FormValue("waktu_peminjaman")
	waktuSelesai := r.FormValue("waktu_peminjaman_selesai")
	alasan_peminjaman := r.FormValue("alasan_peminjaman")
	jumlah := r.FormValue("jumlah_peminjaman")

	if alat == "" || waktuMulai == "" || waktuSelesai == "" || alasan_peminjaman == "" {
		utils.ResponseJSONMessage(w, "Missing field!", http.StatusBadRequest, false)
		return
	}
	if len(alasan_peminjaman) > 255 {
		utils.ResponseJSONMessage(w, "Alasan kamu terlalu panjang!", http.StatusBadRequest, false)
		return
	}

	// Parse ID
	alatID, err := strconv.Atoi(alat)
	if err != nil {
		utils.ResponseJSONMessage(w, "ID Alat tidak Valid!!", http.StatusUnauthorized, false)
		return
	}
	jumlahh, err := strconv.Atoi(jumlah)
	if err != nil {
		utils.ResponseJSONMessage(w, "Jumlah nya gak valid bos!", http.StatusUnauthorized, false)
		return
	}
	if jumlahh < 0 {
		utils.ResponseJSONMessage(w, "Jumlah nya harus lebih dari nol!", http.StatusUnauthorized, false)
		return
	}

	// Parsde atetime
	layout := "2006-01-02 15:04:05"

	startTime, err := time.Parse(layout, waktuMulai)
	if err != nil {
		utils.ResponseJSONMessage(w, "Format waktu peminjaman tidak valid! Gunakan YYYY-MM-DD HH:MM:SS", http.StatusBadRequest, false)
		return
	}

	endTime, err := time.Parse(layout, waktuSelesai)
	if err != nil {
		utils.ResponseJSONMessage(w, "Format waktu selesai tidak valid! Gunakan YYYY-MM-DD HH:MM:SS", http.StatusBadRequest, false)
		return
	}
	operasionalMulai := 7 * 60
	operasionalSelesai := 20 * 60

	startMinutes := startTime.Hour()*60 + startTime.Minute()
	endMinutes := endTime.Hour()*60 + endTime.Minute()

	// Cek berada dalam jam operasional
	if startMinutes < operasionalMulai || endMinutes > operasionalSelesai {

		utils.ResponseJSONMessage(w, "Reservasi hanya dapat dilakukan pada jam 07:00 - 20:00!", http.StatusBadRequest, false)
		return
	}

	if startTime.Minute()%30 != 0 || endTime.Minute()%30 != 0 || startTime.Second() != 0 || endTime.Second() != 0 {

		utils.ResponseJSONMessage(w, "Waktu reservasi harus menggunakan slot 30 menit!", http.StatusBadRequest, false)
		return
	}

	// Waktu selesai harus setelah waktu mulai
	if !endTime.After(startTime) {
		utils.ResponseJSONMessage(w, "Waktu selesai harus setelah waktu mulai!", http.StatusBadRequest, false)
		return
	}

	if !repositories.CheckAlatByID(alatID) {
		utils.ResponseJSONMessage(w, "Alat tidak ditemukan!", http.StatusNotFound, false)
		return
	}
	if !repositories.IsAlatAvailable(alatID) {
		utils.ResponseJSONMessage(w, "Alat tidak tersedia saat ini!", http.StatusNotFound, false)
		return
	}

	// Cek apakah user ada
	if !repositories.IsUserIDExist(userID) {
		utils.ResponseJSONMessage(w, "User tidak ditemukan!", http.StatusNotFound, false)
		return
	}

	// INSERT RESERVASI
	//func CreateReservasiAlat(alatID int, jumlah int, userID int, waktuMulai time.Time, waktuSelesai time.Time, alasan string) error {

	err = repositories.CreateReservasiAlat(alatID, jumlahh, userID, startTime, endTime, alasan_peminjaman)

	if err != nil {
		log.Printf("Gagal membuat reservasi: %v", err)

		utils.ResponseJSONMessage(w, "Internal server error", http.StatusInternalServerError, false)
		return
	}

	utils.ResponseJSONMessage(w, "Reservasi berhasil dibuat!", http.StatusCreated, true)
}
