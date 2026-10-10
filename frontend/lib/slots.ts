// lib/slots.ts
// Logika slot waktu 30 menit (07.00-20.00, total 26 slot) dan
// penentuan status tiap slot. Dipisah dari komponen supaya bisa
// diuji (unit test) atau dipindah ke server tanpa menyentuh UI.

import { Facility, SlotState, TimeSlot } from '@/models/facility';
import { Reservation } from '@/models/reservation';

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

export const APP_TIME_ZONE = 'Asia/Jakarta';

function zonedParts(date: Date, timeZone = APP_TIME_ZONE): Record<string, string> {
  return Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(date)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value])
  );
}

export function dateKeyInJakarta(value: string | Date | null | undefined): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const parts = zonedParts(date);
  return `${parts.year}-${parts.month}-${parts.day}`;
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
  return dateKeyInJakarta(new Date());
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
  if (/^\d{4}-\d{1,2}-\d{1,2}[T ]/.test(cleanStr)) {
    const dateKey = dateKeyInJakarta(cleanStr);
    if (dateKey) return formatDateKeyIndo(dateKey);
  }
  const match = cleanStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (match) {
    const year = match[1];
    const monthIndex = parseInt(match[2], 10) - 1;
    const day = parseInt(match[3], 10);
    if (monthIndex >= 0 && monthIndex < 12) {
      return formatDateKeyIndo(`${year}-${pad(monthIndex + 1)}-${pad(day)}`);
    }
  }
  const d = new Date(cleanStr);
  if (!Number.isNaN(d.getTime())) {
    return formatDateKeyIndo(dateKeyInJakarta(d));
  }
  return cleanStr;
}

function formatDateKeyIndo(dateKey: string): string {
  const match = dateKey.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return dateKey;
  return `${Number(match[3])} ${INDO_MONTHS[Number(match[2]) - 1]} ${match[1]}`;
}

export function formatDateTimeIndo(dateTime: string | null | undefined): string {
  if (!dateTime) return '-';
  const date = new Date(dateTime);
  if (Number.isNaN(date.getTime())) return String(dateTime);
  return `${date.toLocaleString('id-ID', {
    timeZone: APP_TIME_ZONE,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })} WIB`;
}

export function formatTimeInJakarta(date: Date): string {
  const parts = zonedParts(date);
  return `${parts.hour}:${parts.minute}`;
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
  const earliest = addCalendarDays(getJakartaDateKey(now), HARI_MINIMAL_PENGAJUAN);
  return /^\d{4}-\d{2}-\d{2}$/.test(targetDateStr) && targetDateStr >= earliest;
}

/**
 * Mendapatkan tanggal paling awal yang masih bisa direservasi saat ini (default date picker).
 * Jika hari ini tanggal 25, tanggal paling awal yang memenuhi syarat adalah tanggal 27.
 */
export function getEarliestReservableDate(now: Date = new Date()): string {
  return addCalendarDays(getJakartaDateKey(now), HARI_MINIMAL_PENGAJUAN);
}

export function currentHHMM(): string {
  return formatTimeInJakarta(new Date());
}

function getJakartaDateKey(now: Date): string {
  return dateKeyInJakarta(now);
}

function addCalendarDays(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + days));
  return `${next.getUTCFullYear()}-${pad(next.getUTCMonth() + 1)}-${pad(next.getUTCDate())}`;
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

// ----- Alat quantity-aware (selaras backend TotalAlatTerpakai) -----
// Backend hanya mengunci stok oleh APPROVED (disetujui); PENDING tidak
// mengurangi kuota. Cek existence ("ada yang pinjam langsung terpakai")
// salah untuk alat dengan stok > 1. Contoh: stok 5, dipakai 2, sisa 3
// masih boleh dipinjam.

export function isAlatFacilityId(facilityId?: string): boolean {
  if (!facilityId) return false;
  const id = facilityId.toLowerCase();
  return id.startsWith('alat-') || id.startsWith('a-');
}

export function getAlatNumericId(facilityId?: string): number | null {
  if (!facilityId) return null;
  const m = facilityId.match(/^(?:alat|a)-(\d+)/i);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return Number.isNaN(n) ? null : n;
}

