package models

import "strings"

// Kode status yang disimpan di kolom reservasi.status_reservasi (varchar(10)).
const (
	ReservasiPending   = "PENDING"
	ReservasiApproved  = "APPROVED"
	ReservasiRejected  = "REJECTED"
	ReservasiCancelled = "CANCELLED"
	ReservasiDone      = "DONE"
)

// ReservasiStatusKeIndonesia memetakan kode DB ke label yang dipakai API.
func ReservasiStatusKeIndonesia(kode string) string {
	switch kode {
	case ReservasiPending:
		return "menunggu"
	case ReservasiApproved:
		return "disetujui"
	case ReservasiRejected:
		return "ditolak"
	case ReservasiCancelled:
		return "dibatalkan"
	case ReservasiDone:
		return "selesai"
	default:
		return kode
	}
}

// ReservasiStatusDariIndonesia memetakan label API ke kode DB.
func ReservasiStatusDariIndonesia(label string) (string, bool) {
	switch strings.ToLower(strings.TrimSpace(label)) {
	case "menunggu":
		return ReservasiPending, true
	case "disetujui":
		return ReservasiApproved, true
	case "ditolak":
		return ReservasiRejected, true
	case "dibatalkan":
		return ReservasiCancelled, true
	case "selesai":
		return ReservasiDone, true
	default:
		return "", false
	}
}

type ReservasiAlat struct {
	Id     int    `json:"id"`
	Nama   string `json:"nama"`
	Jumlah int    `json:"jumlah"`
}

type ReservasiRiwayat struct {
	Status     string  `json:"status"`
	StatusKode string  `json:"status_kode"`
	DiubahOleh *int    `json:"diubah_oleh"`
	Keterangan *string `json:"keterangan"`
	Waktu      string  `json:"waktu"`
}

type Reservasi struct {
	Id                     int                `json:"id"`
	WaktuReservasiDibuat   string             `json:"waktu_reservasi_dibuat"`
	WaktuPeminjaman        string             `json:"waktu_peminjaman"`
	WaktuPeminjamanSelesai string             `json:"waktu_peminjaman_selesai"`
	Status                 string             `json:"status"`
	StatusKode             string             `json:"status_kode"`
	UserId                 int                `json:"user_id"`
	Username               string             `json:"username"`
	RuanganId              *int               `json:"ruangan_id"`
	RuanganNama            *string            `json:"ruangan_nama"`
	JumlahPeserta          *int               `json:"jumlah_peserta"`
	Alat                   []ReservasiAlat    `json:"alat"`
	AlasanPeminjaman       *string            `json:"alasan_peminjaman"`
	AlasanPenolakan        *string            `json:"alasan_penolakan"`
	AlasanPembatalan       *string            `json:"alasan_pembatalan"`
	Riwayat                []ReservasiRiwayat `json:"riwayat,omitempty"`
}

type SlotKetersediaan struct {
	Mulai    string `json:"mulai"`
	Selesai  string `json:"selesai"`
	Tersedia bool   `json:"tersedia"`
}

type KetersediaanHari struct {
	Tanggal string             `json:"tanggal"`
	Slot    []SlotKetersediaan `json:"slot"`
}

type KetersediaanFasilitas struct {
	Id     string              `json:"id"`
	RefId  int                 `json:"ref_id"`
	Tipe   string              `json:"tipe"`
	Nama   string              `json:"nama"`
	Lokasi string              `json:"lokasi"`
	Hari   []KetersediaanHari  `json:"hari"`
}
