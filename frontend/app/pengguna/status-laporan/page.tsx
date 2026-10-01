'use client';

import { useState, useEffect } from 'react';
import { useAppData } from '@/context/AppDataContext';
import { Report, ReportStatus } from '@/models/report';
import ReportDetailModal from '@/components/ReportDetailModal';
import ReportFoto from '@/components/ReportFoto';
import { formatDateTimeIndo } from '@/lib/slots';

const STATUS_PILL: Record<ReportStatus, [string, string]> = {
  baru: ['busy', 'Baru'],
  diproses: ['avail', 'Diproses'],
  selesai: ['avail', 'Selesai'],
  ditolak: ['danger', 'Ditolak'],
};

export default function StatusLaporanPage() {
  const { reports, facilityById, currentUser, refreshReportsMine } = useAppData();

  useEffect(() => {
    refreshReportsMine();
  }, [refreshReportsMine]);

  const currentIdent = currentUser?.nama || currentUser?.email || '';
  const mine = reports.filter(
    (r) =>
      !r.pelapor ||
      r.pelapor === currentUser?.nama ||
      r.pelapor === currentUser?.email ||
      (currentIdent && r.pelapor.toLowerCase() === currentIdent.toLowerCase()),
  );
  const [detailFor, setDetailFor] = useState<Report | null>(null);

  return (
    <div>
      <div className="content-head">
        <h2>Laporan saya</h2>
        <p>Status laporan kerusakan yang pernah diajukan.</p>
      </div>

      <div className="card-list">
        {mine.length === 0 && (
          <div className="panel" style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>
            Belum ada laporan.
          </div>
        )}
        {mine.map((r) => {
          const facility = facilityById(r.facilityId);
          const [cls, label] = STATUS_PILL[r.status];
          return (
            <div key={r.id} className="item-card">
              <div className="item-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <h3 style={{ fontSize: 17, margin: 0 }}>{facility?.name}</h3>
                  <span className={`pill ${cls}`}>{label}</span>
                  <span className="pill" style={{ background: '#f1f3f5', color: 'var(--ink-main)' }}>{r.kategori}</span>
                </div>
                <button className="btn ghost" onClick={() => setDetailFor(r)}>
                  Detail Lengkap
                </button>
              </div>
              <div className="item-card-body" style={{ display: 'flex', gap: 20 }}>
                {r.foto && (
                  <div style={{ width: 100, height: 75, borderRadius: 6, background: '#eee', flexShrink: 0, overflow: 'hidden' }}>
                    <ReportFoto
                      foto={r.foto}
                      alt="Foto Bukti"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                )}
                <div>
                  <p style={{ margin: '0 0 12px 0', lineHeight: 1.5, color: 'var(--ink-main)' }}>
                    {r.deskripsi}
                  </p>
                  <div className="item-meta-row" style={{ fontSize: 13 }}>
                    <span className="meta-item">ID: rp{r.id}</span>
                    <span className="meta-item">·</span>
                    <span className="meta-item">Dilaporkan: {r.createdAt ? formatDateTimeIndo(r.createdAt) : 'Waktu tidak tersedia'}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
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
