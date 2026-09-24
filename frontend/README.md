# SiPinjam: Sistem Reservasi & Pelaporan Fasilitas Kampus Universitas Diponegoro

Sistem informasi berbasis web modern untuk pengelolaan izin reservasi ruangan/alat dan pelaporan kendala sarana prasarana akademik di lingkungan Universitas Diponegoro. Proyek ini dibangun menggunakan **Next.js 16** (App Router, **Webpack**), **React 19**, **TypeScript**, dan **Vanilla CSS** dengan arsitektur desain yang elegan, modular, serta aksesibel (*The Reserve at Ochoco*).

---

## ⚡ Ringkasan Status Kesiapan Aplikasi

| Kategori | Status | Keterangan |
| :--- | :---: | :--- |
| **TypeScript Typecheck** | ✅ Lulus | `npx tsc --noEmit` bersih tanpa ada kesalahan tipe data (0 errors). |
| **Production Build** | ✅ Lulus | `npm run build` sukses mengompilasi dan meng-export 26 rute statis (`output: 'export'`). |
| **Interaktivitas UI** | ✅ Aman | Menggunakan Webpack (`--webpack`) dan `AppDataContext` client-side state management terpadu. |
| **Akses Jaringan LAN** | ✅ Siap | Didukung konfigurasi `allowedDevOrigins` pada `next.config.js` untuk pengetesan lintas perangkat. |
| **User Stories** | ✅ Lengkap | Mencakup hak akses Publik, Pengguna (Mhs/Dosen/Staf), Petugas Sarpras, dan Admin. |

---

## 🚀 Panduan Menjalankan Aplikasi

### 1. Prasyarat Sistem
- **Node.js**: v18.18.0 atau versi yang lebih baru (disarankan LTS v20+)
- **npm**: v9.0.0 atau lebih baru

### 2. Instalasi & Eksekusi

```bash
# 1. Pasang dependensi proyek
npm install

# 2. Jalankan server pengembangan (Development Mode)
npm run dev
# Buka peramban di: http://localhost:3000

# 3. Validasi typecheck TypeScript
npx tsc --noEmit

# 4. Bangun bundel produksi (mode dinamis, butuh `next start`)
npm run build
npm run start
# Buka peramban di: http://localhost:3000
```

> **Catatan arsitektur (integrasi backend Go):**
> Frontend memanggil backend via proxy `rewrites()` `/api/*` -> `http://127.0.0.1:8080/*` (lihat `next.config.js` + `lib/api.ts`), sehingga browser hanya kenal 1 origin dan cookie `session_id` HttpOnly tetap terkirim. Backend Go TIDAK diubah. Pastikan backend (`go run .` di `backend/`) dan MySQL (`tubes_ppk_web`) jalan sebelum login.

> **Catatan Bundler Webpack:**  
> Skrip `npm run dev` dan `npm run build` secara eksplisit menambahkan flag `--webpack`. Konfigurasi ini menjamin keandalan *hydration* event handler form interaktif, date picker, dan modal dialog kustom pada Next.js 16 tanpa interupsi cache Turbopack.

> **Catatan Akses Testing via Jaringan LAN (HP / Laptop Lain):**  
> Next.js membatasi request internal `/_next/*` jika diakses melalui IP selain localhost. Jika ingin mencoba tampilan dari HP atau perangkat lain di jaringan Wi-Fi yang sama, sesuaikan daftar IP Anda pada array `allowedDevOrigins` di file `next.config.js`.

---

## 👥 Akun Pengujian (Backend MySQL)

Login hanya menerima akun backend terverifikasi (`POST /auth/login` + `GET /user/me` via `lib/api.ts`; akun demo mock dihapus). Contoh akun di database dev: `dosen01@example.com`. Untuk menambah akun: daftar via `/register` (masuk antrean pending backend) lalu verifikasi langsung di DB, atau buat via endpoint `POST /admin/create_user/*` dengan session admin.

---

## 🏛️ Fitur Unggulan & Implementasi Sistem

### 1. Header & Navigasi Publik Adaptif (*Collision-Proof*)
- **Layout Flex 3-Kolom Seimbang**: Menu navigasi dan tombol aksi berada di sayap kiri dan kanan, mengunci brand *"SIPINJAM UNIVERSITAS DIPONEGORO"* tepat di titik 50% tengah.
- **Warna & Posisi Navigasi Bersih**: Tautan Dashboard pada bilah atas memiliki warna teks serasi dengan menu navigasi utama lainnya, serta bilah atas menggunakan efek subpage scenic seragam di semua rute portal.
- **Bebas Tumpang Tindih**: Tampilan tetap proporsional pada resolusi laptop, tablet, hingga berbagai tingkat perbesaran (*zoom level*).

