'use client';

import { useState, useEffect } from 'react';
import { useAppData } from '@/context/AppDataContext';
import { backendDownloadOccupancyExport } from '@/lib/api';
import Pagination from '@/components/Pagination';

export default function RekapEksporPage() {
  const {
    facilities,
    reservations,
    reports,
    refreshFacilities,
    refreshReservations,
    refreshPetugasReports,
  } = useAppData();

  useEffect(() => {
    refreshFacilities();
    refreshReservations();
    refreshPetugasReports();
  }, [refreshFacilities, refreshReservations, refreshPetugasReports]);

  const [filterMode, setFilterMode] = useState<'semua' | 'fasilitas' | 'gedung'>('semua');
  const [selectedGedung, setSelectedGedung] = useState<string>('Pilih');
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('Pilih');
  const [exportFormat, setExportFormat] = useState<'excel' | 'csv' | 'pdf'>('excel');

  // Dynamic buildings extracted from active facilities
  const buildingList = Array.from(new Set(facilities.map((f) => f.loc))).filter(Boolean);

  function calculateTotalHours(facilityId: string) {
    const approved = reservations.filter((r) => r.facilityId === facilityId && r.status === 'disetujui');
    let totalMins = 0;
    for (const r of approved) {
      const [sh, sm] = r.start.split(':').map(Number);
      const [eh, em] = r.end.split(':').map(Number);
      const mins = (eh * 60 + em) - (sh * 60 + sm);
      if (mins > 0) totalMins += mins;
    }
    return (totalMins / 60).toFixed(1);
  }

  const filteredFacilities = facilities.filter((f) => {
    if (filterMode === 'gedung') {
      if (!selectedGedung || selectedGedung === 'Pilih') return true;
      return f.loc === selectedGedung;
    }
    if (filterMode === 'fasilitas') {
      if (!selectedFacilityId || selectedFacilityId === 'Pilih') return true;
      return f.id === selectedFacilityId;
    }
    return true;
  });

  // Paginasi: 10 data per halaman (konsisten dengan Semua Laporan & Semua Reservasi)
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Reset ke halaman 1 saat filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [filterMode, selectedGedung, selectedFacilityId]);

  const totalPages = Math.ceil(filteredFacilities.length / ITEMS_PER_PAGE) || 1;
  const paginatedFacilities = filteredFacilities.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const exportSuffix =
    filterMode === 'gedung' && selectedGedung !== 'Pilih'
      ? selectedGedung.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      : filterMode === 'fasilitas' && selectedFacilityId !== 'Pilih'
      ? selectedFacilityId
      : 'semua-fasilitas';

  const [isExporting, setIsExporting] = useState(false);

  async function handleExport() {
    setIsExporting(true);
    try {
      if (exportFormat === 'pdf') {
        const ok = await backendDownloadOccupancyExport(
          'pdf',
          filterMode,
          selectedGedung,
          selectedFacilityId,
          `rekap-okupansi-undip-${exportSuffix}.pdf`
        );
        if (!ok) {
          exportClientPdf();
        }
        return;
      }
      if (exportFormat === 'csv') {
        const ok = await backendDownloadOccupancyExport(
          'csv',
          filterMode,
          selectedGedung,
          selectedFacilityId,
          `rekap-okupansi-undip-${exportSuffix}.csv`
        );
        if (!ok) {
          exportCsv();
        }
        return;
      }
      const ok = await backendDownloadOccupancyExport(
        'excel',
        filterMode,
        selectedGedung,
        selectedFacilityId,
        `rekap-fasilitas-undip-${exportSuffix}.xls`
      );
      if (!ok) {
        exportExcel();
      }
    } finally {
      setIsExporting(false);
    }
  }

  function exportClientPdf() {
    let filterLabel = 'Semua Fasilitas';
    if (filterMode === 'gedung' && selectedGedung !== 'Pilih') {
      filterLabel = `Gedung/Lokasi: ${selectedGedung}`;
    } else if (filterMode === 'fasilitas' && selectedFacilityId !== 'Pilih') {
      const f = facilities.find((item) => item.id === selectedFacilityId);
      filterLabel = `Fasilitas: ${f ? f.name : selectedFacilityId}`;
    }

    let rowsHtml = '';
    filteredFacilities.forEach((f, idx) => {
      const facilityReservations = reservations.filter((r) => r.facilityId === f.id);
      const disetujui = facilityReservations.filter((r) => r.status === 'disetujui').length;
      const laporan = reports.filter((r) => r.facilityId === f.id).length;
      const totalJam = calculateTotalHours(f.id);
      const isRepair = f.status === 'repair';

      rowsHtml += `
        <tr>
          <td style="text-align:center;">${idx + 1}</td>
          <td style="font-weight:600;">${f.name}</td>
          <td>${f.type}</td>
          <td>${f.loc}</td>
          <td style="text-align:center;">
            <span class="badge ${isRepair ? 'badge-repair' : 'badge-aktif'}">
              ${isRepair ? 'Perbaikan' : 'Aktif'}
            </span>
          </td>
          <td style="text-align:center; font-weight:600; color:#16a34a;">${disetujui > 0 ? disetujui + ' Disetujui' : '-'}</td>
          <td style="text-align:center;">${parseFloat(totalJam) > 0 ? totalJam + ' jam' : '-'}</td>
          <td style="text-align:center; font-weight:600; color:${laporan > 0 ? '#dc2626' : '#6b7280'};">${laporan > 0 ? laporan + ' laporan' : '-'}</td>
        </tr>
      `;
    });

    const now = new Date();
    const formattedDate = `${now.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Gunakan hidden iframe agar cetak terjadi in-place tanpa membuka tab about:blank baru
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Rekap Okupansi & Kerusakan - SIPINJAM UNDIP</title>
          <style>
            @page { size: A4 landscape; margin: 12mm; }
            * { box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 11px; color: #181d24; margin: 0; padding: 15px; }
            .header { text-align: center; border-bottom: 2px solid #b59876; padding-bottom: 10px; margin-bottom: 12px; }
            .header h1 { font-size: 15px; margin: 0; font-weight: 700; color: #15171a; letter-spacing: 0.5px; }
            .header h2 { font-size: 12.5px; margin: 4px 0 0; color: #64748b; font-weight: 600; }
            .meta { font-size: 10px; color: #64748b; margin-top: 4px; }
            .summary { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 4px; padding: 6px 12px; margin-bottom: 12px; font-size: 10.5px; font-weight: 600; color: #334155; }
            table { width: 100%; border-collapse: collapse; margin-top: 6px; }
            th, td { border: 1px solid #cbd5e1; padding: 6px 8px; font-size: 10px; }
            th { background: #1e293b; color: #ffffff; font-weight: 600; text-align: left; }
            tr:nth-child(even) td { background: #f8fafc; }
            .badge { display: inline-block; padding: 2px 6px; border-radius: 3px; font-size: 9.5px; font-weight: 600; }
            .badge-aktif { background: #dcfce7; color: #166534; }
            .badge-repair { background: #fee2e2; color: #991b1b; }
            .footer { margin-top: 14px; text-align: right; font-size: 9.5px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 6px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>UNIVERSITAS DIPONEGORO — SIPINJAM</h1>
            <h2>LAPORAN REKAP OKUPANSI & KERUSAKAN FASILITAS</h2>
            <div class="meta">Filter: ${filterLabel} • Dicetak pada: ${formattedDate} WIB</div>
          </div>
          <div class="summary">
            Total Fasilitas: ${filteredFacilities.length} fasilitas terdata
          </div>
          <table>
            <thead>
              <tr>
                <th style="width:5%; text-align:center;">No</th>
                <th style="width:25%;">Fasilitas</th>
                <th style="width:15%;">Tipe</th>
                <th style="width:25%;">Lokasi</th>
                <th style="width:10%; text-align:center;">Status</th>
                <th style="width:10%; text-align:center;">Reservasi</th>
                <th style="width:10%; text-align:center;">Jam Terpakai</th>
                <th style="width:10%; text-align:center;">Kerusakan</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <div class="footer">
            Dokumen Rekap Resmi Sistem Informasi Peminjaman Fasilitas (SIPINJAM) Universitas Diponegoro
          </div>
        </body>
      </html>
    `);
    doc.close();

    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();

    setTimeout(() => {
      try {
        document.body.removeChild(iframe);
      } catch {}
    }, 2500);
  }

  function exportCsv() {
    let csv = 'Fasilitas,Tipe,Lokasi/Gedung,Status,Reservasi (Disetujui),Total Jam Pemakaian,Total Pengajuan,Laporan Kerusakan\n';
    filteredFacilities.forEach((f) => {
      const total = reservations.filter((r) => r.facilityId === f.id).length;
      const disetujui = reservations.filter((r) => r.facilityId === f.id && r.status === 'disetujui').length;
      const laporan = reports.filter((r) => r.facilityId === f.id).length;
      const totalJam = calculateTotalHours(f.id);
      csv += `"${f.name}","${f.type}","${f.loc}","${f.status === 'repair' ? 'Perbaikan' : 'Aktif'}",${disetujui},"${totalJam} jam",${total},${laporan}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rekap-okupansi-undip-${exportSuffix}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportExcel() {
    let html = `<html><head><meta charset="utf-8"><style>table, th, td { border: 1px solid #ddd; border-collapse: collapse; padding: 6px; font-family: Arial; } th { background-color: #f2f2f2; font-weight: bold; }</style></head><body>`;
    html += '<table><thead><tr><th>Fasilitas</th><th>Tipe</th><th>Lokasi/Gedung</th><th>Status Saat Ini</th><th>Reservasi Disetujui</th><th>Total Jam Pemakaian</th><th>Total Permohonan</th><th>Laporan Kerusakan</th></tr></thead><tbody>';
    filteredFacilities.forEach((f) => {
      const total = reservations.filter((r) => r.facilityId === f.id).length;
      const disetujui = reservations.filter((r) => r.facilityId === f.id && r.status === 'disetujui').length;
      const laporan = reports.filter((r) => r.facilityId === f.id).length;
      const totalJam = calculateTotalHours(f.id);
      html += `<tr><td>${f.name}</td><td>${f.type}</td><td>${f.loc}</td><td>${f.status === 'repair' ? 'Perbaikan' : 'Aktif'}</td><td>${disetujui}</td><td>${totalJam} jam</td><td>${total}</td><td>${laporan}</td></tr>`;
    });
    html += '</tbody></table></body></html>';
    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rekap-fasilitas-undip-${exportSuffix}.xls`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="content-head">
        <h2>Rekap Okupansi &amp; Kerusakan</h2>
        <p>Ringkasan utilisasi fasilitas, durasi penggunaan, dan laporan kerusakan siap ekspor.</p>
      </div>

      {/* Filter & Ekspor Data Bar matching Reference Images 1, 2, 3 */}
      <div
        className="panel"
        style={{
          padding: '16px 20px',
          marginBottom: 18,
          background: '#FAF8F5',
          border: '1px solid #E5E0D8',
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: '#181D24', marginBottom: 10 }}>
          Filter &amp; Ekspor Data
        </div>

        <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Dropdown 1: Filter berdasarkan */}
          <div>
            <label style={{ display: 'block', fontSize: 13.5, color: '#6B7280', marginBottom: 4, fontWeight: 600 }}>
              Filter berdasarkan
            </label>
            <select
              value={filterMode}
              onChange={(e) => {
                const mode = e.target.value as 'semua' | 'fasilitas' | 'gedung';
                setFilterMode(mode);
                setSelectedGedung('Pilih');
                setSelectedFacilityId('Pilih');
              }}
              style={{
                padding: '7px 12px',
                fontSize: 13,
                borderRadius: 6,
                border: '1px solid #D5D0C7',
                background: '#FFFFFF',
                minWidth: 170,
              }}
            >
              <option value="semua">Semua Fasilitas</option>
              <option value="fasilitas">Fasilitas Tertentu</option>
              <option value="gedung">Gedung/Lokasi</option>
            </select>
          </div>

          {/* Dropdown 2: Jika filter Gedung/Lokasi dipilih */}
          {filterMode === 'gedung' && (
            <div>
              <label style={{ display: 'block', fontSize: 13.5, color: '#6B7280', marginBottom: 4, fontWeight: 600 }}>
                Pilih Gedung
              </label>
              <select
                value={selectedGedung}
                onChange={(e) => setSelectedGedung(e.target.value)}
                style={{
                  padding: '7px 12px',
                  fontSize: 13,
                  borderRadius: 6,
                  border: '1px solid #D5D0C7',
                  background: '#FFFFFF',
                  minWidth: 170,
                }}
              >
                <option value="Pilih">Pilih Gedung</option>
                {buildingList.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Dropdown 2: Jika filter Fasilitas Tertentu dipilih */}
          {filterMode === 'fasilitas' && (
            <div>
              <label style={{ display: 'block', fontSize: 13.5, color: '#6B7280', marginBottom: 4, fontWeight: 600 }}>
                Pilih Fasilitas
              </label>
              <select
                value={selectedFacilityId}
                onChange={(e) => setSelectedFacilityId(e.target.value)}
                style={{
                  padding: '7px 12px',
                  fontSize: 13,
                  borderRadius: 6,
                  border: '1px solid #D5D0C7',
                  background: '#FFFFFF',
                  minWidth: 200,
                }}
              >
                <option value="Pilih">Pilih Fasilitas</option>
                {facilities.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Format Dokumen */}
          <div>
            <label style={{ display: 'block', fontSize: 13.5, color: '#6B7280', marginBottom: 4, fontWeight: 600 }}>
              Format Dokumen
            </label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as any)}
              style={{
                padding: '7px 12px',
                fontSize: 13,
                borderRadius: 6,
                border: '1px solid #D5D0C7',
                background: '#FFFFFF',
              }}
            >
              <option value="excel">Excel (.xlsx / .xls)</option>
              <option value="csv">CSV (.csv)</option>
              <option value="pdf">PDF (.pdf)</option>
            </select>
          </div>

          <div style={{ alignSelf: 'flex-end' }}>
            <button
              type="button"
              className="btn primary"
              onClick={handleExport}
              disabled={isExporting}
              style={{ padding: '8px 18px', fontSize: 13 }}
            >
              {isExporting ? 'Mengunduh...' : `Ekspor (${filteredFacilities.length} fasilitas)`}
            </button>
          </div>
        </div>
      </div>

      {/* Table matching Reference Images 1 & 2 */}
      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px 10px', borderBottom: '1px solid #E5E0D8' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#181D24', margin: 0 }}>
            Rekap Okupansi &amp; Kerusakan{' '}
            <span style={{ fontWeight: 400, color: '#6B7280', fontSize: 13 }}>
              ({filteredFacilities.length} fasilitas ditampilkan)
            </span>
          </h3>
        </div>
        <div className="table-scroll" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', tableLayout: 'auto' }}>
            <thead>
              <tr>
                <th style={{ width: '22%' }}>Fasilitas</th>
                <th style={{ width: '14%' }}>Tipe</th>
                <th style={{ width: '24%' }}>Lokasi</th>
                <th style={{ width: '12%', textAlign: 'left', paddingLeft: 18 }}>Status</th>
                <th style={{ width: '10%', textAlign: 'center' }}>Reservasi</th>
                <th style={{ width: '9%', textAlign: 'center' }}>Jam Terpakai</th>
                <th style={{ width: '9%', textAlign: 'center' }}>Kerusakan</th>
              </tr>
            </thead>
            <tbody>
              {filteredFacilities.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: '#6B7280', padding: 24 }}>
                    Tidak ada data fasilitas yang sesuai filter.
                  </td>
                </tr>
              ) : (
                paginatedFacilities.map((f) => {
                  const facilityReservations = reservations.filter((r) => r.facilityId === f.id);
                  const totalReservasi = facilityReservations.length;
                  const disetujui = facilityReservations.filter((r) => r.status === 'disetujui').length;
                  const menunggu = facilityReservations.filter((r) => r.status === 'menunggu').length;
                  const ditolak = facilityReservations.filter((r) => r.status === 'ditolak').length;
                  const laporan = reports.filter((r) => r.facilityId === f.id).length;
                  const totalJam = calculateTotalHours(f.id);

                  return (
                    <tr key={f.id}>
                      {/* Fasilitas */}
                      <td style={{ fontWeight: 600, color: '#181D24', maxWidth: 220, wordBreak: 'break-word' }}>
                        {f.name}
                      </td>

                      {/* Tipe */}
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {f.type}
                      </td>

                      {/* Gedung / Lokasi */}
                      <td style={{ maxWidth: 240, wordBreak: 'break-word', color: '#4B5563', fontSize: 13.5 }}>
                        {f.loc}
                      </td>

                      {/* Status Fasilitas */}
                      <td style={{ whiteSpace: 'nowrap', textAlign: 'left', paddingLeft: 18 }}>
                        <span className={`pill ${f.status === 'repair' ? 'busy' : 'avail'}`}>
                          {f.status === 'repair' ? 'Perbaikan' : 'Aktif'}
                        </span>
                      </td>

                      {/* Status Reservasi */}
                      <td style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                        {totalReservasi === 0 ? (
                          <span style={{ color: '#9CA3AF', fontSize: 13 }}>-</span>
                        ) : (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                            {disetujui > 0 && (
                              <span style={{ color: '#16A34A', fontWeight: 600 }}>
                                {disetujui} Disetujui
                              </span>
                            )}
                            {disetujui > 0 && menunggu > 0 && (
                              <span style={{ color: '#D1D5DB' }}>•</span>
                            )}
                            {menunggu > 0 && (
                              <span style={{ color: '#D97706', fontWeight: 600 }}>
                                {menunggu} Menunggu
                              </span>
                            )}
                            {disetujui === 0 && menunggu === 0 && ditolak > 0 && (
                              <span style={{ color: '#DC2626', fontWeight: 600 }}>
                                {ditolak} Ditolak
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Total Jam Terpakai */}
                      <td style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                        {parseFloat(totalJam) > 0 ? (
                          <span style={{ fontWeight: 600, color: '#181D24' }}>
                            {parseFloat(totalJam) % 1 === 0 ? parseInt(totalJam) : totalJam} jam
                          </span>
                        ) : (
                          <span style={{ color: '#9CA3AF', fontSize: 13 }}>-</span>
                        )}
                      </td>

                      {/* Laporan Kerusakan */}
                      <td style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                        {laporan > 0 ? (
                          <span style={{ color: '#DC2626', fontWeight: 700 }}>{laporan} laporan</span>
                        ) : (
                          <span style={{ color: '#9CA3AF', fontSize: 13 }}>-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginasi Data */}
        <div style={{ padding: '0 20px 16px 20px' }}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredFacilities.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}
