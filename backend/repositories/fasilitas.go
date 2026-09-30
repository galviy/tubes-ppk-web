package repositories

import (
	"backend-ppk/config"
	"backend-ppk/models"
	"database/sql"
)

func ListRuangan() ([]models.Ruangan, error) {
	rows, err := config.Query(`
		SELECT r.id, r.nama_ruangan, r.status, r.kapasitas, r.lokasi, k.nama_kategori,
		       COALESCE(r.deskripsi, ''), COALESCE(r.kelengkapan, ''), COALESCE(r.foto, '')
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
			r           models.Ruangan
			kategori    sql.NullString
			deskripsi   string
			kelengkapan string
			foto        string
		)
		if err := rows.Scan(&r.Id, &r.Nama, &r.Status, &r.Kapasitas, &r.Lokasi, &kategori, &deskripsi, &kelengkapan, &foto); err != nil {
			return nil, err
		}
		r.Kategori = kategori.String
		r.Deskripsi = deskripsi
		r.Kelengkapan = kelengkapan
		r.Foto = foto
		list = append(list, r)
	}
	return list, rows.Err()
}

func ListAlat() ([]models.Alat, error) {
	rows, err := config.Query(`
		SELECT a.id, a.nama_alat, a.jumlah_tersedia, a.banyak_alat, a.status, k.nama_kategori,
		       COALESCE(a.deskripsi, ''), COALESCE(a.kelengkapan, ''), COALESCE(a.foto, '')
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
			a           models.Alat
			kategori    sql.NullString
			deskripsi   string
			kelengkapan string
			foto        string
		)
		if err := rows.Scan(&a.Id, &a.Nama, &a.JumlahTersedia, &a.BanyakAlat, &a.Status, &kategori, &deskripsi, &kelengkapan, &foto); err != nil {
			return nil, err
		}
		a.Kategori = kategori.String
		a.Deskripsi = deskripsi
		a.Kelengkapan = kelengkapan
		a.Foto = foto
		list = append(list, a)
	}
	return list, rows.Err()
}
