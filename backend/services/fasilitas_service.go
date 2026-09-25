package services

import (
	"backend-ppk/models"
	"backend-ppk/repositories"
	"strconv"
	"strings"
)

const alatLokasiDefault = "Gudang Sarana"

func mapStatusRuangan(status string) string {
	switch strings.ToLower(strings.TrimSpace(status)) {
	case "aktif", "1", "avail", "tersedia":
		return models.StatusFasilitasTersedia
	case "dalam_perbaikan", "perbaikan", "repair":
		return models.StatusFasilitasPerbaikan
	case "nonaktif", "0":
		return models.StatusFasilitasNonaktif
	default:
		return models.StatusFasilitasTersedia
	}
}

func mapStatusAlat(status, jumlahTersedia int) string {
	if status == 0 {
		return models.StatusFasilitasNonaktif
	}
	if jumlahTersedia <= 0 {
		return models.StatusFasilitasDigunakan
	}
	return models.StatusFasilitasTersedia
}

func toFasilitasRuangan(r models.Ruangan) models.Fasilitas {
	return models.Fasilitas{
		Id:        models.TipeFasilitasRuangan + "-" + strconv.Itoa(r.Id),
		RefId:     r.Id,
		Tipe:      models.TipeFasilitasRuangan,
		Name:      r.Nama,
		Type:      r.Kategori,
		Loc:       r.Lokasi,
		Cap:       r.Kapasitas,
		Amenities: []string{},
		Status:    mapStatusRuangan(r.Status),
	}
}

func toFasilitasAlat(a models.Alat) models.Fasilitas {
	return models.Fasilitas{
		Id:        models.TipeFasilitasAlat + "-" + strconv.Itoa(a.Id),
		RefId:     a.Id,
		Tipe:      models.TipeFasilitasAlat,
		Name:      a.Nama,
		Type:      a.Kategori,
		Loc:       alatLokasiDefault,
		Cap:       a.BanyakAlat,
		Amenities: []string{},
		Status:    mapStatusAlat(a.Status, a.JumlahTersedia),
	}
}

func ListFasilitas(tipe string) ([]models.Fasilitas, error) {
	if tipe == models.TipeFasilitasRuangan {
		rows, err := repositories.ListRuangan()
		if err != nil {
			return nil, err
		}
		return mapRuangan(rows), nil
	}
	if tipe == models.TipeFasilitasAlat {
		rows, err := repositories.ListAlat()
		if err != nil {
			return nil, err
		}
		return mapAlat(rows), nil
	}

	ruangan, err := repositories.ListRuangan()
	if err != nil {
		return nil, err
	}
	alat, err := repositories.ListAlat()
	if err != nil {
		return nil, err
	}
	return append(mapRuangan(ruangan), mapAlat(alat)...), nil
}

func mapRuangan(rows []models.Ruangan) []models.Fasilitas {
	list := make([]models.Fasilitas, 0, len(rows))
	for _, r := range rows {
		list = append(list, toFasilitasRuangan(r))
	}
	return list
}

func mapAlat(rows []models.Alat) []models.Fasilitas {
	list := make([]models.Fasilitas, 0, len(rows))
	for _, a := range rows {
		list = append(list, toFasilitasAlat(a))
	}
	return list
}

// ListFasilitasFiltered menerapkan filter US 2 dan pagination opsional
// (limit 0 = tampilkan semua). Mengembalikan data halaman + total sebelum dipotong.
func ListFasilitasFiltered(tipe, q, lokasi string, kapasitasMin, page, limit int) ([]models.Fasilitas, int, error) {
	list, err := ListFasilitas(tipe)
	if err != nil {
		return nil, 0, err
	}

	q = strings.ToLower(strings.TrimSpace(q))
	lokasi = strings.ToLower(strings.TrimSpace(lokasi))

	filtered := make([]models.Fasilitas, 0, len(list))
	for _, f := range list {
		if q != "" &&
			!strings.Contains(strings.ToLower(f.Name), q) &&
			!strings.Contains(strings.ToLower(f.Type), q) {
			continue
		}
		if lokasi != "" && !strings.Contains(strings.ToLower(f.Loc), lokasi) {
			continue
		}
		if kapasitasMin > 0 && f.Cap < kapasitasMin {
			continue
		}
		filtered = append(filtered, f)
	}

	total := len(filtered)
	if limit > 0 {
		start := (page - 1) * limit
		if start < 0 {
			start = 0
		}
		if start >= total {
			return []models.Fasilitas{}, total, nil
		}
		end := start + limit
		if end > total {
			end = total
		}
		filtered = filtered[start:end]
	}

	return filtered, total, nil
}
