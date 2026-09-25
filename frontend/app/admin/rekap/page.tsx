'use client';

import { useState, useEffect } from 'react';
import { useAppData } from '@/context/AppDataContext';

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

  const exportSuffix =
    filterMode === 'gedung' && selectedGedung !== 'Pilih'
      ? selectedGedung.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      : filterMode === 'fasilitas' && selectedFacilityId !== 'Pilih'
      ? selectedFacilityId
      : 'semua-fasilitas';

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

      {/* Table matching Reference Images 1 & 2 */}
      <div className="panel table-scroll" style={{ padding: 0 }}>
        <div style={{ padding: '14px 20px 10px', borderBottom: '1px solid #E5E0D8' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#181D24', margin: 0 }}>
            Rekap Okupansi &amp; Kerusakan{' '}
            <span style={{ fontWeight: 400, color: '#6B7280', fontSize: 13 }}>
              ({filteredFacilities.length} fasilitas ditampilkan)
            </span>
          </h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>Fasilitas</th>
              <th>Tipe</th>
              <th>Lokasi</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Reservasi</th>
              <th style={{ textAlign: 'center' }}>Jam Terpakai</th>
              <th style={{ textAlign: 'center' }}>Kerusakan</th>
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

                    {/* Status Fasilitas */}
                    <td style={{ whiteSpace: 'nowrap' }}>
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
    </div>
  );
}
