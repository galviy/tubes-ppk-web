'use client';

import { Reservation, ReservationStatus } from '@/models/reservation';
import { Facility } from '@/models/facility';
import { canSelfCancel, formatDeadline, getCancellationDeadline } from '@/lib/cancellation';

const STATUS_PILL: Record<ReservationStatus, [string, string]> = {
  menunggu: ['busy', 'Menunggu'],
  disetujui: ['avail', 'Disetujui'],
  ditolak: ['danger', 'Ditolak'],
  dibatalkan: ['repair', 'Dibatalkan'],
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

interface ReservationDetailModalProps {
  reservation: Reservation;
  facility: Facility | undefined;
  onClose: () => void;
  onCancel?: (id: number) => void;
  /** Jika true, tombol Batal tampil tapi diklik tidak terjadi apa-apa. */
  cancelNoop?: boolean;
}

export default function ReservationDetailModal({ reservation, facility, onClose, onCancel, cancelNoop }: ReservationDetailModalProps) {
  const [cls, label] = STATUS_PILL[reservation.status];
  const cancellable = canSelfCancel(reservation);
  const deadline = getCancellationDeadline(reservation);
  const deadlinePassed = deadline.getTime() <= Date.now();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Tutup">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>

        <div className="modal-title-row">
          <h3>{facility?.name}</h3>
          <span className={`pill ${cls}`}>{label}</span>
        </div>

        <div className="detail-rows">
          <div><span>ID Reservasi</span><b>r{reservation.id}</b></div>
          <div><span>Fasilitas</span><b>{facility?.name}</b></div>
          <div><span>Lokasi</span><b>{facility?.loc}</b></div>
          <div><span>Tanggal</span><b>{reservation.tanggal}</b></div>
          <div><span>Waktu</span><b>{reservation.start} - {reservation.end}</b></div>
          <div>
            <span>{facility?.type?.toLowerCase() === 'alat' ? 'Jumlah unit' : 'Jumlah peserta'}</span>
            <b>{reservation.peserta ? `${reservation.peserta} ${facility?.type?.toLowerCase() === 'alat' ? 'unit' : 'orang'}` : '-'}</b>
          </div>
          <div><span>Tujuan</span><b>{reservation.tujuan}</b></div>
          <div><span>Status</span><b>{label}</b></div>
          <div><span>Tanggal pengajuan</span><b>{formatDateTime(reservation.createdAt)}</b></div>
          {reservation.catatanBatal && (
            <div><span>Catatan pembatalan petugas</span><b>{reservation.catatanBatal}</b></div>
          )}
        </div>

        {(reservation.status === 'menunggu' || reservation.status === 'disetujui') && (
          <div className={`deadline-box ${deadlinePassed ? 'passed' : ''}`}>
            <b>Batas waktu pembatalan:</b> {formatDeadline(deadline)}
            <div className="deadline-note">
              ⚠ Batas pembatalan adalah 2 jam sebelum mulai{deadlinePassed ? ' (sudah lewat)' : ''}
            </div>
          </div>
        )}

        {cancellable && (onCancel || cancelNoop) && (
          <div className="btn-row" style={{ marginTop: 18 }}>
            <button
              className="btn ghost-danger"
              style={{ width: '100%', justifyContent: 'center' }}
              title={cancelNoop ? 'Menunggu endpoint backend — tombol tidak melakukan apa-apa' : undefined}
              onClick={() => {
                if (cancelNoop) return;
                onCancel!(reservation.id);
                onClose();
              }}
            >
              Batalkan reservasi
            </button>
          </div>
        )}
        {cancellable && !onCancel && (
          <div className="deadline-box passed" style={{ marginTop: 18 }}>
            <div className="deadline-note">
              Pembatalan mandiri via sistem belum tersedia (menunggu endpoint backend). Hubungi petugas sarpras.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
