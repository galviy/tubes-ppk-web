'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAppData } from '@/context/AppDataContext';
import { backendGetFacilityById } from '@/lib/api';
import { Facility } from '@/models/facility';
import { isAlatFacility } from '@/models/facilities-data';

const statusBadge: Record<Facility['status'], { cls: string; label: string }> = {
  avail: { cls: 'avail', label: 'Tersedia' },
  busy: { cls: 'busy', label: 'Digunakan' },
  repair: { cls: 'repair', label: 'Perbaikan' },
  nonaktif: { cls: 'repair', label: 'Nonaktif' },
};

export default function FacilityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();
  const { facilities, currentUser } = useAppData();
  const [facility, setFacility] = useState<Facility | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Cek dari context
    const found = facilities.find((f) => f.id === id || String(f.refId) === id);
    if (found) {
      setFacility(found);
      setLoading(false);
      return;
    }

    // 2. Fetch langsung dari backend endpoint GET /fasilitas/:id
    backendGetFacilityById(id)
      .then((res) => {
        if (res.ok && res.data) {
          const b = res.data;
          const isAlat = b.tipe === 'alat' || id.startsWith('alat-');
          const fac: Facility = {
            id: b.id || (isAlat ? `alat-${b.ref_id}` : `ruangan-${b.ref_id}`),
            refId: b.ref_id,
            tipe: isAlat ? 'alat' : 'ruangan',
            name: b.name || '',
            type: b.type || '',
            loc: b.loc || '',
            cap: b.cap || 0,
            tersedia: b.jumlah_tersedia,
            desc: b.desc || '',
            amenities: b.amenities || [],
            status: (['avail', 'busy', 'repair', 'nonaktif'] as const).includes(b.status as any)
              ? (b.status as Facility['status'])
              : 'avail',
            image: b.image || undefined,
          };
          setFacility(fac);
        }
      })
      .finally(() => setLoading(false));
  }, [id, facilities]);

  function goOrLogin(path: string) {
    router.push(currentUser ? path : '/login');
  }

  if (loading) {
    return (
      <div className="ochoco-page-wrapper">
        <Navbar variant="dashboard" />
        <div style={{ maxWidth: 800, margin: '80px auto', textAlign: 'center', color: '#6B7280' }}>
          Memuat rincian fasilitas...
        </div>
        <Footer />
      </div>
    );
  }

  if (!facility) {
    return (
      <div className="ochoco-page-wrapper">
        <Navbar variant="dashboard" />
        <div style={{ maxWidth: 800, margin: '80px auto', textAlign: 'center' }}>
          <h2>Fasilitas Tidak Ditemukan</h2>
          <p style={{ color: '#6B7280', margin: '12px 0 24px' }}>
            Data fasilitas dengan ID &ldquo;{id}&rdquo; tidak terdaftar di sistem.
          </p>
          <Link href="/fasilitas" className="btn primary">
            Kembali ke Katalog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const badge = statusBadge[facility.status] || { cls: 'avail', label: 'Tersedia' };
  const isAlat = isAlatFacility(facility);

  return (
    <div className="ochoco-page-wrapper">
      <Navbar variant="dashboard" />

      {/* Breadcrumb */}
      <div className="ochoco-sub-header-bar">
        <div className="wrap ochoco-catalog-wrap ochoco-sub-header-row">
          <Link href="/fasilitas" className="ochoco-back-button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>KEMBALI KE KATALOG</span>
          </Link>

          <div className="ochoco-breadcrumb">
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
            <span>/</span>
            <Link href="/fasilitas" style={{ color: 'inherit', textDecoration: 'none' }}>Facilities</Link>
            <span>/</span>
            <span style={{ color: '#b59876' }}>{facility.name}</span>
          </div>
        </div>
      </div>

      <main className="wrap ochoco-catalog-wrap" style={{ padding: '40px 0 60px' }}>
        <div style={{ maxWidth: 850, margin: '0 auto', background: '#FFFFFF', border: '1px solid #E5E0D8', borderRadius: 8, padding: 30 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <span className={`badge-inline ${badge.cls}`}>{badge.label}</span>
              <h1 style={{ fontSize: 26, fontWeight: 700, margin: '10px 0 6px', color: '#181D24' }}>
                {facility.name}
              </h1>
              <div style={{ color: '#6B7280', fontSize: 14 }}>
                {facility.type} • {facility.loc}
              </div>
            </div>
          </div>

          {facility.image && (
            <div style={{ width: '100%', height: 320, borderRadius: 6, overflow: 'hidden', margin: '20px 0', border: '1px solid #E5E0D8' }}>
              <img src={facility.image} alt={facility.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}

          <div style={{ marginTop: 20 }}>
            <h4 style={{ fontSize: 15, fontWeight: 700, color: '#181D24', marginBottom: 8 }}>Deskripsi</h4>
            <p style={{ color: '#374151', fontSize: 14.5, lineHeight: 1.6 }}>
              {facility.desc || 'Tidak ada deskripsi detail.'}
            </p>
          </div>

          <div className="modal-info-grid" style={{ margin: '24px 0', background: '#FAF8F5', padding: 18, borderRadius: 6 }}>
            <div>
              <span className="lbl-sm">{isAlat ? 'Jumlah Tersedia' : 'Kapasitas Ruangan'}</span>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#181D24' }}>
                {isAlat ? facility.tersedia ?? facility.cap : facility.cap} {isAlat ? 'unit' : 'orang'}
              </div>
            </div>
            <div>
              <span className="lbl-sm">Kelengkapan Fasilitas</span>
              <div style={{ fontSize: 14.5, color: '#181D24' }}>
                {facility.amenities && facility.amenities.length > 0 ? facility.amenities.join(', ') : '-'}
              </div>
            </div>
          </div>

          {!currentUser && (
            <div className="alert info" style={{ marginBottom: 20 }}>
              Kamu belum masuk. Untuk mengajukan reservasi atau melaporkan kerusakan, silakan login dulu,
              tapi jadwal ketersediaannya bisa kamu cek tanpa login.
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', paddingTop: 10, borderTop: '1px solid #E5E0D8' }}>
            <Link
              href={`/jadwal?facility=${facility.id}&tipe=${isAlat ? 'alat' : 'ruangan'}`}
              className="btn"
              style={{ padding: '9px 18px' }}
            >
              Lihat Jadwal
            </Link>
            <button
              className="btn primary"
              disabled={facility.status === 'repair' || facility.status === 'nonaktif'}
              onClick={() => goOrLogin(`/pengguna/reservasi?facility=${facility.id}&tipe=${isAlat ? 'alat' : 'ruangan'}`)}
              style={{ padding: '9px 18px' }}
            >
              Ajukan Reservasi
            </button>
            <button
              className="btn ghost-danger"
              onClick={() => goOrLogin(`/pengguna/lapor?facility=${facility.id}`)}
              style={{ padding: '9px 18px' }}
            >
              Laporkan Kerusakan
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
