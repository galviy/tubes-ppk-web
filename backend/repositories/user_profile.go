package repositories

import (
	"backend-ppk/config"
	"backend-ppk/models"
	utils "backend-ppk/utilities"
	"database/sql"
	"errors"
	"strings"
)

func GetUserProfileByID(id int) (*models.UserDetail, error) {
	var (
		u        models.UserDetail
		tipeUser sql.NullString
		verified int
	)

	err := config.QueryRow(`
		SELECT id, username, email, user_role, isVerified, tipe_user
		FROM user
		WHERE id = ?`, id).Scan(
		&u.ID, &u.Username, &u.Email, &u.Role, &verified, &tipeUser,
	)
	if err != nil {
		return nil, err
	}
	u.IsVerified = verified == 1
	u.TipeUser = tipeUser.String

	// Role-specific additional info
	switch strings.ToLower(u.TipeUser) {
	case "mahasiswa":
		var (
			nama     string
			nim      string
			angkatan int
			prodi    sql.NullString
		)
		errMhs := config.QueryRow(`
			SELECT m.nama_lengkap, m.nim, m.angkatan, p.nama_prodi
			FROM mahasiswa m
			LEFT JOIN prodi p ON p.id = m.mhs_prodi
			WHERE m.mhs_user = ?`, id).Scan(&nama, &nim, &angkatan, &prodi)
		if errMhs == nil {
			u.NamaLengkap = nama
			u.Identifier = nim
			u.Angkatan = angkatan
			u.Prodi = prodi.String
		}
	case "dosen":
		var (
			nama  string
			nidn  string
			prodi sql.NullString
		)
		errDosen := config.QueryRow(`
			SELECT d.nama_lengkap, d.nidn, p.nama_prodi
			FROM dosen d
			LEFT JOIN prodi p ON p.id = d.prodi_dosen
			WHERE d.dosen_user = ?`, id).Scan(&nama, &nidn, &prodi)
		if errDosen == nil {
			u.NamaLengkap = nama
			u.Identifier = nidn
			u.Prodi = prodi.String
		}
	case "staff":
		var (
			nama string
			nip  string
		)
		errStaff := config.QueryRow(`
			SELECT s.nama_lengkap, s.nip
			FROM staff s
			WHERE s.staff_user = ?`, id).Scan(&nama, &nip)
		if errStaff == nil {
			u.NamaLengkap = nama
			u.Identifier = nip
		}
	}

	return &u, nil
}

func UpdateUserProfile(id int, req models.UpdateUserRequest) error {
	user, err := GetUserProfileByID(id)
	if err != nil {
		return err
	}

	tx, err := config.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	if req.Email != "" && req.Email != user.Email {
		if !utils.IsEmailValid(req.Email) {
			return errors.New("Format email tidak valid")
		}
		_, err := tx.Exec(`UPDATE user SET email = ? WHERE id = ?`, req.Email, id)
		if err != nil {
			return err
		}
	}

	if req.Password != "" {
		if !utils.IsPasswordValid(req.Password) {
			return errors.New("Password harus minimal 5 karakter, mengandung 1 huruf besar dan 1 simbol")
		}
		hashed, err := utils.HashPassword(req.Password)
		if err != nil {
			return err
		}
		_, err = tx.Exec(`UPDATE user SET password = ? WHERE id = ?`, hashed, id)
		if err != nil {
			return err
		}
	}

	if req.NamaLengkap != "" || req.Angkatan > 0 {
		switch strings.ToLower(user.TipeUser) {
		case "mahasiswa":
			if req.NamaLengkap != "" && req.Angkatan > 0 {
				_, err = tx.Exec(`UPDATE mahasiswa SET nama_lengkap = ?, angkatan = ? WHERE mhs_user = ?`, req.NamaLengkap, req.Angkatan, id)
			} else if req.NamaLengkap != "" {
				_, err = tx.Exec(`UPDATE mahasiswa SET nama_lengkap = ? WHERE mhs_user = ?`, req.NamaLengkap, id)
			} else if req.Angkatan > 0 {
				_, err = tx.Exec(`UPDATE mahasiswa SET angkatan = ? WHERE mhs_user = ?`, req.Angkatan, id)
			}
		case "dosen":
			if req.NamaLengkap != "" {
				_, err = tx.Exec(`UPDATE dosen SET nama_lengkap = ? WHERE dosen_user = ?`, req.NamaLengkap, id)
			}
		case "staff":
			if req.NamaLengkap != "" {
				_, err = tx.Exec(`UPDATE staff SET nama_lengkap = ? WHERE staff_user = ?`, req.NamaLengkap, id)
			}
		}
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}
