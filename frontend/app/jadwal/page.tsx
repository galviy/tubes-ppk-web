'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SchedulePreview from '@/components/SchedulePreview';
import { useAppData } from '@/context/AppDataContext';
import { isAlatFacility } from '@/models/facilities-data';

function JadwalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, facilityById, facilities } = useAppData();
  const [activeFacilityId, setActiveFacilityId] = useState(searchParams.get('facility') || '');

  const facility = (activeFacilityId ? facilityById(activeFacilityId) : null) ?? facilities[0];

  function goOrLogin(path: string) {
    router.push(currentUser ? path : '/login');
  }

  return (
    <div className="ochoco-page-wrapper">
      <Navbar variant="dashboard" />

      {/* Top Breadcrumb & Back Navigation Bar */}
      <div className="ochoco-sub-header-bar">
        <div className="wrap ochoco-catalog-wrap ochoco-sub-header-row">
          <Link href="/" className="ochoco-back-button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>KEMBALI KE HOME</span>
          </Link>

          <div className="ochoco-breadcrumb">
            <span>Home</span>
            <span>/</span>
            <span style={{ color: '#b59876' }}>Schedule</span>
            <span>/</span>
            <span>Universitas Diponegoro</span>
          </div>
        </div>
      </div>

      <main className="ochoco-main-content">
        <div className="wrap ochoco-catalog-wrap">
          <div className="ochoco-page-head">
            <div className="ochoco-page-eyebrow">SLOT WAKTU 30 MENIT (07.00 - 20.00 WIB) • UNIVERSITAS DIPONEGORO</div>
            <h1 className="ochoco-page-title">
              AVAILABILITY <span style={{ color: '#b59876' }}>SCHEDULE</span>
            </h1>
            <p className="ochoco-page-subtitle">
              Pengecekan slot waktu 30 menit real-time untuk seluruh fasilitas akademik Universitas Diponegoro.
              Pilih tanggal mulai hari ini hingga beberapa hari ke depan, lalu pilih fasilitasnya, tanpa perlu login.
            </p>
            <div className="alert info" style={{ marginTop: 12 }}>
              <b>Ketentuan Batas Waktu Reservasi</b>: Pengajuan peminjaman fasilitas paling cepat <b>H+2</b>, yaitu minimal dua hari sebelum tanggal kegiatan (contoh: reservasi untuk tanggal 27 paling cepat diajukan pada tanggal 25). Verifikasi dan persetujuan jadwal akan diproses oleh petugas sarpras.
            </div>
          </div>

          <SchedulePreview activeFacilityId={activeFacilityId} onSelectFacility={setActiveFacilityId} />

          <div className="jadwal-cta-panel">
            <div>
              <div className="lbl-sm" style={{ color: '#b59876', marginBottom: 4 }}>TINDAK LANJUT FASILITAS</div>
              <h3>Sudah menemukan slot yang kosong untuk {facility?.name || 'fasilitas ini'}?</h3>
              <p>
                Ajukan permohonan reservasi sekarang, atau laporkan kendala/kerusakan fisik jika fasilitas
                ini membutuhkan perbaikan dari petugas.
              </p>
            </div>
            <div className="btn-row">
              <button className="btn primary" onClick={() => {
                const facType = facility && isAlatFacility(facility) ? 'alat' : 'ruangan';
                goOrLogin(`/pengguna/reservasi?facility=${facility?.id || activeFacilityId}&tipe=${facType}`);
              }}>
                Ajukan Reservasi
              </button>
              <button className="btn ghost-danger" onClick={() => goOrLogin(`/pengguna/lapor?facility=${facility?.id || activeFacilityId}`)}>
                Laporkan Kerusakan
              </button>
            </div>
            {!currentUser && (
              <p className="jadwal-cta-note">
                Anda perlu masuk (login) terlebih dahulu untuk memproses formulir reservasi atau laporan kerusakan.
              </p>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function JadwalPage() {
  return (
    <Suspense fallback={null}>
      <JadwalContent />
    </Suspense>
  );
}
