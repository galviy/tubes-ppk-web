'use client';

import { useState } from 'react';
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
  const { reservations, facilityById, updateReservationStatus, petugasCancelReservation } = useAppData();

  const [filterStatus, setFilterStatus] = useState<string>('semua');
  const [modalConfig, setModalConfig] = useState<ActionModalConfig>({
    isOpen: false,
    title: '',
    onConfirm: () => {},
  });
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Kelompokkan per status (menunggu dulu), lalu pengajuan paling awal di atas
  // supaya antrean persetujuan mengikuti siapa yang memesan lebih dulu.
  const sorted = [...reservations].sort((a, b) => {
    const order: Record<string, number> = { menunggu: 1, disetujui: 2, ditolak: 3, dibatalkan: 4, selesai: 5 };
    const byStatus = (order[a.status] || 6) - (order[b.status] || 6);
    if (byStatus !== 0) return byStatus;
    const byCreated = a.createdAt.localeCompare(b.createdAt);
    return byCreated !== 0 ? byCreated : (a.backendId ?? a.id) - (b.backendId ?? b.id);
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
          className={`alert ${feedback.type === 'success' ? 'info' : 'danger'}`}
          style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <span>{feedback.message}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ✕
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
              padding: '6px 14px',
              borderRadius: 4,
              fontSize: 12,
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
                      <div style={{ color: '#6B7280', fontSize: 12 }}>{r.start} - {r.end}</div>
                    </td>

                    {/* PESERTA / UNIT */}
                    <td style={{ whiteSpace: 'nowrap', fontSize: 13 }}>
                      {r.peserta ? `${r.peserta} ${fac?.tipe === 'alat' ? 'unit' : 'orang'}` : '-'}
                    </td>

                    {/* TUJUAN */}
                    <td style={{ maxWidth: 220, fontSize: 13, color: '#4B5563' }}>
                      {r.tujuan}
                    </td>

                    {/* STATUS */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span className={`pill ${cfg.pillClass}`} style={{ fontSize: 11 }}>
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
                            style={{ padding: '4px 10px', fontSize: 12 }}
                            onClick={() => handleApprove(r.id, facilityName, r.pemohon)}
                          >
                            Setujui
                          </button>
                          <button
                            type="button"
                            className="btn ghost-danger"
                            style={{ padding: '4px 10px', fontSize: 12 }}
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
                          style={{ padding: '4px 10px', fontSize: 12 }}
                          onClick={() => handleCancelEmergency(r.id, facilityName, r.pemohon)}
                          title="Batalkan reservasi dalam kondisi darurat"
                        >
                          Batal (Darurat)
                        </button>
                      )}

                      {r.status === 'ditolak' && (
                        <span style={{ color: '#DC2626', fontSize: 12 }} title={r.catatanBatal || undefined}>
                          Ditolak {r.catatanBatal ? `(${r.catatanBatal})` : ''}
                        </span>
                      )}

                      {r.status === 'dibatalkan' && (
                        <span style={{ color: '#6B7280', fontSize: 12 }} title={r.catatanBatal || undefined}>
                          Dibatalkan {r.catatanBatal ? `(${r.catatanBatal})` : ''}
                        </span>
                      )}

                      {r.status === 'selesai' && (
                        <span style={{ color: '#059669', fontSize: 12 }}>
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
