'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FacilityFilterBar from '@/components/FacilityFilterBar';
import CategorySidebar from '@/components/CategorySidebar';
import FacilityCard from '@/components/FacilityCard';
import FacilityDetailModal from '@/components/FacilityDetailModal';
import { useAppData } from '@/context/AppDataContext';
import { DEFAULT_FILTERS, FacilityFilters, filterFacilities } from '@/lib/filter-facilities';
import { FacilityCategory } from '@/models/facilities-data';

const PAGE_SIZE = 6;

function FasilitasContent() {
  const searchParams = useSearchParams();
  const { facilities } = useAppData();

  const [filters, setFilters] = useState<FacilityFilters>({
    category: (searchParams.get('category') as FacilityCategory) || DEFAULT_FILTERS.category,
    lokasi: searchParams.get('lokasi') || DEFAULT_FILTERS.lokasi,
    kapasitas: searchParams.get('kapasitas') || DEFAULT_FILTERS.kapasitas,
    status: searchParams.get('status') || DEFAULT_FILTERS.status,
  });
  const [detailId, setDetailId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const list = filterFacilities(facilities, filters);
  const visibleList = list.slice(0, visibleCount);
  const detailFacility = facilities.find((f) => f.id === detailId) || null;

  // Reset ke halaman pertama setiap kali filter berubah, supaya hasil baru
  // selalu mulai dari atas — penting saat daftar fasilitas sudah banyak.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filters.category, filters.lokasi, filters.kapasitas, filters.status]);

  return (
    <>
      <div style={{ background: 'var(--offwhite)' }}>
        <Navbar />
      </div>

      <section className="pub">
        <div className="wrap">
          <div className="section-head">
            <h2>Fasilitas kampus</h2>
            <p>Cari berdasarkan tipe fasilitas, tipe gedung, kapasitas, dan status ketersediaan. Klik kartu untuk lihat detail dan ajukan reservasi.</p>
          </div>

          <FacilityFilterBar filters={filters} onChange={setFilters} />

          <div className="facility-count">
            Menampilkan {visibleList.length} dari {list.length} fasilitas
            {list.length !== facilities.length && ` (total ${facilities.length} fasilitas)`}
          </div>

          <div className="facility-layout">
            <CategorySidebar
              active={filters.category}
              onSelect={(cat) => setFilters((f) => ({ ...f, category: cat }))}
            />
            <div>
              <div className="grid">
                {visibleList.length === 0 ? (
                  <p style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px 0' }}>
                    Tidak ada fasilitas yang cocok.
                  </p>
                ) : (
                  visibleList.map((f) => <FacilityCard key={f.id} facility={f} onOpenDetail={setDetailId} />)
                )}
              </div>

              {visibleCount < list.length && (
                <div className="load-more-row">
                  <button className="btn" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
                    Muat {Math.min(PAGE_SIZE, list.length - visibleCount)} fasilitas lagi
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {detailFacility && <FacilityDetailModal facility={detailFacility} onClose={() => setDetailId(null)} />}
    </>
  );
}

export default function FasilitasPage() {
  return (
    <Suspense fallback={null}>
      <FasilitasContent />
    </Suspense>
  );
}
