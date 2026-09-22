package repositories

import (
	"backend-ppk/config"
	"backend-ppk/models"
	"database/sql"
)

func ListFakultas() ([]models.Fakultas, error) {
	rows, err := config.Query(`
		SELECT id, nama_fakultas
		FROM fakultas
		ORDER BY nama_fakultas`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := make([]models.Fakultas, 0)
	for rows.Next() {
		var f models.Fakultas
		if err := rows.Scan(&f.Id, &f.Nama); err != nil {
			return nil, err
		}
		list = append(list, f)
	}
	return list, rows.Err()
}

func ListProdi() ([]models.Prodi, error) {
	rows, err := config.Query(`
		SELECT p.id, p.nama_prodi, p.fakultas_prodi, f.nama_fakultas
		FROM prodi p
		LEFT JOIN fakultas f ON f.id = p.fakultas_prodi
		ORDER BY f.nama_fakultas, p.nama_prodi`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := make([]models.Prodi, 0)
	for rows.Next() {
		var (
			p        models.Prodi
			fakultas sql.NullString
		)
		if err := rows.Scan(&p.Id, &p.Nama, &p.FakultasId, &fakultas); err != nil {
			return nil, err
		}
		p.NamaFakultas = fakultas.String
		list = append(list, p)
	}
	return list, rows.Err()
}
