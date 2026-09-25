'use client';

import { useState, useMemo } from 'react';
import { useAppData } from '@/context/AppDataContext';
import ActionPromptModal, { ActionModalConfig } from '@/components/ActionPromptModal';
import { FacilityStatus } from '@/models/facility';
import {
  isRuanganFacility,
  isAlatFacility,
  DEFAULT_ROOM_CATEGORIES,
  DEFAULT_ALAT_CATEGORIES,
} from '@/models/facilities-data';

const STATUS_META: Record<FacilityStatus, { pill: string; label: string }> = {
  avail: { pill: 'avail', label: 'Aktif' },
  busy: { pill: 'busy', label: 'Terpakai' },
  repair: { pill: 'busy', label: 'Perbaikan' },
  nonaktif: { pill: 'danger', label: 'Nonaktif' },
};

export default function PetugasFasilitasPage() {
  const { facilities, setFacilityStatus } = useAppData();
  const [tabType, setTabType] = useState<'semua' | 'ruangan' | 'alat'>('semua');
  const [filterCategory, setFilterCategory] = useState<string>('semua');
  const [modalConfig, setModalConfig] = useState<ActionModalConfig>({
    isOpen: false,
    title: '',
    onConfirm: () => {},
  });

  const countRuangan = facilities.filter(isRuanganFacility).length;
  const countAlat = facilities.filter(isAlatFacility).length;

  const categoryOptions = useMemo(() => {
    if (tabType === 'ruangan') {
      const fromFac = Array.from(new Set(facilities.filter(isRuanganFacility).map((f) => f.type))).filter(Boolean);
      const list = Array.from(new Set([...DEFAULT_ROOM_CATEGORIES, ...fromFac]));
      return [{ value: 'semua', label: 'Semua Kategori Ruangan' }, ...list.map((c) => ({ value: c, label: c }))];
    } else if (tabType === 'alat') {
      const fromFac = Array.from(new Set(facilities.filter(isAlatFacility).map((f) => f.type))).filter(Boolean);
      const list = Array.from(new Set([...DEFAULT_ALAT_CATEGORIES, ...fromFac]));
      return [{ value: 'semua', label: 'Semua Kategori Alat' }, ...list.map((c) => ({ value: c, label: c }))];
    } else {
      return [{ value: 'semua', label: 'Semua Kategori' }];
    }
  }, [tabType, facilities]);

  const filtered = facilities.filter((f) => {
    const isAlat = isAlatFacility(f);
    if (tabType === 'ruangan' && isAlat) return false;
    if (tabType === 'alat' && !isAlat) return false;
    if (filterCategory !== 'semua' && f.type !== filterCategory) return false;
    return true;
  });

  function handleStatusChange(facilityId: string, status: FacilityStatus) {
    void setFacilityStatus(facilityId, status).then((res) => {
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
    });
  }

  return (
    <div>
      {/* Header Split */}
      <div className="dash-split-header">
        <h2>Status Fasilitas</h2>
        <p>Tandai fasilitas ruangan atau alat yang sedang dalam perbaikan atau kembalikan ke status operasional aktif.</p>
      </div>

      {/* Sub-tab: Ruangan vs Alat */}
      <div
        role="tablist"
        aria-label="Pilihan Jenis Fasilitas"
        style={{
          display: 'flex',
          gap: 8,
          marginTop: 16,
          marginBottom: 14,
          borderBottom: '2px solid #E5E0D8',
          paddingBottom: 2,
        }}
      >
        {[
          { key: 'semua', label: 'Semua Fasilitas', count: facilities.length },
          { key: 'ruangan', label: 'Fasilitas Ruangan', count: countRuangan },
          { key: 'alat', label: 'Fasilitas Alat', count: countAlat },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tabType === t.key}
            onClick={() => {
              setTabType(t.key as 'semua' | 'ruangan' | 'alat');
              setFilterCategory('semua');
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 18px',
              borderRadius: '6px 6px 0 0',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              border: tabType === t.key ? '1px solid #b59876' : '1px solid transparent',
              borderBottom: tabType === t.key ? '3px solid #b59876' : '3px solid transparent',
              background: tabType === t.key ? '#15171a' : '#FFFFFF',
              color: tabType === t.key ? '#b59876' : '#6B7280',
              marginBottom: -2,
              transition: 'all 0.15s ease',
            }}
          >
            <span>{t.label}</span>
            <span
              style={{
                fontSize: 12,
                padding: '2px 8px',
                borderRadius: 10,
                background: tabType === t.key ? '#2A2E35' : '#F3F0EB',
                color: tabType === t.key ? '#D5C4A1' : '#6B7280',
              }}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Category Filter dropdown */}
      {tabType !== 'semua' && categoryOptions.length > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#4B5563' }}>Kategori:</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{ padding: '6px 12px', fontSize: 13, borderRadius: 6, border: '1px solid #D5D0C7' }}
          >
            {categoryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="panel table-scroll" style={{ padding: 0, overflow: 'hidden', marginTop: 16 }}>
        <table>
          <thead>
            <tr>
              <th>Fasilitas</th>
              <th>Kategori</th>
              <th>Lokasi</th>
              <th>Kapasitas / Jumlah</th>
              <th>Status</th>
              <th style={{ textAlign: 'left' }}>Tindakan</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: '#6B7280' }}>
                  Tidak ada data fasilitas dalam kategori ini.
                </td>
              </tr>
            ) : (
              filtered.map((f) => {
                const isAlat = isAlatFacility(f);
                return (
                  <tr key={f.id}>
                    <td style={{ fontWeight: 600, color: '#181D24', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>{f.name}</span>
                        <span
                          className="pill neutral"
                          style={{ fontSize: 11, padding: '1px 6px', fontWeight: 600 }}
                        >
                          {isAlat ? 'Alat' : 'Ruangan'}
                        </span>
                      </div>
                    </td>
                    <td style={{ color: '#4B5563', fontSize: 13 }}>{f.type}</td>
                    <td style={{ color: '#4B5563', fontSize: 13 }}>{f.loc}</td>
                    <td style={{ color: '#4B5563', fontSize: 13 }}>
                      {isAlat ? `${f.tersedia ?? f.cap} unit` : f.cap ? `${f.cap} orang` : '-'}
                    </td>
                <td>
                  <span
                    className={`pill ${STATUS_META[f.status]?.pill ?? 'avail'}`}
                    style={{ fontSize: 13.5 }}
                  >
                    {STATUS_META[f.status]?.label ?? 'Aktif'}
                  </span>
                </td>
                <td style={{ textAlign: 'left', whiteSpace: 'nowrap' }}>
                  <select
                    className="table-select-action"
                    value={f.status === 'busy' ? 'avail' : f.status}
                    onChange={(e) => handleStatusChange(f.id, e.target.value as FacilityStatus)}
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
