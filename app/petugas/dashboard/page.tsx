'use client';

import Link from 'next/link';
import { useAppData } from '@/context/AppDataContext';

export default function PetugasDashboardPage() {
  const { reservations, reports, facilities, facilityById } = useAppData();

  const resMenunggu = reservations.filter((r) => r.status === 'menunggu').length;
  const lapBaru = reports.filter((r) => r.status === 'baru').length;
  const perbaikan = facilities.filter((f) => f.status === 'repair').length;
  const resDisetujui = reservations.filter((r) => r.status === 'disetujui').length;

  const pendingList = reservations.filter((r) => r.status === 'menunggu').slice(0, 3);
  const urgentReports = reports.filter((r) => r.status === 'baru' || r.status === 'diproses').slice(0, 3);

  return (
    <div>
      {/* Header Split */}
      <div className="dash-split-header">
        <h2>Dashboard petugas</h2>
        <p>Ringkasan antrian yang masih menunggu diproses.</p>
      </div>

      {/* 4 Stat Cards */}
      <div className="summary-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="summary-card">
          <div className="num">{resMenunggu}</div>
          <div className="lbl">Reservasi menunggu</div>
        </div>
        <div className="summary-card">
          <div className="num">{lapBaru}</div>
          <div className="lbl">Laporan baru</div>
        </div>
        <div className="summary-card">
          <div className="num">{perbaikan}</div>
          <div className="lbl">Fasilitas dalam perbaikan</div>
        </div>
        <div className="summary-card">
          <div className="num">{resDisetujui}</div>
          <div className="lbl">Reservasi disetujui</div>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="dash-notice-banner">
        <span>
          Kelola antrian dari menu{' '}
          <Link href="/petugas/reservasi" style={{ color: '#b59876', fontWeight: 600, textDecoration: 'underline' }}>
            Antrian Reservasi
          </Link>{' '}
          dan{' '}
          <Link href="/petugas/laporan" style={{ color: '#b59876', fontWeight: 600, textDecoration: 'underline' }}>
            Antrian Laporan
          </Link>{' '}
          di atas — jangan sampai ada permohonan yang terlewat.
        </span>
      </div>

      {/* Quick Summary Panels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24, marginTop: 12 }}>
        {/* Urgent Reservations Preview */}
        <div className="panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16 }}>Antrian Reservasi Menunggu ({resMenunggu})</h3>
            <Link href="/petugas/reservasi" style={{ fontSize: 12, color: '#b59876', fontWeight: 600 }}>
              Lihat Semua →
            </Link>
          </div>
          {pendingList.length === 0 ? (
            <p style={{ color: '#6B7280', fontSize: 13, margin: 0 }}>Tidak ada permohonan yang menunggu persetujuan.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {pendingList.map((r) => {
                const fac = facilityById(r.facilityId);
                return (
                  <div
                    key={r.id}
                    style={{
                      padding: '12px 14px',
                      background: '#FAF8F5',
                      border: '1px solid #EBE4D8',
                      borderRadius: 4,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#181D24' }}>{fac?.name || 'Fasilitas'}</div>
                      <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                        {r.pemohon} • {r.tanggal} ({r.start}–{r.end})
                      </div>
                    </div>
                    <span className="pill busy" style={{ fontSize: 10 }}>Menunggu</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Active Reports Preview */}
        <div className="panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16 }}>Laporan Kerusakan Aktif ({lapBaru})</h3>
            <Link href="/petugas/laporan" style={{ fontSize: 12, color: '#b59876', fontWeight: 600 }}>
              Lihat Semua →
            </Link>
          </div>
          {urgentReports.length === 0 ? (
            <p style={{ color: '#6B7280', fontSize: 13, margin: 0 }}>Tidak ada laporan kerusakan yang aktif.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {urgentReports.map((rep) => {
                const fac = facilityById(rep.facilityId);
                return (
                  <div
                    key={rep.id}
                    style={{
                      padding: '12px 14px',
                      background: '#FAF8F5',
                      border: '1px solid #EBE4D8',
                      borderRadius: 4,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#181D24' }}>{fac?.name || 'Fasilitas'}</div>
                      <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                        {rep.pelapor} • {rep.kategori}
                      </div>
                    </div>
                    <span className={`pill ${rep.status === 'baru' ? 'busy' : 'avail'}`} style={{ fontSize: 10 }}>
                      {rep.status === 'baru' ? 'Baru' : 'Diproses'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
