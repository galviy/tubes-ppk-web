'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppData } from '@/context/AppDataContext';
import { ReservationStatus } from '@/models/reservation';
import { formatDateIndo } from '@/lib/slots';
import ActionPromptModal, { ActionModalConfig } from '@/components/ActionPromptModal';
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
    const list = reservations.filter((r) => {
      const fac = facilityById(r.facilityId);
      const isAlat = isAlatReservation(r, fac);
      if (tabType === 'ruangan' && isAlat) return false;
      if (tabType === 'alat' && !isAlat) return false;
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
                  Tidak ada reservasi yang cocok dengan filter ini.
                </td>
              </tr>
            ) : (
              filtered.map((r) => {
                const fac = facilityById(r.facilityId);
                const isAlat = isAlatReservation(r, fac);
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontWeight: 600, color: '#181D24' }}>{facilityName}</span>
                        <span
                          className="pill neutral"
                          style={{ fontSize: 11, padding: '1px 6px', fontWeight: 600 }}
                        >
                          {isAlat ? 'Alat' : 'Ruangan'}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: '#6B7280' }}>
                        {fac?.type || '-'} • {fac?.loc || '-'}
                      </div>
                    </td>

                    {/* JADWAL */}
                    <td style={{ whiteSpace: 'nowrap', fontSize: 13 }}>
                      <div>{formatDateIndo(r.tanggal)}</div>
                      <div style={{ color: '#6B7280', fontSize: 14 }}>{r.start} - {r.end}</div>
                    </td>

                    {/* PESERTA / UNIT */}
                    <td style={{ whiteSpace: 'nowrap', fontSize: 13 }}>
                      {r.peserta ? `${r.peserta} ${isAlat ? 'unit' : 'orang'}` : '-'}
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

export default function PetugasReservasiPage() {
  return (
    <Suspense fallback={null}>
      <PetugasReservasiContent />
    </Suspense>
  );
}
