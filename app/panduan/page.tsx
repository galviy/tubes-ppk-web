'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const STEPS = [
  {
    num: '01',
    title: 'Cari Fasilitas & Cek Slot Waktu',
    tag: 'Eksplorasi Publik',
    desc: 'Buka katalog fasilitas untuk melihat denah lantai, kapasitas ruangan, serta fasilitas penunjang. Periksa matriks jadwal 30 menit (07.00–20.00 WIB) untuk memastikan slot waktu yang Anda inginkan masih berstatus Tersedia.',
    link: '/jadwal',
    linkText: 'Cek Matriks Jadwal →',
  },
  {
    num: '02',
    title: 'Ajukan Formulir Reservasi',
    tag: 'Autentikasi Akun',
    desc: 'Masuk dengan akun civitas akademika Undip Anda. Tentukan tanggal, jam mulai, jam selesai, estimasi jumlah peserta, serta tujuan kegiatan. Sistem otomatis memvalidasi potensi bentrok jadwal dan batas kapasitas ruangan.',
    link: '/#auth',
    linkText: 'Buka Form Masuk →',
  },
  {
    num: '03',
    title: 'Verifikasi Petugas & Penggunaan',
    tag: 'Persetujuan Sarpras',
    desc: 'Petugas sarpras akan mengevaluasi permohonan Anda. Setelah disetujui, slot waktu otomatis terkunci untuk Anda dan fasilitas siap digunakan. Anda juga dapat memantau riwayat atau membatalkan permohonan secara mandiri.',
    link: '/pengguna/riwayat',
    linkText: 'Lihat Riwayat Reservasi →',
  },
];

const FAQS = [
  {
    q: 'Apakah pengunjung publik bisa mengecek jadwal tanpa login?',
    a: 'Ya. Seluruh katalog fasilitas dan jadwal ketersediaan slot 30 menit dapat diakses secara transparan oleh publik tanpa perlu login terlebih dahulu.',
  },
  {
    q: 'Berapa batas durasi peminjaman fasilitas dalam satu hari?',
    a: 'Peminjaman minimal 1 slot (30 menit) dan maksimal hingga rentang operasional penuh dari pukul 07.00 hingga 20.00 WIB pada hari yang sama.',
  },
  {
    q: 'Bagaimana jika fasilitas yang dipinjam mengalami kendala atau kerusakan?',
    a: 'Civitas akademika dapat melaporkan kendala melalui menu "Lapor Kerusakan" dengan melampirkan foto/video bukti agar segera ditangani oleh petugas teknisi sarpras.',
  },
  {
    q: 'Bagaimana jika pengajuan reservasi bentrok dengan kegiatan lain?',
    a: 'Sistem SiPinjam secara otomatis mendeteksi bentrok jadwal dan melarang pengajuan pada jam yang telah terkunci atau disetujui untuk pemohon lain.',
  },
];

