'use client';

import { Suspense, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppData } from '@/context/AppDataContext';
import ActionPromptModal, { ActionModalConfig } from '@/components/ActionPromptModal';

const KATEGORI_OPTIONS = [
  { value: 'AC/Pendingin', label: 'AC / Pendingin Ruangan' },
  { value: 'Elektronik', label: 'Elektronik (Audio Visual, Proyektor, Kelistrikan)' },
  { value: 'Kebersihan', label: 'Kebersihan & Sanitasi' },
  { value: 'Lainnya', label: 'Lainnya (Furnitur, Pintu, Bangunan, Fasilitas Lain)' },
];

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
  const [filePreview, setFilePreview] = useState('');
  const [fileType, setFileType] = useState<'image' | 'video' | null>(null);

  const [modalConfig, setModalConfig] = useState<ActionModalConfig>({
    isOpen: false,
    title: '',
    onConfirm: () => {},
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setModalConfig({
        isOpen: true,
        title: 'Ukuran File Terlalu Besar',
        subtitle: 'Batas ukuran file bukti kerusakan adalah 2MB sesuai standar sistem backend. Silakan gunakan foto yang lebih ringkas.',
        confirmText: 'Mengerti',
        confirmVariant: 'warning',
        showInput: false,
        onConfirm: () => {},
      });
      return;
    }

    setFileName(file.name);
    const isVid = file.type.startsWith('video/');
    setFileType(isVid ? 'video' : 'image');

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFilePreview(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  }

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

    submitReport({
      facilityId,
      kategori,
      deskripsi: deskripsi.trim(),
      foto: filePreview || fileName || undefined,
    });
    setDeskripsi('');
    setKategori('');
    setFileName('');
    setFilePreview('');
    setFileType(null);

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
              <option value="">— Pilih kategori kerusakan —</option>
              {KATEGORI_OPTIONS.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
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

          {/* Unggah Foto / Video Bukti Kerusakan (dengan preview seperti di Admin) */}
          <div className="fgroup full">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ margin: 0 }}>
                Foto / Video Bukti <span className="opt">(opsional)</span>
              </label>
              <span style={{ fontSize: 11, color: '#6B7280' }}>Format JPG, PNG (Maks. 2MB)</span>
            </div>

            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              {/* Preview Thumbnail Box matching Admin Kelola Fasilitas */}
              <div
                style={{
                  width: 140,
                  height: 95,
                  borderRadius: 6,
                  border: '1px solid #D5D0C7',
                  background: '#F9FAFB',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  flexShrink: 0,
                }}
              >
                {filePreview ? (
                  fileType === 'video' ? (
                    <video
                      src={filePreview}
                      controls
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <img
                      src={filePreview}
                      alt="Preview Bukti Kerusakan"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )
                ) : (
                  <div style={{ textAlign: 'center', color: '#9CA3AF', padding: 8 }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <div style={{ fontSize: 10, marginTop: 4 }}>Belum ada foto/video</div>
                  </div>
                )}
              </div>

              {/* Upload & Action Controls */}
              <div style={{ flex: 1, minWidth: 260, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '7px 14px',
                      fontSize: 12,
                      fontWeight: 600,
                      borderRadius: 6,
                      border: '1px solid #b59876',
                      background: '#15171a',
                      color: '#b59876',
                      cursor: 'pointer',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span>Upload Foto / Video</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                    />
                  </label>

                  {filePreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setFilePreview('');
                        setFileName('');
                        setFileType(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      style={{
                        padding: '7px 12px',
                        fontSize: 12,
                        borderRadius: 6,
                        border: '1px solid #FECACA',
                        background: '#FEF2F2',
                        color: '#DC2626',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      Hapus File
                    </button>
                  )}

                  {fileName && (
                    <span
                      style={{
                        fontSize: 11.5,
                        color: '#4B5563',
                        background: '#F3F4F6',
                        padding: '4px 10px',
                        borderRadius: 4,
                        border: '1px solid #E5E7EB',
                        maxWidth: 240,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={fileName}
                    >
                      📎 {fileName}
                    </span>
                  )}
                </div>

                <input
                  type="text"
                  placeholder="Atau tempel URL foto/video bukti langsung (contoh: https://...)"
                  value={filePreview.startsWith('data:') ? `(File diunggah: ${fileName})` : filePreview}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFilePreview(val);
                    setFileName(val ? 'Lampiran URL' : '');
                    setFileType(val.endsWith('.mp4') || val.endsWith('.webm') ? 'video' : 'image');
                  }}
                  style={{ fontSize: 12, padding: '7px 12px' }}
                />

                <span style={{ fontSize: 11, color: '#6B7280' }}>
                  Lampiran bukti visual akan otomatis dikirim ke petugas sarpras untuk mempercepat verifikasi dan perbaikan fasilitas.
                </span>
              </div>
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
