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
}
