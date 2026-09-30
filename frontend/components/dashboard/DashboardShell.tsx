'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { JSX } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAppData } from '@/context/AppDataContext';
import { NAV_GROUPS, sectionFromPath, canAccessSection } from '@/lib/dashboard-nav';

const SECTION_ICONS: Record<string, JSX.Element> = {
  pengguna: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" /><path d="M5 20c1.2-3.6 4-5.5 7-5.5s5.8 1.9 7 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
  ),
  petugas: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" /><path d="M8 3v4M16 3v4M4 10h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
  ),
  admin: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 3l7 3v5c0 4.8-3 8.3-7 10-4-1.7-7-5.2-7-10V6l7-3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
  ),
};

const ITEM_ICONS: Record<string, JSX.Element> = {
  Ringkasan: <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" /><rect x="13" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" /><rect x="4" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" /><rect x="13" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" /></svg>,
  'Ajukan Reservasi': <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>,
  'Riwayat Reservasi': <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" /><path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>,
  'Lapor Kerusakan': <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 3L2 20h20L12 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M12 10v4M12 17h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>,
  'Status Laporan Saya': <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 5h6M4 9h16M6 9v10a2 2 0 002 2h8a2 2 0 002-2V9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>,
  Dashboard: <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 12l2-2 4 4 8-8 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  Reservasi: <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>,
  'Antrian Reservasi': <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>,
  'Semua Reservasi': <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>,
  Laporan: <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 3L2 20h20L12 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M12 10v4M12 17h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>,
  'Antrian Laporan': <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 3L2 20h20L12 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M12 10v4M12 17h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>,
  'Semua Laporan': <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 3L2 20h20L12 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M12 10v4M12 17h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>,
  'Status Fasilitas': <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="9" width="18" height="11" rx="1" stroke="currentColor" strokeWidth="1.8" /><path d="M7 9V6a2 2 0 012-2h6a2 2 0 012 2v3" stroke="currentColor" strokeWidth="1.8" /></svg>,
  'Kelola Fasilitas': <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="9" width="18" height="11" rx="1" stroke="currentColor" strokeWidth="1.8" /><path d="M7 9V6a2 2 0 012-2h6a2 2 0 012 2v3" stroke="currentColor" strokeWidth="1.8" /></svg>,
  'Kelola Akun': <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" /><path d="M3 20c.8-3 3-5 6-5s5.2 2 6 5M16 4l1.5 1.5L21 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  'Rekap & Ekspor': <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 3v12m0 0l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>,
};

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentUser, reservations, reports, syncStatus } = useAppData();
  const section = sectionFromPath(pathname);

  const allowed = section ? canAccessSection(currentUser?.role, section) : false;

  if (!allowed) {
    return (
      <div className="ochoco-page-wrapper">
        <Navbar variant="dashboard" />
        <div className="dash-guard">
          <div className="dash-guard-card">
            <h2>{currentUser ? 'Akses Ditolak' : 'Silakan Masuk Terlebih Dahulu'}</h2>
            <p>
              {currentUser
                ? `Akun ${currentUser.role} tidak memiliki izin untuk membuka bagian ini.`
                : 'Halaman portal dashboard hanya bisa dibuka setelah masuk ke akun.'}
            </p>
            <Link className="btn primary" href="/login" style={{ display: 'inline-block', marginTop: 16 }}>
              Menuju Halaman Login
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const group = NAV_GROUPS.find((g) => g.section === section)!;

  return (
    <div className="ochoco-page-wrapper">
      <Navbar variant="dashboard" />

      {/* Ochoco Subheader Bar with Breadcrumb & Back Link */}
      <div className="ochoco-sub-header-bar">
        <div className="wrap ochoco-catalog-wrap ochoco-sub-header-row">
          <Link href="/" className="ochoco-back-button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>KEMBALI KE HOME</span>
          </Link>

          <div className="ochoco-breadcrumb">
            <span>Home</span>
            <span>/</span>
            <span>Portal {group.label}</span>
            <span>/</span>
            <span style={{ color: '#b59876' }}>Universitas Diponegoro</span>
          </div>
        </div>
      </div>

      {/* Ochoco Dashboard Underline Subnav */}
      <div className="ochoco-dash-subnav">
        <div className="wrap ochoco-catalog-wrap ochoco-dash-subnav-row">
          <span className="ochoco-dash-role-chip">
            <span className="ochoco-dash-role-icon">{SECTION_ICONS[group.section]}</span>
            {group.label}
          </span>

          <div className="ochoco-dash-tabs">
            {group.items.map((item) => {
              let badge = '';
              if (group.section === 'petugas') {
                if (item.label === 'Antrian Reservasi' || item.label === 'Reservasi') {
                  const c = reservations.filter((r) => r.status === 'menunggu').length;
                  if (c > 0) badge = ` (${c})`;
                } else if (item.label === 'Antrian Laporan' || item.label === 'Laporan') {
                  const c = reports.filter((r) => r.status === 'baru' || r.status === 'diproses').length;
                  if (c > 0) badge = ` (${c})`;
                }
              }
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`ochoco-dash-tab-link ${isActive ? 'active' : ''}`}
                >
                  {ITEM_ICONS[item.label]}
                  <span>{item.label}</span>
                  {badge && <span className="ochoco-tab-badge">{badge}</span>}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="dash-page">
        <div className="wrap ochoco-catalog-wrap">
          {syncStatus === 'loading' && (
            <div className="alert info" style={{ marginBottom: 16 }}>
              Memuat data terbaru dari server…
            </div>
          )}
          {syncStatus === 'partial' && (
            <div className="alert info" style={{ marginBottom: 16 }} role="status">
              Sebagian data berhasil dimuat, tetapi reservasi atau laporan belum tersinkron. Jika salah satu daftar kosong, muat ulang halaman.
            </div>
          )}
          {syncStatus === 'error' && (
            <div className="alert danger" style={{ marginBottom: 16 }}>
              Gagal memuat data reservasi maupun laporan dari server. Daftar kosong di bawah ini berarti
              <b> belum termuat, bukan tidak ada data</b>. Periksa koneksi backend lalu muat ulang halaman.
            </div>
          )}
          {children}
        </div>
      </div>

      <Footer />
    </div>
  );
}
