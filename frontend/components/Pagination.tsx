'use client';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage = 10,
  onPageChange,
  className,
  style,
}: PaginationProps) {
  if (totalItems <= 0) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Buat array halaman dengan ellipsis jika total page > 6
  function getPageNumbers(): (number | string)[] {
    if (totalPages <= 6) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, 4, '...', totalPages];
    }
    if (currentPage >= totalPages - 2) {
      return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  }

  const pages = getPageNumbers();

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 14,
        marginTop: 18,
        paddingTop: 14,
        borderTop: '1px solid #EBE7DF',
        ...style,
      }}
      aria-label="Navigasi Halaman Data"
    >
      <div style={{ fontSize: 13.5, color: '#6B7280', fontWeight: 500 }}>
        Menampilkan <b style={{ color: '#181D24' }}>{startItem}–{endItem}</b> dari{' '}
        <b style={{ color: '#181D24' }}>{totalItems}</b> data (10 data per halaman)
      </div>

      <nav
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}
        aria-label="Paginasi"
      >
        {/* Tombol Sebelumnya */}
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          aria-label="Halaman sebelumnya"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '6px 12px',
            fontSize: 13,
            fontWeight: 600,
            borderRadius: 4,
            border: '1px solid #D5D0C7',
            background: '#FFFFFF',
            color: currentPage <= 1 ? '#9CA3AF' : '#181D24',
            cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
            opacity: currentPage <= 1 ? 0.6 : 1,
            transition: 'all 0.15s ease',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Sebelumnya</span>
        </button>

        {/* Nomor Halaman */}
        {pages.map((p, idx) => {
          if (p === '...') {
            return (
              <span
                key={`ellipsis-${idx}`}
                style={{ padding: '4px 6px', color: '#9CA3AF', fontSize: 14, fontWeight: 700 }}
                aria-hidden="true"
              >
                …
              </span>
            );
          }
          const pageNum = p as number;
          const isActive = pageNum === currentPage;
          return (
            <button
              key={pageNum}
              type="button"
              onClick={() => onPageChange(pageNum)}
              aria-label={`Halaman ${pageNum}`}
              aria-current={isActive ? 'page' : undefined}
              style={{
                minWidth: 32,
                height: 32,
                padding: '0 8px',
                fontSize: 13,
                fontWeight: isActive ? 700 : 600,
                borderRadius: 4,
                border: isActive ? '1px solid #15171a' : '1px solid #D5D0C7',
                background: isActive ? '#15171a' : '#FFFFFF',
                color: isActive ? '#b59876' : '#4B5563',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Tombol Selanjutnya */}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          aria-label="Halaman selanjutnya"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '6px 12px',
            fontSize: 13,
            fontWeight: 600,
            borderRadius: 4,
            border: '1px solid #D5D0C7',
            background: '#FFFFFF',
            color: currentPage >= totalPages ? '#9CA3AF' : '#181D24',
            cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
            opacity: currentPage >= totalPages ? 0.6 : 1,
            transition: 'all 0.15s ease',
          }}
        >
          <span>Selanjutnya</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </nav>
    </div>
  );
}
