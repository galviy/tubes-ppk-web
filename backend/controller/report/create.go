package report

import (
	"backend-ppk/middleware"
	"backend-ppk/models"
	"backend-ppk/repositories"
	"backend-ppk/services"
	utils "backend-ppk/utilities"
	"encoding/base64"
	"encoding/json"
	"io"
	"net/http"
	"strconv"
	"strings"
)

const (
	maxFotoSize   = 2 << 20 // 2MB (ukuran binary hasil decode)
	maxAlasanSize = 255
	// Batas kasar panjang string base64: 2MB binary ~= 2.8MB base64.
	// Ditolak lebih awal agar tidak membebani decoder / DB.
	maxFotoBase64Len = 4 << 20 // 4MB karakter
)

var allowedFotoMime = map[string]string{
	"image/jpeg": ".jpg",
	"image/png":  ".png",
}

// normalizeFotoBase64 menerima data-URL ("data:image/jpeg;base64,..."),
// base64 mentah, atau string kosong (foto opsional).
// Mengembalikan data-URL kanonis "data:<mime>;base64,<payload>"
// yang siap disimpan langsung di kolom report.foto (TEXT).
func normalizeFotoBase64(input string) (string, bool) {
	s := strings.TrimSpace(input)
	if s == "" || s == "null" || s == "undefined" {
		return "", true
	}
	mime := ""
	payload := s
	if strings.HasPrefix(s, "data:") {
		comma := strings.Index(s, ",")
		if comma < 0 {
			return "", false
		}
		header := s[:comma]
		payload = s[comma+1:]
		// header: data:image/jpeg;base64  (toleran tanpa ";base64")
		rest := strings.TrimPrefix(header, "data:")
		parts := strings.Split(rest, ";")
		mime = strings.ToLower(strings.TrimSpace(parts[0]))
	}
	payload = strings.TrimSpace(payload)
	// Buang whitespace yang kadang ikut dari form/JSON.
	payload = strings.ReplaceAll(payload, "\n", "")
	payload = strings.ReplaceAll(payload, "\r", "")
	payload = strings.ReplaceAll(payload, " ", "")

	if len(payload) == 0 {
		return "", true
	}
	if len(payload) > maxFotoBase64Len {
		return "", false
	}
	raw, err := base64.StdEncoding.DecodeString(payload)
	if err != nil {
		// Coba URL-encoding variant.
		raw, err = base64.URLEncoding.DecodeString(payload)
		if err != nil {
			raw, err = base64.RawStdEncoding.DecodeString(payload)
			if err != nil {
				return "", false
			}
		}
	}
	if len(raw) == 0 || len(raw) > maxFotoSize {
		return "", false
	}
	detected := http.DetectContentType(raw)
	if _, ok := allowedFotoMime[detected]; !ok {
		return "", false
	}
	// Kanoniskan mime dari byte aktual (bukan klaim header).
	if mime != "image/jpeg" && mime != "image/png" && mime != "image/jpg" {
		mime = detected
	} else if mime == "image/jpg" {
		mime = "image/jpeg"
	}
	// Re-encode kanonis agar yang tersimpan selalu valid.
	canonical := "data:" + mime + ";base64," + base64.StdEncoding.EncodeToString(raw)
	return canonical, true
}

// encodeBytesToDataURL dipakai untuk upload file biner (multipart field "foto").
func encodeBytesToDataURL(raw []byte) (string, bool) {
	if len(raw) == 0 || len(raw) > maxFotoSize {
		return "", false
	}
	detected := http.DetectContentType(raw)
	if _, ok := allowedFotoMime[detected]; !ok {
		return "", false
	}
	return "data:" + detected + ";base64," + base64.StdEncoding.EncodeToString(raw), true
}

type laporanInput struct {
	Alasan    string
	Kategori  string
	RuanganID *int
	AlatID    *int
	Foto      string
}

