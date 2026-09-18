// lib/filter-facilities.ts
// Fungsi murni untuk memfilter daftar fasilitas berdasarkan kategori,
// lokasi, kapasitas, dan status. Dipakai oleh halaman Beranda.

import { Facility } from '@/models/facility';
import { FacilityCategory } from '@/models/facilities-data';

export interface FacilityFilters {
  category: FacilityCategory;
  lokasi: string;
  kapasitas: string;
  status: string;
}

export const DEFAULT_FILTERS: FacilityFilters = {
  category: 'Semua Jenis',
  lokasi: 'Semua Gedung',
  kapasitas: 'Semua Kapasitas',
  status: 'Semua Status',
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

    if (filters.kapasitas !== 'Semua Kapasitas') {
      const wanted = filters.kapasitas.includes('<')
        ? '<40'
        : filters.kapasitas.includes('>')
        ? '>100'
        : '40-100';
      if (capacityBand(f.cap) !== wanted) return false;
    }

    if (filters.status === 'Tersedia' && f.status !== 'avail') return false;
    if (filters.status === 'Perbaikan' && f.status !== 'repair') return false;

    return true;
  });
}
