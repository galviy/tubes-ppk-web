'use client';

import Link from 'next/link';
import { useAppData } from '@/context/AppDataContext';
import { isAlatReservation } from '@/models/facilities-data';

const ICONS = {
  total: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 5h6M4 9h16M6 9v10a2 2 0 002 2h8a2 2 0 002-2V9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>,
  menunggu: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" /><path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>,
  disetujui: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  laporan: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3L2 20h20L12 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M12 10v4M12 17h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>,
};

export default function PenggunaHomePage() {
  const { reservations, reports, currentUser, facilityById } = useAppData();
  const currentIdent = currentUser?.nama || currentUser?.email || '';
  const mine = reservations.filter(
    (r) =>
      !r.pemohon ||
      r.pemohon === currentUser?.nama ||
      r.pemohon === currentUser?.email ||
      (currentIdent && r.pemohon.toLowerCase() === currentIdent.toLowerCase()),
  );
  const myReports = reports.filter(
    (r) =>
      !r.pelapor ||
      r.pelapor === currentUser?.nama ||
      r.pelapor === currentUser?.email ||
      (currentIdent && r.pelapor.toLowerCase() === currentIdent.toLowerCase()),
  );

  const mineRuangan = mine.filter((r) => !isAlatReservation(r, facilityById(r.facilityId))).length;
  const mineAlat = mine.filter((r) => isAlatReservation(r, facilityById(r.facilityId))).length;
  const menunggu = mine.filter((r) => r.status === 'menunggu').length;
  const disetujui = mine.filter((r) => r.status === 'disetujui').length;
  const laporanAktif = myReports.filter((r) => r.status === 'baru' || r.status === 'diproses').length;

  return (
    <div>
      <div className="greeting-band">
        <div>
          <div className="greeting-eyebrow">
            PORTAL MAHASISWA &amp; DOSEN • UNIVERSITAS DIPONEGORO
          </div>
          <h2>SELAMAT DATANG, {currentUser?.nama?.split(' (')[0].toUpperCase()}</h2>
          <p>Ringkasan aktivitas peminjaman ruangan, peminjaman alat, dan pelaporan sarpras Universitas Diponegoro.</p>
        </div>
        <span className="role-chip">AKUN PENGGUNA</span>
      </div>

      <div className="summary-row">
        <div className="summary-card">
          <div className="summary-card-icon">{ICONS.total}</div>
          <div>
            <div className="num">{mine.length}</div>
            <div className="lbl">Total Reservasi</div>
            <div style={{ fontSize: 12, color: '#b59876', fontWeight: 600, marginTop: 2 }}>
              {mineRuangan} Ruangan · {mineAlat} Alat
            </div>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-card-icon">{ICONS.menunggu}</div>
          <div>
            <div className="num">{menunggu}</div>
            <div className="lbl">Menunggu persetujuan</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-card-icon">{ICONS.disetujui}</div>
          <div>
            <div className="num">{disetujui}</div>
            <div className="lbl">Reservasi disetujui</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-card-icon">{ICONS.laporan}</div>
          <div>
            <div className="num">{laporanAktif}</div>
            <div className="lbl">Laporan masih aktif</div>
          </div>
        </div>
      </div>

      <div className="alert info">
        Pengajuan reservasi memerlukan persetujuan petugas sarpras sebelum berstatus <b>Disetujui</b>. Batas pembatalan mandiri adalah <b>2 jam</b>{' '}
        sebelum jam kegiatan dimulai.
      </div>

      <div className="content-head" style={{ marginTop: 12 }}>
        <h2 style={{ fontSize: 20 }}>Menu cepat</h2>
      </div>
      <div className="menu-card-grid">
        <div className="menu-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3>Ajukan Reservasi Fasilitas</h3>
            <p>Pilih fasilitas dan slot kosong, lalu ajukan permohonan peminjaman.</p>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            <Link
              href="/pengguna/reservasi?tipe=ruangan"
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                padding: '5px 10px',
                borderRadius: 4,
                background: '#FAF8F5',
                border: '1px solid #D5D0C7',
                color: '#181D24',
                textDecoration: 'none',
              }}
            >
              Reservasi Ruangan
            </Link>
            <Link
              href="/pengguna/reservasi?tipe=alat"
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                padding: '5px 10px',
                borderRadius: 4,
                background: '#FAF8F5',
                border: '1px solid #D5D0C7',
                color: '#181D24',
                textDecoration: 'none',
              }}
            >
              Reservasi Alat
            </Link>
          </div>
        </div>
        <Link href="/pengguna/riwayat" className="menu-card">
          <h3>Riwayat Reservasi</h3>
          <p>Lihat status dan batalkan reservasi ruangan atau alat yang pernah diajukan.</p>
        </Link>
        <Link href="/pengguna/lapor" className="menu-card">
          <h3>Lapor Kerusakan</h3>
          <p>Laporkan kerusakan atau kendala fisik pada ruangan maupun alat.</p>
        </Link>
        <Link href="/pengguna/status-laporan" className="menu-card">
          <h3>Status Laporan Saya</h3>
          <p>Pantau tindak lanjut laporan kendala sarpras yang Anda kirim.</p>
        </Link>
      </div>
    </div>
  );
}
