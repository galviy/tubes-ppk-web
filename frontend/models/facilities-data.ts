// models/facilities-data.ts
// Sumber data fasilitas. Saat ini berupa mock array in-memory;
// pada implementasi produksi, ganti FACILITIES di sini dengan hasil
// fetch ke API/database tanpa perlu mengubah komponen tampilan.

import { Facility } from './facility';

export const FACILITIES: Facility[] = [
  {
    id: 'a101',
    name: 'Ruang Kuliah A101',
    type: 'Ruang Kelas',
    loc: 'Gedung A',
    cap: 45,
    desc: 'Ruang kuliah representatif dengan pendingin udara, proyektor ganda, dan whiteboard lebar.',
    amenities: ['AC Sentral', 'Proyektor HD', 'Whiteboard', 'Mikrofon Nirkabel'],
    status: 'avail',
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80',
  },
  {
    id: 'b204',
    name: 'Ruang Kuliah B204',
    type: 'Ruang Kelas',
    loc: 'Gedung B',
    cap: 50,
    desc: 'Ruang perkuliahan interaktif dengan sound system ruang, AC, dan proyektor gantung.',
    amenities: ['AC', 'Proyektor', 'Sound System', 'Koneksi HDMI'],
    status: 'avail',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
  },
  {
    id: 'aula',
    name: 'Aula Utama',
    type: 'Aula',
    loc: 'Gedung Rektorat',
    cap: 350,
    desc: 'Aula serbaguna dengan panggung teater, sound system profesional, dan pendingin sentral.',
    amenities: ['Panggung Utama', 'Sound System Konser', 'AC Sentral', 'Kamera Live Streaming'],
    status: 'avail',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80',
  },
  {
    id: 'lab-ti',
    name: 'Lab Komputer TI-01',
    type: 'Laboratorium',
    loc: 'Gedung TI',
    cap: 40,
    desc: 'Laboratorium komputer spesifikasi tinggi dengan 40 unit PC desktop, gigabit LAN, dan AC.',
    amenities: ['40 PC High-Spec', 'Gigabit LAN', 'AC Sentral', 'Proyektor Epson'],
    status: 'avail',
    image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80',
  },
  {
    id: 'lab-bahasa',
    name: 'Lab Bahasa',
    type: 'Laboratorium',
    loc: 'Gedung C',
    cap: 35,
    desc: 'Laboratorium bahasa multimedia dengan headset peredam bising dan master audio console.',
    amenities: ['Headset Multimedia', 'Audio Console Guru', 'AC', 'Partisi Akustik'],
    status: 'avail',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
  },
  {
    id: 'basket',
    name: 'Lapangan Basket Indoor',
    type: 'Lapangan',
    loc: 'Gedung Olahraga',
    cap: 60,
    desc: 'Gelanggang basket indoor berstandar dengan lantai parquet, ring hidrolik, dan tribun.',
    amenities: ['Lantai Kayu Parquet', 'Papan Skor Digital', 'Tribun Penonton', 'Ruang Ganti'],
    status: 'avail',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80',
  },
  {
    id: 'futsal',
    name: 'Lapangan Futsal',
    type: 'Lapangan',
    loc: 'Outdoor',
    cap: 25,
    desc: 'Lapangan futsal outdoor dengan rumput sintetis standar dan lampu sorot malam hari.',
    amenities: ['Rumput Sintetis', 'Lampu Sorot LED', 'Jaring Pengaman', 'Bench Pemain'],
    status: 'avail',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
  },
  {
    id: 'proj3',
    name: 'Proyektor Portable #3',
    type: 'Alat',
    loc: 'Gedung Rektorat',
    cap: 1,
    desc: 'Unit proyektor portable 4000 lumens dengan kabel HDMI, pointer nirkabel, dan flight case.',
    amenities: ['Tas Flight Case', 'Pointer Nirkabel', 'Kabel HDMI 15m', 'Tripod Screen'],
    status: 'repair',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
  },
];

export const FACILITY_CATEGORIES: string[] = [
  'Semua Jenis',
  'Ruang Kelas',
  'Aula',
  'Laboratorium',
  'Lapangan',
  'Alat',
];

export type FacilityCategory = string;

// Data awal (seed) untuk reservasi & laporan — dipakai untuk mengisi
// AppDataContext saat aplikasi pertama kali dimuat. Pada implementasi
// produksi, ini diganti dengan hasil fetch dari API/database.
import { Reservation } from './reservation';
import { Report, PendingAccount } from './report';

export const SEED_RESERVATIONS: Reservation[] = [
  { id: 101, facilityId: 'a101', pemohon: 'Rangga (Mahasiswa)', tanggal: '2026-09-18', start: '16:00', end: '17:00', tujuan: 'Wisuda mini himpunan', peserta: 40, status: 'menunggu', createdAt: '2026-09-15T09:12:00.000Z' },
  { id: 102, facilityId: 'lab-ti', pemohon: 'Bu Sari (Dosen)', tanggal: '2026-09-18', start: '09:00', end: '10:30', tujuan: 'Praktikum basis data', peserta: 35, status: 'disetujui', createdAt: '2026-09-14T07:40:00.000Z' },
  { id: 103, facilityId: 'b204', pemohon: 'Dimas (Mahasiswa)', tanggal: '2026-09-18', start: '10:30', end: '11:00', tujuan: 'Rapat panitia lomba', peserta: 18, status: 'menunggu', createdAt: '2026-09-16T14:05:00.000Z' },
];

export const SEED_REPORTS: Report[] = [
  { id: 201, facilityId: 'proj3', pelapor: 'Dr. Sinta (Dosen)', kategori: 'Elektronik', deskripsi: 'Lampu proyektor redup, kemungkinan mendekati akhir usia pakai.', foto: 'IMG_4021.jpg', status: 'diproses', catatan: '', createdAt: '2026-09-17T08:30:00.000Z' },
  { id: 202, facilityId: 'futsal', pelapor: 'Andi (Mahasiswa)', kategori: 'Lainnya', deskripsi: 'Gawang sedikit goyang di sisi timur lapangan.', status: 'baru', catatan: '', createdAt: '2026-09-18T10:15:00.000Z' },
];

export const SEED_PENDING_ACCOUNTS: PendingAccount[] = [
  {
    id: 301,
    nama: 'Putri Ayu',
    username: 'putriayu',
    email: 'putri@students.undip.ac.id',
    nim: '24060122140055',
    angkatan: 2022,
    prodi: 'Informatika',
    phone: '081234567891',
    peran: 'Mahasiswa',
    fakultas: 'Fakultas Sains dan Matematika (FSM)',
    status: 'menunggu',
  },
  {
    id: 302,
    nama: 'Dr. Hendra Saputra, M.T.',
    username: 'hendra_dosen',
    email: 'hendra@lecturer.undip.ac.id',
    nidn: '0012058001',
    prodi: 'Informatika',
    phone: '081298765432',
    peran: 'Dosen',
    fakultas: 'Fakultas Teknik (FT)',
    status: 'menunggu',
  },
  {
    id: 303,
    nama: 'Bambang Irawan, S.E.',
    username: 'bambang1987',
    email: 'bambang@staff.undip.ac.id',
    nip: '198705142012051002',
    phone: '081390123456',
    peran: 'Staf',
    fakultas: 'Fakultas Teknik (FT)',
    status: 'menunggu',
  },
];
