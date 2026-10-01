package dashboard

import (
	"backend-ppk/repositories"
	"backend-ppk/services"
	utils "backend-ppk/utilities"
	"fmt"
	"net/http"
	"strings"
)

// Overview menyajikan metrik komprehensif sistem (fasilitas, reservasi, laporan, pengguna, okupansi).
func Overview(w http.ResponseWriter, r *http.Request) {
	data, err := repositories.GetDashboardOverview()
	if err != nil {
		utils.ResponseJSONMessage(w, "Gagal mengambil data dashboard overview", http.StatusInternalServerError, false)
		return
	}

	utils.ResponseJSON(w, http.StatusOK, map[string]any{
		"success": true,
		"data":    data,
	})
}

// OccupancyExport mengekspor rekap okupansi dan laporan kerusakan ke file asli (PDF, Excel, atau CSV).
func OccupancyExport(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	format := strings.ToLower(strings.TrimSpace(query.Get("format")))
	if format == "" {
		format = "pdf"
	}

	mode := strings.ToLower(strings.TrimSpace(query.Get("mode")))
	if mode == "" {
		mode = "semua"
	}
	gedung := strings.TrimSpace(query.Get("gedung"))
	fasilitasId := strings.TrimSpace(query.Get("fasilitas_id"))

	items, err := repositories.GetOccupancyRekap(mode, gedung, fasilitasId)
	if err != nil {
		utils.ResponseJSONMessage(w, "Gagal mengambil data rekap", http.StatusInternalServerError, false)
		return
	}

	filterDesc := "Semua Fasilitas"
	if mode == "gedung" && gedung != "" && gedung != "Pilih" {
		filterDesc = "Gedung / Lokasi: " + gedung
	} else if mode == "fasilitas" && fasilitasId != "" && fasilitasId != "Pilih" {
		filterDesc = "Fasilitas ID: " + fasilitasId
	}

	switch format {
	case "csv":
		csvBytes := services.GenerateOccupancyCSV(items)
		w.Header().Set("Content-Type", "text/csv; charset=utf-8")
		w.Header().Set("Content-Disposition", "attachment; filename=\"rekap-okupansi.csv\"")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write(csvBytes)

	case "excel", "xls", "xlsx":
		excelBytes := services.GenerateOccupancyExcel(items)
		w.Header().Set("Content-Type", "application/vnd.ms-excel; charset=utf-8")
		w.Header().Set("Content-Disposition", "attachment; filename=\"rekap-okupansi.xls\"")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write(excelBytes)

	case "pdf":
		fallthrough
	default:
		pdfBytes, err := services.GenerateOccupancyPDF(items, filterDesc)
		if err != nil {
			utils.ResponseJSONMessage(w, "Gagal membuat dokumen PDF: "+err.Error(), http.StatusInternalServerError, false)
			return
		}
		w.Header().Set("Content-Type", "application/pdf")
		w.Header().Set("Content-Disposition", "attachment; filename=\"rekap-okupansi.pdf\"")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write(pdfBytes)
	}
}

// ReportsExport mengekspor daftar laporan kerusakan ke file PDF / CSV.
func ReportsExport(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	format := strings.ToLower(strings.TrimSpace(query.Get("format")))
	if format == "" {
		format = "pdf"
	}

	status := strings.TrimSpace(query.Get("status"))
	kategori := strings.TrimSpace(query.Get("kategori"))
	q := strings.TrimSpace(query.Get("q"))

	items, err := repositories.GetReportsRekap(status, kategori, q)
	if err != nil {
		utils.ResponseJSONMessage(w, "Gagal mengambil data laporan untuk ekspor", http.StatusInternalServerError, false)
		return
	}

	filterParts := []string{}
	if status != "" && status != "semua" {
		filterParts = append(filterParts, "Status: "+status)
	}
	if kategori != "" && kategori != "semua" {
		filterParts = append(filterParts, "Kategori: "+kategori)
	}
	if q != "" {
		filterParts = append(filterParts, fmt.Sprintf("Pencarian: \"%s\"", q))
	}
	filterDesc := "Semua Laporan"
	if len(filterParts) > 0 {
		filterDesc = strings.Join(filterParts, " • ")
	}

	switch format {
	case "csv":
		// Simple CSV
		w.Header().Set("Content-Type", "text/csv; charset=utf-8")
		w.Header().Set("Content-Disposition", "attachment; filename=\"laporan-kerusakan.csv\"")
		w.WriteHeader(http.StatusOK)
		var b strings.Builder
		b.WriteString("ID,Waktu,Pelapor,Fasilitas,Tipe,Kategori,Status,Alasan,Catatan Resolusi\n")
		for _, it := range items {
			catatan := "-"
			if it.CatatanResolusi != nil {
				catatan = *it.CatatanResolusi
			}
			b.WriteString(fmt.Sprintf("%d,\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"\n",
				it.ID, it.WaktuDibuat, it.Pelapor, it.Fasilitas, it.TipeFasilitas, it.KategoriLaporan, it.Status, it.Alasan, catatan))
		}
		_, _ = w.Write([]byte(b.String()))

	case "pdf":
		fallthrough
	default:
		pdfBytes, err := services.GenerateReportsPDF(items, filterDesc)
		if err != nil {
			utils.ResponseJSONMessage(w, "Gagal membuat dokumen PDF: "+err.Error(), http.StatusInternalServerError, false)
			return
		}
		w.Header().Set("Content-Type", "application/pdf")
		w.Header().Set("Content-Disposition", "attachment; filename=\"rekap-laporan.pdf\"")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write(pdfBytes)
	}
}
