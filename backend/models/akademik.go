package models

type Prodi struct {
	Id           int    `json:"id"`
	Nama         string `json:"nama_prodi"`
	FakultasId   int    `json:"fakultas_id,omitempty"`
	NamaFakultas string `json:"nama_fakultas,omitempty"`
}

type Fakultas struct {
	Id    int     `json:"id"`
	Nama  string  `json:"nama_fakultas"`
	Prodi []Prodi `json:"prodi"`
}
