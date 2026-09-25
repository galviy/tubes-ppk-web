'use client';

import { useState } from 'react';
import { Reservation, ReservationStatus } from '@/models/reservation';
import { Facility } from '@/models/facility';
import { canSelfCancel, formatDeadline, getCancellationDeadline } from '@/lib/cancellation';
import { formatDateIndo } from '@/lib/slots';

const STATUS_PILL: Record<ReservationStatus, [string, string]> = {
  menunggu: ['busy', 'Menunggu'],
  disetujui: ['avail', 'Disetujui'],
  ditolak: ['danger', 'Ditolak'],
  dibatalkan: ['repair', 'Dibatalkan'],
  selesai: ['avail', 'Selesai'],
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface ReservationDetailModalProps {
  reservation: Reservation;
  facility: Facility | undefined;
  onClose: () => void;
  onCancel?: (id: number, alasan: string) => Promise<void> | void;
}

export default function ReservationDetailModal({
  reservation,
  facility,
  onClose,
  onCancel,
}: ReservationDetailModalProps) {
  const [cls, label] = STATUS_PILL[reservation.status] || ['neutral', reservation.status];
  const cancellable = canSelfCancel(reservation);
  const deadline = getCancellationDeadline(reservation);
  const deadlinePassed = deadline.getTime() <= Date.now();

  const [isCancelling, setIsCancelling] = useState(false);
  const [alasan, setAlasan] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleConfirmCancel() {
    if (!alasan.trim()) {
      setErrorMsg('Alasan pembatalan wajib diisi.');
      return;
    }
    if (!onCancel) return;
    setLoading(true);
    setErrorMsg('');
    try {
      await onCancel(reservation.id, alasan.trim());
      onClose();
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Gagal membatalkan reservasi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Tutup">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <div className="modal-title-row">
          <h3>{facility?.name || reservation.ruanganNama || `Fasilitas #${reservation.facilityId}`}</h3>
          <span className={`pill ${cls}`}>{label}</span>
        </div>

        <div className="detail-rows">
          <div><span>ID Reservasi</span><b>r{reservation.id}</b></div>
          <div><span>Fasilitas</span><b>{facility?.name || reservation.ruanganNama || '-'}</b></div>
          <div><span>Lokasi</span><b>{facility?.loc || '-'}</b></div>
          <div><span>Tanggal</span><b>{formatDateIndo(reservation.tanggal)}</b></div>
          <div><span>Waktu</span><b>{reservation.start} - {reservation.end}</b></div>
          <div>
            <span>{facility?.type?.toLowerCase() === 'alat' ? 'Jumlah unit' : 'Jumlah peserta'}</span>
            <b>{reservation.peserta ? `${reservation.peserta} ${facility?.type?.toLowerCase() === 'alat' ? 'unit' : 'orang'}` : '-'}</b>
          </div>
          <div><span>Tujuan</span><b>{reservation.tujuan}</b></div>
          <div><span>Status</span><b>{label}</b></div>
          <div><span>Tanggal pengajuan</span><b>{formatDateTime(reservation.createdAt)}</b></div>
          {reservation.catatanBatal && (
            <div><span>Catatan / Alasan</span><b>{reservation.catatanBatal}</b></div>
          )}
        </div>

        {(reservation.status === 'menunggu' || reservation.status === 'disetujui') && !isCancelling && (
          <div className={`deadline-box ${deadlinePassed ? 'passed' : ''}`}>
            <b>Batas waktu pembatalan:</b> {formatDeadline(deadline)}
            <div className="deadline-note">
              ⚠ Batas pembatalan adalah 2 jam sebelum mulai{deadlinePassed ? ' (sudah lewat)' : ''}
            </div>
          </div>
        )}

        {isCancelling ? (
          <div style={{ marginTop: 18, borderTop: '1px solid #E5E0D8', paddingTop: 16 }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: 14, color: '#DC2626' }}>
              Batalkan Permohonan Reservasi
            </h4>
            <p style={{ fontSize: 13, color: '#4B5563', margin: '0 0 10px 0' }}>
              Tuliskan alasan pembatalan reservasi ini (wajib diisi):
            </p>
            <textarea
              value={alasan}
              onChange={(e) => {
                setAlasan(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="Contoh: Jadwal perkuliahan diganti atau kegiatan dibatalkan..."
              rows={3}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 6,
                border: errorMsg ? '1.5px solid #DC2626' : '1px solid #D5D0C7',
                fontSize: 13,
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
            {errorMsg && (
              <div style={{ color: '#DC2626', fontSize: 12, marginTop: 4 }}>{errorMsg}</div>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button
                type="button"
                className="btn ghost"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => {
                  setIsCancelling(false);
                  setErrorMsg('');
                }}
                disabled={loading}
              >
                Kembali
              </button>
              <button
                type="button"
                className="btn ghost-danger"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={handleConfirmCancel}
                disabled={loading}
              >
                {loading ? 'Memproses...' : 'Ya, Batalkan'}
              </button>
            </div>
          </div>
        ) : (
          cancellable && onCancel && (
            <div className="btn-row" style={{ marginTop: 18 }}>
              <button
                className="btn ghost-danger"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => setIsCancelling(true)}
              >
                Batalkan reservasi
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
