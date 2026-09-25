'use client';

import { Report, ReportStatus } from '@/models/report';
import { Facility } from '@/models/facility';
import ReportFoto from '@/components/ReportFoto';

const STATUS_PILL: Record<ReportStatus, [string, string]> = {
  baru: ['busy', 'Baru'],
  diproses: ['avail', 'Diproses'],
  selesai: ['avail', 'Selesai'],
  ditolak: ['danger', 'Ditolak'],
};

const STEPS = ['Laporan Dikirim', 'Sedang Diproses', 'Selesai'];

function stepIndex(status: ReportStatus): number {
  if (status === 'baru') return 0;
  if (status === 'diproses') return 1;
  return 2; // selesai atau ditolak — dianggap sudah di ujung alur
}

function contextualNote(status: ReportStatus, catatan: string): string {
  if (status === 'selesai') return catatan || 'Laporan ini sudah selesai ditangani petugas.';
  if (status === 'ditolak') return catatan || 'Laporan ini ditolak oleh petugas.';
  if (status === 'diproses') return 'Laporan kamu sedang dalam proses penanganan. Kami akan memperbarui status segera setelah ada perkembangan.';
  return 'Laporan kamu sudah diterima dan akan segera ditinjau petugas.';
}

interface ReportDetailModalProps {
  report: Report;
  facility: Facility | undefined;
  onClose: () => void;
}

export default function ReportDetailModal({ report, facility, onClose }: ReportDetailModalProps) {
  const [cls, label] = STATUS_PILL[report.status];
  const current = stepIndex(report.status);
  const rejected = report.status === 'ditolak';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Tutup">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>

        <div className="modal-title-row">
          <h3>{facility?.name}</h3>
          <span className={`pill ${cls}`}>{label}</span>
        </div>

        <div className="timeline-row">
          {STEPS.map((step, i) => (
            <div key={step} className={`timeline-step ${i <= current ? 'done' : ''} ${rejected && i === 2 ? 'rejected' : ''}`}>
              <div className="timeline-dot">{i < current || (i === current && !rejected) ? '✓' : rejected && i === 2 ? '✕' : i + 1}</div>
              <span>{rejected && i === 2 ? 'Ditolak' : step}</span>
              {i < STEPS.length - 1 && <div className="timeline-line" />}
            </div>
          ))}
        </div>

        <div className="detail-rows">
          <div><span>ID Laporan</span><b>rp{report.id}</b></div>
          <div><span>Fasilitas</span><b>{facility?.name}</b></div>
          <div><span>Kategori</span><b>{report.kategori}</b></div>
          <div><span>Deskripsi</span><b>{report.deskripsi}</b></div>
          <div><span>Status</span><b>{label}</b></div>
        </div>

        {report.foto && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#6B7280', marginBottom: 6 }}>
              BUKTI FOTO KERUSAKAN
            </div>
            <div style={{ width: '100%', maxHeight: 200, borderRadius: 6, overflow: 'hidden', border: '1px solid #D5D0C7', background: '#15171a' }}>
              <ReportFoto
                foto={report.foto}
                alt="Foto Bukti Kerusakan"
                style={{ width: '100%', height: '100%', maxHeight: 200, objectFit: 'contain', display: 'block' }}
              />
            </div>
          </div>
        )}

        <div className="alert info" style={{ marginTop: 18, marginBottom: 0 }}>
          {contextualNote(report.status, report.catatan)}
        </div>
      </div>
    </div>
  );
}
