'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAppData } from '@/context/AppDataContext';
import { ROLE_HOME } from '@/lib/dashboard-nav';

const BASE_LINKS = [
  { href: '/', label: 'Beranda' },
  { href: '/fasilitas', label: 'Fasilitas' },
  { href: '/jadwal', label: 'Jadwal' },
  { href: '/panduan', label: 'Panduan' },
];

interface NavbarProps {
  variant?: 'default' | 'dashboard';
}

export default function Navbar({ variant = 'default' }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { currentUser, logout } = useAppData();

  const links = currentUser
    ? [...BASE_LINKS, { href: ROLE_HOME[currentUser.role], label: 'Dashboard' }]
    : BASE_LINKS;

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  function handleLogout() {
    logout();
    router.push('/');
  }

  const brand = (
    <Link href="/" className="brand">
      <svg width="28" height="28" viewBox="0 0 30 30" fill="none">
        <rect width="30" height="30" rx="9" fill="#0F172A" />
        <path d="M8 20L15 9L22 20" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11 20L15 13L19 20" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      SiPinjam
    </Link>
  );

  const authArea = currentUser ? (
    <>
      <span className="nav-user-name">{currentUser.nama}</span>
      <button className="nav-cta" onClick={handleLogout} style={{ border: 'none', cursor: 'pointer' }}>
        Keluar
      </button>
    </>
  ) : (
    <>
      <Link className="btn-outline" href="/login">Masuk</Link>
      <Link className="nav-cta" href="/register">Daftar Akun</Link>
    </>
  );

  const linkList = links.map((l) => (
    <li key={l.href}>
      <Link href={l.href} className={isActive(l.href) ? 'active' : ''}>
        {l.label}
      </Link>
    </li>
  ));

  const toggle = (
    <button className="nav-toggle" aria-label="menu" onClick={() => setMobileOpen((v) => !v)}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M4 7H20M4 12H20M4 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </button>
  );

  if (variant === 'dashboard') {
    return (
      <nav className="dashnav">
        {brand}
        <ul
          className="nav-links"
          style={
            mobileOpen
              ? { display: 'flex', position: 'absolute', top: 60, left: 0, right: 0, flexDirection: 'column', background: '#fff', padding: 14, borderBottom: '1px solid var(--line)' }
              : undefined
          }
        >
          {linkList}
        </ul>
        <div
          className="nav-auth"
          style={mobileOpen ? { display: 'flex', position: 'absolute', top: 200, left: 14, right: 14, flexDirection: 'column' } : undefined}
        >
          {authArea}
        </div>
        {toggle}
      </nav>
    );
  }

  return (
    <div className="nav-row">
      <nav className="pill-nav">
        {brand}
        <ul
          className="nav-links"
          style={
            mobileOpen
              ? { display: 'flex', position: 'absolute', top: 70, left: 28, right: 28, flexDirection: 'column', background: 'var(--glass)', borderRadius: 18, padding: 10, border: '1px solid var(--glass-border)' }
              : undefined
          }
        >
          {linkList}
        </ul>
        <div
          className="nav-auth"
          style={mobileOpen ? { display: 'flex', position: 'absolute', top: 210, left: 28, right: 28, flexDirection: 'column' } : undefined}
        >
          {authArea}
        </div>
        {toggle}
      </nav>
    </div>
  );
}
