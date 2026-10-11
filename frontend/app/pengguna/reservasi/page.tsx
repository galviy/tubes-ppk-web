'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppData } from '@/context/AppDataContext';
import {
  generateTimeSlots,
  currentHHMM,
  getTodayDateString,
  isReservationDeadlineValid,
  getEarliestReservableDate,
  getSlotBooking,
  hasRangeConflict,
  sisaStokAlatPadaRange,
  formatDateIndo,
} from '@/lib/slots';
import { TimeSlot } from '@/models/facility';
import ActionPromptModal, { ActionModalConfig } from '@/components/ActionPromptModal';
import {
  isAlatFacility,
  isRuanganFacility,
  DEFAULT_ROOM_CATEGORIES,
  DEFAULT_ALAT_CATEGORIES,
} from '@/models/facilities-data';

const SLOTS = generateTimeSlots();
const START_OPTIONS = SLOTS.map((s) => s.start); // '07:00' to '19:30'
const END_OPTIONS = SLOTS.map((s) => s.end);     // '07:30' to '20:00' (includes 20:00)

const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const WEEKDAY_NAMES_ID = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

// Custom date picker that ALWAYS opens downwards and matches the public schedule calendar style
function DownwardDatePicker({
  label,
  value,
  minDate,
  onChange,
  onInvalidDate,
}: {
  label: string;
  value: string;
  minDate?: string;
  onChange: (val: string) => void;
  onInvalidDate?: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const parsed = useMemo(() => {
    const parts = (value || getTodayDateString()).split('-').map(Number);
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      return { y: parts[0], m: parts[1] - 1, d: parts[2] };
    }
    const [y, m, d] = getTodayDateString().split('-').map(Number);
    return { y, m: m - 1, d };
  }, [value]);

  const [viewYear, setViewYear] = useState(parsed.y);
  const [viewMonth, setViewMonth] = useState(parsed.m);

  useEffect(() => {
    setViewYear(parsed.y);
    setViewMonth(parsed.m);
  }, [parsed.y, parsed.m]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean; isDisabled: boolean }[] = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevM = viewMonth === 0 ? 11 : viewMonth - 1;
      const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
      const dateStr = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: false,
        isDisabled: minDate ? dateStr < minDate : false,
      });
    }

    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: true,
        isDisabled: minDate ? dateStr < minDate : false,
      });
    }

    const totalSlots = Math.ceil(days.length / 7) * 7;
    const nextPadding = totalSlots - days.length;
    for (let d = 1; d <= nextPadding; d++) {
      const nextM = viewMonth === 11 ? 0 : viewMonth + 1;
      const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
      const dateStr = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: false,
        isDisabled: minDate ? dateStr < minDate : false,
      });
    }

    return days;
  }, [viewYear, viewMonth, minDate]);

  const todayStr = getTodayDateString();

  const displayLabel = useMemo(() => {
    if (!value) return 'Pilih Tanggal';
    const parts = value.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return value;
  }, [value]);

  return (
    <div className="fgroup" ref={dropdownRef} style={{ position: 'relative' }}>
      <label>{label}</label>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 14px',
          borderRadius: 6,
          border: open ? '1.5px solid #b59876' : '1px solid #D5D0C7',
          background: '#FFFFFF',
          color: value ? '#181D24' : '#6B7280',
          fontSize: 14,
          fontFamily: 'inherit',
          cursor: 'pointer',
          textAlign: 'left',
          outline: 'none',
          boxShadow: open ? '0 0 0 3px rgba(181, 152, 118, 0.15)' : 'none',
          transition: 'all 0.15s ease',
        }}
        aria-label="Pilih tanggal peminjaman"
        aria-expanded={open}
      >
        <span style={{ fontWeight: 400 }}>
          {displayLabel}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#b59876"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flexShrink: 0 }}
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            zIndex: 9999,
            background: '#FFFFFF',
            border: '1px solid #D5D0C7',
            borderRadius: 8,
            boxShadow: '0 12px 32px rgba(24, 29, 36, 0.18)',
            padding: 14,
            width: 290,
            userSelect: 'none',
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
              paddingBottom: 8,
              borderBottom: '1px solid #E5E0D8',
            }}
          >
            <button
              type="button"
              onClick={handlePrevMonth}
              style={{
                background: 'none',
                border: '1px solid #E5E0D8',
                borderRadius: 4,
                width: 28,
                height: 28,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4B5563',
              }}
              title="Bulan Sebelumnya"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <span style={{ fontSize: 13.5, fontWeight: 700, color: '#181D24' }}>
              {MONTH_NAMES_ID[viewMonth]} {viewYear}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              style={{
                background: 'none',
                border: '1px solid #E5E0D8',
                borderRadius: 4,
                width: 28,
                height: 28,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4B5563',
              }}
              title="Bulan Selanjutnya"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              textAlign: 'center',
              marginBottom: 6,
              fontSize: 11.5,
              fontWeight: 700,
              color: '#6B7280',
            }}
          >
            {WEEKDAY_NAMES_ID.map((w, idx) => (
              <span key={w} style={{ color: idx === 0 ? '#DC2626' : undefined }}>
                {w}
              </span>
            ))}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: 2,
            }}
          >
            {calendarDays.map((d) => {
              const isSelected = d.dateStr === value;
              const isToday = d.dateStr === todayStr;

              return (
                <button
                  key={d.dateStr}
                  type="button"
                  disabled={d.isDisabled}
                  onClick={() => {
                    if (d.isDisabled) {
                      onInvalidDate?.(d.dateStr);
                      return;
                    }
                    onChange(d.dateStr);
                    setOpen(false);
                  }}
                  style={{
                    background: isSelected ? '#15171A' : isToday ? '#FAF8F5' : 'transparent',
                    color: isSelected
                      ? '#b59876'
                      : d.isDisabled
                      ? '#D1D5DB'
                      : d.isCurrentMonth
                      ? '#181D24'
                      : '#9CA3AF',
                    border: isToday && !isSelected ? '1px solid #b59876' : '1px solid transparent',
                    borderRadius: 4,
                    height: 32,
                    fontSize: 12.5,
                    fontWeight: isSelected || isToday ? 700 : 500,
                    cursor: d.isDisabled ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.1s ease',
                    opacity: d.isDisabled ? 0.45 : 1,
                  }}
                  title={d.isDisabled ? `${d.dateStr} (Pemesanan minimal H-2)` : d.dateStr}
                >
                  {d.dayNum}
                </button>
              );
            })}
          </div>

          <div
            style={{
              marginTop: 10,
              paddingTop: 8,
              borderTop: '1px solid #E5E0D8',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 11.5, color: '#6B7280' }}>
              Min. {minDate ? `${minDate.split('-')[2]}/${minDate.split('-')[1]}/${minDate.split('-')[0]}` : 'H-2'}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#b59876',
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer',
                padding: '4px 6px',
              }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Custom dropdown that ALWAYS opens downwards with smooth scroll
