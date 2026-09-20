'use client';

import { createContext, useContext, useMemo, useState, ReactNode } from 'react';
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
import { login as apiLogin, registerSelf as apiRegisterSelf, AuthResult, SelfRegisterInput } from '@/mock/auth-api';
import { UserRole, FakeUserRecord, FAKE_USERS_DB } from '@/mock/fake-users-db';

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
  submitReservation: (input: Omit<Reservation, 'id' | 'pemohon' | 'status' | 'createdAt'>) => void;
  cancelReservation: (id: number) => void;
  submitReport: (input: Omit<Report, 'id' | 'pelapor' | 'status' | 'catatan' | 'createdAt'>) => void;

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

  const value = useMemo<AppDataValue>(
    () => ({
      facilities,
      reservations,
      reports,
      pendingAccounts,
      registeredAccounts,
      currentUser,

      facilityById: (id) => facilities.find((f) => f.id === id),
      isSlotTaken: (facilityId, slotStart, excludeId) =>
        isSlotBooked(reservations, facilityId, slotStart, excludeId),

      login: async (email, password) => {
        const result = await apiLogin(email, password);
        if (result.ok && result.user) setCurrentUser(result.user);
        return result;
      },
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

      submitReservation: (input) => {
        setReservations((prev) => [
          ...prev,
          {
            ...input,
            id: genId(),
            pemohon: currentUser?.nama ?? 'Pengguna',
            status: 'menunggu',
            createdAt: new Date().toISOString(),
          },
        ]);
      },
      cancelReservation: (id) => {
        setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'dibatalkan' } : r)));
      },
      submitReport: (input) => {
        setReports((prev) => [
          ...prev,
          {
            ...input,
            id: genId(),
            pelapor: currentUser?.nama ?? 'Pengguna',
            status: 'baru',
            catatan: '',
            createdAt: new Date().toISOString(),
          },
        ]);
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
            message: `Bentrok dengan reservasi '${conflict.pemohon}' (${conflict.start}–${conflict.end} WIB) yang sudah disetujui sebelumnya.`,
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
    [facilities, reservations, reports, pendingAccounts, registeredAccounts, currentUser]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData harus dipakai di dalam <AppDataProvider>');
  return ctx;
}
