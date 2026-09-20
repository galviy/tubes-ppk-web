'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppData } from '@/context/AppDataContext';
import { FAKULTAS_UNDIP } from '@/config/site';

export default function RegisterPage() {
  const router = useRouter();
  const { submitSelfRegistration } = useAppData();

  const [regNama, setRegNama] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regNim, setRegNim] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPeran, setRegPeran] = useState('Mahasiswa');
  const [regFakultas, setRegFakultas] = useState<string>(FAKULTAS_UNDIP[0]);
  const [regPass, setRegPass] = useState('');
  const [regConfirmPass, setRegConfirmPass] = useState('');
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);

  async function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault();
    setRegError('');

    if (regPass.length < 8) {
      setRegError('Kata sandi minimal 8 karakter.');
      return;
    }
    if (regPass !== regConfirmPass) {
      setRegError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setRegLoading(true);
    const result = await submitSelfRegistration(regNama, regEmail, regPeran, regNim, regPhone, regFakultas);
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
        <div className="ochoco-waiting-card ochoco-auth-standalone-card" style={{ maxWidth: 620 }}>
          {regSuccess ? (
            <div className="ochoco-waiting-success" style={{ padding: '36px 20px' }}>
              <div className="ochoco-success-check" style={{ width: 64, height: 64, fontSize: 32 }}>✓</div>
              <h3 style={{ fontFamily: 'var(--font)', fontSize: 20, margin: '16px 0 8px' }}>Pendaftaran Terkirim</h3>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: '#4B5563', maxWidth: 440, margin: '0 auto' }}>
                Akun atas nama <strong>{regNama}</strong> ({regEmail}) berhasil didaftarkan dan menunggu verifikasi admin sebelum dapat digunakan untuk masuk.
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
              <div className="ochoco-card-eyebrow">REGISTRASI PENGGUNA</div>
              <h2 className="ochoco-waiting-title" style={{ fontSize: 23, marginBottom: 8 }}>
                <span style={{ color: '#b59876' }}>DAFTAR</span> AKUN BARU
              </h2>
              <p className="ochoco-card-subtitle" style={{ fontSize: 13, marginBottom: 18, lineHeight: 1.5 }}>
                Pendaftaran akun civitas akademika Universitas Diponegoro untuk pengajuan peminjaman fasilitas.
              </p>

              <div className="ochoco-auth-info" style={{ marginBottom: 20, fontSize: 12.5, padding: '10px 14px' }}>
                Akun baru berstatus <b>menunggu verifikasi admin</b> sebelum dapat digunakan untuk masuk ke sistem.
              </div>

              <form onSubmit={handleRegisterSubmit} className="ochoco-waiting-form">
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
                        : 'Contoh: Sinta Rahmawati'
                    }
                    value={regNama}
                    onChange={(e) => setRegNama(e.target.value)}
                    required
                  />
                </div>

                <div className="ochoco-field-grid">
                  <div className="ochoco-underline-field">
                    <label htmlFor="reg-peran">PERAN AKADEMIK</label>
                    <select
                      id="reg-peran"
                      value={regPeran}
                      onChange={(e) => setRegPeran(e.target.value)}
                    >
                      <option value="Mahasiswa">Mahasiswa</option>
                      <option value="Dosen">Dosen</option>
                      <option value="Staf">Staf</option>
                    </select>
                  </div>

                  <div className="ochoco-underline-field">
                    <label htmlFor="reg-fakultas">FAKULTAS</label>
                    <select
                      id="reg-fakultas"
                      value={regFakultas}
                      onChange={(e) => setRegFakultas(e.target.value)}
                    >
                      {FAKULTAS_UNDIP.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="ochoco-field-grid">
                  <div className="ochoco-underline-field">
                    <label htmlFor="reg-nim">
                      {regPeran === 'Mahasiswa'
                        ? 'NIM MAHASISWA'
                        : regPeran === 'Dosen'
                        ? 'NIP PEGAWAI DOSEN'
                        : 'NIP / NIK PEGAWAI STAF'}
                    </label>
                    <input
                      id="reg-nim"
                      type="text"
                      placeholder={
                        regPeran === 'Mahasiswa'
                          ? 'Contoh: 24060122140123'
                          : 'Contoh: 198904122015042001'
                      }
                      value={regNim}
                      onChange={(e) => setRegNim(e.target.value)}
                      required
                    />
                  </div>
                  <div className="ochoco-underline-field">
                    <label htmlFor="reg-phone">NOMOR WHATSAPP</label>
                    <input
                      id="reg-phone"
                      type="tel"
                      placeholder="08xxxxxxxxxx"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                    />
                  </div>
                </div>

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

                <div className="ochoco-field-grid">
                  <div className="ochoco-underline-field">
                    <label htmlFor="reg-pass">KATA SANDI</label>
                    <input
                      id="reg-pass"
                      type="password"
                      placeholder="Minimal 8 karakter"
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
