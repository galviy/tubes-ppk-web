// config/site.ts
// Konfigurasi sistem dan aturan operasional platform SiPinjam Universitas Diponegoro

export const SITE_CONFIG = {
  name: 'SiPinjam',
  fullName: 'Sistem Reservasi & Pelaporan Fasilitas Kampus',
  institution: 'Universitas Diponegoro',
  campus: 'Kampus Tembalang / Pleburan',
  
  // Aturan Operasional Reservasi (Sesuai Ketentuan Tugas PPK 2026)
  operational: {
    openTime: '07:00',
    closeTime: '20:00',
    slotDurationMinutes: 30,
    totalSlots: 26,
    minBookingSlots: 1, // 30 menit
    requirePurpose: true,
  },

  // Peran Aktor & Halaman Utama
  roles: {
    pengguna: {
      label: 'Pengguna (Mahasiswa / Dosen / Staf)',
      home: '/pengguna',
    },
    petugas: {
      label: 'Petugas',
      home: '/petugas',
    },
    admin: {
      label: 'Admin',
      home: '/admin',
    },
  },

  // Metadata Navigasi Publik
  navLinks: [
    { label: 'HOME', href: '/' },
    { label: 'FACILITIES', href: '/fasilitas' },
    { label: 'SCHEDULE', href: '/jadwal' },
    { label: 'GUIDE', href: '/panduan' },
  ],
} as const;

// Unit Kerja Resmi Operasional Petugas Sarpras & Pengelola Fasilitas Undip
export const UNIT_PETUGAS = [
  'Subbagian Rumah Tangga & Sarpras Undip',
  'Biro Umum & Pengelolaan Aset (BUPA) Undip',
  'UPT Laboratorium Terpadu Undip',
  'Pengelola Gedung Kuliah Bersama (GKB)',
  'Pengelola Sarana Olahraga Undip (Stadion/GSG)',
  'Pengelola Gedung Prof. Soedarto & ICT Undip',
] as const;

// Fakultas & Sekolah Civitas Akademika Universitas Diponegoro (Mahasiswa & Dosen)
export const FAKULTAS_UNDIP = [
  'Fakultas Sains dan Matematika (FSM)',
  'Fakultas Teknik (FT)',
  'Fakultas Ekonomika dan Bisnis (FEB)',
  'Fakultas Kedokteran (FK)',
  'Fakultas Hukum (FH)',
  'Fakultas Ilmu Sosial dan Ilmu Politik (FISIP)',
  'Fakultas Ilmu Budaya (FIB)',
  'Fakultas Psikologi',
  'Fakultas Kesehatan Masyarakat (FKM)',
  'Fakultas Perikanan dan Ilmu Kelautan (FPIK)',
  'Fakultas Peternakan dan Pertanian (FPP)',
  'Sekolah Vokasi (SV)',
  'Sekolah Pascasarjana',
] as const;

