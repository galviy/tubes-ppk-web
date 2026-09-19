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
}

export interface PendingAccount {
  id: number;
  nama: string;
  email: string;
  peran: string;
  status: 'menunggu' | 'diverifikasi' | 'ditolak';
}
