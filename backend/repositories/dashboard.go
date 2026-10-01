package repositories

import (
	"backend-ppk/config"
	"backend-ppk/models"
	"database/sql"
	"fmt"
	"strconv"
	"strings"
)

func GetDashboardOverview() (*models.DashboardOverview, error) {
	var ov models.DashboardOverview

	// 1. Fasilitas
	_ = config.QueryRow(`
		SELECT 
			COUNT(*),
			COALESCE(SUM(CASE WHEN status = 1 OR status = '1' OR status = 'aktif' THEN 1 ELSE 0 END), 0),
			COALESCE(SUM(CASE WHEN status = 2 OR status = '2' OR status = 'dalam_perbaikan' THEN 1 ELSE 0 END), 0),
			COALESCE(SUM(CASE WHEN status = 0 OR status = '0' OR status = 'nonaktif' THEN 1 ELSE 0 END), 0)
		FROM ruangan`).Scan(&ov.Fasilitas.Ruangan, &ov.Fasilitas.Aktif, &ov.Fasilitas.DalamPerbaikan, &ov.Fasilitas.Nonaktif)

	var alatTotal, alatAktif, alatNonaktif int
	_ = config.QueryRow(`
		SELECT 
			COUNT(*),
			COALESCE(SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END), 0),
			COALESCE(SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END), 0)
		FROM alat`).Scan(&alatTotal, &alatAktif, &alatNonaktif)

	ov.Fasilitas.Alat = alatTotal
	ov.Fasilitas.Total = ov.Fasilitas.Ruangan + alatTotal
	ov.Fasilitas.Aktif += alatAktif
	ov.Fasilitas.Nonaktif += alatNonaktif

	// 2. Reservasi
	_ = config.QueryRow(`
		SELECT 
			COUNT(*),
			COALESCE(SUM(CASE WHEN UPPER(status) = 'PENDING' THEN 1 ELSE 0 END), 0),
			COALESCE(SUM(CASE WHEN UPPER(status) = 'APPROVED' THEN 1 ELSE 0 END), 0),
			COALESCE(SUM(CASE WHEN UPPER(status) = 'REJECTED' THEN 1 ELSE 0 END), 0),
			COALESCE(SUM(CASE WHEN UPPER(status) = 'CANCELLED' THEN 1 ELSE 0 END), 0),
			COALESCE(SUM(CASE WHEN UPPER(status) = 'COMPLETED' THEN 1 ELSE 0 END), 0)
		FROM reservasi`).Scan(
		&ov.Reservasi.Total,
		&ov.Reservasi.Menunggu,
		&ov.Reservasi.Disetujui,
		&ov.Reservasi.Ditolak,
		&ov.Reservasi.Dibatalkan,
		&ov.Reservasi.Selesai,
	)

	// 3. Laporan
	_ = config.QueryRow(`
		SELECT 
			COUNT(*),
			COALESCE(SUM(CASE WHEN LOWER(status_laporan) = 'baru' THEN 1 ELSE 0 END), 0),
			COALESCE(SUM(CASE WHEN LOWER(status_laporan) = 'diproses' THEN 1 ELSE 0 END), 0),
			COALESCE(SUM(CASE WHEN LOWER(status_laporan) = 'selesai' THEN 1 ELSE 0 END), 0),
			COALESCE(SUM(CASE WHEN LOWER(status_laporan) = 'ditolak' THEN 1 ELSE 0 END), 0)
		FROM report`).Scan(
		&ov.Laporan.Total,
		&ov.Laporan.Baru,
		&ov.Laporan.Diproses,
		&ov.Laporan.Selesai,
		&ov.Laporan.Ditolak,
	)

	// 4. Pengguna
	_ = config.QueryRow(`
		SELECT 
			COUNT(*),
			COALESCE(SUM(CASE WHEN isVerified = 1 THEN 1 ELSE 0 END), 0),
			COALESCE(SUM(CASE WHEN isVerified = 0 THEN 1 ELSE 0 END), 0),
			COALESCE(SUM(CASE WHEN user_role = 2 THEN 1 ELSE 0 END), 0),
			COALESCE(SUM(CASE WHEN user_role = 1 THEN 1 ELSE 0 END), 0)
		FROM user`).Scan(
		&ov.Pengguna.Total,
		&ov.Pengguna.Terverifikasi,
		&ov.Pengguna.MenungguVerifikasi,
		&ov.Pengguna.Petugas,
		&ov.Pengguna.Admin,
	)

	_ = config.QueryRow(`SELECT COUNT(*) FROM mahasiswa`).Scan(&ov.Pengguna.Mahasiswa)
	_ = config.QueryRow(`SELECT COUNT(*) FROM dosen`).Scan(&ov.Pengguna.Dosen)
	_ = config.QueryRow(`SELECT COUNT(*) FROM staff`).Scan(&ov.Pengguna.Staff)

	// 5. Okupansi
	_ = config.QueryRow(`
		SELECT 
			COALESCE(SUM(TIMESTAMPDIFF(MINUTE, waktu_peminjaman, waktu_peminjaman_selesai)), 0) / 60.0,
			COUNT(*)
		FROM reservasi
		WHERE UPPER(status_reservasi) = 'APPROVED'`).Scan(
		&ov.Okupansi.TotalJamPemakaian,
		&ov.Okupansi.TotalDisetujui,
	)

	return &ov, nil
}

