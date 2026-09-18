'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppData } from '@/context/AppDataContext';
import { FAKE_USERS_DB } from '@/mock/fake-users-db';
import AuthSplitLayout from '@/components/auth/AuthSplitLayout';

const ROLE_HOME: Record<string, string> = {
  pengguna: '/pengguna',
  petugas: '/petugas',
  admin: '/admin',
};

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAppData();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (!result.ok || !result.user) {
      setError(result.message || 'Gagal masuk.');
      return;
    }
    router.push(ROLE_HOME[result.user.role] ?? '/');
  }

  function fillDemo(demoEmail: string, demoPassword: string) {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  }

  return (
    <AuthSplitLayout
      topRightLabel="Layanan fasilitas kampus"
      eyebrow="Akses Akun"
      title="Masuk ke akun kamu"
      subtitle="Gunakan akun yang sudah aktif untuk mengelola reservasi dan laporan fasilitas."
      features={[
        { num: '01', title: 'Ketersediaan real-time', desc: 'Slot 30 menit terkunci otomatis saat kamu mengisi formulir.' },
        { num: '02', title: 'Transparan untuk semua', desc: 'Pengunjung publik bisa cek ketersediaan tanpa login.' },
      ]}
    >
      <form onSubmit={handleSubmit}>
        <div className="afield">
          <label>Email</label>
          <input
            type="email"
            placeholder="nama@sipinjam.ac.id"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="afield">
          <label>Kata sandi</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <label className="remember-row">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          Ingat saya
        </label>

        {error && <div className="auth-error">{error}</div>}
        <button className="auth-submit" type="submit" disabled={loading}>
          {loading ? 'Memeriksa akun…' : 'Masuk'}
        </button>
      </form>

      <div className="auth-switch">
        Belum punya akun? <Link href="/register">Daftar sekarang</Link>
      </div>

      <div className="demo-creds-box">
        <div className="demo-creds-title">Kredensial demo (prototipe, bukan akun sungguhan)</div>
        {FAKE_USERS_DB.map((u) => (
          <button key={u.id} type="button" className="demo-cred-row" onClick={() => fillDemo(u.email, u.password)}>
            <span className="demo-cred-role">{u.role}</span>
            <span className="demo-cred-email">{u.email}</span>
            <span className="demo-cred-fill">Isi otomatis</span>
          </button>
        ))}
      </div>
    </AuthSplitLayout>
  );
}
