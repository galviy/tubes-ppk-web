// lib/slots.ts
// Logika slot waktu 30 menit (07.00-20.00, total 26 slot) dan
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

export function getTodayDateString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Cek apakah reservasi untuk tanggal target masih memenuhi batas waktu:
 * Maksimal reservasi diajukan pada H-1 pukul 00.00 WIB.
 * Contoh: Reservasi untuk tanggal 25 maksimal diajukan tanggal 24 pukul 00.00 WIB.
 */
export function isReservationDeadlineValid(targetDateStr: string, now: Date = new Date()): boolean {
  if (!targetDateStr) return false;
  const parts = targetDateStr.split('-').map(Number);
  if (parts.length !== 3) return false;
  const [y, m, d] = parts;
  // Batas deadline: targetDate minus 1 hari pada pukul 00:00:00 waktu lokal
  const deadline = new Date(y, m - 1, d - 1, 0, 0, 0, 0);
  return now.getTime() < deadline.getTime();
}

/**
 * Mendapatkan tanggal paling awal yang masih bisa direservasi saat ini (default date picker).
 * Jika hari ini tanggal 25 pukul 08:00, deadline untuk tanggal 25 & 26 sudah lewat,
 * sehingga tanggal paling awal yang memenuhi syarat adalah tanggal 27.
 */
export function getEarliestReservableDate(now: Date = new Date()): string {
  const candidate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  while (true) {
    candidate.setDate(candidate.getDate() + 1);
    const y = candidate.getFullYear();
    const m = String(candidate.getMonth() + 1).padStart(2, '0');
    const d = String(candidate.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    if (isReservationDeadlineValid(dateStr, now)) {
      return dateStr;
    }
  }
}

export function currentHHMM(): string {
  const now = new Date();
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

/**
 * Cek apakah suatu slot pada fasilitas tertentu sudah terisi/dikunci:
 * 1. Jika sudah disetujui (approved oleh admin) -> Kunci abu-abu untuk SEMUA ORANG.
 * 2. Jika dipesan oleh orang yang sama (currentUser) -> Kunci abu-abu untuk orang tersebut,
 *    sehingga dia tidak bisa double-booking di jam yang sama. Jadwal lain tetap bisa dia pilih.
 * 3. Jika dipesan oleh orang lain dan status masih pending -> Tetap TERSEDIA (hijau) untuk orang lain,
 *    karena konsepnya cepat-cepatan (siapa cepat dia dapat saat diapprove admin).
 */
export function isSlotBooked(
  reservations: Reservation[],
  facilityId: string,
  slotStart: string,
  excludeId?: number,
  tanggal?: string,
  currentUserIdentifier?: string
): boolean {
  const active = reservations.filter(
    (r) =>
      r.facilityId === facilityId &&
      r.id !== excludeId &&
      r.status !== 'ditolak' &&
      r.status !== 'dibatalkan' &&
      (!tanggal || !r.tanggal || r.tanggal === tanggal) &&
      slotStart >= r.start &&
      slotStart < r.end
  );

  if (active.length === 0) return false;

  // 1. Jika sudah disetujui admin, slot mutlak terkunci untuk semua orang
  const isApproved = active.some((r) => r.status === 'disetujui');
  if (isApproved) return true;

  // 2. Jika dipesan oleh orang yang sama (currentUser), kunci abu-abu untuk dirinya
  if (currentUserIdentifier) {
    const normUser = currentUserIdentifier.trim().toLowerCase();
    const isBookedBySameUser = active.some((r) => {
      const p = (r.pemohon || '').trim().toLowerCase();
      return p === normUser || (p && normUser && (normUser.includes(p) || p.includes(normUser)));
    });
    if (isBookedBySameUser) return true;
  }

  // 3. Jika orang lain dan status masih menunggu:
  // Orang lain tetap bisa book (konsep cepat-cepatan)
  return false;
}

/**
 * Cek apakah rentang waktu [start, end) pada fasilitas dan tanggal tertentu
 * bertabrakan dengan reservasi lain yang sudah berstatus "disetujui"
 * atau sudah pernah diajukan oleh orang yang sama sebelumnya.
 */
export function hasRangeConflict(
  reservations: Reservation[],
  facilityId: string,
  tanggal: string,
  start: string,
  end: string,
  excludeId?: number,
  currentUserIdentifier?: string
): Reservation | undefined {
  const overlaps = reservations.filter(
    (r) =>
      r.facilityId === facilityId &&
      r.tanggal === tanggal &&
      r.id !== excludeId &&
      r.status !== 'ditolak' &&
      r.status !== 'dibatalkan' &&
      start < r.end &&
      end > r.start
  );

  if (overlaps.length === 0) return undefined;

  // 1. Yang sudah disetujui oleh admin mutlak bentrok
  const approved = overlaps.find((r) => r.status === 'disetujui');
  if (approved) return approved;

  // 2. Jika dipesan oleh orang yang sama sebelumnya, bentrok
  if (currentUserIdentifier) {
    const normUser = currentUserIdentifier.trim().toLowerCase();
    const myRes = overlaps.find((r) => {
      const p = (r.pemohon || '').trim().toLowerCase();
      return p === normUser || (p && normUser && (normUser.includes(p) || p.includes(normUser)));
    });
    if (myRes) return myRes;
  }

  // 3. Untuk orang lain yang sama-sama pending: tidak bentrok di form
  return undefined;
}

/** Tentukan status visual satu slot untuk sebuah fasilitas dan tanggal spesifik. */
export function getSlotState(
  facility: Facility,
  slotStart: string,
  reservations: Reservation[],
  tanggal?: string,
  currentUserIdentifier?: string
): SlotState {
  if (facility.status === 'repair' || facility.status === 'nonaktif') return 'maint';
  if (isSlotBooked(reservations, facility.id, slotStart, undefined, tanggal, currentUserIdentifier)) {
    return 'booked';
  }

  const today = getTodayDateString();
  if (!tanggal || tanggal === today) {
    if (slotStart < currentHHMM()) return 'passed';
  } else if (tanggal < today) {
    return 'passed';
  }

  return 'avail';
}
