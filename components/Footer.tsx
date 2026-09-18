export default function Footer() {
  return (
    <footer className="pub">
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <div className="foot-brand">
              <svg width="26" height="26" viewBox="0 0 30 30" fill="none">
                <rect width="30" height="30" rx="9" fill="#3B82F6" />
                <path d="M8 20L15 9L22 20" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              SiPinjam
            </div>
            <p>Sistem reservasi fasilitas akademik Universitas Diponegoro — ruang sidang, lab, aula, dan lapangan dalam satu portal.</p>
          </div>
          <div className="foot-col">
            <h4>Portal</h4>
            <a href="#fasilitas">Fasilitas</a>
            <a href="#jadwal-preview">Jadwal</a>
            <a href="#alur">Cara kerja</a>
          </div>
          <div className="foot-col">
            <h4>Bantuan</h4>
            <a href="#">Panduan peminjaman</a>
            <a href="#">Syarat surat izin</a>
            <a href="#">Hubungi admin gedung</a>
          </div>
          <div className="foot-col">
            <h4>Kontak</h4>
            <a href="#">reservasi@undip.ac.id</a>
            <a href="#">Gedung Rektorat Lt. 1</a>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 Universitas Diponegoro</span>
          <span>design.md v1.0 — Neumorphic Glassmorphism</span>
        </div>
      </div>
    </footer>
  );
}
