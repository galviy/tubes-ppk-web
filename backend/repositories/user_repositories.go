package repositories

import (
	"backend-ppk/config"
	"database/sql"
	"errors"
	"log"
)

type User struct {
	ID         int
	Username   string
	Email      string
	Role       string
	Password   string
	IsVerified bool
}

/*func NewUser(email, role, username string) *Session {
 */

/*
	+------------+--------------+------+-----+---------+----------------+

| Field      | Type         | Null | Key | Default | Extra          |
+------------+--------------+------+-----+---------+----------------+
| id         | int(11)      | NO   | PRI | NULL    | auto_increment |
| username   | varchar(32)  | NO   | UNI | NULL    |                |
| email      | varchar(255) | NO   | UNI | NULL    |                |
| password   | varchar(255) | NO   |     | NULL    |                |
| user_role  | int(11)      | NO   | MUL | NULL    |                |
| isVerified | tinyint(4)   | NO   |     | NULL    |                |
+------------+--------------+------+-----+---------+----------------+
*/

// GetUserByEmail mengembalikan user berdasarkan email, atau nil bila
// tidak ada. Verifikasi password dan status akun dilakukan di service.
func GetUserByEmail(email string) (*User, error) {
	var (
		user       User
		isVerified int
	)

	err := config.QueryRow(`
		SELECT id, username, email, user_role, password, isVerified
		FROM user
		WHERE email = ?
	`, email).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.Role,
		&user.Password,
		&isVerified,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	user.IsVerified = isVerified == 1
	return &user, nil
}

func IsNamaAlatExist(kategori string) bool {
	var hasilAngka int
	err := config.QueryRow(`
		select 1 
		from alat
		where nama_alat = ?
	`, kategori).Scan(&hasilAngka)
	if err == sql.ErrNoRows {
		return false
	} else if err != nil {
		log.Println("Terjadi error pada database:", err)
		return false
	}
	return true
}
func CheckAlatByID(id int) bool {
	var idRuangan int
	err := config.QueryRow(
		`SELECT 1 FROM alat where id = ?`, id).Scan(&idRuangan)
	if err == sql.ErrNoRows {
		return false
	} else if err != nil {
		log.Printf("Failed to get ruangan: %v\n", err)
		return false
	}
	return true
}
func IsAlatAvailable(id int) bool {
	var idRuangan int
	err := config.QueryRow(
		`SELECT 1 FROM alat 
		where id = ? and jumlah_tersedia > 0 and status = 1`, id).Scan(&idRuangan)
	if err == sql.ErrNoRows {
		return false
	} else if err != nil {
		log.Printf("Failed to get ruangan: %v\n", err)
		return false
	}
	return true
}

func IsNamaRuanganExist(kategori string) bool {
	var hasilAngka int
	err := config.QueryRow(`
		select 1 
		from ruangan
		where nama_ruangan = ?
	`, kategori).Scan(&hasilAngka)
	if err == sql.ErrNoRows {
		return false
	} else if err != nil {
		log.Println("Terjadi error pada database:", err)
		return false
	}
	return true
}
func IsKategoriExist(kategori string) bool {
	var hasilAngka int
	err := config.QueryRow(`
		select 1 
		from kategori
		where nama_kategori = ?
	`, kategori).Scan(&hasilAngka)
	if err == sql.ErrNoRows {
		return false
	} else if err != nil {
		log.Println("Terjadi error pada database:", err)
		return false
	}
	return true
}

func IsUserExist(email string, username string) bool {
	var hasilAngka int
	err := config.QueryRow(`
		select 1 
		from user
		where email = ? or username = ?
	`, email, username).Scan(&hasilAngka)
	if err == sql.ErrNoRows {
		return false
	} else if err != nil {
		log.Println("Terjadi error pada database:", err)
		return false
	}
	return true
}

func IsUserIDExist(idUser int) bool {
	var hasilAngka int
	err := config.QueryRow(`
		select 1 
		from user
		where id = ? 
	`, idUser).Scan(&hasilAngka)
	if err == sql.ErrNoRows {
		return false
	} else if err != nil {
		log.Println("Terjadi error pada database:", err)
		return false
	}
	return true
}

func IsDosenExist(nidn string) bool {
	var hasilAngka int
	err := config.QueryRow(`
		select 1 
		from dosen d
		where d.nidn = ? 
	`, nidn).Scan(&hasilAngka)
	if err == sql.ErrNoRows {
		return false
	} else if err != nil {
		log.Println("Terjadi error pada database:", err)
		return false
	}
	return true
}

