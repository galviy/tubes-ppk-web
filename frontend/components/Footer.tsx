'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="ochoco-footer" id="contact">
      <div className="ochoco-footer-container">
        {/* Centered Top Logo (Exact Replica of Image 4) */}
        <div className="ochoco-footer-logo-wrap">
          <Link href="/" className="ochoco-footer-brand">
            <svg width="48" height="30" viewBox="0 0 64 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22L24 6L36 22" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M28 22L40 6L52 22" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M20 28L32 38L44 28" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="ochoco-footer-brand-title">
              <span className="ochoco-footer-t1">SIPINJAM</span>
              <span className="ochoco-footer-t2">RESERVASI & PELAPORAN FASILITAS KAMPUS</span>
            </div>
          </Link>
        </div>

        {/* Bottom Row: Copyright left, Links center, Accessibility icons right */}
        <div className="ochoco-footer-bottom-row">
          {/* Left: Copyright */}
          <div className="ochoco-footer-copy">
            © 2026 SiPinjam — Sistem Reservasi & Pelaporan Fasilitas Kampus.
          </div>

          {/* Center: Navigation Links */}
          <nav className="ochoco-footer-nav">
            <Link href="/">HOME</Link>
            <Link href="/fasilitas">FACILITIES</Link>
            <Link href="/jadwal">SCHEDULE</Link>
            <Link href="/panduan">GUIDE</Link>
            <Link href="/login">LOGIN</Link>
          </nav>

          {/* Right: Accessibility & Campus Badges */}
          <div className="ochoco-footer-badges">
            {/* Wheelchair Accessibility Icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#FFFFFF" aria-label="Ramah Disabilitas">
              <circle cx="12" cy="4" r="2" />
              <path d="M19 13v-2c-1.54.02-3.09-.75-4.07-1.83l-1.29-1.43c-.17-.19-.38-.34-.61-.45-.01 0-.01-.01-.02-.01H13c-.35-.2-.75-.3-1.19-.26-.6.06-1.13.4-1.45.89L8.22 11.2c-.39.6-.33 1.38.16 1.91.49.53 1.28.66 1.92.32l1.7-.91v3.48l-2.73 3.64c-.39.52-.36 1.25.07 1.73.44.49 1.18.59 1.73.23l3.82-2.55c.38-.25.61-.69.61-1.15V13h3.5zM7.5 14c0 2.48 2.02 4.5 4.5 4.5.39 0 .76-.06 1.12-.16l.8 1.07c-.6.38-1.29.59-2.02.59-2.21 0-4-1.79-4-4 0-1.07.43-2.05 1.13-2.77l1.08 1.08c-.4.43-.63.99-.63 1.69z" />
            </svg>

            {/* University / Academic Crest Icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#FFFFFF" aria-label="Fasilitas Kampus">
              <path d="M12 3L2 8l10 5 10-5-10-5zm0 8.7L5.5 8.5 12 5.3l6.5 3.2L12 11.7zM4 11v6l8 4 8-4v-6l-8 4-8-4z" />
            </svg>
          </div>
        </div>
      </div>
    </footer>
  );
}
