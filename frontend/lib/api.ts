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

// identifier dikirim lewat field backend "email"; backend login menerima
// nilai itu sebagai email maupun username (selagi kompatibel dengan klien lama).
export function backendLogin(identifier: string, password: string) {
  return apiFetch<never>('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formBody({ email: identifier, password }),
  });
}

export function backendLogout() {
  return apiFetch<never>('/auth/logout', {
    method: 'POST',
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
  jumlah_tersedia?: number;
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
  jumlah_peserta: number;
  alat?: Array<{ alat_id: number; jumlah: number }>;
}

export function backendCreateReservasiRuangan(input: CreateReservasiRuanganInput) {
  const p = new URLSearchParams();
  p.set('ruangan_reservasi', String(input.ruangan_reservasi));
  p.set('waktu_peminjaman', input.waktu_peminjaman);
  p.set('waktu_peminjaman_selesai', input.waktu_peminjaman_selesai);
  p.set('alasan_peminjaman', input.alasan_peminjaman);
  p.set('jumlah_peserta', String(input.jumlah_peserta));

  if (input.alat && input.alat.length > 0) {
    for (const item of input.alat) {
      p.append('alat_reservasi[]', String(item.alat_id));
      p.append('jumlah_peminjaman[]', String(item.jumlah));
    }
  }

  return apiFetch<never>('/reservasi/create_reservasi/ruangan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: p,
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

export function backendListReservasi(params?: { status?: string; limit?: number; page?: number }) {
  const q = new URLSearchParams();
  if (params?.status) q.set('status', params.status);
  if (params?.limit) q.set('limit', String(params.limit));
  if (params?.page) q.set('page', String(params.page));
  const qs = q.toString() ? `?${q.toString()}` : '';
  return apiFetch<Record<string, unknown>[]>(`/reservasi${qs}`);
}

export function backendListReservasiRuangan(limit = 50) {
  return apiFetch<Record<string, unknown>[]>(`/reservasi/ruangan?limit=${limit}`);
}

export function backendListReservasiAlat(limit = 50) {
  return apiFetch<Record<string, unknown>[]>(`/reservasi/alat?limit=${limit}`);
}

export function backendDetailReservasi(id: number) {
  return apiFetch<Record<string, unknown>>(`/reservasi/${id}`);
}

export function backendCancelReservasi(id: number, alasan_pembatalan: string) {
  return apiFetch<never>(`/reservasi/${id}/cancel`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ alasan_pembatalan }),
  });
}

export function backendListPetugasReservasi(params?: {
  tipe?: 'ruangan' | 'alat';
  status?: string;
  limit?: number;
  page?: number;
}) {
  const q = new URLSearchParams();
  if (params?.tipe) q.set('tipe', params.tipe);
  if (params?.status) q.set('status', params.status);
  if (params?.limit) q.set('limit', String(params.limit));
  if (params?.page) q.set('page', String(params.page));
  const qs = q.toString() ? `?${q.toString()}` : '';
  return apiFetch<Record<string, unknown>[]>(`/petugas/reservasi${qs}`);
}

export function backendPetugasUpdateReservasi(
  id: number,
  status: 'disetujui' | 'ditolak',
  alasan_penolakan = '',
) {
  return apiFetch<never>(`/petugas/reservasi/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, alasan_penolakan }),
  });
}

export function backendPetugasCancelReservasi(id: number, alasan_pembatalan: string) {
  return apiFetch<never>(`/petugas/reservasi/${id}/cancel`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ alasan_pembatalan }),
  });
}

export function backendPetugasDashboardCount() {
  return apiFetch<{ reservasi_menunggu: number; laporan_baru: number }>('/petugas/dashboard/count');
}

// ---------- Jadwal (controller/fasilitas/ketersediaan.go) ----------

export type SlotStatusBackend = 'tersedia' | 'menunggu' | 'terpakai' | 'nonaktif';

export interface BackendJadwalSlot {
  mulai: string;
  selesai: string;
  tersedia: boolean;
  status: SlotStatusBackend;
}

export interface BackendJadwalHari {
  tanggal: string;
  slot: BackendJadwalSlot[];
}

export interface BackendJadwalFasilitas {
  id: string;
  ref_id: number;
  tipe: 'ruangan' | 'alat';
  nama: string;
  lokasi: string;
  hari: BackendJadwalHari[];
}

export function backendJadwalFasilitas(params: {
  tanggal: string;
  tipe?: 'ruangan' | 'alat';
  hari?: number;
}) {
  const q = new URLSearchParams();
  q.set('tanggal', params.tanggal);
  if (params.tipe) q.set('tipe', params.tipe);
  if (params.hari) q.set('hari', String(params.hari));
  return apiFetch<BackendJadwalFasilitas[]>(`/jadwal?${q.toString()}`);
}

export function mapJadwalStatus(v: unknown): SlotStatusBackend {
  switch (String(v ?? '').toLowerCase()) {
    case 'terpakai':
      return 'terpakai';
    case 'menunggu':
      return 'menunggu';
    case 'nonaktif':
      return 'nonaktif';
    default:
      return 'tersedia';
  }
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
  alat?: Array<{ alat_id: number; jumlah: number }>,
): CreateReservasiBody {
  if (!tanggal || !start || !end || end <= start) {
    return { kind: 'unsupported', reason: 'Rentang waktu tidak valid.' };
  }
  const alasan = tujuan.trim();
  if (!alasan) {
    return { kind: 'unsupported', reason: 'Tujuan penggunaan wajib diisi.' };
  }
  if (alasan.length > 255) {
    return { kind: 'unsupported', reason: 'Alasan peminjaman maksimal 255 karakter.' };
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
      jumlah_peserta: peserta && peserta >= 1 ? Math.floor(peserta) : 1,
      alat: alat && alat.length > 0 ? alat : undefined,
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
  if (!mulai || !selesai) return { tanggal: '', start: '', end: '' };

  // Ambil angka YYYY-MM-DD dan HH:mm langsung dari string agar tidak tergeser zona waktu (+7 jam WIB)
  const matchS = mulai.match(/(\d{4})-(\d{1,2})-(\d{1,2})[T ](\d{1,2}):(\d{1,2})/);
  const matchE = selesai.match(/(\d{4})-(\d{1,2})-(\d{1,2})[T ](\d{1,2}):(\d{1,2})/);

  if (matchS && matchE) {
    const tanggal = `${matchS[1]}-${pad2(Number(matchS[2]))}-${pad2(Number(matchS[3]))}`;
    const start = `${pad2(Number(matchS[4]))}:${pad2(Number(matchS[5]))}`;
    const end = `${pad2(Number(matchE[4]))}:${pad2(Number(matchE[5]))}`;
    return { tanggal, start, end };
  }

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

function field(row: Record<string, unknown>, ...keys: string[]): unknown {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null) return row[key];
  }
  return undefined;
}

function isoDate(v: unknown): string {
  const value = str(v);
  if (!value) return new Date().toISOString();
  const hasZone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value);
  const normalized = hasZone
    ? value
    : /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? `${value}T00:00:00Z`
    : `${value.replace(' ', 'T')}Z`;
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

export type FrontendReservasiStatus = 'menunggu' | 'disetujui' | 'ditolak' | 'dibatalkan' | 'selesai';

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
    case 'DONE':
    case 'SELESAI':
      return 'selesai';
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
  cancelledAt?: string;
  catatanBatal: string;
  pemohon?: string;
  ruanganId?: number;
  ruanganNama?: string;
  alat?: { id: number; nama: string; jumlah: number }[];
  statusKode?: string;
  userId?: number;
}

// Mapper universal yang mendukung respons controller/reservasi/*.go baru maupun lawas
export function mapBackendReservasi(row: Record<string, unknown>): MappedReservasi | null {
  const id = num(field(row, 'id', 'Id', 'ID', 'reservasi_id', 'ReservasiId'));
  if (id === undefined) return null;

  const ruanganId = num(field(row, 'ruangan_id', 'Ruangan_reservasi', 'RuanganId', 'RuanganReservasi'));
  const alatRaw = field(row, 'alat', 'Alat');
  const alatList = Array.isArray(alatRaw)
    ? alatRaw
        .map((item) => {
          if (!item || typeof item !== 'object') return null;
          const alat = item as Record<string, unknown>;
          const alatId = num(field(alat, 'id', 'Id', 'id_alat', 'IdAlat', 'AlatId'));
          if (alatId === undefined) return null;
          return {
            id: alatId,
            nama: str(field(alat, 'nama', 'Nama', 'nama_alat', 'NamaAlat')),
            jumlah: num(field(alat, 'jumlah', 'Jumlah', 'jumlah_peminjaman', 'JumlahPeminjaman')) ?? 0,
          };
        })
        .filter((item): item is { id: number; nama: string; jumlah: number } => item !== null)
    : [];
  const alatId =
    num(field(row, 'alat_id', 'Alat_reservasi', 'AlatId', 'AlatReservasi')) ??
    (alatList.length > 0 ? num(alatList[0].id) : undefined);

  let facilityId = '';
  if (ruanganId !== undefined && ruanganId > 0) {
    facilityId = `ruangan-${ruanganId}`;
  } else if (alatId !== undefined && alatId > 0) {
    facilityId = `alat-${alatId}`;
  } else {
    facilityId = 'ruangan-0';
  }

  const t = splitBackendWaktu(
    str(field(row, 'waktu_peminjaman', 'Waktu_peminjaman', 'WaktuPeminjaman')),
    str(field(row, 'waktu_peminjaman_selesai', 'Waktu_peminjaman_selesai', 'WaktuPeminjamanSelesai')),
  );
  const dibuat = field(row, 'waktu_reservasi_dibuat', 'Waktu_reservasi_dibuat', 'WaktuReservasiDibuat');

  const pesertaNum =
    num(field(row, 'jumlah_peserta', 'Jumlah_peserta', 'JumlahPeserta')) ??
    (alatList.length > 0 ? num(alatList[0].jumlah) : num(field(row, 'Jumlah', 'jumlah')));

  const alasanPenolakan = str(field(row, 'alasan_penolakan', 'Alasan_penolakan', 'AlasanPenolakan'));
  const alasanPembatalan = str(field(row, 'alasan_pembatalan', 'Alasan_pembatalan', 'AlasanPembatalan'));
  const waktuDibatalkan = field(row, 'waktu_dibatalkan', 'Waktu_dibatalkan', 'WaktuDibatalkan');
  const catatanBatal = alasanPenolakan || alasanPembatalan || '';

  const statusRaw = field(row, 'status', 'status_kode', 'Status_reservasi', 'StatusReservasi', 'Status');

  return {
    id,
    backendId: id,
    facilityId,
    tanggal: t.tanggal,
    start: t.start,
    end: t.end,
    tujuan: str(field(row, 'alasan_peminjaman', 'Alasan_peminjaman', 'AlasanPeminjaman')),
    peserta: pesertaNum,
    status: mapReservasiStatus(statusRaw),
    createdAt: isoDate(dibuat),
    cancelledAt: waktuDibatalkan ? isoDate(waktuDibatalkan) : undefined,
    catatanBatal,
    pemohon: str(field(row, 'username', 'Username', 'pemohon', 'Pemohon')),
    ruanganId,
    ruanganNama: str(field(row, 'ruangan_nama', 'Ruangan_nama', 'RuanganNama')) || undefined,
    alat: alatList,
    statusKode: str(field(row, 'status_kode', 'Status_kode', 'StatusKode')),
    userId: num(field(row, 'user_id', 'UserId', 'UserReservasi')),
  };
}

export function mapReservasiRuangan(row: Record<string, unknown>): MappedReservasi | null {
  return mapBackendReservasi(row);
}

export function mapReservasiAlat(row: Record<string, unknown>): MappedReservasi | null {
  return mapBackendReservasi(row);
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
  const id = num(field(row, 'id', 'Id', 'ID', 'report_id', 'ReportId'));
  if (id === undefined) return null;
  const rRuangan = num(field(row, 'report_ruangan', 'ReportRuangan', 'Report_ruangan'));
  const rAlat = num(field(row, 'report_alat', 'ReportAlat', 'Report_alat'));
  let facilityId = '';
  if (rRuangan !== undefined) facilityId = `ruangan-${rRuangan}`;
  else if (rAlat !== undefined) facilityId = `alat-${rAlat}`;
  else return null;
  const dibuat = field(row, 'waktu_dibuat', 'Waktu_dibuat', 'WaktuDibuat');
  const foto = field(row, 'foto', 'Foto');
  const pelaporNama = field(row, 'username_report', 'UsernameReport');
  return {
    id,
    backendId: id,
    facilityId,
    kategori: str(field(row, 'kategori_laporan', 'KategoriLaporan')),
    deskripsi: str(field(row, 'alasan', 'Alasan')),
    foto: typeof foto === 'string' && foto ? foto : undefined,
    pelaporNama:
      typeof pelaporNama === 'string' && pelaporNama ? pelaporNama : undefined,
    status: mapReportStatus(field(row, 'status_laporan', 'StatusLaporan')),
    catatan: str(field(row, 'catatan_resolusi', 'CatatanResolusi')),
    createdAt: isoDate(dibuat),
  };
}

// URL tampil foto bukti: dinormalisasi ke slash + dilewatkan proxy /api
// agar origin + cookie konsisten. Mendukung nama file murni, path uploads/,
// ataupun path URL absolut.
export function reportFotoUrl(foto?: string): string | undefined {
  if (!foto || typeof foto !== 'string') return undefined;
  const trimmed = foto.trim();
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return undefined;
  if (trimmed.startsWith('data:') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  const clean = trimmed.replace(/\\/g, '/').replace(/^\/+/, '');
  if (!clean) return undefined;
  if (clean.startsWith('api/')) {
    return `/${clean}`;
  }
  if (clean.startsWith('uploads/')) {
    return `${API_BASE}/${clean}`;
  }
  return `${API_BASE}/uploads/${clean}`;
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

export interface BackendProdi {
  id: number;
  nama_prodi: string;
  fakultas_id?: number;
  nama_fakultas?: string;
}

export interface BackendFakultas {
  id: number;
  nama_fakultas: string;
  prodi?: Array<{ id: number; nama_prodi: string }>;
}

export function backendListProdi() {
  return apiFetch<BackendProdi[]>('/prodi');
}

export function backendListFakultas() {
  return apiFetch<BackendFakultas[]>('/fakultas');
}

// ---------- Dashboard Overview & Exports ----------

export interface BackendDashboardOverview {
  fasilitas: {
    total: number;
    ruangan: number;
    alat: number;
    aktif: number;
    dalam_perbaikan: number;
    nonaktif: number;
  };
  reservasi: {
    total: number;
    menunggu: number;
    disetujui: number;
    ditolak: number;
    dibatalkan: number;
    selesai: number;
  };
  laporan: {
    total: number;
    baru: number;
    diproses: number;
    selesai: number;
    ditolak: number;
  };
  pengguna: {
    total: number;
    terverifikasi: number;
    menunggu_verifikasi: number;
    mahasiswa: number;
    dosen: number;
    staff: number;
    petugas: number;
    admin: number;
  };
  okupansi: {
    total_jam_pemakaian: number;
    total_disetujui: number;
  };
}

export function backendGetDashboardOverview() {
  return apiFetch<BackendDashboardOverview>('/dashboard/overview');
}

export async function backendDownloadOccupancyExport(
  format: 'pdf' | 'excel' | 'csv',
  mode = 'semua',
  gedung = '',
  fasilitasId = '',
  filename?: string
): Promise<boolean> {
  const p = new URLSearchParams();
  p.set('format', format);
  if (mode) p.set('mode', mode);
  if (gedung && gedung !== 'Pilih') p.set('gedung', gedung);
  if (fasilitasId && fasilitasId !== 'Pilih') p.set('fasilitas_id', fasilitasId);

  try {
    const res = await fetch(`${API_BASE}/dashboard/occupancy/export?${p.toString()}`, {
      credentials: 'include',
    });
    if (!res.ok) return false;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `rekap-okupansi.${format === 'excel' ? 'xls' : format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  } catch {
    return false;
  }
}

export async function backendDownloadReportsExport(
  format: 'pdf' | 'csv' = 'pdf',
  status = '',
  kategori = '',
  q = '',
  filename = 'rekap-laporan.pdf'
): Promise<boolean> {
  const p = new URLSearchParams();
  p.set('format', format);
  if (status && status !== 'semua') p.set('status', status);
  if (kategori && kategori !== 'semua') p.set('kategori', kategori);
  if (q) p.set('q', q);

  try {
    const res = await fetch(`${API_BASE}/reports/export?${p.toString()}`, {
      credentials: 'include',
    });
    if (!res.ok) return false;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  } catch {
    return false;
  }
}

export async function backendDownloadAkunExport(
  format: 'pdf' | 'csv' = 'pdf',
  role = '',
  q = '',
  filename = 'rekap-akun.pdf'
): Promise<boolean> {
  const p = new URLSearchParams();
  p.set('format', format);
  if (role && role !== 'semua') p.set('role', role);
  if (q) p.set('q', q);
  return downloadBlob(`${API_BASE}/users/export?${p.toString()}`, filename);
}

export async function backendDownloadReservasiExport(
  format: 'pdf' | 'csv' = 'pdf',
  status = '',
  tipe = '',
  dari = '',
  sampai = '',
  fasilitas = '',
  q = '',
  filename = 'rekap-reservasi.pdf'
): Promise<boolean> {
  const p = new URLSearchParams();
  p.set('format', format);
  if (status && status !== 'semua') p.set('status', status);
  if (tipe && tipe !== 'semua') p.set('tipe', tipe);
  if (dari) p.set('dari', dari);
  if (sampai) p.set('sampai', sampai);
  if (fasilitas && fasilitas !== 'semua') p.set('fasilitas', fasilitas);
  if (q) p.set('q', q);
  return downloadBlob(`${API_BASE}/reservasi/export?${p.toString()}`, filename);
}

async function downloadBlob(url: string, filename: string): Promise<boolean> {
  try {
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) return false;
    const blob = await res.blob();
    const urlObj = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = urlObj;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(urlObj);
    return true;
  } catch {
    return false;
  }
}

// ---------- User Profile & Single Facility ----------

export interface BackendUserDetail {
  id: number;
  username: string;
  email: string;
  role: string;
  is_verified: boolean;
  tipe_user: string;
  nama_lengkap?: string;
  identifier?: string;
  prodi?: string;
  angkatan?: number;
}

export function backendGetUserById(id: number) {
  return apiFetch<BackendUserDetail>(`/users/${id}`);
}

export function backendUpdateUser(id: number, data: { nama_lengkap?: string; email?: string; password?: string; angkatan?: number }) {
  return apiFetch<never>(`/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function backendUpdateUserStatus(id: number, isVerified: boolean) {
  return apiFetch<never>(`/users/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_verified: isVerified }),
  });
}

export function backendGetFacilityById(id: string | number) {
  return apiFetch<BackendFasilitas>(`/fasilitas/${id}`);
}

