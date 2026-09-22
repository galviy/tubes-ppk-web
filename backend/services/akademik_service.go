package services

import (
	"backend-ppk/models"
	"backend-ppk/repositories"
)

func ListFakultasDenganProdi() ([]models.Fakultas, error) {
	fakultas, err := repositories.ListFakultas()
	if err != nil {
		return nil, err
	}
	prodi, err := repositories.ListProdi()
	if err != nil {
		return nil, err
	}

	for i := range fakultas {
		fakultas[i].Prodi = make([]models.Prodi, 0)
		for _, p := range prodi {
			if p.FakultasId == fakultas[i].Id {
				fakultas[i].Prodi = append(fakultas[i].Prodi, models.Prodi{Id: p.Id, Nama: p.Nama})
			}
		}
	}
	return fakultas, nil
}

func ListProdi() ([]models.Prodi, error) {
	return repositories.ListProdi()
}
