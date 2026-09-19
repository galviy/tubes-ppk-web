'use client';

import { useState } from 'react';
import { useAppData } from '@/context/AppDataContext';
import { ReportStatus } from '@/models/report';
import ActionPromptModal, { ActionModalConfig } from '@/components/ActionPromptModal';

const STATUS_CONFIG: Record<ReportStatus, { pillClass: string; label: string }> = {
  baru: { pillClass: 'busy', label: 'Baru' },
  diproses: { pillClass: 'avail', label: 'Diproses' },
  selesai: { pillClass: 'avail', label: 'Selesai' },
  ditolak: { pillClass: 'danger', label: 'Ditolak' },
};

export default function PetugasLaporanPage() {
  const { reports, facilityById, updateReportStatus, setFacilityStatus } = useAppData();
  const [filterStatus, setFilterStatus] = useState<string>('semua');
  const [modalConfig, setModalConfig] = useState<ActionModalConfig>({
    isOpen: false,
    title: '',
    onConfirm: () => {},
  });

  function handleProses(id: number) {
    updateReportStatus(id, 'diproses');
  }

  function handleSelesai(id: number) {
    setModalConfig({
      isOpen: true,
      title: 'Selesaikan Laporan Kerusakan',
      subtitle: 'Catat tindakan perbaikan atau solusi yang telah dilakukan petugas sebelum menandai selesai.',
      label: 'Catatan Resolusi Perbaikan',
      defaultValue: 'Kerusakan telah diperbaiki.',
      placeholder: 'Contoh: Teknisi telah melakukan perbaikan kabel dan pengecekan kelistrikan normal.',
      confirmText: 'Simpan & Selesaikan',
      confirmVariant: 'primary',
      showInput: true,
      requireInput: true,
      onConfirm: (catatan) => {
        updateReportStatus(id, 'selesai', catatan);
      },
    });
  }

  function handleTolak(id: number) {
    setModalConfig({
      isOpen: true,
      title: 'Tolak Laporan Kerusakan',
      subtitle: 'Tindakan ini akan menolak laporan kerusakan. Berikan alasan penolakan secara jelas.',
      label: 'Alasan Penolakan Laporan',
      placeholder: 'Contoh: Fasilitas telah dicek dan berfungsi normal / bukan merupakan aset sarpras.',
      confirmText: 'Tolak Laporan',
      confirmVariant: 'danger',
      showInput: true,
      requireInput: true,
      onConfirm: (catatan) => {
        updateReportStatus(id, 'ditolak', catatan);
      },
    });
  }

  function handleToggleRepair(facilityId: string, currentStatus: string | undefined) {
    if (currentStatus === 'repair') {
      setFacilityStatus(facilityId, 'avail');
    } else {
      setFacilityStatus(facilityId, 'repair');
    }
  }

  // Sort: 'baru' first, then 'diproses', then others
  const sorted = [...reports].sort((a, b) => {
    const order: Record<string, number> = { baru: 1, diproses: 2, selesai: 3, ditolak: 4 };
    return (order[a.status] || 5) - (order[b.status] || 5);
  });

  const filtered = filterStatus === 'semua' ? sorted : sorted.filter((r) => r.status === filterStatus);

  return (
    <div>
      {/* Header Split matching Reference Image 4 */}
      <div className="dash-split-header">
        <h2>Antrian laporan kerusakan</h2>
        <p>Ubah status laporan dan tandai fasilitas dalam perbaikan bila perlu.</p>
      </div>

      {/* Filter Chips */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        {[
          { key: 'semua', label: `Semua (${reports.length})` },
          { key: 'baru', label: `Baru (${reports.filter((r) => r.status === 'baru').length})` },
          { key: 'diproses', label: `Diproses (${reports.filter((r) => r.status === 'diproses').length})` },
          { key: 'selesai', label: `Selesai (${reports.filter((r) => r.status === 'selesai').length})` },
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

      {/* Table matching Reference Image 4 */}
      <div className="panel table-scroll" style={{ padding: 0, overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Pelapor</th>
              <th>Fasilitas</th>
              <th>Kategori</th>
              <th>Deskripsi</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: '#6B7280' }}>
                  Tidak ada laporan dalam kategori ini.
                </td>
              </tr>
            ) : (
              filtered.map((r) => {
                const fac = facilityById(r.facilityId);
                const isRepair = fac?.status === 'repair';
                const cfg = STATUS_CONFIG[r.status] || { pillClass: 'neutral', label: r.status };

                return (
                  <tr key={r.id}>
                    {/* PELAPOR */}
                    <td style={{ fontWeight: 600, color: '#181D24', whiteSpace: 'nowrap' }}>
                      {r.pelapor}
                    </td>

                    {/* FASILITAS */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 600, color: '#181D24' }}>
                        {fac?.name || `Fasilitas #${r.facilityId}`}
                      </div>
                      {isRepair && (
                        <div style={{ fontSize: 11, color: '#DC2626', fontWeight: 600, marginTop: 2 }}>
                          [Status: Dalam Perbaikan]
                        </div>
                      )}
                    </td>

                    {/* KATEGORI */}
                    <td style={{ whiteSpace: 'nowrap', fontSize: 13, color: '#4B5563' }}>
                      {r.kategori}
                    </td>

                    {/* DESKRIPSI */}
                    <td style={{ maxWidth: 320, fontSize: 13, color: '#4B5563', lineHeight: 1.5 }}>
                      {r.deskripsi}
                      {r.catatan && (
                        <div style={{ marginTop: 4, fontSize: 12, color: '#166534', fontStyle: 'italic' }}>
                          Catatan: {r.catatan}
                        </div>
                      )}
                    </td>

                    {/* STATUS */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span className={`pill ${cfg.pillClass}`} style={{ fontSize: 11 }}>
                        {cfg.label}
                      </span>
                    </td>

                    {/* AKSI */}
                    <td style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                        {/* Top row of status action buttons */}
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            type="button"
                            className="btn-act-outline-green"
                            onClick={() => handleProses(r.id)}
                            disabled={r.status === 'diproses' || r.status === 'selesai'}
                            title="Tandai sedang diproses"
                          >
                            Proses
                          </button>
                          <button
                            type="button"
                            className="btn-act-outline-green"
                            onClick={() => handleSelesai(r.id)}
                            disabled={r.status === 'selesai'}
                            title="Tandai selesai diperbaiki"
                          >
                            Selesai
                          </button>
                          <button
                            type="button"
                            className="btn-act-outline-red"
                            onClick={() => handleTolak(r.id)}
                            disabled={r.status === 'ditolak' || r.status === 'selesai'}
                            title="Tolak laporan"
                          >
                            Tolak
                          </button>
                        </div>

                        {/* Bottom facility repair toggle button matching Image 4 */}
                        <div>
                          {isRepair ? (
                            <button
                              type="button"
                              className="btn-act-outline-neutral"
                              onClick={() => handleToggleRepair(r.facilityId, fac?.status)}
                              title="Kembalikan status fasilitas menjadi aktif/tersedia"
                            >
                              Kembalikan aktif
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn-act-outline-neutral"
                              onClick={() => handleToggleRepair(r.facilityId, fac?.status)}
                              title="Tandai fasilitas sedang dalam perbaikan"
                            >
                              Tandai perbaikan
                            </button>
                          )}
                        </div>
                      </div>
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
