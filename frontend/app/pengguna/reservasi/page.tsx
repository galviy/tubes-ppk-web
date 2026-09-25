'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppData } from '@/context/AppDataContext';
import {
  generateTimeSlots,
  currentHHMM,
  getTodayDateString,
  isReservationDeadlineValid,
  getEarliestReservableDate,
} from '@/lib/slots';
import { TimeSlot } from '@/models/facility';
import ActionPromptModal, { ActionModalConfig } from '@/components/ActionPromptModal';

const SLOTS = generateTimeSlots();
const START_OPTIONS = SLOTS.map((s) => s.start); // '07:00' to '19:30'
const END_OPTIONS = SLOTS.map((s) => s.end);     // '07:30' to '20:00' (includes 20:00)

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
  { label: 'SIANG', from: '10:00', to: '13:00' },
  { label: 'SORE', from: '13:00', to: '16:00' },
  { label: 'MALAM', from: '16:00', to: '20:00' },
];

function AjukanReservasiContent() {
  const searchParams = useSearchParams();
  const { facilities, isSlotTaken, submitReservation, currentUser } = useAppData();
  const availableFacilities = facilities.filter((f) => f.status !== 'repair');

  const preselect = searchParams.get('facility');
  const [facilityId, setFacilityId] = useState(
    (preselect && availableFacilities.some((f) => f.id === preselect) && preselect) ||
      availableFacilities[0]?.id ||
      ''
  );

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
  const [tanggal, setTanggal] = useState(earliestDate);
  const [tujuan, setTujuan] = useState('');
  const [peserta, setPeserta] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Jam Mulai dan Jam Selesai yang independen dan presisi
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');

  const facility = facilities.find((f) => f.id === facilityId);
  const currentUserIdent = currentUser?.nama || currentUser?.email || '';

  // Daftar slot start yang berada dalam rentang [startTime, endTime)
  const pickedSlots = useMemo(() => {
    if (!startTime || !endTime || endTime <= startTime) return [];
    return SLOTS.filter((s) => s.start >= startTime && s.start < endTime).map((s) => s.start);
  }, [startTime, endTime]);

  // Cek bentrok terhadap slot yang dipilih untuk tanggal dan user spesifik
  const conflictSlots = useMemo(() => {
    if (!facility || pickedSlots.length === 0) return [];
    return pickedSlots.filter((slotStart) =>
      isSlotTaken(facility.id, slotStart, undefined, tanggal, currentUserIdent)
    );
  }, [facility, pickedSlots, isSlotTaken, tanggal, currentUserIdent]);

  const hasConflict = conflictSlots.length > 0;

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
    const isTaken = isSlotTaken(facility.id, slot.start, undefined, tanggal, currentUserIdent);
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
    const baseStart = startTime || '07:00';
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
  const overCapacity = !!facility && pesertaNum > facility.cap;

  async function doSubmit() {
    if (!facility || isSubmitting) return;
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
    const bookedTime = `${tanggal}, ${startTime} - ${endTime} WIB`;

    setStartTime('');
    setEndTime('');
    setTujuan('');
    setPeserta('');

    setBannerNotice({
      type: 'success',
      title: 'Permohonan Reservasi Berhasil Terkirim',
      message: `Reservasi berhasil diajukan untuk ${bookedFacilityName} (${bookedTime}). Permohonan Anda telah masuk ke antrean persetujuan petugas sarpras.`,
    });

    setModalConfig({
      isOpen: true,
      title: 'Permohonan Berhasil Diajukan',
      subtitle: `Reservasi berhasil diajukan untuk ${bookedFacilityName} (${bookedTime}). Permohonan Anda telah masuk ke antrean persetujuan petugas sarpras.`,
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
        title: 'Batas Waktu Reservasi Terlewat',
        message: `Maksimal reservasi diajukan pada H-1 pukul 00.00 WIB (contoh: reservasi tanggal 25 maksimal diajukan tanggal 24 pukul 00.00 WIB). Tanggal ${tanggal} sudah tidak dapat dipesan. Silakan pilih mulai dari tanggal ${earliestDate}.`,
      });
      setModalConfig({
        isOpen: true,
        title: 'Batas Waktu Terlewat',
        subtitle: `Maksimal reservasi diajukan pada H-1 pukul 00.00 WIB (contoh: reservasi tanggal 25 maksimal diajukan tanggal 24 pukul 00.00 WIB). Silakan pilih tanggal mulai dari ${earliestDate}.`,
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
        message: `Rentang jam yang dipilih (${startTime} - ${endTime} WIB) pada tanggal ${tanggal} bentrok dengan jadwal reservasi yang sudah terpakai atau disetujui. Silakan pilih rentang jam yang berstatus hijau (Tersedia).`,
      });
      setModalConfig({
        isOpen: true,
        title: 'Rentang Jadwal Bentrok',
        subtitle: `Rentang jam yang dipilih (${startTime} - ${endTime} WIB) pada tanggal ${tanggal} bentrok dengan jadwal reservasi lain yang sudah terpakai atau disetujui. Silakan pilih rentang yang berstatus tersedia.`,
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
    if (overCapacity) {
      const isAlat = facility.type?.toLowerCase() === 'alat';
      setModalConfig({
        isOpen: true,
        title: isAlat ? 'Jumlah Melebihi Stok Tersedia' : 'Kapasitas Melebihi Standar',
        subtitle: isAlat
          ? `Permintaan (${pesertaNum} unit) melebihi jumlah unit yang tersedia (${facility.cap} unit). Apakah Anda ingin tetap melanjutkan pengajuan?`
          : `Estimasi peserta (${pesertaNum} orang) melebihi kapasitas standar fasilitas (${facility.cap} orang). Apakah Anda ingin tetap melanjutkan pengajuan?`,
        confirmText: 'Tetap Ajukan',
        cancelText: 'Sesuaikan Data',
        confirmVariant: 'warning',
        showInput: false,
        onConfirm: () => {
          void doSubmit();
        },
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
        <p>Isi formulir untuk permohonan peminjaman fasilitas Universitas Diponegoro. Verifikasi dilakukan oleh petugas sarpras.</p>
      </div>

      <div className="alert info">
        Jam operasional kampus: <b>07.00 - 20.00 WIB</b> · Durasi kelipatan <b>30 menit</b> · Batas pengajuan: <b>H-1 pukul 00.00 WIB</b> (contoh: reservasi tgl 25 maksimal diajukan tgl 24 pukul 00.00 WIB).
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

      <div className="panel">
        <div className="form-grid">
          {/* Facility Selection */}
          <div className="fgroup">
            <label>Fasilitas</label>
            <select value={facilityId} onChange={(e) => handleFacilityChange(e.target.value)}>
              {availableFacilities.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.loc}) ({f.type?.toLowerCase() === 'alat' ? `tersedia ${f.cap} unit` : `maks. ${f.cap} orang`})
                </option>
              ))}
            </select>
          </div>

          {/* Date Selection */}
          <div className="fgroup">
            <label>Tanggal Peminjaman</label>
            <input
              type="date"
              min={earliestDate}
              value={tanggal}
              onChange={(e) => {
                const val = e.target.value;
                if (val && !isReservationDeadlineValid(val)) {
                  setBannerNotice({
                    type: 'error',
                    title: 'Batas Waktu Reservasi Terlewat',
                    message: `Maksimal reservasi diajukan pada H-1 pukul 00.00 WIB. Tanggal ${val} tidak memenuhi syarat. Tanggal paling awal yang tersedia adalah ${earliestDate}.`,
                  });
                  setTanggal(earliestDate);
                } else {
                  setTanggal(val);
                }
                setStartTime('');
                setEndTime('');
              }}
            />
            <span className="field-hint" style={{ color: '#4B5563', fontSize: 12 }}>
              ⏰ Batas Reservasi: Maksimal reservasi diajukan pada <b>H-1 pukul 00.00 WIB</b> (misal: reservasi tgl 25 maksimal diajukan tgl 24 pukul 00.00 WIB).
            </span>
          </div>

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
                <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                  Klik slot untuk memilih waktu mulai dan waktu selesai secara berurutan.
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => applyPreset(1)}
                  style={{ fontSize: 11, padding: '5px 11px', borderRadius: 4, border: '1px solid #D5D0C7', background: '#FAF8F5', cursor: 'pointer', fontWeight: 600 }}
                >
                  +1 Jam
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(2)}
                  style={{ fontSize: 11, padding: '5px 11px', borderRadius: 4, border: '1px solid #D5D0C7', background: '#FAF8F5', cursor: 'pointer', fontWeight: 600 }}
                >
                  +2 Jam
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(4)}
                  style={{ fontSize: 11, padding: '5px 11px', borderRadius: 4, border: '1px solid #D5D0C7', background: '#FAF8F5', cursor: 'pointer', fontWeight: 600 }}
                >
                  +4 Jam
                </button>
                <button
                  type="button"
                  onClick={applyFullDay}
                  style={{ fontSize: 11, padding: '5px 11px', borderRadius: 4, border: '1px solid #b59876', background: '#15171a', color: '#b59876', cursor: 'pointer', fontWeight: 700 }}
                >
                  Seharian (07:00 - 20:00)
                </button>
                {(startTime || endTime) && (
                  <button
                    type="button"
                    onClick={() => { setStartTime(''); setEndTime(''); }}
                    style={{ fontSize: 11, padding: '5px 11px', borderRadius: 4, border: '1px solid #FECACA', background: '#FEF2F2', color: '#DC2626', cursor: 'pointer', fontWeight: 600 }}
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
                        const isTaken = isSlotTaken(facility.id, slot.start, undefined, tanggal, currentUserIdent);
                        const isPicked = pickedSlots.includes(slot.start);

                        let stateClass = 'avail';
                        let statusText = 'Tersedia';

                        if (isTaken) {
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
                            disabled={isTaken}
                            onClick={() => handleSlotClick(slot)}
                            title={
                              isTaken
                                ? 'Slot sudah dikunci (sudah Anda pesan atau sudah disetujui untuk pemohon lain)'
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

            {/* Legend Sesuai Gambar Jadwal Ketersediaan */}
            <div className="sched-legend" style={{ borderTop: '1px solid #EBE7DF', paddingTop: 14, marginTop: 12 }}>
              <div className="leg"><span className="sq avail" />Tersedia untuk Reservasi</div>
              <div className="leg"><span className="sq picked" />Terpilih</div>
              <div className="leg"><span className="sq booked" />Terpakai / Sedang Dipesan</div>
              <div className="leg"><span className="sq passed" />Waktu Lewat / Tidak Aktif</div>
            </div>

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
                        fontSize: 12,
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
                      ⚠️ Rentang waktu ini bertabrakan dengan jadwal yang sudah disetujui / direservasi pada tanggal {tanggal}. Silakan pilih slot hijau yang tersedia.
                    </div>
                  ) : (
                    <div style={{ color: '#166534', fontSize: 14, marginTop: 4 }}>
                      Semua slot pada rentang ini berstatus tersedia dan siap diajukan untuk tanggal {tanggal}.
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
              {facility?.type?.toLowerCase() === 'alat' ? 'Jumlah Unit' : 'Estimasi Jumlah Peserta'}{' '}
              <span className="opt">(opsional)</span>
            </label>
            <input
              type="number"
              min={1}
              value={peserta}
              onChange={(e) => setPeserta(e.target.value)}
              placeholder={
                facility?.type?.toLowerCase() === 'alat'
                  ? 'Jumlah unit yang dipinjam'
                  : 'Perkiraan jumlah orang yang hadir'
              }
            />
            {overCapacity && (
              <span className="field-hint" style={{ color: '#DC2626', fontWeight: 600 }}>
                {facility?.type?.toLowerCase() === 'alat'
                  ? `Jumlah unit (${pesertaNum} unit) melebihi stok yang tersedia (${facility?.cap} unit).`
                  : `Jumlah peserta (${pesertaNum} org) melebihi kapasitas fasilitas (${facility?.cap} org).`}
              </span>
            )}
          </div>
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
