// mock/fake-users-db.ts
//
// INI DATA PALSU (bukan database sungguhan). Sengaja dipisah ke folder
// /mock supaya jelas batasnya: kalau nanti sudah ada backend asli,
// file ini (dan mock/auth-api.ts) tinggal dihapus / diganti isinya
// dengan pemanggilan API sungguhan, tanpa perlu mengubah halaman
// login/register atau AppDataContext sama sekali.

export type UserRole = 'pengguna' | 'petugas' | 'admin';

export interface FakeUserRecord {
  id: string;
  email: string;
  username?: string;
  password: string; // teks biasa - HANYA untuk demo, jangan pernah begini di backend asli
  nama: string;
  role: UserRole;
  nip?: string;
  nim?: string;
  nidn?: string;
  angkatan?: number | string;
  prodi?: string;
  phone?: string;
  unit?: string;
  jabatan?: string;
  status?: 'aktif' | 'nonaktif';
  createdAt?: string;
}

export const FAKE_USERS_DB: FakeUserRecord[] = [
  {
    id: 'u-admin-1',
    email: 'admin@sipinjam.ac.id',
    password: 'admin123',
    nama: 'Admin',
    role: 'admin',
    nip: '197805122003121002',
    phone: '08112839485',
    unit: 'Biro Umum & Pengelolaan Aset (BUPA) Undip',
    jabatan: 'Admin',
    status: 'aktif',
    createdAt: '2026-01-10',
  },
  {
    id: 'u-petugas-1',
    email: 'petugas@sipinjam.ac.id',
    password: 'petugas123',
    nama: 'Budi (Petugas)',
    role: 'petugas',
    nip: '198603152010121003',
    phone: '08122938475',
    unit: 'Subbagian Rumah Tangga & Sarpras Undip',
    jabatan: 'Petugas',
    status: 'aktif',
    createdAt: '2026-02-14',
  },
  {
    id: 'u-pengguna-1',
    email: 'mahasiswa@sipinjam.ac.id',
    password: 'mhs12345',
    nama: 'Sinta (Mahasiswa)',
    role: 'pengguna',
    nip: '24060122140123',
    phone: '085712345678',
    unit: 'Fakultas Sains dan Matematika (FSM)',
    jabatan: 'Mahasiswa',
    status: 'aktif',
    createdAt: '2026-03-01',
  },
  {
    id: 'u-pengguna-2',
    email: 'dosen@sipinjam.ac.id',
    password: 'dosen123',
    nama: 'Pak Herman (Dosen)',
    role: 'pengguna',
    nip: '197405121999031001',
    phone: '081329876543',
    unit: 'Fakultas Teknik (FT)',
    jabatan: 'Dosen',
    status: 'aktif',
    createdAt: '2026-02-20',
  },
  {
    id: 'u-pengguna-3',
    email: 'staf@sipinjam.ac.id',
    password: 'staf123',
    nama: 'Dewi (Staf)',
    role: 'pengguna',
    nip: '198904122015042001',
    phone: '085811223344',
    unit: 'Fakultas Sains dan Matematika (FSM)',
    jabatan: 'Staf',
    status: 'aktif',
    createdAt: '2026-03-05',
  },
];
