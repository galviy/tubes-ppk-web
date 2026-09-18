'use client';

import { FACILITY_CATEGORIES, FacilityCategory } from '@/models/facilities-data';
import { FacilityFilters } from '@/lib/filter-facilities';

interface SearchWidgetProps {
  filters: FacilityFilters;
  onChange: (filters: FacilityFilters) => void;
  onSearch: () => void;
}

export default function SearchWidget({ filters, onChange, onSearch }: SearchWidgetProps) {
  return (
    <div className="search-float">
      <div className="search-fields-grid">
        <div className="field">
          <span>Tipe fasilitas</span>
          <select
            value={filters.category}
            onChange={(e) => onChange({ ...filters, category: e.target.value as FacilityCategory })}
          >
            {FACILITY_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <span>Tipe gedung</span>
          <select value={filters.lokasi} onChange={(e) => onChange({ ...filters, lokasi: e.target.value })}>
            <option>Semua Gedung</option>
            <option>Area Timur</option>
            <option>Gedung A</option>
            <option>Gedung B</option>
            <option>Gedung C</option>
            <option>Unit AV</option>
          </select>
        </div>
        <div className="field">
          <span>Kapasitas</span>
          <select value={filters.kapasitas} onChange={(e) => onChange({ ...filters, kapasitas: e.target.value })}>
            <option>Semua Kapasitas</option>
            <option>&lt; 40 orang</option>
            <option>40 – 100 orang</option>
            <option>&gt; 100 orang</option>
          </select>
        </div>
        <div className="field">
          <span>Status</span>
          <select value={filters.status} onChange={(e) => onChange({ ...filters, status: e.target.value })}>
            <option>Semua Status</option>
            <option>Tersedia</option>
            <option>Perbaikan</option>
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
