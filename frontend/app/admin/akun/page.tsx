'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppData } from '@/context/AppDataContext';
import ActionPromptModal, { ActionModalConfig } from '@/components/ActionPromptModal';
import { UNIT_PETUGAS, FAKULTAS_UNDIP, PRODI_UNDIP } from '@/config/site';

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
    verifyPendingAccount,
  } = useAppData();

  const [tab, setTab] = useState<'daftar' | 'verifikasi'>('daftar');
  const [targetTipe, setTargetTipe] = useState<'petugas' | 'pengguna'>('petugas');

  // Form Fields
  const [username, setUsername] = useState('');
  const [nama, setNama] = useState('');
  const [nip, setNip] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [peran, setPeran] = useState('Petugas');
  const [unit, setUnit] = useState<string>(UNIT_PETUGAS[0]);
  const [fakultas, setFakultas] = useState<string>(FAKULTAS_UNDIP[0]);
  const [prodi, setProdi] = useState<string>(PRODI_UNDIP[0]);
  const [angkatan, setAngkatan] = useState('2024');
  const [password, setPassword] = useState('Sipinjam2026!');
  const [showPass, setShowPass] = useState(false);

  // Search & Filter for Registered Accounts Table
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'semua' | 'pengguna' | 'mahasiswa' | 'dosen' | 'staf' | 'petugas' | 'admin'>('semua');

  // Modal State
  const [modalConfig, setModalConfig] = useState<ActionModalConfig>({
    isOpen: false,
    title: '',
    onConfirm: () => {},
  });

  // Credential Card after successful registration
  const [createdCredential, setCreatedCredential] = useState<{
    nama: string;
    username: string;
    email: string;
    nip: string;
    peran: string;
    unit: string;
    password: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  function isPasswordValidBackend(p: string): boolean {
    return p.length >= 5 && /[A-Z]/.test(p) && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p);
  }

  function handleGeneratePassword() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let pass = 'Undip!';
    for (let i = 0; i < 4; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    pass += '26';
    setPassword(pass);
  }

  function handleDaftar(e: React.FormEvent) {
    e.preventDefault();
    void doDaftar();
  }

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function doDaftar() {
    if (isSubmitting) return;
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

    if (username.trim().length < 5) {
      setModalConfig({
        isOpen: true,
        title: 'Username Tidak Valid',
        subtitle: 'Username akun harus berukuran minimal 5 karakter sesuai spesifikasi backend sistem.',
        confirmText: 'Perbaiki',
        confirmVariant: 'warning',
        showInput: false,
        onConfirm: () => {},
      });
      return;
    }

    if (!isPasswordValidBackend(password.trim())) {
      setModalConfig({
        isOpen: true,
        title: 'Kata Sandi Belum Memenuhi Syarat',
        subtitle: 'Kata sandi harus minimal 5 karakter, serta wajib mengandung minimal 1 huruf kapital (A-Z) dan 1 simbol (@, !, #, dll) sesuai standar keamanan backend.',
        confirmText: 'Perbaiki Sandi',
        confirmVariant: 'warning',
        showInput: false,
        onConfirm: () => {},
      });
      return;
    }

    if (targetTipe === 'pengguna') {
      if (peran === 'Dosen' && nip.trim().length !== 10) {
        setModalConfig({
          isOpen: true,
          title: 'NIDN Dosen Tidak Valid',
          subtitle: 'NIDN Dosen wajib tepat 10 digit karakter angka (contoh: 0012058001) sesuai validasi backend.',
          confirmText: 'Perbaiki',
          confirmVariant: 'warning',
          showInput: false,
          onConfirm: () => {},
        });
        return;
      }
      if (peran === 'Mahasiswa') {
        const yr = Number(angkatan.trim());
        if (!yr || yr < 2000 || yr > 2030) {
          setModalConfig({
            isOpen: true,
            title: 'Angkatan Mahasiswa Tidak Valid',
            subtitle: 'Tahun angkatan harus berupa angka 4 digit yang valid (contoh: 2024).',
            confirmText: 'Perbaiki',
            confirmVariant: 'warning',
            showInput: false,
            onConfirm: () => {},
          });
          return;
        }
      }
    }

    setIsSubmitting(true);
    let res: { ok: boolean; message?: string };
    try {
      res = await registerAccountDirectly({
        nama: nama.trim(),
        username: username.trim(),
        email: email.trim(),
        peran,
        nip: peran === 'Staf' || targetTipe === 'petugas' ? nip.trim() : undefined,
        nim: peran === 'Mahasiswa' ? nip.trim() : undefined,
        nidn: peran === 'Dosen' ? nip.trim() : undefined,
        angkatan: peran === 'Mahasiswa' ? Number(angkatan) || 2024 : undefined,
        prodi: (peran === 'Mahasiswa' || peran === 'Dosen') ? prodi : undefined,
        phone: phone.trim(),
        unit: targetTipe === 'petugas' ? unit : (peran === 'Staf' ? fakultas : prodi),
        password: password.trim() || 'Sipinjam2026!',
      });
    } finally {
      setIsSubmitting(false);
    }

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
      username: username.trim(),
      email: email.trim(),
      nip: nip.trim() || '-',
      peran,
      unit: targetTipe === 'petugas' ? unit : (peran === 'Staf' ? fakultas : prodi),
      password: password.trim() || 'Sipinjam2026!',
    });
    setCopied(false);

    // Reset Form
    setUsername('');
    setNama('');
    setNip('');
    setEmail('');
    setPhone('');
    setPassword('Sipinjam2026!');
  }

  function handleCopyCredentials() {
    if (!createdCredential) return;
    const text = `KREDENSIAL AKUN SIPINJAM UNDIP\nNama: ${createdCredential.nama}\nUsername: ${createdCredential.username}\nNIP/NIM/NIDN: ${createdCredential.nip}\nEmail: ${createdCredential.email}\nPeran: ${createdCredential.peran}\nUnit/Prodi: ${createdCredential.unit}\nKata Sandi: ${createdCredential.password}\nPortal: http://localhost:3000/login`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  // Filter registered accounts (ikut GET /admin/show_user: id/username/email/role).
  const filteredAccounts = registeredAccounts.filter((acc) => {
    if (filterRole !== 'semua' && filterRole !== 'mahasiswa' && filterRole !== 'dosen' && filterRole !== 'staf') {
      if (acc.role !== filterRole) return false;
    } else if (filterRole !== 'semua') {
      // show_user tak membedakan sub-peran pengguna -> tampilkan semua pengguna.
      if (acc.role !== 'pengguna') return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = acc.username.toLowerCase().includes(q);
      const matchEmail = acc.email.toLowerCase().includes(q);
      return matchName || matchEmail;
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
                  <div style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>USERNAME</div>
                  <div style={{ fontWeight: 600, color: '#b59876' }}>@{createdCredential.username}</div>
                </div>
                <div>
                  <div style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>IDENTITAS (NIM/NIDN/NIP)</div>
                  <div style={{ fontWeight: 600, color: '#181D24' }}>{createdCredential.nip}</div>
                </div>
                <div>
                  <div style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>EMAIL LOGIN</div>
                  <div style={{ fontWeight: 600, color: '#181D24' }}>{createdCredential.email}</div>
                </div>
                <div>
                  <div style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>PERAN &amp; UNIT/PRODI</div>
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
                  setUsername('');
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
                <span>+ Tambah Akun Petugas &amp; Admin</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTargetTipe('pengguna');
                  setPeran('Mahasiswa');
                  setFakultas(FAKULTAS_UNDIP[0]);
                  setProdi(PRODI_UNDIP[0]);
                  setAngkatan('2024');
                  setUsername('');
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
                <span>+ Tambah Akun Pengguna (Mhs / Dosen / Staf)</span>
              </button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#181D24', margin: 0 }}>
                {targetTipe === 'petugas'
                  ? 'Formulir Pendaftaran Akun Petugas / Admin Baru'
                  : 'Formulir Pendaftaran Akun Pengguna Langsung Aktif'}
              </h3>
              <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>
                {targetTipe === 'petugas'
                  ? 'Daftarkan akun resmi Petugas atau Admin pengelola sarana prasarana Undip.'
                  : 'Daftarkan akun Mahasiswa, Dosen, atau Staf langsung terverifikasi dengan data akademik resmi.'}
              </p>
            </div>

            <form onSubmit={handleDaftar}>
              <div className="form-grid">
                {/* Username Akun (Wajib di semua endpoint backend) */}
                <div className="fgroup">
                  <label>Username Akun *</label>
                  <input
                    placeholder={
                      targetTipe === 'petugas'
                        ? 'Contoh: agus_petugas atau admin_sarpras'
                        : peran === 'Dosen'
                        ? 'Contoh: budi_dosen'
                        : peran === 'Staf'
                        ? 'Contoh: staf_sarpras01'
                        : 'Contoh: sinta2024'
                    }
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    minLength={5}
                  />
                  <span style={{ fontSize: 11, color: '#6B7280', marginTop: 3 }}>
                    Minimal 5 karakter (sinkron dengan kontrak otentikasi backend).
                  </span>
                </div>

                {/* Nama Lengkap */}
                <div className="fgroup">
                  <label>Nama Lengkap *</label>
                  <input
                    placeholder={
                      targetTipe === 'petugas'
                        ? 'Contoh: Agus Supriyono, S.Kom.'
                        : peran === 'Dosen'
                        ? 'Contoh: Dr. Ir. Budi Santoso, M.T.'
                        : peran === 'Staf'
                        ? 'Contoh: Dewi Lestari, S.Kom.'
                        : 'Contoh: Sinta Rahmawati'
                    }
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
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
                        : peran === 'Staf'
                        ? 'nama.staf@staff.undip.ac.id'
                        : 'nama.mhs@students.undip.ac.id'
                    }
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {/* Peran Sistem */}
                <DownwardSelect
                  label={targetTipe === 'petugas' ? 'Peran Hak Akses *' : 'Kategori Pengguna *'}
                  value={peran}
                  onChange={(val) => {
                    setPeran(val);
                    setNip('');
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
                          { value: 'Staf', label: 'Staf' },
                        ]
                  }
                />

                {/* Conditional fields based on role */}
                {targetTipe === 'petugas' ? (
                  <>
                    {/* Unit Kerja Petugas */}
                    <DownwardSelect
                      label="Unit Kerja / Lokasi Penugasan *"
                      value={unit}
                      onChange={setUnit}
                      options={UNIT_PETUGAS as unknown as string[]}
                    />

                    {/* NIP Petugas (Opsional) */}
                    <div className="fgroup">
                      <label>NIP Petugas / Pegawai</label>
                      <input
                        placeholder="Contoh: 198604152010121002"
                        value={nip}
                        onChange={(e) => setNip(e.target.value)}
                      />
                    </div>
                  </>
                ) : peran === 'Mahasiswa' ? (
                  <>
                    {/* NIM */}
                    <div className="fgroup">
                      <label>NIM (Nomor Induk Mahasiswa) *</label>
                      <input
                        placeholder="Contoh: 24060122140123"
                        value={nip}
                        onChange={(e) => setNip(e.target.value)}
                        required
                      />
                    </div>

                    {/* Angkatan */}
                    <div className="fgroup">
                      <label>Tahun Angkatan *</label>
                      <input
                        type="number"
                        placeholder="Contoh: 2024"
                        value={angkatan}
                        onChange={(e) => setAngkatan(e.target.value)}
                        required
                      />
                    </div>

                    {/* Program Studi */}
                    <DownwardSelect
                      label="Program Studi *"
                      value={prodi}
                      onChange={setProdi}
                      options={PRODI_UNDIP as unknown as string[]}
                    />

                    {/* Fakultas */}
                    <DownwardSelect
                      label="Fakultas *"
                      value={fakultas}
                      onChange={setFakultas}
                      options={FAKULTAS_UNDIP as unknown as string[]}
                    />
                  </>
                ) : peran === 'Dosen' ? (
                  <>
                    {/* NIDN */}
                    <div className="fgroup">
                      <label>NIDN (Nomor Induk Dosen Nasional) *</label>
                      <input
                        placeholder="Contoh: 0012058001 (10 digit)"
                        value={nip}
                        onChange={(e) => setNip(e.target.value)}
                        maxLength={10}
                        required
                      />
                      <span style={{ fontSize: 11, color: '#6B7280', marginTop: 3 }}>
                        Tepat 10 digit karakter angka sesuai validasi backend dosen.
                      </span>
                    </div>

                    {/* Program Studi */}
                    <DownwardSelect
                      label="Homebase Program Studi *"
                      value={prodi}
                      onChange={setProdi}
                      options={PRODI_UNDIP as unknown as string[]}
                    />

                    {/* Fakultas */}
                    <DownwardSelect
                      label="Fakultas *"
                      value={fakultas}
                      onChange={setFakultas}
                      options={FAKULTAS_UNDIP as unknown as string[]}
                    />
                  </>
                ) : (
                  <>
                    {/* NIP Staf */}
                    <div className="fgroup">
                      <label>NIP (Nomor Induk Pegawai) *</label>
                      <input
                        placeholder="Contoh: 198001012345"
                        value={nip}
                        onChange={(e) => setNip(e.target.value)}
                        required
                      />
                    </div>

                    {/* Unit / Fakultas Staf */}
                    <DownwardSelect
                      label="Unit Kerja / Fakultas *"
                      value={fakultas}
                      onChange={setFakultas}
                      options={FAKULTAS_UNDIP as unknown as string[]}
                    />
                  </>
                )}

                {/* No. Telepon */}
                <div className="fgroup">
                  <label>No. HP / WhatsApp Aktif</label>
                  <input
                    placeholder="Contoh: 0812-3456-7890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                {/* Kata Sandi */}
                <div className="fgroup full">
                  <label>Kata Sandi *</label>
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
                    Kata sandi default: <code>Sipinjam2026!</code> (minimal 5 karakter, 1 huruf besar, dan 1 simbol).
                  </div>
                </div>
              </div>

              <div className="btn-row" style={{ marginTop: 20 }}>
                <button type="submit" className="btn primary" disabled={isSubmitting}>
                  {isSubmitting
                    ? 'Mendaftarkan…'
                    : targetTipe === 'petugas'
                      ? 'Daftarkan Akun Petugas / Admin'
                      : 'Daftarkan Akun Pengguna'}
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

              {/* Role Filter Chips (ikut show_user: hanya role backend) */}
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
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Peran</th>
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
                      <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{acc.id}</td>
                      <td style={{ fontWeight: 600, color: '#181D24' }}>@{acc.username}</td>
                      <td style={{ fontSize: 13 }}>{acc.email}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <span className="pill avail" style={{ fontSize: 11 }}>
                          {acc.role === 'admin' ? 'Admin' : acc.role === 'petugas' ? 'Petugas' : 'Pengguna'}
                        </span>
                      </td>
                      {/* No-op: backend belum menyediakan endpoint suspend */}
                      <td style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                        <button
                          type="button"
                          title="Menunggu endpoint backend — tombol tidak melakukan apa-apa"
                          onClick={() => {}}
                          style={{
                            padding: '4px 10px',
                            fontSize: 11,
                            fontWeight: 600,
                            borderRadius: 4,
                            cursor: 'pointer',
                            border: '1px solid #FECACA',
                            background: '#FEF2F2',
                            color: '#DC2626',
                          }}
                        >
                          Nonaktifkan
                        </button>
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
                <th>Nama &amp; Username</th>
                <th>Email &amp; Kontak</th>
                <th>Identitas Resmi</th>
                <th>Peran</th>
                <th>Program Studi / Unit</th>
                <th>Status</th>
                <th style={{ textAlign: 'left' }}>Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {pendingAccounts.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>
                    Tidak ada akun menunggu verifikasi.
                  </td>
                </tr>
              )}
              {pendingAccounts.map((a) => (
                <tr key={a.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#181D24' }}>{a.nama}</div>
                    {a.username && (
                      <div style={{ fontSize: 11, color: '#b59876', fontFamily: 'monospace' }}>
                        @{a.username}
                      </div>
                    )}
                  </td>
                  <td style={{ fontSize: 13 }}>
                    <div>{a.email}</div>
                    <div style={{ fontSize: 11, color: '#6B7280' }}>{a.phone || '-'}</div>
                  </td>
                  <td>
                    {a.peran === 'Mahasiswa' ? (
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 12, fontFamily: 'monospace' }}>
                          NIM: {a.nim || '-'}
                        </div>
                        {a.angkatan && (
                          <div style={{ fontSize: 11, color: '#6B7280' }}>
                            Angkatan {a.angkatan}
                          </div>
                        )}
                      </div>
                    ) : a.peran === 'Dosen' ? (
                      <div style={{ fontWeight: 600, fontSize: 12, fontFamily: 'monospace' }}>
                        NIDN: {a.nidn || a.nim || '-'}
                      </div>
                    ) : (
                      <div style={{ fontWeight: 600, fontSize: 12, fontFamily: 'monospace' }}>
                        NIP: {a.nip || a.nim || '-'}
                      </div>
                    )}
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#b59876', fontSize: 12.5 }}>{a.peran}</span>
                  </td>
                  <td style={{ color: '#4B5563', fontSize: 13 }}>
                    {a.prodi
                      ? `Prodi ${a.prodi}`
                      : a.fakultas ||
                        (a.peran === 'Dosen'
                          ? 'Fakultas Teknik (FT)'
                          : 'Fakultas Sains dan Matematika (FSM)')}
                  </td>
                  <td>
                    {a.status === 'menunggu' && <span className="pill busy">Menunggu</span>}
                    {a.status === 'diverifikasi' && <span className="pill avail">Diverifikasi</span>}
                    {a.status === 'ditolak' && <span className="pill danger">Ditolak</span>}
                  </td>
                  <td style={{ whiteSpace: 'nowrap', textAlign: 'left' }}>
                    {a.status === 'menunggu' ? (
                      // Setujui wired ke backend; Tolak no-op (tak ada endpoint).
                      <select
                        className="table-select-action"
                        value="menunggu"
                        onChange={(e) => {
                          const val = e.target.value;
                          e.target.value = 'menunggu';
                          if (val === 'setuju') {
                            void verifyPendingAccount(a.id, true).then((res) => {
                              if (!res.ok) {
                                setModalConfig({
                                  isOpen: true,
                                  title: 'Verifikasi Gagal',
                                  subtitle:
                                    res.message || 'Status verifikasi tidak dapat diproses.',
                                  confirmText: 'Mengerti',
                                  confirmVariant: 'danger',
                                  showInput: false,
                                  onConfirm: () => {},
                                });
                              }
                            });
                          }
                        }}
                      >
                        <option value="menunggu">Menunggu</option>
                        <option value="setuju">Setuju</option>
                        <option value="tolak">Tolak</option>
                      </select>
                    ) : (
                      <span style={{ color: '#9CA3AF', fontSize: 12 }}>-</span>
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
