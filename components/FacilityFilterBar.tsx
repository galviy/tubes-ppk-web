'use client';

import { FACILITY_CATEGORIES, FacilityCategory } from '@/models/facilities-data';
import { FacilityFilters } from '@/lib/filter-facilities';

interface FacilityFilterBarProps {
  filters: FacilityFilters;
  onChange: (filters: FacilityFilters) => void;
}

export default function FacilityFilterBar({ filters, onChange }: FacilityFilterBarProps) {
  return (
    <div className="filter-card">
      <div className="f-head">Pencarian fasilitas</div>

      <div className="fgroup">
        <label>Tipe fasilitas</label>
        <select
          value={filters.category}
          onChange={(e) => onChange({ ...filters, category: e.target.value as FacilityCategory })}
        >
          {FACILITY_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="fgroup">
        <label>Tipe gedung</label>
        <select value={filters.lokasi} onChange={(e) => onChange({ ...filters, lokasi: e.target.value })}>
          <option>Semua Gedung</option>
          <option>Area Timur</option>
          <option>Gedung A</option>
          <option>Gedung B</option>
          <option>Gedung C</option>
          <option>Unit AV</option>
        </select>
      </div>

      <div className="fgroup">
        <label>Kapasitas</label>
        <select value={filters.kapasitas} onChange={(e) => onChange({ ...filters, kapasitas: e.target.value })}>
          <option>Semua Kapasitas</option>
          <option>&lt; 40 orang</option>
          <option>40 – 100 orang</option>
          <option>&gt; 100 orang</option>
        </select>
      </div>

      <div className="fgroup">
        <label>Status</label>
        <select value={filters.status} onChange={(e) => onChange({ ...filters, status: e.target.value })}>
          <option>Semua Status</option>
          <option>Tersedia</option>
          <option>Perbaikan</option>
        </select>
      </div>
    </div>
  );
}
