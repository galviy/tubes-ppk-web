'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Hero() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [interest, setInterest] = useState('Ruang Kelas');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email) {
      alert('Mohon lengkapi nama dan email Anda.');
      return;
    }
    setSubmitted(true);
    setTimeout(() => {
      router.push(`/jadwal?interest=${encodeURIComponent(interest)}`);
    }, 1500);
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

        {/* Right Side: Floating Waiting List Card */}
        <div className="ochoco-waiting-card">
          <h3 className="ochoco-waiting-title">
            <span style={{ color: '#b59876' }}>AJUKAN</span> RESERVASI CEPAT
          </h3>

          {submitted ? (
            <div className="ochoco-waiting-success">
              <div className="ochoco-success-check">✓</div>
              <h4>Permohonan Terkirim</h4>
              <p>Terima kasih {name}, Anda sedang diarahkan ke jadwal ketersediaan fasilitas Universitas Diponegoro...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="ochoco-waiting-form">
              <div className="ochoco-underline-field">
                <label htmlFor="hero-name">NAMA LENGKAP</label>
                <input
                  id="hero-name"
                  type="text"
                  placeholder=""
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="ochoco-underline-field">
                <label htmlFor="hero-phone">NOMOR WHATSAPP</label>
                <input
                  id="hero-phone"
                  type="tel"
                  placeholder=""
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="ochoco-underline-field">
                <label htmlFor="hero-email">EMAIL KAMPUS (@students.undip.ac.id)</label>
                <input
                  id="hero-email"
                  type="email"
                  placeholder=""
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="ochoco-underline-field">
                <label htmlFor="hero-interest">PILIHAN FASILITAS</label>
                <select
                  id="hero-interest"
                  value={interest}
                  onChange={(e) => setInterest(e.target.value)}
                >
                  <option value="Ruang Kelas">Ruang Kelas Perkuliahan</option>
                  <option value="Aula">Aula Utama Pertemuan</option>
                  <option value="Laboratorium">Laboratorium Komputer & Riset</option>
                  <option value="Lapangan">Lapangan Olahraga Mahasiswa</option>
                  <option value="Alat">Alat (Audio Visual & Proyektor)</option>
                </select>
              </div>

              <button type="submit" className="ochoco-waiting-btn">
                CEK KETERSEDIAAN / AJUKAN
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
