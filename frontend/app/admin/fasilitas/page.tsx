'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppData } from '@/context/AppDataContext';
import { Facility } from '@/models/facility';
import ActionPromptModal, { ActionModalConfig } from '@/components/ActionPromptModal';
import {
  DEFAULT_ROOM_CATEGORIES,
  DEFAULT_ALAT_CATEGORIES,
  isAlatFacility,
  isRuanganFacility,
} from '@/models/facilities-data';

const BLANK_FORM = {
  nama: '',
  tipeSarana: 'ruangan' as 'ruangan' | 'alat',
  tipeSelect: DEFAULT_ROOM_CATEGORIES[0],
  tipeCustom: '',
  lokasi: '',
  kapasitas: '',
  deskripsi: '',
  kelengkapan: '',
  image: '',
};

function KelolaFasilitasContent() {
  const {
    facilities,
    addFacility,
    updateFacility,
    deleteFacility,
    setFacilityStatus,
    refreshFacilities,
  } = useAppData();

  const searchParams = useSearchParams();
  const tipeParam = searchParams.get('tipe');

  useEffect(() => {
    refreshFacilities();
  }, [refreshFacilities]);

  const [tabType, setTabType] = useState<'semua' | 'ruangan' | 'alat'>(() => {
    if (tipeParam === 'alat') return 'alat';
    if (tipeParam === 'ruangan') return 'ruangan';
    return 'semua';
  });
  const [filterCategory, setFilterCategory] = useState<string>('semua');
  const [searchQuery, setSearchQuery] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(BLANK_FORM);

  const [modalConfig, setModalConfig] = useState<ActionModalConfig>({
    isOpen: false,
    title: '',
    onConfirm: () => {},
  });

  // Dynamic type options separated strictly by sarana type (ruangan vs alat)
  const roomTypeOptions = useMemo(() => {
    const existing = Array.from(new Set(facilities.filter(isRuanganFacility).map((f) => f.type))).filter(Boolean);
    return Array.from(new Set([...DEFAULT_ROOM_CATEGORIES, ...existing]));
  }, [facilities]);

  const alatTypeOptions = useMemo(() => {
    const existing = Array.from(new Set(facilities.filter(isAlatFacility).map((f) => f.type))).filter(Boolean);
    return Array.from(new Set([...DEFAULT_ALAT_CATEGORIES, ...existing]));
  }, [facilities]);

  const currentTypeOptions = form.tipeSarana === 'alat' ? alatTypeOptions : roomTypeOptions;

  function handleTipeSaranaChange(newTipe: 'ruangan' | 'alat') {
    const options = newTipe === 'alat' ? alatTypeOptions : roomTypeOptions;
    setForm((f) => ({
      ...f,
      tipeSarana: newTipe,
      tipeSelect: options[0] || '+baru',
      tipeCustom: '',
    }));
  }

  const countRuangan = facilities.filter(isRuanganFacility).length;
  const countAlat = facilities.filter(isAlatFacility).length;

  // Category filter options for master table
  const tableCategoryOptions = useMemo(() => {
    if (tabType === 'ruangan') {
      return [{ value: 'semua', label: 'Semua Kategori Ruangan' }, ...roomTypeOptions.map((c) => ({ value: c, label: c }))];
    } else if (tabType === 'alat') {
      return [{ value: 'semua', label: 'Semua Kategori Alat' }, ...alatTypeOptions.map((c) => ({ value: c, label: c }))];
    }
    const all = Array.from(new Set([...roomTypeOptions, ...alatTypeOptions]));
    return [{ value: 'semua', label: 'Semua Kategori' }, ...all.map((c) => ({ value: c, label: c }))];
  }, [tabType, roomTypeOptions, alatTypeOptions]);

  // Filtered facilities for master table
  const filteredFacilities = facilities.filter((f) => {
    const isAlat = isAlatFacility(f);
    if (tabType === 'ruangan' && isAlat) return false;
    if (tabType === 'alat' && !isAlat) return false;
    if (filterCategory !== 'semua' && f.type !== filterCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = f.name.toLowerCase().includes(q);
      const matchLoc = f.loc.toLowerCase().includes(q);
      const matchType = f.type.toLowerCase().includes(q);
      return matchName || matchLoc || matchType;
    }
    return true;
  });

  function startEdit(f: Facility) {
    if (f.refId === undefined || !f.tipe) {
      setModalConfig({
        isOpen: true,
        title: 'Data Tidak Lengkap',
        subtitle: `Data "${f.name}" tidak memiliki referensi backend sehingga tidak bisa diubah.`,
        confirmText: 'Mengerti',
        confirmVariant: 'warning',
        showInput: false,
        onConfirm: () => {},
      });
      return;
    }
    setEditingId(f.id);
    const targetOptions = f.tipe === 'alat' ? alatTypeOptions : roomTypeOptions;
    const isKnown = targetOptions.includes(f.type);
    setForm({
      nama: f.name,
      tipeSarana: f.tipe,
      tipeSelect: isKnown ? f.type : '+baru',
      tipeCustom: isKnown ? '' : f.type,
      lokasi: f.loc,
      kapasitas: String(f.cap),
      deskripsi: f.desc,
      kelengkapan: (f.amenities || []).join(', '),
      image: f.image || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(BLANK_FORM);
  }

  function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      setModalConfig({
        isOpen: true,
        title: 'Ukuran Foto Terlalu Besar',
        subtitle: 'Batas ukuran foto fasilitas adalah 4MB. Silakan gunakan foto yang lebih ringkas.',
        confirmText: 'Mengerti',
        confirmVariant: 'warning',
        showInput: false,
        onConfirm: () => {},
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setForm((prev) => ({ ...prev, image: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  }

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (isSubmitting) return;
    if (!form.nama.trim() || !form.lokasi.trim()) {
      setModalConfig({
        isOpen: true,
        title: 'Lengkapi Data Fasilitas',
        subtitle: 'Nama dan lokasi fasilitas wajib diisi sebelum menyimpan data.',
        confirmText: 'Lengkapi',
        confirmVariant: 'warning',
        showInput: false,
        onConfirm: () => {},
      });
      return;
    }

    const finalType = form.tipeSelect === '+baru' ? form.tipeCustom.trim() : form.tipeSelect.trim();
    if (!finalType) {
      setModalConfig({
        isOpen: true,
        title: 'Tipe Fasilitas Wajib Diisi',
        subtitle: 'Silakan pilih tipe fasilitas atau ketik nama tipe pada opsi Lainnya.',
        confirmText: 'Lengkapi',
        confirmVariant: 'warning',
        showInput: false,
        onConfirm: () => {},
      });
      return;
    }

    const amenitiesList = form.kelengkapan
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      name: form.nama.trim(),
      type: finalType,
      loc: form.lokasi.trim(),
      cap: parseInt(form.kapasitas, 10) || 1,
      desc: form.deskripsi.trim(),
      amenities: amenitiesList,
      image: form.image.trim() || undefined,
    };

    if (editingId) {
      setIsSubmitting(true);
      try {
        const res = await updateFacility(editingId, payload);
        if (!res.ok) {
          setModalConfig({
            isOpen: true,
            title: 'Gagal Mengubah Fasilitas',
            subtitle: res.message || 'Data fasilitas tidak dapat diproses.',
            confirmText: 'Mengerti',
            confirmVariant: 'danger',
            showInput: false,
            onConfirm: () => {},
          });
          return;
        }
        setModalConfig({
          isOpen: true,
          title: 'Fasilitas Diperbarui',
          subtitle: `"${payload.name}" tersimpan di database backend.`,
          confirmText: 'Selesai',
          confirmVariant: 'primary',
          showInput: false,
          onConfirm: () => {},
        });
        cancelEdit();
      } finally {
        setIsSubmitting(false);
      }
      return;
    }
    // Tambah via backend (desc/amenities/image tidak punya kolom backend).
    setIsSubmitting(true);
    try {
      const res = await addFacility({ ...payload, tipeSarana: form.tipeSarana });
      if (!res.ok) {
        setModalConfig({
          isOpen: true,
          title: 'Gagal Menambah Fasilitas',
          subtitle: res.message || 'Data fasilitas tidak dapat diproses.',
          confirmText: 'Mengerti',
          confirmVariant: 'danger',
          showInput: false,
          onConfirm: () => {},
        });
        return;
      }
      setModalConfig({
        isOpen: true,
        title: 'Fasilitas Ditambahkan',
        subtitle: `"${payload.name}" tersimpan di database backend. Deskripsi, kelengkapan, dan foto tidak memiliki kolom backend sehingga hanya tampil lokal sementara.`,
        confirmText: 'Selesai',
        confirmVariant: 'primary',
        showInput: false,
        onConfirm: () => {},
      });
      cancelEdit();
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleDelete(f: Facility) {
    // Hapus = nonaktifkan via backend (soft delete, FK reservasi/laporan aman).
    if (f.refId === undefined || !f.tipe) {
      setModalConfig({
        isOpen: true,
        title: 'Data Tidak Lengkap',
        subtitle: `Data "${f.name}" tidak memiliki referensi backend sehingga tidak bisa dinonaktifkan.`,
        confirmText: 'Mengerti',
        confirmVariant: 'warning',
        showInput: false,
        onConfirm: () => {},
      });
      return;
    }
    setModalConfig({
      isOpen: true,
      title: 'Nonaktifkan Fasilitas',
      subtitle: `"${f.name}" akan dinonaktifkan (status Nonaktif). Riwayat reservasi dan laporan yang merujuknya tetap terjaga. Lanjutkan?`,
      confirmText: 'Nonaktifkan',
      confirmVariant: 'danger',
      showInput: false,
      onConfirm: () => {
        void deleteFacility(f.id).then((res) => {
          if (!res.ok) {
            setModalConfig({
              isOpen: true,
              title: 'Gagal Menonaktifkan',
              subtitle: res.message || 'Data fasilitas tidak dapat diproses.',
              confirmText: 'Mengerti',
              confirmVariant: 'danger',
              showInput: false,
              onConfirm: () => {},
            });
          }
        });
      },
    });
  }

  return (
    <div>
      <div className="content-head">
        <h2>Kelola data fasilitas</h2>
        <p>Tambah, ubah, dan nonaktifkan fasilitas kampus Universitas Diponegoro.</p>
      </div>

      <div className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#181D24' }}>
            {editingId ? 'Ubah data fasilitas' : 'Tambah fasilitas baru'}
          </h3>
          {editingId && (
            <span style={{ fontSize: 14, color: '#b59876', fontWeight: 600 }}>
              Mode Pengeditan Aktif
            </span>
          )}
        </div>

        <div className="form-grid">
          {/* Nama Fasilitas */}
          <div className="fgroup">
            <label>Nama fasilitas *</label>
            <input
              placeholder="Contoh: Ruang Kuliah A101 / Studio Multimedia"
              value={form.nama}
              onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))}
              required
            />
          </div>

          {/* Jenis Sarana (menentukan endpoint backend) */}
          <div className="fgroup">
            <label>Jenis sarana *</label>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '8px 0' }}>
              {(['ruangan', 'alat'] as const).map((t) => (
                <label key={t} style={{ display: 'inline-flex', gap: 6, alignItems: 'center', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="tipeSarana"
                    checked={form.tipeSarana === t}
                    onChange={() => handleTipeSaranaChange(t)}
                  />
                  {t === 'ruangan' ? 'Ruangan' : 'Alat'}
                </label>
              ))}
            </div>
          </div>

          {/* Tipe Fasilitas (Kategori Ruangan vs Kategori Alat) */}
          <div className="fgroup">
            <label>{form.tipeSarana === 'alat' ? 'Kategori Alat *' : 'Kategori Ruangan *'}</label>
            <select
              value={form.tipeSelect}
              onChange={(e) => setForm((f) => ({ ...f, tipeSelect: e.target.value }))}
            >
              {currentTypeOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
              <option value="+baru">+ Tambah Kategori Baru...</option>
            </select>
            {form.tipeSelect === '+baru' && (
              <input
                style={{ marginTop: 8 }}
                placeholder={form.tipeSarana === 'alat' ? 'Ketik kategori alat baru, contoh: Sound System, Drone, dsb.' : 'Ketik kategori ruangan baru, contoh: Studio, Coworking Space, dsb.'}
                value={form.tipeCustom}
                onChange={(e) => setForm((f) => ({ ...f, tipeCustom: e.target.value }))}
                required
              />
            )}
          </div>

          {/* Lokasi / Gedung */}
          <div className="fgroup">
            <label>Lokasi / Gedung *</label>
            <input
              value={form.lokasi}
              onChange={(e) => setForm((f) => ({ ...f, lokasi: e.target.value }))}
              placeholder={form.tipeSarana === 'alat' ? 'Contoh: Ruang Pengelola Sarpras / Gedung TI' : 'Contoh: Gedung A / Gedung FSM'}
              required
            />
          </div>

          {/* Kapasitas / Jumlah Tersedia */}
          <div className="fgroup">
            <label>{form.tipeSarana === 'alat' ? 'Jumlah Unit Tersedia *' : 'Kapasitas Ruangan (orang) *'}</label>
            <input
              type="number"
              min={1}
              value={form.kapasitas}
              onChange={(e) => setForm((f) => ({ ...f, kapasitas: e.target.value }))}
              placeholder={form.tipeSarana === 'alat' ? 'Contoh: 5' : 'Contoh: 45'}
            />
          </div>

          {/* Kelengkapan Fasilitas (Amenities) */}
          <div className="fgroup full">
            <label>Kelengkapan Fasilitas (Fasilitas Pendukung)</label>
            <input
              placeholder="Contoh: AC Sentral, Proyektor HD, Whiteboard, Sound System, Mikrofon Nirkabel"
              value={form.kelengkapan}
              onChange={(e) => setForm((f) => ({ ...f, kelengkapan: e.target.value }))}
            />
            {/* Quick Suggestion Chips */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 13.5, color: '#9CA3AF', fontWeight: 600 }}>Pilihan cepat:</span>
              {[
                'AC Sentral',
                'Proyektor HD',
                'Whiteboard',
                'Sound System',
                'Mikrofon Nirkabel',
                'WiFi Dedicated',
                'Smart TV Interaktif',
                'Lantai Parquet',
                'Papan Skor Digital',
                'Kabel HDMI & Converter',
              ].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    const current = form.kelengkapan
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean);
                    if (!current.includes(item)) {
                      const updated = [...current, item].join(', ');
                      setForm((f) => ({ ...f, kelengkapan: updated }));
                    }
                  }}
                  style={{
                    padding: '3px 8px',
                    fontSize: 13.5,
                    borderRadius: 4,
                    border: '1px solid #E5E0D8',
                    background: '#F9FAFB',
                    color: '#4B5563',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  + {item}
                </button>
              ))}
            </div>
          </div>

          {/* Unggah Foto / Gambar Fasilitas & Denah */}
          <div className="fgroup full">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ margin: 0 }}>Foto Fasilitas / Gambar Denah Ruangan</label>
            </div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              {/* Preview Thumbnail */}
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
                {form.image ? (
                  <img
                    src={form.image}
                    alt="Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', color: '#9CA3AF', padding: 8 }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <div style={{ fontSize: 12.5, marginTop: 4 }}>Belum ada foto</div>
                  </div>
                )}
              </div>

              {/* Upload & URL Controls */}
              <div style={{ flex: 1, minWidth: 260, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '7px 14px',
                      fontSize: 14,
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
                    <span>Upload Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleImageFile}
                    />
                  </label>

                  {form.image && (
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, image: '' }))}
                      style={{
                        padding: '7px 12px',
                        fontSize: 14,
                        borderRadius: 6,
                        border: '1px solid #FECACA',
                        background: '#FEF2F2',
                        color: '#DC2626',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      Hapus Foto
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  placeholder="Atau tempel URL foto langsung (contoh: https://images.unsplash.com/...)"
                  value={form.image.startsWith('data:') ? '(Foto file diunggah)' : form.image}
                  onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))}
                  style={{ fontSize: 14, padding: '7px 12px' }}
                />
                <span style={{ fontSize: 13.5, color: '#6B7280' }}>
                  Foto atau denah ruangan akan langsung ditampilkan di Katalog Fasilitas, kartu detail, dan visual Floor Plans di Beranda.
                </span>
              </div>
            </div>
          </div>

          {/* Deskripsi */}
          <div className="fgroup full">
            <label>Deskripsi Fasilitas</label>
            <textarea
              rows={3}
              value={form.deskripsi}
              onChange={(e) => setForm((f) => ({ ...f, deskripsi: e.target.value }))}
              placeholder="Deskripsikan fungsi, peralatan, atau keunggulan fasilitas ini..."
            />
          </div>
        </div>

        <div className="btn-row" style={{ marginTop: 16 }}>
          <button className="btn primary" onClick={() => void handleSubmit()} disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan…' : editingId ? 'Simpan perubahan' : 'Simpan fasilitas'}
          </button>
          <button className="btn" onClick={cancelEdit}>
            {editingId ? 'Batal' : 'Reset'}
          </button>
        </div>
      </div>

      {/* Tabel Master Fasilitas */}
      <div className="panel table-scroll" style={{ padding: 0 }}>
        {/* Sub-tab Switcher: Semua, Ruangan, Alat */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            padding: '16px 20px 12px',
            borderBottom: '1px solid #E5E0D8',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setTabType('semua');
              setFilterCategory('semua');
            }}
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              border: tabType === 'semua' ? '1px solid #181D24' : '1px solid #D5D0C7',
              background: tabType === 'semua' ? '#181D24' : '#FFFFFF',
              color: tabType === 'semua' ? '#FFFFFF' : '#4B5563',
              transition: 'all 0.15s ease',
            }}
          >
            Semua Fasilitas ({facilities.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setTabType('ruangan');
              setFilterCategory('semua');
            }}
            style={{
              padding: '8px 16px',
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
            Fasilitas Ruangan ({countRuangan})
          </button>
          <button
            type="button"
            onClick={() => {
              setTabType('alat');
              setFilterCategory('semua');
            }}
            style={{
              padding: '8px 16px',
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
            Fasilitas Alat ({countAlat})
          </button>
        </div>

        {/* Filter Bar: Kategori & Search */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 20px',
            borderBottom: '1px solid #E5E0D8',
            flexWrap: 'wrap',
            gap: 12,
            background: '#FAF8F5',
          }}
        >
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: '#374151' }}>Filter Kategori:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{
                padding: '6px 12px',
                fontSize: 13,
                borderRadius: 6,
                border: '1px solid #D5D0C7',
                background: '#FFFFFF',
              }}
            >
              {tableCategoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Cari fasilitas / gedung..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '6px 12px',
                fontSize: 13,
                borderRadius: 6,
                border: '1px solid #D5D0C7',
                minWidth: 220,
                background: '#FFFFFF',
              }}
            />
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Tipe</th>
              <th>Fasilitas</th>
              <th>Kategori</th>
              <th>Lokasi</th>
              <th>Kapasitas / Jumlah</th>
              <th>Status Operasional</th>
              <th style={{ textAlign: 'left' }}>Tindakan</th>
            </tr>
          </thead>
          <tbody>
            {filteredFacilities.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: '#6B7280', padding: 28 }}>
                  Tidak ada fasilitas {tabType === 'ruangan' ? 'ruangan' : tabType === 'alat' ? 'alat' : ''} yang sesuai dengan filter.
                </td>
              </tr>
            ) : (
              filteredFacilities.map((f) => {
                const isAlat = isAlatFacility(f);

                return (
                  <tr key={f.id}>
                    {/* Tipe Badge */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 12,
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: 4,
                          background: isAlat ? '#FEF3C7' : '#EFF6FF',
                          color: isAlat ? '#92400E' : '#1E40AF',
                          border: isAlat ? '1px solid #FDE68A' : '1px solid #DBEAFE',
                        }}
                      >
                        {isAlat ? 'Alat' : 'Ruangan'}
                      </span>
                    </td>

                    {/* Foto & Nama */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                          style={{
                            width: 44,
                            height: 34,
                            borderRadius: 4,
                            overflow: 'hidden',
                            background: '#15171a',
                            flexShrink: 0,
                            border: '1px solid #D5D0C7',
                          }}
                        >
                          {f.image ? (
                            <img
                              src={f.image}
                              alt={f.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <div
                              style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#b59876',
                                fontSize: 12.5,
                                fontWeight: 700,
                              }}
                            >
                              UNDIP
                            </div>
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#181D24' }}>{f.name}</div>
                          <div style={{ fontSize: 13.5, color: '#6B7280', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {f.desc}
                          </div>
                          {f.amenities && f.amenities.length > 0 && (
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                              {f.amenities.slice(0, 3).map((am, idx) => (
                                <span
                                  key={idx}
                                  style={{
                                    fontSize: 12.5,
                                    padding: '1px 5px',
                                    borderRadius: 3,
                                    background: '#F5EFEB',
                                    color: '#8A6D4B',
                                    fontWeight: 500,
                                  }}
                                >
                                  {am}
                                </span>
                              ))}
                              {f.amenities.length > 3 && (
                                <span style={{ fontSize: 12.5, color: '#9CA3AF' }}>+{f.amenities.length - 3}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#b59876', fontSize: 13 }}>{f.type}</span>
                    </td>
                    <td>{f.loc}</td>
                    <td>{isAlat ? f.tersedia ?? f.cap : f.cap} {isAlat ? 'unit' : 'orang'}</td>
                    <td>
                      <span
                        className={`pill ${
                          f.status === 'repair' ? 'busy' : f.status === 'nonaktif' ? 'danger' : f.status === 'busy' ? 'busy' : 'avail'
                        }`}
                      >
                        {f.status === 'repair'
                          ? 'Perbaikan'
                          : f.status === 'nonaktif'
                          ? 'Nonaktif'
                          : f.status === 'busy'
                          ? 'Terpakai'
                          : 'Aktif'}
                      </span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap', textAlign: 'left' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        <select
                          className="table-select-action"
                          value={f.status === 'busy' ? 'avail' : f.status}
                          onChange={(e) => {
                            void setFacilityStatus(f.id, e.target.value as Facility['status']).then(
                              (res) => {
                                if (!res.ok) {
                                  setModalConfig({
                                    isOpen: true,
                                    title: 'Gagal Mengubah Status',
                                    subtitle: res.message || 'Status fasilitas tidak dapat diproses.',
                                    confirmText: 'Mengerti',
                                    confirmVariant: 'danger',
                                    showInput: false,
                                    onConfirm: () => {},
                                  });
                                }
                              },
                            );
                          }}
                          style={{
                            borderColor:
                              f.status === 'repair'
                                ? '#FCD34D'
                                : f.status === 'nonaktif'
                                ? '#FECACA'
                                : '#86EFAC',
                            color:
                              f.status === 'repair'
                                ? '#92400E'
                                : f.status === 'nonaktif'
                                ? '#DC2626'
                                : '#166534',
                            fontWeight: 600,
                          }}
                        >
                          <option value="avail">Aktif</option>
                          <option value="repair">Perbaikan</option>
                          <option value="nonaktif">Nonaktif</option>
                        </select>

                        <button
                          type="button"
                          title="Ubah spesifikasi via backend"
                          onClick={() => startEdit(f)}
                          style={{
                            padding: '5px 10px',
                            fontSize: 13.5,
                            fontWeight: 600,
                            border: '1px solid #D5D0C7',
                            background: '#FFFFFF',
                            borderRadius: 4,
                            cursor: 'pointer',
                            color: '#181D24',
                          }}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          title="Nonaktifkan via backend (soft delete)"
                          onClick={() => handleDelete(f)}
                          style={{
                            padding: '5px 10px',
                            fontSize: 13.5,
                            fontWeight: 600,
                            border: '1px solid #FECACA',
                            background: '#FEF2F2',
                            borderRadius: 4,
                            cursor: 'pointer',
                            color: '#DC2626',
                          }}
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <ActionPromptModal
        config={modalConfig}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

export default function KelolaFasilitasPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24, color: '#6B7280' }}>Memuat data fasilitas...</div>}>
      <KelolaFasilitasContent />
    </Suspense>
  );
}
