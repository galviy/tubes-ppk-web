package services

import (
	"backend-ppk/repositories"
	utils "backend-ppk/utilities"
	"log"
)

func VerifyLogin(email, password string) (*repositories.User, bool) {
	user, err := repositories.GetUserByEmail(email)
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
