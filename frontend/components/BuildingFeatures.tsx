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
    image: '/features/slot-waktu-30-menit.png',
  },
  {
    title: 'BUILDING FEATURES',
    subtitle: 'PELAPORAN KERUSAKAN DENGAN FOTO BUKTI',
    description:
      'Mahasiswa dan dosen dapat melaporkan kendala pada fasilitas kampus dengan memilih kategori kerusakan, menuliskan deskripsi masalah, serta mengunggah foto bukti. Setiap laporan terpantau statusnya mulai dari baru, diproses, hingga selesai.',
    image: '/features/pelaporan-kerusakan.png',
  },
  {
    title: 'BUILDING FEATURES',
    subtitle: 'KATALOG FASILITAS & FILTER KATEGORI',
    description:
      'Telusuri katalog lengkap seluruh fasilitas kampus dengan filter kategori yang praktis. Dilengkapi informasi kapasitas ruangan, sarana pendukung (AC, proyektor, papan tulis), serta pilihan tata letak grid untuk mempermudah pencarian ruang yang dibutuhkan.',
    image: '/features/katalog-fasilitas.png',
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
