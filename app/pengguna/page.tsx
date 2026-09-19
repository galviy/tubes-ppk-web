'use client';

import Link from 'next/link';
import { useAppData } from '@/context/AppDataContext';

const ICONS = {
  total: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 5h6M4 9h16M6 9v10a2 2 0 002 2h8a2 2 0 002-2V9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>,
  menunggu: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" /><path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>,
  disetujui: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  laporan: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3L2 20h20L12 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M12 10v4M12 17h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>,
};

export default function PenggunaHomePage() {
  const { reservations, reports, currentUser } = useAppData();
  const mine = reservations.filter((r) => r.pemohon === currentUser?.nama);
  const myReports = reports.filter((r) => r.pelapor === currentUser?.nama);

  const menunggu = mine.filter((r) => r.status === 'menunggu').length;
  const disetujui = mine.filter((r) => r.status === 'disetujui').length;
  const laporanAktif = myReports.filter((r) => r.status === 'baru' || r.status === 'diproses').length;

  return (
    <div>
      <div className="greeting-band">
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: '#b59876', textTransform: 'uppercase', marginBottom: 4 }}>
            PORTAL MAHASISWA &amp; DOSEN • UNIVERSITAS DIPONEGORO
          </div>
          <h2>SELAMAT DATANG, {currentUser?.nama?.split(' (')[0].toUpperCase()}</h2>
          <p>Ringkasan aktivitas reservasi dan pelaporan fasilitas kampus Universitas Diponegoro.</p>
        </div>
        <span className="role-chip">AKUN PENGGUNA</span>
      </div>

      <div className="summary-row">
        <div className="summary-card"><div className="summary-card-icon">{ICONS.total}</div><div><div className="num">{mine.length}</div><div className="lbl">Total reservasi diajukan</div></div></div>
        <div className="summary-card"><div className="summary-card-icon">{ICONS.menunggu}</div><div><div className="num">{menunggu}</div><div className="lbl">Menunggu persetujuan</div></div></div>
        <div className="summary-card"><div className="summary-card-icon">{ICONS.disetujui}</div><div><div className="num">{disetujui}</div><div className="lbl">Reservasi disetujui</div></div></div>
        <div className="summary-card"><div className="summary-card-icon">{ICONS.laporan}</div><div><div className="num">{laporanAktif}</div><div className="lbl">Laporan masih aktif</div></div></div>
      </div>

      <div className="alert info">
        Slot yang kamu ajukan dikunci otomatis 10 menit selama proses pengisian formulir, dan butuh
        persetujuan petugas sebelum berstatus <b>Disetujui</b>. Batas pembatalan sendiri adalah <b>2 jam</b>{' '}
        sebelum jam mulai.
      </div>

      <div className="content-head" style={{ marginTop: 8 }}>
        <h2 style={{ fontSize: 17 }}>Menu cepat</h2>
      </div>
      <div className="menu-card-grid">
        <Link href="/pengguna/reservasi" className="menu-card">
          <h3>Ajukan Reservasi</h3>
          <p>Pilih fasilitas dan slot kosong, lalu ajukan reservasi.</p>
        </Link>
        <Link href="/pengguna/riwayat" className="menu-card">
          <h3>Riwayat Reservasi</h3>
          <p>Lihat status dan batalkan reservasi yang pernah diajukan.</p>
        </Link>
        <Link href="/pengguna/lapor" className="menu-card">
          <h3>Lapor Kerusakan</h3>
          <p>Laporkan kerusakan atau masalah pada fasilitas.</p>
        </Link>
        <Link href="/pengguna/status-laporan" className="menu-card">
          <h3>Status Laporan Saya</h3>
          <p>Pantau tindak lanjut laporan yang kamu kirim.</p>
        </Link>
      </div>
    </div>
  );
}
