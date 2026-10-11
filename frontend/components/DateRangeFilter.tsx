import { formatDateIndo } from '@/lib/slots';

interface DateRangeFilterProps {
  contextLabel: string;
  from: string;
  to: string;
  onChange: (range: { from: string; to: string }) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
}

export default function DateRangeFilter({
  contextLabel,
  from,
  to,
  onChange,
  searchValue,
  onSearchChange,
  searchPlaceholder,
}: DateRangeFilterProps) {
  const aktif = from || to;

  return (
    <div className="date-range-filter" role="group" aria-label="Filter tanggal dan pencarian (WIB)">
      <span className="date-range-title">Tanggal {contextLabel} (WIB)</span>

      <label className="date-range-field">
        <span>Dari tanggal</span>
        <input
          type="date"
          value={from}
          onChange={(event) => onChange({ from: event.target.value, to })}
        />
      </label>

      <label className="date-range-field">
        <span>Sampai tanggal</span>
        <input
          type="date"
          value={to}
          onChange={(event) => onChange({ from, to: event.target.value })}
        />
      </label>

      {onSearchChange !== undefined && (
        <label className="date-range-field">
          <span>Nama fasilitas</span>
          <input
            type="text"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder || 'Ketik nama fasilitas...'}
            style={{ width: 200 }}
          />
        </label>
      )}

      {aktif && (
        <button type="button" className="date-range-reset" onClick={() => onChange({ from: '', to: '' })}>
          Tampilkan semua tanggal
        </button>
      )}
    </div>
  );
}