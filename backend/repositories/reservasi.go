package repositories

import (
	"backend-ppk/config"
	"time"
)

func IsReservasiBentrok(ruanganID int, waktuMulai time.Time, waktuSelesai time.Time) (bool, error) {

	var exist bool

	query := `
		SELECT EXISTS (
			SELECT 1
			FROM reservasi
			WHERE ruangan_reservasi = ?
			  AND status_reservasi = 'APPROVED'
			  AND waktu_peminjaman < ?
			  AND waktu_peminjaman_selesai > ?
		)
	`
	err := config.QueryRow(query, ruanganID, waktuSelesai, waktuMulai).Scan(&exist)

	if err != nil {
		return false, err
	}

	return exist, nil
}
func CreateReservasiAlat(alatID int, jumlah int, userID int, waktuMulai time.Time, waktuSelesai time.Time, alasan string) error {

	tx, err := config.DB.Begin()
	if err != nil {
		return err
	}

	defer tx.Rollback()

	queryReservasi := `
		INSERT INTO reservasi (
			waktu_reservasi_dibuat,
			ruangan_reservasi,
			user_reservasi,
			waktu_peminjaman,
			waktu_peminjaman_selesai,
			status_reservasi,
			alasan_peminjaman
		)
		VALUES (NOW(),NULL,?,?,?,'PENDING',?)
	`

	result, err := tx.Exec(
		queryReservasi,
		userID,
		waktuMulai,
		waktuSelesai,
		alasan,
	)

	if err != nil {
		return err
	}

	reservasiID, err := result.LastInsertId()
	if err != nil {
		return err
	}

	queryAlat := `
		INSERT INTO alat_reservasi (
			id_alat,
			id_reservasi,
			jumlah
		)
		VALUES (?, ?, ?)
	`

	_, err = tx.Exec(
		queryAlat,
		alatID,
		reservasiID,
		jumlah,
	)

	if err != nil {
		return err
	}

	if err := tx.Commit(); err != nil {
		return err
	}

	return nil
}

func CreateReservasi(ruanganID int, userID int, waktuMulai time.Time, waktuSelesai time.Time, alasan string) error {

	query := `
		INSERT INTO reservasi (
			waktu_reservasi_dibuat,
			ruangan_reservasi,
			user_reservasi,
			waktu_peminjaman,
			waktu_peminjaman_selesai,
			status_reservasi,
			alasan_peminjaman
		)
		VALUES (NOW(),?,?,?,?,'PENDING',?)
	`

	_, err := config.Exec(query, ruanganID, userID, waktuMulai, waktuSelesai, alasan)

	return err
}
