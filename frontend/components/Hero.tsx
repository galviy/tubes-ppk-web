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
            Layanan peminjaman ruang kelas, laboratorium, aula, dan perlengkapan kegiatan di
            lingkungan Universitas Diponegoro. Cek ketersediaan jadwal, ajukan permohonan peminjaman,
            dan laporkan kendala sarpras secara mudah.
          </p>

          <div className="ochoco-hero-actions">
            <Link
              href="/fasilitas"
              className="ochoco-hero-primary-btn"
            >
              JELAJAHI FASILITAS
            </Link>
            <Link
              href="/panduan"
              className="ochoco-hero-secondary-btn"
            >
              PANDUAN PEMINJAMAN
            </Link>
          </div>
        </div>

        {/* Right Side: Professional Campus Sarpras Hub Card */}
        <div className="ochoco-hero-hub">
          <div className="ochoco-hub-header">
            <span className="ochoco-hub-tag">SARPRAS • UNIVERSITAS DIPONEGORO</span>
            <h3 className="ochoco-hub-title">Peminjaman &amp; Layanan Kampus</h3>
            <div className="ochoco-hub-status">
              <span className="ochoco-hub-dot" />
              <span>Layanan Aktif • 07.00 - 20.00 WIB</span>
            </div>
          </div>

          <div className="ochoco-hub-divider" />

          <div className="ochoco-hub-list">
            <div className="ochoco-hub-item">
              <span className="ochoco-hub-num">01</span>
              <div className="ochoco-hub-item-body">
                <div className="ochoco-hub-item-head">Ruang Kuliah, Lab &amp; Aula</div>
                <div className="ochoco-hub-item-text">
                  Lihat info ruangan, kapasitas kursi, serta proyektor dan fasilitas pendukung yang tersedia.
                </div>
              </div>
            </div>

            <div className="ochoco-hub-item">
              <span className="ochoco-hub-num">02</span>
              <div className="ochoco-hub-item-body">
                <div className="ochoco-hub-item-head">Jadwal &amp; Ketersediaan Ruang</div>
                <div className="ochoco-hub-item-text">
                  Cek langsung jam kosong hari ini sebelum mengajukan pinjaman agar tidak bentrok dengan kegiatan lain.
                </div>
              </div>
            </div>

            <div className="ochoco-hub-item">
              <span className="ochoco-hub-num">03</span>
              <div className="ochoco-hub-item-body">
                <div className="ochoco-hub-item-head">Lapor Fasilitas Bermasalah</div>
                <div className="ochoco-hub-item-text">
                  Fasilitas rusak atau bermasalah? Laporkan kendala beserta foto agar cepat diperbaiki oleh petugas.
                </div>
              </div>
            </div>
          </div>

          <div className="ochoco-hub-actions">
            <Link href="/jadwal" className="ochoco-hub-btn-primary">
              Cek Jadwal Ruangan
            </Link>
            <Link href="/login" className="ochoco-hub-btn-secondary">
              Masuk ke Akun
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
