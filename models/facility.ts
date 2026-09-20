// models/facility.ts
// Definisi tipe data (model) untuk seluruh entitas fasilitas.
// Dipisah dari komponen tampilan supaya struktur data konsisten
// di seluruh aplikasi dan mudah diganti sumbernya (mock -> API/DB).

export type FacilityType = string;

export type FacilityStatus = 'avail' | 'busy' | 'repair';

export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  loc: string;
  cap: number;
  desc: string;
  amenities: string[];
  status: FacilityStatus;
  image?: string;
}

export type SlotState = 'passed' | 'avail' | 'booked' | 'maint';

export interface TimeSlot {
  start: string; // "07:00"
  end: string; // "07:30"
}
