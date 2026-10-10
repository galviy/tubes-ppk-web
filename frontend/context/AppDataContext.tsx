'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { Facility } from '@/models/facility';
import { Reservation } from '@/models/reservation';
import { Report, PendingAccount } from '@/models/report';
import { getTodayDateString, isSlotBooked } from '@/lib/slots';
import { AuthResult, SelfRegisterInput } from '@/models/user';
import { UserRole, BackendAccount, mapBackendAccount } from '@/models/user';
import {
  backendAdminList,
  backendAdminPostForm,
  backendAvailable,
  backendCancelReservasi,
  backendCreateLaporan,
  backendCreateReservasiAlat,
  backendCreateReservasiRuangan,
  backendJadwalFasilitas,
  backendListFasilitas,
  backendListLaporanSaya,
  backendListPetugasReservasi,
  backendListReservasi,
  backendListReservasiAlat,
  backendListReservasiRuangan,
  backendListSemuaLaporan,
  backendLogin,
  backendLogout,
  backendMe,
  backendPetugasCancelReservasi,
  backendPetugasUpdateReservasi,
  backendRegisterDosen,
  backendRegisterMhs,
  backendRegisterStaff,
  backendUpdateFasilitasStatus,
  backendUpdateLaporan,
  mapBackendReport,
  mapBackendReservasi,
  mapPendingDosen,
  mapPendingMhs,
  mapPendingStaff,
  mapReservasiAlat,
  mapReservasiRuangan,
  parseLaporanTarget,
  REPORT_KATEGORI,
  roleIdToFrontend,
  toCreateReservasiBody,
  type BackendFasilitas,
} from '@/lib/api';

import { isAlatFacility } from '@/models/facilities-data';

