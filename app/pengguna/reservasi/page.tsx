'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppData } from '@/context/AppDataContext';
import { generateTimeSlots } from '@/lib/slots';

const SLOTS = generateTimeSlots();
const START_OPTIONS = SLOTS.map((s) => s.start);
const END_OPTIONS = SLOTS.map((s) => s.end);

function computeEndFromLast(lastSlot: string): string {
  const [h, m] = lastSlot.split(':').map(Number);
  return m === 30 ? `${String(h + 1).padStart(2, '0')}:00` : `${String(h).padStart(2, '0')}:30`;
}

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
  const [pickedSlots, setPickedSlots] = useState<string[]>([]);

  const facility = facilities.find((f) => f.id === facilityId);

  // Dua arah: dropdown "Dari/Sampai jam" selalu mencerminkan slot yang
  // sedang terpilih, baik dipilih lewat dropdown maupun klik langsung.
  const sortedPicked = useMemo(() => [...pickedSlots].sort(), [pickedSlots]);
  const rangeStart = sortedPicked[0] || '';
  const rangeEnd = sortedPicked.length ? computeEndFromLast(sortedPicked[sortedPicked.length - 1]) : '';

  function toggleSlot(slot: string) {
    setPickedSlots((prev) => (prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]));
  }

  function handleFacilityChange(id: string) {
    setFacilityId(id);
    setPickedSlots([]);
  }

  function applyRange(start: string, end: string) {
    if (!start || !end || end <= start || !facility) return;
    const rangeSlots = SLOTS.filter((s) => s.start >= start && s.start < end).map((s) => s.start);
    const conflict = rangeSlots.some((s) => isSlotTaken(facility.id, s));
    if (conflict) {
      alert('Rentang jam ini bentrok dengan slot yang sudah terpakai. Coba rentang lain, atau pilih slot satu per satu di bawah.');
      return;
    }
    setPickedSlots(rangeSlots);
  }

  const pesertaNum = parseInt(peserta, 10) || 0;
  const overCapacity = !!facility && pesertaNum > facility.cap;

  function handleSubmit() {
    if (!facility) return;
    if (sortedPicked.length === 0) {
      alert('Pilih minimal satu slot waktu.');
      return;
    }
    if (!tujuan.trim()) {
      alert('Isi tujuan penggunaan.');
      return;
    }
    if (overCapacity && !confirm(`Estimasi peserta (${pesertaNum}) melebihi kapasitas fasilitas (${facility.cap} orang). Tetap ajukan?`)) {
      return;
    }

    submitReservation({
      facilityId: facility.id,
      tanggal,
      start: rangeStart,
      end: rangeEnd,
      tujuan: tujuan.trim(),
      peserta: pesertaNum || undefined,
    });
    setPickedSlots([]);
    setTujuan('');
    setPeserta('');
    alert('Reservasi diajukan. Slot dikunci sementara 10 menit dan menunggu persetujuan petugas.');
  }

  return (
    <div>
      <div className="content-head">
        <h2>Ajukan reservasi</h2>
        <p>Isi form di bawah. Pengajuan akan diverifikasi oleh petugas fasilitas.</p>
      </div>

      <div className="alert info">
        Jam operasional: <b>07.00–20.00</b> · Slot waktu kelipatan <b>30 menit</b> · Slot yang kamu pilih
        dikunci sementara 10 menit selama pengisian formulir ini.
      </div>

      <div className="panel">
        <div className="form-grid">
          <div className="fgroup">
            <label>Fasilitas</label>
            <select value={facilityId} onChange={(e) => handleFacilityChange(e.target.value)}>
              {availableFacilities.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} — {f.loc} (maks. {f.cap} org)
                </option>
              ))}
            </select>
          </div>
          <div className="fgroup">
            <label>Tanggal</label>
            <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
          </div>

          <div className="fgroup">
            <label>Jam mulai</label>
            <select value={rangeStart} onChange={(e) => applyRange(e.target.value, rangeEnd || END_OPTIONS.find((t) => t > e.target.value) || '')}>
              <option value="">— Pilih —</option>
              {START_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="fgroup">
            <label>Jam selesai</label>
            <select value={rangeEnd} onChange={(e) => applyRange(rangeStart, e.target.value)} disabled={!rangeStart}>
              <option value="">— Pilih —</option>
              {END_OPTIONS.filter((t) => !rangeStart || t > rangeStart).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="fgroup full">
            <label>Atau pilih slot langsung (30 menit) — bisa lebih dari satu berurutan</label>
            <div className="slot-mini">
              {facility &&
                SLOTS.map((slot) => {
                  const taken = isSlotTaken(facility.id, slot.start);
                  const cls = taken ? 'taken' : pickedSlots.includes(slot.start) ? 'avail picked' : 'avail';
                  return (
                    <button
                      key={slot.start}
                      type="button"
                      className={cls}
                      disabled={taken}
                      onClick={() => toggleSlot(slot.start)}
                    >
                      {slot.start}
                    </button>
                  );
                })}
            </div>
            {sortedPicked.length > 0 && (
              <div className="hint">
                Terpilih: <b>{rangeStart} – {rangeEnd}</b> ({sortedPicked.length} slot)
              </div>
            )}
          </div>

          <div className="fgroup full">
            <label>Tujuan penggunaan</label>
            <textarea
              value={tujuan}
              onChange={(e) => setTujuan(e.target.value)}
              placeholder="Contoh: Rapat koordinasi panitia ospek, seminar jurusan, latihan paduan suara..."
            />
          </div>

          <div className="fgroup">
            <label>Estimasi jumlah peserta <span className="opt">(opsional)</span></label>
            <input
              type="number"
              min={1}
              value={peserta}
              onChange={(e) => setPeserta(e.target.value)}
              placeholder="Perkiraan jumlah orang"
            />
            {overCapacity && (
              <span className="field-hint" style={{ color: '#c2740a', fontWeight: 600 }}>
                Melebihi kapasitas maksimum fasilitas ini ({facility?.cap} orang).
              </span>
            )}
          </div>
        </div>
        <div className="btn-row" style={{ marginTop: 16 }}>
          <button className="btn primary" onClick={handleSubmit}>
            Ajukan reservasi
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
