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

// Body mentah (flat) untuk endpoint yang TIDAK membungkus dalam {data},
// mis. GET /user/me -> {"Role","Username","email","success"}.
export async function fetchRawBody(path: string): Promise<{
  status: number;
  okHttp: boolean;
  body: BackendEnvelope & Record<string, unknown>;
}> {
  const res = await fetch(`${API_BASE}${path}`, { credentials: 'include' });
  const body = (await parseBody(res)) as BackendEnvelope & Record<string, unknown>;
  return { status: res.status, okHttp: res.ok, body };
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
  // /user/me mengembalikan field FLAT di top-level body
  // ({"Role","Username","email","success"}) — BUKAN envelope {data}.
  // Jangan baca via apiFetch().data (selalu undefined di sini).
  let raw: { status: number; okHttp: boolean; body: BackendEnvelope & Record<string, unknown> };
  try {
    raw = await fetchRawBody('/user/me');
  } catch (e) {
    return {
      ok: false,
      status: 0,
      message: e instanceof Error ? e.message : 'Backend tidak terjangkau.',
    };
  }
  const b = raw.body;
  const success = (b['success'] as boolean | undefined) ?? true;
  if (!raw.okHttp || success !== true) {
    const msg =
      typeof b['message'] === 'string' && b['message'] ? b['message'] : `HTTP ${raw.status}`;
    return { ok: false, status: raw.status, message: msg };
  }
  const username =
    (typeof b['Username'] === 'string' && b['Username']) ||
    (typeof b['username'] === 'string' && b['username']) ||
    '';
  const role = (typeof b['Role'] === 'string' && b['Role']) ||
    (typeof b['role'] === 'string' && b['role']) ||
    '';
  const email = typeof b['email'] === 'string' ? b['email'] : '';
  if (!email) {
    return { ok: false, status: raw.status, message: 'Respons /user/me tidak lengkap.' };
  }
  return { ok: true, status: raw.status, message: 'OK', data: { username, email, role: role as BackendRole } };
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

// ---------- Mapper backend -> model frontend ----------

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

// "2026-10-05T08:00:00Z" (atau "YYYY-MM-DD HH:MM:SS") -> {tanggal, start, end}
export function splitBackendWaktu(
  mulai: string,
  selesai: string,
): { tanggal: string; start: string; end: string } {
  const s = new Date(mulai);
  const e = new Date(selesai);
  const valid = !Number.isNaN(s.getTime()) && !Number.isNaN(e.getTime());
  if (!valid) return { tanggal: '', start: '', end: '' };
  const tanggal = `${s.getFullYear()}-${pad2(s.getMonth() + 1)}-${pad2(s.getDate())}`;
  return {
    tanggal,
    start: `${pad2(s.getHours())}:${pad2(s.getMinutes())}`,
    end: `${pad2(e.getHours())}:${pad2(e.getMinutes())}`,
  };
}

function num(v: unknown): number | undefined {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function str(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

export type FrontendReservasiStatus = 'menunggu' | 'disetujui' | 'ditolak' | 'dibatalkan';

export function mapReservasiStatus(s: unknown): FrontendReservasiStatus {
  switch (String(s ?? '').toUpperCase()) {
    case 'APPROVED':
    case 'DISETUJUI':
      return 'disetujui';
    case 'REJECTED':
    case 'DITOLAK':
      return 'ditolak';
    case 'CANCELLED':
    case 'CANCELED':
    case 'DIBATALKAN':
      return 'dibatalkan';
    case 'PENDING':
    case 'MENUNGGU':
    default:
      return 'menunggu';
  }
}

export interface MappedReservasi {
  id: number;
  backendId: number;
  facilityId: string;
  tanggal: string;
  start: string;
  end: string;
  tujuan: string;
  peserta?: number;
  status: FrontendReservasiStatus;
  createdAt: string;
  catatanBatal: string;
}

// Baris GET /reservasi/list_reservasi/ruangan (W-keys + Ruangan_reservasi int).
export function mapReservasiRuangan(row: Record<string, unknown>): MappedReservasi | null {
  const id = num(row['id']);
  const refId = num(row['Ruangan_reservasi']);
  if (id === undefined || refId === undefined) return null;
  const t = splitBackendWaktu(str(row['Waktu_peminjaman']), str(row['Waktu_peminjaman_selesai']));
  const dibuat = str(row['Waktu_reservasi_dibuat']);
  return {
    id,
    backendId: id,
    facilityId: `ruangan-${refId}`,
    tanggal: t.tanggal,
    start: t.start,
    end: t.end,
    tujuan: str(row['Alasan_peminjaman']),
    peserta: undefined,
    status: mapReservasiStatus(row['Status_reservasi']),
    createdAt: dibuat ? new Date(dibuat).toISOString() : new Date().toISOString(),
    catatanBatal: str(row['Alasan_penolakan']),
  };
}

// Baris GET /reservasi/list_reservasi/alat (+ Alat_reservasi int, Jumlah).
export function mapReservasiAlat(row: Record<string, unknown>): MappedReservasi | null {
  const id = num(row['id']);
  const refId = num(row['Alat_reservasi']);
  if (id === undefined || refId === undefined) return null;
  const t = splitBackendWaktu(str(row['Waktu_peminjaman']), str(row['Waktu_peminjaman_selesai']));
  const dibuat = str(row['Waktu_reservasi_dibuat']);
  return {
    id,
    backendId: id,
    facilityId: `alat-${refId}`,
    tanggal: t.tanggal,
    start: t.start,
    end: t.end,
    tujuan: str(row['Alasan_peminjaman']),
    peserta: num(row['Jumlah']),
    status: mapReservasiStatus(row['Status_reservasi']),
    createdAt: dibuat ? new Date(dibuat).toISOString() : new Date().toISOString(),
    catatanBatal: str(row['Alasan_penolakan']),
  };
}

export type FrontendReportStatus = 'baru' | 'diproses' | 'selesai' | 'ditolak';

export function mapReportStatus(s: unknown): FrontendReportStatus {
  switch (String(s ?? '').toLowerCase()) {
    case 'diproses':
      return 'diproses';
    case 'selesai':
      return 'selesai';
    case 'ditolak':
      return 'ditolak';
    case 'baru':
    default:
      return 'baru';
  }
}

export interface MappedReport {
  id: number;
  backendId: number;
  facilityId: string;
  kategori: string;
  deskripsi: string;
  foto?: string;
  pelaporNama?: string;
  status: FrontendReportStatus;
  catatan: string;
  createdAt: string;
}

// Baris GET /reports, GET /petugas/reports(+/{id}) — ReportDetail + nama join.
export function mapBackendReport(row: Record<string, unknown>): MappedReport | null {
  const id = num(row['id']);
  if (id === undefined) return null;
  const rRuangan = num(row['report_ruangan']);
  const rAlat = num(row['report_alat']);
  let facilityId = '';
  if (rRuangan !== undefined) facilityId = `ruangan-${rRuangan}`;
  else if (rAlat !== undefined) facilityId = `alat-${rAlat}`;
  else return null;
  const dibuat = str(row['waktu_dibuat'] ?? row['Waktu_dibuat']);
  const foto = row['foto'];
  const pelaporNama = row['username_report'];
  return {
    id,
    backendId: id,
    facilityId,
    kategori: str(row['kategori_laporan']),
    deskripsi: str(row['alasan']),
    foto: typeof foto === 'string' && foto ? foto : undefined,
    pelaporNama:
      typeof pelaporNama === 'string' && pelaporNama ? pelaporNama : undefined,
    status: mapReportStatus(row['status_laporan']),
    catatan: str(row['catatan_resolusi']),
    createdAt: dibuat ? new Date(dibuat).toISOString() : new Date().toISOString(),
  };
}

// URL tampil foto bukti: dinormalisasi ke slash + dilewatkan proxy /api
// agar origin + cookie konsisten. Kembalikan undefined bila bukan path
// uploads (mis. data-URL cermin lokal — komponen yang menampilkannya
// langsung tanpa helper ini).
export function reportFotoUrl(foto?: string): string | undefined {
  if (!foto || foto.startsWith('data:') || foto.startsWith('http')) return foto || undefined;
  const path = foto.replace(/\\/g, '/').replace(/^\/+/, '');
  if (!path.startsWith('uploads/')) return undefined;
  return `${API_BASE}/${path}`;
}

export type PendingKind = 'mhs' | 'dosen' | 'staff';

export interface MappedPending {
  backendId: number;
  kind: PendingKind;
  nama: string;
  email: string;
  identifier: string; // nim / nidn / nip
  extra?: string; // angkatan / prodi info
}

// Baris GET /admin/show_mhs_pending: {id, nim, nama_lengkap, angkatan, username}
export function mapPendingMhs(row: Record<string, unknown>): MappedPending | null {
  const id = num(row['id']);
  if (id === undefined) return null;
  return {
    backendId: id,
    kind: 'mhs',
    nama: str(row['nama_lengkap']),
    email: '',
    identifier: str(row['nim']),
    extra: str(row['angkatan']),
  };
}

// Baris GET /admin/show_dosen_pending: {id, nidn, nama_lengkap, prodi_dosen}
export function mapPendingDosen(row: Record<string, unknown>): MappedPending | null {
  const id = num(row['id']);
  if (id === undefined) return null;
  return {
    backendId: id,
    kind: 'dosen',
    nama: str(row['nama_lengkap']),
    email: '',
    identifier: str(row['nidn']),
    extra: str(row['prodi_dosen']),
  };
}

// Baris GET /admin/show_staff_pending: {id, nip, nama_lengkap, email}
export function mapPendingStaff(row: Record<string, unknown>): MappedPending | null {
  const id = num(row['id']);
  if (id === undefined) return null;
  return {
    backendId: id,
    kind: 'staff',
    nama: str(row['nama_lengkap']),
    email: str(row['email']),
    identifier: str(row['nip']),
  };
}

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
