'use client';

import Link from 'next/link';
import { useAppData } from '@/context/AppDataContext';

const ICONS = {
  fasilitas: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="9" width="18" height="11" rx="1" stroke="currentColor" strokeWidth="1.8" /><path d="M7 9V6a2 2 0 012-2h6a2 2 0 012 2v3" stroke="currentColor" strokeWidth="1.8" /></svg>,
  reservasi: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 5h6M4 9h16M6 9v10a2 2 0 002 2h8a2 2 0 002-2V9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>,
  laporan: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3L2 20h20L12 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M12 10v4M12 17h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>,
  akun: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" /><path d="M3 20c.8-3 3-5 6-5s5.2 2 6 5M16 4l1.5 1.5L21 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>,
};

export default function AdminHomePage() {
  const { facilities, reservations, reports, pendingAccounts, currentUser } = useAppData();
  const akunMenunggu = pendingAccounts.filter((a) => a.status === 'menunggu').length;

  return (
    <div>
      <div className="greeting-band">
        <div>
          <h2>Halo, {currentUser?.nama?.split(' (')[0]}</h2>
          <p>Rekap ringkas lintas fasilitas, reservasi, dan laporan.</p>
        </div>
        <span className="role-chip">Akun Admin</span>
      </div>

      <div className="summary-row">
        <div className="summary-card"><div className="summary-card-icon">{ICONS.fasilitas}</div><div><div className="num">{facilities.length}</div><div className="lbl">Total fasilitas</div></div></div>
        <div className="summary-card"><div className="summary-card-icon">{ICONS.reservasi}</div><div><div className="num">{reservations.length}</div><div className="lbl">Total reservasi</div></div></div>
        <div className="summary-card"><div className="summary-card-icon">{ICONS.laporan}</div><div><div className="num">{reports.length}</div><div className="lbl">Total laporan</div></div></div>
        <div className="summary-card"><div className="summary-card-icon">{ICONS.akun}</div><div><div className="num">{akunMenunggu}</div><div className="lbl">Akun menunggu verifikasi</div></div></div>
      </div>

      {akunMenunggu > 0 && (
        <div className="alert info">
          Ada <b>{akunMenunggu} akun</b> hasil registrasi mandiri yang menunggu verifikasi di menu
          Kelola Akun.
        </div>
      )}

      <div className="content-head" style={{ marginTop: 8 }}>
        <h2 style={{ fontSize: 17 }}>Menu cepat</h2>
      </div>
      <div className="menu-card-grid">
        <Link href="/admin/dashboard" className="menu-card">
          <h3>Dashboard</h3>
          <p>Rekap ringkas lintas fasilitas, reservasi, dan laporan.</p>
        </Link>
        <Link href="/admin/fasilitas" className="menu-card">
          <h3>Kelola Fasilitas</h3>
          <p>Tambah, ubah, atau nonaktifkan fasilitas kampus.</p>
        </Link>
        <Link href="/admin/akun" className="menu-card">
          <h3>Kelola Akun</h3>
          <p>Daftarkan akun langsung atau verifikasi registrasi mandiri.</p>
        </Link>
        <Link href="/admin/rekap" className="menu-card">
          <h3>Rekap & Ekspor</h3>
          <p>Ekspor rekap okupansi dan kerusakan (CSV/Excel/PDF).</p>
        </Link>
      </div>
    </div>
  );
}
