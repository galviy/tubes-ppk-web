'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppData } from '@/context/AppDataContext';
import AuthSplitLayout from '@/components/auth/AuthSplitLayout';

export default function RegisterPage() {
  const router = useRouter();
  const { submitSelfRegistration } = useAppData();

  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [nim, setNim] = useState('');
  const [noHp, setNoHp] = useState('');
  const [peran, setPeran] = useState('Mahasiswa');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Kata sandi minimal 8 karakter.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setLoading(true);
    const result = await submitSelfRegistration(nama, email, peran);
    setLoading(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }
    alert(result.message + ' Akun belum bisa dipakai untuk login sebelum diverifikasi.');
    router.push('/login');
  }

  return (
    <AuthSplitLayout
      topRightLabel="Layanan fasilitas kampus"
      eyebrow="Akun Pengguna"
      title="Buat akun baru"
      subtitle="Isi data kamu untuk mengakses reservasi dan pelaporan fasilitas kampus."
      features={[
        { num: '01', title: 'Ketersediaan real-time', desc: 'Slot 30 menit terkunci otomatis saat kamu mengisi formulir.' },
        { num: '02', title: 'Transparan untuk semua', desc: 'Pengunjung publik bisa cek ketersediaan tanpa login.' },
      ]}
    >
      <div className="alert info" style={{ marginBottom: 4 }}>
        Akun baru berstatus <b>menunggu verifikasi admin</b> sebelum dapat digunakan untuk login. Akun
        petugas hanya dibuat langsung oleh admin, bukan lewat registrasi mandiri.
      </div>

      <form onSubmit={handleSubmit}>
        <div className="afield">
          <label>Nama lengkap</label>
          <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} required />
        </div>
        <div className="afield">
          <label>Email kampus</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div className="afield-row">
          <div className="afield">
            <label>NIM/NIP <span className="opt">(opsional)</span></label>
            <input type="text" value={nim} onChange={(e) => setNim(e.target.value)} />
          </div>
          <div className="afield">
            <label>No. HP <span className="opt">(opsional)</span></label>
            <input type="tel" value={noHp} onChange={(e) => setNoHp(e.target.value)} />
          </div>
        </div>

        <div className="afield">
          <label>Peran</label>
          <select value={peran} onChange={(e) => setPeran(e.target.value)}>
            <option>Mahasiswa</option>
            <option>Dosen</option>
            <option>Staf</option>
          </select>
        </div>
        <div className="afield">
          <label>Kata sandi</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <span className="field-hint">Minimal 8 karakter.</span>
        </div>
        <div className="afield">
          <label>Konfirmasi kata sandi</label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        </div>

        {error && <div className="auth-error">{error}</div>}
        <button className="auth-submit" type="submit" disabled={loading}>
          {loading ? 'Mengirim…' : 'Daftar akun'}
        </button>
      </form>

      <div className="auth-switch">
        Sudah punya akun? <Link href="/login">Masuk di sini</Link>
      </div>
    </AuthSplitLayout>
  );
}
