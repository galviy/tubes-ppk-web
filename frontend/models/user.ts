// models/user.ts
// Tipe peran + akun backend. Tidak ada lagi data palsu: peran berasal
// dari backend (role "1"/"2"/"3") dan daftar akun dari
// GET /admin/show_user ({id, username, email, role}).

export type UserRole = 'pengguna' | 'petugas' | 'admin';

export function roleIdToUserRole(role: string | number): UserRole {
  if (role === '1' || role === 1) return 'admin';
  if (role === '2' || role === 2) return 'petugas';
  return 'pengguna';
}

export interface BackendAccount {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  isVerified?: boolean;
  status?: 'aktif' | 'nonaktif';
}

export function mapBackendAccount(row: Record<string, unknown>): BackendAccount | null {
  const id = typeof row['id'] === 'number' ? row['id'] : Number(row['id']);
  if (!Number.isFinite(id)) return null;
  const username = typeof row['username'] === 'string' ? (row['username'] as string) : '';
  const email = typeof row['email'] === 'string' ? (row['email'] as string) : '';
  const rawVer = row['is_verified'];
  const isVerified =
    typeof rawVer === 'number' ? rawVer === 1 : typeof rawVer === 'boolean' ? rawVer : undefined;
  const status: 'aktif' | 'nonaktif' = isVerified === false ? 'nonaktif' : 'aktif';
  return { id, username, email, role: roleIdToUserRole(String(row['role'] ?? '')), isVerified, status };
}

// Hasil login — user dibentuk dari GET /user/me pasca POST /auth/login.
export interface AuthResult {
  ok: boolean;
  user?: { id: string; nama: string; email: string; role: UserRole };
  message?: string;
}

// Input registrasi mandiri (mhs/dosen/staf) -> POST /auth/create_account/*.
export interface SelfRegisterInput {
  username?: string;
  nama: string;
  email: string;
  password?: string;
  nim?: string;
  nidn?: string;
  nip?: string;
  angkatan?: number | string;
  prodi?: string;
  phone?: string;
  peran: string; // "Mahasiswa" | "Dosen" | "Staf"
  fakultas?: string;
}
