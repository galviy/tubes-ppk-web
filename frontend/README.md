# SiPinjam: Sistem Reservasi & Pelaporan Fasilitas Kampus Universitas Diponegoro

Sistem informasi berbasis web modern untuk pengelolaan izin reservasi ruangan/alat dan pelaporan kendala sarana prasarana akademik di lingkungan Universitas Diponegoro. Proyek ini dibangun menggunakan **Next.js 16** (App Router, **Webpack**), **React 19**, **TypeScript**, dan **Vanilla CSS** dengan arsitektur desain yang elegan, modular, serta aksesibel (*The Reserve at Ochoco*).

---

## Ringkasan Status Kesiapan Aplikasi

| Kategori | Status | Keterangan |
| :--- | :---: | :--- |
| **TypeScript Typecheck** | Lulus | `npx tsc --noEmit` bersih tanpa ada kesalahan tipe data (0 errors). |
| **Integrasi Backend** | Terhubung | Terintegrasi penuh ke Backend Go (`:8080`) dan Database MariaDB/MySQL Railway. |
| **Production Build** | Lulus | `npm run build` berhasil dikompilasi (mode dinamis dengan reverse proxy `rewrites()`). |
| **Autentikasi & Sesi** | Aman | Manajemen sesi dengan cookie HttpOnly `session_id` langsung dari backend Go (bebas CORS). |
| **Interaktivitas UI** | Aman | Menggunakan Webpack (`--webpack`) dan `AppDataContext` client-side state management terpadu. |
| **Akses Jaringan LAN** | Siap | Didukung konfigurasi `allowedDevOrigins` pada `next.config.js` untuk pengetesan lintas perangkat. |
| **User Stories** | Lengkap | Mencakup hak akses Publik, Pengguna (Mhs/Dosen/Staf), Petugas Sarpras, dan Admin. |

---

## Panduan Menjalankan Aplikasi (Fullstack)

### 1. Prasyarat Sistem
- **Node.js**: v18.18.0 atau versi yang lebih baru (disarankan LTS v20+)
- **npm**: v9.0.0 atau lebih baru
- **Golang**: v1.20+ (untuk menjalankan backend Go)
- **Database**: MariaDB / MySQL (lokal atau cloud Railway)

---

### 2. Langkah 1: Jalankan Backend Go

Buka terminal, masuk ke direktori `backend/`, lalu jalankan server:
```bash
cd backend
go run .
```
*Output yang menandakan backend berhasil:*
```text
Berhasil terkoneksi ke database MySQL!
Backend is starting on :8080
```

---

### 3. Langkah 2: Jalankan Frontend Next.js

Buka terminal terpisah, masuk ke direktori `frontend/`:

```bash
# 1. Pasang dependensi frontend
npm install

# 2. Jalankan server pengembangan (Development Mode)
npm run dev
# Buka peramban di: http://localhost:3000

# 3. Validasi typecheck TypeScript (opsional)
npx tsc --noEmit

# 4. Bangun bundel produksi (Production Mode)
npm run build
npm run start
# Buka peramban di: http://localhost:3000
```

> **Catatan Arsitektur (Proxy Rewrites):**  
> Frontend memanggil API backend via proxy Next.js `rewrites()` dari `/api/*` diteruskan ke `http://127.0.0.1:8080/*` (lihat `next.config.js` + `lib/api.ts`). Dengan skema ini, browser hanya mengenali 1 origin (`localhost:3000`) sehingga cookie `session_id` HttpOnly tersimpan aman tanpa isu CORS.

> **Catatan Bundler Webpack:**  
> Skrip `npm run dev` dan `npm run build` secara eksplisit menambahkan flag `--webpack`. Konfigurasi ini menjamin keandalan *hydration* event handler form interaktif, date picker, dan modal dialog kustom pada Next.js 16 tanpa interupsi cache Turbopack.

> **Catatan Akses Testing via Jaringan LAN (HP / Laptop Lain):**  
> Next.js membatasi request internal `/_next/*` jika diakses melalui IP selain localhost. Jika ingin mencoba tampilan dari HP atau perangkat lain di jaringan Wi-Fi yang sama, sesuaikan daftar IP Anda pada array `allowedDevOrigins` di file `next.config.js`.

---

## Akun Pengujian (Backend MySQL / Railway)

Login hanya menerima akun backend terverifikasi (`POST /auth/login` + `GET /user/me` via `lib/api.ts`). Berikut akun pengujian yang siap digunakan:

