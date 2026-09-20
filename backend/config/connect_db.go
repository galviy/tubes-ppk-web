package config

import (
	"database/sql"
	"log"
	"os"

	_ "github.com/go-sql-driver/mysql"
	"github.com/joho/godotenv"
)

func ConnectDB() {
	err := godotenv.Load("../.env")
	if err != nil {
		log.Fatal(err)
	}

	dbUser := os.Getenv("DB_USERNAME")
	password := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")
	dbIP := os.Getenv("DB_IPADDRESS")
	dbPort := os.Getenv("DB_PORT")

	dsn := dbUser + ":" + password + "@tcp(" + dbIP + ":" + dbPort + ")/" + dbName + "?parseTime=true"

	DB, err = sql.Open("mysql", dsn)
	if err != nil {
		log.Fatal(err)
	}

	if err := DB.Ping(); err != nil {
		log.Fatal(err)
	}

	log.Println("Berhasil terkoneksi ke database MySQL!")
}
