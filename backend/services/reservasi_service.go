package services

import (
	"backend-ppk/models"
	"backend-ppk/repositories"
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"
)

const (
	jamOperasionalMulaiMenit   = 7 * 60
	jamOperasionalSelesaiMenit = 20 * 60
	menitSlot                  = 30
	batasBatalSebelumMulai     = 2 * time.Hour
	hariMinimalPengajuan       = 2
)

// ErrReservasi membawa kode HTTP supaya controller bisa langsung memetakannya.
type ErrReservasi struct {
	Status int
	Pesan  string
}

func (e ErrReservasi) Error() string { return e.Pesan }

func errReservasi(status int, format string, args ...any) ErrReservasi {
	return ErrReservasi{Status: status, Pesan: fmt.Sprintf(format, args...)}
}

type BuatReservasiInput struct {
	RuanganID     *int
	Alat          []repositories.ReservasiAlatRequest
	WaktuMulai    time.Time
	WaktuSelesai  time.Time
	Alasan        string
	JumlahPeserta *int
}

var layoutWaktu = "2006-01-02 15:04:05"

// waktuWIBSebagaiWallUTC mengubah waktu aktual menjadi waktu dinding WIB
// yang disimpan dalam DATETIME naif berbentuk UTC oleh database.
func waktuWIBSebagaiWallUTC(waktu time.Time) time.Time {
	wib := waktu.In(time.FixedZone("WIB", 7*60*60))
	return time.Date(wib.Year(), wib.Month(), wib.Day(), wib.Hour(), wib.Minute(), wib.Second(), wib.Nanosecond(), time.UTC)
}

func waktuSekarangWIBSebagaiWallUTC() time.Time {
	return waktuWIBSebagaiWallUTC(time.Now())
}

// ParseWaktu mem-parsing waktu jadwal WIB sebagai waktu dinding UTC-naif agar
// kolom DATETIME jadwal tetap menyimpan jam kalender WIB tanpa konversi offset.
func ParseWaktu(nilai string) (time.Time, error) {
	return time.Parse(layoutWaktu, strings.TrimSpace(nilai))
}

func validasiSlot(waktu time.Time) bool {
	return waktu.Minute()%menitSlot == 0 && waktu.Second() == 0
}

func validasiJamOperasional(mulai, selesai time.Time) bool {
	menitMulai := mulai.Hour()*60 + mulai.Minute()
	menitSelesai := selesai.Hour()*60 + selesai.Minute()
	return menitMulai >= jamOperasionalMulaiMenit && menitSelesai <= jamOperasionalSelesaiMenit
}

// tanggalMinimalPengajuan: reservasi paling cepat H+2 (hari ini dan besok diblokir).
func tanggalMinimalPengajuan(sekarang time.Time) time.Time {
	awalHari := time.Date(sekarang.Year(), sekarang.Month(), sekarang.Day(), 0, 0, 0, 0, sekarang.Location())
	return awalHari.AddDate(0, 0, hariMinimalPengajuan)
}

func validasiBatasPengajuan(mulai, sekarang time.Time) bool {
	awalMulai := time.Date(mulai.Year(), mulai.Month(), mulai.Day(), 0, 0, 0, 0, mulai.Location())
	return !awalMulai.Before(tanggalMinimalPengajuan(sekarang))
}