| Peran | Email | Kata Sandi | Lingkup Hak Akses |
| :--- | :--- | :--- | :--- |
| **Admin** | `galvindoser@gmail.com` | `Test@123` | `/admin/*`: Master fasilitas, audit reservasi & laporan, verifikasi akun, rekap data & ekspor. |
| **Petugas** | `petugas@sipinjam.ac.id` | `Petugas@123` | `/petugas/*`: Manajemen ketersediaan fasilitas, tindak lanjut & update status penanganan laporan kerusakan. |
| **Pengguna (Mahasiswa)** | `galvin@gmail.com` | `Lol@123` | `/pengguna/*`: Pengajuan pinjam ruang/alat, pembatalan mandiri, lapor sarpras rusak + bukti foto. |
| **Pengguna (Dosen)** | `dosen@sipinjam.ac.id` | `Dosen@123` | `/pengguna/*`: Pengajuan pinjam fasilitas ruang/alat akademik, pelaporan kendala sarpras. |
| **Pengguna (Staf)** | `staf@sipinjam.ac.id` | `Staf@123` | `/pengguna/*`: Pengajuan pinjam ruang aula/rapat, pelaporan inventaris sarana kampus. |

> Untuk menambah akun baru: daftar mandiri via `/register` (masuk antrean pending backend) lalu diverifikasi langsung di DB, atau dibuat langsung via menu admin (`POST /admin/create_user/*`).

---

## Fitur Unggulan & Implementasi Sistem

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
- **26 Slot Modular per Hari**: Terbagi rapi ke dalam 4 sesi harian (Pagi, Siang, Sore, Malam) untuk **Ruangan** maupun **Alat**.
- **Sinkronisasi Real-Time Backend (`GET /jadwal`)**: Slot waktu terhubung langsung dengan ketersediaan aktual di server Go.
- **Logika Visibilitas Slot & Siapa Cepat Dia Dapat**:
  - *Jadwal Publik & Pengguna Lain*: Slot yang masih berstatus `menunggu` persetujuan tetap bertuliskan **Tersedia** (hijau) agar pengguna lain tetap dapat mengajukan permohonan hingga ada yang disetujui (*ACC*) oleh petugas.
  - *Akun Pemesan Sendiri*: Slot yang diajukan tampil **Menunggu Persetujuan** (kuning) dan dinonaktifkan khusus untuk akun pemohon tersebut guna mencegah *double-booking*.
  - *Dashboard Petugas & Admin*: Menampilkan slot pending secara visual dan antrean verifikasi untuk segera disetujui atau ditolak.
  - *Slot Disetujui (ACC)*: Terkunci otomatis menjadi **Terpakai** (merah) untuk seluruh pengguna dan publik.

### 4. Batas Waktu Pengajuan Reservasi Paling Lambat H-2
- Sesuai kebijakan operasional sarpras kampus Undip, permohonan reservasi wajib diajukan minimal 2 hari kalender sebelum tanggal kegiatan (contoh: jika hari ini tanggal 25, pemesanan paling awal yang diizinkan adalah untuk tanggal 27).
- Sistem memvalidasi tanggal secara otomatis baik melalui pemilih tanggal (*date picker*), banner panduan, maupun dialog modal peringatan.

### 5. Kebijakan Pembatalan Terstruktur (`lib/cancellation.ts`)
- **Pembatalan Mandiri Pengguna**: Peminjam dapat membatalkan reservasi berstatus *Menunggu* atau *Disetujui* maksimal H-2 jam sebelum waktu kegiatan dimulai.
- **Pembatalan Darurat oleh Petugas/Admin**: Staf pengelola dapat membatalkan reservasi sewaktu-waktu jika terdapat kendala operasional mendadak, disertai alasan pembatalan resmi yang tercatat di audit log.

### 6. Sistem Pelaporan Kendala Sarpras & Bukti Foto
- **Formulir Laporan Kerusakan**: Formulir pelaporan kendala fisik fasilitas yang mendukung unggah file foto bukti visual (JPG/PNG maks. 2MB).
- **Tampilan Anti-Overflow**: Link lampiran foto pada tabel admin/petugas diringkas dengan tombol pratinjau thumbnail modal terpadu (`ReportDetailModal.tsx`), mencegah URL panjang merusak tata letak tabel.
- **Siklus Status Transparan**: Alur penanganan terukur dari status *Baru* ➔ *Diproses* ➔ *Selesai* (lengkap dengan catatan perbaikan teknisi) atau *Ditolak*.

### 7. Notifikasi Toast Mengambang (Floating Auto-Dismiss Pop-up)
- Menggantikan banner statis yang menempel di halaman dengan komponen *floating toast* di sudut layar (`.status-banner`).
- Dilengkapi animasi *slide-in*, tombol tutup instan, serta fitur *auto-dismiss* otomatis setelah 5 detik agar tidak mengganggu tata letak konten.

