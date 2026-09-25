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

export const INDO_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

/**
 * Format string tanggal YYYY-MM-DD atau ISO menjadi format teks ejaan Indonesia (misal: "24 September 2026").
 */
export function formatDateIndo(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const cleanStr = String(dateStr).trim();
  const match = cleanStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (match) {
    const year = match[1];
    const monthIndex = parseInt(match[2], 10) - 1;
    const day = parseInt(match[3], 10);
    if (monthIndex >= 0 && monthIndex < 12) {
      return `${day} ${INDO_MONTHS[monthIndex]} ${year}`;
    }
  }
  const d = new Date(cleanStr);
  if (!Number.isNaN(d.getTime())) {
    return `${d.getDate()} ${INDO_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  }
  return cleanStr;
}

// Selaras aturan backend (services.reservasi_service.go: hariMinimalPengajuan):
// reservasi paling cepat H+2, yaitu minimal 2 hari sebelum tanggal kegiatan.
export const HARI_MINIMAL_PENGAJUAN = 2;

/**
 * Cek apakah reservasi untuk tanggal target memenuhi batas waktu:
 * paling cepat H+2 (hari ini dan besok belum bisa dipesan).
 * Contoh: hari ini tanggal 25, tanggal paling awal yang bisa dipesan adalah 27.
 */
export function isReservationDeadlineValid(targetDateStr: string, now: Date = new Date()): boolean {
  if (!targetDateStr) return false;
  const parts = targetDateStr.split('-').map(Number);
  if (parts.length !== 3) return false;
  const [y, m, d] = parts;
  const target = new Date(y, m - 1, d, 0, 0, 0, 0);
  const earliest = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + HARI_MINIMAL_PENGAJUAN,
    0,
    0,
    0,
    0
  );
  return target.getTime() >= earliest.getTime();
}

/**
 * Mendapatkan tanggal paling awal yang masih bisa direservasi saat ini (default date picker).
 * Jika hari ini tanggal 25, tanggal paling awal yang memenuhi syarat adalah tanggal 27.
 */
export function getEarliestReservableDate(now: Date = new Date()): string {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + HARI_MINIMAL_PENGAJUAN);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function currentHHMM(): string {
  const now = new Date();
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

export type SlotBooking = 'avail' | 'pending' | 'booked';

/**
 * Klasifikasi klaim satu slot:
 * 1. Sudah disetujui admin -> 'booked', terkunci untuk SEMUA ORANG.
 * 2. Masih menunggu milik orang yang sama -> 'pending', mengunci dirinya
 *    sendiri agar tidak double-booking.
 * 3. Masih menunggu milik orang lain -> 'avail', tetap bisa diperebutkan
 *    (siapa cepat dia dapat saat petugas menyetujui).
 */
export function getSlotBooking(
  reservations: Reservation[],
  facilityId: string,
  slotStart: string,
  excludeId?: number,
  tanggal?: string,
  currentUserIdentifier?: string
): SlotBooking {
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

  if (active.length === 0) return 'avail';

  if (active.some((r) => r.status === 'disetujui')) return 'booked';

  if (currentUserIdentifier) {
    const normUser = currentUserIdentifier.trim().toLowerCase();
    const milikSendiri = active.some((r) => {
      const p = (r.pemohon || '').trim().toLowerCase();
      return p === normUser || (p && normUser && (normUser.includes(p) || p.includes(normUser)));
    });
    if (milikSendiri) return 'pending';
  }

  return 'avail';
}

export function isSlotBooked(
  reservations: Reservation[],
  facilityId: string,
  slotStart: string,
  excludeId?: number,
  tanggal?: string,
  currentUserIdentifier?: string
): boolean {
  return (
    getSlotBooking(reservations, facilityId, slotStart, excludeId, tanggal, currentUserIdentifier) !==
    'avail'
  );
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

/** Petakan status slot dari endpoint /jadwal backend ke status visual. */
export function backendStatusToSlotState(status: string, tersedia: boolean): SlotState {
  switch (status) {
    case 'terpakai':
      return 'booked';
    case 'menunggu':
      return 'pending';
    case 'nonaktif':
      return 'maint';
    default:
      return tersedia ? 'avail' : 'booked';
  }
}

/**
 * Tentukan status visual satu slot. Status dari backend (jadwal publik)
 * diprioritaskan; tanpa data backend, hitung dari reservasi lokal.
 */
export function getSlotState(
  facility: Facility,
  slotStart: string,
  reservations: Reservation[],
  tanggal?: string,
  currentUserIdentifier?: string,
  backend?: { status: string; tersedia: boolean }
): SlotState {
  if (facility.status === 'repair' || facility.status === 'nonaktif') return 'maint';

  let state: SlotState;
  if (backend) {
    state = backendStatusToSlotState(backend.status, backend.tersedia);
  } else {
    const booking = getSlotBooking(
      reservations,
      facility.id,
      slotStart,
      undefined,
      tanggal,
      currentUserIdentifier
    );
    state = booking === 'avail' ? 'avail' : booking;
  }

  if (state !== 'avail' && state !== 'pending') return state;

  const today = getTodayDateString();
  if (!tanggal || tanggal === today) {
    if (slotStart < currentHHMM()) return 'passed';
  } else if (tanggal < today) {
    return 'passed';
  }

  return state;
}
