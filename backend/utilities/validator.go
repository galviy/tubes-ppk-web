package utils

import (
	"errors"
	"regexp"
	"strings"
	"unicode"

	"github.com/go-sql-driver/mysql"
)

var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,4}$`)

func IsEmailValid(e string) bool {
	if len(e) < 3 || len(e) > 254 {
		return false
	}
	return emailRegex.MatchString(e)
}

func IsUsernameValid(u string) bool {
	if len(u) < 3 || len(u) > 10 {
		return false
	}
	return true
}

func IsPasswordValid(p string) bool {
	if len(p) < 5 {
		return false
	}
	adaHurufBesar := false
	adaSimbol := false

	kumpulanSimbol := "!@#$%^&*()-_=+[]{}|;:',.<>?/~`"

	for _, char := range p {
		if unicode.IsUpper(char) {
			adaHurufBesar = true
		}
		if strings.ContainsRune(kumpulanSimbol, char) {
			adaSimbol = true
		}
		if adaHurufBesar && adaSimbol {
			return true
		}
	}

	return adaHurufBesar && adaSimbol
}

// IsDuplicateEntry melaporkan true jika err adalah MySQL
// Duplicate entry (error 1062), mis. race duplikat username/email/nim
// yang lolos dari pre-check IsUserExist/IsMhsExist/dll.
func IsDuplicateEntry(err error) bool {
	var mysqlErr *mysql.MySQLError
	if errors.As(err, &mysqlErr) {
		return mysqlErr.Number == 1062
	}
	return false
}
