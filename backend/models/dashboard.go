package models

type DashboardFacilityStats struct {
	Total          int `json:"total"`
	Ruangan        int `json:"ruangan"`
	Alat           int `json:"alat"`
	Aktif          int `json:"aktif"`
	DalamPerbaikan int `json:"dalam_perbaikan"`
	Nonaktif       int `json:"nonaktif"`
}

type DashboardReservationStats struct {
	Total      int `json:"total"`
	Menunggu   int `json:"menunggu"`
	Disetujui  int `json:"disetujui"`
	Ditolak    int `json:"ditolak"`
	Dibatalkan int `json:"dibatalkan"`
	Selesai    int `json:"selesai"`
}

type DashboardReportStats struct {
	Total    int `json:"total"`
	Baru     int `json:"baru"`
	Diproses int `json:"diproses"`
	Selesai  int `json:"selesai"`
	Ditolak  int `json:"ditolak"`
}

type DashboardUserStats struct {
	Total              int `json:"total"`
	Terverifikasi      int `json:"terverifikasi"`
	MenungguVerifikasi int `json:"menunggu_verifikasi"`
	Mahasiswa          int `json:"mahasiswa"`
	Dosen              int `json:"dosen"`
	Staff              int `json:"staff"`
	Petugas            int `json:"petugas"`
	Admin              int `json:"admin"`
}

type DashboardOccupancyStats struct {
	TotalJamPemakaian float64 `json:"total_jam_pemakaian"`
	TotalDisetujui    int     `json:"total_disetujui"`
}

type DashboardOverview struct {
	Fasilitas DashboardFacilityStats    `json:"fasilitas"`
	Reservasi DashboardReservationStats `json:"reservasi"`
	Laporan   DashboardReportStats      `json:"laporan"`
	Pengguna  DashboardUserStats        `json:"pengguna"`
	Okupansi  DashboardOccupancyStats   `json:"okupansi"`
}

type OccupancyRekapItem struct {
	FasilitasID     string  `json:"fasilitas_id"`
	NamaFasilitas   string  `json:"nama_fasilitas"`
	Tipe            string  `json:"tipe"`
	Lokasi          string  `json:"lokasi"`
	Status          string  `json:"status"`
	TotalDisetujui  int     `json:"total_disetujui"`
	TotalJamPakai   float64 `json:"total_jam_pakai"`
	TotalPermohonan int     `json:"total_permohonan"`
	TotalLaporan    int     `json:"total_laporan"`
}

type ReportRekapItem struct {
	ID              int     `json:"id"`
	WaktuDibuat     string  `json:"waktu_dibuat"`
	Pelapor         string  `json:"pelapor"`
	Fasilitas       string  `json:"fasilitas"`
	TipeFasilitas   string  `json:"tipe_fasilitas"`
	KategoriLaporan string  `json:"kategori_laporan"`
	Alasan          string  `json:"alasan"`
	Status          string  `json:"status"`
	CatatanResolusi *string `json:"catatan_resolusi"`
}

type ReservasiRekapItem struct {
	ID            int     `json:"id"`
	WaktuDibuat   string  `json:"waktu_dibuat"`
	Pemohon       string  `json:"pemohon"`
	Fasilitas     string  `json:"fasilitas"`
	TipeFasilitas string  `json:"tipe_fasilitas"`
	Tanggal       string  `json:"tanggal"`
	Jam           string  `json:"jam"`
	Status        string  `json:"status"`
	Peserta       *int    `json:"peserta"`
	Tujuan        string  `json:"tujuan"`
	AlatPendukung string  `json:"alat_pendukung"`
	Catatan       *string `json:"catatan"`
}

type UserRekapItem struct {
	ID        int    `json:"id"`
	Username  string `json:"username"`
	Email     string `json:"email"`
	Peran     string `json:"peran"`
	Tipe      string `json:"tipe"`
	Identitas string `json:"identitas"`
	Prodi     string `json:"prodi"`
	Fakultas  string `json:"fakultas"`
	Status    string `json:"status"`
}
