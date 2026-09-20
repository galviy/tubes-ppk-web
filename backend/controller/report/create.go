package report

import (
	"backend-ppk/middleware"
	"backend-ppk/models"
	"backend-ppk/repositories"
	"backend-ppk/services"
	utils "backend-ppk/utilities"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/google/uuid"
)

const (
	maxFotoSize   = 2 << 20 // 2MB
	uploadDir     = "uploads/reports"
	maxAlasanSize = 255
)

var allowedFotoExt = map[string]bool{
	".jpg":  true,
	".jpeg": true,
	".png":  true,
}

func CreateLaporan(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("session_id")
	if err != nil {
		utils.ResponseJSONMessage(w, "Unauthorized", http.StatusUnauthorized, false)
		return
	}
	sess, ok := middleware.GetCookieInformation(cookie.Value)
	if !ok || sess.UserId <= 0 {
		utils.ResponseJSONMessage(w, "Unauthorized", http.StatusUnauthorized, false)
		return
	}

	if err := r.ParseMultipartForm(5 << 20); err != nil {
		utils.ResponseJSONMessage(w, "Gagal membaca form", http.StatusBadRequest, false)
		return
	}

	alasan := strings.TrimSpace(r.FormValue("alasan"))
	if alasan == "" {
		utils.ResponseJSONMessage(w, "Alasan wajib diisi", http.StatusBadRequest, false)
		return
	}
	if len(alasan) > maxAlasanSize {
		utils.ResponseJSONMessage(w, "Alasan maksimal 255 karakter", http.StatusBadRequest, false)
		return
	}

	kategori := strings.TrimSpace(r.FormValue("kategori"))
	switch kategori {
	case models.Kebersihan, models.Pendingin, models.Elektronik, models.Lainnya:
	default:
		utils.ResponseJSONMessage(w, "Kategori tidak valid", http.StatusBadRequest, false)
		return
	}

	ruanganStr := strings.TrimSpace(r.FormValue("ruangan_id"))
	alatStr := strings.TrimSpace(r.FormValue("alat_id"))
	if (ruanganStr == "") == (alatStr == "") {
		utils.ResponseJSONMessage(w, "Pilih salah satu: ruangan atau alat", http.StatusBadRequest, false)
		return
	}

	var ruanganId, alatId *int
	if ruanganStr != "" {
		id, err := strconv.Atoi(ruanganStr)
		if err != nil || id <= 0 {
			utils.ResponseJSONMessage(w, "ID ruangan tidak valid", http.StatusBadRequest, false)
			return
		}
		if !repositories.CheckRuanganById(id) {
			utils.ResponseJSONMessage(w, "Ruangan tidak ditemukan", http.StatusNotFound, false)
			return
		}
		ruanganId = &id
	}
	if alatStr != "" {
		id, err := strconv.Atoi(alatStr)
		if err != nil || id <= 0 {
			utils.ResponseJSONMessage(w, "ID alat tidak valid", http.StatusBadRequest, false)
			return
		}
		if !repositories.CheckAlatById(id) {
			utils.ResponseJSONMessage(w, "Alat tidak ditemukan", http.StatusNotFound, false)
			return
		}
		alatId = &id
	}

	fotoPath := ""
	file, header, err := r.FormFile("foto")
	if err == nil {
		defer file.Close()

		if header.Size > maxFotoSize {
			utils.ResponseJSONMessage(w, "Ukuran foto maksimal 2MB", http.StatusBadRequest, false)
			return
		}
		ext := strings.ToLower(filepath.Ext(header.Filename))
		if !allowedFotoExt[ext] {
			utils.ResponseJSONMessage(w, "Format foto harus jpg, jpeg, atau png", http.StatusBadRequest, false)
			return
		}

		if err := os.MkdirAll(uploadDir, 0755); err != nil {
			utils.ResponseJSONMessage(w, "Gagal menyimpan foto", http.StatusInternalServerError, false)
			return
		}
		fotoPath = filepath.Join(uploadDir, uuid.NewString()+ext)
		dst, err := os.Create(fotoPath)
		if err != nil {
			utils.ResponseJSONMessage(w, "Gagal menyimpan foto", http.StatusInternalServerError, false)
			return
		}
		defer dst.Close()
		if _, err := io.Copy(dst, file); err != nil {
			os.Remove(fotoPath)
			utils.ResponseJSONMessage(w, "Gagal menyimpan foto", http.StatusInternalServerError, false)
			return
		}
	}

	if err := services.CreateLaporan(sess.UserId, alasan, kategori, fotoPath, ruanganId, alatId); err != nil {
		msg := err.Error()
		status := http.StatusBadRequest
		if strings.Contains(msg, "tidak ditemukan") {
			status = http.StatusNotFound
		}
		utils.ResponseJSONMessage(w, msg, status, false)
		return
	}

	utils.ResponseJSONMessage(w, "Laporan berhasil dibuat", http.StatusCreated, true)
}
