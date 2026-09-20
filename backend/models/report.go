package models

import (
	"database/sql"
	"time"
)

const (
	StatusBaru     = "baru"
	StatusDiproses = "diproses"
	StatusSelesai  = "selesai"
	StatusDitolak  = "ditolak"
	Kebersihan     = "Kebersihan"
	Pendingin      = "AC/Pendingin"
	Elektronik     = "Elektronik"
	Lainnya        = "Lainnya"
)

type Report struct {
	Id               int
	Waktu_dibuat     time.Time
	Foto             sql.NullString
	User_report      int
	Alasan           string
	Kategori_laporan string
	Status_laporan   string
	Catatan_resolusi sql.NullString
	Resolved_at      sql.NullTime
	Report_ruangan   sql.NullInt64
	Report_alat      sql.NullInt64
}

type ReportDetail struct {
	Id              int        `json:"id"`
	WaktuDibuat     time.Time  `json:"waktu_dibuat"`
	Foto            *string    `json:"foto"`
	UserReport      int        `json:"user_report"`
	Alasan          string     `json:"alasan"`
	KategoriLaporan string     `json:"kategori_laporan"`
	StatusLaporan   string     `json:"status_laporan"`
	CatatanResolusi *string    `json:"catatan_resolusi"`
	ResolvedAt      *time.Time `json:"resolved_at"`
	ReportRuangan   *int       `json:"report_ruangan"`
	ReportAlat      *int       `json:"report_alat"`
	NamaRuangan     *string    `json:"nama_ruangan"`
	NamaAlat        *string    `json:"nama_alat"`
}
