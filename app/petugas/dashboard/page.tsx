'use client';

import { useAppData } from '@/context/AppDataContext';

export default function PetugasDashboardPage() {
  const { reservations, reports, facilities } = useAppData();

  const resMenunggu = reservations.filter((r) => r.status === 'menunggu').length;
  const lapBaru = reports.filter((r) => r.status === 'baru').length;
  const perbaikan = facilities.filter((f) => f.status === 'repair').length;
  const disetujui = reservations.filter((r) => r.status === 'disetujui').length;

  return (
    <div>
      <div className="content-head">
        <h2>Dashboard petugas</h2>
        <p>Ringkasan antrian yang masih menunggu diproses.</p>
      </div>

      <div className="summary-row">
        <div className="summary-card"><div className="num">{resMenunggu}</div><div className="lbl">Reservasi menunggu</div></div>
        <div className="summary-card"><div className="num">{lapBaru}</div><div className="lbl">Laporan baru</div></div>
        <div className="summary-card"><div className="num">{perbaikan}</div><div className="lbl">Fasilitas dalam perbaikan</div></div>
        <div className="summary-card"><div className="num">{disetujui}</div><div className="lbl">Reservasi disetujui</div></div>
      </div>

      <div className="alert info">
        Kelola antrian dari menu <b>Antrian Reservasi</b> dan <b>Antrian Laporan</b> di sisi kiri — jangan
        sampai ada permohonan yang terlewat.
      </div>
    </div>
  );
}