### 2. Beranda Interaktif & Campus Hub
- **Hero Hub Section**: Tautan eksplorasi langsung ke katalog fasilitas, panduan pendelegasian izin, cek matriks jadwal, dan form masuk.
- **Visual Denah Lantai (Floor Plans)**: Tab interaktif denah lantai gedung (`FacilityTabs.tsx`) untuk melihat tata letak ruangan, proyektor, dan kapasitas kursi.
- **Building Features Showcase (3 Slide Utama)**: Menampilkan 3 fitur inti sistem dengan screenshot beresolusi tajam (rasio seragam 1400 × 680):
  1. *Slot Waktu 30 Menit (07.00 - 20.00 WIB)*: Validasi rentang waktu ketat untuk menghindari bentrok jadwal.
  2. *Pelaporan Kerusakan dengan Foto Bukti*: Form pelaporan sarpras dengan unggah foto dan pemantauan status perbaikan.
  3. *Katalog Fasilitas & Filter Kategori*: Filter jenis sarpras, detail kapasitas, dan opsi tata letak grid yang fleksibel.
- **Ilustrasi Peta Kampus Vektor**: Komponen SVG artistik kustom (`CampusMapArt.tsx`) yang mempercantik estetika lingkungan akademik Undip.

### 3. Matriks Jadwal Slot Waktu 30 Menit (07.00 – 20.00 WIB)
- **26 Slot Modular per Hari**: Terbagi rapi ke dalam 4 sesi harian (Pagi, Siang, Sore, Malam).
- **Deteksi Bentrok Otomatis (Real-time Collision Check)**: Perhitungan irisan interval `[start, end)` secara instan mencegah peminjaman ganda pada ruangan/alat dan tanggal yang sama.
- **Pratinjau Ketersediaan Terbuka**: Publik dapat memantau jadwal yang sudah terisi (*booked*) atau kosong tanpa harus login terlebih dahulu.

### 4. Kebijakan Pembatalan Terstruktur (`lib/cancellation.ts`)
- **Pembatalan Mandiri Pengguna**: Peminjam dapat membatalkan reservasi berstatus *Menunggu* atau *Disetujui* maksimal H-2 jam sebelum waktu kegiatan dimulai.
- **Pembatalan Darurat oleh Petugas/Admin**: Staf pengelola dapat membatalkan reservasi sewaktu-waktu jika terdapat kendala operasional mendadak, disertai alasan pembatalan resmi yang tercatat di audit log.

### 5. Sistem Pelaporan Kendala Sarpras & Bukti Foto
- **Formulir Laporan Kerusakan**: Formulir pelaporan kendala fisik fasilitas yang mendukung unggah URL / file bukti visual.
- **Tampilan Anti-Overflow**: Link lampiran foto pada tabel admin/petugas diringkas dengan tombol pratinjau thumbnail modal terpadu (`ReportDetailModal.tsx`), mencegah URL panjang merusak tata letak tabel.
- **Siklus Status Transparan**: Alur penanganan terukur dari status *Baru* ➔ *Diproses* ➔ *Selesai* (lengkap dengan catatan perbaikan teknisi) atau *Ditolak*.

### 6. Dialog Interaktif Kustom (`ActionPromptModal`)
- Mengeliminasi penggunaan popup bawaan browser (`window.alert`, `window.confirm`, `window.prompt`).
- Seluruh konfirmasi kritis (penolakan izin, pembatalan darurat, catatan perbaikan sarpras) disajikan lewat modal terpadu dengan validasi input teks dan shortcut keyboard (`Esc` untuk membatalkan, `Ctrl+Enter` untuk submit).

### 7. Dashboard Multi-Peran & Presisi Tata Letak
- **Perataan Horizontal Sejajar**: Chip peran (`.ochoco-dash-role-chip`) beserta tab navigasi di setiap halaman role (`/admin`, `/petugas`, `/pengguna`) sejajar lurus dengan tombol `KEMBALI KE HOME` di atasnya dan kartu banner (`.greeting-band`) di bawahnya (`padding: 0 28px`).
- **Manajemen Master Sarpras**: Tambah, ubah spesifikasi, dan kelola status operasional fasilitas (*Aktif* / *Perbaikan*).
- **Verifikasi Akun Baru**: Antrean pendaftaran mandiri civitas akademika diverifikasi oleh admin sebelum dapat mengajukan reservasi.
- **Rekapitulasi & Ekspor Multiformat**: Halaman `/admin/rekap` menyediakan rekapitulasi okupansi peminjaman dan riwayat kerusakan dengan opsi ekspor ke **CSV**, **Format Excel**, dan **Cetak PDF**.

