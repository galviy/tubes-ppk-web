package models

type UserDetail struct {
	ID          int    `json:"id"`
	Username    string `json:"username"`
	Email       string `json:"email"`
	Role        string `json:"role"`
	IsVerified  bool   `json:"is_verified"`
	TipeUser    string `json:"tipe_user"`
	NamaLengkap string `json:"nama_lengkap,omitempty"`
	Identifier  string `json:"identifier,omitempty"` // NIM, NIDN, NIP
	Prodi       string `json:"prodi,omitempty"`
	Angkatan    int    `json:"angkatan,omitempty"`
}

type UpdateUserRequest struct {
	NamaLengkap string `json:"nama_lengkap"`
	Email       string `json:"email"`
	Password    string `json:"password"`
	Angkatan    int    `json:"angkatan"`
}
