package repositories

import (
	"backend-ppk/config"
)

// Penolakan akun pending = hapus baris pending + akun user-nya dalam satu
// transaksi (FK mhs_user/dosen_user/user_staff tidak ada cascade).
// sql.ErrNoRows diteruskan apa adanya agar controller balas 404.

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
	if _, err := tx.Exec(`DELETE FROM user WHERE id = ?`, userID); err != nil {
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
	if _, err := tx.Exec(`DELETE FROM user WHERE id = ?`, userID); err != nil {
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
	if _, err := tx.Exec(`DELETE FROM user WHERE id = ?`, userID); err != nil {
		return err
	}
	return tx.Commit()
}
