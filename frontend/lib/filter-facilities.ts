// lib/filter-facilities.ts
// Fungsi murni untuk memfilter daftar fasilitas berdasarkan kategori,
// lokasi, kapasitas, dan status. Dipakai oleh halaman Beranda.

import { Facility } from '@/models/facility';
import { FacilityCategory, isAlatFacility } from '@/models/facilities-data';

export interface FacilityFilters {
  category: FacilityCategory;
  lokasi: string;
  kapasitas: string;
  status: string;
  search?: string;
}

export const DEFAULT_FILTERS: FacilityFilters = {
  category: 'Semua Jenis',
  lokasi: 'Semua Gedung',
  kapasitas: 'Semua Kapasitas / Jumlah',
  status: 'Semua Status',
  search: '',
};

function capacityBand(cap: number): '<40' | '40-100' | '>100' {
  if (cap < 40) return '<40';
  if (cap > 100) return '>100';
  return '40-100';
}

export function filterFacilities(list: Facility[], filters: FacilityFilters): Facility[] {
  return list.filter((f) => {
    if (filters.category !== 'Semua Jenis' && f.type !== filters.category) return false;
    if (filters.lokasi !== 'Semua Gedung' && f.loc !== filters.lokasi) return false;

    if (filters.kapasitas && !filters.kapasitas.startsWith('Semua')) {
      const isFilterUnit = filters.kapasitas.includes('unit');
      const isFilterOrang = filters.kapasitas.includes('orang');

      if (isAlatFacility(f)) {
        // Alat diukur dalam jumlah unit tersedia, bukan kapasitas orang
        const jumlah = f.tersedia ?? f.cap;
        if (isFilterOrang) return false;
        if (isFilterUnit) {
          if (filters.kapasitas.includes('<')) {
            const num = parseInt(filters.kapasitas.replace(/[^0-9]/g, ''), 10) || 5;
            if (jumlah >= num) return false;
          } else if (filters.kapasitas.includes('>')) {
            const num = parseInt(filters.kapasitas.replace(/[^0-9]/g, ''), 10) || 10;
            if (jumlah <= num) return false;
          } else if (filters.kapasitas.includes('-')) {
            const parts = filters.kapasitas.split('-').map((s) => parseInt(s.replace(/[^0-9]/g, ''), 10));
            if (parts.length === 2 && (jumlah < parts[0] || jumlah > parts[1])) return false;
          }
        }
      } else {
        // Ruangan / Fasilitas fisik diukur dalam kapasitas orang
        if (isFilterUnit) return false;
        const wanted = filters.kapasitas.includes('<')
          ? '<40'
          : filters.kapasitas.includes('>')
          ? '>100'
          : '40-100';
        if (capacityBand(f.cap) !== wanted) return false;
      }
    }

    if (filters.status === 'Tersedia' && f.status !== 'avail') return false;
    if (filters.status === 'Perbaikan' && f.status !== 'repair') return false;
    if (filters.status === 'Nonaktif' && f.status !== 'nonaktif') return false;

    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      const matchName = f.name.toLowerCase().includes(q);
      const matchLoc = f.loc.toLowerCase().includes(q);
      const matchType = f.type.toLowerCase().includes(q);
      const matchDesc = f.desc.toLowerCase().includes(q);
      if (!matchName && !matchLoc && !matchType && !matchDesc) return false;
    }

    return true;
  });
}
