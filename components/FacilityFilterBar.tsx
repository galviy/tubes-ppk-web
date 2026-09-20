'use client';

import { useAppData } from '@/context/AppDataContext';
import { FacilityFilters } from '@/lib/filter-facilities';

interface FacilityFilterBarProps {
  filters: FacilityFilters;
  onChange: (filters: FacilityFilters) => void;
}

export default function FacilityFilterBar({ filters, onChange }: FacilityFilterBarProps) {
  const { facilities } = useAppData();

  // Dynamic types derived from current facilities
  const dynamicTypes = Array.from(new Set(facilities.map((f) => f.type))).filter(Boolean);
  const typeOptions = ['Semua Jenis', ...dynamicTypes];

  // Dynamic buildings/locations derived from current facilities
  const dynamicBuildings = Array.from(new Set(facilities.map((f) => f.loc))).filter(Boolean);
  const buildingOptions = ['Semua Gedung', ...dynamicBuildings];

  return (
    <div className="filter-card">
      <div className="f-head">Pencarian fasilitas</div>

      <div className="fgroup">
        <label>Tipe fasilitas</label>
        <select
          value={filters.category}
          onChange={(e) => onChange({ ...filters, category: e.target.value })}
        >
          {typeOptions.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="fgroup">
        <label>Tipe gedung</label>
        <select value={filters.lokasi} onChange={(e) => onChange({ ...filters, lokasi: e.target.value })}>
          {buildingOptions.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
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
