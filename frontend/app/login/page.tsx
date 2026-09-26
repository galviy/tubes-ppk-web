'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppData } from '@/context/AppDataContext';

const ROLE_HOME: Record<string, string> = {
  pengguna: '/pengguna',
  petugas: '/petugas',
  admin: '/admin',
};

const DEMO_ACCOUNTS = [
  {
    role: 'Mahasiswa',
    email: 'galvin@gmail.com',
    password: 'Lol@123',
    desc: 'Pengajuan pinjam & lapor kerusakan (/pengguna/*)',
  },
  {
    role: 'Dosen',
    email: 'dosen@sipinjam.ac.id',
    password: 'Dosen@123',
    desc: 'Reservasi ruang kelas & lab riset (/pengguna/*)',
  },
  {
    role: 'Staf',
    email: 'staf@sipinjam.ac.id',
    password: 'Staf@123',
    desc: 'Reservasi sarana aula/rapat (/pengguna/*)',
  },
  {
    role: 'Petugas',
    email: 'petugas@sipinjam.ac.id',
    password: 'Petugas@123',
    desc: 'Persetujuan jadwal & penanganan laporan (/petugas/*)',
  },
  {
    role: 'Admin',
    email: 'galvindoser@gmail.com',
    password: 'Test@123',
    desc: 'Master sarpras, verifikasi & audit rekap (/admin/*)',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, logout, currentUser } = useAppData();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [selectedDemoRole, setSelectedDemoRole] = useState<string | null>(null);

  function applyDemoAccount(acc: (typeof DEMO_ACCOUNTS)[number]) {
    setLoginEmail(acc.email);
    setLoginPassword(acc.password);
    setSelectedDemoRole(acc.role);
    setLoginError('');
  }

  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    const result = await login(loginEmail, loginPassword);
    setLoginLoading(false);

    if (!result.ok || !result.user) {
      setLoginError(result.message || 'Email atau kata sandi tidak sesuai.');
      return;
    }

    const targetUrl = ROLE_HOME[result.user.role] ?? '/';
    router.push(targetUrl);
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
            <span style={{ fontFamily: 'var(--font)', fontSize: 11.5, letterSpacing: '0.1em', color: '#b59876' }}>UNIVERSITAS DIPONEGORO</span>
          </div>
        </Link>

        <div className="ochoco-location-tag" style={{ margin: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#b59876">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          <span>UNIVERSITAS DIPONEGORO</span>
        </div>
      </header>

      {/* Main Container: Centered Large Ochoco Auth Card */}
      <main className="ochoco-auth-container">
        <div className="ochoco-waiting-card ochoco-auth-standalone-card">
          {currentUser ? (
            /* Logged in state */
            <div className="ochoco-logged-box">
              <div className="ochoco-card-eyebrow">SESI ANDA AKTIF</div>
              <h2 className="ochoco-waiting-title" style={{ fontSize: 22 }}>
                <span style={{ color: '#b59876' }}>SELAMAT DATANG</span>, {currentUser.nama}
              </h2>

              <div className="ochoco-logged-profile" style={{ margin: '20px 0' }}>
                <div className="ochoco-logged-avatar" style={{ width: 52, height: 52, fontSize: 18 }}>
                  {currentUser.nama.slice(0, 2).toUpperCase()}
                </div>
                <div className="ochoco-logged-details">
                  <div className="ochoco-logged-name" style={{ fontSize: 16 }}>{currentUser.nama}</div>
                  <div className="ochoco-logged-email" style={{ fontSize: 13 }}>{currentUser.email}</div>
                  <span className="ochoco-role-chip" style={{ display: 'inline-block', marginTop: 6 }}>
                    {currentUser.role.toUpperCase()}
                  </span>
                </div>
              </div>

              <p className="ochoco-logged-desc" style={{ fontSize: 13.5, lineHeight: 1.6 }}>
                Anda saat ini terhubung ke sistem SiPinjam Undip dengan hak akses <strong>{currentUser.role}</strong>.
              </p>

              <button
                type="button"
                className="ochoco-waiting-btn"
                style={{ padding: '14px', fontSize: 14 }}
                onClick={() => router.push(ROLE_HOME[currentUser.role] || '/')}
              >
                BUKA DASHBOARD ({currentUser.role.toUpperCase()})
              </button>

              <button
                type="button"
                className="ochoco-logout-btn"
                style={{ marginTop: 12 }}
                onClick={logout}
              >
                KELUAR DARI AKUN
              </button>
            </div>
          ) : (
            /* Single Dedicated Login Form (No Tabs) */
            <div>
              <div className="ochoco-card-eyebrow">AKSES SISTEM</div>
              <h2 className="ochoco-waiting-title" style={{ fontSize: 24, marginBottom: 8 }}>
                <span style={{ color: '#b59876' }}>MASUK</span>
              </h2>
              <p className="ochoco-card-subtitle" style={{ fontSize: 15, marginBottom: 20, lineHeight: 1.6 }}>
                Gunakan akun resmi civitas akademika Universitas Diponegoro untuk mengelola peminjaman dan pelaporan fasilitas.
              </p>
              {/* Quick Demo Accounts Selector */}
              <div
                style={{
                  background: '#FAF8F5',
                  border: '1px solid #E5E0D8',
                  borderRadius: 6,
                  padding: '14px 16px',
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    marginBottom: 10,
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font)',
                      fontSize: 13,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      color: '#8C7355',
                      textTransform: 'uppercase',
                    }}
                  >
                    Akun Demo
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {DEMO_ACCOUNTS.map((acc) => {
                    const isSelected = selectedDemoRole === acc.role || loginEmail === acc.email;
                    return (
                      <button
                        key={acc.role}
                        type="button"
                        onClick={() => applyDemoAccount(acc)}
                        style={{
                          padding: '7px 14px',
                          borderRadius: 4,
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: 'pointer',
                          border: isSelected ? '1px solid #b59876' : '1px solid #D5D0C7',
                          background: isSelected ? '#15171A' : '#FFFFFF',
                          color: isSelected ? '#b59876' : '#181D24',
                          transition: 'all 0.15s ease',
                          fontFamily: 'inherit',
                        }}
                      >
                        {acc.role}
                      </button>
                    );
                  })}
                </div>
              </div>

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

                <label className="ochoco-remember-row" style={{ margin: '2px 0 20px' }}>
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
                  style={{ padding: '14px', fontSize: 14 }}
                  disabled={loginLoading}
                >
                  {loginLoading ? 'MEMERIKSA AKUN…' : 'MASUK'}
                </button>
              </form>

              <div className="ochoco-auth-switch" style={{ marginTop: 22, fontSize: 15 }}>
                Belum memiliki akun?{' '}
                <Link
                  href="/register"
                  className="ochoco-text-link"
                  style={{ fontWeight: 700, color: '#b59876', textDecoration: 'underline' }}
                >
                  Daftar Akun Baru
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
