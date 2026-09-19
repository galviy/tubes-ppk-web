'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppData } from '@/context/AppDataContext';
import ActionPromptModal, { ActionModalConfig } from '@/components/ActionPromptModal';
import { UNIT_PETUGAS, FAKULTAS_UNDIP } from '@/config/site';

function DownwardSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[] | string[];
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const normalizedOptions = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );
  const selectedLabel = normalizedOptions.find((o) => o.value === value)?.label || value;

  return (
    <div className="fgroup" ref={dropdownRef} style={{ position: 'relative' }}>
      <label>{label}</label>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 14px',
          borderRadius: 6,
          border: open ? '1.5px solid #b59876' : '1px solid #D5D0C7',
          background: '#FFFFFF',
          color: '#181D24',
          fontSize: 14,
          fontFamily: 'inherit',
          cursor: 'pointer',
          textAlign: 'left',
          outline: 'none',
          boxShadow: open ? '0 0 0 3px rgba(181, 152, 118, 0.15)' : 'none',
          transition: 'all 0.15s ease',
        }}
      >
        <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedLabel}
        </span>
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s ease',
            color: '#6B7280',
            flexShrink: 0,
            marginLeft: 8,
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            maxHeight: 220,
            overflowY: 'auto',
            background: '#FFFFFF',
            border: '1px solid #D5D0C7',
            borderRadius: 6,
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
            zIndex: 100,
          }}
        >
          {normalizedOptions.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                style={{
                  padding: '10px 14px',
                  fontSize: 13,
                  color: isSelected ? '#181D24' : '#4B5563',
                  fontWeight: isSelected ? 600 : 400,
                  cursor: 'pointer',
                  borderBottom: '1px solid #F3F0EB',
                  background: isSelected ? '#FAF8F5' : '#FFFFFF',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'background 0.1s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) (e.currentTarget as HTMLElement).style.background = '#F9FAFB';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) (e.currentTarget as HTMLElement).style.background = '#FFFFFF';
                }}
              >
                <span>{opt.label}</span>
                {isSelected && <span style={{ color: '#b59876', fontSize: 13, fontWeight: 700 }}>✓</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function KelolaAkunPage() {
  const {
    pendingAccounts,
    registeredAccounts,
    registerAccountDirectly,
    toggleAccountStatus,
    verifyPendingAccount,
  } = useAppData();

  const [tab, setTab] = useState<'daftar' | 'verifikasi'>('daftar');
  const [targetTipe, setTargetTipe] = useState<'petugas' | 'pengguna'>('petugas');

  // Form Fields
  const [nama, setNama] = useState('');
  const [nip, setNip] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [peran, setPeran] = useState('Petugas');
  const [unit, setUnit] = useState<string>(UNIT_PETUGAS[0]);
  const [password, setPassword] = useState('Sipinjam2026!');
  const [showPass, setShowPass] = useState(false);

  // Search & Filter for Registered Accounts Table
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'semua' | 'petugas' | 'admin' | 'pengguna'>('semua');

  // Modal State
  const [modalConfig, setModalConfig] = useState<ActionModalConfig>({
    isOpen: false,
    title: '',
    onConfirm: () => {},
  });

  // Credential Card after successful registration
  const [createdCredential, setCreatedCredential] = useState<{
    nama: string;
    email: string;
    nip: string;
    peran: string;
    unit: string;
    password: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  function handleGeneratePassword() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let pass = 'Undip';
    for (let i = 0; i < 4; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    pass += '!26';
    setPassword(pass);
  }

  function handleDaftar(e: React.FormEvent) {
    e.preventDefault();
    if (!nama.trim() || !email.trim()) {
      setModalConfig({
        isOpen: true,
        title: 'Data Belum Lengkap',
        subtitle: 'Silakan lengkapi nama lengkap dan email akun yang ingin didaftarkan.',
        confirmText: 'Lengkapi Data',
        confirmVariant: 'warning',
        showInput: false,
        onConfirm: () => {},
      });
      return;
    }

    const res = registerAccountDirectly({
      nama: nama.trim(),
      email: email.trim(),
      peran,
      nip: nip.trim(),
      phone: phone.trim(),
      unit,
      password: password.trim() || 'Sipinjam2026!',
    });

    if (!res.ok) {
      setModalConfig({
        isOpen: true,
        title: 'Pendaftaran Gagal',
        subtitle: res.message || 'Akun dengan email tersebut sudah terdaftar.',
        confirmText: 'Mengerti',
        confirmVariant: 'danger',
        showInput: false,
        onConfirm: () => {},
      });
      return;
    }

    // Save for credential card display
    setCreatedCredential({
      nama: nama.trim(),
      email: email.trim(),
      nip: nip.trim() || '-',
      peran,
      unit,
      password: password.trim() || 'Sipinjam2026!',
    });
    setCopied(false);

    // Reset Form
    setNama('');
    setNip('');
    setEmail('');
    setPhone('');
    setPassword('Sipinjam2026!');
  }

  function handleCopyCredentials() {
    if (!createdCredential) return;
    const text = `KREDENSIAL AKUN SIPINJAM UNDIP\nNama: ${createdCredential.nama}\nNIP/NIM: ${createdCredential.nip}\nEmail: ${createdCredential.email}\nPeran: ${createdCredential.peran}\nUnit Kerja: ${createdCredential.unit}\nKata Sandi: ${createdCredential.password}\nPortal: http://localhost:3000/#auth`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  // Filter registered accounts
  const filteredAccounts = registeredAccounts.filter((acc) => {
    if (filterRole !== 'semua' && acc.role !== filterRole) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = acc.nama.toLowerCase().includes(q);
      const matchEmail = acc.email.toLowerCase().includes(q);
      const matchNip = acc.nip?.toLowerCase().includes(q);
      const matchUnit = acc.unit?.toLowerCase().includes(q);
      return matchName || matchEmail || matchNip || matchUnit;
    }
    return true;
  });

  return (
    <div>
      <div className="content-head">
        <h2>Kelola akun</h2>
        <p>Pendaftaran akun resmi petugas sarpras, serta verifikasi pengajuan registrasi mandiri civitas akademika.</p>
      </div>

      <div className="subtabs">
        <button className={`subtab${tab === 'daftar' ? ' active' : ''}`} onClick={() => setTab('daftar')}>
          Daftarkan Akun (Petugas &amp; Pengguna)
        </button>
        <button className={`subtab${tab === 'verifikasi' ? ' active' : ''}`} onClick={() => setTab('verifikasi')}>
          Verifikasi Registrasi Mandiri ({pendingAccounts.filter((a) => a.status === 'menunggu').length})
        </button>
      </div>

      {tab === 'daftar' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Card Notifikasi Kredensial Baru */}
          {createdCredential && (
            <div
              style={{
                background: '#FBF8F4',
                border: '1.5px solid #b59876',
                borderRadius: 8,
                padding: '16px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="9 12 11 14 15 10" />
                  </svg>
                  <span style={{ fontWeight: 700, color: '#181D24', fontSize: 14 }}>
                    Akun Baru Berhasil Didaftarkan &amp; Langsung Aktif
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setCreatedCredential(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontSize: 13 }}
                >
                  ✕ Tutup
                </button>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: 12,
                  background: '#FFFFFF',
                  padding: '12px 16px',
                  borderRadius: 6,
                  border: '1px solid #E5E0D8',
                  fontSize: 13,
                }}
              >
                <div>
                  <div style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>NAMA LENGKAP</div>
                  <div style={{ fontWeight: 600, color: '#181D24' }}>{createdCredential.nama}</div>
                </div>
                <div>
                  <div style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>NIP / IDENTITAS</div>
                  <div style={{ fontWeight: 600, color: '#181D24' }}>{createdCredential.nip}</div>
                </div>
                <div>
                  <div style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>EMAIL LOGIN</div>
                  <div style={{ fontWeight: 600, color: '#181D24' }}>{createdCredential.email}</div>
                </div>
                <div>
                  <div style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>PERAN &amp; UNIT</div>
                  <div style={{ fontWeight: 600, color: '#b59876' }}>
                    {createdCredential.peran} • {createdCredential.unit}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>KATA SANDI SEMENTARA</div>
                  <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#181D24', fontSize: 14 }}>
                    {createdCredential.password}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={handleCopyCredentials}
                  style={{
                    padding: '7px 14px',
                    fontSize: 12,
                    fontWeight: 600,
                    borderRadius: 4,
                    border: '1px solid #b59876',
                    background: copied ? '#15171a' : '#FFFFFF',
                    color: copied ? '#b59876' : '#181D24',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  <span>{copied ? 'Kredensial Tersalin!' : 'Salin Kredensial Akun'}</span>
                </button>
                <span style={{ fontSize: 12, color: '#6B7280' }}>
                  Bagikan informasi ini kepada staf/petugas terkait agar dapat segera login ke portal.
                </span>
              </div>
            </div>
          )}

          {/* Form Pendaftaran Akun */}
          <div className="panel" id="form-daftar">
            {/* Mode Switcher Buttons */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => {
                  setTargetTipe('petugas');
                  setPeran('Petugas');
                  setUnit(UNIT_PETUGAS[0]);
                  setNama('');
                  setNip('');
                  setEmail('');
                  setPhone('');
                  setPassword('Sipinjam2026!');
                }}
                style={{
                  padding: '9px 18px',
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: targetTipe === 'petugas' ? '1.5px solid #b59876' : '1px solid #D5D0C7',
                  background: targetTipe === 'petugas' ? '#15171a' : '#FFFFFF',
                  color: targetTipe === 'petugas' ? '#b59876' : '#6B7280',
                  transition: 'all 0.15s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>+ Tambah Akun Petugas</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTargetTipe('pengguna');
                  setPeran('Mahasiswa');
                  setUnit(FAKULTAS_UNDIP[0]);
                  setNama('');
                  setNip('');
                  setEmail('');
                  setPhone('');
                  setPassword('Sipinjam2026!');
                }}
                style={{
                  padding: '9px 18px',
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: targetTipe === 'pengguna' ? '1.5px solid #b59876' : '1px solid #D5D0C7',
                  background: targetTipe === 'pengguna' ? '#15171a' : '#FFFFFF',
                  color: targetTipe === 'pengguna' ? '#b59876' : '#6B7280',
                  transition: 'all 0.15s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>+ Tambah Akun Pengguna</span>
              </button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#181D24', margin: 0 }}>
                {targetTipe === 'petugas'
                  ? 'Formulir Pendaftaran Akun Petugas Baru'
                  : 'Formulir Pendaftaran Akun Pengguna Baru (Mahasiswa / Dosen)'}
              </h3>
              <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>
                {targetTipe === 'petugas'
                  ? 'Daftarkan akun petugas atau admin pengelola fasilitas kampus Undip.'
                  : 'Daftarkan akun mahasiswa atau dosen secara langsung dengan fakultas dan identitas yang valid.'}
              </p>
            </div>

            <form onSubmit={handleDaftar}>
              <div className="form-grid">
                {/* Nama Lengkap */}
                <div className="fgroup">
                  <label>Nama Lengkap *</label>
                  <input
                    placeholder={
                      targetTipe === 'petugas'
                        ? 'Contoh: Agus Supriyono, S.Kom.'
                        : peran === 'Dosen'
                        ? 'Contoh: Dr. Ir. Budi Santoso, M.T.'
                        : 'Contoh: Sinta Rahmawati'
                    }
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    required
                  />
                </div>

                {/* NIP / NIM */}
                <div className="fgroup">
                  <label>{targetTipe === 'petugas' || peran === 'Dosen' ? 'NIP *' : 'NIM *'}</label>
                  <input
                    placeholder={
                      targetTipe === 'petugas'
                        ? 'Contoh: 198604152010121002'
                        : peran === 'Dosen'
                        ? 'Contoh: 197405121999031001'
                        : 'Contoh: 24060122140123'
                    }
                    value={nip}
                    onChange={(e) => setNip(e.target.value)}
                    required
                  />
                </div>

                {/* Email Resmi */}
                <div className="fgroup">
                  <label>Email Resmi Undip *</label>
                  <input
                    type="email"
                    placeholder={
                      targetTipe === 'petugas'
                        ? 'nama.petugas@undip.ac.id'
                        : peran === 'Dosen'
                        ? 'nama.dosen@lecturer.undip.ac.id'
                        : 'nama.mhs@students.undip.ac.id'
                    }
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {/* No. Telepon */}
                <div className="fgroup">
                  <label>No. HP / WhatsApp Aktif</label>
                  <input
                    placeholder="Contoh: 0812-3456-7890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                {/* Peran Sistem (Dropdown ke bawah) */}
                <DownwardSelect
                  label={targetTipe === 'petugas' ? 'Peran Hak Akses *' : 'Peran *'}
                  value={peran}
                  onChange={(val) => {
                    setPeran(val);
                  }}
                  options={
                    targetTipe === 'petugas'
                      ? [
                          { value: 'Petugas', label: 'Petugas' },
                          { value: 'Admin', label: 'Admin' },
                        ]
                      : [
                          { value: 'Mahasiswa', label: 'Mahasiswa' },
                          { value: 'Dosen', label: 'Dosen' },
                        ]
                  }
                />

                {/* Unit Kerja / Fakultas (Terpisah untuk Petugas vs Pengguna) */}
                <DownwardSelect
                  label={
                    targetTipe === 'petugas'
                      ? 'Unit Kerja / Lokasi Penugasan *'
                      : peran === 'Dosen'
                      ? 'Fakultas / Departemen Homebase *'
                      : 'Fakultas / Program Studi *'
                  }
                  value={unit}
                  onChange={setUnit}
                  options={targetTipe === 'petugas' ? (UNIT_PETUGAS as unknown as string[]) : (FAKULTAS_UNDIP as unknown as string[])}
                />

                {/* Kata Sandi Awal */}
                <div className="fgroup full">
                  <label>Kata Sandi Awal (Dapat Diubah Saat Login Pertama)</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: '1 1 240px' }}>
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ width: '100%', fontFamily: showPass ? 'inherit' : 'monospace' }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        style={{
                          position: 'absolute',
                          right: 10,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: 12,
                          color: '#6B7280',
                        }}
                      >
                        {showPass ? 'Sembunyikan' : 'Lihat'}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      style={{
                        padding: '9px 14px',
                        fontSize: 12,
                        fontWeight: 600,
                        border: '1px solid #D5D0C7',
                        background: '#FAF8F5',
                        borderRadius: 6,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Acak Sandi Otomatis
                    </button>
                  </div>
                  <div style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}>
                    Kata sandi default: <code>Sipinjam2026!</code>. Pengguna dapat langsung menggunakannya untuk login.
                  </div>
                </div>
              </div>

              <div className="btn-row" style={{ marginTop: 20 }}>
                <button type="submit" className="btn primary">
                  {targetTipe === 'petugas' ? 'Daftarkan Akun Petugas' : 'Daftarkan Akun Pengguna'}
                </button>
              </div>
            </form>
          </div>

          {/* Section: Tabel Daftar Akun Terdaftar (Staf & Pengguna Aktif) */}
          <div className="panel table-scroll" style={{ padding: 0 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E0D8' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#181D24', margin: 0 }}>
                    Daftar Pengguna &amp; Petugas Terdaftar
                  </h3>
                  <p style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                    Seluruh akun aktif yang memiliki kredensial resmi pada platform SiPinjam Undip.
                  </p>
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Cari nama, email, NIP..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ fontSize: 13, padding: '7px 14px', minWidth: 220, borderRadius: 6, border: '1px solid #D5D0C7' }}
                  />
                </div>
              </div>

              {/* Role Filter Chips */}
              <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                {[
                  { key: 'semua', label: `Semua (${registeredAccounts.length})` },
                  { key: 'pengguna', label: `Pengguna (${registeredAccounts.filter((a) => a.role === 'pengguna').length})` },
                  { key: 'petugas', label: `Petugas (${registeredAccounts.filter((a) => a.role === 'petugas').length})` },
                  { key: 'admin', label: `Admin (${registeredAccounts.filter((a) => a.role === 'admin').length})` },
                ].map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={() => setFilterRole(chip.key as any)}
                    style={{
                      padding: '4px 12px',
                      fontSize: 12,
                      fontWeight: 600,
                      borderRadius: 4,
                      border: filterRole === chip.key ? '1px solid #b59876' : '1px solid #E5E0D8',
                      background: filterRole === chip.key ? '#15171a' : '#FFFFFF',
                      color: filterRole === chip.key ? '#b59876' : '#6B7280',
                      cursor: 'pointer',
                    }}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Nama &amp; NIP/NIM</th>
                  <th>Kontak</th>
                  <th>Peran &amp; Unit Kerja</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center', width: 120 }}>Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: '#6B7280', padding: 24 }}>
                      Tidak ditemukan akun yang cocok dengan pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredAccounts.map((acc) => (
                    <tr key={acc.id}>
                      {/* Nama & NIP */}
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 600, color: '#181D24' }}>{acc.nama}</div>
                        <div style={{ fontSize: 11, color: '#6B7280', fontFamily: 'monospace' }}>
                          NIP/NIM: {acc.nip || '—'}
                        </div>
                      </td>

                      {/* Kontak */}
                      <td style={{ whiteSpace: 'nowrap', fontSize: 13 }}>
                        <div>{acc.email}</div>
                        <div style={{ fontSize: 11, color: '#6B7280' }}>{acc.phone || '—'}</div>
                      </td>

                      {/* Peran & Unit */}
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 600, color: '#b59876', fontSize: 13 }}>
                          {acc.jabatan || (acc.role === 'admin' ? 'Admin' : acc.role === 'petugas' ? 'Petugas' : 'Pengguna')}
                        </div>
                        <div style={{ fontSize: 12, color: '#6B7280' }}>{acc.unit || 'Universitas Diponegoro'}</div>
                      </td>

                      {/* Status */}
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <span className={`pill ${acc.status === 'nonaktif' ? 'danger' : 'avail'}`}>
                          {acc.status === 'nonaktif' ? 'Nonaktif' : 'Aktif'}
                        </span>
                      </td>

                      {/* Tindakan (Role Admin tidak ada tindakan) */}
                      <td style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                        {acc.role === 'admin' ? (
                          <span style={{ color: '#9CA3AF', fontSize: 15, fontWeight: 500, display: 'inline-block' }}>—</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => toggleAccountStatus(acc.id)}
                            style={{
                              padding: '4px 10px',
                              fontSize: 11,
                              fontWeight: 600,
                              borderRadius: 4,
                              cursor: 'pointer',
                              border: acc.status === 'nonaktif' ? '1px solid #86EFAC' : '1px solid #FECACA',
                              background: acc.status === 'nonaktif' ? '#F0FDF4' : '#FEF2F2',
                              color: acc.status === 'nonaktif' ? '#166534' : '#DC2626',
                            }}
                          >
                            {acc.status === 'nonaktif' ? 'Aktifkan' : 'Nonaktifkan'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Tab 2: Verifikasi Registrasi Mandiri */
        <div className="panel table-scroll">
          <table>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Email</th>
                <th>NIM/NIP</th>
                <th>No. HP</th>
                <th>Peran</th>
                <th>Fakultas / Unit Asal</th>
                <th>Status</th>
                <th style={{ textAlign: 'left' }}>Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {pendingAccounts.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>
                    Tidak ada akun menunggu verifikasi.
                  </td>
                </tr>
              )}
              {pendingAccounts.map((a) => (
                <tr key={a.id}>
                  <td>{a.nama}</td>
                  <td>{a.email}</td>
                  <td>{a.nim || '—'}</td>
                  <td>{a.phone || '—'}</td>
                  <td>{a.peran}</td>
                  <td style={{ color: '#4B5563', fontSize: 13 }}>
                    {a.fakultas || (a.peran === 'Dosen' ? 'Fakultas Teknik (FT)' : 'Fakultas Sains dan Matematika (FSM)')}
                  </td>
                  <td>
                    {a.status === 'menunggu' && <span className="pill busy">Menunggu</span>}
                    {a.status === 'diverifikasi' && <span className="pill avail">Diverifikasi</span>}
                    {a.status === 'ditolak' && <span className="pill danger">Ditolak</span>}
                  </td>
                  <td style={{ whiteSpace: 'nowrap', textAlign: 'left' }}>
                    {a.status === 'menunggu' ? (
                      <select
                        className="table-select-action"
                        value="menunggu"
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === 'setuju') verifyPendingAccount(a.id, true);
                          if (val === 'tolak') verifyPendingAccount(a.id, false);
                        }}
                      >
                        <option value="menunggu">Menunggu</option>
                        <option value="setuju">Setuju</option>
                        <option value="tolak">Tolak</option>
                      </select>
                    ) : (
                      <span style={{ color: '#9CA3AF', fontSize: 12 }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ActionPromptModal
        config={modalConfig}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
