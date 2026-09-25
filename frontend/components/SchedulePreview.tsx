'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useAppData } from '@/context/AppDataContext';
import { generateTimeSlots, getSlotState } from '@/lib/slots';
import { SlotState } from '@/models/facility';

const SLOTS = generateTimeSlots();

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

function formatToday(d: Date) {
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}
function pad(n: number) {
  return n.toString().padStart(2, '0');
}

const STATUS_LABEL: Record<SlotState, string> = {
  passed: 'Waktu Lewat',
  avail: 'Tersedia',
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
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

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

  const categories = useMemo(() => {
    return ['Semua', ...Array.from(new Set(facilities.map((f) => f.type))).filter(Boolean)];
  }, [facilities]);

  const filteredFacilities = useMemo(() => {
    if (selectedCategory === 'Semua') return facilities;
    return facilities.filter((f) => f.type === selectedCategory);
  }, [facilities, selectedCategory]);

  const facility = facilities.find((f) => f.id === activeFacilityId) ?? facilities[0];

  useEffect(() => {
    if (facilities.length > 0 && (!activeFacilityId || !facilities.some((f) => f.id === activeFacilityId))) {
      onSelectFacility(facilities[0].id);
    }
  }, [facilities, activeFacilityId, onSelectFacility]);

  const slotStates = useMemo(() => {
    if (!now || !facility) return SLOTS.map(() => 'passed' as SlotState);
    return SLOTS.map((slot) => getSlotState(facility, slot.start, reservations));
  }, [facility, reservations, now]);

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
              Pratinjau Ketersediaan Jadwal{now && ` (${formatToday(now)})`}
            </div>
            <p className="sched-sub">Pilih fasilitas untuk melihat jam ketersediaan publik secara real-time.</p>
          </div>
        </div>
        <div className="server-clock-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" /><path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          {now ? `${pad(now.getHours())}:${pad(now.getMinutes())}` : '--:--'} WIB
        </div>
      </div>

      {/* Toolbar: Category filter + Quick Select dropdown for large datasets */}
      <div className="sched-toolbar">
        <div className="sched-cat-filter">
          {categories.map((cat) => {
            const count = cat === 'Semua' ? facilities.length : facilities.filter((f) => f.type === cat).length;
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
          <label className="sched-quick-label">Pilih Fasilitas:</label>
          <select
            className="sched-quick-select"
            value={activeFacilityId}
            onChange={(e) => {
              const nextId = e.target.value;
              onSelectFacility(nextId);
              const targetFac = facilities.find((f) => f.id === nextId);
              if (targetFac && selectedCategory !== 'Semua' && targetFac.type !== selectedCategory) {
                setSelectedCategory('Semua');
              }
            }}
          >
            {facilities.map((f) => (
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
          {filteredFacilities.map((f) => {
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
          })}
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
          <span className="lbl-sm">{facility.type?.toLowerCase() === 'alat' ? 'Jumlah Tersedia' : 'Kapasitas'}</span>
          <b>{facility.cap} {facility.type?.toLowerCase() === 'alat' ? 'unit' : 'orang'}</b>
        </div>
        <div className="sched-info-cell">
          <span className="lbl-sm">Zona Operasional</span>
          <b>07.00 - 20.00 WIB</b>
        </div>
        <div className="sched-info-cell sched-avail-meter">
          <span className="lbl-sm">Slot Tersedia Hari Ini</span>
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
