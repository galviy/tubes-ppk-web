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
  const { reports, facilityById, updateReportStatus } = useAppData();
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
        <p>Kelola dan perbarui progres penanganan laporan kerusakan fasilitas.</p>
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
              <th style={{ textAlign: 'left' }}>Tindakan</th>
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
                      <div style={{ fontSize: 12, color: '#6B7280' }}>
                        {fac?.type} • {fac?.loc}
                        {isRepair && (
                          <span style={{ color: '#d97706', fontWeight: 600, marginLeft: 6 }}>
                            [Status: Perbaikan]
                          </span>
                        )}
                      </div>
                    </td>

                    {/* KATEGORI */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span className="badge-kategori">{r.kategori}</span>
                    </td>

                    {/* DESKRIPSI & FOTO */}
                    <td style={{ maxWidth: 280, fontSize: 13, color: '#4B5563' }}>
                      <div>{r.deskripsi}</div>
                      {r.foto && (
                        <div style={{ marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 4, color: '#b59876', fontSize: 12 }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                            <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="2" />
                          </svg>
                          <span>Foto: {r.foto}</span>
                        </div>
                      )}
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

                    {/* TINDAKAN */}
                    <td style={{ whiteSpace: 'nowrap', textAlign: 'left' }}>
                      <select
                        className="table-select-action"
                        value={r.status}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === 'proses') handleProses(r.id);
                          if (val === 'selesai') handleSelesai(r.id);
                          if (val === 'tolak') handleTolak(r.id);
                        }}
                      >
                        {r.status === 'baru' && (
                          <>
                            <option value="baru">Baru</option>
                            <option value="proses">Proses</option>
                            <option value="selesai">Selesai</option>
                            <option value="tolak">Tolak</option>
                          </>
                        )}
                        {r.status === 'diproses' && (
                          <>
                            <option value="diproses">Diproses</option>
                            <option value="selesai">Selesai</option>
                            <option value="tolak">Tolak</option>
                          </>
                        )}
                        {r.status === 'selesai' && (
                          <option value="selesai">Selesai</option>
                        )}
                        {r.status === 'ditolak' && (
                          <option value="ditolak">Ditolak</option>
                        )}
                      </select>
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
