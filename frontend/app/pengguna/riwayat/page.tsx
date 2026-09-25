'use client';

import { useState } from 'react';
import { useAppData } from '@/context/AppDataContext';
import { Reservation, ReservationStatus } from '@/models/reservation';
import ReservationDetailModal from '@/components/ReservationDetailModal';
import { formatDateIndo } from '@/lib/slots';

const STATUS_PILL: Record<ReservationStatus, [string, string]> = {
  menunggu: ['busy', 'Menunggu'],
  disetujui: ['avail', 'Disetujui'],
  ditolak: ['danger', 'Ditolak'],
  dibatalkan: ['repair', 'Dibatalkan'],
};

export default function RiwayatReservasiPage() {
  const { reservations, facilityById, currentUser } = useAppData();
  const mine = reservations.filter((r) => r.pemohon === currentUser?.nama);
  const [detailFor, setDetailFor] = useState<Reservation | null>(null);

  return (
    <div>
      <div className="content-head">
        <h2>Reservasi saya</h2>
        <p>Riwayat pengajuan reservasi fasilitas kampus.</p>
      </div>

      <div className="alert info">
        Batas waktu pembatalan: minimal <b>2 jam</b> sebelum waktu mulai reservasi.
      </div>

      <div className="card-list">
        {mine.length === 0 && (
          <div className="panel" style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>
            Belum ada reservasi.
          </div>
        )}
        {mine.map((r) => {
          const facility = facilityById(r.facilityId);
          const [cls, label] = STATUS_PILL[r.status];
          return (
            <div key={r.id} className="item-card">
              <div className="item-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <h3 style={{ fontSize: 17, margin: 0 }}>{facility?.name}</h3>
                  <span className={`pill ${cls}`}>{label}</span>
                </div>
                <button className="btn ghost" onClick={() => setDetailFor(r)}>
                  Lihat Detail
                </button>
              </div>
              <div className="item-card-body">
                <div className="item-meta-row">
                  <span className="meta-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    {formatDateIndo(r.tanggal)}
                  </span>
                  <span className="meta-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    {r.start} - {r.end}
                  </span>
                  {r.peserta && (
                    <span className="meta-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                      {r.peserta} {facility?.type?.toLowerCase() === 'alat' ? 'unit' : 'orang'}
                    </span>
                  )}
                  <span className="meta-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    {facility?.loc}
                  </span>
                </div>
                <div style={{ marginTop: 12, color: 'var(--ink-body)' }}>
                  Tujuan: {r.tujuan}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {detailFor && (
        <ReservationDetailModal
          reservation={detailFor}
          facility={facilityById(detailFor.facilityId)}
          onClose={() => setDetailFor(null)}
          cancelNoop
        />
      )}
    </div>
  );
}
