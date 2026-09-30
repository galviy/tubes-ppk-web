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

export function formatDateTimeIndo(dateTime: string | null | undefined): string {
  if (!dateTime) return '-';
  const date = new Date(dateTime);
  if (Number.isNaN(date.getTime())) return String(dateTime);
  return date.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

// Selaras aturan backend (services.reservasi_service.go: hariMinimalPengajuan):
// reservasi paling lambat H-2, yaitu minimal 2 hari sebelum tanggal kegiatan.
export const HARI_MINIMAL_PENGAJUAN = 2;

/**
 * Cek apakah reservasi untuk tanggal target memenuhi batas waktu:
 * paling lambat H-2 (hari ini dan besok belum bisa dipesan).
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

/** Helper pembanding ID fasilitas yang tahan terhadap variasi prefix (misal: "ruangan-2" vs "2") */
export function matchesFacility(resFacilityId?: string, targetFacilityId?: string): boolean {
  if (!resFacilityId || !targetFacilityId) return false;
  if (resFacilityId === targetFacilityId) return true;
  const strip = (id: string) => id.replace(/^(ruangan|alat)-/, '');
  if (strip(resFacilityId) === strip(targetFacilityId)) {
    const isAlat1 = resFacilityId.startsWith('alat-');
    const isAlat2 = targetFacilityId.startsWith('alat-');
    if (isAlat1 === isAlat2) return true;
  }
  return false;
}

/**
 * Cek apakah reservasi r berdampak pada targetFacilityId.
 * Mendukung:
 * 1. Kecocokan langsung fasilitas primer (ruangan vs ruangan, atau alat vs alat).
 * 2. Reservasi ruangan yang menyertakan alat pendukung (r.alat) terhadap slot alat tersebut.
 */
export function reservationAffectsFacility(r: Reservation, targetFacilityId?: string): boolean {
  if (!targetFacilityId) return false;
  if (matchesFacility(r.facilityId, targetFacilityId)) return true;

  // Jika target fasilitas adalah alat, periksa apakah reservasi ruangan menyertakan alat ini
  const isTargetRuangan =
    targetFacilityId.startsWith('ruangan-') || targetFacilityId.startsWith('r-');
  if (!isTargetRuangan) {
    const targetNumericId = parseInt(targetFacilityId.replace(/^(alat|a)-/i, ''), 10);
    if (!Number.isNaN(targetNumericId)) {
      if (Array.isArray(r.alat) && r.alat.length > 0) {
        return r.alat.some((item) => item.id === targetNumericId);
      }
    }
  }

  return false;
}

/**
 * Cek apakah dua reservasi memperebutkan fasilitas atau alat yang sama.
 */
export function reservationsShareFacility(r1: Reservation, r2: Reservation): boolean {
  if (matchesFacility(r1.facilityId, r2.facilityId)) return true;

  const alatIds1 = new Set<number>();
  if (r1.facilityId.startsWith('alat-') || r1.facilityId.startsWith('a-')) {
    const nid = parseInt(r1.facilityId.replace(/^(alat|a)-/i, ''), 10);
    if (!Number.isNaN(nid)) alatIds1.add(nid);
  }
  if (Array.isArray(r1.alat)) {
    for (const item of r1.alat) {
      if (item && typeof item.id === 'number') alatIds1.add(item.id);
    }
  }

  const alatIds2 = new Set<number>();
  if (r2.facilityId.startsWith('alat-') || r2.facilityId.startsWith('a-')) {
    const nid = parseInt(r2.facilityId.replace(/^(alat|a)-/i, ''), 10);
    if (!Number.isNaN(nid)) alatIds2.add(nid);
  }
  if (Array.isArray(r2.alat)) {
    for (const item of r2.alat) {
      if (item && typeof item.id === 'number') alatIds2.add(item.id);
    }
  }

  if (alatIds1.size > 0 && alatIds2.size > 0) {
    for (const id of alatIds1) {
      if (alatIds2.has(id)) return true;
    }
  }

  return false;
}

export type SlotBooking = 'avail' | 'pending' | 'booked';

/**
 * Klasifikasi klaim satu slot:
 * 1. Sudah disetujui -> 'booked' (terpakai).
 * 2. Masih menunggu persetujuan (sudah diajukan/dipesan) -> 'pending' (menunggu persetujuan).
 * 3. Belum ada pemesanan -> 'avail' (tersedia).
 */
export function getSlotBooking(
  reservations: Reservation[],
  facilityId: string,
  slotStart: string,
  excludeId?: number,
  tanggal?: string,
  currentUserIdentifier?: string,
  userRole?: string
): SlotBooking {
  const active = reservations.filter(
    (r) =>
      reservationAffectsFacility(r, facilityId) &&
      r.id !== excludeId &&
      r.status !== 'ditolak' &&
      r.status !== 'dibatalkan' &&
      (!tanggal || !r.tanggal || r.tanggal === tanggal) &&
      slotStart >= r.start &&
      slotStart < r.end
  );

  if (active.length === 0) return 'avail';

  // 1. Sudah disetujui -> 'booked' (terkunci bagi semua orang)
  if (active.some((r) => r.status === 'disetujui')) return 'booked';

  // 2. Role dashboard: Petugas & Admin berhak melihat status 'pending' (menunggu persetujuan)
  const isOfficerOrAdmin = userRole === 'petugas' || userRole === 'admin';
  if (isOfficerOrAdmin && active.some((r) => r.status === 'menunggu')) {
    return 'pending';
  }

  // 3. Akun pemesan: jika slot ini diajukan oleh pengguna saat ini, tampilkan 'pending'
  if (currentUserIdentifier) {
    const normUser = currentUserIdentifier.trim().toLowerCase();
    const milikSendiri = active.some((r) => {
      const p = (r.pemohon || '').trim().toLowerCase();
      return p === normUser || (p && normUser && (normUser.includes(p) || p.includes(normUser)));
    });
    if (milikSendiri) return 'pending';
  }

  // 4. Jadwal publik (tanpa login) atau akun pengguna lain:
  // Selama belum di-ACC, status tetap 'avail' ("Tersedia")
  return 'avail';
}

export function isSlotBooked(
  reservations: Reservation[],
  facilityId: string,
  slotStart: string,
  excludeId?: number,
  tanggal?: string,
  currentUserIdentifier?: string,
  userRole?: string
): boolean {
  return (
    getSlotBooking(reservations, facilityId, slotStart, excludeId, tanggal, currentUserIdentifier, userRole) !==
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
      reservationAffectsFacility(r, facilityId) &&
      r.tanggal === tanggal &&
      r.id !== excludeId &&
      r.status !== 'ditolak' &&
      r.status !== 'dibatalkan' &&
      start < r.end &&
      end > r.start
  );

  if (overlaps.length === 0) return undefined;

  // 1. Yang sudah disetujui mutlak bentrok untuk semua orang
  const approved = overlaps.find((r) => r.status === 'disetujui');
  if (approved) return approved;

  // 2. Jika dipesan oleh orang yang sama sebelumnya, bentrok (mencegah double booking oleh pemesan sendiri)
  if (currentUserIdentifier) {
    const normUser = currentUserIdentifier.trim().toLowerCase();
    const myRes = overlaps.find((r) => {
      const p = (r.pemohon || '').trim().toLowerCase();
      return p === normUser || (p && normUser && (normUser.includes(p) || p.includes(normUser)));
    });
    if (myRes) return myRes;
  }

  // 3. Untuk orang lain yang sama-sama mengajukan: tidak bentrok di form
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
 * Tentukan status visual satu slot.
 * Memeriksa status dari data reservasi lokal (termasuk sinkronisasi ruangan + alat)
 * dan data backend (jadwal publik).
 */
export function getSlotState(
  facility: Facility,
  slotStart: string,
  reservations: Reservation[],
  tanggal?: string,
  currentUserIdentifier?: string,
  backend?: { status: string; tersedia: boolean },
  userRole?: string
): SlotState {
  if (facility.status === 'repair' || facility.status === 'nonaktif') return 'maint';

  let state: SlotState = 'avail';

  // 1. Cek dari reservasi lokal terlebih dahulu (lebih kaya konteks user & sinkron ruangan + alat)
  const localBooking = getSlotBooking(
    reservations,
    facility.id,
    slotStart,
    undefined,
    tanggal,
    currentUserIdentifier,
    userRole
  );

  if (localBooking === 'booked') {
    state = 'booked';
  } else if (localBooking === 'pending') {
    state = 'pending';
  } else if (backend) {
    if (backend.status === 'terpakai' || (!backend.tersedia && backend.status !== 'menunggu')) {
      return 'booked';
    }
    if (backend.status === 'nonaktif') {
      return 'maint';
    }
    if (backend.status === 'menunggu') {
      const isOfficerOrAdmin = userRole === 'petugas' || userRole === 'admin';
      state = isOfficerOrAdmin ? 'pending' : 'avail';
    } else {
      state = backendStatusToSlotState(backend.status, backend.tersedia);
    }
  } else {
    state = localBooking;
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
