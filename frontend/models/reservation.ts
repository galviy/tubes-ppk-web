// models/reservation.ts
export type ReservationStatus = 'menunggu' | 'disetujui' | 'ditolak' | 'dibatalkan' | 'selesai';

export interface ReservationAlatItem {
  id: number;
  nama: string;
  jumlah: number;
}

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
  cancelledAt?: string; // ISO timestamp - kapan reservasi dibatalkan
  catatanBatal?: string;
  // Sumber baris: 'backend' (sinkron DB).
  sumber?: 'backend';
  backendId?: number;
  ruanganId?: number;
  ruanganNama?: string;
  alat?: ReservationAlatItem[];
  alasanPenolakan?: string;
  alasanPembatalan?: string;
  statusKode?: string;
  userId?: number;
  username?: string;
}
