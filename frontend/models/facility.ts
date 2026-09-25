// models/facility.ts
// Definisi tipe data (model) untuk seluruh entitas fasilitas.
// Dipisah dari komponen tampilan supaya struktur data konsisten
// di seluruh aplikasi dan bersumber langsung dari backend API/DB.

export type FacilityType = string;

export type FacilityStatus = 'avail' | 'busy' | 'repair' | 'nonaktif';

export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  loc: string;
  cap: number;
  // Jumlah unit siap pakai untuk alat (dari `jumlah_tersedia` backend);
  // untuk ruangan tidak dipakai, pakai `cap` sebagai kapasitas orang.
  tersedia?: number;
  desc: string;
  amenities: string[];
  status: FacilityStatus;
  image?: string;
  // Koordinat backend (diteruskan dari GET /fasilitas: `ref_id` + `tipe`).
  // Fasilitas seed lokal tidak punya keduanya -> tidak terkirim ke backend.
  refId?: number;
  tipe?: 'ruangan' | 'alat';
}

export type SlotState = 'passed' | 'avail' | 'pending' | 'booked' | 'maint';

export interface TimeSlot {
  start: string; // "07:00"
  end: string; // "07:30"
}
