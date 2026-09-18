'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
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
  'Antrian Reservasi': <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>,
  'Antrian Laporan': <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 3L2 20h20L12 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M12 10v4M12 17h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>,
  'Kelola Fasilitas': <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="9" width="18" height="11" rx="1" stroke="currentColor" strokeWidth="1.8" /><path d="M7 9V6a2 2 0 012-2h6a2 2 0 012 2v3" stroke="currentColor" strokeWidth="1.8" /></svg>,
  'Kelola Akun': <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" /><path d="M3 20c.8-3 3-5 6-5s5.2 2 6 5M16 4l1.5 1.5L21 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  'Rekap & Ekspor': <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 3v12m0 0l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>,
};

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentUser } = useAppData();
  const section = sectionFromPath(pathname);

  const allowed = section ? canAccessSection(currentUser?.role, section) : false;

  if (!allowed) {
    return (
      <>
        <Navbar variant="dashboard" />
        <div className="dash-guard">
          <div className="dash-guard-card">
            <h2>{currentUser ? 'Kamu tidak punya akses ke halaman ini' : 'Silakan masuk terlebih dahulu'}</h2>
            <p>
              {currentUser
                ? `Akun ${currentUser.role} tidak memiliki izin untuk membuka bagian ini.`
                : 'Halaman dashboard hanya bisa dibuka setelah login.'}
            </p>
            <Link className="btn primary" href="/login" style={{ display: 'inline-block', marginTop: 16 }}>
              Ke halaman login
            </Link>
          </div>
        </div>
      </>
    );
  }

  const group = NAV_GROUPS.find((g) => g.section === section)!;

  return (
    <>
      <Navbar variant="dashboard" />

      <div className="dash-subnav">
        <div className="wrap dash-subnav-row">
          <span className="dash-role-pill">
            <span className="dash-role-pill-icon">{SECTION_ICONS[group.section]}</span>
            {group.label}
          </span>
          <div className="dash-subnav-links">
            {group.items.map((item) => (
              <Link key={item.href} href={item.href} className={pathname === item.href ? 'active' : ''}>
                {ITEM_ICONS[item.label]}
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="dash-page">
        <div className="wrap">{children}</div>
      </div>
    </>
  );
}
