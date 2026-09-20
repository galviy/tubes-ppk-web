const STEPS = [
  {
    title: 'Pilih fasilitas & jadwal',
    desc: 'Cari fasilitas lalu cek slot waktu yang tersedia pada pratinjau jadwal.',
  },
  {
    title: 'Ajukan reservasi',
    desc: 'Masuk dan isi tujuan penggunaan; permohonan masuk antrean persetujuan.',
  },
  {
    title: 'Disetujui petugas',
    desc: 'Setelah disetujui petugas, slot terkunci dan fasilitas siap digunakan.',
  },
];

export default function Flow() {
  return (
    <section className="pub" id="alur">
      <div className="wrap">
        <div className="flow">
          <div className="flow-head">
            <h2>Tiga langkah sederhana untuk menggunakan fasilitas kampus</h2>
            <p>Alur dirancang supaya proses birokrasi tidak menghalangi kegiatan mahasiswa dan dosen.</p>
          </div>
          <div className="step-grid">
            {STEPS.map((step, i) => (
              <div className="step" key={step.title}>
                <div className="step-num">{i + 1}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