### 8. Dialog Interaktif Kustom (`ActionPromptModal`)
- Mengeliminasi penggunaan popup bawaan browser (`window.alert`, `window.confirm`, `window.prompt`).
- Seluruh konfirmasi kritis (penolakan izin, pembatalan darurat, catatan perbaikan sarpras) disajikan lewat modal terpadu dengan validasi input teks dan shortcut keyboard (`Esc` untuk membatalkan, `Ctrl+Enter` untuk submit).

### 9. Dashboard Multi-Peran & Presisi Tata Letak
- **Manajemen Akun Terdaftar & Proteksi Admin**: Admin dapat menonaktifkan akun civitas (`POST /admin/users/status`) atau menghapus akun. Sistem secara otomatis mendeteksi akun admin yang sedang aktif login dan melindunginya dari penonaktifan/penghapusan akun sendiri (*self-action protection*).
- **Manajemen Master Sarpras**: Tambah, ubah spesifikasi, dan kelola status operasional fasilitas (*Aktif* / *Perbaikan*).
- **Verifikasi Akun Baru**: Antrean pendaftaran mandiri civitas akademika diverifikasi oleh admin sebelum dapat mengajukan reservasi.
- **Filter Antrean Petugas**: Filter antrean berdasarkan tanggal kegiatan dan opsi pengurutan (*Antrean paling awal* vs *Terbaru*).
- **Rekapitulasi & Ekspor Multiformat**: Halaman `/admin/rekap` menyediakan rekapitulasi okupansi peminjaman dan riwayat kerusakan dengan opsi ekspor ke **CSV**, **Format Excel**, dan **Cetak PDF**.

---

## Struktur Berkas & Direktori Proyek

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

## Desain Sistem & Estetika Visual (*The Reserve at Ochoco*)

- **Palet Warna Harmonis & Arsitektural**:
  - *Deep Charcoal / Obsidian*: `#0E1217`, `#14171A`, `#1A1F24`
  - *Warm Brass & Gold Accent*: `#B59876`, `#937451`
  - *Clean Alabaster & Chalk*: `#F4F5F7`, `#FFFFFF`
  - *Muted Slate Borders*: `rgba(255, 255, 255, 0.1)`
- **Tipografi Modern**: Memanfaatkan font **Jost** (Google Fonts) untuk menghadirkan kesan geometris, bersih, dan formal.
- **Konsistensi Formulir & Dropdown**: Menggunakan implementasi dropdown arah bawah yang stabil di berbagai browser tanpa loncatan posisi.
- **Tata Letak Tabel Terstruktur**: Dilengkapi horizontal scroll internal yang halus, padding proporsional, serta badge status dengan kode warna kontras dan mudah dibaca.

---

## Integrasi ke Backend Go & Database MariaDB

Frontend terhubung langsung ke backend Go tanpa data tiruan (*zero mock data*):

1. **Central Data Layer**: Seluruh request data dialirkan melalui `context/AppDataContext.tsx` dan `lib/api.ts` memanfaatkan Next.js reverse proxy `rewrites()` (`/api/*` ➔ `http://127.0.0.1:8080/*`).
2. **Autentikasi & Manajemen Sesi**:
   - `POST /auth/login` memvalidasi kredensial dan menerbitkan cookie `session_id` (`HttpOnly`).
   - `GET /user/me` mengambil data sesi aktif dan memetakan hak akses dashboard berdasarkan role:
     - **Role 1**: Administrator (`/admin/*`)
     - **Role 2**: Petugas Sarpras (`/petugas/*`)
     - **Role 3**: Pengguna Civitas Akademika (`/pengguna/*`)
3. **Endpoint Backend yang Terhubung**:
   - **Fasilitas**: `GET /fasilitas`
   - **Reservasi**: `POST /reservasi/create_reservasi` & `GET /reservasi/list_reservasi`
   - **Pelaporan Kerusakan**: `POST /laporan/create_laporan` (*multipart/form-data* bukti foto) & `GET /laporan/list_laporan`
   - **Operasional Petugas**: `GET /petugas/reports`, `PATCH /petugas/reports/{id}` (update status & catatan penanganan), `PATCH /petugas/facilities/{id}/status`
   - **Administrasi**: `GET /admin/show_user`, `POST /admin/create_user/*`, verifikasi akun civitas akademika
4. **Konfigurasi Lingkungan**:
   - Backend Go membaca koneksi database MySQL/MariaDB dari file root `.env`.
   - Frontend dapat mengarahkan `BACKEND_URL` melalui `.env.local` saat backend berjalan di cloud/Railway.

---

*Dikembangkan untuk Praktikum Pengembangan Perangkat Lunak Berbasis Komponen (PPK): Universitas Diponegoro.*
