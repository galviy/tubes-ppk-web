'use client';

import Link from 'next/link';
import { useAppData } from '@/context/AppDataContext';

const ICONS = {
  menunggu: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" /><path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>,
  laporan: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3L2 20h20L12 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M12 10v4M12 17h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>,
  perbaikan: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M14.7 6.3a4 4 0 00-5.4 5.4L4 17v3h3l5.3-5.3a4 4 0 005.4-5.4l-2.5 2.5-2-2 2.5-2.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>,
  fasilitas: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="9" width="18" height="11" rx="1" stroke="currentColor" strokeWidth="1.8" /><path d="M7 9V6a2 2 0 012-2h6a2 2 0 012 2v3" stroke="currentColor" strokeWidth="1.8" /></svg>,
};

export default function PetugasHomePage() {
  const { reservations, reports, facilities, currentUser } = useAppData();

  const resMenunggu = reservations.filter((r) => r.status === 'menunggu').length;
  const lapAktif = reports.filter((r) => r.status === 'baru' || r.status === 'diproses').length;
  const perbaikan = facilities.filter((f) => f.status === 'repair').length;

  return (
    <div>
      <div className="greeting-band">
        <div>
          <h2>Halo, {currentUser?.nama?.split(' (')[0]}</h2>
          <p>Ringkasan antrian yang perlu kamu tindak lanjuti hari ini.</p>
        </div>
        <span className="role-chip">Akun Petugas</span>
      </div>

      <div className="summary-row">
        <div className="summary-card"><div className="summary-card-icon">{ICONS.menunggu}</div><div><div className="num">{resMenunggu}</div><div className="lbl">Reservasi menunggu</div></div></div>
        <div className="summary-card"><div className="summary-card-icon">{ICONS.laporan}</div><div><div className="num">{lapAktif}</div><div className="lbl">Laporan aktif</div></div></div>
        <div className="summary-card"><div className="summary-card-icon">{ICONS.perbaikan}</div><div><div className="num">{perbaikan}</div><div className="lbl">Fasilitas dalam perbaikan</div></div></div>
        <div className="summary-card"><div className="summary-card-icon">{ICONS.fasilitas}</div><div><div className="num">{facilities.length}</div><div className="lbl">Total fasilitas dikelola</div></div></div>
      </div>

      {(resMenunggu > 0 || lapAktif > 0) && (
        <div className="alert info">
          Ada <b>{resMenunggu} reservasi</b> dan <b>{lapAktif} laporan</b> yang masih menunggu diproses —
          cek Antrian Reservasi dan Antrian Laporan supaya tidak ada yang terlewat.
        </div>
      )}

      <div className="content-head" style={{ marginTop: 8 }}>
        <h2 style={{ fontSize: 17 }}>Menu cepat</h2>
      </div>
      <div className="menu-card-grid">
        <Link href="/petugas/dashboard" className="menu-card">
          <h3>Dashboard</h3>
          <p>Ringkasan antrian reservasi dan laporan yang menunggu.</p>
        </Link>
        <Link href="/petugas/reservasi" className="menu-card">
          <h3>Antrian Reservasi</h3>
          <p>Setujui, tolak, atau batalkan reservasi.</p>
        </Link>
        <Link href="/petugas/laporan" className="menu-card">
          <h3>Antrian Laporan</h3>
          <p>Proses laporan kerusakan dan tandai fasilitas dalam perbaikan.</p>
        </Link>
      </div>
    </div>
  );
}