func GetOccupancyRekap(mode, gedung, fasilitasId string) ([]models.OccupancyRekapItem, error) {
	var items []models.OccupancyRekapItem

	// 1. Ruangan
	ruanganQuery := `
		SELECT 
			r.id, 
			r.nama_ruangan, 
			COALESCE(k.nama_kategori, 'Ruangan'), 
			r.lokasi, 
			r.status,
			COALESCE(res.total_disetujui, 0),
			COALESCE(res.total_jam_pakai, 0),
			COALESCE(res.total_permohonan, 0),
			COALESCE(rep.total_laporan, 0)
		FROM ruangan r
		LEFT JOIN kategori k ON k.id = r.kategori
		LEFT JOIN (
			SELECT 
				ruangan_reservasi,
				COUNT(*) as total_permohonan,
				COALESCE(SUM(CASE WHEN UPPER(status_reservasi) = 'APPROVED' THEN 1 ELSE 0 END), 0) as total_disetujui,
				COALESCE(SUM(CASE WHEN UPPER(status_reservasi) = 'APPROVED' THEN TIMESTAMPDIFF(MINUTE, waktu_peminjaman, waktu_peminjaman_selesai) ELSE 0 END), 0) / 60.0 as total_jam_pakai
			FROM reservasi
			GROUP BY ruangan_reservasi
		) res ON res.ruangan_reservasi = r.id
		LEFT JOIN (
			SELECT report_ruangan, COUNT(*) as total_laporan
			FROM report
			WHERE report_ruangan IS NOT NULL
			GROUP BY report_ruangan
		) rep ON rep.report_ruangan = r.id
		ORDER BY r.nama_ruangan`

	rows, err := config.Query(ruanganQuery)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var (
			id             int
			nama           string
			tipe           string
			lokasi         string
			statusRaw      string
			totalDisetujui int
			totalJamPakai  float64
			totalPermohonan int
			totalLaporan   int
		)
		if err := rows.Scan(&id, &nama, &tipe, &lokasi, &statusRaw, &totalDisetujui, &totalJamPakai, &totalPermohonan, &totalLaporan); err != nil {
			return nil, err
		}

		var status string
		switch statusRaw {
		case "2", "dalam_perbaikan":
			status = "Perbaikan"
		case "0", "nonaktif":
			status = "Nonaktif"
		default:
			status = "Aktif"
		}

		fId := fmt.Sprintf("ruangan-%d", id)

		// Filter
		if mode == "gedung" && gedung != "" && gedung != "Pilih" && lokasi != gedung {
			continue
		}
		if mode == "fasilitas" && fasilitasId != "" && fasilitasId != "Pilih" {
			if fasilitasId != fId && fasilitasId != strconv.Itoa(id) {
				continue
			}
		}

		items = append(items, models.OccupancyRekapItem{
			FasilitasID:     fId,
			NamaFasilitas:   nama,
			Tipe:            tipe,
			Lokasi:          lokasi,
			Status:          status,
			TotalDisetujui:  totalDisetujui,
			TotalJamPakai:   totalJamPakai,
			TotalPermohonan: totalPermohonan,
			TotalLaporan:    totalLaporan,
		})
	}

	// 2. Alat
	if mode != "gedung" || gedung == "Gudang Sarana" || gedung == "" || gedung == "Pilih" {
		alatQuery := `
			SELECT 
				a.id, 
				a.nama_alat, 
				COALESCE(k.nama_kategori, 'Alat'), 
				a.status,
				COALESCE(res.total_disetujui, 0),
				COALESCE(res.total_jam_pakai, 0),
				COALESCE(res.total_permohonan, 0),
				COALESCE(rep.total_laporan, 0)
			FROM alat a
			LEFT JOIN kategori k ON k.id = a.kategori
			LEFT JOIN (
				SELECT 
					ar.id_alat,
					COUNT(DISTINCT r.id) as total_permohonan,
					COALESCE(SUM(CASE WHEN UPPER(r.status_reservasi) = 'APPROVED' THEN 1 ELSE 0 END), 0) as total_disetujui,
					COALESCE(SUM(CASE WHEN UPPER(r.status_reservasi) = 'APPROVED' THEN TIMESTAMPDIFF(MINUTE, r.waktu_peminjaman, r.waktu_peminjaman_selesai) ELSE 0 END), 0) / 60.0 as total_jam_pakai
				FROM alat_reservasi ar
				JOIN reservasi r ON r.id = ar.id_reservasi
				GROUP BY ar.id_alat
			) res ON res.id_alat = a.id
			LEFT JOIN (
				SELECT report_alat, COUNT(*) as total_laporan
				FROM report
				WHERE report_alat IS NOT NULL
				GROUP BY report_alat
			) rep ON rep.report_alat = a.id
			ORDER BY a.nama_alat`

		rowsAlat, err := config.Query(alatQuery)
		if err == nil {
			defer rowsAlat.Close()
			for rowsAlat.Next() {
				var (
					id             int
					nama           string
					tipe           string
					statusRaw      int
					totalDisetujui int
					totalJamPakai  float64
					totalPermohonan int
					totalLaporan   int
				)
				if err := rowsAlat.Scan(&id, &nama, &tipe, &statusRaw, &totalDisetujui, &totalJamPakai, &totalPermohonan, &totalLaporan); err != nil {
					continue
				}

				status := "Aktif"
				if statusRaw == 0 {
					status = "Nonaktif"
				}

				fId := fmt.Sprintf("alat-%d", id)

				if mode == "fasilitas" && fasilitasId != "" && fasilitasId != "Pilih" {
					if fasilitasId != fId && fasilitasId != strconv.Itoa(id) {
						continue
					}
				}

				items = append(items, models.OccupancyRekapItem{
					FasilitasID:     fId,
					NamaFasilitas:   nama,
					Tipe:            tipe,
					Lokasi:          "Gudang Sarana",
					Status:          status,
					TotalDisetujui:  totalDisetujui,
					TotalJamPakai:   totalJamPakai,
					TotalPermohonan: totalPermohonan,
					TotalLaporan:    totalLaporan,
				})
			}
		}
	}

	return items, nil
}

