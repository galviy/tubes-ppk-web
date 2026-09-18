'use client';

import { useAppData } from '@/context/AppDataContext';
import { ReservationStatus } from '@/models/reservation';

const STATUS_PILL: Record<ReservationStatus, [string, string]> = {
  menunggu: ['busy', 'Menunggu'],
  disetujui: ['avail', 'Disetujui'],
  ditolak: ['danger', 'Ditolak'],
  dibatalkan: ['repair', 'Dibatalkan'],
};

export default function AntrianReservasiPage() {
  const { reservations, facilityById, isSlotTaken, approveReservation, rejectReservation, cancelApprovedReservation } =
    useAppData();

  const queue = reservations.filter((r) => r.status === 'menunggu' || r.status === 'disetujui');

  function handleApprove(id: number) {
    const result = approveReservation(id);
    if (!result.ok) alert(result.message);
  }

  function handleCancelApproved(id: number) {
    const alasan = prompt('Alasan pembatalan mendesak:');
    if (alasan === null) return;
    cancelApprovedReservation(id, alasan);
  }

  return (
    <div>
      <div className="content-head">
        <h2>Antrian reservasi</h2>
        <p>Setujui atau tolak permohonan. Sistem menandai bentrok jadwal secara otomatis.</p>
      </div>

      <div className="panel table-scroll">
        <table>
          <thead>
            <tr>
              <th>Pemohon</th>
              <th>Fasilitas</th>
              <th>Jadwal</th>
              <th>Peserta</th>
              <th>Tujuan</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {queue.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>
                  Tidak ada antrian.
                </td>
              </tr>
            )}
            {queue.map((r) => {
              const facility = facilityById(r.facilityId);
              const [cls, label] = STATUS_PILL[r.status];
              const conflict = r.status === 'menunggu' && isSlotTaken(r.facilityId, r.start, r.id);
              const overCap = !!facility && !!r.peserta && r.peserta > facility.cap;
              return (
                <tr key={r.id}>
                  <td>{r.pemohon}</td>
                  <td>{facility?.name}</td>
                  <td>{r.tanggal}, {r.start}–{r.end}</td>
                  <td>
                    {r.peserta ? `${r.peserta} orang` : '—'}
                    {overCap && <div style={{ fontSize: 11, color: '#c2740a', fontWeight: 600 }}>Melebihi kapasitas</div>}
                  </td>
                  <td>{r.tujuan}</td>
                  <td>
                    <span className={`pill ${cls}`}>{label}</span>
                    {conflict && (
                      <>
                        <br />
                        <span className="pill danger" style={{ marginTop: 4 }}>Bentrok jadwal</span>
                      </>
                    )}
                  </td>
                  <td className="btn-row">
                    {r.status === 'menunggu' ? (
                      <>
                        <button className="btn ghost-avail" disabled={conflict} onClick={() => handleApprove(r.id)}>
                          Setujui
                        </button>
                        <button className="btn ghost-danger" onClick={() => rejectReservation(r.id)}>
                          Tolak
                        </button>
                      </>
                    ) : (
                      <button className="btn ghost-danger" onClick={() => handleCancelApproved(r.id)}>
                        Batalkan (mendesak)
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
