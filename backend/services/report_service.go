package services

import (
	"backend-ppk/models"
	"backend-ppk/repositories"
	"database/sql"
)

func CreateLaporan(userId int, alasan, kategori, foto string, ruanganId, alatId *int) error {
	report := models.Report{
		User_report:      userId,
		Alasan:           alasan,
		Kategori_laporan: kategori,
		Foto:             sql.NullString{String: foto, Valid: foto != ""},
		Status_laporan:   models.StatusBaru,
	}
	if ruanganId != nil {
		report.Report_ruangan = sql.NullInt64{Int64: int64(*ruanganId), Valid: true}
	}
	if alatId != nil {
		report.Report_alat = sql.NullInt64{Int64: int64(*alatId), Valid: true}
	}

	return repositories.InsertReport(report)
}
