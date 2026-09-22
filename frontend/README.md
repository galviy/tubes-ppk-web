# SiPinjam — Sistem Reservasi & Pelaporan Fasilitas Kampus Universitas Diponegoro

Sistem informasi berbasis web modern untuk pengelolaan izin reservasi ruangan/alat dan pelaporan kendala sarana prasarana akademik di lingkungan Universitas Diponegoro. Dibangun menggunakan **Next.js 16** (App Router, **Webpack** — lihat catatan bundler di bawah), **React 19**, TypeScript, dan Vanilla CSS dengan design system elegan bertema arsitektural kampus (*The Reserve at Ochoco*).

---

## 🚀 Menjalankan Aplikasi

```bash
npm install
npm run dev      # Menjalankan development server di http://localhost:3000
npm run build    # Kompilasi produksi Next.js & static export
npx serve out    # Pratinjau hasil build statis lokal (opsional)
```

> **Catatan bundler:** Next.js 16 secara bawaan mendukung Turbopack, namun proyek ini dikonfigurasikan menggunakan **Webpack** (melalui flag `--webpack` pada script `package.json`). Hal ini bertujuan menjaga keandalan *hydration* event handler pada form interaktif dan modal kustom di lingkungan peramban.

---

## 🏛️ Fitur & Arsitektur Sistem

### 1. Header & Navigasi Publik Adaptif (*Collision-Proof*)
- **Layout 3-Kolom Seimbang**: Menggunakan arsitektur flex 3 kolom (`flex: 1 1 0%` di sayap kiri dan kanan, serta `flex: 0 0 auto` di bagian tengah).
- **Penempatan Logo Presisi**: Logo & teks *"SIPINJAM UNIVERSITAS DIPONEGORO"* terkunci tepat di titik 50% horizontal tengah dan terhindar dari benturan/tumpang-tindih dengan menu navigasi maupun tombol login pada berbagai ukuran layar dan tingkat zoom.
- **Konsistensi Visual Kaca Gelap (*Translucent Dark Slate*)**: Top bar di halaman beranda (*Home*) serta seluruh subpage publik (`/fasilitas`, `/jadwal`, `/panduan`) menggunakan gradien kaca gelap yang seragam (`rgba(14, 18, 23, 0.94)` hingga `rgba(27, 33, 42, 0.82)` dengan `backdrop-filter: blur(16px)`), memberikan kesan elegan dan profesional.

### 2. Hero Section & Hub Layanan Kampus
- **Bahasa Alami & Komunikatif**: Copywriting pada kartu panduan kampus menggunakan bahasa Indonesia yang lugas dan manusiawi, bebas dari jargon artifisial yang kaku.
- **Distribusi Tombol Fungsional yang Jelas**:
  - **Sisi Kiri Hero**: Tombol eksplorasi utama `[ JELAJAHI FASILITAS ]` (`/fasilitas`) dan `[ PANDUAN PEMINJAMAN ]` (`/panduan`).
  - **Kartu Kanan Hero**: Tombol aksi langsung `[ CEK JADWAL RUANGAN ]` (`/jadwal`) dan `[ MASUK KE AKUN ]` (`/login`).

### 3. Autentikasi Fleksibel & Registrasi Civitas Akademika
- **Halaman Masuk (`/login`) & Daftar (`/register`)**: Memiliki tata letak formulir yang proporsional, seimbang, dan konsisten.
- **Tombol Cepat Akun Demo (1-Klik)**: Memudahkan pengujian multi-peran (Admin, Petugas, Mahasiswa, Dosen, Staf) secara instan tanpa perlu mengetik manual.
- **Alur Registrasi Mandiri**: Pendaftaran akun mahasiswa/dosen baru dilengkapi data Nama, Email, NIM/NIP, Unit/Fakultas, dan No. WhatsApp yang otomatis masuk ke antrean verifikasi Admin (`/admin/akun`).

### 4. Manajemen Jadwal Slot 30 Menit (07.00 – 20.00 WIB)
- **26 Slot Modular Harian**: Pembagian waktu terstruktur ke dalam 4 sesi (Pagi, Siang, Sore, Malam).
- **Validasi Anti-Bentrok Real-time**: Pengecekan irisan interval waktu `[start, end)` secara otomatis untuk mencegah peminjaman ganda pada ruangan/fasilitas yang sama.
- **Kebebasan Memilih Jam**: Pengguna dapat memilih jam mulai dan jam selesai secara fleksibel dengan dukungan navigasi keyboard (`Tab`).

### 5. Kebijakan Pembatalan Reservasi Terstruktur (`lib/cancellation.ts`)
- **Pembatalan Mandiri Pengguna**: Pengguna dapat membatalkan reservasi berstatus *Menunggu* atau *Disetujui* sebelum batas waktu (maksimal H-2 jam sebelum kegiatan dimulai).
- **Pembatalan Darurat oleh Petugas/Admin**: Dilengkapi dialog input alasan pembatalan resmi yang wajib diisi dan dicatat pada riwayat peminjaman.

