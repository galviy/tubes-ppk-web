'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SchedulePreview from '@/components/SchedulePreview';
import { useAppData } from '@/context/AppDataContext';

function JadwalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, facilityById } = useAppData();
  const [activeFacilityId, setActiveFacilityId] = useState(searchParams.get('facility') || 'aula');
  const facility = facilityById(activeFacilityId);

  function goOrLogin(path: string) {
    router.push(currentUser ? path : '/login');
  }

  return (
    <div className="ochoco-page-wrapper">
      <Navbar variant="dashboard" />

      {/* Top Breadcrumb & Back Navigation Bar */}
      <div className="ochoco-sub-header-bar">
        <div className="wrap ochoco-sub-header-row">
          <Link href="/" className="ochoco-back-button">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
        <div className="wrap">
          <div className="ochoco-page-head">
            <div className="ochoco-page-eyebrow">SLOT WAKTU 30 MENIT (07.00 – 20.00 WIB) • UNIVERSITAS DIPONEGORO</div>
            <h1 className="ochoco-page-title">
              AVAILABILITY <span style={{ color: '#b59876' }}>SCHEDULE</span>
            </h1>
            <p className="ochoco-page-subtitle">
              Pengecekan slot waktu 30 menit real-time untuk seluruh fasilitas akademik Universitas Diponegoro.
              Pilih fasilitas di bawah ini untuk melihat ketersediaan slot hari ini tanpa harus login.
            </p>
          </div>

          <SchedulePreview activeFacilityId={activeFacilityId} onSelectFacility={setActiveFacilityId} />

          <div className="jadwal-cta-panel">
            <div>
              <div className="lbl-sm" style={{ color: '#b59876', marginBottom: 4 }}>TINDAK LANJUT FASILITAS</div>
              <h3>Sudah menemukan slot yang kosong untuk {facility?.name}?</h3>
              <p>
                Ajukan permohonan reservasi sekarang, atau laporkan kendala/kerusakan fisik jika fasilitas
                ini membutuhkan perbaikan dari petugas.
              </p>
            </div>
            <div className="btn-row">
              <button className="btn primary" onClick={() => goOrLogin(`/pengguna/reservasi?facility=${activeFacilityId}`)}>
                Ajukan Reservasi
              </button>
              <button className="btn ghost-danger" onClick={() => goOrLogin(`/pengguna/lapor?facility=${activeFacilityId}`)}>
                Laporkan Kerusakan
              </button>
            </div>
            {!currentUser && (
              <p className="jadwal-cta-note">
                ⓘ Anda perlu masuk (login) terlebih dahulu untuk memproses formulir reservasi atau laporan kerusakan.
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
