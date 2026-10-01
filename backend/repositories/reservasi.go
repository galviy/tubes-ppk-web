package repositories

import (
	"backend-ppk/config"
	"backend-ppk/models"
	"database/sql"
	"strings"
	"time"
)

const waktuLayout = "2006-01-02 15:04:05"

// execer dipenuhi oleh *sql.DB dan *sql.Tx, supaya fungsi riwayat bisa
// dipakai baik di luar maupun di dalam transaksi.
type execer interface {
	Exec(query string, args ...any) (sql.Result, error)
}

type ReservasiAlatRequest struct {
	AlatId int
	Jumlah int
}

type ReservasiFilter struct {
	UserId *int
	Tipe   string
	Status string
	Limit  int
	Offset int
}

// ReservasiTerpakai adalah satu baris reservasi aktif (PENDING atau APPROVED)
// pada rentang waktu tertentu. PENDING hanya menandai slot "menunggu", bukan
// mengunci; APPROVED yang mengunci kuota ruangan/alat.
type ReservasiTerpakai struct {
	ReservasiId int
	RuanganId   *int
	AlatId      *int
	Jumlah      int
	Mulai       time.Time
	Selesai     time.Time
	StatusKode  string
}

func intPtr(n sql.NullInt64) *int {
	if !n.Valid {
		return nil
	}
	v := int(n.Int64)
	return &v
}

func GetRuanganById(id int) (models.Ruangan, error) {
	var r models.Ruangan
	err := config.QueryRow(`
		SELECT r.id, r.nama_ruangan, r.status, r.kapasitas, r.lokasi, COALESCE(k.nama_kategori, '')
		FROM ruangan r
		LEFT JOIN kategori k ON k.id = r.kategori
		WHERE r.id = ?`, id).
		Scan(&r.Id, &r.Nama, &r.Status, &r.Kapasitas, &r.Lokasi, &r.Kategori)
	return r, err
}

func GetAlatById(id int) (models.Alat, error) {
	var a models.Alat
	err := config.QueryRow(`
		SELECT a.id, a.nama_alat, a.jumlah_tersedia, a.banyak_alat, a.status, COALESCE(k.nama_kategori, '')
		FROM alat a
		LEFT JOIN kategori k ON k.id = a.kategori
		WHERE a.id = ?`, id).
		Scan(&a.Id, &a.Nama, &a.JumlahTersedia, &a.BanyakAlat, &a.Status, &a.Kategori)
	return a, err
}

func execRiwayat(e execer, idReservasi int, status string, diubahOleh *int, keterangan *string) error {
	_, err := e.Exec(`
		INSERT INTO reservasi_riwayat (id_reservasi, status_reservasi, diubah_oleh, keterangan, waktu)
		VALUES (?, ?, ?, ?, UTC_TIMESTAMP())`,
		idReservasi, status, diubahOleh, keterangan)
	return err
}

// CreateReservasi membuat reservasi (ruangan opsional + banyak alat) dalam satu transaksi.
func CreateReservasi(ruanganID *int, alat []ReservasiAlatRequest, userID int, mulai, selesai time.Time, alasan string, jumlahPeserta *int) (int64, error) {
	tx, err := config.DB.Begin()
	if err != nil {
		return 0, err
	}
	defer tx.Rollback()

	var ruangan any
	if ruanganID != nil {
		ruangan = *ruanganID
	}
	var peserta any
	if jumlahPeserta != nil {
		peserta = *jumlahPeserta
	}

	result, err := tx.Exec(`
		INSERT INTO reservasi (
			waktu_reservasi_dibuat, ruangan_reservasi, user_reservasi,
			waktu_peminjaman, waktu_peminjaman_selesai, status_reservasi,
			alasan_peminjaman, jumlah_peserta
		) VALUES (UTC_TIMESTAMP(), ?, ?, ?, ?, 'PENDING', ?, ?)`,
		ruangan, userID, mulai, selesai, alasan, peserta)
	if err != nil {
		return 0, err
	}

	reservasiID, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}

	for _, a := range alat {
		if _, err := tx.Exec(`
			INSERT INTO alat_reservasi (id_alat, id_reservasi, jumlah)
			VALUES (?, ?, ?)`, a.AlatId, reservasiID, a.Jumlah); err != nil {
			return 0, err
		}
	}

	if err := execRiwayat(tx, int(reservasiID), models.ReservasiPending, &userID, nil); err != nil {
		return 0, err
	}

	if err := tx.Commit(); err != nil {
		return 0, err
	}
	return reservasiID, nil
}

