'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppData } from '@/context/AppDataContext';
import { FAKULTAS_UNDIP, PRODI_UNDIP } from '@/config/site';

function DownwardUnderlineSelect({
  label,
  value,
  onChange,
  options,
  styleTrigger,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: readonly string[] | string[];
  styleTrigger?: React.CSSProperties;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      ref={containerRef}
      className="ochoco-underline-field"
      style={{ position: 'relative', width: '100%' }}
    >
      <label>{label}</label>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          border: 'none',
          borderBottom: open ? '1.5px solid #b59876' : '1px solid #C9CDD4',
          borderRadius: 0,
          background: 'transparent',
          padding: '6px 0 7px',
          fontFamily: 'var(--font)',
          fontSize: '13.5px',
          color: '#181D24',
          cursor: 'pointer',
          textAlign: 'left',
          outline: 'none',
          transition: 'border-color 0.2s ease',
          ...styleTrigger,
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 6 }}>
          {value}
        </span>
        <svg
          width="14"
          height="14"
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
            zIndex: 150,
          }}
        >
          {options.map((opt) => {
            const isSelected = opt === value;
            return (
              <div
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                style={{
                  padding: '9px 12px',
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
                <span>{opt}</span>
                {isSelected && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b59876" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const { submitSelfRegistration } = useAppData();

  // Role: Mahasiswa, Dosen, Staf
  const [regPeran, setRegPeran] = useState<'Mahasiswa' | 'Dosen' | 'Staf'>('Mahasiswa');

  // Shared Backend Fields
  const [regUsername, setRegUsername] = useState('');
  const [regNama, setRegNama] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regConfirmPass, setRegConfirmPass] = useState('');

  // Role-Specific Backend Fields
  const [regNim, setRegNim] = useState(''); // for Mahasiswa
  const [regAngkatan, setRegAngkatan] = useState('2024'); // for Mahasiswa (number)
  const [regNidn, setRegNidn] = useState(''); // for Dosen (exact 10 digits)
  const [regNip, setRegNip] = useState(''); // for Staf
  const [regProdi, setRegProdi] = useState<string>(PRODI_UNDIP[0]); // for Mahasiswa & Dosen
  const [regFakultas, setRegFakultas] = useState<string>(FAKULTAS_UNDIP[0]);
  const [regPhone, setRegPhone] = useState('');

  // Status & Feedback State
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);

  // Validate password matching backend IsPasswordValid: min 5/8 chars, 1 uppercase, 1 symbol
  function validateBackendPassword(p: string, role: string): string | null {
    const minLen = role === 'Dosen' ? 8 : 5;
    if (p.length < minLen) {
      return `Kata sandi untuk ${role} minimal ${minLen} karakter.`;
    }
    if (!/[A-Z]/.test(p)) {
      return 'Kata sandi wajib mengandung minimal 1 huruf besar (A-Z).';
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p)) {
      return 'Kata sandi wajib mengandung minimal 1 karakter simbol (contoh: @, #, !, $).';
    }
    return null;
  }

  async function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault();
    setRegError('');

    // Username validation matching backend routes
    const trimmedUsername = regUsername.trim();
    if (regPeran === 'Dosen') {
      if (trimmedUsername.length < 5 || trimmedUsername.length > 30) {
        setRegError('Username dosen harus terdiri dari 5 hingga 30 karakter.');
        return;
      }
    } else {
      if (trimmedUsername.length < 5 || trimmedUsername.length > 100) {
        setRegError('Username harus terdiri dari minimal 5 karakter.');
        return;
      }
    }

    // Role specific validations matching backend
    if (regPeran === 'Mahasiswa') {
      if (!regNim.trim()) {
        setRegError('NIM mahasiswa wajib diisi.');
        return;
      }
      if (!regAngkatan.trim() || isNaN(Number(regAngkatan.trim()))) {
        setRegError('Angkatan mahasiswa harus berupa angka (contoh: 2024).');
        return;
      }
      if (!regProdi.trim()) {
        setRegError('Program studi wajib dipilih.');
        return;
      }
    } else if (regPeran === 'Dosen') {
      const nidnClean = regNidn.trim();
      if (nidnClean.length !== 10 || !/^\d+$/.test(nidnClean)) {
        setRegError('NIDN dosen harus tepat 10 digit angka.');
        return;
      }
      if (!regProdi.trim()) {
        setRegError('Program studi dosen wajib dipilih.');
        return;
      }
    } else if (regPeran === 'Staf') {
      if (!regNip.trim()) {
        setRegError('NIP pegawai staf wajib diisi.');
        return;
      }
    }

    // Password validation
    const passErr = validateBackendPassword(regPass, regPeran);
    if (passErr) {
      setRegError(passErr);
      return;
    }
    if (regPass !== regConfirmPass) {
      setRegError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setRegLoading(true);

    const payload = {
      username: trimmedUsername,
      nama: regNama.trim(),
      email: regEmail.trim(),
      password: regPass,
      peran: regPeran,
      nim: regPeran === 'Mahasiswa' ? regNim.trim() : undefined,
      nidn: regPeran === 'Dosen' ? regNidn.trim() : undefined,
      nip: regPeran === 'Staf' ? regNip.trim() : undefined,
      angkatan: regPeran === 'Mahasiswa' ? Number(regAngkatan.trim()) : undefined,
      prodi: regPeran !== 'Staf' ? regProdi : undefined,
      phone: regPhone.trim() || undefined,
      fakultas: regFakultas,
    };

    const result = await submitSelfRegistration(payload);
    setRegLoading(false);

    if (!result.ok) {
      setRegError(result.message);
      return;
    }

    setRegSuccess(true);
  }

  return (
    <div className="ochoco-auth-page">
      {/* Panoramic Scenic Undip Background */}
      <div className="ochoco-hero-bg">
        <div className="ochoco-hero-overlay" />
      </div>

      {/* Top Header Navigation */}
      <header className="ochoco-auth-header">
        <Link href="/" className="ochoco-auth-back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>KEMBALI KE BERANDA</span>
        </Link>

        <Link href="/" className="ochoco-auth-brand">
          <svg width="28" height="18" viewBox="0 0 64 40" fill="none">
            <path d="M12 22L24 6L36 22" stroke="#b59876" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M28 22L40 6L52 22" stroke="#b59876" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M20 28L32 38L44 28" stroke="#b59876" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <span style={{ fontFamily: 'var(--font)', fontSize: 13, fontWeight: 700, letterSpacing: '0.14em', color: '#FFFFFF' }}>SIPINJAM</span>
            <span style={{ fontFamily: 'var(--font)', fontSize: 9, letterSpacing: '0.1em', color: '#b59876' }}>UNIVERSITAS DIPONEGORO</span>
          </div>
        </Link>

        <div className="ochoco-location-tag" style={{ margin: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#b59876">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          <span>UNIVERSITAS DIPONEGORO</span>
        </div>
      </header>

      {/* Main Container: Centered Large Ochoco Register Card */}
      <main className="ochoco-auth-container">
        <div className="ochoco-waiting-card ochoco-auth-standalone-card">
          {regSuccess ? (
            <div className="ochoco-waiting-success" style={{ padding: '36px 20px' }}>
              <div className="ochoco-success-check" style={{ width: 64, height: 64, fontSize: 32 }}>✓</div>
              <h3 style={{ fontFamily: 'var(--font)', fontSize: 20, margin: '16px 0 8px' }}>Pendaftaran Terkirim</h3>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: '#4B5563', maxWidth: 440, margin: '0 auto' }}>
                Akun <strong>{regPeran}</strong> atas nama <strong>{regNama}</strong> (username: <code>{regUsername}</code>) berhasil didaftarkan. Akun sedang menunggu verifikasi admin sebelum dapat digunakan untuk masuk.
              </p>
              <button
                type="button"
                className="ochoco-waiting-btn"
                style={{ marginTop: 24, padding: '14px', fontSize: 13 }}
                onClick={() => router.push('/login')}
              >
                MENUJU HALAMAN MASUK
              </button>
            </div>
          ) : (
            <div>
              <div className="ochoco-card-eyebrow">REGISTRASI AKUN PENGGUNA</div>
              <h2 className="ochoco-waiting-title" style={{ fontSize: 24, marginBottom: 8 }}>
                <span style={{ color: '#b59876' }}>DAFTAR</span> AKUN BARU
              </h2>
              <p className="ochoco-card-subtitle" style={{ fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
                Pendaftaran akun civitas akademika Universitas Diponegoro (Mahasiswa, Dosen, dan Staf).
              </p>

              <div className="ochoco-auth-info" style={{ marginBottom: 20, fontSize: 12.5, padding: '10px 14px' }}>
                Akun baru berstatus <b>menunggu verifikasi admin</b> sebelum dapat digunakan untuk login ke sistem.
              </div>

              <form onSubmit={handleRegisterSubmit} className="ochoco-waiting-form">
                {/* Peran Akademik */}
                <DownwardUnderlineSelect
                  label="PERAN CIVITAS AKADEMIKA"
                  value={regPeran}
                  onChange={(val) => {
                    setRegPeran(val as 'Mahasiswa' | 'Dosen' | 'Staf');
                    setRegError('');
                  }}
                  options={['Mahasiswa', 'Dosen', 'Staf']}
                  styleTrigger={{ fontWeight: 600, color: '#b59876' }}
                />

                {/* Username & Nama Lengkap */}
                <div className="ochoco-field-grid">
                  <div className="ochoco-underline-field">
                    <label htmlFor="reg-username">USERNAME SISTEM (MIN. 5 CHAR)</label>
                    <input
                      id="reg-username"
                      type="text"
                      placeholder="Contoh: galvin24"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value.toLowerCase())}
                      required
                    />
                  </div>

                  <div className="ochoco-underline-field">
                    <label htmlFor="reg-name">NAMA LENGKAP &amp; GELAR</label>
                    <input
                      id="reg-name"
                      type="text"
                      placeholder={
                        regPeran === 'Dosen'
                          ? 'Contoh: Dr. Ir. Budi Santoso, M.T.'
                          : regPeran === 'Staf'
                          ? 'Contoh: Dewi Lestari, S.Kom.'
                          : 'Contoh: Galvin Shalahudin'
                      }
                      value={regNama}
                      onChange={(e) => setRegNama(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Role Specific Identifier: NIM & Angkatan vs NIDN vs NIP */}
                {regPeran === 'Mahasiswa' && (
                  <div className="ochoco-field-grid">
                    <div className="ochoco-underline-field">
                      <label htmlFor="reg-nim">NIM MAHASISWA</label>
                      <input
                        id="reg-nim"
                        type="text"
                        placeholder="Contoh: 24060122140123"
                        value={regNim}
                        onChange={(e) => setRegNim(e.target.value)}
                        required
                      />
                    </div>
                    <div className="ochoco-underline-field">
                      <label htmlFor="reg-angkatan">ANGKATAN (TAHUN)</label>
                      <input
                        id="reg-angkatan"
                        type="number"
                        min="2015"
                        max="2030"
                        placeholder="Contoh: 2024"
                        value={regAngkatan}
                        onChange={(e) => setRegAngkatan(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                {regPeran === 'Dosen' && (
                  <div className="ochoco-underline-field">
                    <label htmlFor="reg-nidn">NIDN DOSEN (10 DIGIT ANGKA)</label>
                    <input
                      id="reg-nidn"
                      type="text"
                      maxLength={10}
                      placeholder="Contoh: 1234567890"
                      value={regNidn}
                      onChange={(e) => setRegNidn(e.target.value)}
                      required
                    />
                  </div>
                )}

                {regPeran === 'Staf' && (
                  <div className="ochoco-underline-field">
                    <label htmlFor="reg-nip">NIP PEGAWAI STAF</label>
                    <input
                      id="reg-nip"
                      type="text"
                      placeholder="Contoh: 198001012345"
                      value={regNip}
                      onChange={(e) => setRegNip(e.target.value)}
                      required
                    />
                  </div>
                )}

                {/* Program Studi (Mahasiswa & Dosen) & Fakultas */}
                <div className="ochoco-field-grid">
                  {regPeran !== 'Staf' ? (
                    <DownwardUnderlineSelect
                      label="PROGRAM STUDI (PRODI)"
                      value={regProdi}
                      onChange={setRegProdi}
                      options={PRODI_UNDIP}
                    />
                  ) : (
                    <div className="ochoco-underline-field">
                      <label htmlFor="reg-phone">NO. TELEPON / WHATSAPP</label>
                      <input
                        id="reg-phone"
                        type="tel"
                        placeholder="08xxxxxxxxxx"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                      />
                    </div>
                  )}

                  <DownwardUnderlineSelect
                    label="FAKULTAS / UNIT ASAL"
                    value={regFakultas}
                    onChange={setRegFakultas}
                    options={FAKULTAS_UNDIP}
                  />
                </div>

                {/* Email Resmi Undip */}
                <div className="ochoco-underline-field">
                  <label htmlFor="reg-email">EMAIL KAMPUS UNDIP</label>
                  <input
                    id="reg-email"
                    type="email"
                    placeholder={
                      regPeran === 'Dosen'
                        ? 'nama@lecturer.undip.ac.id'
                        : regPeran === 'Staf'
                        ? 'nama@staff.undip.ac.id'
                        : 'nama@students.undip.ac.id'
                    }
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                  />
                </div>

                {/* Password & Confirm Password (Backend Rule: 1 Uppercase, 1 Symbol) */}
                <div className="ochoco-field-grid">
                  <div className="ochoco-underline-field">
                    <label htmlFor="reg-pass">KATA SANDI</label>
                    <input
                      id="reg-pass"
                      type="password"
                      placeholder="Min. 1 huruf besar & 1 simbol"
                      value={regPass}
                      onChange={(e) => setRegPass(e.target.value)}
                      required
                    />
                  </div>

                  <div className="ochoco-underline-field">
                    <label htmlFor="reg-confirm-pass">KONFIRMASI KATA SANDI</label>
                    <input
                      id="reg-confirm-pass"
                      type="password"
                      placeholder="Ulangi kata sandi"
                      value={regConfirmPass}
                      onChange={(e) => setRegConfirmPass(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div style={{ fontSize: 11, color: '#6B7280', marginTop: -8, marginBottom: 12 }}>
                  * Kata sandi harus mengandung minimal 1 huruf kapital (A-Z) dan 1 karakter simbol (@, #, !, $).
                </div>

                {regError && <div className="ochoco-auth-error">{regError}</div>}

                <button
                  type="submit"
                  className="ochoco-waiting-btn"
                  style={{ padding: '14px', fontSize: 13, marginTop: 10 }}
                  disabled={regLoading}
                >
                  {regLoading ? 'MENDAFTARKAN AKUN…' : 'KIRIM PENDAFTARAN'}
                </button>
              </form>

              <div className="ochoco-auth-switch" style={{ marginTop: 22, fontSize: 13.5 }}>
                Sudah memiliki akun?{' '}
                <Link
                  href="/login"
                  className="ochoco-text-link"
                  style={{ fontWeight: 700, color: '#b59876', textDecoration: 'underline' }}
                >
                  Masuk di sini
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