func parseLaporanInput(r *http.Request) (laporanInput, string) {
	var in laporanInput
	ct := r.Header.Get("Content-Type")

	// JSON: {"alasan","kategori","ruangan_id","alat_id","foto"}
	if strings.Contains(ct, "application/json") {
		var body struct {
			Alasan    string `json:"alasan"`
			Kategori  string `json:"kategori"`
			RuanganID *int   `json:"ruangan_id"`
			AlatID    *int   `json:"alat_id"`
			Foto      string `json:"foto"`
		}
		dec := json.NewDecoder(http.MaxBytesReader(nil, r.Body, 6<<20))
		if err := dec.Decode(&body); err != nil && err != io.EOF {
			return in, "Gagal membaca body JSON"
		}
		in.Alasan = body.Alasan
		in.Kategori = body.Kategori
		in.RuanganID = body.RuanganID
		in.AlatID = body.AlatID
		in.Foto = body.Foto
		return in, ""
	}

	// multipart/form-data (backward compatible dengan frontend lama yg kirim File):
	// - field teks "foto" berisi base64/data-URL, atau
	// - field file "foto" (jpg/jpeg/png <=2MB) yg dikonversi ke base64 di server.
	// Tidak ada lagi file yang ditulis ke uploads/.
	if strings.Contains(ct, "multipart/form-data") {
		if err := r.ParseMultipartForm(6 << 20); err != nil {
			return in, "Gagal membaca form"
		}
		in.Alasan = r.FormValue("alasan")
		in.Kategori = r.FormValue("kategori")
		if v := strings.TrimSpace(r.FormValue("ruangan_id")); v != "" {
			id, err := strconv.Atoi(v)
			if err != nil {
				return in, "ID ruangan tidak valid"
			}
			in.RuanganID = &id
		}
		if v := strings.TrimSpace(r.FormValue("alat_id")); v != "" {
			id, err := strconv.Atoi(v)
			if err != nil {
				return in, "ID alat tidak valid"
			}
			in.AlatID = &id
		}
		in.Foto = r.FormValue("foto")
		if in.Foto == "" {
			file, header, err := r.FormFile("foto")
			if err == nil {
				defer file.Close()
				if header.Size > maxFotoSize {
					return in, "Ukuran foto maksimal 2MB"
				}
				raw, err := io.ReadAll(io.LimitReader(file, maxFotoSize+1))
				if err != nil {
					return in, "Gagal membaca foto"
				}
				if len(raw) > maxFotoSize {
					return in, "Ukuran foto maksimal 2MB"
				}
				dataURL, ok := encodeBytesToDataURL(raw)
				if !ok {
					return in, "Format foto harus jpg, jpeg, atau png"
				}
				in.Foto = dataURL
			}
		}
		return in, ""
	}

	// application/x-www-form-urlencoded (dan fallback lainnya).
	if err := r.ParseForm(); err != nil {
		return in, "Gagal membaca form"
	}
	in.Alasan = r.FormValue("alasan")
	in.Kategori = r.FormValue("kategori")
	if v := strings.TrimSpace(r.FormValue("ruangan_id")); v != "" {
		id, err := strconv.Atoi(v)
		if err != nil {
			return in, "ID ruangan tidak valid"
		}
		in.RuanganID = &id
	}
	if v := strings.TrimSpace(r.FormValue("alat_id")); v != "" {
		id, err := strconv.Atoi(v)
		if err != nil {
			return in, "ID alat tidak valid"
		}
		in.AlatID = &id
	}
	in.Foto = r.FormValue("foto")
	return in, ""
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

	in, failMsg := parseLaporanInput(r)
	if failMsg != "" {
		utils.ResponseJSONMessage(w, failMsg, http.StatusBadRequest, false)
		return
	}

	alasan := strings.TrimSpace(in.Alasan)
	if alasan == "" {
		utils.ResponseJSONMessage(w, "Alasan wajib diisi", http.StatusBadRequest, false)
		return
	}
	if len(alasan) > maxAlasanSize {
		utils.ResponseJSONMessage(w, "Alasan maksimal 255 karakter", http.StatusBadRequest, false)
		return
	}

	kategori := strings.TrimSpace(in.Kategori)
	switch kategori {
	case models.Kebersihan, models.Pendingin, models.Elektronik, models.Lainnya:
	default:
		utils.ResponseJSONMessage(w, "Kategori tidak valid", http.StatusBadRequest, false)
		return
	}

	if (in.RuanganID == nil) == (in.AlatID == nil) {
		utils.ResponseJSONMessage(w, "Pilih salah satu: ruangan atau alat", http.StatusBadRequest, false)
		return
	}

	var ruanganId, alatId *int
	if in.RuanganID != nil {
		id := *in.RuanganID
		if id <= 0 {
			utils.ResponseJSONMessage(w, "ID ruangan tidak valid", http.StatusBadRequest, false)
			return
		}
		if !repositories.CheckRuanganById(id) {
			utils.ResponseJSONMessage(w, "Ruangan tidak ditemukan", http.StatusNotFound, false)
			return
		}
		ruanganId = &id
	}
	if in.AlatID != nil {
		id := *in.AlatID
		if id <= 0 {
			utils.ResponseJSONMessage(w, "ID alat tidak valid", http.StatusBadRequest, false)
			return
		}
		if !repositories.CheckAlatById(id) {
			utils.ResponseJSONMessage(w, "Alat tidak ditemukan", http.StatusNotFound, false)
			return
		}
		alatId = &id
	}

	// Foto opsional, disimpan sebagai data-URL base64 langsung di kolom report.foto.
	// Tidak ada lagi file di uploads/reports/.
	fotoPath := ""
	if strings.TrimSpace(in.Foto) != "" {
		// Jika multipart mengirim file, in.Foto sudah berupa data-URL kanonis.
		// Validasi ulang agar aman dari payload rakitan.
		normalized, ok := normalizeFotoBase64(in.Foto)
		if !ok {
			// Bedakan pesan ukuran vs format bila memungkinkan.
			payload := in.Foto
			if i := strings.Index(payload, ","); strings.HasPrefix(strings.TrimSpace(payload), "data:") && i >= 0 {
				payload = payload[i+1:]
			}
			payload = strings.ReplaceAll(strings.TrimSpace(payload), " ", "")
			if raw, err := base64.StdEncoding.DecodeString(payload); err == nil && len(raw) > maxFotoSize {
				utils.ResponseJSONMessage(w, "Ukuran foto maksimal 2MB", http.StatusBadRequest, false)
				return
			}
			if len(payload) > maxFotoBase64Len {
				utils.ResponseJSONMessage(w, "Ukuran foto maksimal 2MB", http.StatusBadRequest, false)
				return
			}
			// Deteksi format dari byte bila bisa di-decode.
			if raw, err := base64.StdEncoding.DecodeString(payload); err == nil {
				_ = raw
				if mime := http.DetectContentType(raw); mime != "" {
					if _, allowed := allowedFotoMime[mime]; !allowed {
						utils.ResponseJSONMessage(w, "Format foto harus jpg, jpeg, atau png", http.StatusBadRequest, false)
						return
					}
				}
			}
			// Cek ekstensi nama file yang nyasar sebagai string foto (frontend lama
			// kadang mengirim fileName): tolak dengan pesan format.
			utils.ResponseJSONMessage(w, "Format foto harus base64 jpg, jpeg, atau png", http.StatusBadRequest, false)
			return
		}
		fotoPath = normalized
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
