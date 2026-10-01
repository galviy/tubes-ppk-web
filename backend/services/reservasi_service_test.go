package services

import (
	"errors"
	"testing"
	"time"

	"backend-ppk/models"
)

func TestWaktuWIBSebagaiWallUTCConvertsAcrossDateBoundary(t *testing.T) {
	instant := time.Date(2026, time.September, 30, 20, 15, 0, 0, time.UTC)
	got := waktuWIBSebagaiWallUTC(instant)
	want := time.Date(2026, time.October, 1, 3, 15, 0, 0, time.UTC)

	if !got.Equal(want) {
		t.Fatalf("waktu WIB dalam format dinding = %s, ingin %s", got, want)
	}
}

func TestParseWaktuKeepsWIBScheduleAsNaiveWallClock(t *testing.T) {
	got, err := ParseWaktu("2026-10-01 09:30:00")
	if err != nil {
		t.Fatalf("ParseWaktu() error = %v", err)
	}
	want := time.Date(2026, time.October, 1, 9, 30, 0, 0, time.UTC)
	if !got.Equal(want) || got.Location() != time.UTC {
		t.Fatalf("ParseWaktu() = %s (%s), ingin waktu dinding %s UTC", got, got.Location(), want)
	}
}

func reservasiMulai09(waktuPeminjaman string) models.Reservasi {
	return models.Reservasi{
		Id:                     1,
		StatusKode:             models.ReservasiApproved,
		WaktuPeminjaman:        waktuPeminjaman,
		WaktuPeminjamanSelesai: waktuPeminjaman,
	}
}

func TestValidasiBatasPembatalanMembolehkanLebihDariDuaJamSebelumJadwal(t *testing.T) {
	reservasi := reservasiMulai09("2026-10-01 09:00:00")
	sekarang := time.Date(2026, time.October, 1, 6, 59, 0, 0, time.UTC)

	if err := validasiBatasPembatalanPada(reservasi, sekarang); err != nil {
		t.Fatalf("pembatalan 1 menit sebelum batas harus boleh, got error = %v", err)
	}
}

func TestValidasiBatasPembatalanMenolakPadaBatasDuaJam(t *testing.T) {
	reservasi := reservasiMulai09("2026-10-01 09:00:00")
	sekarang := time.Date(2026, time.October, 1, 7, 0, 0, 0, time.UTC)

	err := validasiBatasPembatalanPada(reservasi, sekarang)
	if err == nil {
		t.Fatal("pembatalan tepat pada batas 2 jam harus ditolak")
	}
	var errReservasi ErrReservasi
	if !errors.As(err, &errReservasi) {
		t.Fatalf("error yang diharapkan ErrReservasi, got %T", err)
	}
	if errReservasi.Status != 409 {
		t.Fatalf("status error = %d, ingin 409", errReservasi.Status)
	}
}

func TestValidasiBatasPembatalanMenolakSetelahJadwalDimulai(t *testing.T) {
	reservasi := reservasiMulai09("2026-10-01 09:00:00")
	// Lokal 11.00 WIB berarti waktu dinding 04.00 UTC, jadwal sudah berjalan.
	sekarang := waktuWIBSebagaiWallUTC(time.Date(2026, time.October, 1, 4, 0, 0, 0, time.UTC))

	if err := validasiBatasPembatalanPada(reservasi, sekarang); err == nil {
		t.Fatal("pembatalan setelah jadwal berjalan harus ditolak")
	}
}

func TestValidasiBatasPembatalanMenolakReservasiLewatJadwal(t *testing.T) {
	reservasi := reservasiMulai09("2026-10-01 09:00:00")
	// Satu hari setelah jadwal selesai.
	sekarang := waktuWIBSebagaiWallUTC(time.Date(2026, time.October, 2, 4, 0, 0, 0, time.UTC))

	if err := validasiBatasPembatalanPada(reservasi, sekarang); err == nil {
		t.Fatal("pembatalan setelah jadwal selesai harus ditolak")
	}
}