func IsMhsExist(nim string) bool {
	var hasilAngka int
	err := config.QueryRow(`
		select 1 
		from mahasiswa m
		where m.nim = ? 
	`, nim).Scan(&hasilAngka)
	if err == sql.ErrNoRows {
		return false
	} else if err != nil {
		log.Println("Terjadi error pada database:", err)
		return false
	}
	return true
}
func IsStaffExist(nidn string) bool {
	var hasilAngka int
	err := config.QueryRow(`
		select 1 
		from staff s
		where s.nip = ? 
	`, nidn).Scan(&hasilAngka)
	if err == sql.ErrNoRows {
		return false
	} else if err != nil {
		log.Println("Terjadi error pada database:", err)
		return false
	}
	return true
}

/*
	func GetUserByEmail(email string) (*User, error) {
		var user User

		row := config.QueryRow(`
			SELECT id, username, email, password
			FROM users
			WHERE email = ?
		`, email)

		err := row.Scan(
			&user.ID,
			&user.Username,
			&user.Email,
			&user.Password,
		)

		if err != nil {
			if err == sql.ErrNoRows {
				return nil, nil
			}

			return nil, err
		}

		return &user, nil
	}
*/

func CreateMHSLangsung(username string, email string, password string, tipeUser string, nim string, angkatan string, namaLengkap string, prodi string) error {

	tx, err := config.DB.Begin()
	if err != nil {
		return err
	}

	// Kalau ada error sebelum Commit(),
	// semua perubahan di transaction dibatalkan.
	defer tx.Rollback()

	result, err := tx.Exec(`
		INSERT INTO user (
			username,
			email,
			password,
			user_role,
			isVerified,
			tipe_user
		)
		VALUES (?, ?, ?, 3, 1, (
			SELECT id
			FROM user_tipe
			WHERE tipe = ?
		))
	`, username, email, password, tipeUser)

	if err != nil {
		return err
	}

	// Ambil ID user yang baru dibuat
	userID, err := result.LastInsertId()
	if err != nil {
		return err
	}

	_, err = tx.Exec(`
		INSERT INTO mahasiswa (
			nim,
			angkatan,
			mhs_user,
			nama_lengkap,
			prodi
		)
		VALUES (?, ?, ?, ?, (
			SELECT id
			FROM prodi
			WHERE nama_prodi = ?
		))
	`, nim, angkatan, userID, namaLengkap, prodi)

	if err != nil {
		return err
	}

	if err := tx.Commit(); err != nil {
		return err
	}
	return nil
}

func CreatePetugas(username string, email string, password string, tipeUser string) error {

	tx, err := config.DB.Begin()
	if err != nil {
		return err
	}

	// Kalau ada error sebelum Commit(),
	// semua perubahan di transaction dibatalkan.
	defer tx.Rollback()

	_, err = tx.Exec(`
		INSERT INTO user (
			username,
			email,
			password,
			user_role,
			isVerified,
			tipe_user
		)
		VALUES (?, ?, ?, 2, 1, (
			SELECT id
			FROM user_tipe
			WHERE tipe = ?
		))
	`, username, email, password, tipeUser)

	if err != nil {
		return err
	}

	if err := tx.Commit(); err != nil {
		return err
	}
	return nil
}

