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
	if err := rows.Err(); err != nil {
		return nil, err
	}

	// Stok tampilan bersumber dari backend: banyak_alat dikurangi unit yang
	// dikunci reservasi berstatus APPROVED, tanpa memandang tanggalnya.
	// Alat nonaktif tetap 0. Kolom jumlah_tersedia hanya baseline admin.
	dipinjam, err := TotalAlatDipinjamAktifPerAlat()
	if err != nil {
		return nil, err
	}
	for i := range list {
		if list[i].Status == 0 {
			list[i].JumlahTersedia = 0
			continue
		}
		list[i].JumlahTersedia = list[i].BanyakAlat - dipinjam[list[i].Id]
		if list[i].JumlahTersedia < 0 {
			list[i].JumlahTersedia = 0
		}
	}
	return list, nil
}

// TotalAlatDipinjamAktifPerAlat menghitung unit yang sedang dikunci reservasi
// APPROVED untuk tiap alat (tanpa memandang tanggal), sebagai pengurang stok.
func TotalAlatDipinjamAktifPerAlat() (map[int]int, error) {
	rows, err := config.Query(`
		SELECT ar.id_alat, COALESCE(SUM(ar.jumlah), 0)
		FROM alat_reservasi ar
		JOIN reservasi r ON r.id = ar.id_reservasi
		WHERE r.status_reservasi = 'APPROVED'
		GROUP BY ar.id_alat`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	result := make(map[int]int)
	for rows.Next() {
		var (
			idAlat int
			unit   int
		)
		if err := rows.Scan(&idAlat, &unit); err != nil {
			return nil, err
		}
		result[idAlat] = unit
	}
	return result, rows.Err()
}

// TotalAlatDipinjamAktif menghitung unit yang dikunci reservasi APPROVED
// untuk satu alat, dengan opsi mengecualikan satu reservasi.
func TotalAlatDipinjamAktif(alatID, kecualiReservasiID int) (int, error) {
	var total int
	err := config.QueryRow(`
		SELECT COALESCE(SUM(ar.jumlah), 0)
		FROM alat_reservasi ar
		JOIN reservasi r ON r.id = ar.id_reservasi
		WHERE ar.id_alat = ?
		  AND r.status_reservasi = 'APPROVED'
		  AND r.id <> ?`, alatID, kecualiReservasiID).Scan(&total)
	return total, err
}
