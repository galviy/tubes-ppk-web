'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppData } from '@/context/AppDataContext';
import { Reservation, ReservationStatus } from '@/models/reservation';
import { formatDateIndo, formatDateTimeIndo } from '@/lib/slots';
import ActionPromptModal, { ActionModalConfig } from '@/components/ActionPromptModal';
import Pagination from '@/components/Pagination';
import ReservationDetailModal from '@/components/ReservationDetailModal';
import {
  isAlatReservation,
  isRuanganFacility,
  isAlatFacility,
  DEFAULT_ROOM_CATEGORIES,
  DEFAULT_ALAT_CATEGORIES,
} from '@/models/facilities-data';

const STATUS_CONFIG: Record<ReservationStatus, { pillClass: string; label: string }> = {
  menunggu: { pillClass: 'busy', label: 'Menunggu' },
  disetujui: { pillClass: 'avail', label: 'Disetujui' },
  ditolak: { pillClass: 'danger', label: 'Ditolak' },
  dibatalkan: { pillClass: 'neutral', label: 'Dibatalkan' },
  selesai: { pillClass: 'avail', label: 'Selesai' },
};

function PetugasReservasiContent() {
  const {
    reservations,
    facilityById,
    updateReservationStatus,
    petugasCancelReservation,
    refreshReservations,
  } = useAppData();

  const searchParams = useSearchParams();
  const tipeParam = searchParams.get('tipe');

  useEffect(() => {
    refreshReservations();
  }, [refreshReservations]);

  const [tabType, setTabType] = useState<'semua' | 'ruangan' | 'alat'>(() => {
    if (tipeParam === 'alat') return 'alat';
    if (tipeParam === 'ruangan') return 'ruangan';
    return 'semua';
  });
  const [filterStatus, setFilterStatus] = useState<string>('semua');
  const [filterCategory, setFilterCategory] = useState<string>('semua');
  const [filterTanggal, setFilterTanggal] = useState<string>('');
  const [sortMode, setSortMode] = useState<'antrean' | 'terbaru'>('antrean');
  const [modalConfig, setModalConfig] = useState<ActionModalConfig>({
    isOpen: false,
    title: '',
    onConfirm: () => {},
  });
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [detailFor, setDetailFor] = useState<Reservation | null>(null);

  // Auto-dismiss popup notifikasi setelah 4.5 detik
  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => {
      setFeedback(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [feedback]);

  const countRuangan = reservations.filter((r) => !isAlatReservation(r, facilityById(r.facilityId))).length;
  const countAlat = reservations.filter((r) => isAlatReservation(r, facilityById(r.facilityId))).length;

  const tabReservations = useMemo(() => {
    return reservations.filter((r) => {
      const fac = facilityById(r.facilityId);
      const isAlat = isAlatReservation(r, fac);
      if (tabType === 'ruangan') return !isAlat;
      if (tabType === 'alat') return isAlat;
      return true;
    });
  }, [reservations, facilityById, tabType]);

  const countTabSemua = tabReservations.length;
  const countTabMenunggu = tabReservations.filter((r) => r.status === 'menunggu').length;
  const countTabDisetujui = tabReservations.filter((r) => r.status === 'disetujui').length;
  const countTabDitolak = tabReservations.filter((r) => r.status === 'ditolak').length;
  const countTabDibatalkan = tabReservations.filter((r) => r.status === 'dibatalkan').length;

  // Kategori dinamis sesuai sub-tab yang dipilih
  const categoryOptions = useMemo(() => {
    if (tabType === 'ruangan') {
      const fromFac = Array.from(
        new Set(reservations.map((r) => facilityById(r.facilityId)).filter(isRuanganFacility).map((f) => f?.type))
      ).filter(Boolean) as string[];
      const list = Array.from(new Set([...DEFAULT_ROOM_CATEGORIES, ...fromFac]));
      return [{ value: 'semua', label: 'Semua Kategori Ruangan' }, ...list.map((c) => ({ value: c, label: c }))];
    } else if (tabType === 'alat') {
      const fromFac = Array.from(
        new Set(reservations.map((r) => facilityById(r.facilityId)).filter(isAlatFacility).map((f) => f?.type))
      ).filter(Boolean) as string[];
      const list = Array.from(new Set([...DEFAULT_ALAT_CATEGORIES, ...fromFac]));
      return [{ value: 'semua', label: 'Semua Kategori Alat' }, ...list.map((c) => ({ value: c, label: c }))];
    } else {
      return [{ value: 'semua', label: 'Semua Kategori' }];
    }
  }, [tabType, reservations, facilityById]);

  // Saring per jenis/status/kategori/tanggal, lalu urutkan.
  // Mode 'antrean': menunggu dulu, pengajuan paling awal di atas (siapa cepat dia dapat).
  // Mode 'terbaru': pengajuan paling baru di atas.
  const filtered = useMemo(() => {
    const list = tabReservations.filter((r) => {
      const fac = facilityById(r.facilityId);
      if (filterStatus !== 'semua' && r.status !== filterStatus) return false;
      if (filterCategory !== 'semua' && fac?.type !== filterCategory) return false;
      if (filterTanggal && r.tanggal !== filterTanggal) return false;
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortMode === 'terbaru') {
        const byNewest = b.createdAt.localeCompare(a.createdAt);
        return byNewest !== 0 ? byNewest : (b.backendId ?? b.id) - (a.backendId ?? a.id);
      }
      const order: Record<string, number> = { menunggu: 1, disetujui: 2, ditolak: 3, dibatalkan: 4, selesai: 5 };
      const byStatus = (order[a.status] || 6) - (order[b.status] || 6);
      if (byStatus !== 0) return byStatus;
      const byCreated = a.createdAt.localeCompare(b.createdAt);
      return byCreated !== 0 ? byCreated : (a.backendId ?? a.id) - (b.backendId ?? b.id);
    });
  }, [reservations, facilityById, tabType, filterStatus, filterCategory, filterTanggal, sortMode]);

  // Paginasi: 10 data per halaman
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Reset ke halaman 1 saat filter atau urutan berganti
  useEffect(() => {
    setCurrentPage(1);
  }, [tabType, filterStatus, filterCategory, filterTanggal, sortMode]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  function formatAlatInfo(alat?: { nama: string; jumlah: number }[]): string {
    if (!alat || alat.length === 0) return '';
    return ` beserta alat (${alat.map((a) => `${a.nama}: ${a.jumlah} unit`).join(', ')})`;
  }

  function handleApprove(id: number, facilityName: string, pemohon: string, alatInfo = '') {
    setModalConfig({
      isOpen: true,
      title: 'Setujui Permohonan Reservasi',
      subtitle: `Apakah Anda yakin ingin menyetujui reservasi ${facilityName}${alatInfo} yang diajukan oleh ${pemohon}?`,
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

  function handleReject(id: number, facilityName: string, pemohon: string, alatInfo = '') {
    setModalConfig({
      isOpen: true,
      title: 'Tolak Permohonan Reservasi',
      subtitle: `Berikan alasan penolakan reservasi ${facilityName}${alatInfo} oleh ${pemohon} agar diketahui pemohon.`,
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

  function handleCancelEmergency(id: number, facilityName: string, pemohon: string, alatInfo = '') {
    setModalConfig({
      isOpen: true,
      title: 'Batalkan Reservasi (Kondisi Mendesak)',
      subtitle: `Membatalkan reservasi ${facilityName}${alatInfo} milik ${pemohon} yang telah disetujui sebelumnya.`,
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

      {/* Sub-tab: Pilihan Antrian Reservasi Ruangan vs Alat */}
      <div
        role="tablist"
        aria-label="Pilihan Jenis Reservasi"
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 16,
          borderBottom: '2px solid #E5E0D8',
          paddingBottom: 2,
        }}
      >
        {[
          { key: 'semua', label: 'Semua Antrian', count: reservations.length },
          { key: 'ruangan', label: 'Reservasi Ruangan', count: countRuangan },
          { key: 'alat', label: 'Reservasi Alat', count: countAlat },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tabType === t.key}
            onClick={() => {
              setTabType(t.key as 'semua' | 'ruangan' | 'alat');
              setFilterCategory('semua');
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 18px',
              borderRadius: '6px 6px 0 0',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              border: tabType === t.key ? '1px solid #b59876' : '1px solid transparent',
              borderBottom: tabType === t.key ? '3px solid #b59876' : '3px solid transparent',
              background: tabType === t.key ? '#15171a' : '#FFFFFF',
              color: tabType === t.key ? '#b59876' : '#6B7280',
              marginBottom: -2,
              transition: 'all 0.15s ease',
            }}
          >
            <span>{t.label}</span>
            <span
              style={{
                fontSize: 12,
                padding: '2px 8px',
                borderRadius: 10,
                background: tabType === t.key ? '#2A2E35' : '#F3F0EB',
                color: tabType === t.key ? '#D5C4A1' : '#6B7280',
              }}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filter Row: Status Chips & Category Dropdown */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { key: 'semua', label: `Semua (${countTabSemua})` },
            { key: 'menunggu', label: `Menunggu (${countTabMenunggu})` },
            { key: 'disetujui', label: `Disetujui (${countTabDisetujui})` },
            { key: 'ditolak', label: `Ditolak (${countTabDitolak})` },
            { key: 'dibatalkan', label: `Dibatalkan (${countTabDibatalkan})` },
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

        {/* Category dropdown if filtering by ruangan or alat */}
        {tabType !== 'semua' && categoryOptions.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#4B5563' }}>Kategori:</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{ padding: '6px 12px', fontSize: 13, borderRadius: 6, border: '1px solid #D5D0C7' }}
            >
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Filter tanggal kegiatan + pilihan urutan */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 18 }}>
        <label
          style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#4B5563' }}
        >
          Tanggal kegiatan
          <input
            type="date"
            value={filterTanggal}
            onChange={(e) => setFilterTanggal(e.target.value)}
            style={{
              padding: '7px 12px',
              borderRadius: 6,
              border: '1px solid #D5D0C7',
              fontFamily: 'inherit',
              fontSize: 13,
              fontWeight: 600,
              color: '#181D24',
              background: '#FFFFFF',
              cursor: 'pointer',
            }}
          />
        </label>
        {filterTanggal && (
          <button
            type="button"
            onClick={() => setFilterTanggal('')}
            style={{
              padding: '7px 14px',
              borderRadius: 6,
              border: '1px solid #E5E0D8',
              background: '#FFFFFF',
              color: '#6B7280',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Tampilkan semua tanggal
          </button>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#4B5563' }}>Urutkan</span>
          {[
            { key: 'antrean', label: 'Antrean' },
            { key: 'terbaru', label: 'Terbaru' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSortMode(tab.key as 'antrean' | 'terbaru')}
              style={{
                padding: '7px 14px',
                borderRadius: 4,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                border: sortMode === tab.key ? '1px solid #b59876' : '1px solid #E5E0D8',
                background: sortMode === tab.key ? '#15171a' : '#FFFFFF',
                color: sortMode === tab.key ? '#b59876' : '#6B7280',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <p style={{ margin: '0 0 8px', textAlign: 'right', fontSize: 12.5, fontWeight: 600, color: '#6B7280' }}>
        Klik baris untuk melihat detail reservasi.
      </p>
      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-scroll" style={{ overflowX: 'auto' }}>
          <table style={{ minWidth: 1180, width: '100%' }}>
            <thead>
              <tr>
                <th style={{ minWidth: 130 }}>Pemohon</th>
                <th style={{ minWidth: 180 }}>Fasilitas</th>
                <th style={{ minWidth: 130 }}>Waktu Reservasi</th>
                <th style={{ minWidth: 120 }}>Jadwal</th>
                <th style={{ minWidth: 90 }}>Status</th>
                <th style={{ minWidth: 130 }}>Waktu Pembatalan</th>
                <th style={{ textAlign: 'left', minWidth: 150 }}>Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#6B7280' }}>
                    Tidak ada reservasi yang cocok dengan filter ini.
                  </td>
                </tr>
              ) : (
                paginatedList.map((r) => {
                  const fac = facilityById(r.facilityId);
                  const isAlat = isAlatReservation(r, fac);
                  const facilityName = fac?.name || r.ruanganNama || `Fasilitas #${r.facilityId}`;
                  const cfg = STATUS_CONFIG[r.status] || { pillClass: 'neutral', label: r.status };

                  return (
                    <tr
                      key={r.id}
                      className="reservation-row-clickable"
                      tabIndex={0}
                      aria-label={`Buka detail reservasi ${facilityName}, pemohon ${r.pemohon}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setDetailFor(r)}
                      onKeyDown={(e) => {
                        if (e.target !== e.currentTarget) return;
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setDetailFor(r);
                        }
                      }}
                    >
                      {/* PEMOHON */}
                      <td style={{ fontWeight: 600, color: '#181D24', maxWidth: 170, wordBreak: 'break-word' }}>
                        {r.pemohon}
                      </td>

                      {/* FASILITAS */}
                      <td style={{ maxWidth: 260, minWidth: 170 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 600, color: '#181D24' }}>{facilityName}</span>
                          <span
                            className="pill neutral"
                            style={{ fontSize: 11, padding: '1px 6px', fontWeight: 600 }}
                          >
                            {isAlat ? 'Alat' : 'Ruangan'}
                          </span>
                          {!isAlat && r.alat && r.alat.length > 0 && (
                            <span
                              style={{
                                fontSize: 11,
                                padding: '2px 6px',
                                borderRadius: 4,
                                fontWeight: 700,
                                background: '#15171a',
                                color: '#b59876',
                                border: '1px solid #b59876',
                              }}
                            >
                              + {r.alat.length} Alat
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 13, color: '#6B7280', marginTop: 3, lineHeight: 1.35, wordBreak: 'break-word' }}>
                          {fac?.type || '-'} • {fac?.loc || '-'}
                        </div>
                      {!isAlat && r.alat && r.alat.length > 0 && (
                        <div
                          style={{
                            marginTop: 5,
                            padding: '4px 8px',
                            background: '#FAF8F5',
                            border: '1px solid #D5D0C7',
                            borderRadius: 4,
                            fontSize: 12,
                            color: '#181D24',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                            flexWrap: 'wrap',
                            maxWidth: 320,
                            whiteSpace: 'normal',
                          }}
                        >
                          <span style={{ fontWeight: 700, color: '#937654' }}>Alat dipinjam:</span>
                          <span style={{ fontWeight: 600 }}>
                            {r.alat.map((a) => `${a.nama} (${a.jumlah} unit)`).join(', ')}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* WAKTU RESERVASI */}
                    <td style={{ whiteSpace: 'nowrap', fontSize: 13, color: '#4B5563' }}>
                      {formatDateTimeIndo(r.createdAt)}
                    </td>

                    {/* JADWAL */}
                    <td style={{ whiteSpace: 'nowrap', fontSize: 13 }}>
                      <div>{formatDateIndo(r.tanggal)}</div>
                      <div style={{ color: '#6B7280', fontSize: 14 }}>{r.start} - {r.end}</div>
                    </td>

                    {/* STATUS */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span className={`pill ${cfg.pillClass}`} style={{ fontSize: 13 }}>
                        {cfg.label}
                      </span>
                    </td>

                    {/* WAKTU PEMBATALAN */}
                    <td style={{ whiteSpace: 'nowrap', fontSize: 13, color: '#4B5563' }}>
                      {r.status === 'dibatalkan' ? formatDateTimeIndo(r.cancelledAt) : '-'}
                    </td>

                    {/* TINDAKAN */}
                    <td style={{ textAlign: 'left', minWidth: 160 }} onClick={(e) => e.stopPropagation()}>
                      {r.status === 'menunggu' && (
                        <div style={{ display: 'flex', gap: 6, whiteSpace: 'nowrap' }}>
                          <button
                            type="button"
                            className="btn primary"
                            style={{ padding: '5px 12px', fontSize: 13 }}
                            onClick={() => handleApprove(r.id, facilityName, r.pemohon, formatAlatInfo(r.alat))}
                          >
                            Setujui
                          </button>
                          <button
                            type="button"
                            className="btn ghost-danger"
                            style={{ padding: '5px 12px', fontSize: 13 }}
                            onClick={() => handleReject(r.id, facilityName, r.pemohon, formatAlatInfo(r.alat))}
                          >
                            Tolak
                          </button>
                        </div>
                      )}

                      {r.status === 'disetujui' && (
                        <button
                          type="button"
                          className="btn ghost-danger"
                          style={{ padding: '5px 12px', fontSize: 13, whiteSpace: 'nowrap' }}
                          onClick={() => handleCancelEmergency(r.id, facilityName, r.pemohon, formatAlatInfo(r.alat))}
                          title="Batalkan reservasi dalam kondisi darurat"
                        >
                          Batal (Darurat)
                        </button>
                      )}

                      {r.status === 'ditolak' && (
                        <div style={{ color: '#DC2626', fontSize: 13, maxWidth: 240, wordBreak: 'break-word', lineHeight: 1.4 }} title={r.catatanBatal || undefined}>
                          {r.catatanBatal ? `Ditolak (${r.catatanBatal})` : '-'}
                        </div>
                      )}

                      {r.status === 'dibatalkan' && (
                        <div style={{ color: '#6B7280', fontSize: 13, maxWidth: 240, wordBreak: 'break-word', lineHeight: 1.4 }} title={r.catatanBatal || undefined}>
                          {r.catatanBatal ? `Dibatalkan (${r.catatanBatal})` : '-'}
                        </div>
                      )}

                      {r.status === 'selesai' && (
                        <span style={{ color: '#059669', fontSize: 13 }}>
                          -
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

      <ActionPromptModal config={modalConfig} onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))} />
      {detailFor && (
        <ReservationDetailModal
          reservation={detailFor}
          facility={facilityById(detailFor.facilityId)}
          onClose={() => setDetailFor(null)}
        />
      )}
    </div>
  );
}

export default function PetugasReservasiPage() {
  return (
    <Suspense fallback={null}>
      <PetugasReservasiContent />
    </Suspense>
  );
}
