'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CampusMapArt from './CampusMapArt';
import SearchWidget from './SearchWidget';
import { DEFAULT_FILTERS } from '@/lib/filter-facilities';

export default function Hero() {
  const router = useRouter();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  function handleSearch() {
    const params = new URLSearchParams({
      category: filters.category,
      lokasi: filters.lokasi,
      kapasitas: filters.kapasitas,
      status: filters.status,
    });
    router.push(`/fasilitas?${params.toString()}`);
  }

  return (
    <div className="hero" id="top">
      <div className="hero-copy">
        <h1>Pinjam ruang kampus tanpa antre, tanpa bentrok jadwal</h1>
        <p className="lede">
          Cari ruang sidang, lab komputer, aula, atau lapangan yang kosong, lengkapi surat izin
          kegiatan, dan terima digital pass QR — semuanya dalam tiga klik.
        </p>
        <div className="hero-actions">
          <Link className="btn-primary" href="/login">Masuk untuk reservasi</Link>
          <Link className="btn-ghost" href="/jadwal">Cek ketersediaan hari ini →</Link>
        </div>
      </div>

      <div className="hero-visual">
        <div className="map-card">
          <CampusMapArt />
        </div>

        <div className="stat-float">
          <div className="num">Kunci 10 menit</div>
          <div className="lbl">Slot otomatis terkunci saat checkout untuk mencegah bentrok peminjaman ganda.</div>
        </div>

        <SearchWidget filters={filters} onChange={setFilters} onSearch={handleSearch} />
      </div>
    </div>
  );
}
