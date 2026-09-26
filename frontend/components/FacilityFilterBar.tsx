'use client';

import { useMemo } from 'react';
import { useAppData } from '@/context/AppDataContext';
import { FacilityFilters } from '@/lib/filter-facilities';
import {
  DEFAULT_ROOM_CATEGORIES,
  DEFAULT_ALAT_CATEGORIES,
  isRuanganFacility,
  isAlatFacility,
  isAlatCategory,
} from '@/models/facilities-data';

interface FacilityFilterBarProps {
  filters: FacilityFilters;
  onChange: (filters: FacilityFilters) => void;
  tabType?: 'semua' | 'ruangan' | 'alat';
}

export default function FacilityFilterBar({ filters, onChange, tabType = 'semua' }: FacilityFilterBarProps) {
  const { facilities } = useAppData();

  // Dynamic types derived strictly according to tabType
  const typeOptions = useMemo(() => {
    if (tabType === 'ruangan') {
      const dynamic = Array.from(new Set(facilities.filter(isRuanganFacility).map((f) => f.type))).filter(Boolean);
      return ['Semua Jenis', ...Array.from(new Set([...DEFAULT_ROOM_CATEGORIES, ...dynamic]))];
    }
    if (tabType === 'alat') {
      const dynamic = Array.from(new Set(facilities.filter(isAlatFacility).map((f) => f.type))).filter(Boolean);
      return ['Semua Jenis', ...Array.from(new Set([...DEFAULT_ALAT_CATEGORIES, ...dynamic]))];
    }
    const dynamic = Array.from(new Set(facilities.map((f) => f.type))).filter(Boolean);
    return ['Semua Jenis', ...dynamic];
  }, [facilities, tabType]);

  // Dynamic buildings/locations derived from relevant facilities
  const buildingOptions = useMemo(() => {
    const list = tabType === 'ruangan'
      ? facilities.filter(isRuanganFacility)
      : tabType === 'alat'
      ? facilities.filter(isAlatFacility)
      : facilities;
    const dynamic = Array.from(new Set(list.map((f) => f.loc))).filter(Boolean);
    return ['Semua Gedung', ...dynamic];
  }, [facilities, tabType]);

  const isAlat = tabType === 'alat' || isAlatCategory(filters.category);

  return (
    <div className="filter-card">
      <div className="f-head">
        {tabType === 'ruangan' ? 'Pencarian Ruangan' : tabType === 'alat' ? 'Pencarian Alat' : 'Pencarian Fasilitas'}
      </div>

      <div className="fgroup">
        <label>Cari Nama / Kata Kunci</label>
        <input
          type="text"
          placeholder={tabType === 'ruangan' ? 'Cari nama ruangan...' : tabType === 'alat' ? 'Cari nama alat...' : 'Cari nama fasilitas...'}
          value={filters.search || ''}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
        />
      </div>

      <div className="fgroup">
        <label>{tabType === 'alat' ? 'Kategori Alat' : tabType === 'ruangan' ? 'Kategori Ruangan' : 'Tipe fasilitas'}</label>
        <select
          value={filters.category}
          onChange={(e) => {
            const nextCat = e.target.value;
            const willBeAlat = tabType === 'alat' || isAlatCategory(nextCat);
            let nextKap = filters.kapasitas;
            if (willBeAlat && (nextKap.includes('orang') || nextKap === 'Semua Kapasitas')) {
              nextKap = 'Semua Jumlah';
            } else if (!willBeAlat && (nextKap.includes('unit') || nextKap === 'Semua Jumlah')) {
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
        <label>Lokasi / Gedung</label>
        <select value={filters.lokasi} onChange={(e) => onChange({ ...filters, lokasi: e.target.value })}>
          {buildingOptions.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      <div className="fgroup">
        <label>
          {tabType === 'alat'
            ? 'Jumlah Unit'
            : tabType === 'ruangan'
            ? 'Kapasitas Ruangan'
            : isAlatCategory(filters.category)
            ? 'Jumlah Unit'
            : 'Kapasitas / Jumlah'}
        </label>
        <select
          value={filters.kapasitas}
          onChange={(e) => onChange({ ...filters, kapasitas: e.target.value })}
        >
          {tabType === 'alat' || isAlatCategory(filters.category) ? (
            <>
              <option>Semua Jumlah</option>
              <option>&lt; 5 unit</option>
              <option>5 - 10 unit</option>
              <option>&gt; 10 unit</option>
            </>
          ) : tabType === 'ruangan' ? (
            <>
              <option>Semua Kapasitas</option>
              <option>&lt; 40 orang</option>
              <option>40 - 100 orang</option>
              <option>&gt; 100 orang</option>
            </>
          ) : (
            <>
              <option>Semua Kapasitas / Jumlah</option>
              <option>&lt; 40 orang (Ruangan)</option>
              <option>40 - 100 orang (Ruangan)</option>
              <option>&gt; 100 orang (Ruangan)</option>
              <option>&lt; 5 unit (Alat)</option>
              <option>5 - 10 unit (Alat)</option>
              <option>&gt; 10 unit (Alat)</option>
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