// BuatReservasi memvalidasi seluruh aturan lalu menyimpan reservasi baru.
func BuatReservasi(userID int, in BuatReservasiInput) (int64, error) {
	if in.RuanganID == nil && len(in.Alat) == 0 {
		return 0, errReservasi(http.StatusBadRequest, "Reservasi harus memuat minimal satu ruangan atau alat")
	}

	in.Alasan = strings.TrimSpace(in.Alasan)
	if in.Alasan == "" {
		return 0, errReservasi(http.StatusBadRequest, "Alasan peminjaman wajib diisi")
	}
	if len(in.Alasan) > 255 {
		return 0, errReservasi(http.StatusBadRequest, "Alasan peminjaman maksimal 255 karakter")
	}

	if !in.WaktuSelesai.After(in.WaktuMulai) {
		return 0, errReservasi(http.StatusBadRequest, "Waktu selesai harus setelah waktu mulai")
	}
	if !validasiSlot(in.WaktuMulai) || !validasiSlot(in.WaktuSelesai) {
		return 0, errReservasi(http.StatusBadRequest, "Waktu reservasi harus menggunakan slot 30 menit")
	}
	if !validasiJamOperasional(in.WaktuMulai, in.WaktuSelesai) {
		return 0, errReservasi(http.StatusBadRequest, "Reservasi hanya dapat dilakukan pada jam 07:00 - 20:00")
	}
	if !validasiBatasPengajuan(in.WaktuMulai, waktuSekarangWIBSebagaiWallUTC()) {
		return 0, errReservasi(http.StatusBadRequest, "Reservasi paling cepat diajukan untuk 2 hari ke depan")
	}

	if in.RuanganID != nil {
		ruangan, err := repositories.GetRuanganById(*in.RuanganID)
		if errors.Is(err, sql.ErrNoRows) {
			return 0, errReservasi(http.StatusNotFound, "Ruangan tidak ditemukan")
		}
		if err != nil {
			return 0, err
		}
		if !ruanganTersedia(ruangan.Status) {
			return 0, errReservasi(http.StatusConflict, "Ruangan sedang tidak dapat dipakai")
		}
		if in.JumlahPeserta == nil {
			return 0, errReservasi(http.StatusBadRequest, "Jumlah peserta wajib diisi untuk reservasi ruangan")
		}
		if *in.JumlahPeserta <= 0 {
			return 0, errReservasi(http.StatusBadRequest, "Jumlah peserta harus lebih dari nol")
		}
		if *in.JumlahPeserta > ruangan.Kapasitas {
			return 0, errReservasi(http.StatusBadRequest, "Jumlah peserta melebihi kapasitas ruangan (%d)", ruangan.Kapasitas)
		}
	}

	alatDipakai := make(map[int]bool)
	for _, a := range in.Alat {
		if alatDipakai[a.AlatId] {
			return 0, errReservasi(http.StatusBadRequest, "Alat yang sama tidak boleh diminta dua kali")
		}
		alatDipakai[a.AlatId] = true

		alat, err := repositories.GetAlatById(a.AlatId)
		if errors.Is(err, sql.ErrNoRows) {
			return 0, errReservasi(http.StatusNotFound, "Alat dengan id %d tidak ditemukan", a.AlatId)
		}
		if err != nil {
			return 0, err
		}
		if a.Jumlah <= 0 {
			return 0, errReservasi(http.StatusBadRequest, "Jumlah alat %s harus lebih dari nol", alat.Nama)
		}
		if a.Jumlah > alat.BanyakAlat {
			return 0, errReservasi(http.StatusBadRequest, "Jumlah %s melebihi stok (%d)", alat.Nama, alat.BanyakAlat)
		}
		if alat.Status == 0 {
			return 0, errReservasi(http.StatusConflict, "Alat %s sedang tidak dapat dipakai", alat.Nama)
		}
	}

	// Aturan per akun: ruangan bersifat eksklusif, satu akun tidak boleh
	// double-booking ruangan & slot yang sama. Untuk alat tidak ada batasan
	// per-akun berbasis existence — hanya cek stok global berbasis availability
	// (TotalAlatTerpakai) supaya sisa stok tetap bisa dipinjam.
	// Contoh: stok 5, sudah dipinjam 2, sisa 3 masih boleh dipinjam.
	if in.RuanganID != nil {
		bentrok, err := repositories.IsRuanganDipesanUser(userID, *in.RuanganID, in.WaktuMulai, in.WaktuSelesai, 0)
		if err != nil {
			return 0, err
		}
		if bentrok {
			return 0, errReservasi(http.StatusConflict, "Kamu sudah punya reservasi di ruangan ini pada slot waktu tersebut")
		}
	}

	// Bentrok global: yang sudah disetujui memblokir semua akun.
	if in.RuanganID != nil {
		bentrok, err := repositories.IsRuanganBentrokGlobal(*in.RuanganID, in.WaktuMulai, in.WaktuSelesai, 0)
		if err != nil {
			return 0, err
		}
		if bentrok {
			return 0, errReservasi(http.StatusConflict, "Ruangan sudah dipakai pada waktu tersebut")
		}
	}
	for _, a := range in.Alat {
		alat, err := repositories.GetAlatById(a.AlatId)
		if err != nil {
			return 0, err
		}
		terpakai, err := repositories.TotalAlatTerpakai(a.AlatId, in.WaktuMulai, in.WaktuSelesai, 0)
		if err != nil {
			return 0, err
		}
		if terpakai+a.Jumlah > alat.BanyakAlat {
			return 0, errReservasi(http.StatusConflict, "Stok %s tidak cukup pada slot waktu tersebut", alat.Nama)
		}
	}

	return repositories.CreateReservasi(in.RuanganID, in.Alat, userID, in.WaktuMulai, in.WaktuSelesai, in.Alasan, in.JumlahPeserta)
}

