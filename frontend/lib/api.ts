// lib/api.ts
//
// Klien HTTP terpusat frontend -> backend Go.
// Backend TIDAK diubah: semua request browser ke /api/* diteruskan
// Next.js rewrites() ke http://127.0.0.1:8080/* (lihat next.config.js).
// Jadi tidak kena blokir CORS dan cookie session_id HttpOnly tetap
// terkirim via credentials:'include'.
//
// Kontrak field disalin persis dari backend (jangan "dirapikan"):
// - auth/reservasi/admin: application/x-www-form-urlencoded
// - laporan: multipart/form-data (foto)
// - status petugas: application/json

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || '/api';

export interface ApiResult<T = unknown> {
  ok: boolean;
  status: number;
  message: string;
  data?: T;
}

interface BackendEnvelope<T = unknown> {
  success?: boolean;
  message?: string;
  data?: T;
  // /user/me memakai key kapital:
  Username?: string;
  Role?: string;
  email?: string;
}

async function parseBody(res: Response): Promise<BackendEnvelope> {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as BackendEnvelope;
  } catch {
    // middleware.Auth gagal membalas plain-text "Unauthorized"/"Forbidden"
    return { message: text };
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<ApiResult<T>> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      credentials: 'include',
      ...init,
      headers: {
        ...(init.headers as Record<string, string> | undefined),
      },
    });
  } catch (e) {
    return {
      ok: false,
      status: 0,
      message:
        e instanceof Error ? e.message : 'Backend tidak terjangkau (pastikan go run . jalan).',
    };
  }
  const body = await parseBody(res);
  const ok = res.ok && (body.success ?? true) === true;
  return {
    ok,
    status: res.status,
    message: body.message || (ok ? 'OK' : `HTTP ${res.status}`),
    data: body.data as T | undefined,
  };
}

function formBody(fields: Record<string, string | number | undefined>): URLSearchParams {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(fields)) {
    if (v !== undefined && v !== '') p.set(k, String(v));
  }
  return p;
}

// ---------- Auth (controller/auth/*.go) ----------

export function backendLogin(email: string, password: string) {
  return apiFetch<never>('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formBody({ email, password }),
  });
}

export interface RegisterMhsInput {
  username: string;
  email: string;
  password: string;
  nim: string;
  angkatan: string;
  nama_lengkap: string;
  prodi: string;
}

export function backendRegisterMhs(input: RegisterMhsInput) {
  return apiFetch<never>('/auth/create_account/mhs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formBody({ ...input }),
  });
}

export interface RegisterDosenInput {
  username: string;
  email: string;
  password: string;
  nidn: string;
  nama_lengkap: string;
  prodi: string;
}

export function backendRegisterDosen(input: RegisterDosenInput) {
  return apiFetch<never>('/auth/create_account/dosen', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formBody({ ...input }),
  });
}

export interface RegisterStaffInput {
  username: string;
  email: string;
  password: string;
  nip: string;
  nama_lengkap: string;
}

export function backendRegisterStaff(input: RegisterStaffInput) {
  return apiFetch<never>('/auth/create_account/staff', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formBody({ ...input }),
  });
}

export type BackendRole = '1' | '2' | '3';

export interface BackendMe {
  id?: number;
  username: string;
  email: string;
  role: BackendRole;
}

export async function backendMe(): Promise<ApiResult<BackendMe>> {
  const raw = await apiFetch<BackendMe & { Username?: string; Role?: string }>('/user/me');
  if (!raw.ok) return raw as ApiResult<BackendMe>;
  // Normalisasi key kapital milik controller/user/me.go
  const data = raw.data as Record<string, unknown> | undefined;
  const username =
    (data?.['Username'] as string | undefined) ??
    (data?.['username'] as string | undefined) ??
    '';
  const role = ((data?.['Role'] as string | undefined) ?? (data?.['role'] as string | undefined) ?? '') as BackendRole;
  const email = (data?.['email'] as string | undefined) ?? '';
  return { ...raw, data: { username, email, role } };
}

// ---------- Publik (controller/fasilitas/list.go, controller/akademik) ----------

export interface BackendFasilitas {
  id: string;
  ref_id: number;
  tipe: string;
  name: string;
  type: string;
  loc: string;
  cap: number;
  desc: string;
  amenities: string[];
  status: string;
  image?: string | null;
}

export function backendListFasilitas(tipe?: 'ruangan' | 'alat') {
  const q = tipe ? `?tipe=${tipe}` : '';
  return apiFetch<BackendFasilitas[]>(`/fasilitas${q}`);
}

export function backendListRuangan() {
  return apiFetch<BackendFasilitas[]>('/fasilitas/ruangan');
}

export function backendListAlat() {
  return apiFetch<BackendFasilitas[]>('/fasilitas/alat');
}

// ---------- Reservasi (controller/reservasi/*.go, routes/router.go) ----------

export interface CreateReservasiRuanganInput {
  ruangan_reservasi: number;
  waktu_peminjaman: string; // "YYYY-MM-DD HH:MM:SS"
  waktu_peminjaman_selesai: string; // "YYYY-MM-DD HH:MM:SS"
  alasan_peminjaman: string;
}

export function backendCreateReservasiRuangan(input: CreateReservasiRuanganInput) {
  return apiFetch<never>('/reservasi/create_reservasi/ruangan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formBody({ ...input }),
  });
}

export interface CreateReservasiAlatInput {
  alat_reservasi: number;
  waktu_peminjaman: string;
  waktu_peminjaman_selesai: string;
  alasan_peminjaman: string;
  jumlah_peminjaman: number;
}

export function backendCreateReservasiAlat(input: CreateReservasiAlatInput) {
  return apiFetch<never>('/reservasi/create_reservasi/alat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formBody({ ...input }),
  });
}

