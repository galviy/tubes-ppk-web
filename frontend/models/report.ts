// models/report.ts
export type ReportStatus = 'baru' | 'diproses' | 'selesai' | 'ditolak';

export interface Report {
  id: number;
  facilityId: string;
  pelapor: string;
  kategori: string;
  deskripsi: string;
  foto?: string;
  status: ReportStatus;
  catatan: string;
  createdAt: string;
  // Sumber baris: 'backend' (sinkron DB).
  sumber?: 'backend';
  backendId?: number;
}

export interface PendingAccount {
  id: number;
  nama: string;
  email: string;
  username?: string;
  nim?: string;
  nidn?: string;
  nip?: string;
  angkatan?: number | string;
  prodi?: string;
  phone?: string;
  peran: string;
  fakultas?: string;
  status: 'menunggu' | 'diverifikasi' | 'ditolak';
  // Baris backend (show_*_pending): id asli DB + tipe pending.
  sumber?: 'backend';
  backendId?: number;
}
