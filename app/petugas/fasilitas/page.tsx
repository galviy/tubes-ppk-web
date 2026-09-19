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
              <th style={{ textAlign: 'right' }}>Aksi</th>
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
                  <span className={`pill ${f.status === 'repair' ? 'busy' : 'avail'}`} style={{ fontSize: 11 }}>
                    {f.status === 'repair' ? 'Dalam Perbaikan' : 'Tersedia / Aktif'}
                  </span>
                </td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  {f.status === 'repair' ? (
                    <button
                      type="button"
                      className="btn-act-outline-green"
                      onClick={() => setFacilityStatus(f.id, 'avail')}
                    >
                      Kembalikan aktif
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn-act-outline-neutral"
                      onClick={() => setFacilityStatus(f.id, 'repair')}
                    >
                      Tandai perbaikan
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
