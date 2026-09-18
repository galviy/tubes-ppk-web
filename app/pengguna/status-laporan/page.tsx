'use client';

import { useState } from 'react';
import { useAppData } from '@/context/AppDataContext';
import { Report, ReportStatus } from '@/models/report';
import ReportDetailModal from '@/components/ReportDetailModal';

const STATUS_PILL: Record<ReportStatus, [string, string]> = {
  baru: ['busy', 'Baru'],
  diproses: ['avail', 'Diproses'],
  selesai: ['avail', 'Selesai'],
  ditolak: ['danger', 'Ditolak'],
};

export default function StatusLaporanPage() {
  const { reports, facilityById, currentUser } = useAppData();
  const mine = reports.filter((r) => r.pelapor === currentUser?.nama);
  const [detailFor, setDetailFor] = useState<Report | null>(null);

  return (
    <div>
      <div className="content-head">
        <h2>Laporan saya</h2>
        <p>Status laporan kerusakan yang pernah diajukan.</p>
      </div>

      <div className="panel table-scroll">
        <table>
          <thead>
            <tr>
              <th>Fasilitas</th>
              <th>Kategori</th>
              <th>Deskripsi</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {mine.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>
                  Belum ada laporan.
                </td>
              </tr>
            )}
            {mine.map((r) => {
              const facility = facilityById(r.facilityId);
              const [cls, label] = STATUS_PILL[r.status];
              return (
                <tr key={r.id}>
                  <td>{facility?.name}</td>
                  <td>{r.kategori}</td>
                  <td>{r.deskripsi}</td>
                  <td><span className={`pill ${cls}`}>{label}</span></td>
                  <td>
                    <button className="btn" onClick={() => setDetailFor(r)}>
                      Detail lengkap
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {detailFor && (
        <ReportDetailModal
          report={detailFor}
          facility={facilityById(detailFor.facilityId)}
          onClose={() => setDetailFor(null)}
        />
      )}
    </div>
  );
}
