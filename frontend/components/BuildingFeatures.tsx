'use client';

import { useState } from 'react';

interface FeatureSlide {
  title: string;
  subtitle: string;
  description: string;
  image: string;
}

const SLIDES: FeatureSlide[] = [
  {
    title: 'BUILDING FEATURES',
    subtitle: 'SLOT WAKTU 30 MENIT (07.00 - 20.00)',
    description:
      'Peminjaman fasilitas menggunakan 26 slot waktu tetap berdurasi 30 menit yang dimulai dari pukul 07.00 hingga 20.00 WIB. Sistem memvalidasi rentang waktu secara ketat di sisi server dan client untuk mencegah bentrok jadwal pada fasilitas yang sama.',
    image: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1600&q=85',
  },
  {
    title: 'BUILDING FEATURES',
    subtitle: 'PELAPORAN KERUSAKAN DENGAN FOTO BUKTI',
    description:
      'Mahasiswa dan dosen dapat melaporkan kendala pada fasilitas kampus dengan memilih kategori kerusakan, menuliskan deskripsi masalah, serta mengunggah foto bukti. Setiap laporan terpantau statusnya mulai dari baru, diproses, hingga selesai.',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=85',
  },
  {
    title: 'BUILDING FEATURES',
    subtitle: 'ANTREAN PETUGAS & STATUS PERBAIKAN',
    description:
      'Petugas memproses antrean reservasi dan laporan kerusakan secara terpusat dalam satu alur kerja. Petugas dapat menyetujui, menolak, membatalkan reservasi darurat dengan alasan resmi, serta menandai fasilitas berstatus "Dalam Perbaikan".',
    image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1600&q=85',
  },
  {
    title: 'BUILDING FEATURES',
    subtitle: 'DATA MASTER & EKSPOR REKAPITULASI ADMIN',
    description:
      'Administrator mengelola data master seluruh tipe fasilitas kampus, memverifikasi akun civitas akademika, serta mengekspor rekapitulasi okupansi dan frekuensi kerusakan ke CSV/Excel/PDF.',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1600&q=85',
  },
];

export default function BuildingFeatures() {
  const [current, setCurrent] = useState(0);

  function prevSlide() {
    setCurrent((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  }

  function nextSlide() {
    setCurrent((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
  }

  const slide = SLIDES[current];

  return (
    <section className="ochoco-features" id="features">
      <div className="ochoco-feat-split">
        {/* Left Side: High Quality Relevant Photo */}
        <div className="ochoco-feat-media">
          <img
            key={slide.image}
            src={slide.image}
            alt={slide.subtitle}
            className="ochoco-feat-img"
          />
        </div>

        {/* Right Side: Warm Tan Container */}
        <div className="ochoco-feat-content">
          <h2 className="ochoco-feat-title">
            BUILDING
            <br />
            FEATURES
          </h2>

          <div className="ochoco-feat-sub">{slide.subtitle}</div>

          <p className="ochoco-feat-desc">{slide.description}</p>

          {/* Carousel Arrows */}
          <div className="ochoco-feat-nav">
            <button
              type="button"
              className="ochoco-feat-btn"
              onClick={prevSlide}
              aria-label="Previous Feature"
            >
              ←
            </button>
            <button
              type="button"
              className="ochoco-feat-btn"
              onClick={nextSlide}
              aria-label="Next Feature"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
