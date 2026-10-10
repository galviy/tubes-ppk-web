'use client';

import { useState, useEffect } from 'react';
import { useAppData } from '@/context/AppDataContext';
import { ReportStatus } from '@/models/report';
import ActionPromptModal, { ActionModalConfig } from '@/components/ActionPromptModal';
import ReportFoto from '@/components/ReportFoto';
import Pagination from '@/components/Pagination';
import DateRangeFilter from '@/components/DateRangeFilter';
import { reportFotoUrl } from '@/lib/api';
import { dateKeyInJakarta, formatDateIndo, formatDateTimeIndo } from '@/lib/slots';

const STATUS_CONFIG: Record<ReportStatus, { pillClass: string; label: string }> = {
  baru: { pillClass: 'busy', label: 'Baru' },
  diproses: { pillClass: 'busy', label: 'Diproses' },
  selesai: { pillClass: 'avail', label: 'Selesai' },
  ditolak: { pillClass: 'danger', label: 'Ditolak' },
};

export default function PetugasLaporanPage() {
  const { reports, facilityById, updateReportStatus, refreshPetugasReports } = useAppData();

  useEffect(() => {
    refreshPetugasReports();
  }, [refreshPetugasReports]);

  const [filterStatus, setFilterStatus] = useState<string>('semua');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [modalConfig, setModalConfig] = useState<ActionModalConfig>({
    isOpen: false,
    title: '',
    onConfirm: () => {},
  });
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Auto-dismiss popup notifikasi setelah 4.5 detik
  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 4500);
    return () => clearTimeout(timer);
  }, [feedback]);

  function reportFailure(message?: string) {
    setFeedback({ type: 'error', message: message || 'Status laporan tidak dapat diproses.' });
    setModalConfig({
      isOpen: true,
      title: 'Pembaruan Status Gagal',
      subtitle: message || 'Status laporan tidak dapat diproses.',
      confirmText: 'Mengerti',
      confirmVariant: 'danger',
      showInput: false,
      onConfirm: () => {},
    });
  }

  function handleProses(id: number) {
    void updateReportStatus(id, 'diproses').then((res) => {
      if (!res.ok) reportFailure(res.message);
      else setFeedback({ type: 'success', message: 'Laporan berhasil diperbarui ke status Diproses.' });
    });
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
        void updateReportStatus(id, 'selesai', catatan).then((res) => {
          if (!res.ok) reportFailure(res.message);
          else setFeedback({ type: 'success', message: 'Laporan kerusakan berhasil diselesaikan.' });
        });
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
        void updateReportStatus(id, 'ditolak', catatan).then((res) => {
          if (!res.ok) reportFailure(res.message);
          else setFeedback({ type: 'success', message: 'Laporan kerusakan berhasil ditolak.' });
        });
      },
    });
  }

  // Sort: 'baru' first, then 'diproses', then others
  const sorted = [...reports].sort((a, b) => {
    const order: Record<string, number> = { baru: 1, diproses: 2, selesai: 3, ditolak: 4 };
    return (order[a.status] || 5) - (order[b.status] || 5);
  });

  const filtered = sorted.filter((r) => {
    if (filterStatus !== 'semua' && r.status !== filterStatus) return false;
    const reportDate = dateKeyInJakarta(r.createdAt);
    if (dateFrom && reportDate < dateFrom) return false;
    if (dateTo && reportDate > dateTo) return false;
    return true;
  });

  // Paginasi: 10 data per halaman
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, dateFrom, dateTo]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const paginatedReports = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div>
      {/* Popup toast notifikasi */}
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
            <div style={{ fontFamily: 'var(--font)', fontWeight: 700, fontSize: 14, color: feedback.type === 'success' ? '#166534' : '#991B1B', marginBottom: 2 }}>
              {feedback.type === 'success' ? 'Pemberitahuan Berhasil' : 'Kendala Penanganan'}
            </div>
            <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.5 }}>
              {feedback.message}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            aria-label="Tutup notifikasi"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* Header Split */}
      <div className="dash-split-header">
        <div>
          <h2>Antrian laporan kerusakan</h2>
          <p>Kelola dan perbarui progres penanganan laporan kerusakan fasilitas.</p>
        </div>
      </div>

      {/* Filter Chips */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
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

      <DateRangeFilter
        contextLabel="laporan"
        from={dateFrom}
        to={dateTo}
        onChange={({ from, to }) => {
          setDateFrom(from);
          setDateTo(to);
        }}
      />

      {/* Table matching Reference Image 4 */}
      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-scroll" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', tableLayout: 'auto' }}>
          <thead>
            <tr>
              <th style={{ width: '15%' }}>Pelapor</th>
              <th style={{ width: '12%' }}>Waktu Lapor</th>
              <th style={{ width: '23%' }}>Fasilitas</th>
              <th style={{ width: '12%' }}>Kategori</th>
              <th style={{ width: '20%' }}>Deskripsi</th>
              <th style={{ width: '10%' }}>Status</th>
              <th style={{ textAlign: 'left', width: '8%' }}>Tindakan</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#6B7280' }}>
                  {dateFrom || dateTo
                    ? `Tidak ada laporan pada rentang tanggal yang dipilih${dateFrom && dateTo ? ` (${formatDateIndo(dateFrom)} sampai ${formatDateIndo(dateTo)})` : ''}. Ubah atau hapus filter tanggal untuk melihat laporan lainnya.`
                    : 'Tidak ada laporan dalam kategori ini.'}
                </td>
              </tr>
            ) : (
              paginatedReports.map((r) => {
                const fac = facilityById(r.facilityId);
                const cfg = STATUS_CONFIG[r.status] || { pillClass: 'neutral', label: r.status };

                return (
                  <tr key={r.id}>
                    {/* PELAPOR */}
                    <td style={{ fontWeight: 600, color: '#181D24', maxWidth: 160, wordBreak: 'break-word' }}>
                      {r.pelapor}
                    </td>

                    {/* WAKTU LAPOR */}
                    <td style={{ whiteSpace: 'nowrap', fontSize: 13, color: '#4B5563' }}>
                      {formatDateTimeIndo(r.createdAt)}
                    </td>

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

                    {/* DESKRIPSI & FOTO */}
                    <td style={{ maxWidth: 280, fontSize: 13, color: '#4B5563' }}>
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
                              title="Buka foto bukti di tab baru"
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
                          Catatan: {r.catatan}
                        </div>
                      )}
                    </td>

                    {/* STATUS */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span className={`pill ${cfg.pillClass}`} style={{ fontSize: 13.5 }}>
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

      <ActionPromptModal
        config={modalConfig}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
      />

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
                    title="Buka foto bukti di tab baru"
                  >
                    <span>Buka Foto</span>
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
