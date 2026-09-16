package repositories

import (
	"backend-ppk/config"
	"backend-ppk/models"
	"database/sql"
	"log"
)


func InsertReport(r models.Report) error {
	tx, err := config.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()
	 _, err = tx.Exec(`INSERT into report (user_report, alasan, kategori_laporan, foto, status_laporan, report_ruangan, report_alat) VALUES(?,?,?,?,?,?,?)`,r.User_report, r.Alasan, r.Kategori_laporan, r.Foto, r.Status_laporan, r.Report_ruangan, r.Report_alat)

	 if err != nil {
		log.Printf("Failed to insert report: %v\n",err)
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
		`SELECT 1 FROM ruangan where id = ?`,id).Scan(&idRuangan)
	if err == sql.ErrNoRows{
		return  false
	}else if err != nil {
		log.Printf("Failed to get ruangan: %v\n",err)
		return false
	}
	return true
	
}
func CheckAlatById(id int) bool {
	var idAlat int
	err := config.QueryRow(
		`SELECT 1 FROM alat where id = ?`,id).Scan(&idAlat)
	if err == sql.ErrNoRows{
		return  false
	}else if err != nil {
		log.Printf("Failed to get ruangan: %v\n",err)
		return false
	}
	return true
	
}