---

## 📁 Struktur Berkas & Direktori Proyek

```text
frontend/
├── app/
│   ├── layout.tsx                    # Root layout (Font Jost, metadata global, AppDataProvider)
│   ├── globals.css                   # Design tokens, variabel CSS, tema The Reserve at Ochoco
│   ├── page.tsx                      # Landing page (Hero Hub, Denah Lantai, Fitur Kampus, Footer)
│   ├── login/page.tsx                # Halaman autentikasi masuk & akses cepat akun demo
│   ├── register/page.tsx             # Halaman pendaftaran akun civitas akademika baru
│   ├── fasilitas/page.tsx            # Katalog fasilitas kampus lengkap dengan filter multi-kategori
│   ├── jadwal/page.tsx               # Matriks ketersediaan 26 slot 30 menit publik (07.00–20.00 WIB)
│   ├── panduan/page.tsx              # Panduan alur 3 langkah peminjaman & pelaporan sarpras
│   ├── icon.svg                      # Favicon SVG arsitektural kampus
│   │
│   ├── pengguna/                     # Modul Pengguna (Mahasiswa, Dosen, Staf)
│   │   ├── layout.tsx                # Layout wrapper dashboard pengguna
│   │   ├── page.tsx                  # Dashboard ringkasan aktivitas peminjam
│   │   ├── reservasi/page.tsx        # Formulir pengajuan reservasi (validasi slot & anti-bentrok)
│   │   ├── riwayat/page.tsx          # Riwayat peminjaman & pembatalan mandiri (aturan H-2 jam)
│   │   ├── lapor/page.tsx            # Formulir pelaporan kerusakan sarpras + bukti foto
│   │   └── status-laporan/page.tsx   # Timeline perkembangan tindak lanjut laporan kerusakan
│   │
│   ├── petugas/                      # Modul Petugas Sarpras
│   │   ├── layout.tsx                # Layout wrapper dashboard petugas
│   │   ├── page.tsx                  # Ringkasan antrean tugas petugas
│   │   ├── reservasi/page.tsx        # Validasi izin (Setujui, Tolak, Pembatalan Darurat)
│   │   ├── laporan/page.tsx          # Penanganan laporan (Diproses, Selesai + Catatan, Tolak)
│   │   └── fasilitas/page.tsx        # Pengaturan status sarpras (Aktif / Perbaikan)
│   │
│   └── admin/                        # Modul Administrator Sistem
│       ├── layout.tsx                # Layout wrapper dashboard admin
│       ├── page.tsx                  # Ringkasan analitik & tata kelola sarpras
│       ├── fasilitas/page.tsx        # Master data sarana prasarana kampus (CRUD fasilitas)
│       ├── reservasi/page.tsx        # Audit log seluruh peminjaman sarpras kampus
│       ├── laporan/page.tsx          # Audit log seluruh laporan kendala fasilitas
│       ├── akun/page.tsx             # Kelola data pengguna & verifikasi pendaftaran akun
│       └── rekap/page.tsx            # Rekapitulasi data & ekspor laporan (CSV, Excel, PDF)
│
├── components/
│   ├── Navbar.tsx                    # Header navigasi adaptif 3-kolom anti-tabrakan
│   ├── Hero.tsx                      # Hero banner interaktif & tombol aksi cepat
│   ├── CampusMapArt.tsx              # Ilustrasi visual artistik peta kampus Undip
│   ├── FacilityTabs.tsx              # Visual denah lantai (floor plans) & spesifikasi ruang
│   ├── BuildingFeatures.tsx          # Komponen showcase keunggulan sarana prasarana (3 slide)
│   ├── FacilityCard.tsx              # Kartu item katalog sarpras
│   ├── FacilityFilterBar.tsx         # Bilah filter kategori & pencarian fasilitas
│   ├── CategorySidebar.tsx           # Sidebar filter tipe sarana prasarana
│   ├── SearchWidget.tsx              # Komponen widget pencarian fasilitas
│   ├── SchedulePreview.tsx           # Komponen pratinjau matriks jadwal slot waktu
│   ├── Flow.tsx                      # Diagram alur tahapan peminjaman
│   ├── Footer.tsx                    # Footer tautan informasi kampus & aksesibilitas
│   ├── ActionPromptModal.tsx         # Modal dialog konfirmasi terpadu (bebas alert/confirm bawaan)
│   ├── FacilityDetailModal.tsx       # Modal rincian spesifikasi & foto fasilitas
│   ├── ReservationDetailModal.tsx    # Modal rincian data peminjam & peruntukan kegiatan
│   ├── ReportDetailModal.tsx         # Modal rincian kerusakan & foto bukti laporan
│   └── dashboard/
│       └── DashboardShell.tsx        # Shell tata letak dashboard multi-peran dengan role guard
│
├── config/
│   └── site.ts                       # Konfigurasi konstanta waktu operasional & parameter sistem
│
├── context/
│   └── AppDataContext.tsx            # Client state management terpusat (Reservasi, Fasilitas, Laporan, Akun)
│
├── lib/
│   ├── api.ts                        # Klien HTTP backend Go + mapper backend->model frontend
│   ├── slots.ts                      # Logika kalkulasi, pembagian, dan validasi bentrok slot waktu
│   ├── cancellation.ts               # Aturan info batas waktu pembatalan mandiri (H-2 jam)
│   ├── dashboard-nav.ts              # Konfigurasi menu navigasi dashboard per peran
│   └── filter-facilities.ts          # Utilitas pencarian & filter sarana prasarana
│
├── models/
│   ├── facility.ts                   # Interface tipe data fasilitas kampus & slot waktu
│   ├── facilities-data.ts            # Metadata kategori filter katalog (bukan data)
│   ├── reservation.ts                # Interface tipe data reservasi peminjaman
│   ├── report.ts                     # Interface tipe data laporan kerusakan & antrean akun
│   └── user.ts                       # Tipe peran + akun backend (GET /user/me, /admin/show_user)
│
├── public/
│   ├── features/                     # Aset gambar visual fitur sarana prasarana (1400x680)
│   │   ├── slot-waktu-30-menit.png   # Slide 1: Matriks jadwal slot 30 menit
│   │   ├── pelaporan-kerusakan.png   # Slide 2: Form laporan kendala fasilitas
│   │   └── katalog-fasilitas.png     # Slide 3: Katalog & filter jenis fasilitas
│   ├── undip-hero.jpg                # Foto latar kampus Universitas Diponegoro
│   └── favicon.svg                   # Ikon web SVG
│
├── next.config.js                    # Mode dinamis + rewrites proxy /api -> backend Go
├── .env.local                        # NEXT_PUBLIC_API_URL + BACKEND_URL (gitignored)
├── package.json                      # Dependensi Next.js 16, React 19, TypeScript
└── tsconfig.json                     # Konfigurasi compiler TypeScript
```

