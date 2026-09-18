'use client';

import { useState } from 'react';
import { useAppData } from '@/context/AppDataContext';
import { Facility, FacilityType } from '@/models/facility';

const TYPE_OPTIONS: FacilityType[] = ['Ruang Kelas', 'Aula', 'Laboratorium', 'Lapangan', 'Alat'];

const BLANK_FORM = { nama: '', tipe: TYPE_OPTIONS[0] as FacilityType, lokasi: '', kapasitas: '', deskripsi: '' };

export default function KelolaFasilitasPage() {
  const { facilities, addFacility, updateFacility, setFacilityStatus } = useAppData();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(BLANK_FORM);

  function startEdit(f: Facility) {
    setEditingId(f.id);
    setForm({ nama: f.name, tipe: f.type, lokasi: f.loc, kapasitas: String(f.cap), deskripsi: f.desc });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(BLANK_FORM);
  }

  function handleSubmit() {
    if (!form.nama.trim() || !form.lokasi.trim()) {
      alert('Lengkapi nama dan lokasi fasilitas.');
      return;
    }
    const payload = {
      name: form.nama.trim(),
      type: form.tipe,
      loc: form.lokasi.trim(),
      cap: parseInt(form.kapasitas, 10) || 1,
      desc: form.deskripsi.trim(),
      amenities: [] as string[],
    };

    if (editingId) {
      updateFacility(editingId, payload);
    } else {
      addFacility(payload);
    }
    cancelEdit();
  }

  return (
    <div>
      <div className="content-head">
        <h2>Kelola data fasilitas</h2>
        <p>Tambah, ubah, atau nonaktifkan fasilitas kampus.</p>
      </div>

      <div className="panel">
        <h3>{editingId ? 'Ubah fasilitas' : 'Tambah fasilitas baru'}</h3>
        <div className="form-grid">
          <div className="fgroup">
            <label>Nama fasilitas</label>
            <input value={form.nama} onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))} />
          </div>
          <div className="fgroup">
            <label>Tipe</label>
            <select value={form.tipe} onChange={(e) => setForm((f) => ({ ...f, tipe: e.target.value as FacilityType }))}>
              {TYPE_OPTIONS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="fgroup">
            <label>Lokasi</label>
            <input
              value={form.lokasi}
              onChange={(e) => setForm((f) => ({ ...f, lokasi: e.target.value }))}
              placeholder="Contoh: Gedung A"
            />
          </div>
          <div className="fgroup">
            <label>Kapasitas (orang)</label>
            <input
              type="number"
              min={1}
              value={form.kapasitas}
              onChange={(e) => setForm((f) => ({ ...f, kapasitas: e.target.value }))}
            />
          </div>
          <div className="fgroup full">
            <label>Deskripsi</label>
            <textarea value={form.deskripsi} onChange={(e) => setForm((f) => ({ ...f, deskripsi: e.target.value }))} />
          </div>
        </div>
        <div className="btn-row" style={{ marginTop: 16 }}>
          <button className="btn primary" onClick={handleSubmit}>
            {editingId ? 'Simpan perubahan' : 'Simpan fasilitas'}
          </button>
          {editingId && (
            <button className="btn" onClick={cancelEdit}>
              Batal
            </button>
          )}
        </div>
      </div>

      <div className="panel table-scroll">
        <table>
          <thead>
            <tr>
              <th>Nama</th>
              <th>Tipe</th>
              <th>Lokasi</th>
              <th>Kapasitas</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {facilities.map((f) => (
              <tr key={f.id}>
                <td>{f.name}</td>
                <td>{f.type}</td>
                <td>{f.loc}</td>
                <td>{f.cap} orang</td>
                <td>
                  <span className={`pill ${f.status === 'repair' ? 'repair' : 'avail'}`}>
                    {f.status === 'repair' ? 'Perbaikan' : 'Aktif'}
                  </span>
                </td>
                <td className="btn-row">
                  <button className="btn" onClick={() => startEdit(f)}>
                    Edit
                  </button>
                  {f.status === 'avail' ? (
                    <button className="btn ghost-danger" onClick={() => setFacilityStatus(f.id, 'repair')}>
                      Nonaktifkan
                    </button>
                  ) : (
                    <button className="btn ghost-avail" onClick={() => setFacilityStatus(f.id, 'avail')}>
                      Aktifkan
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
