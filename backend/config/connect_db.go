package config

import (
	"database/sql"
	"log"
	"os"

	_ "github.com/go-sql-driver/mysql"
	"github.com/joho/godotenv"
)

func ConnectDB() {
	if err := godotenv.Load("../.env"); err != nil {
		if err2 := godotenv.Load(".env"); err2 != nil {
			log.Println("Info: file .env tidak ditemukan di ../.env atau .env, membaca environment variables sistem")
		}
	}

	dbUser := os.Getenv("DB_USERNAME")
	password := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")
	dbIP := os.Getenv("DB_IPADDRESS")
	dbPort := os.Getenv("DB_PORT")

	// DATETIME audit timestamps are stored as UTC; reservation schedule values
	// are formatted as strings and treated as WIB wall-clock times.
	dsn := dbUser + ":" + password + "@tcp(" + dbIP + ":" + dbPort + ")/" + dbName + "?parseTime=true&loc=UTC&time_zone=%27%2B00%3A00%27"

	var err error
	DB, err = sql.Open("mysql", dsn)
	if err != nil {
		log.Fatal(err)
	}

	if err := DB.Ping(); err != nil {
		log.Fatal(err)
	}

	log.Println("Berhasil terkoneksi ke database MySQL!")
}
