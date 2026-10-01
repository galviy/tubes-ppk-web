'use client';

import { useState, useEffect } from 'react';
import { useAppData } from '@/context/AppDataContext';
import { Reservation, ReservationStatus } from '@/models/reservation';
import ReservationDetailModal from '@/components/ReservationDetailModal';
import { formatDateIndo, formatDateTimeIndo } from '@/lib/slots';
import { isAlatReservation } from '@/models/facilities-data';

const STATUS_PILL: Record<ReservationStatus, [string, string]> = {
  menunggu: ['busy', 'Menunggu'],
  disetujui: ['avail', 'Disetujui'],
  ditolak: ['danger', 'Ditolak'],
  dibatalkan: ['repair', 'Dibatalkan'],
  selesai: ['avail', 'Selesai'],
};

export default function RiwayatReservasiPage() {
  const { reservations, facilityById, currentUser, cancelReservation, refreshReservations } = useAppData();

  useEffect(() => {
    refreshReservations();
  }, [refreshReservations]);

  const currentIdent = currentUser?.nama || currentUser?.email || '';
  const mine = reservations.filter(
    (r) =>
      !r.pemohon ||
      r.pemohon === currentUser?.nama ||
      r.pemohon === currentUser?.email ||
      (currentIdent && r.pemohon.toLowerCase() === currentIdent.toLowerCase()),
  );
  const [detailFor, setDetailFor] = useState<Reservation | null>(null);
  const [filterType, setFilterType] = useState<'semua' | 'ruangan' | 'alat'>('semua');

  const countRuangan = mine.filter((r) => !isAlatReservation(r, facilityById(r.facilityId))).length;
  const countAlat = mine.filter((r) => isAlatReservation(r, facilityById(r.facilityId))).length;

  const filteredMine = mine.filter((r) => {
    const fac = facilityById(r.facilityId);
    const isAlat = isAlatReservation(r, fac);
    if (filterType === 'ruangan' && isAlat) return false;
    if (filterType === 'alat' && !isAlat) return false;
    return true;
  });

  return (
    <div>
      <div className="content-head">
        <h2>Reservasi saya</h2>
        <p>Riwayat pengajuan reservasi fasilitas kampus (ruangan dan alat).</p>
      </div>

      <div className="alert info">
        Batas waktu pembatalan: minimal <b>2 jam</b> sebelum waktu mulai reservasi.
      </div>

      {/* Sub-tab: Filter Semua, Ruangan, Alat */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        {[
          { key: 'semua', label: `Semua Reservasi (${mine.length})` },
          { key: 'ruangan', label: `Reservasi Ruangan (${countRuangan})` },
          { key: 'alat', label: `Reservasi Alat (${countAlat})` },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilterType(tab.key as 'semua' | 'ruangan' | 'alat')}
            style={{
              padding: '7px 16px',
              borderRadius: 6,
              fontSize: 13.5,
              fontWeight: 700,
              cursor: 'pointer',
              border: filterType === tab.key ? '1px solid #b59876' : '1px solid #E5E0D8',
              background: filterType === tab.key ? '#15171a' : '#FFFFFF',
              color: filterType === tab.key ? '#b59876' : '#6B7280',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="card-list">
        {filteredMine.length === 0 && (
          <div className="panel" style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>
            Belum ada data reservasi {filterType === 'ruangan' ? 'ruangan' : filterType === 'alat' ? 'alat' : ''}.
          </div>
        )}
        {filteredMine.map((r) => {
          const facility = facilityById(r.facilityId);
          const isAlat = isAlatReservation(r, facility);
          const [cls, label] = STATUS_PILL[r.status] || ['neutral', r.status];
          return (
            <div key={r.id} className="item-card">
              <div className="item-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: 17, margin: 0 }}>
                    {facility?.name || r.ruanganNama || `Fasilitas #${r.facilityId}`}
                  </h3>
                  <span
                    className="pill neutral"
                    style={{ fontSize: 12, padding: '2px 8px', fontWeight: 600 }}
                  >
                    {isAlat ? 'Alat' : 'Ruangan'}
                  </span>
                  {!isAlat && r.alat && r.alat.length > 0 && (
                    <span
                      style={{
                        fontSize: 11,
                        padding: '2px 7px',
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
                  <span className={`pill ${cls}`}>{label}</span>
                </div>
                <button className="btn ghost" onClick={() => setDetailFor(r)}>
                  Lihat Detail
                </button>
              </div>
              <div className="item-card-body">
                <div className="item-meta-row">
                  <span className="meta-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    {formatDateIndo(r.tanggal)}
                  </span>
                  <span className="meta-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    {r.start} - {r.end} WIB
                  </span>
                  <span className="meta-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    Dipesan {formatDateTimeIndo(r.createdAt)}
                  </span>
                  {r.peserta && (
                    <span className="meta-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                      {r.peserta} {isAlat ? 'unit' : 'orang'}
                    </span>
                  )}
                  <span className="meta-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    {facility?.loc || '-'}
                  </span>
                </div>
                {!isAlat && r.alat && r.alat.length > 0 && (
                  <div
                    style={{
                      marginTop: 10,
                      padding: '6px 10px',
                      background: '#FAF8F5',
                      border: '1px solid #E5E0D8',
                      borderRadius: 4,
                      fontSize: 13,
                      color: '#181D24',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      flexWrap: 'wrap',
                    }}
                  >
                    <span style={{ fontWeight: 700, color: '#937654' }}>Alat Pendukung:</span>
                    <span>{r.alat.map((a) => `${a.nama} (${a.jumlah} unit)`).join(', ')}</span>
                  </div>
                )}
                <div style={{ marginTop: 12, color: 'var(--ink-body)', fontSize: 14 }}>
                  Tujuan: {r.tujuan}
                </div>
                {r.catatanBatal && (r.status === 'dibatalkan' || r.status === 'ditolak') && (
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 13,
                      color: '#B91C1C',
                      background: '#FEF2F2',
                      border: '1px solid #FECACA',
                      padding: '6px 12px',
                      borderRadius: 4,
                      display: 'inline-block',
                    }}
                  >
                    Catatan {r.status === 'dibatalkan' ? 'Pembatalan' : 'Penolakan'}: {r.catatanBatal}
                  </div>
                )}
                {r.status === 'dibatalkan' && r.cancelledAt && (
                  <div style={{ marginTop: 8, fontSize: 13, color: '#6B7280' }}>
                    Waktu pembatalan: {formatDateTimeIndo(r.cancelledAt)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {detailFor && (
        <ReservationDetailModal
          reservation={detailFor}
          facility={facilityById(detailFor.facilityId)}
          onClose={() => setDetailFor(null)}
          onCancel={async (id, alasan) => {
            const res = await cancelReservation(id, alasan);
            if (!res.ok) {
              throw new Error(res.message || 'Gagal membatalkan reservasi.');
            }
          }}
        />
      )}
    </div>
  );
}
