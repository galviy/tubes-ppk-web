// models/facilities-data.ts
//
// Metadata kategori untuk filter katalog. BUKAN data mock: daftar ini
// hanya label UI. Data fasilitas, reservasi, laporan, dan akun seluruhnya
// berasal dari backend Go (lihat lib/api.ts + context/AppDataContext.tsx).

export const FACILITY_CATEGORIES: string[] = [
  'Semua Jenis',
  'Ruang Kelas',
  'Aula',
  'Laboratorium',
  'Lapangan',
  'Alat',
];

export type FacilityCategory = string;
