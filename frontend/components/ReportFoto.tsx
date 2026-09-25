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
// backend via proxy /api (cookie ikut otomatis), atau fallback jujur
// (nama file) bila kosong/gagal dimuat (mis. 401/404).
export default function ReportFoto({ foto, alt = 'Foto Bukti', className, style }: ReportFotoProps) {
  const [gagal, setGagal] = useState(false);
  const url = foto && (foto.startsWith('data:') || foto.startsWith('http'))
    ? foto
    : reportFotoUrl(foto);
  const namaFile = foto ? foto.split('/').pop()?.split('\\').pop() : '';

  if (!url || gagal) {
    return (
      <div
        className={className}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          background: '#F3F4F6',
          color: '#6B7280',
          fontSize: 11,
          padding: 8,
          ...style,
        }}
        title={foto || undefined}
      >
        {foto ? `Bukti: ${namaFile || 'tidak dapat ditampilkan'}` : 'Tanpa foto bukti'}
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
