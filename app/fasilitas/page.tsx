'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
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

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filters.category, filters.lokasi, filters.kapasitas, filters.status]);

  return (
    <div className="ochoco-page-wrapper">
      <Navbar variant="dashboard" />

      {/* Top Breadcrumb & Back Navigation Bar */}
      <div className="ochoco-sub-header-bar">
        <div className="wrap ochoco-sub-header-row">
          <Link href="/" className="ochoco-back-button">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>KEMBALI KE HOME</span>
          </Link>

          <div className="ochoco-breadcrumb">
            <span>Home</span>
            <span>/</span>
            <span style={{ color: '#b59876' }}>Facilities</span>
            <span>/</span>
            <span>Universitas Diponegoro</span>
          </div>
        </div>
      </div>

      <main className="ochoco-main-content">
        <div className="wrap">
          <div className="ochoco-page-head">
            <div className="ochoco-page-eyebrow">FACILITIES • UNIVERSITAS DIPONEGORO</div>
            <h1 className="ochoco-page-title">
              CAMPUS <span style={{ color: '#b59876' }}>FACILITIES</span>
            </h1>
            <p className="ochoco-page-subtitle">
              Daftar ruang perkuliahan, aula serbaguna, laboratorium komputer, gelanggang olahraga, dan peralatan
              akademik Universitas Diponegoro.
            </p>
          </div>

          <FacilityFilterBar filters={filters} onChange={setFilters} />

          <div className="facility-count">
            Menampilkan {visibleList.length} dari {list.length} fasilitas
            {list.length !== facilities.length && ` (total ${facilities.length} fasilitas Universitas Diponegoro)`}
          </div>

          <div className="facility-layout">
            <CategorySidebar
              selected={filters.category}
              onSelect={(category) => setFilters((prev) => ({ ...prev, category }))}
            />

            <div>
              <div className="grid">
                {visibleList.map((f) => (
                  <FacilityCard key={f.id} facility={f} onOpenDetail={setDetailId} />
                ))}
              </div>

              {visibleCount < list.length && (
                <div className="load-more-row">
                  <button className="btn primary" onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}>
                    Muat lebih banyak ({list.length - visibleCount} tersisa)
                  </button>
                </div>
              )}
            </div>
          </div>

          {detailFacility && (
            <FacilityDetailModal facility={detailFacility} onClose={() => setDetailId(null)} />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function FasilitasPage() {
  return (
    <Suspense fallback={null}>
      <FasilitasContent />
    </Suspense>
  );
}