### 6. Sistem Pelaporan Sarpras & Bukti Foto Rapi
- **Formulir Laporan Kerusakan**: Pengguna dapat menyampaikan kendala fisik sarpras beserta foto bukti kerusakan.
- **Tampilan URL Foto Bebas Overflow**: Link lampiran foto pada tabel admin/petugas ditampilkan ringkas dengan tombol pratinjau thumbnail modal, mencegah teks URL panjang merusak tata letak tabel.
- **Siklus Status Laporan**: Progres terukur dari *Baru* ➔ *Diproses* ➔ *Selesai* (lengkap dengan catatan resolusi perbaikan petugas) atau *Ditolak*.

### 7. Dialog Interaktif Kustom (`ActionPromptModal`)
- Seluruh konfirmasi kritis (penolakan izin, pembatalan darurat, penolakan laporan, catatan perbaikan, notifikasi kapasitas lebih) **tidak menggunakan popup bawaan browser** (`alert()`, `confirm()`, `prompt()`).
- Menggunakan modal terpadu berdesain tema aplikasi dengan validasi input teks dan pintasan keyboard (`Esc` untuk batal, `Ctrl+Enter` untuk konfirmasi).

### 8. Tata Kelola Multi-Peran (17 User Stories Terpenuhi)
- **Publik / Pengunjung**: Eksplorasi katalog sarana, filter gedung & tipe fasilitas, denah lantai (*floor plans*), dan pratinjau jadwal publik.
- **Pengguna (Mahasiswa / Dosen / Staf)**: Pengajuan izin pinjam, pantau status reservasi, pembatalan mandiri, lapor sarpras rusak, dan timeline tindak lanjut perbaikan.
- **Petugas**: Validasi reservasi masuk (setujui / tolak berargumen), pembatalan darurat, tindak lanjut penanganan sarpras, dan pengaturan status operasional (*Aktif* / *Perbaikan*).
- **Admin**: Dashboard rekapitulasi, pengelolaan master data fasilitas, audit log seluruh peminjaman & laporan, verifikasi akun baru, dan ekspor laporan rekapitulasi (CSV, Excel, PDF).

---

## 👥 Akun Demo & Kredensial Pengujian

Pada halaman `/login` (serta kartu autentikasi cepat di beranda), tersedia tombol **Akun Demo (1-Klik)** untuk menguji berbagai hak akses:

| Peran          | Nama Pengguna           | Email                      | Kata Sandi  | Akses Halaman |
|----------------|-------------------------|----------------------------|-------------|---------------|
| **Admin**      | Admin                   | `admin@sipinjam.ac.id`     | `admin123`  | `/admin/*`    |
| **Petugas**    | Budi (Petugas)          | `petugas@sipinjam.ac.id`   | `petugas123`| `/petugas/*`  |
| **Mahasiswa**  | Sinta (Mahasiswa FSM)   | `mahasiswa@sipinjam.ac.id` | `mhs12345`  | `/pengguna/*` |
| **Dosen**      | Pak Herman (Dosen IF)   | `dosen@sipinjam.ac.id`     | `dosen123`  | `/pengguna/*` |
| **Staf**       | Bu Rina (Staf Akademik) | `staf@sipinjam.ac.id`      | `staf123`   | `/pengguna/*` |

---

## 📁 Struktur Folder Proyek

