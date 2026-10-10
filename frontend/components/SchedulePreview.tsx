'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useAppData } from '@/context/AppDataContext';
import { generateTimeSlots, getSlotState, getTodayDateString, formatDateIndo, formatTimeInJakarta } from '@/lib/slots';
import { Facility, SlotState } from '@/models/facility';
import { backendJadwalFasilitas, mapJadwalStatus, SlotStatusBackend } from '@/lib/api';
import {
  isRuanganFacility,
  isAlatFacility,
  DEFAULT_ROOM_CATEGORIES,
} from '@/models/facilities-data';

const SLOTS = generateTimeSlots();

const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

function formatFullDate(dateStr: string) {
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3) return dateStr;
  const dt = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  const dayName = DAY_NAMES[dt.getUTCDay()] || '';
  return `${dayName}, ${formatDateIndo(dateStr)}`;
}

function shiftDay(dateStr: string, delta: number): string {
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3) return dateStr;
  const dt = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2] + delta));
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const d = String(dt.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const STATUS_LABEL: Record<SlotState, string> = {
  passed: 'Waktu Lewat',
  avail: 'Tersedia',
  pending: 'Menunggu Persetujuan',
  booked: 'Terpakai',
  maint: 'Tidak Aktif',
};

const FACILITY_STATUS_LABEL: Record<Facility['status'], { label: string; color: string }> = {
  avail: { label: 'Tersedia', color: '#15803D' },
  busy: { label: 'Digunakan', color: '#B45309' },
  repair: { label: 'Perbaikan', color: '#B91C1C' },
  nonaktif: { label: 'Nonaktif', color: '#991B1B' },
};

// Slot dikelompokkan per periode waktu supaya lebih cepat dipindai
const PERIODS = [
  { label: 'Pagi', from: '07:00', to: '10:00' },
  { label: 'Siang', from: '10:00', to: '15:00' },
  { label: 'Sore', from: '15:00', to: '18:00' },
  { label: 'Malam', from: '18:00', to: '20:00' },
];

const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const WEEKDAY_NAMES_ID = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

function DownwardDatePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (date: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

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

    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevM = viewMonth === 0 ? 11 : viewMonth - 1;
      const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
      days.push({
        dateStr: `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        dayNum: d,
        isCurrentMonth: false,
      });
    }

    for (let d = 1; d <= daysInCurrentMonth; d++) {
      days.push({
        dateStr: `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        dayNum: d,
        isCurrentMonth: true,
      });
    }

    const totalSlots = Math.ceil(days.length / 7) * 7;
    const nextPadding = totalSlots - days.length;
    for (let d = 1; d <= nextPadding; d++) {
      const nextM = viewMonth === 11 ? 0 : viewMonth + 1;
      const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
      days.push({
        dateStr: `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        dayNum: d,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [viewYear, viewMonth]);

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
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: '7px 13px',
          borderRadius: 4,
          border: isOpen ? '1px solid #b59876' : '1px solid #b59876',
          background: '#FFFFFF',
          color: '#181D24',
          fontSize: 13.5,
          fontWeight: 500,
          fontFamily: 'inherit',
          cursor: 'pointer',
          outline: 'none',
          boxShadow: isOpen ? '0 0 0 2px rgba(181, 152, 118, 0.2)' : 'none',
          transition: 'all 0.15s ease',
        }}
        aria-label="Pilih tanggal kalender"
        aria-expanded={isOpen}
      >
        <span>{displayLabel}</span>
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#b59876"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            zIndex: 9999,
            background: '#FFFFFF',
            border: '1px solid #D5D0C7',
            borderRadius: 8,
            boxShadow: '0 12px 32px rgba(24, 29, 36, 0.18)',
            padding: 14,
            width: 280,
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
                  onClick={() => {
                    onChange(d.dateStr);
                    setIsOpen(false);
                  }}
                  style={{
                    background: isSelected ? '#15171A' : isToday ? '#FAF8F5' : 'transparent',
                    color: isSelected ? '#b59876' : d.isCurrentMonth ? '#181D24' : '#9CA3AF',
                    border: isToday && !isSelected ? '1px solid #b59876' : '1px solid transparent',
                    borderRadius: 4,
                    height: 32,
                    fontSize: 12.5,
                    fontWeight: isSelected || isToday ? 700 : 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.1s ease',
                  }}
                  title={d.dateStr}
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
            <button
              type="button"
              onClick={() => {
                onChange(todayStr);
                setIsOpen(false);
              }}
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
              Hari Ini
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#6B7280',
                fontSize: 12,
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

interface SchedulePreviewProps {
  activeFacilityId: string;
  onSelectFacility: (id: string) => void;
}

export default function SchedulePreview({ activeFacilityId, onSelectFacility }: SchedulePreviewProps) {
  const { facilities, reservations, currentUser } = useAppData();
  const [now, setNow] = useState<Date | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(() => getTodayDateString());
  const [tabType, setTabType] = useState<'ruangan' | 'alat'>(() => {
    const current = facilities.find((f) => f.id === activeFacilityId);
    return current && isAlatFacility(current) ? 'alat' : 'ruangan';
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [backendSlots, setBackendSlots] = useState<
    Record<string, Record<string, { status: SlotStatusBackend; tersedia: boolean }>>
  >({});
  const [isFacDropdownOpen, setIsFacDropdownOpen] = useState(false);
  const facDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isFacDropdownOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (facDropdownRef.current && !facDropdownRef.current.contains(e.target as Node)) {
        setIsFacDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isFacDropdownOpen]);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  // Ambil status tiap slot dari endpoint publik GET /jadwal (menunggu vs terpakai)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await backendJadwalFasilitas({ tanggal: selectedDate, hari: 1 });
      if (cancelled || !res.ok || !Array.isArray(res.data)) return;
      const next: Record<string, Record<string, { status: SlotStatusBackend; tersedia: boolean }>> = {};
      for (const item of res.data) {
        const perSlot: Record<string, { status: SlotStatusBackend; tersedia: boolean }> = {};
        for (const h of item.hari ?? []) {
          if (h.tanggal && h.tanggal !== selectedDate) continue;
          for (const s of h.slot ?? []) {
            perSlot[s.mulai] = { status: mapJadwalStatus(s.status), tersedia: Boolean(s.tersedia) };
          }
        }
        if (item.id) next[item.id] = perSlot;
        if (item.ref_id && item.tipe) {
          next[`${item.tipe}-${item.ref_id}`] = perSlot;
          next[String(item.ref_id)] = perSlot;
        }
      }
      setBackendSlots(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedDate, reservations]);

  const countRuangan = useMemo(() => facilities.filter(isRuanganFacility).length, [facilities]);
  const countAlat = useMemo(() => facilities.filter(isAlatFacility).length, [facilities]);

  const tabFacilities = useMemo(() => {
    return facilities.filter(tabType === 'alat' ? isAlatFacility : isRuanganFacility);
  }, [facilities, tabType]);

  const categories = useMemo(() => {
    if (tabType === 'ruangan') {
      const existing = Array.from(new Set(facilities.filter(isRuanganFacility).map((f) => f.type))).filter(Boolean);
      const all = Array.from(new Set([...DEFAULT_ROOM_CATEGORIES, ...existing]));
      return ['Semua', ...all];
    } else {
      const existing = Array.from(new Set(facilities.filter(isAlatFacility).map((f) => f.type))).filter(Boolean);
      return ['Semua', ...existing];
    }
  }, [facilities, tabType]);

  const filteredFacilities = useMemo(() => {
    if (selectedCategory === 'Semua') return tabFacilities;
    return tabFacilities.filter((f) => f.type === selectedCategory);
  }, [tabFacilities, selectedCategory]);

  const facility = filteredFacilities.find((f) => f.id === activeFacilityId) ?? filteredFacilities[0] ?? tabFacilities[0] ?? facilities[0];

  // Pastikan fasilitas aktif sesuai dengan kategori dan tab yang sedang aktif
  useEffect(() => {
    if (filteredFacilities.length > 0 && !filteredFacilities.some((f) => f.id === activeFacilityId)) {
      onSelectFacility(filteredFacilities[0].id);
    }
  }, [filteredFacilities, activeFacilityId, onSelectFacility]);

  const slotStates = useMemo(() => {
    if (!now || !facility) return SLOTS.map(() => 'passed' as SlotState);
    const perSlot =
      backendSlots[facility.id] ||
      (facility.refId && facility.tipe ? backendSlots[`${facility.tipe}-${facility.refId}`] : undefined) ||
      (facility.refId ? backendSlots[String(facility.refId)] : undefined);
    return SLOTS.map((slot) =>
      getSlotState(
        facility,
        slot.start,
        reservations,
        selectedDate,
        currentUser?.nama || currentUser?.email,
        perSlot?.[slot.start],
        currentUser?.role
      )
    );
  }, [facility, reservations, now, backendSlots, selectedDate, currentUser]);

  const availableCount = slotStates.filter((s) => s === 'avail').length;
  const availablePct = Math.round((availableCount / SLOTS.length) * 100);

  if (!facility) {
    return (
      <div className="sched-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
        <p style={{ color: '#6B7280', fontSize: 15, margin: 0 }}>
          {facilities.length === 0 ? 'Memuat data ketersediaan jadwal fasilitas...' : 'Pilih fasilitas untuk melihat jadwal.'}
        </p>
      </div>
    );
  }

  return (
    <div className="sched-card">
      <div className="sched-top-row">
        <div className="sched-title-group">
          <div className="sched-icon-badge">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="17" rx="2" stroke="#fff" strokeWidth="1.8" />
              <path d="M3 9h18M8 3v3M16 3v3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div className="sched-title">
              Pratinjau Ketersediaan Jadwal ({formatFullDate(selectedDate)})
            </div>
            <p className="sched-sub">Pilih fasilitas dan tanggal untuk melihat ketersediaan slot waktu secara real-time.</p>
          </div>
        </div>
        <div className="server-clock-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" /><path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          {now ? formatTimeInJakarta(now) : '--:--'} WIB
        </div>
      </div>

      {/* Sub-tab Switcher: Ruangan vs Alat */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          margin: '16px 0 4px',
          borderBottom: '1px solid #E5E0D8',
          paddingBottom: 10,
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={() => {
            setTabType('ruangan');
            setSelectedCategory('Semua');
            setIsFacDropdownOpen(false);
          }}
          style={{
            padding: '8px 18px',
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            border: tabType === 'ruangan' ? '1px solid #181D24' : '1px solid #D5D0C7',
            background: tabType === 'ruangan' ? '#181D24' : '#FFFFFF',
            color: tabType === 'ruangan' ? '#FFFFFF' : '#4B5563',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.15s ease',
          }}
        >
          Jadwal Ruangan ({countRuangan})
        </button>
        <button
          type="button"
          onClick={() => {
            setTabType('alat');
            setSelectedCategory('Semua');
            setIsFacDropdownOpen(false);
          }}
          style={{
            padding: '8px 18px',
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            border: tabType === 'alat' ? '1px solid #181D24' : '1px solid #D5D0C7',
            background: tabType === 'alat' ? '#181D24' : '#FFFFFF',
            color: tabType === 'alat' ? '#FFFFFF' : '#4B5563',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.15s ease',
          }}
        >
          Jadwal Alat ({countAlat})
        </button>
      </div>

      {/* Calendar Date Navigation Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          padding: '12px 16px',
          background: '#FAF8F5',
          border: '1px solid #E5E0D8',
          borderRadius: 6,
          margin: '12px 0 14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setSelectedDate((d) => shiftDay(d, -1))}
            style={{
              padding: '7px 12px',
              borderRadius: 4,
              border: '1px solid #D5D0C7',
              background: '#FFFFFF',
              color: '#181D24',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontFamily: 'inherit',
            }}
            aria-label="Hari sebelumnya"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Hari Sebelumnya
          </button>

          <DownwardDatePicker
            value={selectedDate}
            onChange={(newDate) => setSelectedDate(newDate)}
          />

          <button
            type="button"
            onClick={() => setSelectedDate((d) => shiftDay(d, 1))}
            style={{
              padding: '7px 12px',
              borderRadius: 4,
              border: '1px solid #D5D0C7',
              background: '#FFFFFF',
              color: '#181D24',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontFamily: 'inherit',
            }}
            aria-label="Hari selanjutnya"
          >
            Hari Selanjutnya
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {selectedDate !== getTodayDateString() && (
            <button
              type="button"
              onClick={() => setSelectedDate(getTodayDateString())}
              style={{
                padding: '7px 12px',
                borderRadius: 4,
                border: '1px solid #b59876',
                background: '#15171A',
                color: '#b59876',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Hari Ini
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#181D24' }}>
            {formatFullDate(selectedDate)}
          </span>
          {selectedDate === getTodayDateString() ? (
            <span
              style={{
                fontSize: 13.5,
                fontWeight: 700,
                color: '#15803D',
                background: '#DCFCE7',
                border: '1px solid #BBF7D0',
                padding: '2px 8px',
                borderRadius: 4,
                letterSpacing: '0.04em',
              }}
            >
              HARI INI
            </span>
          ) : selectedDate < getTodayDateString() ? (
            <span
              style={{
                fontSize: 13.5,
                fontWeight: 600,
                color: '#4B5563',
                background: '#F3F4F6',
                border: '1px solid #E5E7EB',
                padding: '2px 8px',
                borderRadius: 4,
              }}
            >
              Sudah Lewat
            </span>
          ) : (
            <span
              style={{
                fontSize: 13.5,
                fontWeight: 600,
                color: '#854D0E',
                background: '#FEF9C3',
                border: '1px solid #FEF08A',
                padding: '2px 8px',
                borderRadius: 4,
              }}
            >
              Mendatang
            </span>
          )}
        </div>
      </div>

      {/* Toolbar: Category filter + Quick Select dropdown */}
      <div className="sched-toolbar">
        <div className="sched-cat-filter">
          {categories.map((cat) => {
            const count = cat === 'Semua' ? tabFacilities.length : tabFacilities.filter((f) => f.type === cat).length;
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                className={`sched-cat-btn ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setSelectedCategory(cat);
                  setIsFacDropdownOpen(false);
                  const matching = cat === 'Semua' ? tabFacilities : tabFacilities.filter((f) => f.type === cat);
                  if (matching.length > 0 && !matching.some((f) => f.id === activeFacilityId)) {
                    onSelectFacility(matching[0].id);
                  }
                }}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        <div className="sched-quick-select-wrap">
          <label className="sched-quick-label">Pilih {tabType === 'ruangan' ? 'Ruangan' : 'Alat'}:</label>
          <div ref={facDropdownRef} style={{ position: 'relative', display: 'inline-block', minWidth: 300, maxWidth: '100%' }}>
            <button
              type="button"
              onClick={() => setIsFacDropdownOpen((v) => !v)}
              className={`sched-quick-dropdown-btn ${isFacDropdownOpen ? 'open' : ''}`}
              aria-haspopup="listbox"
              aria-expanded={isFacDropdownOpen}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {facility?.name || (filteredFacilities.length === 0 ? `Tidak ada ${tabType === 'ruangan' ? 'ruangan' : 'alat'}` : `Pilih ${tabType === 'ruangan' ? 'Ruangan' : 'Alat'}`)}
              </span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#726C64"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  transform: isFacDropdownOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.15s ease',
                  flexShrink: 0,
                }}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {isFacDropdownOpen && (
              <div className="sched-quick-menu" role="listbox">
                {filteredFacilities.length === 0 ? (
                  <div style={{ padding: '12px 14px', fontSize: 13, color: '#6B7280' }}>
                    Tidak ada {tabType === 'ruangan' ? 'ruangan' : 'alat'} untuk kategori ini
                  </div>
                ) : (
                  filteredFacilities.map((f) => {
                    const isSelected = f.id === facility?.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        className={`sched-quick-item ${isSelected ? 'active' : ''}`}
                        onClick={() => {
                          onSelectFacility(f.id);
                          setIsFacDropdownOpen(false);
                        }}
                      >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {f.name}
                        </span>
                        {f.loc && (
                          <span style={{ fontSize: 11.5, color: '#9CA3AF', marginLeft: 10, flexShrink: 0 }}>
                            {f.loc}
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {filteredFacilities.length === 0 ? (
        <div style={{ padding: '36px 16px', textAlign: 'center', color: '#6B7280', fontSize: 14 }}>
          Tidak ada {tabType === 'ruangan' ? 'ruangan' : 'alat'} untuk kategori &quot;{selectedCategory}&quot;.
        </div>
      ) : (
        <>
          <div className="sched-info-row">
            <div className="sched-info-cell">
              <span className="lbl-sm">Fasilitas</span>
              <b>{facility.name}</b>
            </div>
            <div className="sched-info-cell">
              <span className="lbl-sm">Lokasi</span>
              <b>{facility.loc || 'Belum tersedia'}</b>
            </div>
            <div className="sched-info-cell">
              <span className="lbl-sm">Status Fasilitas</span>
              <b style={{ color: FACILITY_STATUS_LABEL[facility.status]?.color, fontWeight: 700 }}>
                {FACILITY_STATUS_LABEL[facility.status]?.label ?? facility.status}
              </b>
            </div>
            <div className="sched-info-cell">
              <span className="lbl-sm">{isAlatFacility(facility) ? 'Jumlah Tersedia' : 'Kapasitas'}</span>
              <b>{isAlatFacility(facility) ? facility.tersedia ?? facility.cap : facility.cap} {isAlatFacility(facility) ? 'unit' : 'orang'}</b>
            </div>
            <div className="sched-info-cell">
              <span className="lbl-sm">Zona Operasional</span>
              <b>07.00 - 20.00 WIB</b>
            </div>
            <div className="sched-info-cell sched-avail-meter">
              <span className="lbl-sm">
                {selectedDate === getTodayDateString()
                  ? 'Slot Tersedia Hari Ini'
                  : `Slot Tersedia (${formatDateIndo(selectedDate)})`}
              </span>
              <div className="meter-row">
                <div className="meter-track"><div className="meter-fill" style={{ width: `${availablePct}%` }} /></div>
                <b>{availableCount}/{SLOTS.length}</b>
              </div>
            </div>
          </div>

          {PERIODS.map((period) => {
            const periodSlots = SLOTS.map((slot, i) => ({ slot, state: slotStates[i] })).filter(
              ({ slot }) => slot.start >= period.from && slot.start < period.to
            );
            if (periodSlots.length === 0) return null;
            return (
              <div key={period.label} className="sched-period">
                <div className="sched-period-head">{period.label}</div>
                <div className="slot-grid-lg">
                  {periodSlots.map(({ slot, state }) => (
                    <div key={slot.start} className={`slot-lg ${state}`}>
                      <span className="slot-bar" />
                      <div className="slot-lg-body">
                        <div className="t">{slot.start} - {slot.end}</div>
                        <div className="s">{STATUS_LABEL[state]}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </>
      )}

      <div className="privacy-box">
        <div className="icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" stroke="#1E3A8A" strokeWidth="1.7" strokeLinejoin="round" /><path d="M9.5 12l1.8 1.8L15 10" stroke="#1E3A8A" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <div>
          <h4>Kebijakan Privasi Peminjaman Publik</h4>
          <p>
            Pengunjung publik hanya dapat melihat status ketersediaan waktu. Identitas pemohon, nomor
            kontak, serta rincian spesifik kegiatan dilindungi privasinya. Untuk mengajukan permohonan
            reservasi, silakan masuk terlebih dahulu.
          </p>
        </div>
      </div>
    </div>
  );
}
