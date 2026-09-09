package repositories

import (
	"database/sql"
	"fmt"
	"log"
)

func GetUsers(db *sql.DB) {
	rows, err := db.Query("SELECT id, username, email FROM users")
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	for rows.Next() {
		var id int
		var username string
		var email string

		err := rows.Scan(&id, &username, &email)
		if err != nil {
			log.Fatal(err)
		}

		fmt.Println(id, username, email)
	}
}
