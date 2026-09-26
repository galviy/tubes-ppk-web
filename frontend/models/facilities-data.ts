// models/facilities-data.ts
//
// Metadata kategori untuk filter katalog. BUKAN data mock: daftar ini
// hanya label UI. Data fasilitas, reservasi, laporan, dan akun seluruhnya
// berasal dari backend Go (lihat lib/api.ts + context/AppDataContext.tsx).

export const DEFAULT_ROOM_CATEGORIES: string[] = [
  'Ruang Kelas',
  'Aula',
  'Laboratorium',
  'Lapangan',
];

export const DEFAULT_ALAT_CATEGORIES: string[] = [
  'Alat Pembersih',
  'Proyektor & Multimedia',
  'Sound System & Audio',
  'Peralatan Laboratorium',
  'Kamera & Dokumentasi',
  'Elektronik & Kabel',
  'Peralatan Olahraga',
  'Alat',
];

export const FACILITY_CATEGORIES: string[] = [
  'Semua Jenis',
  ...DEFAULT_ROOM_CATEGORIES,
  ...DEFAULT_ALAT_CATEGORIES,
];

export type FacilityCategory = string;

export function isAlatCategory(category?: string | null): boolean {
  if (!category) return false;
  const c = category.toLowerCase();
  if (c === 'alat' || c.includes('alat') || c.includes('pembersih') || c.includes('peralatan')) return true;
  return DEFAULT_ALAT_CATEGORIES.some((cat) => cat.toLowerCase() === c);
}

export function isRuanganCategory(category?: string | null): boolean {
  if (!category || category === 'Semua Jenis') return false;
  return !isAlatCategory(category);
}

export function isAlatFacility(facility?: {
  tipe?: string;
  id?: string;
  type?: string;
  name?: string;
} | null): boolean {
  if (!facility) return false;
  if (facility.tipe === 'alat') return true;
  if (facility.id && String(facility.id).startsWith('alat-')) return true;
  const t = facility.type?.toLowerCase() || '';
  const n = facility.name?.toLowerCase() || '';
  if (t === 'alat' || t.includes('alat') || t.includes('pembersih') || t.includes('peralatan')) return true;
  if (n.includes('pembersih') || n.includes('sapu') || n.includes('pel ') || n.includes('vacuum') || n.includes('alat')) return true;
  if (
    facility.type &&
    DEFAULT_ALAT_CATEGORIES.some((c) => c.toLowerCase() === t)
  ) {
    return true;
  }
  return false;
}

export function isRuanganFacility(facility?: {
  tipe?: string;
  id?: string;
  type?: string;
  name?: string;
} | null): boolean {
  return !isAlatFacility(facility);
}

export function isAlatReservation(
  reservation: { facilityId?: string; alat?: unknown[]; ruanganId?: number },
  facility?: { tipe?: string; id?: string; type?: string }
): boolean {
  if (reservation.ruanganId && reservation.ruanganId > 0) return false;
  if (reservation.facilityId?.startsWith('ruangan-') || reservation.facilityId?.startsWith('r-')) return false;
  if (facility && !isAlatFacility(facility)) return false;
  if (facility && isAlatFacility(facility)) return true;
  if (reservation.facilityId?.startsWith('alat-') || reservation.facilityId?.startsWith('a-')) return true;
  return false;
}
