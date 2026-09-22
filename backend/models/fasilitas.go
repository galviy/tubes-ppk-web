package models

type Fasilitas struct {
	Id        string   `json:"id"`
	RefId     int      `json:"ref_id"`
	Tipe      string   `json:"tipe"`
	Name      string   `json:"name"`
	Type      string   `json:"type"`
	Loc       string   `json:"loc"`
	Cap       int      `json:"cap"`
	Desc      string   `json:"desc"`
	Amenities []string `json:"amenities"`
	Status    string   `json:"status"`
	Image     *string  `json:"image"`
}

// Ruangan dan Alat adalah baris tabel apa adanya, dipakai repository
// untuk mengembalikan hasil query tanpa pemetaan.
type Ruangan struct {
	Id        int
	Nama      string
	Status    string
	Kapasitas int
	Lokasi    string
	Kategori  string
}

type Alat struct {
	Id             int
	Nama           string
	JumlahTersedia int
	BanyakAlat     int
	Status         int
	Kategori       string
}

const (
	TipeFasilitasRuangan = "ruangan"
	TipeFasilitasAlat    = "alat"
)

const (
	StatusFasilitasTersedia  = "avail"
	StatusFasilitasDigunakan = "busy"
	StatusFasilitasPerbaikan = "repair"
	StatusFasilitasNonaktif  = "nonaktif"
)
