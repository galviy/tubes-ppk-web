// models/facilities-data.ts
// Sumber data fasilitas. Saat ini berupa mock array in-memory;
// pada implementasi produksi, ganti FACILITIES di sini dengan hasil
// fetch ke API/database tanpa perlu mengubah komponen tampilan.

import { Facility } from './facility';

export const FACILITIES: Facility[] = [
  {
    id: 'aula',
    name: 'Aula Utama',
    type: 'Aula',
    loc: 'Gedung A',
    cap: 300,
    desc: 'Aula serbaguna untuk acara besar.',
    amenities: ['Sound system', 'Proyektor'],
    status: 'avail',
  },
  {
    id: 'lab1',
    name: 'Lab Komputer 1',
    type: 'Laboratorium',
    loc: 'Gedung C',
    cap: 40,
    desc: 'Laboratorium komputer dengan 40 unit PC.',
    amenities: ['40 unit PC', 'AC'],
    status: 'busy',
  },
  {
    id: 'futsal',
    name: 'Lapangan Futsal',
    type: 'Lapangan',
    loc: 'Area Timur',
    cap: 20,
    desc: 'Lapangan futsal outdoor.',
    amenities: ['Lampu sorot'],
    status: 'avail',
  },
  {
    id: 'b201',
    name: 'Ruang Kelas B-201',
    type: 'Ruang Kelas',
    loc: 'Gedung B',
    cap: 50,
    desc: 'Ruang kelas ber-AC dengan proyektor.',
    amenities: ['AC', 'Proyektor'],
    status: 'avail',
  },
  {
    id: 'proj',
    name: 'Proyektor Portable P-01',
    type: 'Alat',
    loc: 'Unit AV',
    cap: 1,
    desc: 'Proyektor portable untuk peminjaman.',
    amenities: ['Portable'],
    status: 'repair',
  },
];

export const FACILITY_CATEGORIES: Array<FacilityCategory> = [
  'Semua Jenis',
  'Ruang Kelas',
  'Aula',
  'Laboratorium',
  'Lapangan',
  'Alat',
];

export type FacilityCategory = Facility['type'] | 'Semua Jenis';

// Data awal (seed) untuk reservasi & laporan — dipakai untuk mengisi
// AppDataContext saat aplikasi pertama kali dimuat. Pada implementasi
// produksi, ini diganti dengan hasil fetch dari API/database.
import { Reservation } from './reservation';
import { Report, PendingAccount } from './report';

export const SEED_RESERVATIONS: Reservation[] = [
  { id: 101, facilityId: 'aula', pemohon: 'Rangga (Mahasiswa)', tanggal: '2026-09-18', start: '16:00', end: '17:00', tujuan: 'Wisuda mini himpunan', peserta: 120, status: 'menunggu', createdAt: '2026-09-15T09:12:00.000Z' },
  { id: 102, facilityId: 'lab1', pemohon: 'Bu Sari (Dosen)', tanggal: '2026-09-18', start: '09:00', end: '10:30', tujuan: 'Praktikum basis data', peserta: 35, status: 'disetujui', createdAt: '2026-09-14T07:40:00.000Z' },
  { id: 103, facilityId: 'b201', pemohon: 'Dimas (Mahasiswa)', tanggal: '2026-09-18', start: '10:30', end: '11:00', tujuan: 'Rapat panitia lomba', peserta: 18, status: 'menunggu', createdAt: '2026-09-16T14:05:00.000Z' },
];

export const SEED_REPORTS: Report[] = [
  { id: 201, facilityId: 'proj', pelapor: 'Sinta (Staf)', kategori: 'Kelistrikan', deskripsi: 'Lampu proyektor redup, kemungkinan mendekati akhir usia pakai.', foto: 'IMG_4021.jpg', status: 'diproses', catatan: '', createdAt: '2026-09-17T08:30:00.000Z' },
  { id: 202, facilityId: 'futsal', pelapor: 'Andi (Mahasiswa)', kategori: 'Lainnya', deskripsi: 'Gawang sedikit goyang di sisi timur lapangan.', status: 'baru', catatan: '', createdAt: '2026-09-18T10:15:00.000Z' },
];

export const SEED_PENDING_ACCOUNTS: PendingAccount[] = [
  { id: 301, nama: 'Putri Ayu', email: 'putri@students.undip.ac.id', peran: 'Mahasiswa', status: 'menunggu' },
];
