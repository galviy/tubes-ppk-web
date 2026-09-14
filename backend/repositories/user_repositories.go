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
		WHERE email = ?
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
