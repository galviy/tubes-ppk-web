'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAppData } from '@/context/AppDataContext';
import { ROLE_HOME } from '@/lib/dashboard-nav';

interface NavbarProps {
  variant?: 'default' | 'dashboard';
}

export default function Navbar({ variant = 'default' }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { currentUser, logout } = useAppData();

  const isHome = pathname === '/';
  const topHeaderClass = isHome ? 'transparent-hero' : 'subpage-scenic-bar';

  function handleLogout() {
    logout();
    router.push('/');
  }

  // Undip Mountain / Roof Crest Logo
  const undipLogo = (
    <Link href="/" className="ochoco-brand-logo">
      <svg width="32" height="19" viewBox="0 0 64 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22L24 6L36 22" stroke="#b59876" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M28 22L40 6L52 22" stroke="#b59876" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 28L32 38L44 28" stroke="#b59876" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="ochoco-brand-text">
        <span className="ochoco-brand-top">SIPINJAM</span>
        <span className="ochoco-brand-bot">UNIVERSITAS DIPONEGORO</span>
      </div>
    </Link>
  );

  return (
    <header className={`ochoco-top-header ${topHeaderClass}`}>
      {/* Left: Navigation Links */}
      <nav className="ochoco-header-left">
        <Link href="/" className={`ochoco-nav-link ${pathname === '/' ? 'active' : ''}`}>
          HOME
        </Link>
        <Link href="/fasilitas" className={`ochoco-nav-link ${pathname.startsWith('/fasilitas') ? 'active' : ''}`}>
          FACILITIES
        </Link>
        <Link href="/jadwal" className={`ochoco-nav-link ${pathname.startsWith('/jadwal') ? 'active' : ''}`}>
          SCHEDULE
        </Link>
        <Link href="/panduan" className={`ochoco-nav-link ${pathname.startsWith('/panduan') ? 'active' : ''}`}>
          GUIDE
        </Link>
        {currentUser && (
          <Link
            href={ROLE_HOME[currentUser.role]}
            className={`ochoco-nav-link ${pathname.startsWith('/pengguna') || pathname.startsWith('/petugas') || pathname.startsWith('/admin') ? 'active' : ''}`}
          >
            DASHBOARD
          </Link>
        )}
      </nav>

      {/* Center: Logo */}
      <div className="ochoco-header-center">
        {undipLogo}
      </div>

      {/* Right: Location Pin & Auth */}
      <div className="ochoco-header-right">
        <div className="ochoco-location-tag">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#b59876">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          <span>UNIVERSITAS DIPONEGORO</span>
        </div>

        {currentUser ? (
          <div className="ochoco-user-bar">
            <span className="ochoco-role-chip">{currentUser.role}</span>
            <span className="ochoco-user-name" style={{ color: '#FFFFFF' }}>{currentUser.nama}</span>
            <button
              type="button"
              className="ochoco-btn-logout"
              onClick={handleLogout}
            >
              Keluar
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="ochoco-auth-link"
          >
            LOGIN
          </Link>
        )}

        {/* Mobile menu trigger */}
        <button
          className="ochoco-mobile-toggle"
          aria-label="Toggle menu"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="ochoco-mobile-menu">
          <Link href="/" onClick={() => setMobileOpen(false)}>HOME</Link>
          <Link href="/fasilitas" onClick={() => setMobileOpen(false)}>FACILITIES</Link>
          <Link href="/jadwal" onClick={() => setMobileOpen(false)}>SCHEDULE</Link>
          <Link href="/panduan" onClick={() => setMobileOpen(false)}>GUIDE</Link>
          {currentUser ? (
            <>
              <Link href={ROLE_HOME[currentUser.role]} onClick={() => setMobileOpen(false)}>
                DASHBOARD ({currentUser.role.toUpperCase()})
              </Link>
              <button type="button" onClick={handleLogout} className="ochoco-btn-logout">
                Keluar ({currentUser.nama})
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
            >
              LOGIN
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