```
app/
  layout.tsx                Root layout (Font Jost, metadata, AppDataProvider)
  globals.css               Design tokens & stylesheet sistem (publik & dashboard)
  page.tsx                  Landing page (Navbar transparan, Hero Hub, Denah Lantai, Fitur, Footer)
  login/page.tsx            Halaman autentikasi masuk & akses cepat akun demo
  register/page.tsx         Halaman registrasi mandiri civitas akademika
  fasilitas/page.tsx        Katalog fasilitas kampus lengkap dengan filter multi-kategori
  jadwal/page.tsx           Matriks jadwal ketersediaan slot 30 menit publik (07.00–20.00 WIB)
  panduan/page.tsx          Panduan alur 3 langkah reservasi & pelaporan kendala

  pengguna/
    layout.tsx              Layout dashboard pengguna
    page.tsx                Menu ringkasan & navigasi cepat pengguna
    reservasi/page.tsx      Form pengajuan peminjaman (deteksi bentrok & slot 30 menit)
    riwayat/page.tsx        Riwayat reservasi peminjam (+ pembatalan mandiri sebelum batas)
    lapor/page.tsx          Form pelaporan kerusakan sarpras (+ unggah foto bukti)
    status-laporan/page.tsx Timeline progres tindak lanjut penanganan laporan

  petugas/
    layout.tsx              Layout dashboard petugas
    page.tsx                Ringkasan antrean reservasi & laporan yang menunggu
    reservasi/page.tsx      Validasi reservasi (Setujui, Tolak, Pembatalan Darurat berargumen)
    laporan/page.tsx        Tindak lanjut laporan (Baru, Diproses, Selesai + Catatan, Tolak)
    fasilitas/page.tsx      Kontrol status operasional sarpras (Aktif / Perbaikan)

  admin/
    layout.tsx              Layout dashboard admin
    page.tsx                Ringkasan tata kelola fasilitas, peminjaman, dan akun pengguna
    fasilitas/page.tsx      Kelola master data fasilitas (tambah, edit, status)
    reservasi/page.tsx      Log audit seluruh peminjaman sarpras kampus (+ filter multi-status)
    laporan/page.tsx        Log audit seluruh laporan kerusakan sarpras
    akun/page.tsx           Kelola akun pengguna/petugas & verifikasi registrasi mandiri
    rekap/page.tsx          Rekapitulasi okupansi & kerusakan sarpras (ekspor CSV/Excel/PDF)

components/
  Navbar.tsx                Header publik adaptif & collision-proof (3-column layout)
  Hero.tsx                  Hero section + Campus Hub Card (copywriting alami & tombol fungsional)
  FacilityTabs.tsx          Visual denah lantai (floor plans) & spesifikasi ruang
  BuildingFeatures.tsx      Daftar keunggulan sarana prasarana kampus
  Footer.tsx                Footer navigasi kampus & aksesibilitas
  ActionPromptModal.tsx     Modal dialog kustom pengganti prompt/alert/confirm bawaan browser
  FacilityDetailModal.tsx   Modal rincian fasilitas & spesifikasi kapasitas
  ReservationDetailModal.tsx Modal rincian reservasi peminjam
  ReportDetailModal.tsx     Modal detail kerusakan & foto bukti laporan
  dashboard/DashboardShell.tsx Shell dashboard bersama (topbar, sub-navigasi teratur, guard izin)

config/
  site.ts                   Konfigurasi aturan operasional, jam kampus, dan rute API backend

context/
  AppDataContext.tsx        State management terpusat di sisi client (React Context)

lib/
  slots.ts                  Logika pembuatan & kalkulasi bentrok slot waktu 30 menit
  cancellation.ts           Aturan & kalkulasi batas waktu pembatalan mandiri peminjaman
  dashboard-nav.ts          Daftar menu navigasi dashboard per peran
  filter-facilities.ts      Helper penyaringan fasilitas kampus

mock/
  fake-users-db.ts          Database akun demo civitas akademika
  auth-api.ts               Lapisan simulasi async API autentikasi

models/
  facility.ts               Definisi tipe data fasilitas, tipe sarpras, dan slot waktu
  reservation.ts            Definisi tipe data peminjaman/reservasi
  report.ts                 Definisi tipe data laporan kerusakan & akun tertunda verifikasi
```

---

## 🎨 Branding & Desain Sistem (*The Reserve at Ochoco*)

- **Palet Warna Arsitektural**:
  - *Forest / Deep Charcoal*: `#14171A`, `#1A1F24`
  - *Warm Brass Gold*: `#B59876`, `#937451`
  - *Clean Alabaster / Chalk*: `#F4F5F7`, `#FFFFFF`
  - *Muted Slate Borders*: `rgba(255, 255, 255, 0.1)`
- **Tipografi**: Menggunakan font modern **Jost** dengan hierarki tipografi formal dan keterbacaan tinggi.
- **Favicon Kustom SiPinjam**: Ikon vektor SVG bertema fasad arsitektural gedung kampus Undip (`/icon.svg` dan `/favicon.svg`).
- **Dropdown Arah Bawah (`DownwardSelect`)**: Menjamin konsistensi arah buka ke bawah pada Chromium Windows tanpa loncatan posisi ke atas.
- **Tabel Responsif & Bersih**: Menghilangkan scroll horizontal liar, menerapkan padding seimbang, dan menjaga perataan teks rapi.

---

## ⚙️ Catatan Arsitektur & Transisi Backend

1. **State Abstraction**: `context/AppDataContext.tsx` mengisolasi seluruh mutasi data (reservasi, laporan, fasilitas, akun pengguna). Ketika beralih ke backend sungguhan, fungsi-fungsi ini siap digantikan dengan pemanggilan REST/GraphQL API tanpa mengubah komponen antarmuka.
2. **Keamanan Autentikasi**: File `mock/auth-api.ts` menyimulasikan alur verifikasi kredensial asinkron dan siap dihubungkan ke penyedia identitas kampus (misal: SSO Undip / OAuth2 / JWT).
3. **Konfigurasi Lingkungan**: Variabel endpoint dan opsi runtime dapat dikonfigurasi melalui `config/site.ts` atau file environment `.env.local`.
