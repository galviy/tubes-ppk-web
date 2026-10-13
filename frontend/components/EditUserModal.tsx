'use client';

import { useEffect, useState } from 'react';
import { useAppData } from '@/context/AppDataContext';
import { BackendAccount } from '@/models/user';
import { BackendUserDetail, backendGetUserById } from '@/lib/api';
import { pesanKataSandi, pesanAngkatan } from '@/lib/validation';

interface EditUserModalProps {
  account: BackendAccount;
  onClose: () => void;
  onNotify: (type: 'success' | 'error', title: string, message: string) => void;
}

export default function EditUserModal({ account, onClose, onNotify }: EditUserModalProps) {
  const { updateAccount } = useAppData();
  const [detail, setDetail] = useState<BackendUserDetail | null>(null);
  const [username, setUsername] = useState(account.username || '');
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState(account.email);
  const [angkatan, setAngkatan] = useState('');
  const [kataSandi, setKataSandi] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorSimpan, setErrorSimpan] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await backendGetUserById(account.id);
      if (cancelled) return;
      if (res.ok && res.data) {
        setDetail(res.data);
        setUsername(res.data.username || account.username);
        setNama(res.data.nama_lengkap || '');
        setEmail(res.data.email || account.email);
        setAngkatan(res.data.angkatan ? String(res.data.angkatan) : '');
      } else {
        // Profil detail gagal dimuat: field nama tetap dikosongkan agar
        // admin mengisi manual, email tetap dari daftar akun.
        setNama('');
        setEmail(account.email);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [account]);

  const tipeUser = (detail?.tipe_user || '').toLowerCase();
  const isMahasiswa = tipeUser === 'mahasiswa';

  const usernameError =
    username.trim() !== '' && (username.trim().length < 5 || username.trim().length > 30)
      ? 'Username harus 5 sampai 30 karakter.'
      : '';
  const namaError = nama.trim().length > 0 && nama.trim().length < 3 ? 'Nama lengkap minimal 3 karakter.' : '';
  const emailError =
    email.trim() !== '' && (!email.trim().includes('@') || email.trim().includes(' '))
      ? 'Format email tidak valid.'
      : '';
  const kataSandiError = kataSandi === '' ? '' : pesanKataSandi(kataSandi);
  const angkatanError = !isMahasiswa || angkatan.length === 0 ? '' : pesanAngkatan(angkatan);

  const adaError =
    usernameError !== '' || namaError !== '' || emailError !== '' || kataSandiError !== '' || angkatanError !== '';

  async function handleSimpan() {
    if (adaError || isSaving) {
      setErrorSimpan('Perbaiki data yang ditandai merah terlebih dahulu.');
      return;
    }
    if (!nama.trim()) {
      setErrorSimpan('Nama lengkap tidak boleh kosong.');
      return;
    }

    setIsSaving(true);
    setErrorSimpan('');
    try {
      const data: { username?: string; nama_lengkap: string; email: string; password?: string; angkatan?: number } = {
        nama_lengkap: nama.trim(),
        email: email.trim(),
      };
      // Username dikirim hanya bila benar-benar berubah, supaya bersih dari
      // kirim-ulang nilai yang sama.
      if (username.trim() !== (detail?.username || account.username)) {
        data.username = username.trim();
      }
      if (kataSandi !== '') data.password = kataSandi;
      if (isMahasiswa && angkatan.trim() !== '') data.angkatan = Number(angkatan.trim());

      const res = await updateAccount(account.id, data);
      if (!res.ok) {
        setErrorSimpan(res.message || 'Perubahan akun tidak dapat diproses.');
        return;
      }
      onNotify(
        'success',
        'Akun Berhasil Diperbarui',
        `Data akun @${account.username} berhasil disimpan.`
      );
      onClose();
    } finally {
      setIsSaving(false);
    }
  }

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Edit akun ${account.username}`}
        style={{ maxWidth: 520, width: 'calc(100vw - 32px)', padding: '28px 26px' }}
      >
        <button className="modal-close" onClick={onClose} aria-label="Tutup">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <div className="ochoco-card-eyebrow" style={{ marginBottom: 8 }}>EDIT AKUN</div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#181D24', margin: '0 0 6px' }}>
          Ubah data akun @{account.username}
        </h3>
        <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 18px' }}>
          Nomor induk ({(detail?.identifier || '(tidak dimuat)')}) tidak dapat diubah; kosongkan kata sandi bila tidak ingin menggantinya.
        </p>

        {!detail && (
          <div className="alert info" style={{ marginBottom: 14, fontSize: 13 }}>
            Memuat data profil terbaru dari server...
          </div>
        )}

        <div style={{ display: 'grid', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#374151', marginBottom: 5 }}>
              USERNAME
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="5 sampai 30 karakter"
              style={{ width: '100%', padding: '10px 12px', fontSize: 14, borderRadius: 6, border: '1px solid #D5D0C7', color: '#181D24', background: '#FFFFFF' }}
            />
            {usernameError && (
              <div style={{ color: '#DC2626', fontSize: 12.5, fontWeight: 600, marginTop: 4 }} role="alert">
                {usernameError}
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#374151', marginBottom: 5 }}>
              NAMA LENGKAP
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Nama lengkap terbaru"
              style={{ width: '100%', padding: '10px 12px', fontSize: 14, borderRadius: 6, border: '1px solid #D5D0C7', color: '#181D24', background: '#FFFFFF' }}
            />
            {namaError && (
              <div style={{ color: '#DC2626', fontSize: 12.5, fontWeight: 600, marginTop: 4 }} role="alert">
                {namaError}
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#374151', marginBottom: 5 }}>
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', fontSize: 14, borderRadius: 6, border: '1px solid #D5D0C7', color: '#181D24', background: '#FFFFFF' }}
            />
            {emailError && (
              <div style={{ color: '#DC2626', fontSize: 12.5, fontWeight: 600, marginTop: 4 }} role="alert">
                {emailError}
              </div>
            )}
          </div>

          {isMahasiswa && (
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#374151', marginBottom: 5 }}>
                TAHUN ANGKATAN
              </label>
              <input
                type="number"
                value={angkatan}
                onChange={(e) => setAngkatan(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', fontSize: 14, borderRadius: 6, border: '1px solid #D5D0C7', color: '#181D24', background: '#FFFFFF' }}
              />
              {angkatanError && (
                <div style={{ color: '#DC2626', fontSize: 12.5, fontWeight: 600, marginTop: 4 }} role="alert">
                  {angkatanError}
                </div>
              )}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#374151', marginBottom: 5 }}>
              KATA SANDI BARU (KOSONGKAN BILA TETAP)
            </label>
            <input
              type={showPass ? 'text' : 'password'}
              value={kataSandi}
              onChange={(e) => setKataSandi(e.target.value)}
              placeholder="Min. 5 karakter, 1 huruf besar, 1 simbol"
              style={{ width: '100%', padding: '10px 12px', fontSize: 14, borderRadius: 6, border: '1px solid #D5D0C7', color: '#181D24', background: '#FFFFFF', fontFamily: showPass ? 'inherit' : 'monospace' }}
            />
            {kataSandiError && (
              <div style={{ color: '#DC2626', fontSize: 12.5, fontWeight: 600, marginTop: 4 }} role="alert">
                {kataSandiError}
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 600, color: '#6B7280', padding: '4px 0' }}
            >
              {showPass ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
            </button>
          </div>

          {errorSimpan && (
            <div style={{ color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', padding: '8px 12px', borderRadius: 4, fontSize: 13, fontWeight: 600 }}>
              {errorSimpan}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '9px 16px', fontSize: 13.5, fontWeight: 600, borderRadius: 6, border: '1px solid #D5D0C7', background: '#FFFFFF', color: '#4B5563', cursor: 'pointer' }}
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSimpan}
              disabled={isSaving}
              className="btn primary"
              style={{ padding: '9px 18px', fontSize: 13.5, cursor: isSaving ? 'not-allowed' : 'pointer' }}
            >
              {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}