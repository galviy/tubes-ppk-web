'use client';

import { useState } from 'react';
import { useAppData } from '@/context/AppDataContext';

export default function KelolaAkunPage() {
  const { pendingAccounts, registerAccountDirectly, verifyPendingAccount } = useAppData();
  const [tab, setTab] = useState<'daftar' | 'verifikasi'>('daftar');

  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [peran, setPeran] = useState('Petugas');

  function handleDaftar() {
    if (!nama.trim() || !email.trim()) {
      alert('Lengkapi nama dan email.');
      return;
    }
    registerAccountDirectly(nama.trim(), email.trim(), peran);
    alert(`Akun ${peran} untuk ${nama} (${email}) berhasil didaftarkan langsung — tanpa proses registrasi mandiri.`);
    setNama('');
    setEmail('');
  }

  return (
    <div>
      <div className="content-head">
        <h2>Kelola akun</h2>
        <p>Daftarkan akun petugas/pengguna langsung, atau verifikasi registrasi mandiri.</p>
      </div>

      <div className="subtabs">
        <button className={`subtab${tab === 'daftar' ? ' active' : ''}`} onClick={() => setTab('daftar')}>
          Daftarkan akun
        </button>
        <button className={`subtab${tab === 'verifikasi' ? ' active' : ''}`} onClick={() => setTab('verifikasi')}>
          Verifikasi registrasi mandiri
        </button>
      </div>

      {tab === 'daftar' ? (
        <div className="panel">
          <div className="form-grid">
            <div className="fgroup">
              <label>Nama lengkap</label>
              <input value={nama} onChange={(e) => setNama(e.target.value)} />
            </div>
            <div className="fgroup">
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="fgroup">
              <label>Peran</label>
              <select value={peran} onChange={(e) => setPeran(e.target.value)}>
                <option>Petugas</option>
                <option>Pengguna (Mahasiswa/Dosen/Staf)</option>
              </select>
            </div>
          </div>
          <div className="btn-row" style={{ marginTop: 16 }}>
            <button className="btn primary" onClick={handleDaftar}>
              Daftarkan akun
            </button>
          </div>
        </div>
      ) : (
        <div className="panel table-scroll">
          <table>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Email</th>
                <th>Peran</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pendingAccounts.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>
                    Tidak ada akun menunggu verifikasi.
                  </td>
                </tr>
              )}
              {pendingAccounts.map((a) => (
                <tr key={a.id}>
                  <td>{a.nama}</td>
                  <td>{a.email}</td>
                  <td>{a.peran}</td>
                  <td>
                    {a.status === 'menunggu' && <span className="pill busy">Menunggu</span>}
                    {a.status === 'diverifikasi' && <span className="pill avail">Diverifikasi</span>}
                    {a.status === 'ditolak' && <span className="pill danger">Ditolak</span>}
                  </td>
                  <td className="btn-row">
                    {a.status === 'menunggu' ? (
                      <>
                        <button className="btn ghost-avail" onClick={() => verifyPendingAccount(a.id, true)}>
                          Verifikasi
                        </button>
                        <button className="btn ghost-danger" onClick={() => verifyPendingAccount(a.id, false)}>
                          Tolak
                        </button>
                      </>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