export function backendListReservasiRuangan(limit = 50) {
  return apiFetch<Record<string, unknown>[]>(`/reservasi/list_reservasi/ruangan?limit=${limit}`);
}

export function backendListReservasiAlat(limit = 50) {
  return apiFetch<Record<string, unknown>[]>(`/reservasi/list_reservasi/alat?limit=${limit}`);
}

// Konverter form frontend -> body backend (frontend-only, tanpa ubah Go).
// Memakai koordinat backend yang dibawa model Facility (`refId` + `tipe`,
// diteruskan dari GET /fasilitas) — tanpa parse string id.
// Fasilitas seed lokal tidak punya keduanya -> 'unsupported'.
export interface BackendKoordinat {
  refId?: number;
  tipe?: 'ruangan' | 'alat';
}

export type CreateReservasiBody =
  | { kind: 'ruangan'; body: CreateReservasiRuanganInput }
  | { kind: 'alat'; body: CreateReservasiAlatInput }
  | { kind: 'unsupported'; reason: string };

export function toCreateReservasiBody(
  facility: BackendKoordinat,
  tanggal: string,
  start: string,
  end: string,
  tujuan: string,
  peserta?: number,
): CreateReservasiBody {
  if (!tanggal || !start || !end || end <= start) {
    return { kind: 'unsupported', reason: 'Rentang waktu tidak valid.' };
  }
  const alasan = tujuan.trim();
  if (!alasan) {
    return { kind: 'unsupported', reason: 'Tujuan penggunaan wajib diisi.' };
  }
  const refId = facility.refId;
  const tipe = facility.tipe;
  if (typeof refId !== 'number' || !Number.isInteger(refId) || refId <= 0 || !tipe) {
    return {
      kind: 'unsupported',
      reason: 'Fasilitas ini data demo lokal dan tidak tersedia di backend.',
    };
  }
  const waktu_peminjaman = `${tanggal} ${start}:00`;
  const waktu_peminjaman_selesai = `${tanggal} ${end}:00`;
  if (tipe === 'alat') {
    return {
      kind: 'alat',
      body: {
        alat_reservasi: refId,
        waktu_peminjaman,
        waktu_peminjaman_selesai,
        alasan_peminjaman: alasan,
        jumlah_peminjaman: peserta && peserta >= 1 ? Math.floor(peserta) : 1,
      },
    };
  }
  return {
    kind: 'ruangan',
    body: {
      ruangan_reservasi: refId,
      waktu_peminjaman,
      waktu_peminjaman_selesai,
      alasan_peminjaman: alasan,
    },
  };
}

export type LaporanTarget =
  | { kind: 'ruangan'; ruangan_id: number }
  | { kind: 'alat'; alat_id: number }
  | { kind: 'unsupported'; reason: string };

// Tepat satu dari ruangan_id / alat_id wajib terisi (backend 400 jika tidak).
export function parseLaporanTarget(facility: BackendKoordinat): LaporanTarget {
  const refId = facility.refId;
  const tipe = facility.tipe;
  if (typeof refId !== 'number' || !Number.isInteger(refId) || refId <= 0 || !tipe) {
    return {
      kind: 'unsupported',
      reason: 'Fasilitas ini data demo lokal dan tidak tersedia di backend.',
    };
  }
  if (tipe === 'alat') return { kind: 'alat', alat_id: refId };
  return { kind: 'ruangan', ruangan_id: refId };
}

// ---------- Laporan (controller/report/*, controller/petugas/report/*) ----------

export const REPORT_KATEGORI = ['Kebersihan', 'AC/Pendingin', 'Elektronik', 'Lainnya'] as const;

export interface CreateLaporanInput {
  alasan: string;
  kategori: string;
  ruangan_id?: number;
  alat_id?: number;
  foto?: File;
}

export function backendCreateLaporan(input: CreateLaporanInput) {
  const fd = new FormData();
  fd.set('alasan', input.alasan);
  fd.set('kategori', input.kategori);
  if (input.ruangan_id !== undefined) fd.set('ruangan_id', String(input.ruangan_id));
  if (input.alat_id !== undefined) fd.set('alat_id', String(input.alat_id));
  if (input.foto) fd.set('foto', input.foto);
  return apiFetch<never>('/reports', { method: 'POST', body: fd });
}

export function backendListLaporanSaya() {
  return apiFetch<Record<string, unknown>[]>('/reports');
}

export function backendListSemuaLaporan() {
  return apiFetch<Record<string, unknown>[]>('/petugas/reports');
}

export function backendUpdateLaporan(id: number, status: string, catatan_resolusi = '') {
  return apiFetch<never>(`/petugas/reports/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, catatan_resolusi }),
  });
}

export function backendUpdateFasilitasStatus(id: number, status: string, tipe: 'ruangan' | 'alat' = 'ruangan') {
  return apiFetch<never>(`/petugas/facilities/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, tipe }),
  });
}

// ---------- Admin (controller/admin/*) ----------

export function backendAdminList(path: string, limit = 50) {
  return apiFetch<Record<string, unknown>[]>(`${path}?limit=${limit}`);
}

export function backendAdminPostForm(path: string, fields: Record<string, string | number | undefined>) {
  return apiFetch<never>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formBody(fields),
  });
}

// Deteksi cepat apakah backend hidup (dipakai untuk fallback mock).
export async function backendAvailable(timeoutMs = 2500): Promise<boolean> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE}/fasilitas`, {
      credentials: 'include',
      signal: ctrl.signal,
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(t);
  }
}

export function roleIdToFrontend(role: string): 'admin' | 'petugas' | 'pengguna' {
  if (role === '1') return 'admin';
  if (role === '2') return 'petugas';
  return 'pengguna';
}
