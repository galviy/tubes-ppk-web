package user

import (
	"backend-ppk/middleware"
	"backend-ppk/models"
	"backend-ppk/repositories"
	utils "backend-ppk/utilities"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"
)

// Detail mengambil profil pengguna berdasarkan ID.
// Hanya bisa diakses oleh admin, petugas, atau pengguna pemilik akun.
func Detail(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("session_id")
	if err != nil {
		utils.ResponseJSONMessage(w, "Unauthorized", http.StatusUnauthorized, false)
		return
	}
	sess, ok := middleware.GetCookieInformation(cookie.Value)
	if !ok {
		utils.ResponseJSONMessage(w, "Unauthorized", http.StatusUnauthorized, false)
		return
	}

	idStr := r.PathValue("id")
	id, err := strconv.Atoi(idStr)
	if err != nil || id <= 0 {
		utils.ResponseJSONMessage(w, "ID user tidak valid", http.StatusBadRequest, false)
		return
	}

	// Cek otorisasi
	if sess.Role != middleware.RoleAdmin && sess.Role != middleware.RolePetugas && sess.UserId != id {
		utils.ResponseJSONMessage(w, "Forbidden: Anda tidak memiliki akses ke profil ini", http.StatusForbidden, false)
		return
	}

	userDetail, err := repositories.GetUserProfileByID(id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			utils.ResponseJSONMessage(w, "User tidak ditemukan", http.StatusNotFound, false)
			return
		}
		utils.ResponseJSONMessage(w, "Gagal mengambil data user", http.StatusInternalServerError, false)
		return
	}

	utils.ResponseJSON(w, http.StatusOK, map[string]any{
		"success": true,
		"data":    userDetail,
	})
}

// Update mengubah data profil pengguna.
// Hanya bisa diakses oleh admin atau pemilik akun sendiri.
func Update(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("session_id")
	if err != nil {
		utils.ResponseJSONMessage(w, "Unauthorized", http.StatusUnauthorized, false)
		return
	}
	sess, ok := middleware.GetCookieInformation(cookie.Value)
	if !ok {
		utils.ResponseJSONMessage(w, "Unauthorized", http.StatusUnauthorized, false)
		return
	}

	idStr := r.PathValue("id")
	id, err := strconv.Atoi(idStr)
	if err != nil || id <= 0 {
		utils.ResponseJSONMessage(w, "ID user tidak valid", http.StatusBadRequest, false)
		return
	}

	if sess.Role != middleware.RoleAdmin && sess.UserId != id {
		utils.ResponseJSONMessage(w, "Forbidden: Anda tidak memiliki akses untuk mengubah profil ini", http.StatusForbidden, false)
		return
	}

	var req models.UpdateUserRequest
	contentType := r.Header.Get("Content-Type")

	if strings.Contains(contentType, "application/json") {
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			utils.ResponseJSONMessage(w, "Body JSON tidak valid", http.StatusBadRequest, false)
			return
		}
	} else {
		_ = r.ParseForm()
		req.NamaLengkap = strings.TrimSpace(r.FormValue("nama_lengkap"))
		req.Email = strings.TrimSpace(r.FormValue("email"))
		req.Password = strings.TrimSpace(r.FormValue("password"))
		if a, err := strconv.Atoi(r.FormValue("angkatan")); err == nil {
			req.Angkatan = a
		}
	}

	if err := repositories.UpdateUserProfile(id, req); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			utils.ResponseJSONMessage(w, "User tidak ditemukan", http.StatusNotFound, false)
			return
		}
		if utils.IsDuplicateEntry(err) {
			utils.ResponseJSONMessage(w, "Email sudah terdaftar di database kita!", http.StatusConflict, false)
			return
		}
		utils.ResponseJSONMessage(w, err.Error(), http.StatusBadRequest, false)
		return
	}

	utils.ResponseJSONMessage(w, "Profil berhasil diperbarui", http.StatusOK, true)
}

// UpdateStatus mengubah status aktif/nonaktif akun (isVerified) via RESTful PATCH /users/{id}/status.
// Hanya bisa diakses oleh admin.
func UpdateStatus(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("session_id")
	if err != nil {
		utils.ResponseJSONMessage(w, "Unauthorized", http.StatusUnauthorized, false)
		return
	}
	sess, ok := middleware.GetCookieInformation(cookie.Value)
	if !ok || sess.Role != middleware.RoleAdmin {
		utils.ResponseJSONMessage(w, "you are not authorized to access this content", http.StatusUnauthorized, false)
		return
	}

	idStr := r.PathValue("id")
	id, err := strconv.Atoi(idStr)
	if err != nil || id <= 0 {
		utils.ResponseJSONMessage(w, "ID user tidak valid", http.StatusBadRequest, false)
		return
	}

	var isVerified bool
	var found bool

	contentType := r.Header.Get("Content-Type")
	if strings.Contains(contentType, "application/json") {
		var body map[string]any
		if err := json.NewDecoder(r.Body).Decode(&body); err == nil {
			if v, ok := body["is_verified"]; ok {
				found = true
				switch val := v.(type) {
				case bool:
					isVerified = val
				case float64:
					isVerified = val == 1
				case string:
					isVerified = val == "1" || strings.ToLower(val) == "aktif" || strings.ToLower(val) == "true"
				}
			} else if v, ok := body["status"]; ok {
				found = true
				str := strings.ToLower(fmt.Sprintf("%v", v))
				isVerified = str == "1" || str == "aktif" || str == "true"
			}
		}
	} else {
		_ = r.ParseForm()
		rawVerified := r.FormValue("is_verified")
		rawStatus := r.FormValue("status")
		if rawVerified != "" {
			found = true
			isVerified = rawVerified == "1" || rawVerified == "true"
		} else if rawStatus != "" {
			found = true
			isVerified = rawStatus == "1" || strings.ToLower(rawStatus) == "aktif" || rawStatus == "true"
		}
	}

	if !found {
		utils.ResponseJSONMessage(w, "Missing field! (is_verified atau status)", http.StatusBadRequest, false)
		return
	}

	if sess.UserId == id && !isVerified {
		utils.ResponseJSONMessage(w, "Tidak bisa menonaktifkan akun sendiri", http.StatusForbidden, false)
		return
	}

	if err := repositories.SetUserVerified(id, isVerified); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			utils.ResponseJSONMessage(w, "User dengan id tersebut tidak ditemukan!", http.StatusNotFound, false)
			return
		}
		utils.ResponseJSONMessage(w, "Internal server error!", http.StatusInternalServerError, false)
		return
	}

	utils.ResponseJSONMessage(w, "Berhasil memperbarui status user "+idStr, http.StatusOK, true)
}
