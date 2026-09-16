package repositories

import (
	"backend-ppk/config"
	utils "backend-ppk/utilities"
	"database/sql"
	"log"
)

type User struct {
	ID       int
	Username string
	Email    string
	Role     string
	Password string
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

func IsLoginCorrect(email string, password string, user *User) bool {

	row := config.QueryRow(`
		SELECT id,username,email,user_role,password
		FROM user
		WHERE email = ? and isVerified = 1
	`, email)

	err := row.Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.Role,
		&user.Password,
	)

	if err == sql.ErrNoRows {
		return false
	}

	if err != nil {
		log.Println("Terjadi error pada database:", err)
		return false
	}

	return utils.CheckPassword(password, user.Password)
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
}

func GetMhs(limit int) ([]tampung_mhs_pending, error) {

	rows, err := config.Query(`
		SELECT
			m.id,
			m.nim,
			m.nama_lengkap,
			m.angkatan,
			u.username
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
		SELECT mp.id, mp.nim, mp.nama_lengkap,mp.angkatan,u.username 
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
