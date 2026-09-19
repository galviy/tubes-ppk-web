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
import { isSlotBooked } from '@/lib/slots';
import { login as apiLogin, registerSelf as apiRegisterSelf, AuthResult } from '@/mock/auth-api';
import { UserRole } from '@/mock/fake-users-db';

let nextId = 1000;
function genId() {
  nextId += 1;
  return nextId;
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
  submitSelfRegistration: (nama: string, email: string, peran: string) => Promise<{ ok: boolean; message: string }>;

  // Pengguna
  submitReservation: (input: Omit<Reservation, 'id' | 'pemohon' | 'status' | 'createdAt'>) => void;
  cancelReservation: (id: number) => void;
  submitReport: (input: Omit<Report, 'id' | 'pelapor' | 'status' | 'catatan' | 'createdAt'>) => void;

  // Petugas
  approveReservation: (id: number) => { ok: boolean; message?: string };
  rejectReservation: (id: number) => void;
  cancelApprovedReservation: (id: number, alasan: string) => void;
  updateReportStatus: (id: number, status: Report['status'], catatan?: string) => void;
  setFacilityStatus: (facilityId: string, status: Facility['status']) => void;

  // Admin
  addFacility: (input: Omit<Facility, 'id' | 'status'>) => void;
  updateFacility: (id: string, input: Omit<Facility, 'id' | 'status'>) => void;
  registerAccountDirectly: (nama: string, email: string, peran: string) => void;
  verifyPendingAccount: (id: number, approve: boolean) => void;
}

const AppDataContext = createContext<AppDataValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [facilities, setFacilities] = useState<Facility[]>(SEED_FACILITIES);
  const [reservations, setReservations] = useState<Reservation[]>(SEED_RESERVATIONS);
  const [reports, setReports] = useState<Report[]>(SEED_REPORTS);
  const [pendingAccounts, setPendingAccounts] = useState<PendingAccount[]>(SEED_PENDING_ACCOUNTS);
  const [currentUser, setCurrentUser] = useState<LoggedInUser | null>(null);

  const value = useMemo<AppDataValue>(
    () => ({
      facilities,
      reservations,
      reports,
      pendingAccounts,
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
      submitSelfRegistration: async (nama, email, peran) => {
        const result = await apiRegisterSelf({ nama, email, peran });
        if (result.ok) {
          setPendingAccounts((prev) => [...prev, { id: genId(), nama, email, peran, status: 'menunggu' }]);
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
        if (isSlotBooked(reservations, target.facilityId, target.start, target.id)) {
          return { ok: false, message: 'Bentrok dengan reservasi lain yang sudah disetujui pada slot ini.' };
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
      registerAccountDirectly: () => {
        // Prototipe UI: pendaftaran langsung oleh admin tidak melalui
        // antrean verifikasi. Pada implementasi asli, ini memanggil API
        // pembuatan akun (petugas/pengguna) di backend.
      },
      verifyPendingAccount: (id, approve) => {
        setPendingAccounts((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: approve ? 'diverifikasi' : 'ditolak' } : a))
        );
      },
    }),
    [facilities, reservations, reports, pendingAccounts, currentUser]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData harus dipakai di dalam <AppDataProvider>');
  return ctx;
}
