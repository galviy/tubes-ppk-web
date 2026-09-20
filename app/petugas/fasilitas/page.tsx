'use client';

import { useAppData } from '@/context/AppDataContext';

export default function PetugasFasilitasPage() {
  const { facilities, setFacilityStatus } = useAppData();

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
              <th>Kapasitas</th>
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
                <td style={{ color: '#4B5563', fontSize: 13 }}>{f.cap ? `${f.cap} orang` : '—'}</td>
                <td>
                  <span
                    className={`pill ${
                      f.status === 'repair' ? 'busy' : f.status === 'nonaktif' ? 'danger' : 'avail'
                    }`}
                    style={{ fontSize: 11 }}
                  >
                    {f.status === 'repair'
                      ? 'Perbaikan'
                      : f.status === 'nonaktif'
                      ? 'Nonaktif'
                      : 'Aktif'}
                  </span>
                </td>
                <td style={{ textAlign: 'left', whiteSpace: 'nowrap' }}>
                  <select
                    className="table-select-action"
                    value={f.status}
                    onChange={(e) => setFacilityStatus(f.id, e.target.value as any)}
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
    </div>
  );
}
