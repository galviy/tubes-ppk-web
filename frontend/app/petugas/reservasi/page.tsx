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
};

export default function PetugasReservasiPage() {
  const { reservations, facilityById } = useAppData();

  const [filterStatus, setFilterStatus] = useState<string>('semua');

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
        <p>Antrean read-only: backend belum menyediakan endpoint persetujuan/penolakan/pembatalan reservasi.</p>
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
                  Tidak ada reservasi dalam kategori ini.
                  <div style={{ fontSize: 12, marginTop: 8 }}>
                    Catatan: backend hanya mengembalikan reservasi milik akun yang login — pengajuan
                    milik pengguna lain (mis. 4 antrean PENDING saat ini) tidak terlihat di sini.
                    Antrean lintas-pengguna membutuhkan endpoint backend yang belum tersedia.
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((r) => {
                const fac = facilityById(r.facilityId);
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
                      <div>{formatDateIndo(r.tanggal)}</div>
                      <div style={{ color: '#6B7280', fontSize: 12 }}>{r.start} - {r.end}</div>
                    </td>

                    {/* PESERTA / UNIT */}
                    <td style={{ whiteSpace: 'nowrap', fontSize: 13 }}>
                      {r.peserta ? `${r.peserta} ${fac?.type?.toLowerCase() === 'alat' ? 'unit' : 'orang'}` : '-'}
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

                    {/* TINDAKAN (no-op: backend belum menyediakan endpoint) */}
                    <td style={{ whiteSpace: 'nowrap', textAlign: 'left' }}>
                      {r.status === 'menunggu' && (
                        <select
                          className="table-select-action"
                          value="menunggu"
                          title="Menunggu endpoint backend — pilihan tidak melakukan apa-apa"
                          onChange={(e) => {
                            e.target.value = 'menunggu';
                          }}
                        >
                          <option value="menunggu">Menunggu</option>
                          <option value="setuju">Setuju</option>
                          <option value="tolak">Tolak</option>
                        </select>
                      )}

                      {r.status === 'disetujui' && (
                        <select
                          className="table-select-action"
                          value="setuju"
                          title="Menunggu endpoint backend — pilihan tidak melakukan apa-apa"
                          onChange={(e) => {
                            e.target.value = 'setuju';
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
    </div>
  );
}