export default function PanduanPage() {
  return (
    <div className="ochoco-page-wrapper">
      <Navbar variant="dashboard" />

      {/* Top Breadcrumb Header */}
      <div className="ochoco-sub-header-bar">
        <div className="wrap ochoco-sub-header-row">
          <Link href="/" className="ochoco-back-button">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>KEMBALI KE HOME</span>
          </Link>
          <div className="ochoco-sub-header-title">PANDUAN SISTEM SIPINJAM</div>
        </div>
      </div>

      {/* Main Content Wrap */}
      <div className="wrap" style={{ padding: '48px 28px 80px' }}>
        {/* Banner Section */}
        <div style={{ maxWidth: 840, marginBottom: 48 }}>
          <div className="ochoco-hero-badge" style={{ marginBottom: 12 }}>
            PANDUAN PENGGUNA (USER STORY US-03)
          </div>
          <h1 style={{ fontFamily: 'var(--font)', fontSize: 36, fontWeight: 600, color: '#181D24', letterSpacing: '-0.01em', lineHeight: 1.2, margin: '0 0 14px 0' }}>
            Tata Cara Reservasi & Pelaporan Fasilitas Kampus
          </h1>
          <p style={{ fontFamily: 'var(--font)', fontSize: 15, color: '#6B7280', lineHeight: 1.7, margin: 0 }}>
            Panduan lengkap alur 3 langkah bagi mahasiswa, dosen, dan staf Universitas Diponegoro untuk mengajukan izin peminjaman ruangan atau peralatan akademik serta prosedur pelaporan kendala sarpras secara transparan.
          </p>
        </div>

        {/* 3 Step Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 60 }}>
          {STEPS.map((s) => (
            <div
              key={s.num}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E5E0D8',
                borderRadius: 8,
                padding: '32px 28px',
                boxShadow: '0 10px 25px -10px rgba(21, 23, 26, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                  <span
                    style={{
                      fontFamily: 'var(--font)',
                      fontSize: 22,
                      fontWeight: 700,
                      color: '#b59876',
                      background: 'rgba(181, 152, 118, 0.12)',
                      padding: '4px 12px',
                      borderRadius: 6,
                    }}
                  >
                    {s.num}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font)',
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: '#6B7280',
                    }}
                  >
                    {s.tag}
                  </span>
                </div>

                <h3 style={{ fontFamily: 'var(--font)', fontSize: 18, fontWeight: 600, color: '#181D24', margin: '0 0 12px 0' }}>
                  {s.title}
                </h3>
                <p style={{ fontFamily: 'var(--font)', fontSize: 13.5, color: '#4B5563', lineHeight: 1.65, margin: 0 }}>
                  {s.desc}
                </p>
              </div>

              <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #F3F4F6' }}>
                <Link
                  href={s.link}
                  style={{
                    fontFamily: 'var(--font)',
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: '#b59876',
                    letterSpacing: '0.04em',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  {s.linkText}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Regulations & Policies */}
        <div
          style={{
            background: '#15171a',
            color: '#FFFFFF',
            borderRadius: 8,
            padding: '36px 32px',
            marginBottom: 60,
            border: '1px solid rgba(181, 152, 118, 0.3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span style={{ color: '#b59876', fontSize: 20 }}>📋</span>
            <h2 style={{ fontFamily: 'var(--font)', fontSize: 20, fontWeight: 600, color: '#FFFFFF', margin: 0 }}>
              Ketentuan & Tata Tertib Peminjaman
            </h2>
          </div>
          <ul style={{ margin: 0, paddingLeft: 22, color: 'rgba(255, 255, 255, 0.85)', fontSize: 13.5, lineHeight: 1.8 }}>
            <li>Permohonan reservasi diajukan paling lambat 1 hari sebelum kegiatan berlangsung.</li>
            <li>Slot waktu berlaku kelipatan 30 menit dari pukul 07.00 sampai dengan 20.00 WIB.</li>
            <li>Pemohon wajib menjaga kebersihan, ketertiban, dan keutuhan fasilitas yang digunakan.</li>
            <li>Jika terjadi kerusakan selama pemakaian, pemohon segera melapor melalui portal SiPinjam.</li>
            <li>Pembatalan reservasi oleh pemohon dapat dilakukan secara mandiri selama status masih <em>menunggu</em>.</li>
          </ul>
        </div>

        {/* FAQ Section */}
        <div>
          <div style={{ marginBottom: 24 }}>
            <div className="ochoco-card-eyebrow">PERTANYAAN UMUM</div>
            <h2 style={{ fontFamily: 'var(--font)', fontSize: 24, fontWeight: 600, color: '#181D24', margin: 0 }}>
              Frequently Asked Questions (FAQ)
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E5E0D8',
                  borderRadius: 8,
                  padding: '22px 24px',
                }}
              >
                <h4 style={{ fontFamily: 'var(--font)', fontSize: 15, fontWeight: 600, color: '#181D24', margin: '0 0 8px 0' }}>
                  {faq.q}
                </h4>
                <p style={{ fontFamily: 'var(--font)', fontSize: 13, color: '#6B7280', lineHeight: 1.6, margin: 0 }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
