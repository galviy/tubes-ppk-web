'use client';

import { useState } from 'react';
import { useAppData } from '@/context/AppDataContext';
import { ReportStatus } from '@/models/report';
import ReportFoto from '@/components/ReportFoto';
import { formatDateIndo } from '@/lib/slots';

const STATUS_CONFIG: Record<ReportStatus, { pillClass: string; label: string }> = {
  baru: { pillClass: 'busy', label: 'Baru' },
  diproses: { pillClass: 'avail', label: 'Diproses' },
  selesai: { pillClass: 'avail', label: 'Selesai' },
  ditolak: { pillClass: 'danger', label: 'Ditolak' },
};

export default function AdminSemuaLaporanPage() {
  const { reports, facilityById } = useAppData();
  const [filterStatus, setFilterStatus] = useState<string>('semua');
  const [filterKategori, setFilterKategori] = useState<string>('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  // Extract unique categories
  const categories = Array.from(new Set(reports.map((r) => r.kategori).filter(Boolean)));

  // Filtered reports
  const filtered = reports.filter((r) => {
    if (filterStatus !== 'semua' && r.status !== filterStatus) return false;
    if (filterKategori !== 'semua' && r.kategori !== filterKategori) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const fac = facilityById(r.facilityId);
      const matchFac = fac?.name.toLowerCase().includes(q);
      const matchPelapor = r.pelapor.toLowerCase().includes(q);
      const matchDesc = r.deskripsi.toLowerCase().includes(q);
      const matchKat = r.kategori.toLowerCase().includes(q);
      return matchFac || matchPelapor || matchDesc || matchKat;
    }
    return true;
  });

  return (
    <div>
      <div className="content-head">
        <h2>Semua Laporan Kendala &amp; Kerusakan</h2>
        <p>Log audit seluruh laporan sarpras civitas akademika Universitas Diponegoro beserta progres penanganannya.</p>
      </div>

      {/* Filter Row: Status Chips & Category Filter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        {/* Status Filter Chips */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { key: 'semua', label: `Semua (${reports.length})` },
            { key: 'baru', label: `Baru (${reports.filter((r) => r.status === 'baru').length})` },
            { key: 'diproses', label: `Diproses (${reports.filter((r) => r.status === 'diproses').length})` },
            { key: 'selesai', label: `Selesai (${reports.filter((r) => r.status === 'selesai').length})` },
            { key: 'ditolak', label: `Ditolak (${reports.filter((r) => r.status === 'ditolak').length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilterStatus(tab.key)}
              style={{
                padding: '6px 14px',
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

        {/* Right side: Search & Category Dropdown */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
            style={{ padding: '6px 12px', fontSize: 13, borderRadius: 6, border: '1px solid #D5D0C7' }}
          >
            <option value="semua">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Cari fasilitas / pelapor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: '6px 12px', fontSize: 13, borderRadius: 6, border: '1px solid #D5D0C7', minWidth: 200 }}
          />
        </div>
      </div>

      {/* Table Laporan */}
      <div className="panel table-scroll" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>Fasilitas</th>
              <th>Kategori</th>
              <th>Status</th>
              <th>Pelapor</th>
              <th>Deskripsi &amp; Resolusi</th>
              <th>Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: '#6B7280', padding: 24 }}>
                  Tidak ada laporan yang sesuai dengan filter pencarian.
                </td>
              </tr>
            ) : (
              filtered.map((r) => {
                const fac = facilityById(r.facilityId);
                const cfg = STATUS_CONFIG[r.status] || { pillClass: 'neutral', label: r.status };

                return (
                  <tr key={r.id}>
                    {/* FASILITAS */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 600, color: '#181D24' }}>
                        {fac?.name || `Fasilitas #${r.facilityId}`}
                      </div>
                      <div style={{ fontSize: 14, color: '#6B7280' }}>
                        {fac?.type} • {fac?.loc}
                        {fac?.status === 'repair' && (
                          <span style={{ color: '#d97706', fontWeight: 600, marginLeft: 6 }}>
                            [Perbaikan]
                          </span>
                        )}
                      </div>
                    </td>

                    {/* KATEGORI */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span className="badge-kategori">{r.kategori}</span>
                    </td>

                    {/* STATUS */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span className={`pill ${cfg.pillClass}`} style={{ fontSize: 13.5 }}>
                        {cfg.label}
                      </span>
                    </td>

                    {/* PELAPOR */}
                    <td style={{ whiteSpace: 'nowrap', fontWeight: 600, color: '#181D24' }}>
                      {r.pelapor}
                    </td>

                    {/* DESKRIPSI & RESOLUSI */}
                    <td style={{ maxWidth: 300, fontSize: 13, color: '#4B5563' }}>
                      <div>{r.deskripsi}</div>
                      {r.foto && (
                        <div style={{ marginTop: 6 }}>
                          <button
                            type="button"
                            className="ochoco-photo-thumb-btn"
                            onClick={() => setPreviewPhoto(r.foto || null)}
                            title="Klik untuk memperbesar foto bukti"
                          >
                            <ReportFoto
                              foto={r.foto}
                              alt="Thumbnail Bukti"
                              className="ochoco-photo-thumb-img"
                            />
                            <span>Lihat Bukti Foto</span>
                          </button>
                        </div>
                      )}
                      {r.catatan && (
                        <div style={{ marginTop: 4, fontSize: 14, color: '#166534', fontStyle: 'italic' }}>
                          Catatan Petugas: {r.catatan}
                        </div>
                      )}
                    </td>

                    {/* TANGGAL */}
                    <td style={{ whiteSpace: 'nowrap', fontSize: 14, color: '#6B7280' }}>
                      {formatDateIndo(r.createdAt || '2026-09-18')}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Lightbox Modal Foto Bukti */}
      {previewPhoto && (
        <div className="ochoco-lightbox-overlay" onClick={() => setPreviewPhoto(null)}>
          <div className="ochoco-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <div className="ochoco-lightbox-header">
              <span>Bukti Foto Kerusakan &amp; Kendala</span>
              <button
                type="button"
                className="ochoco-lightbox-close"
                onClick={() => setPreviewPhoto(null)}
                aria-label="Tutup"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <ReportFoto foto={previewPhoto} alt="Bukti Foto Lengkap" className="ochoco-lightbox-img" />
          </div>
        </div>
      )}
    </div>
  );
}