---

## 🎨 Desain Sistem & Estetika Visual (*The Reserve at Ochoco*)

- **Palet Warna Harmonis & Arsitektural**:
  - *Deep Charcoal / Obsidian*: `#0E1217`, `#14171A`, `#1A1F24`
  - *Warm Brass & Gold Accent*: `#B59876`, `#937451`
  - *Clean Alabaster & Chalk*: `#F4F5F7`, `#FFFFFF`
  - *Muted Slate Borders*: `rgba(255, 255, 255, 0.1)`
- **Tipografi Modern**: Memanfaatkan font **Jost** (Google Fonts) untuk menghadirkan kesan geometris, bersih, dan formal.
- **Konsistensi Formulir & Dropdown**: Menggunakan implementasi dropdown arah bawah yang stabil di berbagai browser tanpa loncatan posisi.
- **Tata Letak Tabel Terstruktur**: Dilengkapi horizontal scroll internal yang halus, padding proporsional, serta badge status dengan kode warna kontras dan mudah dibaca.

---

## 🔌 Integrasi ke Backend Go

Frontend terhubung ke backend Go tanpa mock data:

1. **Central Data Layer**: `context/AppDataContext.tsx` memanggil backend via `lib/api.ts` (proxy `rewrites()` `/api/*` -> `http://127.0.0.1:8080/*`, cookie `session_id` HttpOnly). Modul tanpa endpoint backend (persetujuan/penolakan/pembatalan reservasi, ubah/hapus fasilitas, suspend akun, logout server, matriks slot publik) dinonaktifkan jujur di UI.
2. **Lapisan Autentikasi**: `POST /auth/login` + `GET /user/me` (role `1/2/3` -> admin/petugas/pengguna). Hanya akun backend terverifikasi.
3. **Konfigurasi Lingkungan**: `NEXT_PUBLIC_API_URL` (`/api`) dan `BACKEND_URL` di `.env.local` dan `config/site.ts`.

---

*Dikembangkan untuk Praktikum Pengembangan Perangkat Lunak Berbasis Komponen (PPK): Universitas Diponegoro.*
