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
  password: string; // teks biasa — HANYA untuk demo, jangan pernah begini di backend asli
  nama: string;
  role: UserRole;
}

export const FAKE_USERS_DB: FakeUserRecord[] = [
  {
    id: 'u-admin-1',
    email: 'admin@sipinjam.ac.id',
    password: 'admin123',
    nama: 'Admin Sarpras',
    role: 'admin',
  },
  {
    id: 'u-petugas-1',
    email: 'petugas@sipinjam.ac.id',
    password: 'petugas123',
    nama: 'Budi (Petugas Sarpras)',
    role: 'petugas',
  },
  {
    id: 'u-pengguna-1',
    email: 'mahasiswa@sipinjam.ac.id',
    password: 'mhs12345',
    nama: 'Sinta (Mahasiswa)',
    role: 'pengguna',
  },
  {
    id: 'u-pengguna-2',
    email: 'dosen@sipinjam.ac.id',
    password: 'dosen123',
    nama: 'Pak Herman (Dosen)',
    role: 'pengguna',
  },
];
