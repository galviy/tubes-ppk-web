// lib/slots.ts
// Logika slot waktu 30 menit (07.00–20.00, total 26 slot) dan
// penentuan status tiap slot. Dipisah dari komponen supaya bisa
// diuji (unit test) atau dipindah ke server tanpa menyentuh UI.

import { Facility, SlotState, TimeSlot } from '@/models/facility';
import { Reservation } from '@/models/reservation';

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

/** Menghasilkan 26 slot 30 menit dari 07.00 sampai 20.00. */
export function generateTimeSlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];
  for (let h = 7; h < 20; h++) {
    slots.push({ start: `${pad(h)}:00`, end: `${pad(h)}:30` });
    slots.push({ start: `${pad(h)}:30`, end: `${pad(h + 1)}:00` });
  }
  return slots;
}

export function currentHHMM(): string {
  const now = new Date();
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

/**
 * Cek apakah suatu slot pada fasilitas tertentu bentrok dengan reservasi
 * yang berstatus "disetujui" (opsional: kecualikan satu id reservasi,
 * dipakai saat petugas mengecek reservasi yang sedang ditinjau sendiri).
 */
export function isSlotBooked(
  reservations: Reservation[],
  facilityId: string,
  slotStart: string,
  excludeId?: number
): boolean {
  return reservations.some(
    (r) =>
      r.facilityId === facilityId &&
      r.status === 'disetujui' &&
      r.id !== excludeId &&
      slotStart >= r.start &&
      slotStart < r.end
  );
}

/**
 * Cek apakah rentang waktu [start, end) pada fasilitas dan tanggal tertentu
 * bertabrakan dengan reservasi lain yang sudah berstatus "disetujui".
 */
export function hasRangeConflict(
  reservations: Reservation[],
  facilityId: string,
  tanggal: string,
  start: string,
  end: string,
  excludeId?: number
): Reservation | undefined {
  return reservations.find(
    (r) =>
      r.facilityId === facilityId &&
      r.tanggal === tanggal &&
      r.status === 'disetujui' &&
      r.id !== excludeId &&
      start < r.end &&
      end > r.start
  );
}

/** Tentukan status visual satu slot untuk sebuah fasilitas. */
export function getSlotState(
  facility: Facility,
  slotStart: string,
  reservations: Reservation[]
): SlotState {
  if (facility.status === 'repair') return 'maint';
  if (isSlotBooked(reservations, facility.id, slotStart)) return 'booked';
  return slotStart < currentHHMM() ? 'passed' : 'avail';
}