func CreateAdmin(username string, email string, password string, tipeUser string) error {

	tx, err := config.DB.Begin()
	if err != nil {
		return err
	}

	// Kalau ada error sebelum Commit(),
	// semua perubahan di transaction dibatalkan.
	defer tx.Rollback()

	_, err = tx.Exec(`
		INSERT INTO user (
			username,
			email,
			password,
			user_role,
			isVerified,
			tipe_user
		)
		VALUES (?, ?, ?, 1, 1, (
			SELECT id
			FROM user_tipe
			WHERE tipe = ?
		))
	`, username, email, password, tipeUser)

	if err != nil {
		return err
	}

	if err := tx.Commit(); err != nil {
		return err
	}
	return nil
}
func CreateSTAFF(username string, email string, password string, tipeUser string, nip string, namaLengkap string) error {

	tx, err := config.DB.Begin()
	if err != nil {
		return err
	}

	// Kalau ada error sebelum Commit(),
	// semua perubahan di transaction dibatalkan.
	defer tx.Rollback()

	result, err := tx.Exec(`
		INSERT INTO user (
			username,
			email,
			password,
			user_role,
			isVerified,
			tipe_user
		)
		VALUES (?, ?, ?, 3, 0, (
			SELECT id
			FROM user_tipe
			WHERE tipe = ?
		))
	`, username, email, password, tipeUser)

	if err != nil {
		return err
	}

	// Ambil ID user yang baru dibuat
	userID, err := result.LastInsertId()
	if err != nil {
		return err
	}

	_, err = tx.Exec(`
		INSERT INTO staff (
			nip,
			nama_lengkap,
			user_staff
		)
		VALUES (?, ?, ?)
	`, nip, namaLengkap, userID)

	if err != nil {
		return err
	}

	if err := tx.Commit(); err != nil {
		return err
	}
	return nil
}
func CreateMahasiswaPending(username string, email string, password string, tipeUser string, nim string, angkatan string, namaLengkap string, prodi string) error {

	tx, err := config.DB.Begin()
	if err != nil {
		return err
	}

	// Kalau ada error sebelum Commit(),
	// semua perubahan di transaction dibatalkan.
	defer tx.Rollback()

	result, err := tx.Exec(`
		INSERT INTO user (
			username,
			email,
			password,
			user_role,
			isVerified,
			tipe_user
		)
		VALUES (?, ?, ?, 3, 0, (
			SELECT id
			FROM user_tipe
			WHERE tipe = ?
		))
	`, username, email, password, tipeUser)

	if err != nil {
		return err
	}

	// Ambil ID user yang baru dibuat
	userID, err := result.LastInsertId()
	if err != nil {
		return err
	}

	_, err = tx.Exec(`
		INSERT INTO mahasiswa_pending (
			nim,
			angkatan,
			mhs_user,
			nama_lengkap,
			prodi
		)
		VALUES (?, ?, ?, ?, (
			SELECT id
			FROM prodi
			WHERE nama_prodi = ?
		))
	`, nim, angkatan, userID, namaLengkap, prodi)

	if err != nil {
		return err
	}

	if err := tx.Commit(); err != nil {
		return err
	}
	return nil
}

func CreateDosenPending(username string, email string, password string, tipeUser string, nidn string, namaLengkap string, prodi string) error {

	tx, err := config.DB.Begin()
	if err != nil {
		return err
	}

	// Kalau ada error sebelum Commit(),
	// semua perubahan di transaction dibatalkan.
	defer tx.Rollback()

	result, err := tx.Exec(`
		INSERT INTO user (
			username,
			email,
			password,
			user_role,
			isVerified,
			tipe_user
		)
		VALUES (?, ?, ?, 3, 0, (
			SELECT id
			FROM user_tipe
			WHERE tipe = ?
		))
	`, username, email, password, tipeUser)

	if err != nil {
		return err
	}

	// Ambil ID user yang baru dibuat
	userID, err := result.LastInsertId()
	if err != nil {
		return err
	}

	_, err = tx.Exec(`
		INSERT INTO dosen_pending (
			nidn,
			nama_lengkap,
			dosen_user,
			prodi_dosen
		)
		VALUES (?, ?, ?, (
			SELECT id
			FROM prodi
			WHERE nama_prodi = ?
		))
	`, nidn, namaLengkap, userID, prodi)

	if err != nil {
		return err
	}

	if err := tx.Commit(); err != nil {
		return err
	}
	return nil
}

