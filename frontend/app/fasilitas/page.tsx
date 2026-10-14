'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
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
import { FacilityCategory, isAlatFacility, isRuanganFacility } from '@/models/facilities-data';

const PAGE_SIZE = 9;

function FasilitasContent() {
  const searchParams = useSearchParams();
  const tipeParam = searchParams.get('tipe');
  const { facilities } = useAppData();

  const [tabType, setTabType] = useState<'semua' | 'ruangan' | 'alat'>(() => {
    if (tipeParam === 'alat') return 'alat';
    if (tipeParam === 'ruangan') return 'ruangan';
    return 'semua';
  });

  const [filters, setFilters] = useState<FacilityFilters>({
    category: (searchParams.get('category') as FacilityCategory) || DEFAULT_FILTERS.category,
    lokasi: searchParams.get('lokasi') || DEFAULT_FILTERS.lokasi,
    kapasitas: searchParams.get('kapasitas') || DEFAULT_FILTERS.kapasitas,
    status: searchParams.get('status') || DEFAULT_FILTERS.status,
    search: searchParams.get('q') || searchParams.get('search') || '',
  });
  const [detailId, setDetailId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [columns, setColumns] = useState<2 | 3 | 4>(3);

  const countRuangan = useMemo(() => facilities.filter(isRuanganFacility).length, [facilities]);
  const countAlat = useMemo(() => facilities.filter(isAlatFacility).length, [facilities]);

  const baseList = useMemo(() => {
    if (tabType === 'ruangan') return facilities.filter(isRuanganFacility);
    if (tabType === 'alat') return facilities.filter(isAlatFacility);
    return facilities;
  }, [facilities, tabType]);

  const list = filterFacilities(baseList, filters);
  const visibleList = list.slice(0, visibleCount);
  const detailFacility = facilities.find((f) => f.id === detailId) || null;

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filters.category, filters.lokasi, filters.kapasitas, filters.status, filters.search, tabType]);

  return (
    <div className="ochoco-page-wrapper" suppressHydrationWarning>
      <Navbar variant="dashboard" />

      {/* Top Breadcrumb & Back Navigation Bar */}
      <div className="ochoco-sub-header-bar">
        <div className="wrap ochoco-catalog-wrap ochoco-sub-header-row">
          <Link href="/" className="ochoco-back-button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
        <div className="wrap ochoco-catalog-wrap">
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

          {/* Sub-tab Switcher: Semua, Ruangan, Alat */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              marginBottom: 20,
              borderBottom: '1px solid #E5E0D8',
              paddingBottom: 10,
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => {
                setTabType('semua');
                setFilters((prev) => ({
                  ...prev,
                  category: 'Semua Jenis',
                  lokasi: 'Semua Gedung',
                  kapasitas: 'Semua Kapasitas / Jumlah',
                }));
              }}
              style={{
                padding: '8px 18px',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                border: tabType === 'semua' ? '1px solid #181D24' : '1px solid #D5D0C7',
                background: tabType === 'semua' ? '#181D24' : '#FFFFFF',
                color: tabType === 'semua' ? '#FFFFFF' : '#4B5563',
                transition: 'all 0.15s ease',
              }}
            >
              Semua Fasilitas ({facilities.length})
            </button>
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => {
                setTabType('ruangan');
                setFilters((prev) => ({
                  ...prev,
                  category: 'Semua Jenis',
                  lokasi: 'Semua Gedung',
                  kapasitas: 'Semua Kapasitas',
                }));
              }}
              style={{
                padding: '8px 18px',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                border: tabType === 'ruangan' ? '1px solid #181D24' : '1px solid #D5D0C7',
                background: tabType === 'ruangan' ? '#181D24' : '#FFFFFF',
                color: tabType === 'ruangan' ? '#FFFFFF' : '#4B5563',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.15s ease',
              }}
            >
              Fasilitas Ruangan ({countRuangan})
            </button>
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => {
                setTabType('alat');
                setFilters((prev) => ({
                  ...prev,
                  category: 'Semua Jenis',
                  lokasi: 'Semua Gedung',
                  kapasitas: 'Semua Jumlah',
                }));
              }}
              style={{
                padding: '8px 18px',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                border: tabType === 'alat' ? '1px solid #181D24' : '1px solid #D5D0C7',
                background: tabType === 'alat' ? '#181D24' : '#FFFFFF',
                color: tabType === 'alat' ? '#FFFFFF' : '#4B5563',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.15s ease',
              }}
            >
              Fasilitas Alat ({countAlat})
            </button>
          </div>

          <FacilityFilterBar filters={filters} onChange={setFilters} tabType={tabType} />

          <div className="facility-count-bar">
            <div className="facility-count">
              Menampilkan <b>{visibleList.length}</b> dari {list.length} fasilitas {tabType === 'ruangan' ? 'ruangan' : tabType === 'alat' ? 'alat' : ''}
              {list.length !== facilities.length && ` (total ${facilities.length} fasilitas Universitas Diponegoro)`}
            </div>

            <div className="facility-view-switcher">
              <span className="view-switcher-label">Tampilan Grid:</span>
              <button
                type="button"
                suppressHydrationWarning
                className={`view-btn ${columns === 2 ? 'active' : ''}`}
                onClick={() => setColumns(2)}
                title="2 Kolom per baris (Besar)"
              >
                2 Kolom
              </button>
              <button
                type="button"
                suppressHydrationWarning
                className={`view-btn ${columns === 3 ? 'active' : ''}`}
                onClick={() => setColumns(3)}
                title="3 Kolom per baris (Standar)"
              >
                3 Kolom
              </button>
              <button
                type="button"
                suppressHydrationWarning
                className={`view-btn ${columns === 4 ? 'active' : ''}`}
                onClick={() => setColumns(4)}
                title="4 Kolom per baris (Kompak)"
              >
                4 Kolom
              </button>
            </div>
          </div>

          <div className="facility-layout">
            <CategorySidebar
              selected={filters.category}
              onSelect={(category) => setFilters((prev) => ({ ...prev, category }))}
              tabType={tabType}
            />

            <div>
              <div className={`grid grid-cols-${columns}`}>
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
