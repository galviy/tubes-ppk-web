package repositories

import (
	"backend-ppk/config"
	"backend-ppk/models"
	"database/sql"
)

func ListRuangan() ([]models.Ruangan, error) {
	rows, err := config.Query(`
		SELECT r.id, r.nama_ruangan, r.status, r.kapasitas, r.lokasi, k.nama_kategori
		FROM ruangan r
		LEFT JOIN kategori k ON k.id = r.kategori
		ORDER BY r.nama_ruangan`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := make([]models.Ruangan, 0)
	for rows.Next() {
		var (
			r        models.Ruangan
			kategori sql.NullString
		)
		if err := rows.Scan(&r.Id, &r.Nama, &r.Status, &r.Kapasitas, &r.Lokasi, &kategori); err != nil {
			return nil, err
		}
		r.Kategori = kategori.String
		list = append(list, r)
	}
	return list, rows.Err()
}

func ListAlat() ([]models.Alat, error) {
	rows, err := config.Query(`
		SELECT a.id, a.nama_alat, a.jumlah_tersedia, a.banyak_alat, a.status, k.nama_kategori
		FROM alat a
		LEFT JOIN kategori k ON k.id = a.kategori
		ORDER BY a.nama_alat`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := make([]models.Alat, 0)
	for rows.Next() {
		var (
			a        models.Alat
			kategori sql.NullString
		)
		if err := rows.Scan(&a.Id, &a.Nama, &a.JumlahTersedia, &a.BanyakAlat, &a.Status, &kategori); err != nil {
			return nil, err
		}
		a.Kategori = kategori.String
		list = append(list, a)
	}
	return list, rows.Err()
}
