'use client';

import { useMemo } from 'react';
import { useAppData } from '@/context/AppDataContext';
import {
  DEFAULT_ROOM_CATEGORIES,
  FacilityCategory,
  isAlatCategory,
  isRuanganFacility,
  isAlatFacility,
} from '@/models/facilities-data';
import { FacilityFilters } from '@/lib/filter-facilities';

interface SearchWidgetProps {
  filters: FacilityFilters;
  onChange: (filters: FacilityFilters) => void;
  onSearch: () => void;
}

export default function SearchWidget({ filters, onChange, onSearch }: SearchWidgetProps) {
  const { facilities } = useAppData();
  const isSelectedAlat = isAlatCategory(filters.category);

  const roomCategories = useMemo(() => {
    const fromFac = Array.from(new Set(facilities.filter(isRuanganFacility).map((f) => f.type))).filter(Boolean);
    return Array.from(new Set([...DEFAULT_ROOM_CATEGORIES, ...fromFac]));
  }, [facilities]);

  const alatCategories = useMemo(() => {
    return Array.from(new Set(facilities.filter(isAlatFacility).map((f) => f.type))).filter(Boolean);
  }, [facilities]);

  const buildingOptions = useMemo(() => {
    const list = isSelectedAlat
      ? facilities.filter(isAlatFacility)
      : filters.category !== 'Semua Jenis'
      ? facilities.filter((f) => f.type === filters.category)
      : facilities;
    const dynamic = Array.from(new Set(list.map((f) => f.loc))).filter(Boolean);
    return ['Semua Gedung', ...dynamic];
  }, [facilities, filters.category, isSelectedAlat]);

  return (
    <div className="search-float">
      <div className="search-fields-grid">
        <div className="field">
          <span>Tipe fasilitas</span>
          <select
            value={filters.category}
            onChange={(e) => {
              const nextCat = e.target.value as FacilityCategory;
              let nextKap = filters.kapasitas;
              if (isAlatCategory(nextCat) && (nextKap.includes('orang') || nextKap === 'Semua Kapasitas')) {
                nextKap = 'Semua Jumlah';
              } else if (!isAlatCategory(nextCat) && (nextKap.includes('unit') || nextKap === 'Semua Jumlah')) {
                nextKap = 'Semua Kapasitas';
              }
              onChange({ ...filters, category: nextCat, kapasitas: nextKap });
            }}
          >
            <option value="Semua Jenis">Semua Jenis</option>
            <optgroup label="Kategori Ruangan">
              {roomCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </optgroup>
            {alatCategories.length > 0 && (
              <optgroup label="Kategori Alat">
                {alatCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </optgroup>
            )}
          </select>
        </div>
        <div className="field">
          <span>Tipe gedung</span>
          <select
            value={buildingOptions.includes(filters.lokasi) ? filters.lokasi : 'Semua Gedung'}
            onChange={(e) => onChange({ ...filters, lokasi: e.target.value })}
          >
            {buildingOptions.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <span>
            {isSelectedAlat
              ? 'Jumlah Unit'
              : filters.category === 'Semua Jenis'
              ? 'Kapasitas / Jumlah'
              : 'Kapasitas Ruangan'}
          </span>
          <select
            value={filters.kapasitas}
            onChange={(e) => onChange({ ...filters, kapasitas: e.target.value })}
          >
            {isSelectedAlat ? (
              <>
                <option>Semua Jumlah</option>
                <option>&lt; 5 unit</option>
                <option>5 - 10 unit</option>
                <option>&gt; 10 unit</option>
              </>

            ) : filters.category === 'Semua Jenis' ? (
              <>
                <option>Semua Kapasitas / Jumlah</option>
                <option>&lt; 40 orang (Ruangan)</option>
                <option>40 - 100 orang (Ruangan)</option>
                <option>&gt; 100 orang (Ruangan)</option>
                <option>&lt; 5 unit (Alat)</option>
                <option>5 - 10 unit (Alat)</option>
                <option>&gt; 10 unit (Alat)</option>
              </>
            ) : (
              <>
                <option>Semua Kapasitas</option>
                <option>&lt; 40 orang</option>
                <option>40 - 100 orang</option>
                <option>&gt; 100 orang</option>
              </>
            )}
          </select>
        </div>
        <div className="field">
          <span>Status</span>
          <select value={filters.status} onChange={(e) => onChange({ ...filters, status: e.target.value })}>
            <option>Semua Status</option>
            <option>Tersedia</option>
            <option>Perbaikan</option>
            <option>Nonaktif</option>
          </select>
        </div>
      </div>

      <button className="search-btn-wide" onClick={onSearch}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="7" stroke="#fff" strokeWidth="2" />
          <line x1="21" y1="21" x2="16.5" y2="16.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span>Cari Fasilitas</span>
      </button>
    </div>
  );
}