func GetReportsRekap(status, kategori, q string) ([]models.ReportRekapItem, error) {
	baseQuery := `
		SELECT 
			r.id, 
			r.waktu_dibuat, 
			COALESCE(u.username, ''), 
			COALESCE(ru.nama_ruangan, al.nama_alat, 'Umum'),
			CASE WHEN r.report_ruangan IS NOT NULL THEN 'Ruangan' WHEN r.report_alat IS NOT NULL THEN 'Alat' ELSE 'Lainnya' END,
			r.kategori_laporan,
			r.alasan,
			r.status_laporan,
			r.catatan_resolusi
		FROM report r
		LEFT JOIN user u ON u.id = r.user_report
		LEFT JOIN ruangan ru ON ru.id = r.report_ruangan
		LEFT JOIN alat al ON al.id = r.report_alat
		WHERE 1=1`

	var args []any
	if status != "" && status != "semua" {
		baseQuery += " AND LOWER(r.status_laporan) = ?"
		args = append(args, strings.ToLower(status))
	}
	if kategori != "" && kategori != "semua" {
		baseQuery += " AND r.kategori_laporan = ?"
		args = append(args, kategori)
	}

	baseQuery += " ORDER BY r.waktu_dibuat DESC"

	rows, err := config.Query(baseQuery, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []models.ReportRekapItem
	qLower := strings.ToLower(strings.TrimSpace(q))

	for rows.Next() {
		var (
			it        models.ReportRekapItem
			catatan   sql.NullString
			waktu     any
		)
		err := rows.Scan(
			&it.ID, &waktu, &it.Pelapor, &it.Fasilitas, &it.TipeFasilitas,
			&it.KategoriLaporan, &it.Alasan, &it.Status, &catatan,
		)
		if err != nil {
			return nil, err
		}
		it.WaktuDibuat = fmt.Sprintf("%v", waktu)
		if catatan.Valid && catatan.String != "" {
			t := catatan.String
			it.CatatanResolusi = &t
		}

		if qLower != "" {
			match := strings.Contains(strings.ToLower(it.Pelapor), qLower) ||
				strings.Contains(strings.ToLower(it.Fasilitas), qLower) ||
				strings.Contains(strings.ToLower(it.Alasan), qLower)
			if !match {
				continue
			}
		}

		list = append(list, it)
	}

	return list, nil
}
