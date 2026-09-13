package repositories

import (
	"backend-ppk/config"
	"database/sql"
)

type User struct {
	ID       int
	Username string
	Email    string
	Password string
}

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

func CreateUser(username string, email string, password string) error {
	_, err := config.Exec(`
		INSERT INTO user (username, email, password,user_role,isVerified)
		VALUES (?, ?, ?,3,0)
	`, username, email, password)

	return err
}

func DeleteUser(id int) error {
	_, err := config.Exec(`
		DELETE FROM users
		WHERE id = ?
	`, id)

	return err
}
