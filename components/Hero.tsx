'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppData } from '@/context/AppDataContext';
import { FAKULTAS_UNDIP } from '@/config/site';

const ROLE_HOME: Record<string, string> = {
  pengguna: '/pengguna',
  petugas: '/petugas',
  admin: '/admin',
};

const DEMO_ACCOUNTS = [
  { role: 'admin', label: 'Admin', email: 'admin@sipinjam.ac.id', pass: 'admin123' },
  { role: 'petugas', label: 'Petugas', email: 'petugas@sipinjam.ac.id', pass: 'petugas123' },
  { role: 'pengguna', label: 'Mahasiswa', email: 'mahasiswa@sipinjam.ac.id', pass: 'mhs12345' },
  { role: 'pengguna', label: 'Dosen', email: 'dosen@sipinjam.ac.id', pass: 'dosen123' },
];

export default function Hero() {
  const router = useRouter();
  const { login, logout, submitSelfRegistration, currentUser } = useAppData();

  // Tab state: 'login' | 'register'
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Register form state
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

  // Check URL search parameters or hash to activate register tab
  useEffect(() => {
    if (typeof window === 'undefined') return;

    function checkAuthTab() {
      const params = new URLSearchParams(window.location.search);
      const hash = window.location.hash;
      if (params.get('auth') === 'register' || hash === '#register') {
        setActiveTab('register');
      } else if (params.get('auth') === 'login' || hash === '#login') {
        setActiveTab('login');
      }
    }

    checkAuthTab();
    window.addEventListener('hashchange', checkAuthTab);
    return () => window.removeEventListener('hashchange', checkAuthTab);
  }, []);

  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    const result = await login(loginEmail, loginPassword);
    setLoginLoading(false);

    if (!result.ok || !result.user) {
      setLoginError(result.message || 'Email atau kata sandi tidak valid.');
      return;
    }

    const targetUrl = ROLE_HOME[result.user.role] ?? '/';
    router.push(targetUrl);
  }

  function fillDemo(demoEmail: string, demoPassword: string) {
    setLoginEmail(demoEmail);
    setLoginPassword(demoPassword);
    setLoginError('');
  }

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
    <section className="ochoco-hero-wrap" id="home">
      {/* Panoramic Scenic Undip Background */}
      <div className="ochoco-hero-bg">
        <div className="ochoco-hero-overlay" />
      </div>

      <div className="ochoco-hero-container">
        {/* Left Side: Bold Big Typography */}
        <div className="ochoco-hero-left">
          <div className="ochoco-hero-badge">UNIVERSITAS DIPONEGORO</div>
          <h1 className="ochoco-hero-title">
            SISTEM RESERVASI
            <br />
            & PELAPORAN FASILITAS
          </h1>
          <p className="ochoco-hero-desc">
            Portal resmi peminjaman fasilitas akademik Universitas Diponegoro (ruang kelas, aula,
            laboratorium, sarana olahraga, dan alat). Cek ketersediaan slot waktu 30 menit (07.00–20.00),
            ajukan izin peminjaman, serta laporkan kendala fasilitas dalam satu sistem terpusat.
          </p>
        </div>

        {/* Right Side: Floating Auth Card (Masuk / Daftar Akun) */}
        <div className="ochoco-waiting-card" id="auth">
          {currentUser ? (
            /* Logged in state */
            <div className="ochoco-logged-box">
              <div className="ochoco-card-eyebrow">SESI ANDA AKTIF</div>
              <h3 className="ochoco-waiting-title">
                <span style={{ color: '#b59876' }}>SELAMAT DATANG</span>, {currentUser.nama.split(' ')[0]}
              </h3>

              <div className="ochoco-logged-profile">
                <div className="ochoco-logged-avatar">
                  {currentUser.nama.slice(0, 2).toUpperCase()}
                </div>
                <div className="ochoco-logged-details">
                  <div className="ochoco-logged-name">{currentUser.nama}</div>
                  <div className="ochoco-logged-email">{currentUser.email}</div>
                  <span className="ochoco-role-chip" style={{ display: 'inline-block', marginTop: 4 }}>
                    {currentUser.role}
                  </span>
                </div>
              </div>

              <p className="ochoco-logged-desc">
                Anda saat ini terhubung ke sistem SiPinjam Undip dengan hak akses <strong>{currentUser.role}</strong>.
              </p>

              <button
                type="button"
                className="ochoco-waiting-btn"
                onClick={() => router.push(ROLE_HOME[currentUser.role] || '/')}
              >
                BUKA DASHBOARD ({currentUser.role.toUpperCase()})
              </button>

              <button
                type="button"
                className="ochoco-logout-btn"
                onClick={logout}
              >
                KELUAR DARI AKUN
              </button>
            </div>
          ) : (
            /* Authentication Tabs (Masuk vs Daftar Akun) */
            <>
              <div className="ochoco-auth-tabs">
                <button
                  type="button"
                  className={`ochoco-auth-tab ${activeTab === 'login' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('login');
                    setLoginError('');
                  }}
                >
                  Masuk
                </button>
                <button
                  type="button"
                  className={`ochoco-auth-tab ${activeTab === 'register' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('register');
                    setRegError('');
                    setRegSuccess(false);
                  }}
                >
                  Daftar Akun
                </button>
              </div>

              {activeTab === 'login' ? (
                /* ================= TAB 1: LOGIN ================= */
                <div>
                  <div className="ochoco-card-eyebrow">AKSES AKUN</div>
                  <h3 className="ochoco-waiting-title">
                    <span style={{ color: '#b59876' }}>MASUK</span> KE AKUN
                  </h3>
                  <p className="ochoco-card-subtitle">
                    Gunakan akun aktif untuk mengelola reservasi dan laporan fasilitas.
                  </p>

                  <form onSubmit={handleLoginSubmit} className="ochoco-waiting-form">
                    <div className="ochoco-underline-field">
                      <label htmlFor="login-email">EMAIL KAMPUS / DINAS</label>
                      <input
                        id="login-email"
                        type="email"
                        placeholder="nama@sipinjam.ac.id"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="ochoco-underline-field">
                      <label htmlFor="login-password">KATA SANDI</label>
                      <input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                    </div>

                    <label className="ochoco-remember-row">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                      />
                      <span>Ingat saya</span>
                    </label>

                    {loginError && <div className="ochoco-auth-error">{loginError}</div>}

                    <button
                      type="submit"
                      className="ochoco-waiting-btn"
                      disabled={loginLoading}
                    >
                      {loginLoading ? 'MEMERIKSA AKUN…' : 'MASUK'}
                    </button>
                  </form>

                  <div className="ochoco-auth-switch">
                    Belum punya akun?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('register');
                        setRegError('');
                        setRegSuccess(false);
                      }}
                      className="ochoco-text-link"
                    >
                      Daftar sekarang
                    </button>
                  </div>

                  {/* Quick Demo Credentials Box (Auto-fill) */}
                  <div className="ochoco-demo-box">
                    <div className="ochoco-demo-title">AKUN DEMO (KLIK UNTUK ISI OTOMATIS)</div>
                    <div className="ochoco-demo-list">
                      {DEMO_ACCOUNTS.map((u) => (
                        <button
                          key={u.email}
                          type="button"
                          className="ochoco-demo-row"
                          onClick={() => fillDemo(u.email, u.pass)}
                          title={`Gunakan akun ${u.label}`}
                        >
                          <span className="ochoco-demo-role">{u.label}</span>
                          <span className="ochoco-demo-email">{u.email}</span>
                          <span className="ochoco-demo-fill">Isi otomatis</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* ================= TAB 2: REGISTER ================= */
                <div>
                  {regSuccess ? (
                    <div className="ochoco-waiting-success">
                      <div className="ochoco-success-check">✓</div>
                      <h4>Pendaftaran Terkirim</h4>
                      <p>
                        Akun atas nama <strong>{regNama}</strong> ({regEmail}) berhasil didaftarkan dan sedang menunggu verifikasi admin.
                      </p>
                      <button
                        type="button"
                        className="ochoco-waiting-btn"
                        style={{ marginTop: 20 }}
                        onClick={() => {
                          setRegSuccess(false);
                          setActiveTab('login');
                          setLoginEmail(regEmail);
                          setLoginPassword(regPass);
                        }}
                      >
                        MENUJU FORM MASUK
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="ochoco-card-eyebrow">AKUN PENGGUNA</div>
                      <h3 className="ochoco-waiting-title">
                        <span style={{ color: '#b59876' }}>BUAT</span> AKUN BARU
                      </h3>
                      <div className="ochoco-auth-info">
                        Akun baru berstatus <b>menunggu verifikasi admin</b> sebelum dapat login.
                      </div>

                      <form onSubmit={handleRegisterSubmit} className="ochoco-waiting-form">
                        <div className="ochoco-underline-field">
                          <label htmlFor="reg-name">NAMA LENGKAP &amp; GELAR</label>
                          <input
                            id="reg-name"
                            type="text"
                            placeholder={regPeran === 'Dosen' ? 'Contoh: Dr. Ir. Budi Santoso, M.T.' : 'Contoh: Sinta Rahmawati'}
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
                            </select>
                          </div>

                          <div className="ochoco-underline-field">
                            <label htmlFor="reg-fakultas">FAKULTAS / SEKOLAH KAMPUS</label>
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
                              {regPeran === 'Dosen' ? 'NIP PEGAWAI DOSEN' : 'NIM MAHASISWA'}
                            </label>
                            <input
                              id="reg-nim"
                              type="text"
                              placeholder={regPeran === 'Dosen' ? 'Contoh: 197405121999031001' : 'Contoh: 24060122140123'}
                              value={regNim}
                              onChange={(e) => setRegNim(e.target.value)}
                              required
                            />
                          </div>
                          <div className="ochoco-underline-field">
                            <label htmlFor="reg-phone">NO. WHATSAPP</label>
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
                            placeholder={regPeran === 'Dosen' ? 'nama@lecturer.undip.ac.id' : 'nama@students.undip.ac.id'}
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            required
                          />
                        </div>

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

                        {regError && <div className="ochoco-auth-error">{regError}</div>}

                        <button
                          type="submit"
                          className="ochoco-waiting-btn"
                          disabled={regLoading}
                        >
                          {regLoading ? 'MENGIRIM…' : 'DAFTAR SEKARANG'}
                        </button>
                      </form>

                      <div className="ochoco-auth-switch">
                        Sudah punya akun?{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('login');
                            setLoginError('');
                          }}
                          className="ochoco-text-link"
                        >
                          Masuk di sini
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
