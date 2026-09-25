'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useAppData } from '@/context/AppDataContext';
import { generateTimeSlots, getSlotState, getTodayDateString, formatDateIndo } from '@/lib/slots';
import { SlotState } from '@/models/facility';
import { backendJadwalFasilitas, mapJadwalStatus, SlotStatusBackend } from '@/lib/api';
import {
  isRuanganFacility,
  isAlatFacility,
  DEFAULT_ROOM_CATEGORIES,
  DEFAULT_ALAT_CATEGORIES,
} from '@/models/facilities-data';

const SLOTS = generateTimeSlots();

const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

function formatFullDate(dateStr: string) {
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3) return dateStr;
  const dt = new Date(parts[0], parts[1] - 1, parts[2]);
  const dayName = DAY_NAMES[dt.getDay()] || '';
  return `${dayName}, ${formatDateIndo(dateStr)}`;
}

function shiftDay(dateStr: string, delta: number): string {
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3) return dateStr;
  const dt = new Date(parts[0], parts[1] - 1, parts[2]);
  dt.setDate(dt.getDate() + delta);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

const STATUS_LABEL: Record<SlotState, string> = {
  passed: 'Waktu Lewat',
  avail: 'Tersedia',
  pending: 'Menunggu Persetujuan',
  booked: 'Terpakai',
  maint: 'Tidak Aktif',
};

// Slot dikelompokkan per periode waktu supaya lebih cepat dipindai
const PERIODS = [
  { label: 'Pagi', from: '07:00', to: '10:00' },
  { label: 'Siang', from: '10:00', to: '15:00' },
  { label: 'Sore', from: '15:00', to: '18:00' },
  { label: 'Malam', from: '18:00', to: '20:00' },
];

interface SchedulePreviewProps {
  activeFacilityId: string;
  onSelectFacility: (id: string) => void;
}

export default function SchedulePreview({ activeFacilityId, onSelectFacility }: SchedulePreviewProps) {
  const { facilities, reservations } = useAppData();
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
  const tabsRef = useRef<HTMLDivElement>(null);

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
        next[item.id] = perSlot;
      }
      setBackendSlots(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedDate]);

  // Auto-scroll active chip into view horizontally when active facility changes
  useEffect(() => {
    if (tabsRef.current) {
      const activeEl = tabsRef.current.querySelector('.sched-fac-tab.active') as HTMLElement | null;
      if (activeEl) {
        activeEl.scrollIntoView({ inline: 'nearest', behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [activeFacilityId]);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsRef.current) {
      tabsRef.current.scrollBy({
        left: direction === 'left' ? -220 : 220,
        behavior: 'smooth',
      });
    }
  };

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
      const all = Array.from(new Set([...DEFAULT_ALAT_CATEGORIES, ...existing]));
      return ['Semua', ...all];
    }
  }, [facilities, tabType]);

  const filteredFacilities = useMemo(() => {
    if (selectedCategory === 'Semua') return tabFacilities;
    return tabFacilities.filter((f) => f.type === selectedCategory);
  }, [tabFacilities, selectedCategory]);

  const facility = tabFacilities.find((f) => f.id === activeFacilityId) ?? tabFacilities[0] ?? facilities[0];

  // Pastikan fasilitas aktif sesuai dengan tab yang sedang aktif
  useEffect(() => {
    if (tabFacilities.length > 0 && !tabFacilities.some((f) => f.id === activeFacilityId)) {
      onSelectFacility(tabFacilities[0].id);
    }
  }, [tabFacilities, activeFacilityId, onSelectFacility]);

  const slotStates = useMemo(() => {
    if (!now || !facility) return SLOTS.map(() => 'passed' as SlotState);
    const perSlot = backendSlots[facility.id];
    return SLOTS.map((slot) =>
      getSlotState(facility, slot.start, reservations, selectedDate, undefined, perSlot?.[slot.start])
    );
  }, [facility, reservations, now, backendSlots, selectedDate]);

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
          {now ? `${pad(now.getHours())}:${pad(now.getMinutes())}` : '--:--'} WIB
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

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              if (e.target.value) setSelectedDate(e.target.value);
            }}
            style={{
              padding: '6px 12px',
              borderRadius: 4,
              border: '1px solid #b59876',
              background: '#FFFFFF',
              color: '#181D24',
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'inherit',
              cursor: 'pointer',
              outline: 'none',
            }}
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
              Kembali ke Hari Ini
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
              Riwayat Lalu
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
              Jadwal Mendatang
            </span>
          )}
        </div>
      </div>

      {/* Toolbar: Category filter + Quick Select dropdown for large datasets */}
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
                onClick={() => setSelectedCategory(cat)}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        <div className="sched-quick-select-wrap">
          <label className="sched-quick-label">Pilih {tabType === 'ruangan' ? 'Ruangan' : 'Alat'}:</label>
          <select
            className="sched-quick-select"
            value={activeFacilityId}
            onChange={(e) => {
              const nextId = e.target.value;
              onSelectFacility(nextId);
              const targetFac = tabFacilities.find((f) => f.id === nextId);
              if (targetFac && selectedCategory !== 'Semua' && targetFac.type !== selectedCategory) {
                setSelectedCategory('Semua');
              }
            }}
          >
            {tabFacilities.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.loc}) • {f.status === 'repair' ? 'Perbaikan' : f.status === 'nonaktif' ? 'Nonaktif' : 'Tersedia'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Facility selector chips - horizontally scrollable */}
      <div className="sched-fac-tabs-wrapper">
        <button
          type="button"
          className="sched-fac-scroll-btn left"
          onClick={() => scrollTabs('left')}
          aria-label="Scroll kiri"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <div className="sched-fac-tabs" ref={tabsRef}>
          {filteredFacilities.length === 0 ? (
            <div style={{ padding: '8px 16px', fontSize: 13, color: '#6B7280' }}>
              Tidak ada {tabType === 'ruangan' ? 'ruangan' : 'alat'} untuk kategori ini.
            </div>
          ) : (
            filteredFacilities.map((f) => {
              const isActive = f.id === activeFacilityId;
              const isRepair = f.status === 'repair' || f.status === 'nonaktif';
              return (
                <button
                  key={f.id}
                  type="button"
                  className={`sched-fac-tab ${isActive ? 'active' : ''}`}
                  onClick={() => onSelectFacility(f.id)}
                >
                  <span className={`fac-dot ${isRepair ? 'repair' : 'avail'}`} />
                  <span className="sched-fac-name">{f.name}</span>
                </button>
              );
            })
          )}
        </div>
        <button
          type="button"
          className="sched-fac-scroll-btn right"
          onClick={() => scrollTabs('right')}
          aria-label="Scroll kanan"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>

      <div className="sched-info-row">
        <div className="sched-info-cell">
          <span className="lbl-sm">Fasilitas</span>
          <b>{facility.name}</b>
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

      <div className="sched-legend">
        <div className="leg"><span className="sq avail" />Tersedia untuk Reservasi</div>
        <div className="leg"><span className="sq pending" />Menunggu Persetujuan</div>
        <div className="leg"><span className="sq booked" />Terpakai / Sedang Dipesan</div>
        <div className="leg"><span className="sq passed" />Waktu Lewat / Tidak Aktif</div>
      </div>

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