// IsRuanganBentrokGlobal: ruangan sudah disetujui pada rentang yang bertabrakan.
func IsRuanganBentrokGlobal(ruanganID int, mulai, selesai time.Time, kecualiID int) (bool, error) {
	var exist bool
	err := config.QueryRow(`
		SELECT EXISTS (
			SELECT 1 FROM reservasi
			WHERE ruangan_reservasi = ?
			  AND status_reservasi = 'APPROVED'
			  AND waktu_peminjaman < ?
			  AND waktu_peminjaman_selesai > ?
			  AND id <> ?
		)`, ruanganID, selesai, mulai, kecualiID).Scan(&exist)
	return exist, err
}

// IsRuanganDipesanUser: user yang sama sudah punya reservasi aktif di ruangan & slot itu.
func IsRuanganDipesanUser(userID, ruanganID int, mulai, selesai time.Time, kecualiID int) (bool, error) {
	var exist bool
	err := config.QueryRow(`
		SELECT EXISTS (
			SELECT 1 FROM reservasi
			WHERE user_reservasi = ?
			  AND ruangan_reservasi = ?
			  AND status_reservasi IN ('PENDING', 'APPROVED')
			  AND waktu_peminjaman < ?
			  AND waktu_peminjaman_selesai > ?
			  AND id <> ?
		)`, userID, ruanganID, selesai, mulai, kecualiID).Scan(&exist)
	return exist, err
}

// TotalAlatTerpakai: total unit alat yang sudah disetujui pada rentang waktu itu.
func TotalAlatTerpakai(alatID int, mulai, selesai time.Time, kecualiID int) (int, error) {
	var total int
	err := config.QueryRow(`
		SELECT COALESCE(SUM(ar.jumlah), 0)
		FROM alat_reservasi ar
		JOIN reservasi r ON r.id = ar.id_reservasi
		WHERE ar.id_alat = ?
		  AND r.status_reservasi = 'APPROVED'
		  AND r.waktu_peminjaman < ?
		  AND r.waktu_peminjaman_selesai > ?
		  AND r.id <> ?`, alatID, selesai, mulai, kecualiID).Scan(&total)
	return total, err
}

// IsAlatDipesanUser: user yang sama sudah punya reservasi aktif untuk alat & slot itu.
func IsAlatDipesanUser(userID, alatID int, mulai, selesai time.Time, kecualiID int) (bool, error) {
	var exist bool
	err := config.QueryRow(`
		SELECT EXISTS (
			SELECT 1
			FROM alat_reservasi ar
			JOIN reservasi r ON r.id = ar.id_reservasi
			WHERE ar.id_alat = ?
			  AND r.user_reservasi = ?
			  AND r.status_reservasi IN ('PENDING', 'APPROVED')
			  AND r.waktu_peminjaman < ?
			  AND r.waktu_peminjaman_selesai > ?
			  AND r.id <> ?
		)`, alatID, userID, selesai, mulai, kecualiID).Scan(&exist)
	return exist, err
}

