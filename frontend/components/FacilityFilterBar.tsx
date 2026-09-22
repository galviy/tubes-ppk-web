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
          onChange={(e) => {
            const nextCat = e.target.value;
            let nextKap = filters.kapasitas;
            if (nextCat.toLowerCase() === 'alat' && (nextKap.includes('orang') || nextKap === 'Semua Kapasitas')) {
              nextKap = 'Semua Jumlah';
            } else if (nextCat.toLowerCase() !== 'alat' && (nextKap.includes('unit') || nextKap === 'Semua Jumlah')) {
              nextKap = 'Semua Kapasitas';
            }
            onChange({ ...filters, category: nextCat, kapasitas: nextKap });
          }}
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
        <label>
          {filters.category?.toLowerCase() === 'alat'
            ? 'Jumlah Unit'
            : filters.category === 'Semua Jenis'
            ? 'Kapasitas / Jumlah'
            : 'Kapasitas Ruangan'}
        </label>
        <select
          value={filters.kapasitas}
          onChange={(e) => onChange({ ...filters, kapasitas: e.target.value })}
        >
          {filters.category?.toLowerCase() === 'alat' ? (
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

      <div className="fgroup">
        <label>Status</label>
        <select value={filters.status} onChange={(e) => onChange({ ...filters, status: e.target.value })}>
          <option>Semua Status</option>
          <option>Tersedia</option>
          <option>Perbaikan</option>
          <option>Nonaktif</option>
        </select>
      </div>
    </div>
  );
}
