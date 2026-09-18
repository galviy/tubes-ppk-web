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

	dsn := dbUser + ":" + password + "@tcp(127.0.0.1:3306)/" + dbName + "?parseTime=true"

	DB, err = sql.Open("mysql", dsn)
	if err != nil {
		log.Fatal(err)
	}

	if err := DB.Ping(); err != nil {
		log.Fatal(err)
	}

	log.Println("Berhasil terkoneksi ke database MySQL!")
}
