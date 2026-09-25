'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppData } from '@/context/AppDataContext';

const ICONS = {
  reservasi: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  ),
  laporan: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3L2 20h20L12 3z" />
      <path d="M12 10v4M12 17h.01" />
    </svg>
  ),
  perbaikan: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  fasilitas: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
};

export default function PetugasRingkasanPage() {
  const {
    reservations,
    reports,
    facilities,
    currentUser,
    refreshReservations,
    refreshPetugasReports,
  } = useAppData();

  useEffect(() => {
    refreshReservations();
    refreshPetugasReports();
  }, [refreshReservations, refreshPetugasReports]);

  const resMenunggu = reservations.filter((r) => r.status === 'menunggu').length;
  const lapAktif = reports.filter((r) => r.status === 'baru' || r.status === 'diproses').length;
  const perbaikan = facilities.filter((f) => f.status === 'repair').length;
  const totalFasilitas = facilities.length;

  const displayName = currentUser?.nama?.split(' ')[0] || 'Budi';

  const [showResPopup, setShowResPopup] = useState(false);
  const [showLapPopup, setShowLapPopup] = useState(false);

  useEffect(() => {
    if (resMenunggu > 0) setShowResPopup(true);
    if (lapAktif > 0) setShowLapPopup(true);
  }, [resMenunggu, lapAktif]);

  useEffect(() => {
    if (!showResPopup) return;
    const t = setTimeout(() => setShowResPopup(false), 8000);
    return () => clearTimeout(t);
  }, [showResPopup]);

  useEffect(() => {
    if (!showLapPopup) return;
    const t = setTimeout(() => setShowLapPopup(false), 8000);
    return () => clearTimeout(t);
  }, [showLapPopup]);

  const popupBase: React.CSSProperties = {
    position: 'fixed',
    right: 24,
    zIndex: 99999,
    maxWidth: 420,
    width: 'calc(100vw - 48px)',
    background: '#FFFFFF',
    borderRadius: 6,
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.2)',
    padding: '14px 16px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    animation: 'fadeIn 0.25s ease-out',
  };

  const closeBtn: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#9CA3AF',
    padding: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  };

  return (
    <div>
      {/* Popup: Reservasi menunggu */}
      {showResPopup && resMenunggu > 0 && (
        <div
          role="status"
          aria-live="polite"
          style={{
            ...popupBase,
            top: 24,
            border: '1px solid #FDE68A',
            borderLeft: '5px solid #D97706',
          }}
        >
          <div style={{ flexShrink: 0, marginTop: 2 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font)', fontWeight: 700, fontSize: 14, color: '#92400E', marginBottom: 2 }}>
              Antrian Reservasi
            </div>
            <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.5 }}>
              Ada <strong>{resMenunggu} reservasi</strong> yang masih menunggu persetujuan.{' '}
              <Link href="/petugas/reservasi" style={{ color: '#b59876', fontWeight: 600, textDecoration: 'underline' }}>
                Tinjau sekarang
              </Link>
            </div>
          </div>
          <button type="button" onClick={() => setShowResPopup(false)} aria-label="Tutup notifikasi" style={closeBtn}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* Popup: Laporan kerusakan aktif */}
      {showLapPopup && lapAktif > 0 && (
        <div
          role="status"
          aria-live="polite"
          style={{
            ...popupBase,
            top: showResPopup && resMenunggu > 0 ? 100 : 24,
            border: '1px solid #FECACA',
            borderLeft: '5px solid #DC2626',
          }}
        >
          <div style={{ flexShrink: 0, marginTop: 2 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3L2 20h20L12 3z" />
              <path d="M12 10v4M12 17h.01" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font)', fontWeight: 700, fontSize: 14, color: '#991B1B', marginBottom: 2 }}>
              Antrian Laporan Kerusakan
            </div>
            <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.5 }}>
              Ada <strong>{lapAktif} laporan</strong> kerusakan yang perlu ditindaklanjuti.{' '}
              <Link href="/petugas/laporan" style={{ color: '#b59876', fontWeight: 600, textDecoration: 'underline' }}>
                Tinjau sekarang
              </Link>
            </div>
          </div>
          <button type="button" onClick={() => setShowLapPopup(false)} aria-label="Tutup notifikasi" style={closeBtn}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* Top Greeting Banner */}
      <div className="greeting-band">
        <div>
          <div className="greeting-eyebrow">
            PORTAL PETUGAS OPERASIONAL • UNIVERSITAS DIPONEGORO
          </div>
          <h2>Halo, {displayName}</h2>
          <p>Ringkasan antrian yang perlu kamu tindak lanjuti hari ini.</p>
        </div>
        <span className="role-chip">Akun Petugas</span>
      </div>

      {/* 4 Stat Cards */}
      <div className="summary-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="summary-card">
          <div className="summary-card-icon">{ICONS.reservasi}</div>
          <div>
            <div className="num">{resMenunggu}</div>
            <div className="lbl">Reservasi menunggu</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-card-icon">{ICONS.laporan}</div>
          <div>
            <div className="num">{lapAktif}</div>
            <div className="lbl">Laporan aktif</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-card-icon">{ICONS.perbaikan}</div>
          <div>
            <div className="num">{perbaikan}</div>
            <div className="lbl">Fasilitas dalam perbaikan</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-card-icon">{ICONS.fasilitas}</div>
          <div>
            <div className="num">{totalFasilitas}</div>
            <div className="lbl">Total fasilitas dikelola</div>
          </div>
        </div>
      </div>

      {/* Quick Menu Section */}
      <div style={{ marginTop: 12, marginBottom: 18 }}>
        <h3 style={{ fontSize: 22, fontWeight: 600, color: '#181D24', margin: '0 0 16px 0' }}>Menu cepat</h3>
      </div>

      <div className="menu-card-grid">
        <Link href="/petugas/reservasi" className="menu-card">
          <h3>Antrian Reservasi</h3>
          <p>Setujui, tolak, atau batalkan reservasi.</p>
        </Link>
        <Link href="/petugas/laporan" className="menu-card">
          <h3>Antrian Laporan</h3>
          <p>Proses dan tindak lanjuti laporan kendala sarpras.</p>
        </Link>
        <Link href="/petugas/fasilitas" className="menu-card">
          <h3>Status Fasilitas</h3>
          <p>Atur status operasional fasilitas: Tersedia, Digunakan, atau Dalam Perbaikan.</p>
        </Link>
      </div>
    </div>
  );
}
