'use client';

import { Suspense, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppData } from '@/context/AppDataContext';

const KATEGORI_OPTIONS = ['Kelistrikan', 'Pendingin ruangan (AC)', 'Furnitur', 'Perangkat keras', 'Kebersihan', 'Lainnya'];

function LaporKerusakanContent() {
  const searchParams = useSearchParams();
  const { facilities, submitReport } = useAppData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const preselect = searchParams.get('facility');
  const [facilityId, setFacilityId] = useState(
    (preselect && facilities.some((f) => f.id === preselect) && preselect) || facilities[0]?.id || ''
  );
  const [kategori, setKategori] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [fileName, setFileName] = useState('');

  function handleSubmit() {
    if (!kategori) {
      alert('Pilih kategori kerusakan.');
      return;
    }
    if (!deskripsi.trim()) {
      alert('Isi deskripsi kerusakan.');
      return;
    }
    submitReport({ facilityId, kategori, deskripsi: deskripsi.trim() });
    setDeskripsi('');
    setKategori('');
    setFileName('');
    alert('Laporan kerusakan terkirim ke petugas.');
  }

  return (
    <div>
      <div className="content-head">
        <h2>Laporkan kerusakan</h2>
        <p>Isi form di bawah untuk melaporkan kerusakan atau masalah fasilitas.</p>
      </div>

      <div className="panel">
        <div className="form-grid">
          <div className="fgroup full">
            <label>Fasilitas</label>
            <select value={facilityId} onChange={(e) => setFacilityId(e.target.value)}>
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} — {f.loc}
                </option>
              ))}
            </select>
          </div>
          <div className="fgroup full">
            <label>Kategori kerusakan</label>
            <select value={kategori} onChange={(e) => setKategori(e.target.value)}>
              <option value="">— Pilih kategori —</option>
              {KATEGORI_OPTIONS.map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
          </div>
          <div className="fgroup full">
            <label>Deskripsi kerusakan</label>
            <textarea
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Jelaskan secara detail masalah atau kerusakan yang kamu temukan..."
            />
          </div>
          <div className="fgroup full">
            <label>Foto / video bukti <span className="opt">(opsional)</span></label>
            <div className="dropzone" onClick={() => fileInputRef.current?.click()}>
              <span className="dropzone-icon">📷</span>
              <div className="dropzone-text">
                {fileName ? <b>{fileName}</b> : 'Klik untuk upload foto atau video'}
              </div>
              <div className="dropzone-hint">Format: JPG, PNG, GIF, MP4, MOV, dll · Maks. 20MB</div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                style={{ display: 'none' }}
                onChange={(e) => setFileName(e.target.files?.[0]?.name || '')}
              />
            </div>
          </div>
        </div>
        <div className="btn-row" style={{ marginTop: 16 }}>
          <button className="btn primary" onClick={handleSubmit}>
            Kirim laporan
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LaporKerusakanPage() {
  return (
    <Suspense fallback={null}>
      <LaporKerusakanContent />
    </Suspense>
  );
}
