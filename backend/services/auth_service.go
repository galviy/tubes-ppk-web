package services

import (
	"backend-ppk/repositories"
	utils "backend-ppk/utilities"
	"log"
)

// VerifyLogin menerima identifier yang bisa berupa email atau username.
// Nilai berformat email dicari lewat kolom email, sisanya lewat username.
// Verifikasi password dan status akun tetap dijalankan di sini.
func VerifyLogin(identifier, password string) (*repositories.User, bool) {
	var (
		user *repositories.User
		err  error
	)

	if utils.IsEmailValid(identifier) {
		user, err = repositories.GetUserByEmail(identifier)
	} else {
		user, err = repositories.GetUserByUsername(identifier)
	}

	if err != nil {
		log.Println("Terjadi error pada database:", err)
		return nil, false
	}
	if user == nil || !user.IsVerified {
		return nil, false
	}
	if !utils.CheckPassword(password, user.Password) {
		return nil, false
	}
	return user, true
}
