// mock/auth-api.ts
//
// Lapisan "API" palsu untuk autentikasi. Bentuknya sengaja dibuat
// seperti pemanggilan API sungguhan (async, return Promise) supaya
// nanti gampang diganti jadi:
//
//   export async function login(email, password) {
//     const res = await fetch('/api/auth/login', { method: 'POST', body: ... });
//     return res.json();
//   }
//
// tanpa perlu mengubah halaman login/register — mereka hanya
// memanggil login()/registerSelf() dan menunggu hasilnya.

import { FAKE_USERS_DB, FakeUserRecord, UserRole } from './fake-users-db';

export interface AuthResult {
  ok: boolean;
  user?: Pick<FakeUserRecord, 'id' | 'nama' | 'email' | 'role'>;
  message?: string;
}

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const match = FAKE_USERS_DB.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
  );

  if (!match) {
    return delay({ ok: false, message: 'Email atau kata sandi salah.' });
  }

  const { id, nama, email: userEmail, role } = match;
  return delay({ ok: true, user: { id, nama, email: userEmail, role } });
}

export interface SelfRegisterInput {
  nama: string;
  email: string;
  peran: string; // "Mahasiswa" | "Dosen" — ditampilkan apa adanya, bukan role sistem
}

export interface SelfRegisterResult {
  ok: boolean;
  message: string;
}

export async function registerSelf(input: SelfRegisterInput): Promise<SelfRegisterResult> {
  if (FAKE_USERS_DB.some((u) => u.email.toLowerCase() === input.email.trim().toLowerCase())) {
    return delay({ ok: false, message: 'Email sudah terdaftar.' });
  }
  // Registrasi mandiri TIDAK langsung membuat akun aktif — masuk ke
  // antrean verifikasi admin dulu (lihat AppDataContext.submitSelfRegistration
  // yang menaruhnya di pendingAccounts). role sistem ('pengguna') baru
  // diberikan setelah admin memverifikasi.
  return delay({ ok: true, message: 'Registrasi terkirim, menunggu verifikasi admin.' });
}

export type { UserRole };
