'use client';

import { useState, useEffect } from 'react';
import { useAppData } from '@/context/AppDataContext';
import { ReportStatus } from '@/models/report';
import ReportFoto from '@/components/ReportFoto';
import Pagination from '@/components/Pagination';
import DateRangeFilter from '@/components/DateRangeFilter';
import { reportFotoUrl, backendDownloadReportsExport } from '@/lib/api';
import { dateKeyInJakarta, formatDateIndo, formatDateTimeIndo } from '@/lib/slots';

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
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  async function handleExportExcel() {
    setIsExporting(true);
    try {
      await backendDownloadReportsExport('excel', filterStatus, filterKategori, searchQuery, 'laporan-kerusakan-undip.xls');
    } finally {
      setIsExporting(false);
    }
  }

  // Extract unique categories
  const categories = Array.from(new Set(reports.map((r) => r.kategori).filter(Boolean)));

  // Filtered reports
  const filtered = reports.filter((r) => {
    if (filterStatus !== 'semua' && r.status !== filterStatus) return false;
    if (filterKategori !== 'semua' && r.kategori !== filterKategori) return false;
    const reportDate = dateKeyInJakarta(r.createdAt);
    if (dateFrom && reportDate < dateFrom) return false;
    if (dateTo && reportDate > dateTo) return false;
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

  // Paginasi: 10 data per halaman
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Reset ke halaman 1 saat filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterKategori, searchQuery, dateFrom, dateTo]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const paginatedReports = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

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

          <button
            type="button"
            onClick={handleExportExcel}
            disabled={isExporting}
            className="btn secondary"
            style={{
              padding: '6px 12px',
              fontSize: 13,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {isExporting ? 'Mengunduh...' : 'Ekspor Excel'}
          </button>
        </div>
      </div>

      <DateRangeFilter
        contextLabel="laporan"
        from={dateFrom}
        to={dateTo}
        onChange={({ from, to }) => {
          setDateFrom(from);
          setDateTo(to);
        }}
      />

      {/* Table Laporan */}
      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-scroll" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', tableLayout: 'auto' }}>
          <thead>
            <tr>
              <th style={{ width: '24%' }}>Fasilitas</th>
              <th style={{ width: '14%' }}>Kategori</th>
              <th style={{ width: '12%' }}>Status</th>
              <th style={{ width: '15%' }}>Pelapor</th>
              <th style={{ width: '22%' }}>Deskripsi &amp; Resolusi</th>
              <th style={{ width: '13%' }}>Waktu Lapor</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: '#6B7280', padding: 24 }}>
                  {dateFrom || dateTo
                    ? `Tidak ada laporan pada rentang tanggal yang dipilih${dateFrom && dateTo ? ` (${formatDateIndo(dateFrom)} sampai ${formatDateIndo(dateTo)})` : ''}. Ubah atau hapus filter tanggal untuk melihat laporan lainnya.`
                    : 'Tidak ada laporan yang sesuai dengan filter pencarian.'}
                </td>
              </tr>
            ) : (
              paginatedReports.map((r) => {
                const fac = facilityById(r.facilityId);
                const cfg = STATUS_CONFIG[r.status] || { pillClass: 'neutral', label: r.status };

                return (
                  <tr key={r.id}>
                    {/* FASILITAS */}
                    <td style={{ maxWidth: 260 }}>
                      <div style={{ fontWeight: 600, color: '#181D24' }}>
                        {fac?.name || `Fasilitas #${r.facilityId}`}
                      </div>
                      <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2, wordBreak: 'break-word' }}>
                        {fac?.type} • {fac?.loc}
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
                      <div style={{ wordBreak: 'break-word' }}>{r.deskripsi}</div>
                      {r.foto && (() => {
                        const fotoUrl = reportFotoUrl(r.foto);
                        return (
                          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <a
                              href={fotoUrl || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ochoco-photo-thumb-btn"
                              title={fotoUrl ? `Buka path foto di tab baru: ${fotoUrl}` : 'Buka foto bukti'}
                            >
                              <ReportFoto
                                foto={r.foto}
                                alt="Thumbnail Bukti"
                                className="ochoco-photo-thumb-img"
                              />
                              <span>Lihat Bukti Foto</span>
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                                style={{ opacity: 0.7, flexShrink: 0 }}
                              >
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                <polyline points="15 3 21 3 21 9" />
                                <line x1="10" y1="14" x2="21" y2="3" />
                              </svg>
                            </a>
                            <button
                              type="button"
                              className="ochoco-photo-quick-view-btn"
                              onClick={() => setPreviewPhoto(r.foto || null)}
                              title="Pratinjau foto langsung di layar"
                            >
                              Pratinjau
                            </button>
                          </div>
                        );
                      })()}
                      {r.catatan && (
                        <div style={{ marginTop: 6, fontSize: 13, color: '#166534', fontStyle: 'italic', wordBreak: 'break-word' }}>
                          Catatan Petugas: {r.catatan}
                        </div>
                      )}
                    </td>

                    {/* TANGGAL */}
                    <td style={{ whiteSpace: 'nowrap', fontSize: 14, color: '#6B7280' }}>
                      {formatDateTimeIndo(r.createdAt)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        </div>

        {/* Paginasi Data */}
        <div style={{ padding: '0 20px 16px 20px' }}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filtered.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Lightbox Modal Foto Bukti */}
      {previewPhoto && (
        <div className="ochoco-lightbox-overlay" onClick={() => setPreviewPhoto(null)}>
          <div className="ochoco-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <div className="ochoco-lightbox-header">
              <span>Bukti Foto Kerusakan &amp; Kendala</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {reportFotoUrl(previewPhoto) && (
                  <a
                    href={reportFotoUrl(previewPhoto)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 13,
                      color: '#b59876',
                      textDecoration: 'none',
                      fontWeight: 600,
                    }}
                    title="Buka path file di tab baru"
                  >
                    <span>Buka Path File</span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                )}
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
            </div>
            <ReportFoto foto={previewPhoto} alt="Bukti Foto Lengkap" className="ochoco-lightbox-img" />
          </div>
        </div>
      )}
    </div>
  );
}