func scanReservasiRows(rows *sql.Rows) ([]models.Reservasi, error) {
	defer rows.Close()

	list := make([]models.Reservasi, 0)
	for rows.Next() {
		var (
			item             models.Reservasi
			username         sql.NullString
			ruanganID        sql.NullInt64
			ruanganNama      sql.NullString
			jumlahPeserta    sql.NullInt64
			alasanPeminjaman sql.NullString
			alasanPenolakan  sql.NullString
			alasanPembatalan sql.NullString
			waktuDibatalkan  sql.NullString
		)
		if err := rows.Scan(
			&item.Id, &item.WaktuReservasiDibuat, &item.WaktuPeminjaman, &item.WaktuPeminjamanSelesai,
			&item.StatusKode, &item.UserId, &username, &ruanganID, &ruanganNama, &jumlahPeserta,
			&alasanPeminjaman, &alasanPenolakan, &alasanPembatalan, &waktuDibatalkan,
		); err != nil {
			return nil, err
		}

		item.Status = models.ReservasiStatusKeIndonesia(item.StatusKode)
		item.Username = username.String
		item.RuanganId = intPtr(ruanganID)
		if ruanganNama.Valid {
			nama := ruanganNama.String
			item.RuanganNama = &nama
		}
		item.JumlahPeserta = intPtr(jumlahPeserta)
		if alasanPeminjaman.Valid {
			v := alasanPeminjaman.String
			item.AlasanPeminjaman = &v
		}
		if alasanPenolakan.Valid {
			v := alasanPenolakan.String
			item.AlasanPenolakan = &v
		}
		if alasanPembatalan.Valid {
			v := alasanPembatalan.String
			item.AlasanPembatalan = &v
		}
		if waktuDibatalkan.Valid {
			v := waktuDibatalkan.String
			item.WaktuDibatalkan = &v
		}
		item.Alat = make([]models.ReservasiAlat, 0)
		list = append(list, item)
	}
	return list, rows.Err()
}

const reservasiSelect = `
	SELECT r.id,
	       DATE_FORMAT(r.waktu_reservasi_dibuat, '%Y-%m-%d %H:%i:%s'),
	       DATE_FORMAT(r.waktu_peminjaman, '%Y-%m-%d %H:%i:%s'),
	       DATE_FORMAT(r.waktu_peminjaman_selesai, '%Y-%m-%d %H:%i:%s'),
	       r.status_reservasi,
	       r.user_reservasi,
	       u.username,
	       r.ruangan_reservasi,
	       ru.nama_ruangan,
	       r.jumlah_peserta,
	       r.alasan_peminjaman,
	       (SELECT tr.alasan_penolakan FROM tolak_reservasi tr WHERE tr.id_reservasi = r.id ORDER BY tr.id DESC LIMIT 1),
	       r.alasan_pembatalan,
	       DATE_FORMAT(r.waktu_dibatalkan, '%Y-%m-%d %H:%i:%s')
	FROM reservasi r
	LEFT JOIN user u ON u.id = r.user_reservasi
	LEFT JOIN ruangan ru ON ru.id = r.ruangan_reservasi`

// muatAlat mengisi daftar alat untuk sekumpulan reservasi.
func muatAlat(list []models.Reservasi) error {
	if len(list) == 0 {
		return nil
	}

	idx := make(map[int]int, len(list))
	args := make([]any, 0, len(list))
	for i, item := range list {
		idx[item.Id] = i
		args = append(args, item.Id)
	}

	rows, err := config.Query(`
		SELECT ar.id_reservasi, ar.id_alat, a.nama_alat, ar.jumlah
		FROM alat_reservasi ar
		JOIN alat a ON a.id = ar.id_alat
		WHERE ar.id_reservasi IN (`+placeholders(len(list))+`)
		ORDER BY ar.id`, args...)
	if err != nil {
		return err
	}
	defer rows.Close()

	for rows.Next() {
		var (
			idReservasi int
			alat        models.ReservasiAlat
		)
		if err := rows.Scan(&idReservasi, &alat.Id, &alat.Nama, &alat.Jumlah); err != nil {
			return err
		}
		if i, ok := idx[idReservasi]; ok {
			list[i].Alat = append(list[i].Alat, alat)
		}
	}
	return rows.Err()
}

func placeholders(n int) string {
	if n <= 0 {
		return "NULL"
	}
	return strings.TrimSuffix(strings.Repeat("?,", n), ",")
}

func ListReservasi(filter ReservasiFilter) ([]models.Reservasi, error) {
	var (
		where []string
		args  []any
	)
	if filter.UserId != nil {
		where = append(where, "r.user_reservasi = ?")
		args = append(args, *filter.UserId)
	}
	if filter.Status != "" {
		where = append(where, "r.status_reservasi = ?")
		args = append(args, filter.Status)
	}
	switch filter.Tipe {
	case models.TipeFasilitasRuangan:
		where = append(where, "r.ruangan_reservasi IS NOT NULL")
	case models.TipeFasilitasAlat:
		where = append(where, "EXISTS (SELECT 1 FROM alat_reservasi ar WHERE ar.id_reservasi = r.id)")
	}

	query := reservasiSelect
	if len(where) > 0 {
		query += " WHERE " + strings.Join(where, " AND ")
	}
	query += " ORDER BY r.waktu_reservasi_dibuat DESC, r.id DESC LIMIT ? OFFSET ?"
	args = append(args, filter.Limit, filter.Offset)

	rows, err := config.Query(query, args...)
	if err != nil {
		return nil, err
	}
	list, err := scanReservasiRows(rows)
	if err != nil {
		return nil, err
	}
	if err := muatAlat(list); err != nil {
		return nil, err
	}
	return list, nil
}

