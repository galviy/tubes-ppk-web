'use client';

import Link from 'next/link';
import { useAppData } from '@/context/AppDataContext';

const ICONS = {
  fasilitas: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="9" width="18" height="11" rx="1" stroke="currentColor" strokeWidth="1.8" />
      <path d="M7 9V6a2 2 0 012-2h6a2 2 0 012 2v3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ),
  reservasi: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M9 5h6M4 9h16M6 9v10a2 2 0 002 2h8a2 2 0 002-2V9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  laporan: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 3L2 20h20L12 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 10v4M12 17h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  pengguna: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 20c.8-3 3-5 6-5s5.2 2 6 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  petugas: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  verif: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
      <polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
};

export default function AdminHomePage() {
  const { facilities, reservations, reports, pendingAccounts, registeredAccounts, currentUser } = useAppData();

  const akunMenunggu = pendingAccounts.filter((a) => a.status === 'menunggu').length;
  const totalPengguna = registeredAccounts.filter((a) => a.role === 'pengguna').length;
  const petugasAktif = registeredAccounts.filter((a) => a.role === 'petugas').length;

  return (
    <div>
      <div className="greeting-band">
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: '#b59876', textTransform: 'uppercase', marginBottom: 4 }}>
            PORTAL ADMINISTRATOR SARPRAS • UNIVERSITAS DIPONEGORO
          </div>
          <h2>SELAMAT DATANG, {currentUser?.nama?.split(' (')[0].toUpperCase() || 'ADMINISTRATOR'}</h2>
          <p>Rekap ringkas tata kelola fasilitas, antrean reservasi, dan pelaporan Universitas Diponegoro.</p>
        </div>
        <span className="role-chip">AKUN ADMIN</span>
      </div>

      {/* 6 Metric Summary Cards matching Reference Image 1 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 12,
          marginBottom: 20,
        }}
      >
        {/* Total Pengguna */}
        <div className="summary-card">
          <div className="summary-card-icon">{ICONS.pengguna}</div>
          <div>
            <div className="num">{totalPengguna}</div>
            <div className="lbl">Total Pengguna</div>
          </div>
        </div>

        {/* Menunggu Verifikasi */}
        <div className="summary-card">
          <div className="summary-card-icon">{ICONS.verif}</div>
          <div>
            <div className="num">{akunMenunggu}</div>
            <div className="lbl">Menunggu Verifikasi</div>
          </div>
        </div>

        {/* Total Fasilitas */}
        <div className="summary-card">
          <div className="summary-card-icon">{ICONS.fasilitas}</div>
          <div>
            <div className="num">{facilities.length}</div>
            <div className="lbl">Total Fasilitas</div>
          </div>
        </div>

        {/* Petugas Aktif */}
        <div className="summary-card">
          <div className="summary-card-icon">{ICONS.petugas}</div>
          <div>
            <div className="num">{petugasAktif}</div>
            <div className="lbl">Petugas Aktif</div>
          </div>
        </div>

        {/* Total Reservasi */}
        <div className="summary-card">
          <div className="summary-card-icon">{ICONS.reservasi}</div>
          <div>
            <div className="num">{reservations.length}</div>
            <div className="lbl">Total Reservasi</div>
          </div>
        </div>

        {/* Total Laporan */}
        <div className="summary-card">
          <div className="summary-card-icon">{ICONS.laporan}</div>
          <div>
            <div className="num">{reports.length}</div>
            <div className="lbl">Total Laporan</div>
          </div>
        </div>
      </div>

      {akunMenunggu > 0 && (
        <div className="alert info">
          Ada <b>{akunMenunggu} akun</b> hasil registrasi mandiri yang menunggu verifikasi di menu{' '}
          <Link href="/admin/akun" style={{ color: '#b59876', fontWeight: 700, textDecoration: 'underline' }}>
            Kelola Akun
          </Link>.
        </div>
      )}

      {/* Menu Cepat Section */}
      <div className="content-head" style={{ marginTop: 8 }}>
        <h2 style={{ fontSize: 17 }}>Menu cepat</h2>
      </div>

      <div className="menu-card-grid">
        <Link href="/admin/fasilitas" className="menu-card">
          <h3>Kelola Fasilitas</h3>
          <p>Tambah, ubah, atau nonaktifkan fasilitas kampus.</p>
        </Link>
        <Link href="/admin/akun" className="menu-card">
          <h3>Kelola Akun</h3>
          <p>Daftarkan akun staf langsung atau verifikasi registrasi mandiri.</p>
        </Link>
        <Link href="/admin/laporan" className="menu-card">
          <h3>Semua Laporan</h3>
          <p>Log audit seluruh laporan kerusakan dan progres penanganan sarpras.</p>
        </Link>
        <Link href="/admin/rekap" className="menu-card">
          <h3>Rekap &amp; Ekspor</h3>
          <p>Ekspor rekap okupansi dan kerusakan (CSV/Excel/PDF).</p>
        </Link>
      </div>
    </div>
  );
}
