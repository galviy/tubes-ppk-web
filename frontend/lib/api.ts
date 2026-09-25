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
  const id = num(row['id']);
  if (id === undefined) return null;

  const ruanganId = num(row['ruangan_id'] ?? row['Ruangan_reservasi']);
  const alatList = Array.isArray(row['alat'])
    ? (row['alat'] as { id: number; nama: string; jumlah: number }[])
    : [];
  const alatId =
    num(row['alat_id'] ?? row['Alat_reservasi']) ??
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
    str(row['waktu_peminjaman'] ?? row['Waktu_peminjaman']),
    str(row['waktu_peminjaman_selesai'] ?? row['Waktu_peminjaman_selesai']),
  );
  const dibuat = str(row['waktu_reservasi_dibuat'] ?? row['Waktu_reservasi_dibuat']);

  const pesertaNum =
    num(row['jumlah_peserta'] ?? row['Jumlah_peserta']) ??
    (alatList.length > 0 ? num(alatList[0].jumlah) : num(row['Jumlah']));

  const alasanPenolakan = str(row['alasan_penolakan'] ?? row['Alasan_penolakan']);
  const alasanPembatalan = str(row['alasan_pembatalan'] ?? row['Alasan_pembatalan']);
  const catatanBatal = alasanPenolakan || alasanPembatalan || '';

  const statusRaw = row['status'] ?? row['status_kode'] ?? row['Status_reservasi'];

  return {
    id,
    backendId: id,
    facilityId,
    tanggal: t.tanggal,
    start: t.start,
    end: t.end,
    tujuan: str(row['alasan_peminjaman'] ?? row['Alasan_peminjaman']),
    peserta: pesertaNum,
    status: mapReservasiStatus(statusRaw),
    createdAt: dibuat ? new Date(dibuat).toISOString() : new Date().toISOString(),
    catatanBatal,
    pemohon: str(row['username'] ?? row['Username'] ?? ''),
    ruanganId,
    ruanganNama: typeof row['ruangan_nama'] === 'string' ? row['ruangan_nama'] : undefined,
    alat: alatList,
    statusKode: str(row['status_kode']),
    userId: num(row['user_id']),
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
