package repositories

import (
	"backend-ppk/config"
	"backend-ppk/models"
	"database/sql"
	"log"
	"time"
)

func InsertReport(r models.Report) error {
	tx, err := config.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()
	_, err = tx.Exec(`INSERT into report (user_report, alasan, kategori_laporan, foto, status_laporan, report_ruangan, report_alat) VALUES(?,?,?,?,?,?,?)`, r.User_report, r.Alasan, r.Kategori_laporan, r.Foto, r.Status_laporan, r.Report_ruangan, r.Report_alat)

	if err != nil {
		log.Printf("Failed to insert report: %v\n", err)
		return err
	}
	if err := tx.Commit(); err != nil {
		return err
	}
	return nil
}

func CheckRuanganById(id int) bool {
	var idRuangan int
	err := config.QueryRow(
		`SELECT 1 FROM ruangan where id = ?`, id).Scan(&idRuangan)
	if err == sql.ErrNoRows {
		return false
	} else if err != nil {
		log.Printf("Failed to get ruangan: %v\n", err)
		return false
	}
	return true

}

func scanReportDetail(row interface {
	Scan(dest ...any) error
}) (models.ReportDetail, error) {
	var d models.ReportDetail
	var foto, catatan, namaRuangan, namaAlat sql.NullString
	var resolvedAt sql.NullTime
	var ruanganId, alatId sql.NullInt64

	err := row.Scan(
		&d.Id, &d.WaktuDibuat, &foto, &d.UserReport, &d.Alasan,
		&d.KategoriLaporan, &d.StatusLaporan, &catatan, &resolvedAt,
		&ruanganId, &alatId, &namaRuangan, &namaAlat,
	)
	if err != nil {
		return d, err
	}
	if foto.Valid {
		d.Foto = &foto.String
	}
	if catatan.Valid {
		d.CatatanResolusi = &catatan.String
	}
	if resolvedAt.Valid {
		d.ResolvedAt = &resolvedAt.Time
	}
	if ruanganId.Valid {
		v := int(ruanganId.Int64)
		d.ReportRuangan = &v
	}
	if alatId.Valid {
		v := int(alatId.Int64)
		d.ReportAlat = &v
	}
	if namaRuangan.Valid {
		d.NamaRuangan = &namaRuangan.String
	}
	if namaAlat.Valid {
		d.NamaAlat = &namaAlat.String
	}
	return d, nil
}

func ListByUser(userId int) ([]models.ReportDetail, error) {
	rows, err := config.DB.Query(
		`SELECT r.id, r.waktu_dibuat, r.foto, r.user_report, r.alasan,
			r.kategori_laporan, r.status_laporan, r.catatan_resolusi, r.resolved_at,
			r.report_ruangan, r.report_alat, ru.nama_ruangan, a.nama_alat
		FROM report r
		LEFT JOIN ruangan ru ON ru.id = r.report_ruangan
		LEFT JOIN alat a ON a.id = r.report_alat
		WHERE r.user_report = ? ORDER BY r.waktu_dibuat DESC`, userId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := make([]models.ReportDetail, 0)
	for rows.Next() {
		d, err := scanReportDetail(rows)
		if err != nil {
			return nil, err
		}
		list = append(list, d)
	}
	return list, rows.Err()
}

func GetReportByID(id, userId int) (*models.ReportDetail, error) {
	d, err := scanReportDetail(config.DB.QueryRow(
		`SELECT r.id, r.waktu_dibuat, r.foto, r.user_report, r.alasan,
			r.kategori_laporan, r.status_laporan, r.catatan_resolusi, r.resolved_at,
			r.report_ruangan, r.report_alat, ru.nama_ruangan, a.nama_alat
		FROM report r
		LEFT JOIN ruangan ru ON ru.id = r.report_ruangan
		LEFT JOIN alat a ON a.id = r.report_alat
		WHERE r.id = ? AND r.user_report = ?`, id, userId))
	if err != nil {
		return nil, err
	}
	return &d, nil
}

func GetReportByIDForPetugas(id int) (*models.ReportDetail, error) {
	d, err := scanReportDetail(config.DB.QueryRow(
		`SELECT r.id, r.waktu_dibuat, r.foto, r.user_report, r.alasan,
			r.kategori_laporan, r.status_laporan, r.catatan_resolusi, r.resolved_at,
			r.report_ruangan, r.report_alat, ru.nama_ruangan, a.nama_alat
		FROM report r
		LEFT JOIN ruangan ru ON ru.id = r.report_ruangan
		LEFT JOIN alat a ON a.id = r.report_alat
		WHERE r.id = ?`, id))
	if err != nil {
		return nil, err
	}
	return &d, nil
}

func ListAllReports() ([]models.ReportDetail, error) {
	rows, err := config.DB.Query(
		`SELECT r.id, r.waktu_dibuat, r.foto, r.user_report, r.alasan,
			r.kategori_laporan, r.status_laporan, r.catatan_resolusi, r.resolved_at,
			r.report_ruangan, r.report_alat, ru.nama_ruangan, a.nama_alat
		FROM report r
		LEFT JOIN ruangan ru ON ru.id = r.report_ruangan
		LEFT JOIN alat a ON a.id = r.report_alat
		ORDER BY r.waktu_dibuat DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := make([]models.ReportDetail, 0)
	for rows.Next() {
		d, err := scanReportDetail(rows)
		if err != nil {
			return nil, err
		}
		list = append(list, d)
	}
	return list, rows.Err()
}

func UpdateReportStatus(id int, status string, catatan sql.NullString, resolved bool) error {
	var resolvedAt any
	if resolved {
		resolvedAt = time.Now()
	}
	_, err := config.DB.Exec(
		`UPDATE report SET status_laporan = ?, catatan_resolusi = ?, resolved_at = ? WHERE id = ?`,
		status, catatan, resolvedAt, id)
	return err
}

func UpdateRuanganStatus(id int, status string) error {
	_, err := config.DB.Exec(
		`UPDATE ruangan SET status = ? WHERE id = ?`, status, id)
	return err
}

func GetAlatBanyak(id int) (total int, ok bool) {
	err := config.QueryRow(
		`SELECT banyak_alat FROM alat WHERE id = ?`, id).Scan(&total)
	if err != nil {
		return 0, false
	}
	return total, true
}

func UpdateAlatTersedia(id, jumlah int) error {
	_, err := config.DB.Exec(
		`UPDATE alat SET jumlah_tersedia = ? WHERE id = ?`, jumlah, id)
	return err
}

func CheckAlatById(id int) bool {
	var idAlat int
	err := config.QueryRow(
		`SELECT 1 FROM alat where id = ?`, id).Scan(&idAlat)
	if err == sql.ErrNoRows {
		return false
	} else if err != nil {
		log.Printf("Failed to get ruangan: %v\n", err)
		return false
	}
	return true

}
