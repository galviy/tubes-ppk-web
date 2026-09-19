'use client';

import { useAppData } from '@/context/AppDataContext';

export default function RekapEksporPage() {
  const { facilities, reservations, reports } = useAppData();

  function exportCsv() {
    let csv = 'Fasilitas,Tipe,Lokasi,Total Reservasi,Disetujui,Laporan Kerusakan,Status\n';
    facilities.forEach((f) => {
      const total = reservations.filter((r) => r.facilityId === f.id).length;
      const disetujui = reservations.filter((r) => r.facilityId === f.id && r.status === 'disetujui').length;
      const laporan = reports.filter((r) => r.facilityId === f.id).length;
      csv += `"${f.name}","${f.type}","${f.loc}",${total},${disetujui},${laporan},"${f.status}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rekap-fasilitas.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportExcel() {
    let html = `<html><head><meta charset="utf-8"><style>table, th, td { border: 1px solid #ddd; border-collapse: collapse; padding: 6px; font-family: Arial; } th { background-color: #f2f2f2; font-weight: bold; }</style></head><body>`;
    html += '<table><thead><tr><th>Fasilitas</th><th>Tipe</th><th>Lokasi</th><th>Total Reservasi</th><th>Disetujui</th><th>Laporan Kerusakan</th><th>Status Saat Ini</th></tr></thead><tbody>';
    facilities.forEach((f) => {
      const total = reservations.filter((r) => r.facilityId === f.id).length;
      const disetujui = reservations.filter((r) => r.facilityId === f.id && r.status === 'disetujui').length;
      const laporan = reports.filter((r) => r.facilityId === f.id).length;
      html += `<tr><td>${f.name}</td><td>${f.type}</td><td>${f.loc}</td><td>${total}</td><td>${disetujui}</td><td>${laporan}</td><td>${f.status === 'repair' ? 'Perbaikan' : 'Aktif'}</td></tr>`;
    });
    html += '</tbody></table></body></html>';
    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rekap-fasilitas-universitas-diponegoro.xls';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="content-head">
        <h2>Rekap Okupansi &amp; Kerusakan</h2>
        <p>Ringkasan lintas fasilitas, siap diekspor untuk laporan.</p>
      </div>

      <div className="btn-row" style={{ marginBottom: 16 }}>
        <button className="btn" onClick={exportCsv}>Ekspor CSV</button>
        <button className="btn" onClick={exportExcel}>Ekspor Excel (.xls)</button>
        <button className="btn" onClick={() => window.print()}>Ekspor PDF (Print)</button>
      </div>

      <div className="panel table-scroll">
        <table>
          <thead>
            <tr>
              <th>Fasilitas</th>
              <th>Tipe</th>
              <th>Lokasi</th>
              <th>Total Reservasi</th>
              <th>Disetujui</th>
              <th>Laporan Kerusakan</th>
              <th>Status Saat Ini</th>
            </tr>
          </thead>
          <tbody>
            {facilities.map((f) => {
              const total = reservations.filter((r) => r.facilityId === f.id).length;
              const disetujui = reservations.filter((r) => r.facilityId === f.id && r.status === 'disetujui').length;
              const laporan = reports.filter((r) => r.facilityId === f.id).length;
              return (
                <tr key={f.id}>
                  <td>{f.name}</td>
                  <td>{f.type}</td>
                  <td>{f.loc}</td>
                  <td>{total}</td>
                  <td>{disetujui}</td>
                  <td>{laporan}</td>
                  <td>
                    <span className={`pill ${f.status === 'repair' ? 'repair' : 'avail'}`}>
                      {f.status === 'repair' ? 'Perbaikan' : 'Aktif'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
