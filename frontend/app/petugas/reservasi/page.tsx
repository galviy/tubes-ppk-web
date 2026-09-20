'use client';

import { useState } from 'react';
import { useAppData } from '@/context/AppDataContext';
import { ReservationStatus } from '@/models/reservation';
import ActionPromptModal, { ActionModalConfig } from '@/components/ActionPromptModal';
import { hasRangeConflict } from '@/lib/slots';

const STATUS_CONFIG: Record<ReservationStatus, { pillClass: string; label: string }> = {
  menunggu: { pillClass: 'busy', label: 'Menunggu' },
  disetujui: { pillClass: 'avail', label: 'Disetujui' },
  ditolak: { pillClass: 'danger', label: 'Ditolak' },
  dibatalkan: { pillClass: 'danger', label: 'Dibatalkan' },
};

export default function PetugasReservasiPage() {
  const {
    reservations,
    facilityById,
    approveReservation,
    rejectReservation,
    cancelApprovedReservation,
    resetReservationToWaiting,
    isSlotTaken,
  } = useAppData();

  const [filterStatus, setFilterStatus] = useState<string>('semua');
  const [modalConfig, setModalConfig] = useState<ActionModalConfig>({
    isOpen: false,
    title: '',
    onConfirm: () => {},
  });

  function handleApprove(id: number) {
    const result = approveReservation(id);
    if (!result.ok) {
      setModalConfig({
        isOpen: true,
        title: 'Jadwal Bentrok',
        subtitle: result.message || 'Jadwal yang diajukan bertabrakan dengan reservasi lain yang telah disetujui.',
        confirmText: 'Mengerti',
        confirmVariant: 'warning',
        showInput: false,
        onConfirm: () => {},
      });
    }
  }

  function handleReject(id: number) {
    setModalConfig({
      isOpen: true,
      title: 'Tolak Permohonan Reservasi',
      subtitle: 'Masukkan alasan penolakan permohonan reservasi. Catatan ini akan dicatat dalam riwayat pemohon.',
      label: 'Alasan Penolakan',
      placeholder: 'Contoh: Fasilitas sedang dalam pemeliharaan berkala atau ada kegiatan dinas prioritas.',
      confirmText: 'Tolak Reservasi',
      confirmVariant: 'danger',
      showInput: true,
      requireInput: true,
      onConfirm: (alasan) => {
        rejectReservation(id);
      },
    });
  }

  function handleCancelApproved(id: number) {
    setModalConfig({
      isOpen: true,
      title: 'Pembatalan Mendesak Reservasi',
      subtitle: 'Reservasi ini telah disetujui sebelumnya. Masukkan alasan pembatalan mendesak.',
      label: 'Alasan Pembatalan Mendesak',
      placeholder: 'Contoh: Terjadi kendala teknis darurat pada fasilitas.',
      confirmText: 'Batalkan Reservasi',
      confirmVariant: 'danger',
      showInput: true,
      requireInput: true,
      onConfirm: (alasan) => {
        cancelApprovedReservation(id, alasan);
      },
    });
  }

  // Sort: 'menunggu' first, then 'disetujui', then others
  const sorted = [...reservations].sort((a, b) => {
    const order: Record<string, number> = { menunggu: 1, disetujui: 2, ditolak: 3, dibatalkan: 4 };
    return (order[a.status] || 5) - (order[b.status] || 5);
  });

  const filtered = filterStatus === 'semua' ? sorted : sorted.filter((r) => r.status === filterStatus);

  return (
    <div>
      {/* Header Split matching Reference Image 3 */}
      <div className="dash-split-header">
        <h2>Antrian reservasi</h2>
        <p>Verifikasi permohonan baru (setujui/tolak) dan kelola pembatalan reservasi yang telah disetujui.</p>
      </div>

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
              <th>Peserta</th>
              <th>Tujuan</th>
              <th>Status</th>
              <th style={{ textAlign: 'left' }}>Tindakan</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#6B7280' }}>
                  Tidak ada reservasi dalam kategori ini.
                </td>
              </tr>
            ) : (
              filtered.map((r) => {
                const fac = facilityById(r.facilityId);
                const conflict =
                  r.status === 'menunggu' &&
                  !!hasRangeConflict(reservations, r.facilityId, r.tanggal, r.start, r.end, r.id);
                const cfg = STATUS_CONFIG[r.status] || { pillClass: 'neutral', label: r.status };

                return (
                  <tr key={r.id}>
                    {/* PEMOHON */}
                    <td style={{ fontWeight: 600, color: '#181D24', whiteSpace: 'nowrap' }}>
                      {r.pemohon}
                    </td>

                    {/* FASILITAS */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span style={{ fontWeight: 600, color: '#181D24' }}>{fac?.name || `Fasilitas #${r.facilityId}`}</span>
                    </td>

                    {/* JADWAL */}
                    <td style={{ whiteSpace: 'nowrap', fontSize: 13 }}>
                      <div>{r.tanggal}</div>
                      <div style={{ color: '#6B7280', fontSize: 12 }}>{r.start}–{r.end}</div>
                    </td>

                    {/* PESERTA */}
                    <td style={{ whiteSpace: 'nowrap', fontSize: 13 }}>
                      {r.peserta ? `${r.peserta} orang` : '—'}
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
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <select
                            className="table-select-action"
                            value="menunggu"
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === 'setuju') handleApprove(r.id);
                              if (val === 'tolak') handleReject(r.id);
                            }}
                          >
                            <option value="menunggu">Menunggu</option>
                            <option value="setuju" disabled={conflict}>Setuju</option>
                            <option value="tolak">Tolak</option>
                          </select>
                          {conflict && (
                            <span style={{ color: '#dc2626', fontSize: 11, fontWeight: 600 }}>
                              Bentrok
                            </span>
                          )}
                        </div>
                      )}

                      {r.status === 'disetujui' && (
                        <select
                          className="table-select-action"
                          value="setuju"
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'batal') handleCancelApproved(r.id);
                          }}
                        >
                          <option value="setuju">Setuju</option>
                          <option value="batal">Batal</option>
                        </select>
                      )}

                      {r.status === 'ditolak' && (
                        <span style={{ color: '#9CA3AF', fontSize: 12 }}>Ditolak</span>
                      )}

                      {r.status === 'dibatalkan' && (
                        <span style={{ color: '#9CA3AF', fontSize: 12 }} title={r.catatanBatal || undefined}>
                          Dibatalkan
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

      <ActionPromptModal
        config={modalConfig}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
