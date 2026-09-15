package models

import "time"

type Session struct {
	UserId int
	Username    string
	Email       string
	Role        string
	Valid_until int64
}

func Extend_session(sessionId *Session) {
	sessionId.Valid_until += 60 * 30
}

func IsSessionActive(sessionId *Session) bool {
	return sessionId.Valid_until >= time.Now().Unix()
}

func Destroy_session(m map[string]*Session, key string) {
	delete(m, key)
}

func NewUser(userId int, email, role, username string) *Session {
	return &Session{
		UserId: userId,
		Username:    username,
		Email:       email,
		Role:        role,
		Valid_until: time.Now().Unix() + 60*60*1,
	}
}

var Sessions = make(map[string]*Session)