func ApproveReservasi(id, petugasID int) error {
	if err := repositories.SinkronisasiStatusReservasi(); err != nil {
		return err
	}

	reservasi, ada, err := repositories.GetReservasiById(id)
	if err != nil {
		return err
	}
	if !ada {
		return errReservasi(http.StatusNotFound, "Reservasi tidak ditemukan")
	}
	if reservasi.StatusKode != models.ReservasiPending {
		return errReservasi(http.StatusConflict, "Hanya reservasi berstatus menunggu yang bisa disetujui")
	}
	if err := validasiStatusFasilitasReservasi(reservasi); err != nil {
		return err
	}

	mulai, err := ParseWaktu(reservasi.WaktuPeminjaman)
	if err != nil {
		return err
	}
	selesai, err := ParseWaktu(reservasi.WaktuPeminjamanSelesai)
	if err != nil {
		return err
	}

	if reservasi.RuanganId != nil {
		bentrok, err := repositories.IsRuanganBentrokGlobal(*reservasi.RuanganId, mulai, selesai, id)
		if err != nil {
			return err
		}
		if bentrok {
			return errReservasi(http.StatusConflict, "Ruangan sudah dipakai pada slot tersebut, tidak bisa disetujui")
		}
	}
	for _, a := range reservasi.Alat {
		alat, err := repositories.GetAlatById(a.Id)
		if err != nil {
			return err
		}
		terpakai, err := repositories.TotalAlatTerpakai(a.Id, mulai, selesai, id)
		if err != nil {
			return err
		}
		if terpakai+a.Jumlah > alat.BanyakAlat {
			return errReservasi(http.StatusConflict, "Stok %s tidak cukup pada slot tersebut, tidak bisa disetujui", alat.Nama)
		}
	}

	return repositories.ApproveReservasi(id, petugasID)
}

func validasiStatusFasilitasReservasi(reservasi models.Reservasi) error {
	if reservasi.RuanganId != nil {
		ruangan, err := repositories.GetRuanganById(*reservasi.RuanganId)
		if errors.Is(err, sql.ErrNoRows) {
			return errReservasi(http.StatusConflict, "Ruangan reservasi sudah tidak tersedia. Tolak reservasi ini.")
		}
		if err != nil {
			return err
		}
		if !ruanganTersedia(ruangan.Status) {
			status := "nonaktif"
			if strings.Contains(strings.ToLower(ruangan.Status), "perbaik") {
				status = "dalam perbaikan"
			}
			return errReservasi(http.StatusConflict,
				"Reservasi tidak dapat disetujui karena ruangan %q sedang %s. Tolak reservasi ini dan jelaskan alasannya.", ruangan.Nama, status)
		}
	}

	for _, item := range reservasi.Alat {
		alat, err := repositories.GetAlatById(item.Id)
		if errors.Is(err, sql.ErrNoRows) {
			return errReservasi(http.StatusConflict, "Alat %q sudah tidak tersedia. Tolak reservasi ini.", item.Nama)
		}
		if err != nil {
			return err
		}
		if alat.Status == 0 {
			return errReservasi(http.StatusConflict,
				"Reservasi tidak dapat disetujui karena alat %q sedang nonaktif atau dalam perbaikan. Tolak reservasi ini.", alat.Nama)
		}
	}
	return nil
}

func RejectReservasi(id, petugasID int, alasan string) error {
	if err := repositories.SinkronisasiStatusReservasi(); err != nil {
		return err
	}

	alasan = strings.TrimSpace(alasan)
	if alasan == "" {
		return errReservasi(http.StatusBadRequest, "Alasan penolakan wajib diisi")
	}

	reservasi, ada, err := repositories.GetReservasiById(id)
	if err != nil {
		return err
	}
	if !ada {
		return errReservasi(http.StatusNotFound, "Reservasi tidak ditemukan")
	}
	if reservasi.StatusKode != models.ReservasiPending {
		return errReservasi(http.StatusConflict, "Hanya reservasi berstatus menunggu yang bisa ditolak")
	}

	return repositories.RejectReservasi(id, petugasID, alasan)
}

// validasiBatasPembatalan menolak pembatalan yang lewat batasBatalSebelumMulai
// sebelum waktu mulai. Berlaku untuk pembatalan oleh pengguna maupun petugas.
func validasiBatasPembatalan(reservasi models.Reservasi) error {
	return validasiBatasPembatalanPada(reservasi, waktuSekarangWIBSebagaiWallUTC())
}