func GetReservasiById(id int) (models.Reservasi, bool, error) {
	rows, err := config.Query(reservasiSelect+" WHERE r.id = ?", id)
	if err != nil {
		return models.Reservasi{}, false, err
	}
	list, err := scanReservasiRows(rows)
	if err != nil {
		return models.Reservasi{}, false, err
	}
	if len(list) == 0 {
		return models.Reservasi{}, false, nil
	}
	if err := muatAlat(list); err != nil {
		return models.Reservasi{}, false, err
	}

	riwayat, err := ListRiwayatReservasi(id)
	if err != nil {
		return models.Reservasi{}, false, err
	}
	list[0].Riwayat = riwayat
	return list[0], true, nil
}

func ListRiwayatReservasi(idReservasi int) ([]models.ReservasiRiwayat, error) {
	rows, err := config.Query(`
		SELECT status_reservasi, diubah_oleh, keterangan, DATE_FORMAT(waktu, '%Y-%m-%d %H:%i:%s')
		FROM reservasi_riwayat
		WHERE id_reservasi = ?
		ORDER BY waktu ASC, id ASC`, idReservasi)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := make([]models.ReservasiRiwayat, 0)
	for rows.Next() {
		var (
			r          models.ReservasiRiwayat
			diubahOleh sql.NullInt64
			keterangan sql.NullString
		)
		if err := rows.Scan(&r.Status, &diubahOleh, &keterangan, &r.Waktu); err != nil {
			return nil, err
		}
		r.StatusKode = r.Status
		r.Status = models.ReservasiStatusKeIndonesia(r.Status)
		r.DiubahOleh = intPtr(diubahOleh)
		if keterangan.Valid {
			v := keterangan.String
			r.Keterangan = &v
		}
		list = append(list, r)
	}
	return list, rows.Err()
}

func ApproveReservasi(id, petugasID int) error {
	tx, err := config.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	if _, err := tx.Exec(`
		UPDATE reservasi
		SET status_reservasi = 'APPROVED', disetujui_oleh = ?, waktu_diproses = UTC_TIMESTAMP()
		WHERE id = ?`, petugasID, id); err != nil {
		return err
	}
	if err := execRiwayat(tx, id, models.ReservasiApproved, &petugasID, nil); err != nil {
		return err
	}
	return tx.Commit()
}

func RejectReservasi(id, petugasID int, alasan string) error {
	tx, err := config.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	if _, err := tx.Exec(`
		INSERT INTO tolak_reservasi (alasan_penolakan, id_reservasi) VALUES (?, ?)`,
		alasan, id); err != nil {
		return err
	}
	if _, err := tx.Exec(`
		UPDATE reservasi
		SET status_reservasi = 'REJECTED', waktu_diproses = UTC_TIMESTAMP()
		WHERE id = ?`, id); err != nil {
		return err
	}
	if err := execRiwayat(tx, id, models.ReservasiRejected, &petugasID, &alasan); err != nil {
		return err
	}
	return tx.Commit()
}

func CancelReservasi(id int, olehUserID *int, alasan string) error {
	tx, err := config.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	if _, err := tx.Exec(`
		UPDATE reservasi
		SET status_reservasi = 'CANCELLED', alasan_pembatalan = ?, dibatalkan_oleh = ?,
		    waktu_dibatalkan = UTC_TIMESTAMP(), waktu_diproses = UTC_TIMESTAMP()
		WHERE id = ?`, alasan, olehUserID, id); err != nil {
		return err
	}
	if err := execRiwayat(tx, id, models.ReservasiCancelled, olehUserID, &alasan); err != nil {
		return err
	}
	return tx.Commit()
}

