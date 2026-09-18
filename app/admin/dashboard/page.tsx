'use client';

import { useAppData } from '@/context/AppDataContext';

export default function AdminDashboardPage() {
  const { facilities, reservations, reports, pendingAccounts } = useAppData();
  const akunMenunggu = pendingAccounts.filter((a) => a.status === 'menunggu').length;

  return (
    <div>
      <div className="content-head">
        <h2>Dashboard admin</h2>
        <p>Rekap lintas fasilitas secara ringkas.</p>
      </div>

      <div className="summary-row">
        <div className="summary-card"><div className="num">{facilities.length}</div><div className="lbl">Total fasilitas</div></div>
        <div className="summary-card"><div className="num">{reservations.length}</div><div className="lbl">Total reservasi</div></div>
        <div className="summary-card"><div className="num">{reports.length}</div><div className="lbl">Total laporan</div></div>
        <div className="summary-card"><div className="num">{akunMenunggu}</div><div className="lbl">Akun menunggu verifikasi</div></div>
      </div>
    </div>
  );
}
