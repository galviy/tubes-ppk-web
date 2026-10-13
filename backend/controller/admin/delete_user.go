package admin

import (
	"backend-ppk/config"
	utils "backend-ppk/utilities"
	"log"
	"net/http"
	"strconv"
)

// Delete_user menghapus akun secara permanen (hard delete) beserta seluruh
// baris dependen yang mengikatnya melalui foreign key: profil mahasiswa/
// dosen/staff, reservasi beserta riwayat/alat/tolak, dan laporan.
// Baris pending registrasi mandiri milik akun tersebut ikut dibersihkan.
func Delete_user(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		utils.ResponseJSONMessage(w, "Method Not Allowed", http.StatusMethodNotAllowed, false)
		return
	}

	idStr := r.PathValue("id")
	id, err := strconv.Atoi(idStr)
	if err != nil || id <= 0 {
		utils.ResponseJSONMessage(w, "ID user tidak valid", http.StatusBadRequest, false)
		return
	}

	tx, err := config.DB.Begin()
	if err != nil {
		utils.ResponseJSONMessage(w, "Gagal memulai transaksi", http.StatusInternalServerError, false)
		return
	}
	defer tx.Rollback()

	var ada int
	if err := tx.QueryRow(`SELECT COUNT(*) FROM user WHERE id = ?`, id).Scan(&ada); err != nil {
		utils.ResponseJSONMessage(w, "Gagal memeriksa akun", http.StatusInternalServerError, false)
		return
	}
	if ada == 0 {
		utils.ResponseJSONMessage(w, "User tidak ditemukan", http.StatusNotFound, false)
		return
	}

	// Urutan mengikuti ketergantungan FK: anak reservasi dulu, baru reservasi,
	// lalu profil dan baris user induk.
	pembersihan := []struct {
		judul string
		sql   string
	}{
		{"alat reservasi", `DELETE ar FROM alat_reservasi ar
			JOIN reservasi r ON r.id = ar.id_reservasi
			WHERE r.user_reservasi = ?`},
		{"tolak reservasi", `DELETE tr FROM tolak_reservasi tr
			JOIN reservasi r ON r.id = tr.id_reservasi
			WHERE r.user_reservasi = ?`},
		{"riwayat reservasi", `DELETE rr FROM reservasi_riwayat rr
			JOIN reservasi r ON r.id = rr.id_reservasi
			WHERE r.user_reservasi = ?`},
		{"laporan", `DELETE FROM report WHERE user_report = ?`},
		{"reservasi", `DELETE FROM reservasi WHERE user_reservasi = ?`},
		{"pending mahasiswa", `DELETE FROM mahasiswa_pending WHERE mhs_user = ?`},
		{"pending dosen", `DELETE FROM dosen_pending WHERE dosen_user = ?`},
		{"profil mahasiswa", `DELETE FROM mahasiswa WHERE mhs_user = ?`},
		{"profil dosen", `DELETE FROM dosen WHERE dosen_user = ?`},
		{"profil staff", `DELETE FROM staff WHERE user_staff = ?`},
	}

	for _, tugas := range pembersihan {
		if _, err := tx.Exec(tugas.sql, id); err != nil {
			log.Printf("Gagal menghapus %s untuk user %d: %v", tugas.judul, id, err)
			utils.ResponseJSONMessage(w, "Gagal menghapus akun: data "+tugas.judul+" terikat akun ini", http.StatusInternalServerError, false)
			return
		}
	}

	res, err := tx.Exec(`DELETE FROM user WHERE id = ?`, id)
	if err != nil {
		log.Printf("Gagal menghapus user %d: %v", id, err)
		utils.ResponseJSONMessage(w, "Gagal menghapus akun", http.StatusInternalServerError, false)
		return
	}
	terhapus, err := res.RowsAffected()
	if err != nil {
		utils.ResponseJSONMessage(w, "Internal server error", http.StatusInternalServerError, false)
		return
	}
	if terhapus == 0 {
		utils.ResponseJSONMessage(w, "User tidak ditemukan", http.StatusNotFound, false)
		return
	}

	if err := tx.Commit(); err != nil {
		utils.ResponseJSONMessage(w, "Gagal menyimpan penghapusan akun", http.StatusInternalServerError, false)
		return
	}

	utils.ResponseJSONMessage(w, "Akun dengan id "+idStr+" dihapus permanen", http.StatusOK, true)
}
