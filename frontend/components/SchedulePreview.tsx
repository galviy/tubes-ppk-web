'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAppData } from '@/context/AppDataContext';
import {
  generateTimeSlots,
  getSlotState,
  getTodayDateString,
  formatDateIndo,
} from '@/lib/slots';
import { SlotState } from '@/models/facility';
import { backendJadwalFasilitas, mapJadwalStatus, SlotStatusBackend } from '@/lib/api';

const SLOTS = generateTimeSlots();

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d + days);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
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
  const [today, setToday] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [backendSlots, setBackendSlots] = useState<
    Record<string, Record<string, { status: SlotStatusBackend; tersedia: boolean }>>
  >({});
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState('');

  useEffect(() => {
    const nowDate = new Date();
    setNow(nowDate);
    const todayStr = getTodayDateString();
    setToday(todayStr);
    setSelectedDate(todayStr);
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  // Ambil status tiap slot dari endpoint publik GET /jadwal (menunggu vs terpakai).
  useEffect(() => {
    if (!selectedDate) return;
    let cancelled = false;
    (async () => {
      setScheduleLoading(true);
      setScheduleError('');
      const res = await backendJadwalFasilitas({ tanggal: selectedDate, hari: 1 });
      if (cancelled) return;
      if (res.ok && Array.isArray(res.data)) {
        const next: Record<string, Record<string, { status: SlotStatusBackend; tersedia: boolean }>> = {};
        for (const item of res.data) {
          const perSlot: Record<string, { status: SlotStatusBackend; tersedia: boolean }> = {};
          for (const hari of item.hari ?? []) {
            if (hari.tanggal && hari.tanggal !== selectedDate) continue;
            for (const slot of hari.slot ?? []) {
              perSlot[slot.mulai] = {
                status: mapJadwalStatus(slot.status),
                tersedia: Boolean(slot.tersedia),
              };
            }
          }
          next[item.id] = perSlot;
        }
        setBackendSlots(next);
      } else {
        setBackendSlots({});
        setScheduleError(res.message || 'Jadwal publik gagal dimuat.');
      }
      setScheduleLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedDate]);

  const facility = facilities.find((f) => f.id === activeFacilityId) ?? facilities[0];

  useEffect(() => {
    if (facilities.length > 0 && (!activeFacilityId || !facilities.some((f) => f.id === activeFacilityId))) {
      onSelectFacility(facilities[0].id);
    }
  }, [facilities, activeFacilityId, onSelectFacility]);

  const slotStates = useMemo(() => {
    if (!now || !facility) return SLOTS.map(() => 'passed' as SlotState);
    const perSlot = backendSlots[facility.id];
    return SLOTS.map((slot) =>
      getSlotState(facility, slot.start, reservations, selectedDate, undefined, perSlot?.[slot.start])
    );
  }, [facility, reservations, now, backendSlots, selectedDate]);

  const availableCount = slotStates.filter((s) => s === 'avail').length;
  const availablePct = Math.round((availableCount / SLOTS.length) * 100);

  function shiftDate(days: number) {
    if (!selectedDate) return;
    const next = addDays(selectedDate, days);
    if (today && next < today) return;
    setSelectedDate(next);
  }

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
              Pratinjau Ketersediaan Jadwal{selectedDate && ` (${formatDateIndo(selectedDate)})`}
            </div>
            <p className="sched-sub">Pilih tanggal dan fasilitas untuk melihat ketersediaan slot secara real-time.</p>
          </div>
        </div>
        <div className="server-clock-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" /><path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          {now ? `${pad(now.getHours())}:${pad(now.getMinutes())}` : '--:--'} WIB
        </div>
      </div>

      {/* Pemilih tanggal: hari ini dan sesudahnya, tanggal lampau ditutup */}
      <div className="sched-date-bar">
        <div className="sched-date-nav">
          <button
            type="button"
            className="sched-date-btn"
            onClick={() => shiftDate(-1)}
            disabled={!today || selectedDate <= today}
            aria-label="Hari sebelumnya"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <label className="sched-date-input-wrap">
            <span className="lbl-sm">Tanggal</span>
            <input
              type="date"
              className="sched-date-input"
              value={selectedDate}
              min={today || undefined}
              onChange={(e) => {
                if (e.target.value) setSelectedDate(e.target.value);
              }}
            />
          </label>
          <button
            type="button"
            className="sched-date-btn"
            onClick={() => shiftDate(1)}
            aria-label="Hari berikutnya"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </div>

      {/* Toolbar: pemilih fasilitas */}
      <div className="sched-toolbar">
        <div className="sched-quick-select-wrap">
          <label className="sched-quick-label">Pilih Fasilitas:</label>
          <select
            className="sched-quick-select"
            value={activeFacilityId}
            onChange={(e) => onSelectFacility(e.target.value)}
          >
            {facilities.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.loc}) • {f.status === 'repair' ? 'Perbaikan' : f.status === 'nonaktif' ? 'Nonaktif' : 'Tersedia'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {scheduleError && (
        <p className="sched-status-note error" role="status">
          {scheduleError} Menampilkan perkiraan dari data lokal.
        </p>
      )}
      {scheduleLoading && !scheduleError && (
        <p className="sched-status-note" role="status">Memuat status slot...</p>
      )}

      <div className="sched-info-row">
        <div className="sched-info-cell">
          <span className="lbl-sm">Fasilitas</span>
          <b>{facility.name}</b>
        </div>
        <div className="sched-info-cell">
          <span className="lbl-sm">{facility.tipe === 'alat' ? 'Jumlah Tersedia' : 'Kapasitas'}</span>
          <b>
            {facility.tipe === 'alat' ? (facility.tersedia ?? facility.cap) : facility.cap}{' '}
            {facility.tipe === 'alat' ? 'unit' : 'orang'}
          </b>
        </div>
        <div className="sched-info-cell">
          <span className="lbl-sm">Zona Operasional</span>
          <b>07.00 - 20.00 WIB</b>
        </div>
        <div className="sched-info-cell sched-avail-meter">
          <span className="lbl-sm">Slot Tersedia</span>
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