function numberFrom(value: unknown): number | undefined {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function mapBackendFasilitas(b: BackendFasilitas): Facility {
  const row = b as unknown as Record<string, unknown>;
  const field = (...keys: string[]) => {
    for (const key of keys) {
      if (row[key] !== undefined && row[key] !== null) return row[key];
    }
    return undefined;
  };
  const id = String(field('id', 'Id', 'ID') ?? '');
  const tipeRaw = String(field('tipe', 'Tipe', 'jenis') ?? '');
  const type = String(field('type', 'Type', 'kategori') ?? '');
  const name = String(field('name', 'Name', 'nama', 'Nama') ?? '');
  const statusRaw = String(field('status', 'Status') ?? 'avail');
  const status = (['avail', 'busy', 'repair', 'nonaktif'] as const).includes(
    statusRaw as Facility['status'],
  )
    ? (statusRaw as Facility['status'])
    : 'avail';
  const isAlat =
    tipeRaw.toLowerCase() === 'alat' ||
    id.startsWith('alat-') ||
    type.toLowerCase() === 'alat' ||
    isAlatFacility({ tipe: tipeRaw, id, type, name });
  const amenitiesRaw = field('amenities', 'Amenities', 'kelengkapan');
  const image = field('image', 'Image', 'foto');
  return {
    id,
    refId: numberFrom(field('ref_id', 'RefId', 'RefID')),
    tipe: isAlat ? 'alat' : 'ruangan',
    name,
    type,
    loc: String(field('loc', 'Loc', 'lokasi', 'Lokasi') ?? ''),
    cap: numberFrom(field('cap', 'Cap', 'kapasitas', 'jumlah_tersedia', 'JumlahTersedia')) ?? 0,
    tersedia: numberFrom(field('jumlah_tersedia', 'JumlahTersedia')),
    desc: String(field('desc', 'Desc', 'deskripsi', 'Deskripsi') ?? ''),
    amenities: Array.isArray(amenitiesRaw) ? amenitiesRaw.map(String) : [],
    status,
    image: typeof image === 'string' ? image : undefined,
  };
}

let nextId = 1000;
function genId() {
  nextId += 1;
  return nextId;
}

export interface DirectRegisterInput {
  nama: string;
  email: string;
  peran: string; // 'Petugas' | 'Admin' | 'Dosen' | 'Mahasiswa' | 'Staf'
  username?: string;
  nim?: string;
  nidn?: string;
  nip?: string;
  angkatan?: number | string;
  prodi?: string;
  phone?: string;
  unit?: string;
  password?: string;
}

export interface LoggedInUser {
  id: string;
  nama: string;
  email: string;
  role: UserRole;
}

interface AppDataValue {
  facilities: Facility[];
  reservations: Reservation[];
  reports: Report[];
  pendingAccounts: PendingAccount[];
  currentUser: LoggedInUser | null;
  /** true jika backend Go terjangkau via /api (proxy rewrites). */
  backendOnline: boolean;
  /** Status sinkronisasi terakhir: bedakan "kosong" vs "gagal memuat". */
  syncStatus: 'idle' | 'loading' | 'ok' | 'partial' | 'error';

  facilityById: (id: string) => Facility | undefined;
  isSlotTaken: (
    facilityId: string,
    slotStart: string,
    excludeId?: number,
    tanggal?: string,
    currentUserIdentifier?: string
  ) => boolean;
  fetchSlotAvailability: (tanggal: string) => Promise<Record<string, Set<string>>>;

  // Auth
  login: (email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  submitSelfRegistration: (
    namaOrInput:
      | string
      | {
          nama: string;
          email: string;
          peran: string;
          username?: string;
          nim?: string;
          nidn?: string;
          nip?: string;
          angkatan?: number | string;
          prodi?: string;
          phone?: string;
          fakultas?: string;
        },
    email?: string,
    peran?: string,
    nim?: string,
    phone?: string,
    fakultas?: string
  ) => Promise<{ ok: boolean; message: string }>;

  // Pengguna
  submitReservation: (
    input: Omit<Reservation, 'id' | 'pemohon' | 'status' | 'createdAt'>
  ) => Promise<{ ok: boolean; message?: string }>;
  cancelReservation: (id: number, alasan: string) => Promise<{ ok: boolean; message?: string }>;
  submitReport: (
    input: Omit<Report, 'id' | 'pelapor' | 'status' | 'catatan' | 'createdAt'> & {
      fotoFile?: File | null;
      fotoBase64?: string | null;
    }
  ) => Promise<{ ok: boolean; message?: string }>;

  // Petugas
  updateReportStatus: (
    id: number,
    status: Report['status'],
    catatan?: string
  ) => Promise<{ ok: boolean; message?: string }>;
  updateReservationStatus: (
    id: number,
    status: 'disetujui' | 'ditolak',
    alasanPenolakan?: string
  ) => Promise<{ ok: boolean; message?: string }>;
  petugasCancelReservation: (
    id: number,
    alasan: string
  ) => Promise<{ ok: boolean; message?: string }>;
  setFacilityStatus: (
    facilityId: string,
    status: Facility['status']
  ) => Promise<{ ok: boolean; message?: string }>;

  // Admin
  registeredAccounts: BackendAccount[];
  addFacility: (
    input: Omit<Facility, 'id' | 'status'> & { tipeSarana?: 'ruangan' | 'alat' }
  ) => Promise<{ ok: boolean; message?: string }>;
  updateFacility: (
    id: string,
    input: Omit<Facility, 'id' | 'status'>
  ) => Promise<{ ok: boolean; message?: string }>;
  deleteFacility: (id: string) => Promise<{ ok: boolean; message?: string }>;
  registerAccountDirectly: (
    input: DirectRegisterInput
  ) => Promise<{ ok: boolean; message?: string; account?: BackendAccount }>;
  toggleAccountStatus: (id: number) => Promise<{ ok: boolean; message?: string }>;
  verifyPendingAccount: (id: number, approve: boolean) => Promise<{ ok: boolean; message?: string }>;
  deleteAccount: (id: number) => Promise<{ ok: boolean; message?: string }>;

  // Sinkronisasi dari backend (server menang, seed dibuang).
  refreshReservations: () => Promise<boolean>;
  refreshReportsMine: () => Promise<boolean>;
  refreshPetugasReports: () => Promise<boolean>;
  refreshPendingAccounts: () => Promise<boolean>;
  refreshFacilities: () => Promise<boolean>;
  refreshAccounts: () => Promise<boolean>;
}

const AppDataContext = createContext<AppDataValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [pendingAccounts, setPendingAccounts] = useState<PendingAccount[]>([]);
  const [registeredAccounts, setRegisteredAccounts] = useState<BackendAccount[]>([]);
  const [currentUser, setCurrentUser] = useState<LoggedInUser | null>(null);
  const [backendOnline, setBackendOnline] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'loading' | 'ok' | 'partial' | 'error'>('idle');
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, Record<string, Set<string>>>>({});

  const fetchSlotAvailability = useCallback(
    async (tanggal: string): Promise<Record<string, Set<string>>> => {
      if (!tanggal) return {};
      try {
        const res = await backendJadwalFasilitas({ tanggal, hari: 1 });
        if (res.ok && Array.isArray(res.data)) {
          const map: Record<string, Set<string>> = {};
          for (const item of res.data as Array<{
            id: string;
            ref_id?: number;
            tipe?: string;
            hari?: Array<{ slot?: Array<{ mulai: string; tersedia: boolean }> }>;
          }>) {
            const slots = new Set<string>();
            for (const h of item.hari || []) {
              for (const s of h.slot || []) {
                if (!s.tersedia) slots.add(s.mulai);
              }
            }
            if (item.id) map[item.id] = slots;
            if (item.ref_id && item.tipe) {
              map[`${item.tipe}-${item.ref_id}`] = slots;
              map[String(item.ref_id)] = slots;
            }
          }
          setAvailabilityMap((prev) => ({ ...prev, [tanggal]: map }));
          return map;
        }
        return {};
      } catch {
        return {};
      }
    },
    [],
  );

  // Backend-first untuk katalog publik (tanpa auth): jika Go hidup,
  // ganti seed lokal dengan data MySQL. Jika mati, tetap pakai seed
  // supaya UI tidak blank (fallback mock).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let up = false;
      for (let attempt = 0; attempt < 4 && !cancelled; attempt += 1) {
        up = await backendAvailable();
        if (up) break;
        if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
      }
      if (cancelled) return;
      setBackendOnline(up);
      if (!up) return;
      for (let attempt = 0; attempt < 3 && !cancelled; attempt += 1) {
        const res = await backendListFasilitas();
        if (cancelled) return;
        if (res.ok && Array.isArray(res.data)) {
          // Server menang (termasuk list kosong yang legitimate).
          setFacilities(res.data.map(mapBackendFasilitas));
          return;
        }
        if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const sessionUser = currentUser && currentUser.id.startsWith('backend-') ? currentUser : null;

  // Kembalikan sesi saat refresh/hydration: cookie session_id HttpOnly
  // masih di browser, jadi tanyakan ke backend siapa pemiliknya.
  // Tanpa ini, refresh halaman selalu dianggap belum login.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (currentUser) return;
      let me = await backendMe();
      for (let attempt = 0; !me.ok && me.status !== 401 && me.status !== 403 && attempt < 2; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
        if (cancelled) return;
        me = await backendMe();
      }
      if (cancelled || !me.ok || !me.data) return;
      setCurrentUser({
        id: `backend-${me.data.email}`,
        nama: me.data.username || me.data.email,
        email: me.data.email,
        role: roleIdToFrontend(me.data.role || '3'),
      });
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----- Sinkronisasi: server menang, seed dibuang -----

  const refreshFacilities = useCallback(async (): Promise<boolean> => {
    const res = await backendListFasilitas();
    if (!res.ok) return false;
    setFacilities((res.data ?? []).map(mapBackendFasilitas));
    return true;
  }, []);

  const refreshReservations = useCallback(async (): Promise<boolean> => {
    if (!sessionUser) return false;
    const isOfficer = sessionUser.role === 'petugas' || sessionUser.role === 'admin';
    const res = isOfficer
      ? await backendListPetugasReservasi({ limit: 100 })
      : await backendListReservasi({ limit: 100 });

    if (res.ok && Array.isArray(res.data)) {
      const rows: Reservation[] = [];
      for (const row of res.data) {
        const m = mapBackendReservasi(row);
        if (m) {
          rows.push({
            ...m,
            pemohon: m.pemohon || sessionUser.nama,
            sumber: 'backend',
          });
        }
      }
      if (res.data.length > 0 && rows.length === 0) {
        console.warn('[sync] reservasi diterima dari backend tetapi tidak ada baris yang dapat dipetakan', res.data[0]);
      } else {
        if (rows.length < res.data.length) {
          console.warn(`[sync] ${res.data.length - rows.length} baris reservasi tidak dapat dipetakan`);
        }
        rows.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));

        // Jika ada permohonan 'menunggu' yang bertabrakan dengan permohonan 'disetujui' di fasilitas & tanggal sama,
        // otomatis batalkan pada backend karena jadwal sudah terpakai.
        // Khusus ruangan (eksklusif). Alat berbasis sisa stok (backend yang
        // menentukan saat approve), jadi tidak di-auto-cancel di sini.
        if (isOfficer) {
          const approved = rows.filter((r) => r.status === 'disetujui' && !r.facilityId.startsWith('alat-'));
          const conflictsToCancel = rows.filter((r) => {
            if (r.status !== 'menunggu') return false;
            if (r.facilityId.startsWith('alat-')) return false;
            return approved.some(
              (a) =>
                a.id !== r.id &&
                a.facilityId === r.facilityId &&
                a.tanggal === r.tanggal &&
                r.start < a.end &&
                r.end > a.start
            );
          });

          if (conflictsToCancel.length > 0) {
            for (const c of conflictsToCancel) {
              const cId = c.backendId ?? c.id;
              void backendPetugasCancelReservasi(cId, 'Jadwal sudah terpakai (disetujui untuk peminjam lain).').catch(console.error);
              c.status = 'dibatalkan';
              c.catatanBatal = 'Jadwal sudah terpakai (disetujui untuk peminjam lain).';
            }
          }
        }

        setReservations(rows);
        return true;
      }
    }

    // Fallback: per-jenis ruangan dan alat jika endpoint tunggal gagal
    const [ru, al] = await Promise.all([
      backendListReservasiRuangan(100),
      backendListReservasiAlat(100),
    ]);
    if (!ru.ok && !al.ok) return false;
    const rows: Reservation[] = [];
    for (const row of ru.data ?? []) {
      const m = mapBackendReservasi(row);
      if (m) rows.push({ ...m, pemohon: m.pemohon || sessionUser.nama, sumber: 'backend' });
    }
    for (const row of al.data ?? []) {
      const m = mapBackendReservasi(row);
      if (m) rows.push({ ...m, pemohon: m.pemohon || sessionUser.nama, sumber: 'backend' });
    }
    rows.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
    const rawCount = (ru.data?.length ?? 0) + (al.data?.length ?? 0);
    if (rawCount > 0 && rows.length === 0) {
      console.warn('[sync] fallback reservasi berisi data tetapi tidak ada baris yang dapat dipetakan');
      return false;
    }
    if (rows.length < rawCount) {
      console.warn(`[sync] ${rawCount - rows.length} baris fallback reservasi tidak dapat dipetakan`);
    }
    setReservations(rows);
    return true;
  }, [sessionUser]);

  const refreshPetugasReports = useCallback(async (): Promise<boolean> => {
    if (!sessionUser || (sessionUser.role !== 'petugas' && sessionUser.role !== 'admin')) {
      return false;
    }
    const res = await backendListSemuaLaporan();
    if (!res.ok) return false;
    const rows = res.data ?? [];
    const mapped: Report[] = [];
    for (const row of rows) {
      const m = mapBackendReport(row);
      if (!m) {
        console.warn('[sync] baris laporan terbuang (tak terparse)', row);
        continue;
      }
      mapped.push({
        id: m.backendId,
        backendId: m.backendId,
        sumber: 'backend' as const,
        facilityId: m.facilityId,
        // Nama asli bila backend mengirim username_report; fallback ID.
        pelapor: m.pelaporNama ?? `Pengguna #${(row as Record<string, unknown>)['user_report'] ?? '?'}`,
        kategori: m.kategori,
        deskripsi: m.deskripsi,
        foto: m.foto,
        status: m.status,
        catatan: m.catatan,
        createdAt: m.createdAt,
      });
    }
    if (rows.length > 0 && mapped.length === 0) {
      console.warn('[sync] daftar laporan petugas tidak dapat dipetakan');
      return false;
    }
    setReports(mapped);
    return true;
  }, [sessionUser]);

  const refreshReportsMine = useCallback(async (): Promise<boolean> => {
    if (!sessionUser) return false;
    if (sessionUser.role === 'petugas' || sessionUser.role === 'admin') {
      return refreshPetugasReports();
    }
    const res = await backendListLaporanSaya();
    if (!res.ok) return false;
    const rawRows = Array.isArray(res.data) ? res.data : [];
    const mappedReports = rawRows.map(mapBackendReport).filter(Boolean) as NonNullable<
      ReturnType<typeof mapBackendReport>
    >[];
    if (rawRows.length > 0 && mappedReports.length === 0) {
      console.warn('[sync] laporan diterima dari backend tetapi tidak ada baris yang dapat dipetakan', rawRows[0]);
      return false;
    }
    setReports(
      mappedReports.map((m) => ({
        id: m.backendId,
        backendId: m.backendId,
        sumber: 'backend' as const,
        facilityId: m.facilityId,
        pelapor: sessionUser.nama,
        kategori: m.kategori,
        deskripsi: m.deskripsi,
        foto: m.foto,
        status: m.status,
        catatan: m.catatan,
        createdAt: m.createdAt,
      })),
    );
    return true;
  }, [sessionUser, refreshPetugasReports]);

  const refreshPendingAccounts = useCallback(async (): Promise<boolean> => {
    if (!sessionUser || sessionUser.role !== 'admin') return false;
    const [mhs, dsn, stf] = await Promise.all([
      backendAdminList('/admin/show_mhs_pending'),
      backendAdminList('/admin/show_dosen_pending'),
      backendAdminList('/admin/show_staff_pending'),
    ]);
    // Per-list null-tolerant (backend me-return "data":null saat kosong).
    if (!mhs.ok || !dsn.ok || !stf.ok) return false;
    const rows: PendingAccount[] = [];
    for (const row of mhs.data ?? []) {
      const m = mapPendingMhs(row);
      if (!m) continue;
      rows.push({
        id: m.backendId * 10 + 1,
        backendId: m.backendId,
        sumber: 'backend',
        nama: m.nama,
        email: '',
        peran: 'Mahasiswa',
        nim: m.identifier,
        angkatan: m.extra,
        status: 'menunggu',
      });
    }
    for (const row of dsn.data ?? []) {
      const m = mapPendingDosen(row);
      if (!m) continue;
      rows.push({
        id: m.backendId * 10 + 2,
        backendId: m.backendId,
        sumber: 'backend',
        nama: m.nama,
        email: '',
        peran: 'Dosen',
        nidn: m.identifier,
        prodi: m.extra,
        status: 'menunggu',
      });
    }
    for (const row of stf.data ?? []) {
      const m = mapPendingStaff(row);
      if (!m) continue;
      rows.push({
        id: m.backendId * 10 + 3,
        backendId: m.backendId,
        sumber: 'backend',
        nama: m.nama,
        email: m.email,
        peran: 'Staf',
        nip: m.identifier,
        status: 'menunggu',
      });
    }
    setPendingAccounts(rows);
    return true;
  }, [sessionUser]);

  const refreshAccounts = useCallback(async (): Promise<boolean> => {
    if (!sessionUser || sessionUser.role !== 'admin') return false;
    const res = await backendAdminList('/admin/show_user', 100);
    if (!res.ok) return false;
    setRegisteredAccounts(
      (res.data ?? []).map(mapBackendAccount).filter((a): a is BackendAccount => a !== null),
    );
    return true;
  }, [sessionUser]);

  // Auto-sync setiap session backend aktif (sekali per user, tanpa loop:
  // refresh tidak menyentuh currentUser).
  useEffect(() => {
    if (!sessionUser) return;
    let cancelled = false;
    (async () => {
      setSyncStatus('loading');
      const retryRefresh = async (refresh: () => Promise<boolean>, label: string) => {
        for (let attempt = 0; attempt < 3; attempt += 1) {
          try {
            if (await refresh()) return true;
          } catch (error) {
            console.warn(`[sync] ${label} gagal`, error);
          }
          if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
        }
        console.warn(`[sync] ${label} belum berhasil setelah 3 percobaan`);
        return false;
      };

      const r1 = retryRefresh(refreshReservations, 'reservasi');
      const r2 = sessionUser.role === 'petugas' || sessionUser.role === 'admin'
        ? Promise.resolve(true)
        : retryRefresh(refreshReportsMine, 'laporan pengguna');
      const r3 = sessionUser.role === 'petugas' || sessionUser.role === 'admin'
        ? retryRefresh(refreshPetugasReports, 'daftar laporan petugas')
        : Promise.resolve(true);
      const r4 = sessionUser.role === 'admin'
        ? retryRefresh(refreshPendingAccounts, 'akun menunggu verifikasi')
        : Promise.resolve(true);
      const r5 = sessionUser.role === 'admin'
        ? retryRefresh(refreshAccounts, 'daftar akun')
        : Promise.resolve(true);
      const results = await Promise.all([r1, r2, r3, r4, r5]);
      if (cancelled) return;
      // Data parsial tetap dapat dipakai. Error total hanya jika kedua sumber
      // utama, reservasi dan laporan milik pengguna/petugas, sama-sama gagal.
      const laporanSuccess = sessionUser.role === 'petugas' || sessionUser.role === 'admin' ? results[2] : results[1];
      const berhasil = Number(results[0]) + Number(laporanSuccess);
      setSyncStatus(berhasil === 2 ? 'ok' : berhasil === 1 ? 'partial' : 'error');

      if (berhasil === 0) {
        const me = await backendMe();
        if (!cancelled && me.status === 401) {
          console.warn('[sync] sesi backend sudah tidak berlaku; pengguna perlu masuk kembali');
          setCurrentUser(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionUser?.id]);

  const value = useMemo<AppDataValue>(
    () => ({
      facilities,
      reservations,
      reports,
      pendingAccounts,
      registeredAccounts,
      currentUser,
      backendOnline,
      syncStatus,

      facilityById: (id) => facilities.find((f) => f.id === id),
      isSlotTaken: (facilityId, slotStart, excludeId, tanggal, currentUserIdentifier) => {
        if (tanggal && availabilityMap[tanggal]) {
          const dateMap = availabilityMap[tanggal];
          if (dateMap[facilityId]?.has(slotStart)) return true;
          const fac = facilities.find((f) => f.id === facilityId);
          if (fac?.refId && fac?.tipe && dateMap[`${fac.tipe}-${fac.refId}`]?.has(slotStart)) return true;
        }
        // Alat quantity-aware: slot dianggap penuh hanya jika sisa stok habis.
        const fac = facilities.find((f) => f.id === facilityId);
        const stokTotal = fac && isAlatFacility(fac) ? (fac.tersedia ?? fac.cap) : undefined;
        return isSlotBooked(
          reservations,
          facilityId,
          slotStart,
          excludeId,
          tanggal,
          currentUserIdentifier || currentUser?.nama || currentUser?.email,
          undefined,
          stokTotal
        );
      },
      fetchSlotAvailability,

      login: async (identifier, password) => {
        // identifier boleh email atau username. Hanya akun backend
        // terverifikasi (akun demo mock dihapus).
        // POST /auth/login -> cookie session_id, lalu GET /user/me
        // untuk username + role. Pesan error backend diteruskan apa adanya.
        try {
          const res = await backendLogin(identifier, password);
          if (res.ok) {
            // Baca sesi dengan 1x percobaan ulang: cookie session_id kadang
            // belum tersedia / backend restart tepat di antara 2 request.
            let me = await backendMe();
            if (!me.ok) {
              await new Promise((r) => setTimeout(r, 700));
              me = await backendMe();
            }
            if (me.ok && me.data && me.data.email) {
              const user: LoggedInUser = {
                id: `backend-${me.data.email.trim().toLowerCase()}`,
                nama: me.data.username || identifier,
                email: me.data.email,
                role: roleIdToFrontend(me.data.role || '3'),
              };
              setCurrentUser(user);
              return { ok: true, user };
            }
            // JANGAN fallback ke peran pengguna: salah peran lebih buruk
            // daripada gagal login. Status dirinci agar bisa didiagnosis:
            // 0 = backend tak terjangkau, 401 = sesi hilang (backend restart?).
            console.error('[login] sesi tidak terbaca', `HTTP ${me.status}`, me.message);
            return {
              ok: false,
              message: `Login berhasil tetapi sesi tidak terbaca (HTTP ${me.status}). Pastikan backend tidak di-restart, lalu coba login ulang.`,
            };
          }
          return { ok: false, message: res.message || 'Email atau kata sandi salah.' };
        } catch (e) {
          return {
            ok: false,
            message: e instanceof Error ? e.message : 'Backend tidak terjangkau.',
          };
        }
      },
      // Backend POST /auth/logout menghapus session di server dan membersihkan cookie session_id.
      logout: async () => {
        try {
          await backendLogout();
        } catch (e) {
          console.error('[logout] error:', e);
        }
        setCurrentUser(null);
      },
      submitSelfRegistration: async (namaOrInput, email, peran, nim, phone, fakultas) => {
        let input: SelfRegisterInput;
        if (typeof namaOrInput === 'object') {
          input = namaOrInput;
        } else {
          input = {
            nama: namaOrInput,
            email: email || '',
            peran: peran || 'Mahasiswa',
            nim,
            phone,
            fakultas,
          };
        }
        // Backend-first sesuai peran (mhs/dosen/staff). Field diisi
        // default yang lolos validasi Go jika form tidak menyediakannya.
        const username =
          input.username?.trim() || input.email.split('@')[0] || `user${Date.now()}`;
        const password = input.password || 'Sipinjam2026!';
        const nama = input.nama.trim() || username;
        const prodi = input.prodi?.trim() || 'Informatika';
        const peranLower = input.peran.toLowerCase();
        try {
          let res: import('@/lib/api').ApiResult | null = null;
          if (peranLower.includes('dosen')) {
            res = await backendRegisterDosen({
              username,
              email: input.email.trim(),
              password,
              nidn: input.nidn?.trim() || '0000000000',
              nama_lengkap: nama,
              prodi,
            });
          } else if (peranLower.includes('staf') || peranLower.includes('staff')) {
            res = await backendRegisterStaff({
              username,
              email: input.email.trim(),
              password,
              nip: input.nip?.trim() || '000000000000',
              nama_lengkap: nama,
            });
          } else {
            res = await backendRegisterMhs({
              username,
              email: input.email.trim(),
              password,
              nim: input.nim?.trim() || '0000000',
              angkatan: String(input.angkatan ?? getTodayDateString().slice(0, 4)),
              nama_lengkap: nama,
              prodi,
            });
          }
          // Tanpa cermin lokal: baris pending asli tampil via
          // refreshPendingAccounts (admin). Pesan backend apa adanya.
          return res;
        } catch (e) {
          // Tanpa fallback mock (keputusan hapus-demo): backend mati =
          // error jelas, bukan antrean lokal palsu.
          return {
            ok: false,
            message: e instanceof Error ? e.message : 'Backend tidak terjangkau.',
          };
        }
      },

      submitReservation: async (input) => {
        // API-only: hanya session backend yang bisa memesan. Tanpa session
        // backend (atau fasilitas seed lokal) tidak ada booking mock —
        // sesuai keputusan hapus akun demo.
        const user = currentUser;
        if (!user || !user.id.startsWith('backend-')) {
          return {
            ok: false,
            message: 'Sesi backend tidak aktif. Masuk dengan akun terverifikasi.',
          };
        }
        const facility = facilities.find((f) => f.id === input.facilityId);
        if (!facility) {
          return { ok: false, message: 'Fasilitas tidak ditemukan.' };
        }
        const mappedAlat =
          input.alat && input.alat.length > 0
            ? input.alat.map((item) => ({
                alat_id: item.id,
                jumlah: item.jumlah,
              }))
            : undefined;

        const conv = toCreateReservasiBody(
          facility,
          input.tanggal,
          input.start,
          input.end,
          input.tujuan,
          input.peserta,
          mappedAlat,
        );
        if (conv.kind === 'unsupported') {
          return { ok: false, message: conv.reason };
        }
        const res =
          conv.kind === 'ruangan'
            ? await backendCreateReservasiRuangan(conv.body)
            : await backendCreateReservasiAlat(conv.body);
        if (!res.ok) {
          return { ok: false, message: res.message };
        }
        // Sinkronkan data dari server agar id backend, status, dan riwayat presisi
        setAvailabilityMap({});
        await refreshReservations();
        return { ok: true };
      },

      cancelReservation: async (id: number, alasan: string) => {
        if (!alasan.trim()) {
          return { ok: false, message: 'Alasan pembatalan wajib diisi.' };
        }
        const target = reservations.find((r) => r.id === id);
        const backendId = target?.backendId ?? id;
        const res = await backendCancelReservasi(backendId, alasan.trim());
        if (!res.ok) {
          return { ok: false, message: res.message };
        }
        setAvailabilityMap({});
        await refreshReservations();
        return { ok: true };
      },

      updateReservationStatus: async (
        id: number,
        status: 'disetujui' | 'ditolak',
        alasanPenolakan = '',
      ) => {
        if (status === 'ditolak' && !alasanPenolakan.trim()) {
          return { ok: false, message: 'Alasan penolakan wajib diisi.' };
        }
        const target = reservations.find((r) => r.id === id);
        const backendId = target?.backendId ?? id;
        const res = await backendPetugasUpdateReservasi(backendId, status, alasanPenolakan.trim());
        if (!res.ok) {
          return { ok: false, message: res.message };
        }

        // Jika disetujui, batalkan otomatis semua permohonan lain yang statusnya masih 'menunggu'
        // pada fasilitas dan tanggal yang sama dengan rentang waktu yang bertabrakan (jadwal terpakai).
        // Khusus ruangan (eksklusif); alat berbasis sisa stok via backend.
        if (status === 'disetujui' && target && !target.facilityId.startsWith('alat-')) {
          const conflicting = reservations.filter(
            (r) =>
              r.id !== target.id &&
              r.status === 'menunggu' &&
              !r.facilityId.startsWith('alat-') &&
              r.facilityId === target.facilityId &&
              r.tanggal === target.tanggal &&
              r.start < target.end &&
              r.end > target.start
          );
          for (const c of conflicting) {
            const cId = c.backendId ?? c.id;
            try {
              await backendPetugasCancelReservasi(cId, 'Jadwal sudah terpakai (disetujui untuk peminjam lain).');
            } catch (err) {
              console.error('Gagal auto-cancel permohonan bentrok:', err);
            }
          }
        }

        setAvailabilityMap({});
        await refreshReservations();
        return { ok: true };
      },

      petugasCancelReservation: async (id: number, alasan: string) => {
        if (!alasan.trim()) {
          return { ok: false, message: 'Alasan pembatalan wajib diisi.' };
        }
        const target = reservations.find((r) => r.id === id);
        const backendId = target?.backendId ?? id;
        const res = await backendPetugasCancelReservasi(backendId, alasan.trim());
        if (!res.ok) {
          return { ok: false, message: res.message };
        }
        setAvailabilityMap({});
        await refreshReservations();
        return { ok: true };
      },
      submitReport: async (input) => {
        // API-only: hanya session backend yang bisa melapor (konsisten
        // keputusan hapus-demo). Backend: POST /reports JSON
        // (alasan 1-255, kategori enum, tepat satu ruangan_id/alat_id,
        // foto opsional berupa data-URL base64 jpg/png <=2MB yang
        // disimpan langsung di kolom report.foto).
        const user = currentUser;
        if (!user || !user.id.startsWith('backend-')) {
          return {
            ok: false,
            message: 'Sesi backend tidak aktif. Masuk dengan akun terverifikasi.',
          };
        }
        const alasan = input.deskripsi.trim();
        if (!alasan || alasan.length > 255) {
          return {
            ok: false,
            message: 'Deskripsi wajib 1-255 karakter.',
          };
        }
        if (!REPORT_KATEGORI.includes(input.kategori as (typeof REPORT_KATEGORI)[number])) {
          return { ok: false, message: 'Kategori tidak valid.' };
        }
        const facility = facilities.find((f) => f.id === input.facilityId);
        if (!facility) {
          return { ok: false, message: 'Fasilitas tidak ditemukan.' };
        }
        const target = parseLaporanTarget(facility);
        if (target.kind === 'unsupported') {
          return { ok: false, message: target.reason };
        }
        // Prioritas: fotoBase64 (data-URL dari FileReader) > konversi fotoFile > string foto.
        let fotoBase64: string | undefined;
        if (input.fotoBase64 && input.fotoBase64.startsWith('data:')) {
          fotoBase64 = input.fotoBase64;
        } else if (input.fotoFile) {
          const foto = input.fotoFile;
          const isImage = /^(image\/jpeg|image\/png|image\/jpg)$/.test(foto.type);
          const extOk = /\.(jpe?g|png)$/i.test(foto.name);
          if (!isImage || !extOk) {
            return { ok: false, message: 'Format foto harus JPG atau PNG.' };
          }
          if (foto.size > 2 * 1024 * 1024) {
            return { ok: false, message: 'Ukuran foto maksimal 2MB.' };
          }
          fotoBase64 = await new Promise<string | undefined>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve(typeof reader.result === 'string' ? reader.result : undefined);
            };
            reader.onerror = () => resolve(undefined);
            reader.readAsDataURL(foto);
          });
          if (!fotoBase64) {
            return { ok: false, message: 'Gagal membaca foto.' };
          }
        } else if (input.foto && input.foto.startsWith('data:')) {
          fotoBase64 = input.foto;
        }
        // String foto non-base64 (nama file / URL tempel) tidak dikirim ke
        // backend — kolom foto hanya menerima base64.
        const res = await backendCreateLaporan({
          alasan,
          kategori: input.kategori,
          ...(target.kind === 'ruangan' ? { ruangan_id: target.ruangan_id } : { alat_id: target.alat_id }),
          ...(fotoBase64 ? { foto: fotoBase64 } : {}),
        });
        if (!res.ok) {
          return { ok: false, message: res.message };
        }
        if (sessionUser?.role === 'petugas' || sessionUser?.role === 'admin') {
          await refreshPetugasReports();
        } else {
          await refreshReportsMine();
        }
        return { ok: true };
      },

      updateReportStatus: async (id, status, catatan) => {
        const row = reports.find((r) => r.id === id);
        // Baris backend (punya backendId): PATCH /petugas/reports/{id}.
        // Aturan server: tutup (selesai/ditolak) wajib catatan; baris
        // tertutup 409; transisi ilegal 400 — pesan diteruskan apa adanya.
        if (row?.sumber === 'backend' && row.backendId !== undefined) {
          if ((status === 'selesai' || status === 'ditolak') && !catatan?.trim()) {
            return { ok: false, message: 'Catatan resolusi wajib diisi saat laporan ditutup.' };
          }
          const res = await backendUpdateLaporan(row.backendId, status, catatan ?? '');
          if (!res.ok) return { ok: false, message: res.message };
          await refreshPetugasReports();
          return { ok: true };
        }
        setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status, catatan: catatan ?? r.catatan } : r)));
        return { ok: true };
      },
      setFacilityStatus: async (facilityId, status) => {
        const fac = facilities.find((f) => f.id === facilityId);
        // Baris backend: PATCH /petugas/facilities/{refId}/status.
        // 'busy' (stok habis) dikelola otomatis server — tanpa padanan tulis.
        if (fac?.refId !== undefined && fac.tipe) {
          if (status === 'busy') {
            return {
              ok: false,
              message: 'Status Terpakai dikelola otomatis oleh sistem (stok habis).',
            };
          }
          const backendStatus =
            status === 'repair' ? 'dalam_perbaikan' : status === 'nonaktif' ? 'nonaktif' : 'aktif';
          const res = await backendUpdateFasilitasStatus(fac.refId, backendStatus, fac.tipe);
          if (!res.ok) return { ok: false, message: res.message };
          setFacilities((prev) => prev.map((f) => (f.id === facilityId ? { ...f, status } : f)));
          return { ok: true };
        }
        setFacilities((prev) => prev.map((f) => (f.id === facilityId ? { ...f, status } : f)));
        return { ok: true };
      },

      addFacility: async (input) => {
        const tipe = input.tipeSarana;
        if (tipe !== 'ruangan' && tipe !== 'alat') {
          return { ok: false, message: 'Pilih jenis sarana: ruangan atau alat.' };
        }
        if (!sessionUser || sessionUser.role !== 'admin') {
          return { ok: false, message: 'Hanya admin yang dapat menambah fasilitas.' };
        }
        const kategori = input.type.trim();
        if (kategori.length < 3 || kategori.length > 100) {
          return { ok: false, message: 'Nama kategori 3-100 karakter.' };
        }
        const cap = Number.isInteger(input.cap) && input.cap > 0 ? input.cap : 1;
        const deskripsi = (input.desc || '').trim();
        const kelengkapan = Array.isArray(input.amenities)
          ? input.amenities.filter(Boolean).join(', ')
          : '';
        const foto = (input.image || '').trim();

        const doCreate = () =>
          tipe === 'ruangan'
            ? backendAdminPostForm('/admin/create_fasilitas/ruangan', {
                nama_kategori: kategori,
                nama_ruangan: input.name.trim(),
                status: 1,
                kapasistas: cap,
                lokasi: input.loc.trim(),
                deskripsi,
                kelengkapan,
                foto,
              })
            : backendAdminPostForm('/admin/create_fasilitas/alat', {
                nama_alat: input.name.trim(),
                jumlah_tersedia: cap,
                banyak_alat: cap,
                nama_kategori: kategori,
                status: 1,
                deskripsi,
                kelengkapan,
                foto,
              });
        let res = await doCreate();
        // Kategori belum ada -> buatkan dulu lalu ulangi sekali.
        if (!res.ok && /tidak exist/i.test(res.message)) {
          const kat = await backendAdminPostForm('/admin/create_fasilitas/kategori', {
            nama_kategori: kategori,
          });
          if (!kat.ok) return { ok: false, message: kat.message };
          res = await doCreate();
        }
        if (!res.ok) return { ok: false, message: res.message };
        await refreshFacilities();
        return { ok: true };
      },
      updateFacility: async (id, input) => {
        const fac = facilities.find((f) => f.id === id);
        if (!fac || fac.refId === undefined) {
          return { ok: false, message: 'Hanya fasilitas backend yang bisa diubah.' };
        }
        const effectiveTipe = fac.tipe || (isAlatFacility(fac) ? 'alat' : 'ruangan');
        // Pertahankan ketersediaan saat ini (avail/busy -> 1).
        const statusInt = fac.status === 'repair' || fac.status === 'nonaktif' ? 0 : 1;
        const deskripsi = (input.desc ?? fac.desc ?? '').trim();
        const kelengkapan = Array.isArray(input.amenities)
          ? input.amenities.filter(Boolean).join(', ')
          : (fac.amenities || []).join(', ');
        const foto = (input.image !== undefined ? input.image : (fac.image || '')) || '';

        const res =
          effectiveTipe === 'alat'
            ? await backendAdminPostForm('/admin/update_fasilitas/alat', {
                id: fac.refId,
                nama_alat: input.name.trim(),
                jumlah_tersedia: input.cap,
                banyak_alat: input.cap,
                nama_kategori: input.type.trim(),
                status: statusInt,
                deskripsi,
                kelengkapan,
                foto,
              })
            : await backendAdminPostForm('/admin/update_fasilitas/ruangan', {
                id: fac.refId,
                nama_ruangan: input.name.trim(),
                status: statusInt,
                kapasistas: input.cap,
                lokasi: input.loc.trim(),
                nama_kategori: input.type.trim(),
                deskripsi,
                kelengkapan,
                foto,
              });
        if (!res.ok) return { ok: false, message: res.message };
        await refreshFacilities();
        return { ok: true };
      },
      deleteFacility: async (id) => {
        const fac = facilities.find((f) => f.id === id);
        if (!fac || fac.refId === undefined) {
          return { ok: false, message: 'Hanya fasilitas backend yang bisa dinonaktifkan.' };
        }
        const effectiveTipe = fac.tipe || (isAlatFacility(fac) ? 'alat' : 'ruangan');
        // Soft delete: nonaktif via status (FK reservasi/laporan aman).
        const res = await backendAdminPostForm(`/admin/delete_fasilitas/${effectiveTipe}`, {
          id: fac.refId,
        });
        if (!res.ok) return { ok: false, message: res.message };
        await refreshFacilities();
        return { ok: true };
      },
      registerAccountDirectly: async (input: DirectRegisterInput) => {
        const exists = registeredAccounts.some(
          (a) => a.email.toLowerCase() === input.email.trim().toLowerCase()
        );
        if (exists) {
          return { ok: false, message: 'Email sudah terdaftar dalam sistem.' };
        }

        const peranLower = input.peran.toLowerCase();
        const username = input.username?.trim() || input.email.split('@')[0];
        const password = input.password || 'Sipinjam2026!';
        const email = input.email.trim();
        const nama = input.nama.trim();
        // Cabang endpoint mengikuti backend (admin/petugas langsung aktif;
        // pengguna via create_user/mhs|dosen|staff yang langsung terverifikasi).
        let res;
        if (peranLower.includes('admin')) {
          res = await backendAdminPostForm('/admin/create_user/admin', { username, email, password });
        } else if (peranLower.includes('petugas')) {
          res = await backendAdminPostForm('/admin/create_user/petugas', { username, email, password });
        } else if (peranLower.includes('dosen')) {
          res = await backendAdminPostForm('/admin/create_user/dosen', {
            username,
            email,
            password,
            nidn: input.nidn?.trim(),
            nama_lengkap: nama,
            prodi: input.prodi?.trim(),
          });
        } else if (peranLower.includes('staf') || peranLower.includes('staff')) {
          res = await backendAdminPostForm('/admin/create_user/staff', {
            username,
            email,
            password,
            nip: input.nip?.trim(),
            nama_lengkap: nama,
          });
        } else {
          res = await backendAdminPostForm('/admin/create_user/mhs', {
            username,
            email,
            password,
            nim: input.nim?.trim(),
            angkatan: input.angkatan,
            nama_lengkap: nama,
            prodi: input.prodi?.trim(),
          });
        }
        if (!res.ok) return { ok: false, message: res.message };

        // Server menang: ambil ulang daftar akun agar id asli tampil.
        await refreshAccounts();
        const created = registeredAccounts.find(
          (a) => a.email.toLowerCase() === email.toLowerCase(),
        );
        return { ok: true, account: created };
      },
      toggleAccountStatus: async (id) => {
        const acc = registeredAccounts.find((a) => a.id === id);
        if (!acc) return { ok: false, message: 'Akun tidak ditemukan.' };
        // Suspend = is_verified 0 (tak bisa login); aktifkan = 1.
        const next = acc.isVerified === false ? 1 : 0;
        const res = await backendAdminPostForm('/admin/users/status', {
          id,
          is_verified: next,
        });
        if (!res.ok) return { ok: false, message: res.message };
        await refreshAccounts();
        return { ok: true };
      },
      verifyPendingAccount: async (id, approve) => {
        const row = pendingAccounts.find((a) => a.id === id);
        // Setuju/tolak via POST /admin/verifikasi_* dan /admin/tolak_*
        // dengan nama field berbeda per tipe (id_mhs / id_dosen / id_staff).
        if (!row || row.backendId === undefined) {
          return { ok: false, message: 'Data pending tidak ditemukan.' };
        }
        const peranLower = row.peran.toLowerCase();
        const kind =
          peranLower.includes('dosen') ? 'dosen'
          : peranLower.includes('staf') || peranLower.includes('staff') ? 'staff'
          : 'mhs';
        const path = approve
          ? `/admin/verifikasi_${kind}`
          : `/admin/tolak_${kind}`;
        const field = `id_${kind}`;
        const res = await backendAdminPostForm(path, { [field]: row.backendId });
        if (!res.ok) return { ok: false, message: res.message };
        setPendingAccounts((prev) =>
          approve
            ? prev.filter((a) => a.id !== id)
            : prev.map((a) => (a.id === id ? { ...a, status: 'ditolak' as const } : a)),
        );
        return { ok: true };
      },
      deleteAccount: async (id: number) => {
        const target = registeredAccounts.find((a) => a.id === id);
        if (!target) return { ok: false, message: 'Akun tidak ditemukan.' };
        // Backend Go menggunakan mekanisme penonaktifan (is_verified = 0) untuk akun terdaftar
        // guna mempertahankan integritas relasi foreign key (riwayat reservasi, log laporan, dll.)
        await backendAdminPostForm('/admin/users/status', {
          id,
          is_verified: 0,
        });
        setRegisteredAccounts((prev) => prev.filter((a) => a.id !== id));
        return {
          ok: true,
          message: `Akun @${target.username} (${target.role}) berhasil dinonaktifkan dan dihapus dari sistem.`,
        };
      },

      refreshReservations,
      refreshReportsMine,
      refreshPetugasReports,
      refreshPendingAccounts,
      refreshFacilities,
      refreshAccounts,
    }),
    [
      facilities,
      reservations,
      reports,
      pendingAccounts,
      registeredAccounts,
      currentUser,
      backendOnline,
      syncStatus,
      availabilityMap,
      fetchSlotAvailability,
      refreshReservations,
      refreshReportsMine,
      refreshPetugasReports,
      refreshPendingAccounts,
      refreshFacilities,
      refreshAccounts,
    ]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData harus dipakai di dalam <AppDataProvider>');
  return ctx;
}