// SinkronisasiStatusReservasi menjalankan aturan berbasis waktu (lazy update):
// PENDING yang lewat batas 2 jam sebelum mulai dibatalkan, APPROVED yang
// sudah lewat waktu selesai menjadi DONE. Setiap perubahan dicatat di riwayat.
func SinkronisasiStatusReservasi() error {
	tx, err := config.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	keteranganBatal := "Dibatalkan otomatis: tidak diproses sebelum 2 jam sebelum jadwal"
	rows, err := tx.Query(`
		SELECT id FROM reservasi
		WHERE status_reservasi = 'PENDING'
		  AND DATE_SUB(waktu_peminjaman, INTERVAL 2 HOUR) <= DATE_ADD(UTC_TIMESTAMP(), INTERVAL 7 HOUR)`)
	if err != nil {
		return err
	}
	var batalIDs []int
	for rows.Next() {
		var id int
		if err := rows.Scan(&id); err != nil {
			rows.Close()
			return err
		}
		batalIDs = append(batalIDs, id)
	}
	rows.Close()
	if err := rows.Err(); err != nil {
		return err
	}

	for _, id := range batalIDs {
		if _, err := tx.Exec(`
			UPDATE reservasi
			SET status_reservasi = 'CANCELLED', alasan_pembatalan = ?, dibatalkan_oleh = NULL,
			    waktu_dibatalkan = UTC_TIMESTAMP(), waktu_diproses = UTC_TIMESTAMP()
			WHERE id = ?`, keteranganBatal, id); err != nil {
			return err
		}
		if err := execRiwayat(tx, id, models.ReservasiCancelled, nil, &keteranganBatal); err != nil {
			return err
		}
	}

	keteranganSelesai := "Reservasi selesai"
	rows, err = tx.Query(`
		SELECT id FROM reservasi
		WHERE status_reservasi = 'APPROVED'
		  AND waktu_peminjaman_selesai <= DATE_ADD(UTC_TIMESTAMP(), INTERVAL 7 HOUR)`)
	if err != nil {
		return err
	}
	var selesaiIDs []int
	for rows.Next() {
		var id int
		if err := rows.Scan(&id); err != nil {
			rows.Close()
			return err
		}
		selesaiIDs = append(selesaiIDs, id)
	}
	rows.Close()
	if err := rows.Err(); err != nil {
		return err
	}

	for _, id := range selesaiIDs {
		if _, err := tx.Exec(`
			UPDATE reservasi SET status_reservasi = 'DONE' WHERE id = ?`, id); err != nil {
			return err
		}
		if err := execRiwayat(tx, id, models.ReservasiDone, nil, &keteranganSelesai); err != nil {
			return err
		}
	}

	return tx.Commit()
}

func CountReservasiMenunggu() (int, error) {
	var total int
	err := config.QueryRow(`
		SELECT COUNT(*) FROM reservasi WHERE status_reservasi = 'PENDING'`).Scan(&total)
	return total, err
}

// ListReservasiAktifRange mengambil reservasi PENDING dan APPROVED yang
// bertabrakan dengan rentang, untuk perhitungan status slot jadwal.
func ListReservasiAktifRange(mulai, selesai time.Time) ([]ReservasiTerpakai, error) {
	rows, err := config.Query(`
		SELECT r.id, r.ruangan_reservasi, ar.id_alat, COALESCE(ar.jumlah, 0),
		       r.waktu_peminjaman, r.waktu_peminjaman_selesai, r.status_reservasi
		FROM reservasi r
		LEFT JOIN alat_reservasi ar ON ar.id_reservasi = r.id
		WHERE r.status_reservasi IN ('PENDING', 'APPROVED')
		  AND r.waktu_peminjaman < ?
		  AND r.waktu_peminjaman_selesai > ?`, selesai, mulai)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := make([]ReservasiTerpakai, 0)
	for rows.Next() {
		var (
			item      ReservasiTerpakai
			ruanganID sql.NullInt64
			alatID    sql.NullInt64
		)
		if err := rows.Scan(&item.ReservasiId, &ruanganID, &alatID, &item.Jumlah, &item.Mulai, &item.Selesai, &item.StatusKode); err != nil {
			return nil, err
		}
		item.RuanganId = intPtr(ruanganID)
		item.AlatId = intPtr(alatID)
		list = append(list, item)
	}
	return list, rows.Err()
}
