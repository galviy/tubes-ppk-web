package repositories

import (
	"backend-ppk/config"
	"database/sql"
)

// Suspend/unsuspend akun via isVerified (0 = tidak bisa login, 1 = aktif).
// Mengembalikan sql.ErrNoRows bila id tidak ada.
func SetUserVerified(userID int, verified bool) error {
	v := 0
	if verified {
		v = 1
	}
	res, err := config.DB.Exec(`UPDATE user SET isVerified = ? WHERE id = ?`, v, userID)
	if err != nil {
		return err
	}
	n, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if n == 0 {
		return sql.ErrNoRows
	}
	return nil
}

// UpdateRuangan mengubah spesifikasi ruangan. Kategori dalam bentuk
// nama_kategori (di-resolve ke id seperti CreateRuangan).
// sql.ErrNoRows bila ruangan tidak ada.
func UpdateRuangan(id int, nama string, status int, kapasitas int, lokasi string, kategori string, deskripsi, kelengkapan, foto string) error {
	var exist int
	err := config.QueryRow(`SELECT 1 FROM ruangan WHERE id = ?`, id).Scan(&exist)
	if err != nil {
		return err
	}
	_, err = config.DB.Exec(`
		UPDATE ruangan SET
			nama_ruangan = ?, status = ?, kapasitas = ?, lokasi = ?,
			kategori = (SELECT id FROM kategori WHERE nama_kategori = ?),
			deskripsi = ?, kelengkapan = ?, foto = ?
		WHERE id = ?
	`, nama, status, kapasitas, lokasi, kategori, deskripsi, kelengkapan, foto, id)
	return err
}

// UpdateAlat mengubah spesifikasi alat. sql.ErrNoRows bila tidak ada.
func UpdateAlat(id int, nama string, jumlahTersedia int, banyakAlat int, kategori string, status int, deskripsi, kelengkapan, foto string) error {
	var exist int
	err := config.QueryRow(`SELECT 1 FROM alat WHERE id = ?`, id).Scan(&exist)
	if err != nil {
		return err
	}
	_, err = config.DB.Exec(`
		UPDATE alat SET
			nama_alat = ?, jumlah_tersedia = ?, banyak_alat = ?,
			kategori = (SELECT id FROM kategori WHERE nama_kategori = ?),
			status = ?,
			deskripsi = ?, kelengkapan = ?, foto = ?
		WHERE id = ?
	`, nama, jumlahTersedia, banyakAlat, kategori, status, deskripsi, kelengkapan, foto, id)
	return err
}

// SetStatusAlat menyimpan status operasional alat sekaligus stok yang tampil.
// Alat nonaktif atau dalam perbaikan dibersihkan dari stok supaya tidak muncul
// di daftar equipment yang bisa dipinjam.
func SetStatusAlat(id int, status int, jumlahTersedia int) error {
	_, err := config.DB.Exec(
		`UPDATE alat SET status = ?, jumlah_tersedia = ? WHERE id = ?`, status, jumlahTersedia, id)
	return err
}

// SoftDeleteRuangan menonaktifkan (bukan hapus fisik, FK reservasi/report
// mengikat). sql.ErrNoRows bila tidak ada.
func SoftDeleteRuangan(id int) error {
	res, err := config.DB.Exec(`UPDATE ruangan SET status = 'nonaktif' WHERE id = ?`, id)
	if err != nil {
		return err
	}
	n, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if n == 0 {
		return sql.ErrNoRows
	}
	return nil
}

// SoftDeleteAlat menonaktifkan alat + mengosongkan stok tampilannya.
func SoftDeleteAlat(id int) error {
	res, err := config.DB.Exec(`UPDATE alat SET status = 0, jumlah_tersedia = 0 WHERE id = ?`, id)
	if err != nil {
		return err
	}
	n, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if n == 0 {
		return sql.ErrNoRows
	}
	return nil
}
