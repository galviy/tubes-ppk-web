'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
    <>
      <div style={{ background: 'var(--offwhite)' }}>
        <Navbar />
      </div>

      <section className="pub">
        <div className="wrap">
          <SchedulePreview activeFacilityId={activeFacilityId} onSelectFacility={setActiveFacilityId} />

          <div className="jadwal-cta-panel">
            <div>
              <h3>Sudah lihat slot yang kosong?</h3>
              <p>
                Ajukan reservasi untuk <b>{facility?.name}</b>, atau laporkan kalau ada kerusakan pada
                fasilitas ini.
              </p>
            </div>
            <div className="btn-row">
              <button className="btn primary" onClick={() => goOrLogin(`/pengguna/reservasi?facility=${activeFacilityId}`)}>
                Ajukan reservasi
              </button>
              <button className="btn ghost-danger" onClick={() => goOrLogin(`/pengguna/lapor?facility=${activeFacilityId}`)}>
                Laporkan kerusakan
              </button>
            </div>
            {!currentUser && <p className="jadwal-cta-note">Kamu perlu masuk dulu untuk mengajukan reservasi atau laporan.</p>}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default function JadwalPage() {
  return (
    <Suspense fallback={null}>
      <JadwalContent />
    </Suspense>
  );
}
