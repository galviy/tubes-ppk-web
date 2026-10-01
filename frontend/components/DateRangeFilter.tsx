import { formatDateIndo } from '@/lib/slots';

interface DateRangeFilterProps {
  contextLabel: string;
  from: string;
  to: string;
  onChange: (range: { from: string; to: string }) => void;
}

export default function DateRangeFilter({ contextLabel, from, to, onChange }: DateRangeFilterProps) {
  const aktif = from || to;

  return (
    <div className="date-range-filter" role="group" aria-label={`Filter tanggal ${contextLabel} (WIB)`}>
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

      {aktif && (
        <>
          <button type="button" className="date-range-reset" onClick={() => onChange({ from: '', to: '' })}>
            Tampilkan semua tanggal
          </button>
          <span className="date-range-summary">
            {from && to
              ? `${formatDateIndo(from)} sampai ${formatDateIndo(to)}`
              : from
              ? `Sejak ${formatDateIndo(from)}`
              : `Sampai ${formatDateIndo(to)}`}
          </span>
        </>
      )}
    </div>
  );
}