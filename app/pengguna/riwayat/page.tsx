'use client';

import { useState } from 'react';
import { useAppData } from '@/context/AppDataContext';
import { Reservation, ReservationStatus } from '@/models/reservation';
import { canSelfCancel } from '@/lib/cancellation';
import ReservationDetailModal from '@/components/ReservationDetailModal';

const STATUS_PILL: Record<ReservationStatus, [string, string]> = {
  menunggu: ['busy', 'Menunggu'],
  disetujui: ['avail', 'Disetujui'],
  ditolak: ['danger', 'Ditolak'],
  dibatalkan: ['repair', 'Dibatalkan'],
};

export default function RiwayatReservasiPage() {
  const { reservations, facilityById, currentUser, cancelReservation } = useAppData();
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

      <div className="panel table-scroll">
        <table>
          <thead>
            <tr>
              <th>Fasilitas</th>
              <th>Jadwal</th>
              <th>Tujuan</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {mine.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>
                  Belum ada reservasi.
                </td>
              </tr>
            )}
            {mine.map((r) => {
              const facility = facilityById(r.facilityId);
              const [cls, label] = STATUS_PILL[r.status];
              return (
                <tr key={r.id}>
                  <td>{facility?.name}</td>
                  <td>{r.tanggal}, {r.start}–{r.end}</td>
                  <td>{r.tujuan}</td>
                  <td><span className={`pill ${cls}`}>{label}</span></td>
                  <td>
                    <button className="btn" onClick={() => setDetailFor(r)}>
                      Lihat detail
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {detailFor && (
        <ReservationDetailModal
          reservation={detailFor}
          facility={facilityById(detailFor.facilityId)}
          onClose={() => setDetailFor(null)}
          onCancel={canSelfCancel(detailFor) ? cancelReservation : undefined}
        />
      )}
    </div>
  );
}
