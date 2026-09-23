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

func Create_reservasi(w http.ResponseWriter, r *http.Request) {

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
	ruangan := r.FormValue("ruangan_reservasi")
	waktuMulai := r.FormValue("waktu_peminjaman")
	waktuSelesai := r.FormValue("waktu_peminjaman_selesai")
	alasan_peminjaman := r.FormValue("alasan_peminjaman")

	if ruangan == "" || waktuMulai == "" || waktuSelesai == "" || alasan_peminjaman == "" {
		utils.ResponseJSONMessage(w, "Missing field!", http.StatusBadRequest, false)
		return
	}
	if len(alasan_peminjaman) > 255 {
		utils.ResponseJSONMessage(w, "Alasan kamu terlalu panjang!", http.StatusBadRequest, false)
		return
	}

	// Parse ID
	ruanganID, err := strconv.Atoi(ruangan)
	if err != nil {
		utils.ResponseJSONMessage(w, "ID Ruangan tidak Valid!!", http.StatusUnauthorized, false)
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

	// Cek apakah ruangan ada
	if !repositories.CheckRuanganById(ruanganID) {
		utils.ResponseJSONMessage(w, "Ruangan tidak ditemukan!", http.StatusNotFound, false)
		return
	}

	// Cek apakah user ada
	if !repositories.IsUserIDExist(userID) {
		utils.ResponseJSONMessage(w, "User tidak ditemukan!", http.StatusNotFound, false)
		return
	}

	// CEK BENTROK JADWAL
	exist, err := repositories.IsReservasiBentrok(ruanganID, startTime, endTime)

	if err != nil {
		log.Printf("Gagal mengecek bentrok reservasi: %v", err)

		utils.ResponseJSONMessage(w, "Internal server error", http.StatusInternalServerError, false)
		return
	}

	if exist {
		utils.ResponseJSONMessage(w, "Ruangan sudah digunakan pada waktu tersebut!", http.StatusConflict, false)
		return
	}

	// INSERT RESERVASI
	err = repositories.CreateReservasi(ruanganID, userID, startTime, endTime, alasan_peminjaman)

	if err != nil {
		log.Printf("Gagal membuat reservasi: %v", err)

		utils.ResponseJSONMessage(w, "Internal server error", http.StatusInternalServerError, false)
		return
	}

	utils.ResponseJSONMessage(w, "Reservasi berhasil dibuat!", http.StatusCreated, true)
}
