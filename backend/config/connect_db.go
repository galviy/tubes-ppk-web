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

	dsn := dbUser + ":" + password + "@tcp(" + dbIP + ":" + dbPort + ")/" + dbName + "?parseTime=true"

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