func CreateKategori(kategori string) error {

	tx, err := config.DB.Begin()
	if err != nil {
		return err
	}

	defer tx.Rollback()

	result, err := tx.Exec(`
		INSERT INTO kategori (
			nama_kategori
		)
		VALUES (?)
	`, kategori)

	if err != nil {
		return err
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if err := tx.Commit(); err != nil {
		return err
	}
	log.Printf("Successfully updated %d rows.\n", rows)
	return nil
}
func CreateAlat(nama_alat string, jumlah_tersedia int, banyak_alat int, kategori string, status int) error {
	tx, err := config.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	result, err := tx.Exec(`
		INSERT INTO alat ( 
			nama_alat, jumlah_tersedia, banyak_alat, kategori, status 
		) 
		VALUES (?, ?, ?, (
			SELECT id  
			FROM kategori  
			where nama_kategori = ? 
		),?)
	`, nama_alat, jumlah_tersedia, banyak_alat, kategori, status)

	if err != nil {
		return err
	}

	_, err = result.RowsAffected()
	if err != nil {
		return err
	}

	if err := tx.Commit(); err != nil {
		return err
	}

	return nil
}
func CreateRuangan(nama_ruangan string, status int, kapasitas int, lokasi string, kategori string) error {
	tx, err := config.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	result, err := tx.Exec(`
		INSERT INTO ruangan ( 
			nama_ruangan, status, kapasitas, lokasi, kategori 
		) 
		VALUES (?, ?, ?, ?, ( 
			SELECT id  
			FROM kategori  
			where nama_kategori = ? 
		)) 
	`, nama_ruangan, status, kapasitas, lokasi, kategori)

	if err != nil {
		return err
	}

	_, err = result.RowsAffected()
	if err != nil {
		return err
	}

	if err := tx.Commit(); err != nil {
		return err
	}

	return nil
}

func CreateDosenLangsung(username string, email string, password string, tipeUser string, nidn string, namaLengkap string, prodi string) error {

	tx, err := config.DB.Begin()
	if err != nil {
		return err
	}

	// Kalau ada error sebelum Commit(),
	// semua perubahan di transaction dibatalkan.
	defer tx.Rollback()

	result, err := tx.Exec(`
		INSERT INTO user (
			username,
			email,
			password,
			user_role,
			isVerified,
			tipe_user
		)
		VALUES (?, ?, ?, 3, 1, (
			SELECT id
			FROM user_tipe
			WHERE tipe = ?
		))
	`, username, email, password, tipeUser)

	if err != nil {
		return err
	}

	// Ambil ID user yang baru dibuat
	userID, err := result.LastInsertId()
	if err != nil {
		return err
	}

	_, err = tx.Exec(`
		INSERT INTO dosen (
			nidn,
			nama_lengkap,
			dosen_user,
			prodi_dosen
		)
		VALUES (?, ?, ?, (
			SELECT id
			FROM prodi
			WHERE nama_prodi = ?
		))
	`, nidn, namaLengkap, userID, prodi)

	if err != nil {
		return err
	}

	if err := tx.Commit(); err != nil {
		return err
	}
	return nil
}
func DeleteUser(id int) error {
	_, err := config.Exec(`
		DELETE FROM users
		WHERE id = ?
	`, id)

	return err
}

func IsProdiExist(prodi string) bool {
	var hasilAngka int
	err := config.QueryRow(`
		select 1 
		from prodi
		where nama_prodi = ?
	`, prodi).Scan(&hasilAngka)
	if err == sql.ErrNoRows {
		return false
	} else if err != nil {
		log.Println("Terjadi error pada database:", err)
		return false
	}
	return true
}

type tampung_mhs_pending struct {
	ID           int
	Nim          string
	Nama_lengkap string
	Angkatan     int
	Username     string
	Prodi        int
}

func GetMhs(limit int) ([]tampung_mhs_pending, error) {

	rows, err := config.Query(`
		SELECT
			m.id,
			m.nim,
			m.nama_lengkap,
			m.angkatan,
			u.username,m.prodi
		FROM mahasiswa m
		JOIN user u ON m.mhs_user = u.id
		order by m.id,u.username
		limit ?
	`, limit)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []tampung_mhs_pending

	for rows.Next() {
		var user tampung_mhs_pending

		err := rows.Scan(
			&user.ID,
			&user.Nim,
			&user.Nama_lengkap,
			&user.Angkatan,
			&user.Username,
			&user.Prodi,
		)

		if err != nil {
			return nil, err
		}

		users = append(users, user)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return users, nil
}

func GetMhsPending(limit int) ([]tampung_mhs_pending, error) {

	rows, err := config.Query(`
		SELECT mp.id, mp.nim, mp.nama_lengkap,mp.angkatan,u.username,mp.prodi 
		FROM mahasiswa_pending mp 
		join user u on u.id = mp.mhs_user 
		ORDER BY mp.id, u.username 
		LIMIT ?
	`, limit)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []tampung_mhs_pending

	for rows.Next() {
		var user tampung_mhs_pending

		err := rows.Scan(
			&user.ID,
			&user.Nim,
			&user.Nama_lengkap,
			&user.Angkatan,
			&user.Username,
			&user.Prodi,
		)

		if err != nil {
			return nil, err
		}

		users = append(users, user)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return users, nil
}

type tampung_staff_pending struct {
	ID           int
	Nip          string
	Nama_lengkap string
	Email        string
}

func GetStaff(limit int) ([]tampung_staff_pending, error) {

	rows, err := config.Query(`
		select s.id,s.nip, s.nama_lengkap,u.email
		from user u 
		join staff s on u.id = s.user_staff 
		where u.isVerified = 1 
		order by s.id,u.username
		limit ?
	`, limit)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []tampung_staff_pending

	for rows.Next() {
		var user tampung_staff_pending

		err := rows.Scan(
			&user.ID,
			&user.Nip,
			&user.Nama_lengkap,
			&user.Email,
		)

		if err != nil {
			return nil, err
		}

		users = append(users, user)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return users, nil
}

func GetStaffPending(limit int) ([]tampung_staff_pending, error) {

	rows, err := config.Query(`
		select s.id,s.nip, s.nama_lengkap,u.email
		from user u 
		join staff s on u.id = s.user_staff 
		where u.isVerified = 0 
		order by s.id,u.username
		limit ?
	`, limit)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []tampung_staff_pending

	for rows.Next() {
		var user tampung_staff_pending

		err := rows.Scan(
			&user.ID,
			&user.Nip,
			&user.Nama_lengkap,
			&user.Email,
		)

		if err != nil {
			return nil, err
		}

		users = append(users, user)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return users, nil
}

type tampung struct {
	ID       int
	Username string
	Email    string
	Role     int
}

func GetUsers(limit int) ([]tampung, error) {

	rows, err := config.Query(`
		SELECT id, username, email, user_role
		FROM user
		ORDER BY id, username
		LIMIT ?
	`, limit)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []tampung

	for rows.Next() {
		var user tampung

		err := rows.Scan(
			&user.ID,
			&user.Username,
			&user.Email,
			&user.Role,
		)

		if err != nil {
			return nil, err
		}

		users = append(users, user)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return users, nil
}

type dosen_p struct {
	ID           int
	Nidn         string
	Nama_lengkap string
	Prodi_dosen  int
}

func GetDosenPending(limit int) ([]dosen_p, error) {

	rows, err := config.Query(`
		SELECT id, nidn, nama_lengkap, prodi_dosen
		FROM dosen_pending
		LIMIT ?
	`, limit)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []dosen_p

	for rows.Next() {
		var user dosen_p

		err := rows.Scan(
			&user.ID,
			&user.Nidn,
			&user.Nama_lengkap,
			&user.Prodi_dosen,
		)

		if err != nil {
			return nil, err
		}

		users = append(users, user)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return users, nil
}

func GetDosen(limit int) ([]dosen_p, error) {

	rows, err := config.Query(`
		SELECT id, nidn, nama_lengkap, prodi_dosen
		FROM dosen
		LIMIT ?
	`, limit)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []dosen_p

	for rows.Next() {
		var user dosen_p

		err := rows.Scan(
			&user.ID,
			&user.Nidn,
			&user.Nama_lengkap,
			&user.Prodi_dosen,
		)

		if err != nil {
			return nil, err
		}

		users = append(users, user)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return users, nil
}

func IsNimExist(pendingID int) (bool, error) {
	var exists int

	err := config.DB.QueryRow(`
		SELECT 1
		FROM mahasiswa m
		WHERE m.nim = (
			SELECT mp.nim
			FROM mahasiswa_pending mp
			WHERE mp.id = ?
			LIMIT 1
		)
		LIMIT 1
	`, pendingID).Scan(&exists)

	if err == sql.ErrNoRows {
		return false, nil
	}

	if err != nil {
		return false, err
	}

	return true, nil
}

// ErrAlreadyVerified dikembalikan saat admin mencoba memverifikasi
// user yang sudah isVerified = 1.
var ErrAlreadyVerified = errors.New("user already verified")

// Verifikasi_Staff memverifikasi staff berdasarkan id di tabel staff
// (bukan user.id). Mengembalikan sql.ErrNoRows jika id staff tidak ada,
// dan ErrAlreadyVerified jika staff sudah terverifikasi.
func Verifikasi_Staff(staffID int) error {
	tx, err := config.DB.Begin()
	if err != nil {
		return err
	}

	defer tx.Rollback()

	var userID int
	var isVerified int
	err = tx.QueryRow(`
		SELECT s.user_staff, u.isVerified
		FROM staff s
		JOIN user u ON u.id = s.user_staff
		WHERE s.id = ?
		FOR UPDATE
	`, staffID).Scan(&userID, &isVerified)

	if err != nil {
		return err
	}

	if isVerified == 1 {
		return ErrAlreadyVerified
	}

	res, err := tx.Exec(`
		UPDATE user
		SET isVerified = 1
		WHERE id = ?
	`, userID)

	if err != nil {
		return err
	}

	rows, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return sql.ErrNoRows
	}

	return tx.Commit()
}

// CreateSTAFFLangsung dipakai admin untuk membuat staff yang langsung
// aktif (isVerified = 1). Berbeda dengan CreateSTAFF yang membuat staff
// pending (isVerified = 0) untuk registrasi mandiri.
func CreateSTAFFLangsung(username string, email string, password string, tipeUser string, nip string, namaLengkap string) error {

	tx, err := config.DB.Begin()
	if err != nil {
		return err
	}

	// Kalau ada error sebelum Commit(),
	// semua perubahan di transaction dibatalkan.
	defer tx.Rollback()

	result, err := tx.Exec(`
		INSERT INTO user (
			username,
			email,
			password,
			user_role,
			isVerified,
			tipe_user
		)
		VALUES (?, ?, ?, 3, 1, (
			SELECT id
			FROM user_tipe
			WHERE tipe = ?
		))
	`, username, email, password, tipeUser)

	if err != nil {
		return err
	}

	// Ambil ID user yang baru dibuat
	userID, err := result.LastInsertId()
	if err != nil {
		return err
	}

	_, err = tx.Exec(`
		INSERT INTO staff (
			nip,
			nama_lengkap,
			user_staff
		)
		VALUES (?, ?, ?)
	`, nip, namaLengkap, userID)

	if err != nil {
		return err
	}

	if err := tx.Commit(); err != nil {
		return err
	}
	return nil
}
func Verif_MHS(userID int) error {
	tx, err := config.DB.Begin()
	if err != nil {
		return err
	}

	defer tx.Rollback()

	var nim, angkatan, namaLengkap string
	var mhsUser, prodi int

	err = tx.QueryRow(`
		SELECT nim, angkatan, mhs_user, nama_lengkap, prodi 
		FROM mahasiswa_pending 
		WHERE id = ?
		FOR UPDATE
	`, userID).Scan(
		&nim,
		&angkatan,
		&mhsUser,
		&namaLengkap,
		&prodi,
	)

	if err != nil {
		return err
	}
	_, err = tx.Exec(`
		UPDATE user
		SET isVerified = 1
		WHERE id = (select mhs_user from mahasiswa_pending where id = ?)
	`, userID)

	if err != nil {
		return err
	}

	_, err = tx.Exec(`
		INSERT INTO mahasiswa
			(nim, angkatan, mhs_user, nama_lengkap, prodi)
		VALUES (?, ?, ?, ?, ?)
	`, nim, angkatan, mhsUser, namaLengkap, prodi)

	if err != nil {
		return err
	}

	_, err = tx.Exec(`
		DELETE FROM mahasiswa_pending
		WHERE id = ?
	`, userID)

	if err != nil {
		return err
	}

	return tx.Commit()
}

func IsNidnExist(pendingID int) (bool, error) {
	var exists int

	err := config.DB.QueryRow(`
		SELECT 1
		FROM dosen d
		WHERE d.nidn = (
			SELECT dp.nidn
			FROM dosen_pending dp
			WHERE dp.id = ?
			LIMIT 1
		)
		LIMIT 1
	`, pendingID).Scan(&exists)

	if err == sql.ErrNoRows {
		return false, nil
	}

	if err != nil {
		return false, err
	}

	return true, nil
}
func Verif_Dosen(userID int) error {
	tx, err := config.DB.Begin()
	if err != nil {
		return err
	}

	defer tx.Rollback()

	var nidn, nama_lengkap, dosen_user string
	var prodi_dosen int

	err = tx.QueryRow(`
		SELECT dp.nidn, dp.nama_lengkap, dp.dosen_user, dp.prodi_dosen 
		FROM dosen_pending dp 
		WHERE dp.id = ?
		FOR UPDATE
	`, userID).Scan(
		&nidn,
		&nama_lengkap,
		&dosen_user,
		&prodi_dosen,
	)

	if err != nil {
		return err
	}
	_, err = tx.Exec(`
		UPDATE user
		SET isVerified = 1
		WHERE id = ?
	`, dosen_user)

	if err != nil {
		return err
	}

	_, err = tx.Exec(`
		INSERT INTO dosen
			(nidn, nama_lengkap, dosen_user, prodi_dosen)
		VALUES (?, ?, ?, ?)
	`, nidn, nama_lengkap, dosen_user, prodi_dosen)

	if err != nil {
		return err
	}

	_, err = tx.Exec(`
		DELETE FROM dosen_pending
		WHERE id = ?
	`, userID)

	if err != nil {
		return err
	}

	return tx.Commit()
}
