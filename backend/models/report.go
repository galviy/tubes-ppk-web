package models

import (
	"database/sql"
	"time"
)

const (
    StatusBaru = "baru"
    StatusDiproses  = "diproses"
    StatusSelesai  = "selesai"
    StatusDitolak  = "ditolak"
	Kebersihan = "Kebersihan"
	Pendingin = "AC/Pendingin"
	Elektronik = "Elektronik"
	Lainnya = "Lainnya"
)

type Report struct {
	Id int
	Waktu_dibuat time.Time
	Foto sql.NullString
	User_report int
	Alasan string
	Kategori_laporan string
	Status_laporan string
	Catatan_resolusi sql.NullString
	Resolved_at sql.NullTime
	Report_ruangan  sql.NullInt64
	Report_alat  sql.NullInt64
}