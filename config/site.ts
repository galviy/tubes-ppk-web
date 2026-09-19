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
      label: 'Pengguna (Mahasiswa / Dosen)',
      home: '/pengguna',
    },
    petugas: {
      label: 'Petugas Sarpras',
      home: '/petugas',
    },
    admin: {
      label: 'Admin Sarpras',
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
