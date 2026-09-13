package config

import (
	"database/sql"
)

var DB *sql.DB

func Query(query string, args ...any) (*sql.Rows, error) {
	return DB.Query(query, args...)
}

func QueryRow(query string, args ...any) *sql.Row {
	return DB.QueryRow(query, args...)
}

func Exec(query string, args ...any) (sql.Result, error) {
	return DB.Exec(query, args...)
}