func validasiBatasPembatalanPada(reservasi models.Reservasi, sekarang time.Time) error {
	mulai, err := ParseWaktu(reservasi.WaktuPeminjaman)
	if err != nil {
		return err
	}
	if !sekarang.Before(mulai.Add(-batasBatalSebelumMulai)) {
		return errReservasi(http.StatusConflict, "Pembatalan paling lambat 2 jam sebelum waktu mulai")
	}
	return nil
}

func CancelReservasiPengguna(id, userID int, alasan string) error {
	if err := repositories.SinkronisasiStatusReservasi(); err != nil {
		return err
	}

	alasan = strings.TrimSpace(alasan)
	if alasan == "" {
		return errReservasi(http.StatusBadRequest, "Alasan pembatalan wajib diisi")
	}

	reservasi, ada, err := repositories.GetReservasiById(id)
	if err != nil {
		return err
	}
	if !ada || reservasi.UserId != userID {
		return errReservasi(http.StatusNotFound, "Reservasi tidak ditemukan")
	}
	if reservasi.StatusKode != models.ReservasiPending && reservasi.StatusKode != models.ReservasiApproved {
		return errReservasi(http.StatusConflict, "Reservasi sudah tidak bisa dibatalkan")
	}

	if err := validasiBatasPembatalan(reservasi); err != nil {
		return err
	}

	return repositories.CancelReservasi(id, &userID, alasan)
}

func CancelReservasiPetugas(id, petugasID int, alasan string) error {
	if err := repositories.SinkronisasiStatusReservasi(); err != nil {
		return err
	}

	alasan = strings.TrimSpace(alasan)
	if alasan == "" {
		return errReservasi(http.StatusBadRequest, "Alasan pembatalan wajib diisi")
	}

	reservasi, ada, err := repositories.GetReservasiById(id)
	if err != nil {
		return err
	}
	if !ada {
		return errReservasi(http.StatusNotFound, "Reservasi tidak ditemukan")
	}
	if reservasi.StatusKode != models.ReservasiPending && reservasi.StatusKode != models.ReservasiApproved {
		return errReservasi(http.StatusConflict, "Reservasi sudah tidak bisa dibatalkan")
	}

	// Petugas mengikuti batas yang sama dengan pemohon: tidak ada pembatalan
	// dua jam terakhir sebelum jadwal, termasuk untuk batal darurat.
	if err := validasiBatasPembatalan(reservasi); err != nil {
		return err
	}

	return repositories.CancelReservasi(id, &petugasID, alasan)
}

func ruanganTersedia(status string) bool {
	switch strings.ToLower(strings.TrimSpace(status)) {
	case "aktif", "1", "avail", "tersedia":
		return true
	default:
		return false
	}
}

// statusSlotRuangan: APPROVED mengunci slot, PENDING hanya menandainya
// "menunggu" tanpa memblokir pemohon lain, fasilitas nonaktif selalu tertutup.
func statusSlotRuangan(r models.Ruangan, slotMulai, slotSelesai time.Time, usage []repositories.ReservasiTerpakai) models.SlotKetersediaan {
	if !ruanganTersedia(r.Status) {
		return models.SlotKetersediaan{
			Mulai:   slotMulai.Format("15:04"),
			Selesai: slotSelesai.Format("15:04"),
			Status:  models.SlotNonaktif,
		}
	}

	menunggu := false
	for _, u := range usage {
		if u.RuanganId == nil || *u.RuanganId != r.Id || !u.Mulai.Before(slotSelesai) || !u.Selesai.After(slotMulai) {
			continue
		}
		if u.StatusKode == models.ReservasiApproved {
			return models.SlotKetersediaan{
				Mulai:   slotMulai.Format("15:04"),
				Selesai: slotSelesai.Format("15:04"),
				Status:  models.SlotTerpakai,
			}
		}
		menunggu = true
	}

	status := models.SlotTersedia
	if menunggu {
		status = models.SlotMenunggu
	}
	return models.SlotKetersediaan{
		Mulai:    slotMulai.Format("15:04"),
		Selesai:  slotSelesai.Format("15:04"),
		Tersedia: true,
		Status:   status,
	}
}

