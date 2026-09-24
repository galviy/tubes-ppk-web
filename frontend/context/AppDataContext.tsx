'use client';

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { Facility } from '@/models/facility';
import { Reservation } from '@/models/reservation';
import { Report, PendingAccount } from '@/models/report';
import {
  FACILITIES as SEED_FACILITIES,
  SEED_RESERVATIONS,
  SEED_REPORTS,
  SEED_PENDING_ACCOUNTS,
} from '@/models/facilities-data';
import { isSlotBooked, hasRangeConflict } from '@/lib/slots';
import { registerSelf as apiRegisterSelf, AuthResult, SelfRegisterInput } from '@/mock/auth-api';
import { UserRole, FakeUserRecord, FAKE_USERS_DB } from '@/mock/fake-users-db';
import {
  backendAvailable,
  backendCreateLaporan,
  backendCreateReservasiAlat,
  backendCreateReservasiRuangan,
  backendListFasilitas,
  backendLogin,
  backendMe,
  backendRegisterDosen,
  backendRegisterMhs,
  backendRegisterStaff,
  parseLaporanTarget,
  REPORT_KATEGORI,
  roleIdToFrontend,
  toCreateReservasiBody,
  type BackendFasilitas,
} from '@/lib/api';

function mapBackendFasilitas(b: BackendFasilitas): Facility {
  const status = (['avail', 'busy', 'repair', 'nonaktif'] as const).includes(
    b.status as Facility['status'],
  )
    ? (b.status as Facility['status'])
    : 'avail';
  return {
    id: b.id,
    refId: typeof b.ref_id === 'number' ? b.ref_id : undefined,
    tipe: b.tipe === 'alat' ? 'alat' : b.tipe === 'ruangan' ? 'ruangan' : undefined,
    name: b.name,
    type: b.type,
    loc: b.loc,
    cap: b.cap,
    desc: b.desc,
    amenities: Array.isArray(b.amenities) ? b.amenities : [],
    status,
    image: b.image ?? undefined,
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

  facilityById: (id: string) => Facility | undefined;
  isSlotTaken: (facilityId: string, slotStart: string, excludeId?: number) => boolean;

  // Auth
  login: (email: string, password: string) => Promise<AuthResult>;
  logout: () => void;
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
  cancelReservation: (id: number) => void;
  submitReport: (
    input: Omit<Report, 'id' | 'pelapor' | 'status' | 'catatan' | 'createdAt'> & {
      fotoFile?: File | null;
    }
  ) => Promise<{ ok: boolean; message?: string }>;

  // Petugas
  approveReservation: (id: number) => { ok: boolean; message?: string };
  rejectReservation: (id: number) => void;
  cancelApprovedReservation: (id: number, alasan: string) => void;
  resetReservationToWaiting: (id: number) => void;
  updateReportStatus: (id: number, status: Report['status'], catatan?: string) => void;
  setFacilityStatus: (facilityId: string, status: Facility['status']) => void;

  // Admin
  registeredAccounts: FakeUserRecord[];
  addFacility: (input: Omit<Facility, 'id' | 'status'>) => void;
  updateFacility: (id: string, input: Omit<Facility, 'id' | 'status'>) => void;
  deleteFacility: (id: string) => void;
  registerAccountDirectly: (input: DirectRegisterInput) => { ok: boolean; message?: string; account?: FakeUserRecord };
  toggleAccountStatus: (id: string) => void;
  verifyPendingAccount: (id: number, approve: boolean) => void;
}

const AppDataContext = createContext<AppDataValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [facilities, setFacilities] = useState<Facility[]>(SEED_FACILITIES);
  const [reservations, setReservations] = useState<Reservation[]>(SEED_RESERVATIONS);
  const [reports, setReports] = useState<Report[]>(SEED_REPORTS);
  const [pendingAccounts, setPendingAccounts] = useState<PendingAccount[]>(SEED_PENDING_ACCOUNTS);
  const [registeredAccounts, setRegisteredAccounts] = useState<FakeUserRecord[]>(FAKE_USERS_DB);
  const [currentUser, setCurrentUser] = useState<LoggedInUser | null>(null);
  const [backendOnline, setBackendOnline] = useState(false);

  // Backend-first untuk katalog publik (tanpa auth): jika Go hidup,
  // ganti seed lokal dengan data MySQL. Jika mati, tetap pakai seed
  // supaya UI tidak blank (fallback mock).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const up = await backendAvailable();
      if (cancelled) return;
      setBackendOnline(up);
      if (!up) return;
      const res = await backendListFasilitas();
      if (cancelled || !res.ok || !res.data || res.data.length === 0) return;
      setFacilities(res.data.map(mapBackendFasilitas));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AppDataValue>(
    () => ({
      facilities,
      reservations,
      reports,
      pendingAccounts,
      registeredAccounts,
      currentUser,
      backendOnline,

      facilityById: (id) => facilities.find((f) => f.id === id),
      isSlotTaken: (facilityId, slotStart, excludeId) =>
        isSlotBooked(reservations, facilityId, slotStart, excludeId),

      login: async (email, password) => {
        // Hanya akun backend terverifikasi (akun demo mock dihapus).
        // POST /auth/login -> cookie session_id, lalu GET /user/me
        // untuk username + role. Pesan error backend diteruskan apa adanya.
        try {
          const res = await backendLogin(email, password);
          if (res.ok) {
            const me = await backendMe();
            if (me.ok && me.data) {
              const user: LoggedInUser = {
                id: `backend-${me.data.email || email.trim().toLowerCase()}`,
                nama: me.data.username || email,
                email: me.data.email || email,
                role: roleIdToFrontend(me.data.role || '3'),
              };
              setCurrentUser(user);
              return { ok: true, user };
            }
            // Login cookie OK tapi /user/me gagal: tetap anggap login,
            // role default pengguna (jangan kunci user di luar).
            const fallback: LoggedInUser = {
              id: `backend-${email.trim().toLowerCase()}`,
              nama: email,
              email,
              role: 'pengguna',
            };
            setCurrentUser(fallback);
            return { ok: true, user: fallback };
          }
          return { ok: false, message: res.message || 'Email atau kata sandi salah.' };
        } catch (e) {
          return {
            ok: false,
            message: e instanceof Error ? e.message : 'Backend tidak terjangkau.',
          };
        }
      },
      // Backend tidak punya POST /auth/logout (frozen): logout hanya
      // menghapus user lokal. Cookie server kedaluwarsa sendiri (1 jam).
      logout: () => setCurrentUser(null),
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
              angkatan: String(input.angkatan ?? new Date().getFullYear()),
              nama_lengkap: nama,
              prodi,
            });
          }
          // Backend OK (atau backend menolak dengan alasan validasi asli):
          // tampilkan pesan backend apa adanya, dan cerminkan ke antrean
          // lokal agar halaman admin tetap melihatnya.
          if (res && (res.ok || res.status !== 0)) {
            if (res.ok) {
              setPendingAccounts((prev) => [
                ...prev,
                {
                  id: genId(),
                  nama: input.nama,
                  email: input.email,
                  username: input.username,
                  peran: input.peran,
                  nim: input.nim || input.nidn || input.nip,
                  nidn: input.nidn,
                  nip: input.nip,
                  angkatan: input.angkatan,
                  prodi: input.prodi,
                  phone: input.phone,
                  fakultas:
                    input.fakultas ||
                    input.prodi ||
                    (input.peran === 'Dosen'
                      ? 'Fakultas Teknik (FT)'
                      : 'Fakultas Sains dan Matematika (FSM)'),
                  status: 'menunggu',
                },
              ]);
            }
            return res;
          }
        } catch {
          // Backend mati -> lanjut ke mock di bawah.
        }
        const result = await apiRegisterSelf(input);
        if (result.ok) {
          setPendingAccounts((prev) => [
            ...prev,
            {
              id: genId(),
              nama: input.nama,
              email: input.email,
              username: input.username,
              peran: input.peran,
              nim: input.nim || input.nidn || input.nip,
              nidn: input.nidn,
              nip: input.nip,
              angkatan: input.angkatan,
              prodi: input.prodi,
              phone: input.phone,
              fakultas:
                input.fakultas ||
                input.prodi ||
                (input.peran === 'Dosen'
                  ? 'Fakultas Teknik (FT)'
                  : 'Fakultas Sains dan Matematika (FSM)'),
              status: 'menunggu',
            },
          ]);
        }
        return result;
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
        const conv = toCreateReservasiBody(
          facility,
          input.tanggal,
          input.start,
          input.end,
          input.tujuan,
          input.peserta,
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
        // Cerminkan ke state lokal agar riwayat/jadwal/dashboard langsung
        // menampilkannya (lifecycle approve tetap mock sampai ada endpoint).
        setReservations((prev) => [
          ...prev,
          {
            ...input,
            id: genId(),
            pemohon: user.nama,
            status: 'menunggu',
            createdAt: new Date().toISOString(),
          },
        ]);
        return { ok: true };
      },
      cancelReservation: (id) => {
        setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'dibatalkan' } : r)));
      },
      submitReport: async (input) => {
        // API-only: hanya session backend yang bisa melapor (konsisten
        // keputusan hapus-demo). Backend: POST /reports multipart
        // (alasan 1-255, kategori enum, tepat satu ruangan_id/alat_id,
        // foto jpg/jpeg/png <=2MB opsional).
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
        const foto = input.fotoFile ?? null;
        if (foto) {
          const isImage = /^(image\/jpeg|image\/png|image\/jpg)$/.test(foto.type);
          const extOk = /\.(jpe?g|png)$/i.test(foto.name);
          if (!isImage || !extOk) {
            return { ok: false, message: 'Format foto harus JPG atau PNG.' };
          }
          if (foto.size > 2 * 1024 * 1024) {
            return { ok: false, message: 'Ukuran foto maksimal 2MB.' };
          }
        }
        const res = await backendCreateLaporan({
          alasan,
          kategori: input.kategori,
          ...(target.kind === 'ruangan' ? { ruangan_id: target.ruangan_id } : { alat_id: target.alat_id }),
          ...(foto ? { foto } : {}),
        });
        if (!res.ok) {
          return { ok: false, message: res.message };
        }
        // Cerminkan ke state lokal agar Status Laporan langsung menampilkannya
        // (sisi petugas/admin tetap mock sampai ada sinkronisasi list).
        setReports((prev) => [
          ...prev,
          {
            ...input,
            foto: input.foto ?? (foto ? foto.name : undefined),
            id: genId(),
            pelapor: user.nama,
            status: 'baru',
            catatan: '',
            createdAt: new Date().toISOString(),
          },
        ]);
        return { ok: true };
      },

      approveReservation: (id) => {
        const target = reservations.find((r) => r.id === id);
        if (!target) return { ok: false, message: 'Reservasi tidak ditemukan.' };
        const conflict = hasRangeConflict(
          reservations,
          target.facilityId,
          target.tanggal,
          target.start,
          target.end,
          target.id
        );
        if (conflict) {
          return {
            ok: false,
            message: `Bentrok dengan reservasi '${conflict.pemohon}' (${conflict.start} - ${conflict.end} WIB) yang sudah disetujui sebelumnya.`,
          };
        }
        setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'disetujui' } : r)));
        return { ok: true };
      },
      rejectReservation: (id) => {
        setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'ditolak' } : r)));
      },
      cancelApprovedReservation: (id, alasan) => {
        setReservations((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: 'dibatalkan', catatanBatal: alasan } : r))
        );
      },
      resetReservationToWaiting: (id) => {
        setReservations((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: 'menunggu' } : r))
        );
      },
      updateReportStatus: (id, status, catatan) => {
        setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status, catatan: catatan ?? r.catatan } : r)));
      },
      setFacilityStatus: (facilityId, status) => {
        setFacilities((prev) => prev.map((f) => (f.id === facilityId ? { ...f, status } : f)));
      },

      addFacility: (input) => {
        setFacilities((prev) => [...prev, { ...input, id: `f${genId()}`, status: 'avail' }]);
      },
      updateFacility: (id, input) => {
        setFacilities((prev) => prev.map((f) => (f.id === id ? { ...f, ...input } : f)));
      },
      deleteFacility: (id) => {
        setFacilities((prev) => prev.filter((f) => f.id !== id));
      },
      registerAccountDirectly: (input: DirectRegisterInput) => {
        const exists = registeredAccounts.some(
          (a) => a.email.toLowerCase() === input.email.trim().toLowerCase()
        );
        if (exists) {
          return { ok: false, message: 'Email sudah terdaftar dalam sistem.' };
        }

        let role: UserRole = 'pengguna';
        if (input.peran.toLowerCase().includes('admin')) role = 'admin';
        else if (input.peran.toLowerCase().includes('petugas')) role = 'petugas';

        const newAcc: FakeUserRecord = {
          id: `u-${role}-${genId()}`,
          email: input.email.trim(),
          username: input.username?.trim(),
          password: input.password || 'Sipinjam2026!',
          nama: input.nama.trim(),
          role,
          nip: input.nip?.trim() || input.nim?.trim() || input.nidn?.trim() || '-',
          nim: input.nim?.trim(),
          nidn: input.nidn?.trim(),
          angkatan: input.angkatan,
          prodi: input.prodi?.trim(),
          phone: input.phone?.trim() || '-',
          unit: input.unit?.trim() || (input.prodi ? `Prodi ${input.prodi}` : 'Universitas Diponegoro'),
          jabatan: input.peran,
          status: 'aktif',
          createdAt: new Date().toISOString().split('T')[0],
        };

        setRegisteredAccounts((prev) => [newAcc, ...prev]);

        return { ok: true, account: newAcc };
      },
      toggleAccountStatus: (id: string) => {
        setRegisteredAccounts((prev) =>
          prev.map((acc) =>
            acc.id === id
              ? { ...acc, status: acc.status === 'aktif' ? 'nonaktif' : 'aktif' }
              : acc
          )
        );
      },
      verifyPendingAccount: (id, approve) => {
        setPendingAccounts((prev) =>
          prev.map((a) => {
            if (a.id === id) {
              if (approve) {
                const newAcc: FakeUserRecord = {
                  id: `u-pengguna-${genId()}`,
                  email: a.email,
                  username: a.username,
                  password: 'mhs12345',
                  nama: a.nama,
                  role: 'pengguna',
                  nip: a.nim || a.nidn || a.nip || '-',
                  nim: a.nim,
                  nidn: a.nidn,
                  angkatan: a.angkatan,
                  prodi: a.prodi,
                  phone: a.phone || '-',
                  unit: a.fakultas || (a.prodi ? `Prodi ${a.prodi}` : a.peran === 'Dosen' ? 'Fakultas Teknik (FT)' : 'Fakultas Sains dan Matematika (FSM)'),
                  jabatan: a.peran,
                  status: 'aktif',
                  createdAt: new Date().toISOString().split('T')[0],
                };
                setRegisteredAccounts((existing) => [newAcc, ...existing]);
              }
              return { ...a, status: approve ? 'diverifikasi' : 'ditolak' };
            }
            return a;
          })
        );
      },
    }),
    [facilities, reservations, reports, pendingAccounts, registeredAccounts, currentUser, backendOnline]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData harus dipakai di dalam <AppDataProvider>');
  return ctx;
}
