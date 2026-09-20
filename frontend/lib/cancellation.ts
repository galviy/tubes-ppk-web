// lib/cancellation.ts
import { Reservation } from '@/models/reservation';

export const CANCEL_HOURS_BEFORE = 2;

export function getStartDateTime(r: Reservation): Date {
  return new Date(`${r.tanggal}T${r.start}:00`);
}

export function getCancellationDeadline(r: Reservation): Date {
  return new Date(getStartDateTime(r).getTime() - CANCEL_HOURS_BEFORE * 60 * 60 * 1000);
}

/** Reservasi hanya bisa dibatalkan sendiri oleh pengguna sebelum batas waktu ini lewat. */
export function canSelfCancel(r: Reservation): boolean {
  if (r.status !== 'menunggu' && r.status !== 'disetujui') return false;
  return getCancellationDeadline(r).getTime() > Date.now();
}

export function formatDeadline(d: Date): string {
  return d.toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' WIB';
}
