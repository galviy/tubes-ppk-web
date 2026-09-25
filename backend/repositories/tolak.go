package repositories

import (
	"backend-ppk/config"
	"database/sql"
)

// Penolakan akun pending: baris pending SELALU dihapus. Baris user hanya
// dihapus bila akun pending murni (belum terverifikasi DAN tanpa data utama
// di tabel mana pun) — jika tidak, penghapusan user akan melanggar FK
// (mis. pending duplikat milik akun terverifikasi seperti admin) dan
// menghapus akun asli adalah tindakan yang salah.
func userDeletable(tx *sql.Tx, userID int) (bool, error) {
	var verified int
	if err := tx.QueryRow(`SELECT isVerified FROM user WHERE id = ?`, userID).Scan(&verified); err != nil {
		return false, err
	}
	if verified == 1 {
		return false, nil
	}
	tables := []struct {
		table string
		col   string
	}{
		{"mahasiswa", "mhs_user"},
		{"dosen", "dosen_user"},
		{"staff", "user_staff"},
		{"mahasiswa_pending", "mhs_user"},
		{"dosen_pending", "dosen_user"},
		{"report", "user_report"},
		{"reservasi", "user_reservasi"},
		{"report_message", "id_user"},
	}
	for _, t := range tables {
		var n int
		if err := tx.QueryRow(
			"SELECT COUNT(*) FROM "+t.table+" WHERE "+t.col+" = ?", userID,
		).Scan(&n); err != nil {
			return false, err
		}
		if n > 0 {
			return false, nil
		}
	}
	return true, nil
}

func deleteUserIfOrphan(tx *sql.Tx, userID int) error {
	del, err := userDeletable(tx, userID)
	if err != nil || !del {
		return err
	}
	_, err = tx.Exec(`DELETE FROM user WHERE id = ?`, userID)
	return err
}

func TolakMHS(pendingID int) error {
	tx, err := config.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	var userID int
	err = tx.QueryRow(`
		SELECT mhs_user FROM mahasiswa_pending WHERE id = ? FOR UPDATE
	`, pendingID).Scan(&userID)
	if err != nil {
		return err
	}
	if _, err := tx.Exec(`DELETE FROM mahasiswa_pending WHERE id = ?`, pendingID); err != nil {
		return err
	}
	// Hapus akun hanya bila yatim (belum terverifikasi & tanpa data utama);
	// akun asli (mis. duplikat milik admin terverifikasi) dipertahankan.
	if err := deleteUserIfOrphan(tx, userID); err != nil {
		return err
	}
	return tx.Commit()
}

func TolakDosen(pendingID int) error {
	tx, err := config.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	var userID int
	err = tx.QueryRow(`
		SELECT dosen_user FROM dosen_pending WHERE id = ? FOR UPDATE
	`, pendingID).Scan(&userID)
	if err != nil {
		return err
	}
	if _, err := tx.Exec(`DELETE FROM dosen_pending WHERE id = ?`, pendingID); err != nil {
		return err
	}
	// Hapus akun hanya bila yatim (belum terverifikasi & tanpa data utama).
	if err := deleteUserIfOrphan(tx, userID); err != nil {
		return err
	}
	return tx.Commit()
}

func TolakStaff(staffID int) error {
	tx, err := config.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	var userID int
	err = tx.QueryRow(`
		SELECT user_staff FROM staff WHERE id = ? FOR UPDATE
	`, staffID).Scan(&userID)
	if err != nil {
		return err
	}
	if _, err := tx.Exec(`DELETE FROM staff WHERE id = ?`, staffID); err != nil {
		return err
	}
	// Hapus akun hanya bila yatim (belum terverifikasi & tanpa data utama).
	if err := deleteUserIfOrphan(tx, userID); err != nil {
		return err
	}
	return tx.Commit()
}
