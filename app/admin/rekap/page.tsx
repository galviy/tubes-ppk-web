'use client';

import { useState } from 'react';
import { useAppData } from '@/context/AppDataContext';

export default function RekapEksporPage() {
  const { facilities, reservations, reports } = useAppData();
  const [filterFacility, setFilterFacility] = useState<string>('semua');
  const [exportFormat, setExportFormat] = useState<'excel' | 'csv' | 'pdf'>('excel');

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

  const filteredFacilities = filterFacility === 'semua'
    ? facilities
    : facilities.filter((f) => f.id === filterFacility);

  function handleExport() {
    if (exportFormat === 'pdf') {
      window.print();
      return;
    }
    if (exportFormat === 'csv') {
      exportCsv();
      return;
    }
    exportExcel();
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
    a.download = `rekap-okupansi-undip-${filterFacility}.csv`;
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
    a.download = `rekap-fasilitas-universitas-diponegoro-${filterFacility}.xls`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="content-head">
        <h2>Rekap Okupansi &amp; Kerusakan</h2>
        <p>Ringkasan utilisasi fasilitas, durasi penggunaan, dan laporan kerusakan siap ekspor.</p>
      </div>

      {/* Filter & Ekspor Data Bar matching Reference Image 1 */}
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

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: '#6B7280', marginBottom: 4, fontWeight: 600 }}>
              Filter berdasarkan
            </label>
            <select
              value={filterFacility}
              onChange={(e) => setFilterFacility(e.target.value)}
              style={{ padding: '7px 12px', fontSize: 13, borderRadius: 6, border: '1px solid #D5D0C7', background: '#FFFFFF', minWidth: 200 }}
            >
              <option value="semua">Semua Fasilitas ({facilities.length})</option>
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.loc})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, color: '#6B7280', marginBottom: 4, fontWeight: 600 }}>
              Format Dokumen
            </label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as any)}
              style={{ padding: '7px 12px', fontSize: 13, borderRadius: 6, border: '1px solid #D5D0C7', background: '#FFFFFF' }}
            >
              <option value="excel">Excel (.xlsx / .xls)</option>
              <option value="csv">CSV (.csv)</option>
              <option value="pdf">PDF (Print Preview)</option>
            </select>
          </div>

          <div style={{ alignSelf: 'flex-end' }}>
            <button
              type="button"
              className="btn primary"
              onClick={handleExport}
              style={{ padding: '8px 18px', fontSize: 13 }}
            >
              Ekspor ({filteredFacilities.length} fasilitas)
            </button>
          </div>
        </div>
      </div>

      {/* Table matching Reference Image 1 */}
      <div className="panel table-scroll" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>Fasilitas</th>
              <th>Tipe</th>
              <th>Lokasi / Gedung</th>
              <th>Status</th>
              <th>Reservasi</th>
              <th>Total Jam</th>
              <th>Laporan</th>
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
              filteredFacilities.map((f) => {
                const totalReservasi = reservations.filter((r) => r.facilityId === f.id).length;
                const disetujui = reservations.filter((r) => r.facilityId === f.id && r.status === 'disetujui').length;
                const laporan = reports.filter((r) => r.facilityId === f.id).length;
                const totalJam = calculateTotalHours(f.id);

                return (
                  <tr key={f.id}>
                    {/* Fasilitas */}
                    <td style={{ fontWeight: 600, color: '#181D24', whiteSpace: 'nowrap' }}>
                      {f.name}
                    </td>

                    {/* Tipe */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {f.type}
                    </td>

                    {/* Gedung / Lokasi */}
                    <td style={{ whiteSpace: 'nowrap', color: '#4B5563' }}>
                      {f.loc}
                    </td>

                    {/* Status */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span className={`pill ${f.status === 'repair' ? 'busy' : 'avail'}`}>
                        {f.status === 'repair' ? 'Perbaikan' : 'Aktif'}
                      </span>
                    </td>

                    {/* Reservasi Disetujui / Total */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <b>{disetujui}</b> <span style={{ fontSize: 11, color: '#6B7280' }}>/ {totalReservasi} total</span>
                    </td>

                    {/* Total Jam */}
                    <td style={{ whiteSpace: 'nowrap', fontWeight: 600, color: '#181D24' }}>
                      {totalJam} jam
                    </td>

                    {/* Laporan Kerusakan */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span style={{ color: laporan > 0 ? '#DC2626' : '#6B7280', fontWeight: laporan > 0 ? 700 : 400 }}>
                        {laporan}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