// statusSlotAlat: kuota hanya berkurang oleh APPROVED; PENDING sekadar
// menandai slot "menunggu" selama stok masih ada.
func statusSlotAlat(a models.Alat, slotMulai, slotSelesai time.Time, usage []repositories.ReservasiTerpakai) models.SlotKetersediaan {
	if a.Status == 0 {
		return models.SlotKetersediaan{
			Mulai:   slotMulai.Format("15:04"),
			Selesai: slotSelesai.Format("15:04"),
			Status:  models.SlotNonaktif,
		}
	}

	terpakai := 0
	menunggu := false
	for _, u := range usage {
		if u.AlatId == nil || *u.AlatId != a.Id || !u.Mulai.Before(slotSelesai) || !u.Selesai.After(slotMulai) {
			continue
		}
		if u.StatusKode == models.ReservasiApproved {
			terpakai += u.Jumlah
		} else {
			menunggu = true
		}
	}

	status := models.SlotTersedia
	tersedia := terpakai < a.BanyakAlat
	if !tersedia {
		status = models.SlotTerpakai
	} else if menunggu {
		status = models.SlotMenunggu
	}
	return models.SlotKetersediaan{
		Mulai:    slotMulai.Format("15:04"),
		Selesai:  slotSelesai.Format("15:04"),
		Tersedia: tersedia,
		Status:   status,
	}
}

// Ketersediaan menghitung slot 30 menit untuk semua fasilitas selama beberapa hari.
// Hanya reservasi APPROVED yang memblokir (aturan global); PENDING ditandai "menunggu".
func Ketersediaan(tipe string, tanggalMulai time.Time, jumlahHari int) ([]models.KetersediaanFasilitas, error) {
	if jumlahHari <= 0 {
		jumlahHari = 1
	}

	awal := time.Date(tanggalMulai.Year(), tanggalMulai.Month(), tanggalMulai.Day(), 0, 0, 0, 0, tanggalMulai.Location())
	akhir := awal.AddDate(0, 0, jumlahHari)
	usage, err := repositories.ListReservasiAktifRange(awal, akhir)
	if err != nil {
		return nil, err
	}

	hasil := make([]models.KetersediaanFasilitas, 0)

	if tipe == "" || tipe == models.TipeFasilitasRuangan {
		ruangan, err := repositories.ListRuangan()
		if err != nil {
			return nil, err
		}
		for _, r := range ruangan {
			ketersediaan := models.KetersediaanFasilitas{
				Id:     models.TipeFasilitasRuangan + "-" + fmt.Sprint(r.Id),
				RefId:  r.Id,
				Tipe:   models.TipeFasilitasRuangan,
				Nama:   r.Nama,
				Lokasi: r.Lokasi,
				Hari:   make([]models.KetersediaanHari, 0, jumlahHari),
			}
			for hari := 0; hari < jumlahHari; hari++ {
				tanggal := awal.AddDate(0, 0, hari)
				blok := models.KetersediaanHari{Tanggal: tanggal.Format("2006-01-02"), Slot: make([]models.SlotKetersediaan, 0)}
				for menit := jamOperasionalMulaiMenit; menit < jamOperasionalSelesaiMenit; menit += menitSlot {
					slotMulai := tanggal.Add(time.Duration(menit) * time.Minute)
					slotSelesai := slotMulai.Add(menitSlot * time.Minute)
					blok.Slot = append(blok.Slot, statusSlotRuangan(r, slotMulai, slotSelesai, usage))
				}
				ketersediaan.Hari = append(ketersediaan.Hari, blok)
			}
			hasil = append(hasil, ketersediaan)
		}
	}

	if tipe == "" || tipe == models.TipeFasilitasAlat {
		alat, err := repositories.ListAlat()
		if err != nil {
			return nil, err
		}
		for _, a := range alat {
			ketersediaan := models.KetersediaanFasilitas{
				Id:     models.TipeFasilitasAlat + "-" + fmt.Sprint(a.Id),
				RefId:  a.Id,
				Tipe:   models.TipeFasilitasAlat,
				Nama:   a.Nama,
				Lokasi: alatLokasiDefault,
				Hari:   make([]models.KetersediaanHari, 0, jumlahHari),
			}
			for hari := 0; hari < jumlahHari; hari++ {
				tanggal := awal.AddDate(0, 0, hari)
				blok := models.KetersediaanHari{Tanggal: tanggal.Format("2006-01-02"), Slot: make([]models.SlotKetersediaan, 0)}
				for menit := jamOperasionalMulaiMenit; menit < jamOperasionalSelesaiMenit; menit += menitSlot {
					slotMulai := tanggal.Add(time.Duration(menit) * time.Minute)
					slotSelesai := slotMulai.Add(menitSlot * time.Minute)
					blok.Slot = append(blok.Slot, statusSlotAlat(a, slotMulai, slotSelesai, usage))
				}
				ketersediaan.Hari = append(ketersediaan.Hari, blok)
			}
			hasil = append(hasil, ketersediaan)
		}
	}

	return hasil, nil
}
