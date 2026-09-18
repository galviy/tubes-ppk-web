'use client';

import { useAppData } from '@/context/AppDataContext';
import { ReportStatus } from '@/models/report';

const STATUS_PILL: Record<ReportStatus, [string, string]> = {
  baru: ['busy', 'Baru'],
  diproses: ['avail', 'Diproses'],
  selesai: ['avail', 'Selesai'],
  ditolak: ['danger', 'Ditolak'],
};

export default function AntrianLaporanPage() {
  const { reports, facilityById, updateReportStatus, setFacilityStatus } = useAppData();

  function handleSelesai(id: number) {
    const catatan = prompt('Catatan resolusi:', 'Sudah diperbaiki.');
    if (catatan === null) return;
    updateReportStatus(id, 'selesai', catatan);
  }

  function handleTolak(id: number) {
    const catatan = prompt('Alasan penolakan laporan:');
    if (catatan === null) return;
    updateReportStatus(id, 'ditolak', catatan);
  }

  return (
    <div>
      <div className="content-head">
        <h2>Antrian laporan kerusakan</h2>
        <p>Ubah status laporan dan tandai fasilitas dalam perbaikan bila perlu.</p>
      </div>

      <div className="panel table-scroll">
        <table>
          <thead>
            <tr>
              <th>Pelapor</th>
              <th>Fasilitas</th>
              <th>Kategori</th>
              <th>Deskripsi</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => {
              const facility = facilityById(r.facilityId);
              const [cls, label] = STATUS_PILL[r.status];
              const open = r.status !== 'selesai' && r.status !== 'ditolak';
              return (
                <tr key={r.id}>
                  <td>{r.pelapor}</td>
                  <td>{facility?.name}</td>
                  <td>{r.kategori}</td>
                  <td>{r.deskripsi}</td>
                  <td><span className={`pill ${cls}`}>{label}</span></td>
                  <td className="btn-row">
                    {open && (
                      <>
                        <button className="btn ghost-avail" onClick={() => updateReportStatus(r.id, 'diproses')}>
                          Proses
                        </button>
                        <button className="btn ghost-avail" onClick={() => handleSelesai(r.id)}>
                          Selesai
                        </button>
                        <button className="btn ghost-danger" onClick={() => handleTolak(r.id)}>
                          Tolak
                        </button>
                      </>
                    )}
                    {facility?.status === 'avail' ? (
                      <button className="btn" onClick={() => setFacilityStatus(facility.id, 'repair')}>
                        Tandai perbaikan
                      </button>
                    ) : (
                      facility && (
                        <button className="btn" onClick={() => setFacilityStatus(facility.id, 'avail')}>
                          Kembalikan aktif
                        </button>
                      )
                    )}
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
