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

  return (
    <div>
      <div className="content-head">
        <h2>Rekap okupansi &amp; kerusakan</h2>
        <p>Ringkasan lintas fasilitas, siap diekspor untuk laporan.</p>
      </div>

      <div className="btn-row" style={{ marginBottom: 16 }}>
        <button className="btn" onClick={exportCsv}>Ekspor CSV</button>
        <button className="btn" onClick={exportCsv}>Ekspor Excel</button>
        <button className="btn" onClick={() => window.print()}>Ekspor PDF (print)</button>
      </div>

      <div className="panel table-scroll">
        <table>
          <thead>
            <tr>
              <th>Fasilitas</th>
              <th>Tipe</th>
              <th>Lokasi</th>
              <th>Total reservasi</th>
              <th>Disetujui</th>
              <th>Laporan kerusakan</th>
              <th>Status saat ini</th>
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
