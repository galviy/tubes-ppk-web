'use client';

import { useState } from 'react';
import { useAppData } from '@/context/AppDataContext';
import { ReservationStatus } from '@/models/reservation';
import { formatDateIndo } from '@/lib/slots';

const STATUS_CONFIG: Record<ReservationStatus, { pillClass: string; label: string }> = {
  menunggu: { pillClass: 'busy', label: 'Menunggu' },
  disetujui: { pillClass: 'avail', label: 'Disetujui' },
  ditolak: { pillClass: 'danger', label: 'Ditolak' },
  dibatalkan: { pillClass: 'neutral', label: 'Dibatalkan' },
  selesai: { pillClass: 'avail', label: 'Selesai' },
};

export default function AdminSemuaReservasiPage() {
  const { reservations, facilities, facilityById } = useAppData();
  const [filterStatus, setFilterStatus] = useState<string>('semua');
  const [filterFacility, setFilterFacility] = useState<string>('semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtered reservations
  const filtered = reservations.filter((r) => {
    if (filterStatus !== 'semua' && r.status !== filterStatus) return false;
    if (filterFacility !== 'semua' && r.facilityId !== filterFacility) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const fac = facilityById(r.facilityId);
      const matchFac = fac?.name.toLowerCase().includes(q);
      const matchPemohon = r.pemohon.toLowerCase().includes(q);
      const matchTujuan = r.tujuan.toLowerCase().includes(q);
      return matchFac || matchPemohon || matchTujuan;
    }
    return true;
  });

  return (
    <div>
      <div className="content-head">
        <h2>Semua Reservasi Fasilitas</h2>
        <p>Log audit seluruh pengajuan reservasi fasilitas kampus Universitas Diponegoro beserta status persetujuannya.</p>
      </div>

      {/* Filter Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        {/* Status Filter Chips */}
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

        {/* Right Side: Facility Dropdown & Search */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={filterFacility}
            onChange={(e) => setFilterFacility(e.target.value)}
            style={{ padding: '6px 12px', fontSize: 13, borderRadius: 6, border: '1px solid #D5D0C7' }}
          >
            <option value="semua">Semua Fasilitas</option>
            {facilities.map((fac) => (
              <option key={fac.id} value={fac.id}>{fac.name}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Cari pemohon / fasilitas / tujuan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: '6px 12px', fontSize: 13, borderRadius: 6, border: '1px solid #D5D0C7', minWidth: 200 }}
          />
        </div>
      </div>

      {/* Table Reservasi */}
      <div className="panel table-scroll" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>Fasilitas &amp; Lokasi</th>
              <th>Pemohon</th>
              <th>Jadwal Reservasi</th>
              <th>Keperluan Kegiatan</th>
              <th>Status</th>
              <th>Diajukan Pada</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: '#6B7280', padding: 24 }}>
                  Tidak ada data reservasi yang sesuai dengan filter pencarian.
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

                    {/* PEMOHON */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 600, color: '#181D24' }}>{r.pemohon}</div>
                      {r.peserta && (
                        <div style={{ fontSize: 13.5, color: '#6B7280' }}>
                          {fac?.type?.toLowerCase() === 'alat' ? `Jumlah: ${r.peserta} unit` : `Estimasi: ${r.peserta} peserta`}
                        </div>
                      )}
                    </td>

                    {/* JADWAL */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 600, color: '#181D24' }}>{formatDateIndo(r.tanggal)}</div>
                      <div style={{ fontSize: 14, color: '#b59876', fontWeight: 500 }}>
                        {r.start} - {r.end} WIB
                      </div>
                    </td>

                    {/* KEPERLUAN & CATATAN */}
                    <td style={{ maxWidth: 280, fontSize: 13, color: '#4B5563' }}>
                      <div>{r.tujuan}</div>
                      {r.catatanBatal && (
                        <div style={{ marginTop: 4, fontSize: 14, color: '#991B1B', fontStyle: 'italic' }}>
                          Alasan pembatalan/penolakan: {r.catatanBatal}
                        </div>
                      )}
                    </td>

                    {/* STATUS */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span className={`pill ${cfg.pillClass}`} style={{ fontSize: 13.5 }}>
                        {cfg.label}
                      </span>
                    </td>

                    {/* TANGGAL DIAJUKAN */}
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
    </div>
  );
}
