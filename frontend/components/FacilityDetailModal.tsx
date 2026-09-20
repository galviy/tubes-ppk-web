'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Facility } from '@/models/facility';
import { useAppData } from '@/context/AppDataContext';

const statusBadge: Record<Facility['status'], { cls: string; label: string }> = {
  avail: { cls: 'avail', label: 'Tersedia' },
  busy: { cls: 'busy', label: 'Digunakan' },
  repair: { cls: 'repair', label: 'Perbaikan' },
  nonaktif: { cls: 'repair', label: 'Nonaktif' },
};

interface FacilityDetailModalProps {
  facility: Facility;
  onClose: () => void;
}

export default function FacilityDetailModal({ facility, onClose }: FacilityDetailModalProps) {
  const router = useRouter();
  const { currentUser } = useAppData();
  const badge = statusBadge[facility.status];

  function goOrLogin(path: string) {
    onClose();
    router.push(currentUser ? path : '/#auth');
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Tutup">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>

        <span className={`badge-inline ${badge.cls}`}>{badge.label}</span>

        {facility.image && (
          <div style={{ width: '100%', height: 200, borderRadius: 6, overflow: 'hidden', margin: '12px 0 14px', border: '1px solid #E5E0D8' }}>
            <img src={facility.image} alt={facility.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}

        <h3>{facility.name}</h3>
        <div className="modal-meta">{facility.type} · {facility.loc}</div>

        <p className="modal-desc">{facility.desc}</p>

        <div className="modal-info-grid">
          <div><span className="lbl-sm">Kapasitas</span><div>{facility.cap} orang</div></div>
          <div><span className="lbl-sm">Kelengkapan</span><div>{facility.amenities.join(', ') || '—'}</div></div>
        </div>

        {!currentUser && (
          <div className="alert info" style={{ marginTop: 18 }}>
            Kamu belum masuk. Untuk mengajukan reservasi atau melaporkan kerusakan, silakan login dulu —
            tapi jadwal ketersediaannya bisa kamu cek tanpa login.
          </div>
        )}

        <div className="modal-actions">
          <Link href={`/jadwal?facility=${facility.id}`} className="btn" onClick={onClose}>
            Lihat jadwal
          </Link>
          <button
            className="btn primary"
            disabled={facility.status === 'repair' || facility.status === 'nonaktif'}
            onClick={() => goOrLogin(`/pengguna/reservasi?facility=${facility.id}`)}
          >
            Ajukan reservasi
          </button>
          <button className="btn ghost-danger" onClick={() => goOrLogin(`/pengguna/lapor?facility=${facility.id}`)}>
            Laporkan kerusakan
          </button>
        </div>
      </div>
    </div>
  );
}
