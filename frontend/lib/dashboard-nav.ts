// lib/dashboard-nav.ts
//
// Konfigurasi navigasi dashboard, terpusat di satu tempat supaya
// aturan "siapa boleh lihat section apa" konsisten di seluruh app.

import { UserRole } from '@/mock/fake-users-db';

export interface NavItem {
  href: string;
  label: string;
}

export interface NavGroup {
  section: UserRole;
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    section: 'pengguna',
    label: 'Pengguna',
    items: [
      { href: '/pengguna', label: 'Ringkasan' },
      { href: '/pengguna/reservasi', label: 'Ajukan Reservasi' },
      { href: '/pengguna/riwayat', label: 'Riwayat Reservasi' },
      { href: '/pengguna/lapor', label: 'Lapor Kerusakan' },
      { href: '/pengguna/status-laporan', label: 'Status Laporan Saya' },
    ],
  },
  {
    section: 'petugas',
    label: 'Petugas',
    items: [
      { href: '/petugas', label: 'Ringkasan' },
      { href: '/petugas/reservasi', label: 'Antrian Reservasi' },
      { href: '/petugas/laporan', label: 'Antrian Laporan' },
      { href: '/petugas/fasilitas', label: 'Status Fasilitas' },
    ],
  },
  {
    section: 'admin',
    label: 'Admin',
    items: [
      { href: '/admin', label: 'Ringkasan' },
      { href: '/admin/fasilitas', label: 'Kelola Fasilitas' },
      { href: '/admin/reservasi', label: 'Semua Reservasi' },
      { href: '/admin/laporan', label: 'Semua Laporan' },
      { href: '/admin/akun', label: 'Kelola Akun' },
      { href: '/admin/rekap', label: 'Rekap & Ekspor' },
    ],
  },
];

// Setiap role HANYA mengakses section miliknya sendiri - sesuai user
// story masing-masing aktor di PDF (admin ya fitur admin saja, tidak
// perlu bisa buka halaman petugas/pengguna, begitu juga sebaliknya).
export const SECTION_ACCESS: Record<UserRole, UserRole[]> = {
  pengguna: ['pengguna'],
  petugas: ['petugas'],
  admin: ['admin'],
};

export function sectionFromPath(pathname: string): UserRole | null {
  if (pathname.startsWith('/admin')) return 'admin';
  if (pathname.startsWith('/petugas')) return 'petugas';
  if (pathname.startsWith('/pengguna')) return 'pengguna';
  return null;
}

export function canAccessSection(role: UserRole | undefined, section: UserRole): boolean {
  if (!role) return false;
  return SECTION_ACCESS[section].includes(role);
}

export const ROLE_HOME: Record<UserRole, string> = {
  pengguna: '/pengguna',
  petugas: '/petugas',
  admin: '/admin',
};
