package user

import (
	"backend-ppk/middleware"
	utils "backend-ppk/utilities"
	"net/http"
)

func Me(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("session_id")
	if err != nil {
		utils.ResponseJSON(w, http.StatusUnauthorized, map[string]string{"message": "Unauthorized"})
		return
	}

	p, ok := middleware.GetCookieInformation(cookie.Value)
	if !ok {
		utils.ResponseJSON(w, http.StatusUnauthorized, map[string]string{"message": "Unauthorized"})
		return
	}

	user := map[string]any{"success": true, "email": p.Email}

	utils.ResponseJSON(w, http.StatusOK, user)
}

/*
type Session struct {
	UserId      int
	Email       string
	Role        string
	Valid_until int64
}
*/
