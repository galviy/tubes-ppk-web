package services

import (
	"backend-ppk/models"
	"bytes"
	"fmt"
	"time"

	"github.com/jung-kurt/gofpdf"
)

func GenerateOccupancyPDF(items []models.OccupancyRekapItem, filterDesc string) ([]byte, error) {
	pdf := gofpdf.New("L", "mm", "A4", "")
	pdf.SetMargins(15, 15, 15)
	pdf.SetAutoPageBreak(true, 15)

	pdf.SetFooterFunc(func() {
		pdf.SetY(-12)
		pdf.SetFont("Arial", "I", 8)
		pdf.SetTextColor(128, 128, 128)
		pdf.CellFormat(0, 8, fmt.Sprintf("Dicetak via SIPINJAM Universitas Diponegoro • Halaman %d/{nb}", pdf.PageNo()), "", 0, "C", false, 0, "")
	})

	pdf.AliasNbPages("{nb}")
	pdf.AddPage()

	// Header Instansi & Judul
	pdf.SetFont("Arial", "B", 14)
	pdf.SetTextColor(30, 41, 59)
	pdf.CellFormat(0, 7, "UNIVERSITAS DIPONEGORO - SIPINJAM", "", 1, "C", false, 0, "")

	pdf.SetFont("Arial", "B", 12)
	pdf.SetTextColor(71, 85, 105)
	pdf.CellFormat(0, 6, "LAPORAN REKAP OKUPANSI & KERUSAKAN FASILITAS", "", 1, "C", false, 0, "")

	pdf.SetFont("Arial", "", 9)
	pdf.SetTextColor(100, 116, 139)
	waktuCetak := time.Now().Format("02 Jan 2006 15:04:05") + " WIB"
	pdf.CellFormat(0, 5, fmt.Sprintf("Filter: %s • Tanggal Cetak: %s", filterDesc, waktuCetak), "", 1, "C", false, 0, "")
	pdf.Ln(4)

	// Garis pembatas
	pdf.SetDrawColor(203, 213, 225)
	pdf.SetLineWidth(0.4)
	pdf.Line(15, pdf.GetY(), 282, pdf.GetY())
	pdf.Ln(4)

	// Ringkasan Statistik
	var totalDisetujui, totalPermohonan, totalLaporan int
	var totalJam float64
	for _, it := range items {
		totalDisetujui += it.TotalDisetujui
		totalPermohonan += it.TotalPermohonan
		totalLaporan += it.TotalLaporan
		totalJam += it.TotalJamPakai
	}

	pdf.SetFillColor(241, 245, 249)
	pdf.SetFont("Arial", "B", 9)
	pdf.SetTextColor(51, 65, 85)
	ringkasan := fmt.Sprintf("  Total Fasilitas Terdata: %d  |  Total Reservasi Disetujui: %d  |  Total Jam Pemakaian: %.1f Jam  |  Total Laporan: %d",
		len(items), totalDisetujui, totalJam, totalLaporan)
	pdf.CellFormat(267, 7, ringkasan, "1", 1, "L", true, 0, "")
	pdf.Ln(3)

	// Table Header
	headers := []struct {
		Title string
		Width float64
		Align string
	}{
		{"No", 10, "C"},
		{"Fasilitas", 60, "L"},
		{"Tipe", 30, "L"},
		{"Lokasi/Gedung", 42, "L"},
		{"Status", 25, "C"},
		{"Disetujui", 25, "C"},
		{"Jam Pakai", 25, "C"},
		{"Pengajuan", 25, "C"},
		{"Laporan", 25, "C"},
	}

	pdf.SetFillColor(30, 41, 59)
	pdf.SetTextColor(255, 255, 255)
	pdf.SetFont("Arial", "B", 8.5)

	for _, h := range headers {
		pdf.CellFormat(h.Width, 7, h.Title, "1", 0, h.Align, true, 0, "")
	}
	pdf.Ln(-1)

	// Table Body
	pdf.SetFont("Arial", "", 8)
	pdf.SetTextColor(30, 41, 59)

	for i, it := range items {
		if i%2 == 0 {
			pdf.SetFillColor(255, 255, 255)
		} else {
			pdf.SetFillColor(248, 250, 252)
		}

		pdf.CellFormat(10, 6.5, fmt.Sprintf("%d", i+1), "1", 0, "C", true, 0, "")
		pdf.CellFormat(60, 6.5, it.NamaFasilitas, "1", 0, "L", true, 0, "")
		pdf.CellFormat(30, 6.5, it.Tipe, "1", 0, "L", true, 0, "")
		pdf.CellFormat(42, 6.5, it.Lokasi, "1", 0, "L", true, 0, "")
		pdf.CellFormat(25, 6.5, it.Status, "1", 0, "C", true, 0, "")
		pdf.CellFormat(25, 6.5, fmt.Sprintf("%d", it.TotalDisetujui), "1", 0, "C", true, 0, "")
		pdf.CellFormat(25, 6.5, fmt.Sprintf("%.1f Jam", it.TotalJamPakai), "1", 0, "C", true, 0, "")
		pdf.CellFormat(25, 6.5, fmt.Sprintf("%d", it.TotalPermohonan), "1", 0, "C", true, 0, "")
		pdf.CellFormat(25, 6.5, fmt.Sprintf("%d", it.TotalLaporan), "1", 0, "C", true, 0, "")
		pdf.Ln(-1)
	}

	var buf bytes.Buffer
	if err := pdf.Output(&buf); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

func GenerateReportsPDF(items []models.ReportRekapItem, filterDesc string) ([]byte, error) {
	pdf := gofpdf.New("L", "mm", "A4", "")
	pdf.SetMargins(15, 15, 15)
	pdf.SetAutoPageBreak(true, 15)

	pdf.SetFooterFunc(func() {
		pdf.SetY(-12)
		pdf.SetFont("Arial", "I", 8)
		pdf.SetTextColor(128, 128, 128)
		pdf.CellFormat(0, 8, fmt.Sprintf("Dicetak via SIPINJAM Universitas Diponegoro • Halaman %d/{nb}", pdf.PageNo()), "", 0, "C", false, 0, "")
	})

	pdf.AliasNbPages("{nb}")
	pdf.AddPage()

	pdf.SetFont("Arial", "B", 14)
	pdf.SetTextColor(30, 41, 59)
	pdf.CellFormat(0, 7, "UNIVERSITAS DIPONEGORO - SIPINJAM", "", 1, "C", false, 0, "")

	pdf.SetFont("Arial", "B", 12)
	pdf.SetTextColor(71, 85, 105)
	pdf.CellFormat(0, 6, "LAPORAN REKAP KERUSAKAN & PENGADUAN FASILITAS", "", 1, "C", false, 0, "")

	pdf.SetFont("Arial", "", 9)
	pdf.SetTextColor(100, 116, 139)
	waktuCetak := time.Now().Format("02 Jan 2006 15:04:05") + " WIB"
	pdf.CellFormat(0, 5, fmt.Sprintf("Filter: %s • Tanggal Cetak: %s", filterDesc, waktuCetak), "", 1, "C", false, 0, "")
	pdf.Ln(4)

	pdf.SetDrawColor(203, 213, 225)
	pdf.SetLineWidth(0.4)
	pdf.Line(15, pdf.GetY(), 282, pdf.GetY())
	pdf.Ln(4)

	headers := []struct {
		Title string
		Width float64
		Align string
	}{
		{"No", 10, "C"},
		{"ID", 12, "C"},
		{"Pelapor", 32, "L"},
		{"Fasilitas", 45, "L"},
		{"Tipe", 20, "C"},
		{"Kategori", 28, "L"},
		{"Status", 20, "C"},
		{"Alasan / Keluhan", 60, "L"},
		{"Catatan Resolusi", 40, "L"},
	}

	pdf.SetFillColor(30, 41, 59)
	pdf.SetTextColor(255, 255, 255)
	pdf.SetFont("Arial", "B", 8.5)

	for _, h := range headers {
		pdf.CellFormat(h.Width, 7, h.Title, "1", 0, h.Align, true, 0, "")
	}
	pdf.Ln(-1)

	pdf.SetFont("Arial", "", 8)
	pdf.SetTextColor(30, 41, 59)

	for i, it := range items {
		if i%2 == 0 {
			pdf.SetFillColor(255, 255, 255)
		} else {
			pdf.SetFillColor(248, 250, 252)
		}

		catatan := "-"
		if it.CatatanResolusi != nil && *it.CatatanResolusi != "" {
			catatan = *it.CatatanResolusi
		}

		pdf.CellFormat(10, 6.5, fmt.Sprintf("%d", i+1), "1", 0, "C", true, 0, "")
		pdf.CellFormat(12, 6.5, fmt.Sprintf("#%d", it.ID), "1", 0, "C", true, 0, "")
		pdf.CellFormat(32, 6.5, it.Pelapor, "1", 0, "L", true, 0, "")
		pdf.CellFormat(45, 6.5, it.Fasilitas, "1", 0, "L", true, 0, "")
		pdf.CellFormat(20, 6.5, it.TipeFasilitas, "1", 0, "C", true, 0, "")
		pdf.CellFormat(28, 6.5, it.KategoriLaporan, "1", 0, "L", true, 0, "")
		pdf.CellFormat(20, 6.5, it.Status, "1", 0, "C", true, 0, "")
		pdf.CellFormat(60, 6.5, it.Alasan, "1", 0, "L", true, 0, "")
		pdf.CellFormat(40, 6.5, catatan, "1", 0, "L", true, 0, "")
		pdf.Ln(-1)
	}

	var buf bytes.Buffer
	if err := pdf.Output(&buf); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

func GenerateOccupancyCSV(items []models.OccupancyRekapItem) []byte {
	var buf bytes.Buffer
	buf.WriteString("Fasilitas,Tipe,Lokasi/Gedung,Status,Reservasi (Disetujui),Total Jam Pemakaian,Total Pengajuan,Laporan Kerusakan\n")
	for _, it := range items {
		buf.WriteString(fmt.Sprintf("\"%s\",\"%s\",\"%s\",\"%s\",%d,\"%.1f jam\",%d,%d\n",
			it.NamaFasilitas, it.Tipe, it.Lokasi, it.Status, it.TotalDisetujui, it.TotalJamPakai, it.TotalPermohonan, it.TotalLaporan))
	}
	return buf.Bytes()
}

func GenerateOccupancyExcel(items []models.OccupancyRekapItem) []byte {
	var buf bytes.Buffer
	buf.WriteString("<html><head><meta charset=\"utf-8\"><style>table, th, td { border: 1px solid #ddd; border-collapse: collapse; padding: 6px; font-family: Arial; } th { background-color: #f2f2f2; font-weight: bold; }</style></head><body>")
	buf.WriteString("<table><thead><tr><th>Fasilitas</th><th>Tipe</th><th>Lokasi/Gedung</th><th>Status Saat Ini</th><th>Reservasi Disetujui</th><th>Total Jam Pemakaian</th><th>Total Permohonan</th><th>Laporan Kerusakan</th></tr></thead><tbody>")
	for _, it := range items {
		buf.WriteString(fmt.Sprintf("<tr><td>%s</td><td>%s</td><td>%s</td><td>%s</td><td>%d</td><td>%.1f jam</td><td>%d</td><td>%d</td></tr>",
			it.NamaFasilitas, it.Tipe, it.Lokasi, it.Status, it.TotalDisetujui, it.TotalJamPakai, it.TotalPermohonan, it.TotalLaporan))
	}
	buf.WriteString("</tbody></table></body></html>")
	return buf.Bytes()
}
