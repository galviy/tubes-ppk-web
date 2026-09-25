'use client';

import { useState } from 'react';
import { useAppData } from '@/context/AppDataContext';
import ActionPromptModal, { ActionModalConfig } from '@/components/ActionPromptModal';
import { FacilityStatus } from '@/models/facility';

const STATUS_META: Record<FacilityStatus, { pill: string; label: string }> = {
  avail: { pill: 'avail', label: 'Aktif' },
  busy: { pill: 'busy', label: 'Terpakai' },
  repair: { pill: 'busy', label: 'Perbaikan' },
  nonaktif: { pill: 'danger', label: 'Nonaktif' },
};

export default function PetugasFasilitasPage() {
  const { facilities, setFacilityStatus } = useAppData();
  const [modalConfig, setModalConfig] = useState<ActionModalConfig>({
    isOpen: false,
    title: '',
    onConfirm: () => {},
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
        <p>Tandai fasilitas yang sedang dalam perbaikan atau kembalikan ke status operasional aktif.</p>
      </div>

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
            {facilities.map((f) => (
              <tr key={f.id}>
                <td style={{ fontWeight: 600, color: '#181D24' }}>{f.name}</td>
                <td style={{ color: '#4B5563', fontSize: 13 }}>{f.type}</td>
                <td style={{ color: '#4B5563', fontSize: 13 }}>{f.loc}</td>
                <td style={{ color: '#4B5563', fontSize: 13 }}>{f.tipe === 'alat' ? `${f.tersedia ?? f.cap} unit` : f.cap ? `${f.cap} orang` : '-'}</td>
                <td>
                  <span
                    className={`pill ${STATUS_META[f.status]?.pill ?? 'avail'}`}
                    style={{ fontSize: 11 }}
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
            ))}
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