// Jumlah unit alat yang sudah DISETUJUI dan overlap dengan rentang.
// Mencakup reservasi alat primer (facilityId alat-X) maupun alat
// pendukung pada reservasi ruangan (r.alat[]).
export function totalAlatApprovedPadaRange(
  reservations: Reservation[],
  facilityId: string,
  tanggal: string,
  start: string,
  end: string,
  excludeId?: number,
): number {
  const alatId = getAlatNumericId(facilityId);
  if (alatId === null) return 0;
  let total = 0;
  for (const r of reservations) {
    if (r.id === excludeId) continue;
    if (r.status !== 'disetujui') continue;
    if (r.tanggal !== tanggal) continue;
    if (!(start < r.end && end > r.start)) continue;
    if (matchesFacility(r.facilityId, facilityId)) {
      // Reservasi alat primer: jumlah ada di r.alat[0] atau r.peserta.
      const item = Array.isArray(r.alat) ? r.alat.find((a) => a.id === alatId) : undefined;
      total += item?.jumlah ?? r.peserta ?? 1;
    } else if (Array.isArray(r.alat)) {
      for (const item of r.alat) {
        if (item && item.id === alatId) total += item.jumlah || 1;
      }
    }
  }
  return total;
}

export function totalAlatApprovedPadaSlot(
  reservations: Reservation[],
  facilityId: string,
  slotStart: string,
  tanggal: string,
  excludeId?: number,
): number {
  // Slot 30 menit: cek overlap [slotStart, +30mnt) via range semu.
  // Karena format HH:MM string comparable, pakai end = slotStart + 30 mnt.
  const [h, m] = slotStart.split(':').map(Number);
  const endTotal = h * 60 + m + 30;
  const end = `${String(Math.floor(endTotal / 60)).padStart(2, '0')}:${String(endTotal % 60).padStart(2, '0')}`;
  return totalAlatApprovedPadaRange(reservations, facilityId, tanggal, slotStart, end, excludeId);
}

export function sisaStokAlatPadaRange(
  reservations: Reservation[],
  facilityId: string,
  tanggal: string,
  start: string,
  end: string,
  stokTotal: number,
  excludeId?: number,
): number {
  return stokTotal - totalAlatApprovedPadaRange(reservations, facilityId, tanggal, start, end, excludeId);
}

// True jika permintaan `diminta` unit melebihi sisa stok APPROVED.
export function hasAlatStockConflict(
  reservations: Reservation[],
  facilityId: string,
  tanggal: string,
  start: string,
  end: string,
  diminta: number,
  stokTotal: number,
  excludeId?: number,
): boolean {
  return totalAlatApprovedPadaRange(reservations, facilityId, tanggal, start, end, excludeId) + diminta > stokTotal;
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
  userRole?: string,
  stokTotal?: number
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

  // 1. Alat quantity-aware: hanya 'booked' jika stok APPROVED habis.
  // PENDING tidak mengunci (selaras backend); own-pending tidak memblokir
  // supaya sisa stok tetap bisa dipesan.
  if (stokTotal !== undefined && isAlatFacilityId(facilityId)) {
    const terpakai = totalAlatApprovedPadaSlot(reservations, facilityId, slotStart, tanggal ?? '', excludeId);
    if (terpakai >= stokTotal) return 'booked';
    return 'avail';
  }

  // 1b. Ruangan (eksklusif): sudah disetujui -> 'booked' (terkunci bagi semua orang)
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
  userRole?: string,
  stokTotal?: number
): boolean {
  return (
    getSlotBooking(reservations, facilityId, slotStart, excludeId, tanggal, currentUserIdentifier, userRole, stokTotal) !==
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
  currentUserIdentifier?: string,
  diminta?: number,
  stokTotal?: number
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

  // 1. Alat quantity-aware: bentrok hanya jika sisa stok tidak cukup.
  // PENDING/own-pending tidak memblokir (selaras backend BuatReservasi).
  if (stokTotal !== undefined && isAlatFacilityId(facilityId)) {
    const minta = diminta ?? 1;
    if (hasAlatStockConflict(reservations, facilityId, tanggal, start, end, minta, stokTotal, excludeId)) {
      return overlaps.find((r) => r.status === 'disetujui');
    }
    return undefined;
  }

  // 1b. Ruangan (eksklusif): yang sudah disetujui mutlak bentrok untuk semua orang
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
  userRole?: string,
  stokTotal?: number
): SlotState {
  if (facility.status === 'repair' || facility.status === 'nonaktif') return 'maint';

  let state: SlotState = 'avail';

  // Stok alat untuk cek quantity-aware (tersedia ?? cap). Ruangan: undefined (eksklusif).
  const isAlat = facility.tipe === 'alat' || isAlatFacilityId(facility.id);
  const stok = stokTotal ?? (isAlat ? (facility.tersedia ?? facility.cap) : undefined);

  // 1. Cek dari reservasi lokal terlebih dahulu (lebih kaya konteks user & sinkron ruangan + alat)
  const localBooking = getSlotBooking(
    reservations,
    facility.id,
    slotStart,
    undefined,
    tanggal,
    currentUserIdentifier,
    userRole,
    stok
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