function DownwardTimeSelect({
  label,
  value,
  placeholder,
  options,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  options: string[];
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="fgroup" ref={dropdownRef} style={{ position: 'relative' }}>
      <label>{label}</label>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 14px',
          borderRadius: 6,
          border: open ? '1.5px solid #b59876' : '1px solid #D5D0C7',
          background: '#FFFFFF',
          color: value ? '#181D24' : '#6B7280',
          fontSize: 14,
          fontFamily: 'inherit',
          cursor: 'pointer',
          textAlign: 'left',
          outline: 'none',
          boxShadow: open ? '0 0 0 3px rgba(181, 152, 118, 0.15)' : 'none',
          transition: 'all 0.15s ease',
        }}
      >
        <span style={{ fontWeight: value ? 600 : 400 }}>
          {value ? `${value} WIB` : placeholder}
        </span>
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s ease',
            color: '#6B7280',
            flexShrink: 0,
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            maxHeight: 220,
            overflowY: 'auto',
            background: '#FFFFFF',
            border: '1px solid #D5D0C7',
            borderRadius: 6,
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
            zIndex: 100,
          }}
        >
          <div
            onClick={() => {
              onChange('');
              setOpen(false);
            }}
            style={{
              padding: '9px 14px',
              fontSize: 13,
              color: '#9CA3AF',
              cursor: 'pointer',
              borderBottom: '1px solid #F3F0EB',
              background: !value ? '#FAF8F5' : '#FFFFFF',
            }}
          >
            {placeholder}
          </div>
          {options.map((t) => (
            <div
              key={t}
              onClick={() => {
                onChange(t);
                setOpen(false);
              }}
              style={{
                padding: '9px 14px',
                fontSize: 13,
                fontWeight: value === t ? 600 : 400,
                color: value === t ? '#b59876' : '#181D24',
                background: value === t ? '#FBF8F4' : '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'background 0.1s ease',
              }}
              onMouseEnter={(e) => {
                if (value !== t) e.currentTarget.style.background = '#F9F8F6';
              }}
              onMouseLeave={(e) => {
                if (value !== t) e.currentTarget.style.background = '#FFFFFF';
              }}
            >
              <span>{t} WIB</span>
              {value === t && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b59876" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 4 Periode waktu yang persis sama dengan halaman Jadwal Ketersediaan
const PERIODS = [
  { label: 'PAGI', from: '07:00', to: '10:00' },
  { label: 'SIANG', from: '10:00', to: '15:00' },
  { label: 'SORE', from: '15:00', to: '18:00' },
  { label: 'MALAM', from: '18:00', to: '20:00' },
];

interface SelectedToolItem {
  facilityId: string;
  refId: number;
  nama: string;
  jumlah: number;
  stokTersedia: number;
  lokasi: string;
}

function AjukanReservasiContent() {
  const searchParams = useSearchParams();
  const { facilities, isSlotTaken, fetchSlotAvailability, submitReservation, currentUser, reservations } = useAppData();
  // Fasilitas nonaktif tidak hanya dalam perbaikan: backend menolak peminjamannya,
  // jadi tidak masuk akal tetap bisa dipilih di dropdown.
  const availableFacilities = facilities.filter((f) => f.status !== 'repair' && f.status !== 'nonaktif');

  const preselect = searchParams.get('facility');
  const tipeParam = searchParams.get('tipe');

  // State untuk alat pendukung saat memesan ruangan
  const [selectedTools, setSelectedTools] = useState<SelectedToolItem[]>([]);
  const [toolToPickId, setToolToPickId] = useState<string>('');
  const [toolToPickQty, setToolToPickQty] = useState<number>(1);

  // Pool alat kampus yang siap dipinjam
  const availableTools = useMemo(() => {
    return availableFacilities.filter(isAlatFacility);
  }, [availableFacilities]);

  // Alat yang belum dipilih oleh pemohon
  const unselectedTools = useMemo(() => {
    const chosenIds = new Set(selectedTools.map((t) => t.facilityId));
    return availableTools.filter((t) => !chosenIds.has(t.id));
  }, [availableTools, selectedTools]);

  const handleAddTool = () => {
    if (!toolToPickId) return;
    const targetTool = availableTools.find((t) => t.id === toolToPickId);
    if (!targetTool || typeof targetTool.refId !== 'number') return;

    const totalStok = Math.max(1, targetTool.tersedia ?? targetTool.cap ?? 1);
    const maxStock = stokAlatAktual(targetTool.id, totalStok);
    if (maxStock <= 0) {
      setBannerNotice({
        type: 'error',
        title: 'Alat Tidak Tersedia',
        message: `${targetTool.name} tidak tersisa unit untuk jam ${startTime} - ${endTime} WIB pada ${formatDateIndo(tanggal)}.`,
      });
      return;
    }
    const qtyWanted = Math.min(Math.max(1, toolToPickQty || 1), maxStock);

    // Cek konflik slot alat berbasis sisa stok (quantity-aware):
    // tolak hanya jika sisa < diminta, bukan saat ada peminjaman apa pun.
    if (startTime && endTime && tanggal) {
      const conflict = hasRangeConflict(
        reservations,
        targetTool.id,
        tanggal,
        startTime,
        endTime,
        undefined,
        currentUserIdent,
        qtyWanted,
        maxStock
      );
      if (conflict) {
        const sisa = sisaStokAlatPadaRange(reservations, targetTool.id, tanggal, startTime, endTime, maxStock);
        setBannerNotice({
          type: 'error',
          title: 'Alat Tidak Tersedia',
          message: `${targetTool.name} stok tersisa ${Math.max(0, sisa)} unit untuk jam ${startTime} - ${endTime} WIB pada ${formatDateIndo(tanggal)} (minta ${qtyWanted}). Kurangi jumlah atau ubah jam peminjaman.`,
        });
        return;
      }
      // Cek dari publicUnavailable (data publik backend)
      const pubMap = publicUnavailable[targetTool.id];
      const hasPubConflict =
        pubMap &&
        SLOTS.some((s) => s.start >= startTime && s.start < endTime && pubMap.has(s.start));
      if (hasPubConflict) {
        setBannerNotice({
          type: 'error',
          title: 'Alat Tidak Tersedia',
          message: `${targetTool.name} sudah terpakai pada jam ${startTime} - ${endTime} WIB tanggal ${formatDateIndo(tanggal)}. Pilih alat lain atau ubah jam peminjaman.`,
        });
        return;
      }
    }

    setSelectedTools((prev) => [
      ...prev,
      {
        facilityId: targetTool.id,
        refId: targetTool.refId!,
        nama: targetTool.name,
        jumlah: qtyWanted,
        stokTersedia: maxStock,
        lokasi: targetTool.loc,
      },
    ]);

    setToolToPickId('');
    setToolToPickQty(1);
  };

  const handleRemoveTool = (fId: string) => {
    setSelectedTools((prev) => prev.filter((t) => t.facilityId !== fId));
  };

  const handleUpdateToolQty = (fId: string, delta: number) => {
    setSelectedTools((prev) =>
      prev.map((t) => {
        if (t.facilityId !== fId) return t;
        const maxNow = stokAlatAktual(t.facilityId, t.stokTersedia);
        const next = t.jumlah + delta;
        if (next < 1 || next > maxNow) return t;
        return { ...t, jumlah: next };
      })
    );
  };

  // Deteksi jenis tab awal (ruangan vs alat) dari URL param atau fasilitas preselect
  const preselectFacility = preselect ? facilities.find((f) => f.id === preselect) : null;
  const [activeTab, setActiveTab] = useState<'ruangan' | 'alat'>(() => {
    if (tipeParam === 'alat') return 'alat';
    if (tipeParam === 'ruangan') return 'ruangan';
    if (preselectFacility) return isAlatFacility(preselectFacility) ? 'alat' : 'ruangan';
    return 'ruangan';
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('semua');

  // Pool fasilitas yang sesuai tab aktif
  const activePool = useMemo(() => {
    return availableFacilities.filter((f) =>
      activeTab === 'alat' ? isAlatFacility(f) : isRuanganFacility(f)
    );
  }, [availableFacilities, activeTab]);

  // Kategori hanya menampilkan kategori yang relevan:
  // - Tab Ruangan: hanya kategori ruangan
  // - Tab Alat: hanya kategori alat
  const categoryOptions = useMemo(() => {
    if (activeTab === 'ruangan') {
      const fromData = Array.from(
        new Set(availableFacilities.filter(isRuanganFacility).map((f) => f.type))
      ).filter(Boolean);
      const combined = Array.from(new Set([...DEFAULT_ROOM_CATEGORIES, ...fromData]));
      return [
        { value: 'semua', label: 'Semua Kategori Ruangan' },
        ...combined.map((c) => ({ value: c, label: c })),
      ];
    } else {
      const fromData = Array.from(
        new Set(availableFacilities.filter(isAlatFacility).map((f) => f.type))
      ).filter(Boolean);
      return [
        { value: 'semua', label: 'Semua Kategori Alat' },
        ...fromData.map((c) => ({ value: c, label: c })),
      ];
    }
  }, [availableFacilities, activeTab]);

  // Fasilitas terfilter berdasarkan kategori pilihan
  const displayedFacilities = useMemo(() => {
    if (selectedCategory === 'semua') return activePool;
    return activePool.filter((f) => f.type === selectedCategory);
  }, [activePool, selectedCategory]);

  const [facilityId, setFacilityId] = useState(
    (preselect && activePool.some((f) => f.id === preselect) && preselect) ||
      displayedFacilities[0]?.id ||
      activePool[0]?.id ||
      ''
  );

  // Sinkronkan facilityId ketika daftar fasilitas selesai dimuat atau kategori berubah
  useEffect(() => {
    if (displayedFacilities.length > 0 && (!facilityId || !displayedFacilities.some((f) => f.id === facilityId))) {
      const target = (preselect && displayedFacilities.some((f) => f.id === preselect) && preselect) || displayedFacilities[0].id;
      setFacilityId(target);
    } else if (displayedFacilities.length === 0 && activePool.length > 0 && !activePool.some((f) => f.id === facilityId)) {
      setFacilityId(activePool[0].id);
    }
  }, [displayedFacilities, activePool, facilityId, preselect]);

  const earliestDate = useMemo(() => getEarliestReservableDate(), []);
  const [modalConfig, setModalConfig] = useState<ActionModalConfig>({
    isOpen: false,
    title: '',
    onConfirm: () => {},
  });
  const [bannerNotice, setBannerNotice] = useState<{
    type: 'success' | 'error';
    title: string;
    message: string;
  } | null>(null);

  // Auto-dismiss floating popup banner setelah 5 detik
  useEffect(() => {
    if (!bannerNotice) return;
    const timer = setTimeout(() => {
      setBannerNotice(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [bannerNotice]);

  const [tanggal, setTanggal] = useState(earliestDate);
  const [tujuan, setTujuan] = useState('');
  const [peserta, setPeserta] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Status ketersediaan slot aktual dari backend untuk seluruh pengguna,
  // dikunci per tanggal supaya data tanggal lama tidak dipakai untuk tanggal
  // baru sebelum fetch selesai.
  const [publicUnavailableByDate, setPublicUnavailableByDate] = useState<
    Record<string, Record<string, Set<string>>>
  >({});
  const publicUnavailable = publicUnavailableByDate[tanggal] ?? {};
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Jam Mulai dan Jam Selesai yang independen dan presisi
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');

  const facility =
    displayedFacilities.find((f) => f.id === facilityId) ||
    activePool.find((f) => f.id === facilityId) ||
    activePool[0] ||
    facilities[0];
  const isAlat = activeTab === 'alat' || isAlatFacility(facility);
  const currentUserIdent = currentUser?.nama || currentUser?.email || '';

  // Stok alat yang benar untuk rentang jam yang dipilih: banyak_alat dikurangi
  // unit yang sudah DISSETUJUI pada rentang itu. Tanpa rentang, tampil stok total.
  const rentangWaktuAktif = !!(tanggal && startTime && endTime);
  const stokAlatAktual = useCallback(
    (facilityId: string, total: number): number => {
      if (!rentangWaktuAktif) return total;
      return Math.max(0, sisaStokAlatPadaRange(reservations, facilityId, tanggal, startTime, endTime, total));
    },
    [rentangWaktuAktif, reservations, tanggal, startTime, endTime]
  );

  // Rentang jam berubah -> jumlah yang tertutup dipangkas ke maksimum yang
  // masih tersedia (contoh: 50 unit, 5 sudah disetujui -> otomatis jadi 45);
  // alat yang sisa stocknya habis pada rentang itu dibuang otomatis.
  useEffect(() => {
    if (!rentangWaktuAktif) return;
    setSelectedTools((prev) =>
      prev
        .filter((t) => stokAlatAktual(t.facilityId, t.stokTersedia) > 0)
        .map((t) => {
          const maxNow = stokAlatAktual(t.facilityId, t.stokTersedia);
          return t.jumlah > maxNow ? { ...t, jumlah: maxNow } : t;
        })
    );
  }, [rentangWaktuAktif, stokAlatAktual]);

  // Muat ketersediaan slot backend secara real-time setiap kali tanggal berubah
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!tanggal) return;
      setIsLoadingSlots(true);
      try {
        const map = await fetchSlotAvailability(tanggal);
        if (!cancelled) {
          setPublicUnavailableByDate((prev) => ({ ...prev, [tanggal]: map }));
        }
      } finally {
        if (!cancelled) setIsLoadingSlots(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tanggal, fetchSlotAvailability]);

  // Cek apakah slot spesifik sudah terpakai/disetujui untuk fasilitas & tanggal ini
  const isSlotOccupied = useCallback(
    (fId: string, sStart: string): boolean => {
      if (isSlotTaken(fId, sStart, undefined, tanggal, currentUserIdent)) return true;
      if (publicUnavailable[fId]?.has(sStart)) return true;
      if (facility?.refId && facility?.tipe && publicUnavailable[`${facility.tipe}-${facility.refId}`]?.has(sStart)) return true;
      if (facility?.refId && publicUnavailable[String(facility.refId)]?.has(sStart)) return true;
      return false;
    },
    [isSlotTaken, tanggal, currentUserIdent, publicUnavailable, facility]
  );

  // Daftar slot start yang berada dalam rentang [startTime, endTime)
  const pickedSlots = useMemo(() => {
    if (!startTime || !endTime || endTime <= startTime) return [];
    return SLOTS.filter((s) => s.start >= startTime && s.start < endTime).map((s) => s.start);
  }, [startTime, endTime]);

  // Cek bentrok terhadap slot yang dipilih untuk tanggal dan user spesifik.
  // Alat quantity-aware: konflik hanya jika minta N > sisa (bukan per-slot existence).
  const conflictSlots = useMemo(() => {
    if (!facility || pickedSlots.length === 0) return [];
    if (isAlat) {
      const stok = facility.tersedia ?? facility.cap ?? 0;
      const diminta = Math.max(1, parseInt(peserta, 10) || 1);
      const rangeConflict = startTime && endTime
        ? hasRangeConflict(reservations, facility.id, tanggal, startTime, endTime, undefined, currentUserIdent, diminta, stok)
        : undefined;
      const pubMap = publicUnavailable[facility.id];
      const pubConflict = pubMap && SLOTS.some((s) => s.start >= startTime && s.start < endTime && pubMap.has(s.start));
      if (rangeConflict || pubConflict) return pickedSlots;
      return [];
    }
    return pickedSlots.filter((slotStart) => isSlotOccupied(facility.id, slotStart));
  }, [facility, pickedSlots, isSlotOccupied, isAlat, peserta, reservations, tanggal, startTime, endTime, currentUserIdent, publicUnavailable]);

  const hasConflict = conflictSlots.length > 0;

  function handleTabSwitch(newTab: 'ruangan' | 'alat') {
    if (newTab === activeTab) return;
    setActiveTab(newTab);
    setSelectedCategory('semua');
    if (newTab === 'alat') {
      setSelectedTools([]);
      setToolToPickId('');
      setToolToPickQty(1);
    }
    const newPool = availableFacilities.filter((f) =>
      newTab === 'alat' ? isAlatFacility(f) : isRuanganFacility(f)
    );
    if (newPool.length > 0) {
      setFacilityId(newPool[0].id);
    } else {
      setFacilityId('');
    }
    setStartTime('');
    setEndTime('');
  }

  function handleFacilityChange(id: string) {
    setFacilityId(id);
    setStartTime('');
    setEndTime('');
  }

  function handleStartChange(newStart: string) {
    setStartTime(newStart);
    if (!newStart) {
      setEndTime('');
      return;
    }
    // Jika endTime sudah ada dan valid (> newStart), pertahankan.
    // Jika tidak, biarkan kosong agar pengguna bisa memilih jam selesai sendiri tanpa dipaksa.
    if (endTime && endTime <= newStart) {
      setEndTime('');
    }
  }

  function handleEndChange(newEnd: string) {
    setEndTime(newEnd);
    if (newEnd && (!startTime || startTime >= newEnd)) {
      const [h, m] = newEnd.split(':').map(Number);
      let prevH = h;
      let prevM = m - 30;
      if (prevM < 0) {
        prevH -= 1;
        prevM = 30;
      }
      const prevStart = `${String(Math.max(prevH, 7)).padStart(2, '0')}:${String(prevM).padStart(2, '0')}`;
      if (START_OPTIONS.includes(prevStart)) {
        setStartTime(prevStart);
      } else {
        setStartTime('07:00');
      }
    }
  }

  // Interaksi klik kartu slot yang cerdas & sinkron dengan periode
  function handleSlotClick(slot: TimeSlot) {
    if (!facility) return;
    const isTaken = isSlotOccupied(facility.id, slot.start);
    if (isTaken) return;

    // 1. Jika belum ada yang dipilih: pilih slot ini (30 menit)
    if (!startTime || !endTime) {
      setStartTime(slot.start);
      setEndTime(slot.end);
      return;
    }

    // 2. Jika klik slot tunggal yang sama persis: batalkan seleksi
    if (startTime === slot.start && endTime === slot.end) {
      setStartTime('');
      setEndTime('');
      return;
    }

    // 3. Jika klik slot yang lebih awal: mundurkan jam mulai
    if (slot.start < startTime) {
      setStartTime(slot.start);
      return;
    }

    // 4. Jika klik slot yang lebih akhir: majukan jam selesai hingga akhir slot ini
    if (slot.end > endTime) {
      setEndTime(slot.end);
      return;
    }

    // 5. Jika klik di dalam rentang yang ada: sesuaikan jam selesai ke slot ini
    setEndTime(slot.end);
  }

  // Tombol durasi cepat
  function applyPreset(durationHours: number) {
    let baseStart = startTime;
    if (!baseStart && facility) {
      const firstAvail = SLOTS.find((s) => !isSlotOccupied(facility.id, s.start));
      baseStart = firstAvail ? firstAvail.start : '07:00';
    } else if (!baseStart) {
      baseStart = '07:00';
    }
    setStartTime(baseStart);

    const [h, m] = baseStart.split(':').map(Number);
    const endHour = h + durationHours;
    const formattedEnd = `${String(Math.min(endHour, 20)).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    const validEnd = END_OPTIONS.includes(formattedEnd) ? formattedEnd : '20:00';
    setEndTime(validEnd);
  }

  function applyFullDay() {
    setStartTime('07:00');
    setEndTime('20:00');
  }

  const pesertaNum = parseInt(peserta, 10) || 0;
  // Alat: batasnya unit siap pakai (jumlah_tersedia); ruangan: kapasitas orang.
  // Alat mengikuti rentang jam terpilih, termasuk unit yang sudah disetujui.
  const unitTersedia = facility
    ? (isAlat ? stokAlatAktual(facility.id, facility.tersedia ?? facility.cap) : facility.cap)
    : 0;
  const overCapacity = !!facility && pesertaNum > unitTersedia;

  async function doSubmit() {
    if (!facility || isSubmitting) return;

    // Fasilitas utama alat: cek quantity-aware (minta N vs sisa).
    // Ruangan: cek existence seperti sebelumnya via isSlotOccupied.
    if (isAlat) {
      const stokUtama = unitTersedia || 0;
      const dimintaUtama = Math.max(1, pesertaNum || 1);
      const conflictUtama = hasRangeConflict(
        reservations, facility.id, tanggal, startTime, endTime,
        undefined, currentUserIdent, dimintaUtama, stokUtama
      );
      const pubMapUtama = publicUnavailable[facility.id];
      const pubConflictUtama = pubMapUtama && SLOTS.some((s) => s.start >= startTime && s.start < endTime && pubMapUtama.has(s.start));
      if (conflictUtama || pubConflictUtama) {
        const sisa = sisaStokAlatPadaRange(reservations, facility.id, tanggal, startTime, endTime, stokUtama);
        setBannerNotice({
          type: 'error',
          title: 'Stok Alat Tidak Cukup',
          message: `${facility.name} stok tersisa ${Math.max(0, sisa)} unit untuk jam ${startTime} - ${endTime} WIB (minta ${dimintaUtama}). Kurangi jumlah atau ubah jam.`,
        });
        setModalConfig({
          isOpen: true,
          title: 'Stok Alat Tidak Cukup',
          subtitle: `${facility.name} stok tersisa ${Math.max(0, sisa)} unit pada jam ${startTime} - ${endTime} WIB tanggal ${formatDateIndo(tanggal)}. Kurangi jumlah atau ubah jadwal.`,
          confirmText: 'Pilih Jam Lain',
          confirmVariant: 'danger',
          showInput: false,
          onConfirm: () => {},
        });
        return;
      }
    } else {
      const isConflictNow = pickedSlots.some((slotStart) => isSlotOccupied(facility.id, slotStart));
      if (isConflictNow) {
        setBannerNotice({
          type: 'error',
          title: 'Rentang Jadwal Bentrok',
          message: `Rentang jam yang dipilih (${startTime} - ${endTime} WIB) pada tanggal ${formatDateIndo(tanggal)} sudah terpakai atau disetujui untuk peminjaman lain. Silakan pilih slot yang tersedia.`,
        });
        setModalConfig({
          isOpen: true,
          title: 'Rentang Jadwal Bentrok',
          subtitle: `Rentang jam yang dipilih (${startTime} - ${endTime} WIB) pada tanggal ${formatDateIndo(tanggal)} bentrok dengan jadwal reservasi lain yang sudah terpakai atau disetujui. Silakan pilih rentang yang berstatus tersedia.`,
          confirmText: 'Pilih Jam Lain',
          confirmVariant: 'danger',
          showInput: false,
          onConfirm: () => {},
        });
        return;
      }
    }

    // Cek bentrok pada alat pendukung yang dipilih (quantity-aware)
    if (activeTab === 'ruangan' && selectedTools.length > 0) {
      for (const tool of selectedTools) {
        const toolConflict = hasRangeConflict(
          reservations,
          tool.facilityId,
          tanggal,
          startTime,
          endTime,
          undefined,
          currentUserIdent,
          tool.jumlah,
          tool.stokTersedia
        );
        const pubMap = publicUnavailable[tool.facilityId];
        const pubConflict = pubMap && SLOTS.some((s) => s.start >= startTime && s.start < endTime && pubMap.has(s.start));
        if (toolConflict || pubConflict) {
          const sisa = sisaStokAlatPadaRange(reservations, tool.facilityId, tanggal, startTime, endTime, tool.stokTersedia);
          setBannerNotice({
            type: 'error',
            title: 'Alat Pendukung Bentrok',
            message: `Alat "${tool.nama}" stok tersisa ${Math.max(0, sisa)} unit pada jam ${startTime} - ${endTime} WIB (minta ${tool.jumlah}). Kurangi jumlah atau ganti alat.`,
          });
          setModalConfig({
            isOpen: true,
            title: 'Alat Pendukung Bentrok',
            subtitle: `Alat "${tool.nama}" stok tersisa ${Math.max(0, sisa)} unit pada jam ${startTime} - ${endTime} WIB tanggal ${formatDateIndo(tanggal)} (minta ${tool.jumlah}). Hapus alat atau ubah jadwal.`,
            confirmText: 'Sesuaikan Jadwal/Alat',
            confirmVariant: 'danger',
            showInput: false,
            onConfirm: () => {},
          });
          return;
        }
      }
    }

    const toolPayload =
      activeTab === 'ruangan' && selectedTools.length > 0
        ? selectedTools.map((t) => ({
            id: t.refId,
            nama: t.nama,
            jumlah: t.jumlah,
          }))
        : undefined;

    setIsSubmitting(true);
    let result: { ok: boolean; message?: string };
    try {
      result = await submitReservation({
        facilityId: facility.id,
        tanggal,
        start: startTime,
        end: endTime,
        tujuan: tujuan.trim(),
        peserta: pesertaNum || undefined,
        alat: toolPayload,
      });
    } finally {
      setIsSubmitting(false);
    }

    if (!result.ok) {
      setBannerNotice({
        type: 'error',
        title: 'Pengajuan Reservasi Gagal',
        message: result.message || 'Reservasi tidak dapat diproses karena jadwal bentrok atau kendala server. Silakan coba lagi.',
      });
      setModalConfig({
        isOpen: true,
        title: 'Pengajuan Reservasi Gagal',
        subtitle: result.message || 'Reservasi tidak dapat diproses karena jadwal bentrok atau kendala server. Silakan coba lagi.',
        confirmText: 'Mengerti',
        confirmVariant: 'danger',
        showInput: false,
        onConfirm: () => {},
      });
      return;
    }

    const bookedFacilityName = facility.name;
    const bookedTime = `${formatDateIndo(tanggal)}, ${startTime} - ${endTime} WIB`;
    const toolSummaryText =
      activeTab === 'ruangan' && selectedTools.length > 0
        ? ` beserta alat pendukung: ${selectedTools.map((t) => `${t.nama} (${t.jumlah} unit)`).join(', ')}`
        : '';

    setStartTime('');
    setEndTime('');
    setTujuan('');
    setPeserta('');
    setSelectedTools([]);
    setToolToPickId('');
    setToolToPickQty(1);

    void fetchSlotAvailability(tanggal).then((map) => {
      setPublicUnavailableByDate((prev) => ({ ...prev, [tanggal]: map }));
    });

    setBannerNotice({
      type: 'success',
      title: 'Permohonan Reservasi Berhasil Terkirim',
      message: `Reservasi berhasil diajukan untuk ${bookedFacilityName}${toolSummaryText} (${bookedTime}). Permohonan Anda telah masuk ke antrean persetujuan petugas sarpras.`,
    });

    setModalConfig({
      isOpen: true,
      title: 'Permohonan Berhasil Diajukan',
      subtitle: `Reservasi berhasil diajukan untuk ${bookedFacilityName}${toolSummaryText} (${bookedTime}). Permohonan Anda telah masuk ke antrean persetujuan petugas sarpras.`,
      confirmText: 'Selesai',
      confirmVariant: 'success',
      showInput: false,
      onConfirm: () => {},
    });
  }

  function handleSubmit() {
    if (!facility) return;
    if (!isReservationDeadlineValid(tanggal)) {
      setBannerNotice({
        type: 'error',
        title: 'Tanggal Terlalu Dekat',
        message: `Pengajuan reservasi paling lambat H-2, yaitu minimal dua hari sebelum tanggal kegiatan (contoh: hari ini tanggal 25, reservasi paling awal untuk tanggal 27). Tanggal ${formatDateIndo(tanggal)} belum dapat dipesan. Silakan pilih mulai dari tanggal ${formatDateIndo(earliestDate)}.`,
      });
      setModalConfig({
        isOpen: true,
        title: 'Tanggal Terlalu Dekat',
        subtitle: `Pengajuan reservasi paling lambat H-2, yaitu minimal dua hari sebelum tanggal kegiatan. Silakan pilih tanggal mulai dari ${formatDateIndo(earliestDate)}.`,
        confirmText: 'Pilih Tanggal Lain',
        confirmVariant: 'danger',
        showInput: false,
        onConfirm: () => {},
      });
      return;
    }
    if (!startTime || !endTime || pickedSlots.length === 0) {
      setModalConfig({
        isOpen: true,
        title: 'Pilih Rentang Waktu',
        subtitle: 'Silakan pilih jam mulai dan jam selesai peminjaman fasilitas (minimal 1 slot 30 menit).',
        confirmText: 'Mengerti',
        confirmVariant: 'warning',
        showInput: false,
        onConfirm: () => {},
      });
      return;
    }
    if (hasConflict) {
      setBannerNotice({
        type: 'error',
        title: 'Rentang Jadwal Bentrok',
        message: `Rentang jam yang dipilih (${startTime} - ${endTime} WIB) pada tanggal ${formatDateIndo(tanggal)} bentrok dengan jadwal reservasi yang sudah terpakai atau disetujui. Silakan pilih rentang jam yang berstatus hijau (Tersedia).`,
      });
      setModalConfig({
        isOpen: true,
        title: 'Rentang Jadwal Bentrok',
        subtitle: `Rentang jam yang dipilih (${startTime} - ${endTime} WIB) pada tanggal ${formatDateIndo(tanggal)} bentrok dengan jadwal reservasi lain yang sudah terpakai atau disetujui. Silakan pilih rentang yang berstatus tersedia.`,
        confirmText: 'Pilih Jam Lain',
        confirmVariant: 'danger',
        showInput: false,
        onConfirm: () => {},
      });
      return;
    }
    if (!tujuan.trim()) {
      setModalConfig({
        isOpen: true,
        title: 'Tujuan Penggunaan Belum Diisi',
        subtitle: 'Silakan isi tujuan penggunaan fasilitas untuk keperluan evaluasi petugas sarpras.',
        confirmText: 'Lengkapi Data',
        confirmVariant: 'warning',
        showInput: false,
        onConfirm: () => {},
      });
      return;
    }
    if (activeTab === 'ruangan' && selectedTools.some((t) => {
      const maxNow = stokAlatAktual(t.facilityId, t.stokTersedia);
      if (maxNow <= 0) return true;
      return t.jumlah > maxNow;
    })) {
      setModalConfig({
        isOpen: true,
        title: 'Jumlah Alat Melebihi Stok',
        subtitle: 'Salah satu alat pendukung melebihi stok yang tersedia. Silakan sesuaikan jumlah alat.',
        confirmText: 'Sesuaikan Data',
        confirmVariant: 'warning',
        showInput: false,
        onConfirm: () => {},
      });
      return;
    }
    if (overCapacity) {
      // Blok keras: backend menolak jumlah melebihi stok/kapasitas dengan 400,
      // jadi frontend tidak menawarkan tombol tetap mengajukan yang mustahil lolos.
      setModalConfig({
        isOpen: true,
        title: isAlat ? 'Jumlah Alat Melebihi Stok' : 'Kapasitas Melebihi Standar',
        subtitle: isAlat
          ? `Permintaan ${pesertaNum} unit melebihi stok yang tersedia (${unitTersedia} unit). Sesuaikan jumlah sebelum mengajukan.`
          : `Estimasi peserta ${pesertaNum} orang melebihi kapasitas standar ruangan (${unitTersedia} orang). Sesuaikan jumlah sebelum mengajukan.`,
        confirmText: 'Sesuaikan Data',
        confirmVariant: 'warning',
        showInput: false,
        onConfirm: () => {},
      });
      return;
    }

    void doSubmit();
  }

  return (
    <div>
      <div className="ochoco-page-header">
        <div className="ochoco-page-eyebrow">FORMULIR PERMOHONAN • UNIVERSITAS DIPONEGORO</div>
        <h2>AJUKAN RESERVASI FASILITAS</h2>
        <p>
          Isi formulir untuk permohonan peminjaman fasilitas Universitas Diponegoro. Verifikasi dilakukan oleh petugas sarpras.
        </p>
      </div>

      <div className="alert info">
        Jam operasional kampus: <b>07.00 - 20.00 WIB</b> · Durasi kelipatan <b>30 menit</b> · Batas pengajuan: <b>paling lambat H-2</b> (contoh: hari ini tgl 25, reservasi paling awal untuk tgl 27).
      </div>

      {/* Prominent Feedback Banner */}
      {bannerNotice && (
        <div className={`status-banner ${bannerNotice.type}`}>
          <div>
            <div className="status-banner-badge">
              {bannerNotice.type === 'success' ? '✓ SUCCESS • BERHASIL' : '✕ FAILED • GAGAL'}
            </div>
            <div className="status-banner-title">{bannerNotice.title}</div>
            <div className="status-banner-desc">{bannerNotice.message}</div>
          </div>
          <button
            type="button"
            className="status-banner-close"
            onClick={() => setBannerNotice(null)}
          >
            ✕ Tutup
          </button>
        </div>
      )}

      {/* Sub-tab: Pembagian Reservasi Ruangan vs Reservasi Alat */}
      <div
        role="tablist"
        aria-label="Pilihan Jenis Reservasi"
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 16,
          borderBottom: '2px solid #E5E0D8',
          paddingBottom: 2,
        }}
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'ruangan'}
          onClick={() => handleTabSwitch('ruangan')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
            borderRadius: '6px 6px 0 0',
            fontSize: 14.5,
            fontWeight: 700,
            cursor: 'pointer',
            border: activeTab === 'ruangan' ? '1px solid #b59876' : '1px solid transparent',
            borderBottom: activeTab === 'ruangan' ? '3px solid #b59876' : '3px solid transparent',
            background: activeTab === 'ruangan' ? '#15171a' : '#FFFFFF',
            color: activeTab === 'ruangan' ? '#b59876' : '#6B7280',
            marginBottom: -2,
            transition: 'all 0.15s ease',
          }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 21V9" />
          </svg>
          <span>Reservasi Ruangan</span>
          <span
            style={{
              fontSize: 12,
              padding: '2px 8px',
              borderRadius: 10,
              background: activeTab === 'ruangan' ? '#2A2E35' : '#F3F0EB',
              color: activeTab === 'ruangan' ? '#D5C4A1' : '#6B7280',
            }}
          >
            {availableFacilities.filter(isRuanganFacility).length}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'alat'}
          onClick={() => handleTabSwitch('alat')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
            borderRadius: '6px 6px 0 0',
            fontSize: 14.5,
            fontWeight: 700,
            cursor: 'pointer',
            border: activeTab === 'alat' ? '1px solid #b59876' : '1px solid transparent',
            borderBottom: activeTab === 'alat' ? '3px solid #b59876' : '3px solid transparent',
            background: activeTab === 'alat' ? '#15171a' : '#FFFFFF',
            color: activeTab === 'alat' ? '#b59876' : '#6B7280',
            marginBottom: -2,
            transition: 'all 0.15s ease',
          }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
          <span>Reservasi Alat</span>
          <span
            style={{
              fontSize: 12,
              padding: '2px 8px',
              borderRadius: 10,
              background: activeTab === 'alat' ? '#2A2E35' : '#F3F0EB',
              color: activeTab === 'alat' ? '#D5C4A1' : '#6B7280',
            }}
          >
            {availableFacilities.filter(isAlatFacility).length}
          </span>
        </button>
      </div>

      <div className="panel">
        <div className="form-grid">
          {/* Category Filter */}
          <div className="fgroup">
            <label>{activeTab === 'ruangan' ? 'Kategori Fasilitas Ruangan' : 'Kategori Peralatan / Alat'}</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setStartTime('');
                setEndTime('');
              }}
            >
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Facility Selection */}
          <div className="fgroup">
            <label>{activeTab === 'ruangan' ? 'Pilihan Ruangan Kampus' : 'Pilihan Peralatan / Alat'}</label>
            <select value={facilityId || facility?.id || ''} onChange={(e) => handleFacilityChange(e.target.value)}>
              {displayedFacilities.length === 0 ? (
                <option value="">Tidak ada fasilitas untuk kategori ini</option>
              ) : (
                displayedFacilities.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({isAlatFacility(f) ? `tersedia ${stokAlatAktual(f.id, f.tersedia ?? f.cap)} unit` : `maks. ${f.cap} orang`})
                  </option>
                ))
              )}
            </select>
            {facility && (
              <div style={{ marginTop: 6, fontSize: 13, color: '#4B5563' }}>
                <span style={{ color: '#6B7280', fontWeight: 600, marginRight: 5 }}>Lokasi:</span>
                {facility.loc || 'Belum tersedia'}
              </div>
            )}
          </div>

          {/* Date Selection (Always opens downward with full calendar size) */}
          <DownwardDatePicker
            label="Tanggal Peminjaman"
            value={tanggal}
            minDate={earliestDate}
            onChange={(val) => {
              setTanggal(val);
              setStartTime('');
              setEndTime('');
            }}
            onInvalidDate={(val) => {
              setBannerNotice({
                type: 'error',
                title: 'Tanggal Terlalu Dekat',
                message: `Pengajuan reservasi paling lambat H-2. Tanggal ${formatDateIndo(val)} belum memenuhi syarat. Tanggal paling awal yang tersedia adalah ${formatDateIndo(earliestDate)}.`,
              });
            }}
          />

          {/* Start Time Dropdown (Always opens downward) */}
          <DownwardTimeSelect
            label="Jam Mulai"
            value={startTime}
            placeholder="Pilih Jam Mulai"
            options={START_OPTIONS}
            onChange={handleStartChange}
          />

          {/* End Time Dropdown (Always opens downward) */}
          <DownwardTimeSelect
            label="Jam Selesai (Hingga 20:00 WIB)"
            value={endTime}
            placeholder="Pilih Jam Selesai"
            options={END_OPTIONS}
            onChange={handleEndChange}
          />

          {/* Slot Grid Section Grouped by Period (PAGI, SIANG, SORE, MALAM) */}
          <div className="fgroup full" style={{ marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
              <div>
                <label style={{ margin: 0, fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#181D24' }}>
                  PILIH SLOT WAKTU (07.00 - 20.00 WIB)
                </label>
                {isLoadingSlots && (
                  <span style={{ fontSize: 13, color: '#b59876', fontWeight: 600, marginLeft: 8 }}>
                    (Memperbarui ketersediaan...)
                  </span>
                )}
                <div style={{ fontSize: 14, color: '#6B7280', marginTop: 2 }}>
                  Klik slot untuk memilih waktu mulai dan waktu selesai secara berurutan.
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => applyPreset(1)}
                  style={{ fontSize: 13, padding: '6px 13px', borderRadius: 4, border: '1px solid #D5D0C7', background: '#FAF8F5', cursor: 'pointer', fontWeight: 600 }}
                >
                  +1 Jam
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(2)}
                  style={{ fontSize: 13, padding: '6px 13px', borderRadius: 4, border: '1px solid #D5D0C7', background: '#FAF8F5', cursor: 'pointer', fontWeight: 600 }}
                >
                  +2 Jam
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(4)}
                  style={{ fontSize: 13, padding: '6px 13px', borderRadius: 4, border: '1px solid #D5D0C7', background: '#FAF8F5', cursor: 'pointer', fontWeight: 600 }}
                >
                  +4 Jam
                </button>
                <button
                  type="button"
                  onClick={applyFullDay}
                  style={{ fontSize: 13, padding: '6px 13px', borderRadius: 4, border: '1px solid #b59876', background: '#15171a', color: '#b59876', cursor: 'pointer', fontWeight: 700 }}
                >
                  Seharian (07:00 - 20:00)
                </button>
                {(startTime || endTime) && (
                  <button
                    type="button"
                    onClick={() => { setStartTime(''); setEndTime(''); }}
                    style={{ fontSize: 13, padding: '6px 13px', borderRadius: 4, border: '1px solid #FECACA', background: '#FEF2F2', color: '#DC2626', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Reset Jam
                  </button>
                )}
              </div>
            </div>

            {/* Render 4 Period Sections: PAGI, SIANG, SORE, MALAM */}
            {facility &&
              PERIODS.map((period) => {
                const periodSlots = SLOTS.filter((s) => s.start >= period.from && s.start < period.to);
                if (periodSlots.length === 0) return null;

                return (
                  <div key={period.label} className="sched-period" style={{ marginBottom: 20 }}>
                    <div className="sched-period-head">{period.label}</div>
                    <div className="slot-grid-lg">
                      {periodSlots.map((slot) => {
                        const stokSlot = isAlatFacility(facility) ? (facility.tersedia ?? facility.cap) : undefined;
                        const booking = getSlotBooking(
                          reservations,
                          facility.id,
                          slot.start,
                          undefined,
                          tanggal,
                          currentUserIdent,
                          undefined,
                          stokSlot
                        );
                        const isTaken = isSlotOccupied(facility.id, slot.start) || booking === 'booked';
                        const isPending = booking === 'pending';
                        const isPicked = pickedSlots.includes(slot.start);

                        let stateClass = 'avail';
                        let statusText = 'Tersedia';

                        if (isPending) {
                          stateClass = 'pending';
                          statusText = 'Menunggu Persetujuan';
                        } else if (isTaken) {
                          stateClass = 'booked';
                          statusText = 'Terpakai';
                        } else if (isPicked) {
                          stateClass = 'picked';
                          statusText = 'Terpilih';
                        }

                        return (
                          <button
                            key={slot.start}
                            type="button"
                            className={`slot-lg ${stateClass}`}
                            disabled={isTaken || isPending}
                            onClick={() => handleSlotClick(slot)}
                            title={
                              isPending
                                ? 'Anda masih menunggu persetujuan pada slot ini'
                                : isTaken
                                  ? 'Slot sudah dikunci (sudah terpakai atau disetujui untuk peminjaman lain)'
                                  : `${slot.start} - ${slot.end} WIB (Klik untuk memilih)`
                            }
                          >
                            <span className="slot-bar" />
                            <div className="slot-lg-body">
                              <div className="t">{slot.start} - {slot.end}</div>
                              <div className="s">{statusText}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

            {/* Live Feedback Banner */}
            {startTime && endTime && (
              <div
                style={{
                  marginTop: 18,
                  padding: '16px 20px',
                  borderRadius: 6,
                  border: hasConflict ? '2px solid #EF4444' : '2px solid #22C55E',
                  background: hasConflict ? '#FEF2F2' : '#F0FDF4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ marginBottom: 4 }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '3px 10px',
                        borderRadius: 4,
                        fontSize: 14,
                        fontWeight: 800,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        background: hasConflict ? '#FEE2E2' : '#DCFCE7',
                        color: hasConflict ? '#B91C1C' : '#15803D',
                        border: hasConflict ? '1px solid #FCA5A5' : '1px solid #86EFAC',
                      }}
                    >
                      {hasConflict ? '✕ FAILED • JADWAL BENTROK' : '✓ SUCCESS • KETERSEDIAAN AMAN'}
                    </span>
                  </div>
                  <div style={{ fontSize: 16, color: '#1F2937' }}>
                    Jadwal Terpilih:{' '}
                    <strong style={{ fontSize: 17, color: hasConflict ? '#DC2626' : '#15803D' }}>
                      {startTime} - {endTime} WIB
                    </strong>{' '}
                    ({pickedSlots.length} slot · {(pickedSlots.length * 0.5).toFixed(1)} jam peminjaman)
                  </div>
                  {hasConflict ? (
                    <div style={{ color: '#B91C1C', fontSize: 14, fontWeight: 600, marginTop: 4 }}>
                      Rentang waktu ini bertabrakan dengan jadwal yang sudah disetujui / direservasi pada tanggal {formatDateIndo(tanggal)}. Silakan pilih slot yang tersedia.
                    </div>
                  ) : (
                    <div style={{ color: '#166534', fontSize: 14, marginTop: 4 }}>
                      Semua slot pada rentang ini berstatus tersedia dan siap diajukan untuk tanggal {formatDateIndo(tanggal)}.
                    </div>
                  )}
                </div>
                <div>
                  {hasConflict ? (
                    <span style={{ color: '#FFFFFF', fontSize: 13, fontWeight: 700, background: '#DC2626', padding: '8px 14px', borderRadius: 4 }}>
                      Tidak Dapat Dipinjam
                    </span>
                  ) : (
                    <span style={{ color: '#FFFFFF', fontSize: 13, fontWeight: 700, background: '#16A34A', padding: '8px 14px', borderRadius: 4 }}>
                      ✓ Siap Diajukan
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Purpose of reservation */}
          <div className="fgroup full">
            <label>Tujuan Penggunaan</label>
            <textarea
              value={tujuan}
              onChange={(e) => setTujuan(e.target.value)}
              placeholder="Contoh: Kuliah umum tamu asing, seminar himpunan mahasiswa, latihan paduan suara, rapat koordinasi..."
            />
          </div>

          {/* Number of participants / units */}
          <div className="fgroup">
            <label>
              {isAlat ? 'Jumlah Unit Alat Dipinjam' : 'Estimasi Jumlah Peserta'}{' '}
              <span className="opt">(opsional)</span>
            </label>
            <input
              type="number"
              min={1}
              value={peserta}
              onChange={(e) => setPeserta(e.target.value)}
              placeholder={
                isAlat
                  ? 'Jumlah unit yang dipinjam (contoh: 2)'
                  : 'Perkiraan jumlah orang yang hadir (contoh: 30)'
              }
            />
            {overCapacity && (
              <span className="field-hint" style={{ color: '#DC2626', fontWeight: 600 }}>
                {isAlat
                  ? `Jumlah unit (${pesertaNum} unit) melebihi stok yang tersedia (${unitTersedia} unit).`
                  : `Jumlah peserta (${pesertaNum} org) melebihi kapasitas standar ruangan (${facility?.cap} org).`}
              </span>
            )}
          </div>

          {/* Menu Peralatan Pendukung Ruangan (Khusus Tab Reservasi Ruangan) */}
          {activeTab === 'ruangan' && (
            <div
              className="fgroup full"
              style={{
                marginTop: 6,
                padding: '20px 22px',
                background: '#FAF8F5',
                border: '1px solid #E5E0D8',
                borderRadius: 8,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 10,
                  marginBottom: 14,
                }}
              >
                <div>
                  <label
                    style={{
                      margin: 0,
                      fontSize: 15,
                      fontWeight: 700,
                      color: '#181D24',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: '#b59876' }}
                    >
                      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                    </svg>
                    Peralatan Pendukung Ruangan{' '}
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#726C64' }}>
                      (Opsional)
                    </span>
                  </label>
                  <p style={{ margin: '4px 0 0 0', fontSize: 13.5, color: '#6B7280' }}>
                    Sewa peralatan kampus sekaligus bersama ruangan ini (misal proyektor, mic wireless, sound system).
                  </p>
                </div>
                {selectedTools.length > 0 && (
                  <span
                    style={{
                      fontSize: 12.5,
                      fontWeight: 700,
                      background: '#15171a',
                      color: '#b59876',
                      border: '1px solid #b59876',
                      padding: '4px 12px',
                      borderRadius: 12,
                    }}
                  >
                    {selectedTools.length} alat ditambahkan
                  </span>
                )}
              </div>

              {/* Toolbar Pilihan & Jumlah Alat */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 12,
                  alignItems: 'center',
                  background: '#FFFFFF',
                  padding: '14px 16px',
                  borderRadius: 6,
                  border: '1px solid #D5D0C7',
                  marginBottom: 14,
                }}
              >
                <div style={{ flex: '1 1 260px', minWidth: 220 }}>
                  <select
                    value={toolToPickId}
                    onChange={(e) => {
                      const nextId = e.target.value;
                      setToolToPickId(nextId);
                      setToolToPickQty(1);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontSize: 14.5,
                      border: '1px solid #D5D0C7',
                      borderRadius: 4,
                    }}
                    aria-label="Pilih Alat Pendukung"
                  >
                    <option value="">-- Pilih Alat Pendukung Kampus --</option>
                    {unselectedTools.map((t) => {
                      const stock = t.tersedia ?? t.cap ?? 0;
                      const isTimeSet = !!(startTime && endTime && tanggal);
                      // Quantity-aware: hitung sisa untuk 1 unit (preview).
                      // Opsi hanya disabled jika sisa habis, bukan saat ada peminjaman.
                      const sisaPreview = stokAlatAktual(t.id, stock);
                      const isConflict = isTimeSet && sisaPreview <= 0;
                      const pubMap = publicUnavailable[t.id];
                      const hasPubConflict = isTimeSet && !!pubMap &&
                        SLOTS.some((s) => s.start >= startTime && s.start < endTime && pubMap.has(s.start));
                      const unavailable = stock <= 0 || isConflict || hasPubConflict;
                      const suffix = hasPubConflict || sisaPreview <= 0
                        ? (isTimeSet ? ` - Terpakai (sisa 0 dari ${stock})` : ' - Stok habis')
                        : isTimeSet
                          ? ` - Sisa: ${sisaPreview} dari ${stock} unit`
                          : ` - Stok: ${stock} unit`;
                      return (
                        <option key={t.id} value={t.id} disabled={unavailable}>
                          {t.name}{suffix}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <label
                    htmlFor="tool-qty-input"
                    style={{ fontSize: 13.5, color: '#374151', margin: 0, fontWeight: 600 }}
                  >
                    Jumlah:
                  </label>
                  <input
                    id="tool-qty-input"
                    type="number"
                    min={1}
                    max={
                      toolToPickId
                        ? availableTools.find((t) => t.id === toolToPickId)?.tersedia ??
                          availableTools.find((t) => t.id === toolToPickId)?.cap ?? 1
                        : 1
                    }
                    value={toolToPickQty}
                    onChange={(e) => setToolToPickQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    disabled={!toolToPickId}
                    style={{
                      width: 75,
                      padding: '9px 8px',
                      textAlign: 'center',
                      fontSize: 14.5,
                      fontWeight: 600,
                      border: '1px solid #D5D0C7',
                      borderRadius: 4,
                    }}
                    aria-label="Jumlah unit alat"
                  />
                  <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 500 }}>unit</span>
                </div>

                <button
                  type="button"
                  onClick={handleAddTool}
                  disabled={!toolToPickId}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '10px 18px',
                    background: toolToPickId ? '#15171a' : '#E5E7EB',
                    color: toolToPickId ? '#b59876' : '#9CA3AF',
                    border: '1px solid transparent',
                    borderRadius: 4,
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: toolToPickId ? 'pointer' : 'not-allowed',
                    minHeight: 44,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ fontSize: 16 }}>+</span> Tambah Alat
                </button>
              </div>

              {/* Daftar Alat Pendukung Terpilih */}
              {selectedTools.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {selectedTools.map((tool) => {
                    const maxSekarang = stokAlatAktual(tool.facilityId, tool.stokTersedia);
                    return (
                    <div
                      key={tool.facilityId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 12,
                        background: '#FFFFFF',
                        border: '1px solid #E5E0D8',
                        borderRadius: 6,
                        padding: '12px 18px',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: '#181D24' }}>
                          {tool.nama}
                        </div>
                        <div style={{ fontSize: 13, color: '#6B7280', marginTop: 3 }}>
                          Lokasi: {tool.lokasi} • Maks. ketersediaan: {maxSekarang} unit
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            border: '1px solid #D5D0C7',
                            borderRadius: 4,
                            background: '#FAF8F5',
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => handleUpdateToolQty(tool.facilityId, -1)}
                            disabled={tool.jumlah <= 1}
                            style={{
                              width: 38,
                              height: 38,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: 'transparent',
                              border: 'none',
                              cursor: tool.jumlah <= 1 ? 'not-allowed' : 'pointer',
                              color: tool.jumlah <= 1 ? '#D1D5DB' : '#181D24',
                              fontWeight: 700,
                              fontSize: 16,
                            }}
                            aria-label="Kurangi jumlah alat"
                          >
                            -
                          </button>
                          <span
                            style={{
                              minWidth: 36,
                              textAlign: 'center',
                              fontWeight: 700,
                              fontSize: 14.5,
                              color: '#181D24',
                            }}
                          >
                            {tool.jumlah}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateToolQty(tool.facilityId, 1)}
                            disabled={tool.jumlah >= maxSekarang}
                            style={{
                              width: 38,
                              height: 38,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: 'transparent',
                              border: 'none',
                              cursor: tool.jumlah >= maxSekarang ? 'not-allowed' : 'pointer',
                              color: tool.jumlah >= maxSekarang ? '#D1D5DB' : '#181D24',
                              fontWeight: 700,
                              fontSize: 16,
                            }}
                            aria-label="Tambah jumlah alat"
                          >
                            +
                          </button>
                        </div>

                        <span style={{ fontSize: 13.5, color: '#4B5563', fontWeight: 600 }}>
                          unit
                        </span>

                        <button
                          type="button"
                          onClick={() => handleRemoveTool(tool.facilityId)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '7px 14px',
                            borderRadius: 4,
                            border: '1px solid #FECACA',
                            background: '#FEF2F2',
                            color: '#DC2626',
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: 'pointer',
                            minHeight: 38,
                          }}
                          aria-label={`Hapus ${tool.nama} dari daftar`}
                        >
                          ✕ Hapus
                        </button>
                      </div>
                    </div>
                  );
                  })}
                </div>
              ) : (
                <div
                  style={{
                    padding: '18px',
                    textAlign: 'center',
                    background: '#FFFFFF',
                    borderRadius: 6,
                    border: '1px dashed #D5D0C7',
                    color: '#6B7280',
                    fontSize: 13.5,
                  }}
                >
                  Belum ada alat pendukung yang dipilih. Gunakan menu di atas jika ingin meminjam alat bersama ruangan.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="btn-row" style={{ marginTop: 22 }}>
          <button
            type="button"
            className="btn primary"
            onClick={handleSubmit}
            disabled={hasConflict || !startTime || !endTime || isSubmitting}
          >
            {isSubmitting ? 'Mengirim…' : 'Ajukan Reservasi'}
          </button>
        </div>
      </div>

      <ActionPromptModal
        config={modalConfig}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

export default function AjukanReservasiPage() {
  return (
    <Suspense fallback={null}>
      <AjukanReservasiContent />
    </Suspense>
  );
}
