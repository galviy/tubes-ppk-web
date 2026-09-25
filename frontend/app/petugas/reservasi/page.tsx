'use client';

import { useState, useEffect } from 'react';
import { useAppData } from '@/context/AppDataContext';
import { ReservationStatus } from '@/models/reservation';
import { formatDateIndo } from '@/lib/slots';
import ActionPromptModal, { ActionModalConfig } from '@/components/ActionPromptModal';

const STATUS_CONFIG: Record<ReservationStatus, { pillClass: string; label: string }> = {
  menunggu: { pillClass: 'busy', label: 'Menunggu' },
  disetujui: { pillClass: 'avail', label: 'Disetujui' },
  ditolak: { pillClass: 'danger', label: 'Ditolak' },
  dibatalkan: { pillClass: 'neutral', label: 'Dibatalkan' },
  selesai: { pillClass: 'avail', label: 'Selesai' },
};

export default function PetugasReservasiPage() {
  const {
    reservations,
    facilityById,
    updateReservationStatus,
    petugasCancelReservation,
    refreshReservations,
  } = useAppData();

  useEffect(() => {
    refreshReservations();
  }, [refreshReservations]);

  const [filterStatus, setFilterStatus] = useState<string>('semua');
  const [modalConfig, setModalConfig] = useState<ActionModalConfig>({
    isOpen: false,
    title: '',
    onConfirm: () => {},
  });
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Auto-dismiss popup notifikasi setelah 4.5 detik
  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => {
      setFeedback(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [feedback]);

  // Sort: 'menunggu' first, then 'disetujui', then others
  const sorted = [...reservations].sort((a, b) => {
    const order: Record<string, number> = { menunggu: 1, disetujui: 2, ditolak: 3, dibatalkan: 4, selesai: 5 };
    return (order[a.status] || 6) - (order[b.status] || 6);
  });

  const filtered = filterStatus === 'semua' ? sorted : sorted.filter((r) => r.status === filterStatus);

  function handleApprove(id: number, facilityName: string, pemohon: string) {
    setModalConfig({
      isOpen: true,
      title: 'Setujui Permohonan Reservasi',
      subtitle: `Apakah Anda yakin ingin menyetujui reservasi ${facilityName} yang diajukan oleh ${pemohon}?`,
      confirmText: 'Setujui',
      confirmVariant: 'success',
      showInput: false,
      onConfirm: async () => {
        const res = await updateReservationStatus(id, 'disetujui');
        if (!res.ok) {
          setFeedback({ type: 'error', message: res.message || 'Gagal menyetujui reservasi.' });
        } else {
          setFeedback({ type: 'success', message: 'Reservasi berhasil disetujui.' });
        }
      },
    });
  }

  function handleReject(id: number, facilityName: string, pemohon: string) {
    setModalConfig({
      isOpen: true,
      title: 'Tolak Permohonan Reservasi',
      subtitle: `Berikan alasan penolakan reservasi ${facilityName} oleh ${pemohon} agar diketahui pemohon.`,
      label: 'Alasan Penolakan',
      placeholder: 'Contoh: Ruangan akan digunakan untuk kegiatan kedinasan fakultas...',
      confirmText: 'Tolak Reservasi',
      confirmVariant: 'danger',
      showInput: true,
      requireInput: true,
      onConfirm: async (val) => {
        const res = await updateReservationStatus(id, 'ditolak', val);
        if (!res.ok) {
          setFeedback({ type: 'error', message: res.message || 'Gagal menolak reservasi.' });
        } else {
          setFeedback({ type: 'success', message: 'Reservasi berhasil ditolak.' });
        }
      },
    });
  }

  function handleCancelEmergency(id: number, facilityName: string, pemohon: string) {
    setModalConfig({
      isOpen: true,
      title: 'Batalkan Reservasi (Kondisi Mendesak)',
      subtitle: `Membatalkan reservasi ${facilityName} milik ${pemohon} yang telah disetujui sebelumnya.`,
      label: 'Alasan Pembatalan',
      placeholder: 'Contoh: Terjadi gangguan kelistrikan atau perbaikan darurat...',
      confirmText: 'Batalkan Reservasi',
      confirmVariant: 'danger',
      showInput: true,
      requireInput: true,
      onConfirm: async (val) => {
        const res = await petugasCancelReservation(id, val);
        if (!res.ok) {
          setFeedback({ type: 'error', message: res.message || 'Gagal membatalkan reservasi.' });
        } else {
          setFeedback({ type: 'success', message: 'Reservasi berhasil dibatalkan oleh petugas.' });
        }
      },
    });
  }

  return (
    <div>
      {/* Header Split */}
      <div className="dash-split-header">
        <h2>Antrian reservasi</h2>
        <p>Kelola persetujuan, penolakan, dan pembatalan reservasi fasilitas kampus secara langsung.</p>
      </div>

      {feedback && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            zIndex: 99999,
            maxWidth: 440,
            width: 'calc(100vw - 48px)',
            background: '#FFFFFF',
            border: feedback.type === 'success' ? '1px solid #BBF7D0' : '1px solid #FECACA',
            borderLeft: feedback.type === 'success' ? '5px solid #16A34A' : '5px solid #DC2626',
            borderRadius: 6,
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.2)',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div style={{ flexShrink: 0, marginTop: 1 }}>
            {feedback.type === 'success' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: 'var(--font)',
                fontWeight: 700,
                fontSize: 13,
                color: feedback.type === 'success' ? '#166534' : '#991B1B',
                marginBottom: 2,
              }}
            >
              {feedback.type === 'success' ? 'Pemberitahuan Berhasil' : 'Kendala Persetujuan'}
            </div>
            <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>
              {feedback.message}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            aria-label="Tutup notifikasi"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#9CA3AF',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 4,
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* Filter Chips */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        {[
          { key: 'semua', label: `Semua (${reservations.length})` },
          { key: 'menunggu', label: `Menunggu (${reservations.filter((r) => r.status === 'menunggu').length})` },
          { key: 'disetujui', label: `Disetujui (${reservations.filter((r) => r.status === 'disetujui').length})` },
          { key: 'ditolak', label: `Ditolak (${reservations.filter((r) => r.status === 'ditolak').length})` },
          { key: 'dibatalkan', label: `Dibatalkan (${reservations.filter((r) => r.status === 'dibatalkan').length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilterStatus(tab.key)}
            style={{
              padding: '7px 14px',
              borderRadius: 4,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              border: filterStatus === tab.key ? '1px solid #b59876' : '1px solid #E5E0D8',
              background: filterStatus === tab.key ? '#15171a' : '#FFFFFF',
              color: filterStatus === tab.key ? '#b59876' : '#6B7280',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table matching Reference Image 3 */}
      <div className="panel table-scroll" style={{ padding: 0, overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Pemohon</th>
              <th>Fasilitas</th>
              <th>Jadwal</th>
              <th>Peserta / Unit</th>
              <th>Tujuan</th>
              <th>Status</th>
              <th style={{ textAlign: 'left' }}>Tindakan</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#6B7280' }}>
                  Tidak ada data reservasi dalam kategori ini.
                </td>
              </tr>
            ) : (
              filtered.map((r) => {
                const fac = facilityById(r.facilityId);
                const facilityName = fac?.name || r.ruanganNama || `Fasilitas #${r.facilityId}`;
                const cfg = STATUS_CONFIG[r.status] || { pillClass: 'neutral', label: r.status };

                return (
                  <tr key={r.id}>
                    {/* PEMOHON */}
                    <td style={{ fontWeight: 600, color: '#181D24', whiteSpace: 'nowrap' }}>
                      {r.pemohon}
                    </td>

                    {/* FASILITAS */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span style={{ fontWeight: 600, color: '#181D24' }}>{facilityName}</span>
                    </td>

                    {/* JADWAL */}
                    <td style={{ whiteSpace: 'nowrap', fontSize: 13 }}>
                      <div>{formatDateIndo(r.tanggal)}</div>
                      <div style={{ color: '#6B7280', fontSize: 14 }}>{r.start} - {r.end}</div>
                    </td>

                    {/* PESERTA / UNIT */}
                    <td style={{ whiteSpace: 'nowrap', fontSize: 13 }}>
                      {r.peserta ? `${r.peserta} ${fac?.type?.toLowerCase() === 'alat' ? 'unit' : 'orang'}` : '-'}
                    </td>

                    {/* TUJUAN */}
                    <td style={{ maxWidth: 220, fontSize: 13, color: '#4B5563' }}>
                      {r.tujuan}
                    </td>

                    {/* STATUS */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span className={`pill ${cfg.pillClass}`} style={{ fontSize: 13 }}>
                        {cfg.label}
                      </span>
                    </td>

                    {/* TINDAKAN */}
                    <td style={{ whiteSpace: 'nowrap', textAlign: 'left' }}>
                      {r.status === 'menunggu' && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            type="button"
                            className="btn primary"
                            style={{ padding: '5px 12px', fontSize: 13 }}
                            onClick={() => handleApprove(r.id, facilityName, r.pemohon)}
                          >
                            Setujui
                          </button>
                          <button
                            type="button"
                            className="btn ghost-danger"
                            style={{ padding: '5px 12px', fontSize: 13 }}
                            onClick={() => handleReject(r.id, facilityName, r.pemohon)}
                          >
                            Tolak
                          </button>
                        </div>
                      )}

                      {r.status === 'disetujui' && (
                        <button
                          type="button"
                          className="btn ghost-danger"
                          style={{ padding: '5px 12px', fontSize: 13 }}
                          onClick={() => handleCancelEmergency(r.id, facilityName, r.pemohon)}
                          title="Batalkan reservasi dalam kondisi darurat"
                        >
                          Batal (Darurat)
                        </button>
                      )}

                      {r.status === 'ditolak' && (
                        <span style={{ color: '#DC2626', fontSize: 14 }} title={r.catatanBatal || undefined}>
                          Ditolak {r.catatanBatal ? `(${r.catatanBatal})` : ''}
                        </span>
                      )}

                      {r.status === 'dibatalkan' && (
                        <span style={{ color: '#6B7280', fontSize: 14 }} title={r.catatanBatal || undefined}>
                          Dibatalkan {r.catatanBatal ? `(${r.catatanBatal})` : ''}
                        </span>
                      )}

                      {r.status === 'selesai' && (
                        <span style={{ color: '#059669', fontSize: 14 }}>
                          Selesai
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <ActionPromptModal config={modalConfig} onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))} />
    </div>
  );
}
