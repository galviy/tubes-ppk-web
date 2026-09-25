// models/reservation.ts
export type ReservationStatus = 'menunggu' | 'disetujui' | 'ditolak' | 'dibatalkan';

export interface Reservation {
  id: number;
  facilityId: string;
  pemohon: string;
  tanggal: string;
  start: string;
  end: string;
  tujuan: string;
  peserta?: number;
  status: ReservationStatus;
  createdAt: string; // ISO timestamp - kapan reservasi ini diajukan
  catatanBatal?: string;
  // Sumber baris: 'mock' (seed/cermin lokal) atau 'backend' (sinkron DB).
  // Server menang: sync mengganti baris backend + membuang seed.
  sumber?: 'mock' | 'backend';
  backendId?: number;
}
