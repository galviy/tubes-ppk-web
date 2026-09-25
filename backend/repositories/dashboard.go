package repositories

import "backend-ppk/config"

// CountLaporanBaru menghitung laporan yang belum diproses petugas.
func CountLaporanBaru() (int, error) {
	var total int
	err := config.QueryRow(`
		SELECT COUNT(*) FROM report WHERE status_laporan = 'baru'`).Scan(&total)
	return total, err
}
