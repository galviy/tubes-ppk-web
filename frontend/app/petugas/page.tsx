'use client';

import Link from 'next/link';
import { useAppData } from '@/context/AppDataContext';

const ICONS = {
  reservasi: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  ),
  laporan: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3L2 20h20L12 3z" />
      <path d="M12 10v4M12 17h.01" />
    </svg>
  ),
  perbaikan: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  fasilitas: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
};

export default function PetugasRingkasanPage() {
  const { reservations, reports, facilities, currentUser } = useAppData();

  const resMenunggu = reservations.filter((r) => r.status === 'menunggu').length;
  const lapAktif = reports.filter((r) => r.status === 'baru' || r.status === 'diproses').length;
  const perbaikan = facilities.filter((f) => f.status === 'repair').length;
  const totalFasilitas = facilities.length;

  const displayName = currentUser?.nama?.split(' ')[0] || 'Budi';

  return (
    <div>
      {/* Top Greeting Banner */}
      <div className="greeting-band">
        <div>
          <div className="greeting-eyebrow">
            PORTAL PETUGAS OPERASIONAL • UNIVERSITAS DIPONEGORO
          </div>
          <h2>Halo, {displayName}</h2>
          <p>Ringkasan antrian yang perlu kamu tindak lanjuti hari ini.</p>
        </div>
        <span className="role-chip">Akun Petugas</span>
      </div>

      {/* 4 Stat Cards */}
      <div className="summary-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="summary-card">
          <div className="summary-card-icon">{ICONS.reservasi}</div>
          <div>
            <div className="num">{resMenunggu}</div>
            <div className="lbl">Reservasi menunggu</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-card-icon">{ICONS.laporan}</div>
          <div>
            <div className="num">{lapAktif}</div>
            <div className="lbl">Laporan aktif</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-card-icon">{ICONS.perbaikan}</div>
          <div>
            <div className="num">{perbaikan}</div>
            <div className="lbl">Fasilitas dalam perbaikan</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-card-icon">{ICONS.fasilitas}</div>
          <div>
            <div className="num">{totalFasilitas}</div>
            <div className="lbl">Total fasilitas dikelola</div>
          </div>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="dash-notice-banner">
        <span>
          Ada <strong>{resMenunggu} reservasi</strong> dan <strong>{lapAktif} laporan</strong> yang masih menunggu diproses — cek{' '}
          <Link href="/petugas/reservasi" style={{ color: '#b59876', fontWeight: 600, textDecoration: 'underline' }}>
            Antrian Reservasi
          </Link>{' '}
          dan{' '}
          <Link href="/petugas/laporan" style={{ color: '#b59876', fontWeight: 600, textDecoration: 'underline' }}>
            Antrian Laporan
          </Link>{' '}
          supaya tidak ada yang terlewat.
        </span>
      </div>

      {/* Quick Menu Section */}
      <div style={{ marginTop: 12, marginBottom: 18 }}>
        <h3 style={{ fontSize: 20, fontWeight: 600, color: '#181D24', margin: '0 0 16px 0' }}>Menu cepat</h3>
      </div>

      <div className="menu-card-grid">
        <Link href="/petugas/reservasi" className="menu-card">
          <h3>Antrian Reservasi</h3>
          <p>Setujui, tolak, atau batalkan reservasi.</p>
        </Link>
        <Link href="/petugas/laporan" className="menu-card">
          <h3>Antrian Laporan</h3>
          <p>Proses dan tindak lanjuti laporan kendala sarpras.</p>
        </Link>
        <Link href="/petugas/fasilitas" className="menu-card">
          <h3>Status Fasilitas</h3>
          <p>Atur status operasional fasilitas: Tersedia, Digunakan, atau Dalam Perbaikan.</p>
        </Link>
      </div>
    </div>
  );
}
