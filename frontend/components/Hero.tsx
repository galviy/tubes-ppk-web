'use client';

import Link from 'next/link';

export default function Hero() {
  return (
    <section className="ochoco-hero-wrap" id="home">
      {/* Panoramic Scenic Undip Background */}
      <div className="ochoco-hero-bg">
        <div className="ochoco-hero-overlay" />
      </div>

      <div className="ochoco-hero-container">
        {/* Left Side: Bold Big Typography & Action Buttons */}
        <div className="ochoco-hero-left">
          <div className="ochoco-hero-badge">UNIVERSITAS DIPONEGORO</div>
          <h1 className="ochoco-hero-title">
            SISTEM RESERVASI
            <br />
            & PELAPORAN FASILITAS
          </h1>
          <p className="ochoco-hero-desc">
            Portal resmi peminjaman fasilitas akademik Universitas Diponegoro (ruang kelas, aula,
            laboratorium, sarana olahraga, dan alat). Cek ketersediaan jadwal, ajukan permohonan
            izin peminjaman, serta laporkan kendala fasilitas sarana dan prasarana.
          </p>

          <div className="ochoco-hero-actions">
            <Link
              href="/login"
              className="ochoco-hero-primary-btn"
            >
              MASUK
            </Link>
            <Link
              href="/register"
              className="ochoco-hero-secondary-btn"
            >
              DAFTAR AKUN
            </Link>
            <Link href="/fasilitas" className="ochoco-hero-ghost-btn">
              FASILITAS KAMPUS
            </Link>
          </div>
        </div>

        {/* Right Side: Campus Highlights Showcase Panel with Professional SVG Icons */}
        <div className="ochoco-hero-showcase">
          <div className="ochoco-showcase-card">
            <div className="ochoco-showcase-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b59876" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18M5 21V7l7-4 7 4v14M9 10v4M15 10v4M9 18h6" />
              </svg>
            </div>
            <div>
              <div className="ochoco-showcase-title">Fasilitas Kampus</div>
              <div className="ochoco-showcase-desc">
                Ruang perkuliahan, aula pertemuan, laboratorium, sarana olahraga, dan peralatan pendukung kegiatan akademik.
              </div>
            </div>
          </div>

          <div className="ochoco-showcase-card">
            <div className="ochoco-showcase-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b59876" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <div className="ochoco-showcase-title">Waktu Operasional</div>
              <div className="ochoco-showcase-desc">
                Peminjaman fasilitas dilayani setiap hari pada pukul 07.00 – 20.00 WIB sesuai jadwal yang tersedia.
              </div>
            </div>
          </div>

          <div className="ochoco-showcase-card">
            <div className="ochoco-showcase-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b59876" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                <path d="M9 14l2 2 4-4" />
              </svg>
            </div>
            <div>
              <div className="ochoco-showcase-title">Peminjaman &amp; Pelaporan</div>
              <div className="ochoco-showcase-desc">
                Pengajuan izin penggunaan fasilitas akademik serta penyampaian laporan kendala sarana prasarana kampus.
              </div>
            </div>
          </div>

          <Link
            href="/login"
            className="ochoco-showcase-cta"
          >
            <span>Masuk ke Sistem SiPinjam</span>
            <span style={{ fontSize: 18 }}>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
