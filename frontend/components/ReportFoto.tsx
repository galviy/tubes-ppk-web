'use client';

import { useState } from 'react';
import { reportFotoUrl } from '@/lib/api';

interface ReportFotoProps {
  foto?: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
}

// Menampilkan foto bukti laporan: data-URL/URL langsung, path uploads
// backend via proxy /api (cookie ikut otomatis), atau fallback ikon placeholder bila kosong/gagal dimuat.
export default function ReportFoto({ foto, alt = 'Foto Bukti', className, style }: ReportFotoProps) {
  const [gagal, setGagal] = useState(false);
  const url = reportFotoUrl(foto);

  if (!url || gagal) {
    return (
      <div
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          background: '#F3F4F6',
          color: '#9CA3AF',
          overflow: 'hidden',
          boxSizing: 'border-box',
          ...style,
        }}
        title={foto || 'Foto bukti tidak tersedia'}
        aria-label={foto ? 'Foto bukti tidak dapat dimuat' : 'Tanpa foto bukti'}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flexShrink: 0 }}
        >
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
      </div>
    );
  }
  return (
    <img
      src={url}
      alt={alt}
      className={className}
      style={style}
      onError={() => setGagal(true)}
    />
  );
}
