'use client';

import { Suspense, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppData } from '@/context/AppDataContext';
import ActionPromptModal, { ActionModalConfig } from '@/components/ActionPromptModal';

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

  const [modalConfig, setModalConfig] = useState<ActionModalConfig>({
    isOpen: false,
    title: '',
    onConfirm: () => {},
  });

  function handleSubmit() {
    if (!kategori) {
      setModalConfig({
        isOpen: true,
        title: 'Pilih Kategori Kerusakan',
        subtitle: 'Silakan tentukan jenis atau kategori kerusakan yang dialami fasilitas.',
        confirmText: 'Mengerti',
        confirmVariant: 'warning',
        showInput: false,
        onConfirm: () => {},
      });
      return;
    }
    if (!deskripsi.trim()) {
      setModalConfig({
        isOpen: true,
        title: 'Deskripsi Kerusakan Belum Diisi',
        subtitle: 'Jelaskan secara detail kendala atau kerusakan yang Anda temukan agar petugas dapat menindaklanjuti.',
        confirmText: 'Lengkapi Data',
        confirmVariant: 'warning',
        showInput: false,
        onConfirm: () => {},
      });
      return;
    }

    submitReport({ facilityId, kategori, deskripsi: deskripsi.trim(), foto: fileName || undefined });
    setDeskripsi('');
    setKategori('');
    setFileName('');

    setModalConfig({
      isOpen: true,
      title: 'Laporan Kerusakan Terkirim',
      subtitle: 'Terima kasih atas laporan Anda. Laporan kerusakan telah masuk ke sistem dan akan segera ditindaklanjuti oleh petugas sarpras.',
      confirmText: 'Selesai',
      confirmVariant: 'primary',
      showInput: false,
      onConfirm: () => {},
    });
  }

  return (
    <div>
      <div className="content-head">
        <h2>LAPORKAN KERUSAKAN FASILITAS</h2>
        <p>Isi formulir di bawah dengan bukti foto/video untuk mempercepat tindak lanjut perbaikan sarpras Universitas Diponegoro.</p>
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

      <ActionPromptModal
        config={modalConfig}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
      />
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
