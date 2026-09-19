'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppData } from '@/context/AppDataContext';
import { generateTimeSlots, currentHHMM } from '@/lib/slots';
import { TimeSlot } from '@/models/facility';

const SLOTS = generateTimeSlots();
const START_OPTIONS = SLOTS.map((s) => s.start); // '07:00' to '19:30'
const END_OPTIONS = SLOTS.map((s) => s.end);     // '07:30' to '20:00' (includes 20:00)

// 4 Periode waktu yang persis sama dengan halaman Jadwal Ketersediaan
const PERIODS = [
  { label: 'PAGI', from: '07:00', to: '10:00' },
  { label: 'SIANG', from: '10:00', to: '13:00' },
  { label: 'SORE', from: '13:00', to: '16:00' },
  { label: 'MALAM', from: '16:00', to: '20:00' },
];

function AjukanReservasiContent() {
  const searchParams = useSearchParams();
  const { facilities, isSlotTaken, submitReservation } = useAppData();
  const availableFacilities = facilities.filter((f) => f.status !== 'repair');

  const preselect = searchParams.get('facility');
  const [facilityId, setFacilityId] = useState(
    (preselect && availableFacilities.some((f) => f.id === preselect) && preselect) ||
      availableFacilities[0]?.id ||
      ''
  );
  const [tanggal, setTanggal] = useState('2026-09-18');
  const [tujuan, setTujuan] = useState('');
  const [peserta, setPeserta] = useState('');

  // Jam Mulai dan Jam Selesai yang independen dan presisi
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');

  const facility = facilities.find((f) => f.id === facilityId);

  // Daftar slot start yang berada dalam rentang [startTime, endTime)
  const pickedSlots = useMemo(() => {
    if (!startTime || !endTime || endTime <= startTime) return [];
    return SLOTS.filter((s) => s.start >= startTime && s.start < endTime).map((s) => s.start);
  }, [startTime, endTime]);

  // Cek bentrok terhadap slot yang dipilih
  const conflictSlots = useMemo(() => {
    if (!facility || pickedSlots.length === 0) return [];
    return pickedSlots.filter((slotStart) => isSlotTaken(facility.id, slotStart));
  }, [facility, pickedSlots, isSlotTaken]);

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
  }

  // Interaksi klik kartu slot yang cerdas & sinkron dengan periode
  function handleSlotClick(slot: TimeSlot) {
    if (!facility || isSlotTaken(facility.id, slot.start)) return;

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

  function handleSubmit() {
    if (!facility) return;
    if (!startTime || !endTime || pickedSlots.length === 0) {
      alert('Silakan pilih jam mulai dan jam selesai (minimal 1 slot 30 menit).');
      return;
    }
    if (hasConflict) {
      alert('Rentang jam yang dipilih bentrok dengan jadwal lain yang sudah terpakai. Silakan pilih rentang yang tersedia.');
      return;
    }
    if (!tujuan.trim()) {
      alert('Silakan isi tujuan penggunaan fasilitas.');
      return;
    }
    if (overCapacity && !confirm(`Estimasi peserta (${pesertaNum}) melebihi kapasitas fasilitas (${facility.cap} orang). Tetap ajukan?`)) {
      return;
    }

    submitReservation({
      facilityId: facility.id,
      tanggal,
      start: startTime,
      end: endTime,
      tujuan: tujuan.trim(),
      peserta: pesertaNum || undefined,
    });

    setStartTime('');
    setEndTime('');
    setTujuan('');
    setPeserta('');
    alert(`Reservasi berhasil diajukan untuk ${facility.name} (${tanggal}, ${startTime}–${endTime} WIB). Menunggu persetujuan petugas sarpras.`);
  }

  return (
    <div>
      <div className="content-head">
        <h2>AJUKAN RESERVASI FASILITAS</h2>
        <p>Isi formulir untuk permohonan peminjaman fasilitas Universitas Diponegoro. Verifikasi dilakukan oleh petugas sarpras.</p>
      </div>

      <div className="alert info">
        Jam operasional kampus: <b>07.00 – 20.00 WIB</b> · Durasi kelipatan <b>30 menit</b> · Slot dikunci sementara selama pengisian formulir.
      </div>

      <div className="panel">
        <div className="form-grid">
          {/* Facility Selection */}
          <div className="fgroup">
            <label>Fasilitas</label>
            <select value={facilityId} onChange={(e) => handleFacilityChange(e.target.value)}>
              {availableFacilities.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} — {f.loc} (maks. {f.cap} orang)
                </option>
              ))}
            </select>
          </div>

          {/* Date Selection */}
          <div className="fgroup">
            <label>Tanggal Peminjaman</label>
            <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
          </div>

          {/* Start Time Dropdown */}
          <div className="fgroup">
            <label>Jam Mulai</label>
            <select value={startTime} onChange={(e) => handleStartChange(e.target.value)}>
              <option value="">— Pilih Jam Mulai —</option>
              {START_OPTIONS.map((t) => (
                <option key={t} value={t}>{t} WIB</option>
              ))}
            </select>
          </div>

          {/* End Time Dropdown (includes 20:00) */}
          <div className="fgroup">
            <label>Jam Selesai (Hingga 20:00 WIB)</label>
            <select
              value={endTime}
              onChange={(e) => handleEndChange(e.target.value)}
              disabled={!startTime}
            >
              <option value="">— Pilih Jam Selesai —</option>
              {END_OPTIONS.filter((t) => !startTime || t > startTime).map((t) => (
                <option key={t} value={t}>{t} WIB</option>
              ))}
            </select>
          </div>

          {/* Slot Grid Section Grouped by Period (PAGI, SIANG, SORE, MALAM) */}
          <div className="fgroup full" style={{ marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
              <div>
                <label style={{ margin: 0, fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#181D24' }}>
                  PILIH SLOT WAKTU (07.00 – 20.00 WIB)
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
                  4 Jam (Setengah Hari)
                </button>
                <button
                  type="button"
                  onClick={applyFullDay}
                  style={{ fontSize: 11, padding: '5px 11px', borderRadius: 4, border: '1px solid #b59876', background: '#15171a', color: '#b59876', cursor: 'pointer', fontWeight: 700 }}
                >
                  Seharian (07:00 – 20:00)
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
                        const isTaken = isSlotTaken(facility.id, slot.start);
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
                            title={isTaken ? 'Slot sudah terpakai' : `${slot.start} – ${slot.end} WIB (Klik untuk memilih)`}
                          >
                            <span className="slot-bar" />
                            <div className="slot-lg-body">
                              <div className="t">{slot.start}–{slot.end}</div>
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
                  padding: '14px 20px',
                  borderRadius: 4,
                  border: hasConflict ? '1px solid #FECACA' : '1px solid #BBF7D0',
                  background: hasConflict ? '#FEF2F2' : '#F0FDF4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 10,
                }}
              >
                <div>
                  <span style={{ fontSize: 13, color: '#1F2937' }}>
                    Jadwal Terpilih:{' '}
                    <strong style={{ fontSize: 15, color: hasConflict ? '#DC2626' : '#15803D' }}>
                      {startTime} – {endTime} WIB
                    </strong>{' '}
                    ({pickedSlots.length} slot · {(pickedSlots.length * 0.5).toFixed(1)} jam)
                  </span>
                  {hasConflict && (
                    <div style={{ color: '#DC2626', fontSize: 12, fontWeight: 600, marginTop: 4 }}>
                      ⚠️ Terdapat slot yang bentrok pada rentang jam ini. Silakan pilih rentang jam lain yang tersedia.
                    </div>
                  )}
                </div>
                {!hasConflict && (
                  <span style={{ color: '#166534', fontSize: 12, fontWeight: 600, background: '#DCFCE7', padding: '6px 12px', borderRadius: 4 }}>
                    ✓ Ketersediaan Aman
                  </span>
                )}
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

          {/* Number of participants */}
          <div className="fgroup">
            <label>Estimasi Jumlah Peserta <span className="opt">(opsional)</span></label>
            <input
              type="number"
              min={1}
              value={peserta}
              onChange={(e) => setPeserta(e.target.value)}
              placeholder="Perkiraan jumlah orang yang hadir"
            />
            {overCapacity && (
              <span className="field-hint" style={{ color: '#DC2626', fontWeight: 600 }}>
                Jumlah peserta ({pesertaNum} org) melebihi kapasitas fasilitas ({facility?.cap} org).
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
            disabled={hasConflict || !startTime || !endTime}
          >
            Ajukan Reservasi
          </button>
        </div>
      </div>
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
