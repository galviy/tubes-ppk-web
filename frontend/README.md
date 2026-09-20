# SiPinjam — Sistem Reservasi & Pelaporan Fasilitas Kampus Universitas Diponegoro

Sistem informasi berbasis web modern untuk pengelolaan izin reservasi dan pelaporan kendala sarana prasarana akademik di lingkungan Universitas Diponegoro. Dibangun menggunakan **Next.js 16** (App Router, **Webpack** — lihat catatan bundler di bawah), **React 19**, TypeScript, dan Vanilla CSS dengan design system elegan bertema arsitektural kampus (*The Reserve at Ochoco*).

---

## 🚀 Menjalankan Aplikasi

```bash
npm install
npm run dev      # Jalankan development server di http://localhost:3000
npm run build    # Produksi static export (folder out/)
npx serve out    # Pratinjau hasil build statis lokal
```

> **Catatan bundler:** Next.js 16 defaultnya pakai Turbopack, tapi project ini
> sengaja dikunci ke **Webpack** (flag `--webpack` di script `dev` & `build`)
> karena Turbopack di versi ini punya bug hydration yang cukup terdokumentasi
> (event/tombol bisa tidak merespons walau build sukses). Kalau suatu saat mau
> coba Turbopack lagi, hapus flag `--webpack` di `package.json` — tapi **wajib**
> tes klik semua tombol utama langsung di browser dulu, jangan cuma andalkan
> `npm run build` yang sukses.

---

## 🏛️ Fitur & Arsitektur Sistem

1. **Autentikasi Terpadu di Hero Landing Page (`/#auth` & `?auth=register`)**
   - Halaman split terpisah lama telah diintegrasikan langsung ke kartu mengambang di hero beranda dengan deep-link langsung via URL hash/parameter.
   - Memiliki dua tab: **Masuk** (login dengan kredensial & quick demo button 1-klik) dan **Daftar Akun** (registrasi mandiri civitas akademika lengkap dengan Nama, Email, NIM/NIP, dan No. HP).
   - Menampilkan status sesi aktif langsung pada kartu jika pengguna telah login (disertai tombol akses dashboard per peran dan logout).

2. **Dialog & Penolakan Berbasis Modal UI/UX (`ActionPromptModal`)**
   - Seluruh interaksi penting (alasan penolakan reservasi, pembatalan darurat, penolakan laporan kerusakan, catatan resolusi perbaikan, konfirmasi kapasitas lebih, serta notifikasi bentrok jadwal) **tidak menggunakan dialog bawaan browser** (`prompt()`, `alert()`, `confirm()`).
   - Digantikan dengan dialog modal kustom yang terintegrasi penuh dengan tema visual aplikasi (mendukung validasi input, shortcut keyboard `Esc` dan `Ctrl+Enter`, serta badge penanda status).

3. **Kolom Tindakan & Status Sinkron (Bebas dari Teks Artifisial)**
   - Kolom tabel menggunakan penamaan natural **"Tindakan"** dengan perataan teks rapi di sisi kiri mengikuti kolom lainnya.
   - Pilihan dropdown langsung mencerminkan kondisi riil setiap baris data (misal: *Menunggu*, *Disetujui*, *Baru*, *Diproses*, *Aktif*, *Perbaikan*), tanpa placeholder generik yang kaku.
   - Status fasilitas disederhanakan menjadi **Aktif** dan **Perbaikan**.

4. **Manajemen Jadwal 30 Menit (07.00 – 20.00 WIB)**
   - 26 slot waktu modular 30 menit dengan pembagian periode (Pagi, Siang, Sore, Malam).
   - Pemilihan jam selesai dan jam mulai dapat dilakukan bebas secara manual kapan saja dengan navigasi keyboard (`Tab`) yang lancar.
   - Pencegahan bentrok peminjaman otomatis secara real-time dengan pengecekan interval `[start, end)`.

5. **17 User Stories Lengkap & Berperan Ganda**
   - **Pengunjung / Publik**: Eksplorasi katalog fasilitas, filter kategori, denah lantai (floor plans), dan cek matriks ketersediaan tanpa perlu login.
   - **Pengguna (Mahasiswa/Dosen)**: Pengajuan izin peminjaman ruangan/alat, pemantauan riwayat reservasi, pembatalan mandiri, pelaporan kerusakan fasilitas berlampirkan bukti, dan pengecekan status penanganan.
   - **Petugas**: Validasi permohonan reservasi (setujui / tolak berargumen), pembatalan darurat berargumen, tindak lanjut laporan kerusakan (proses / selesaikan dengan catatan resolusi / tolak), serta kontrol status operasional fasilitas (Aktif / Perbaikan).
   - **Admin**: Dashboard rekapitulasi, pengelolaan master data fasilitas, log audit seluruh reservasi fasilitas kampus (`/admin/reservasi`), log audit pelaporan sarpras (`/admin/laporan`), pendaftaran akun langsung (Petugas & Pengguna), verifikasi registrasi mandiri, serta ekspor laporan rekap (CSV, Excel, PDF).

---

## 📁 Struktur Folder

```
app/
  layout.tsx                Root layout (font Jost, metadata, AppDataProvider)
  globals.css               Design token & stylesheet sistem (publik & dashboard)
  page.tsx                  Landing page (Navbar, Hero Auth Card, Floor Plans, Features, Footer)
  fasilitas/page.tsx        Katalog fasilitas kampus lengkap dengan filter multi-kategori
  jadwal/page.tsx           Matriks jadwal ketersediaan slot 30 menit (07.00–20.00)
  panduan/page.tsx          Panduan alur 3 langkah reservasi & pelaporan kendala

  pengguna/
    layout.tsx              Layout dashboard pengguna
    page.tsx                Menu ringkasan & quick navigation pengguna
    reservasi/page.tsx       Form pengajuan reservasi dengan deteksi bentrok & slot 30 menit
    riwayat/page.tsx         Riwayat reservasi pengguna (+ pembatalan mandiri)
    lapor/page.tsx           Form pelaporan kerusakan sarpras (+ unggah bukti foto)
    status-laporan/page.tsx  Timeline progres tindak lanjut perbaikan laporan

  petugas/
    layout.tsx              Layout dashboard petugas
    page.tsx                Ringkasan antrean reservasi & laporan yang menunggu
    reservasi/page.tsx       Antrian reservasi (dropdown tindakan: Menunggu, Setujui, Tolak, Batalkan)
    laporan/page.tsx         Antrian laporan (tindak lanjut: Baru, Proses, Selesai, Tolak)
    fasilitas/page.tsx       Kontrol status operasional sarpras (Aktif / Perbaikan)

  admin/
    layout.tsx              Layout dashboard admin
    page.tsx                Ringkasan tata kelola fasilitas, reservasi, dan pengguna
    fasilitas/page.tsx       Kelola data master fasilitas (tambah, edit, ubah status)
    reservasi/page.tsx       Log audit seluruh reservasi fasilitas kampus (+ filter status & fasilitas)
    laporan/page.tsx         Log audit seluruh laporan kerusakan sarpras
    akun/page.tsx            Daftarkan akun langsung (Petugas/Admin/Pengguna) & verifikasi registrasi mandiri
    rekap/page.tsx           Rekap okupansi & kerusakan sarpras (ekspor CSV/Excel/PDF)

components/
  Navbar.tsx                Header adaptif publik & dashboard dengan navigasi terpusat
  Hero.tsx                  Hero section + Unified Auth Card (Masuk & Daftar Akun)
  FacilityTabs.tsx          Visual denah lantai (floor plans) & spesifikasi ruang
  BuildingFeatures.tsx      Daftar keunggulan sarana prasarana kampus
  Footer.tsx                Footer navigasi kampus & aksesibilitas
  ActionPromptModal.tsx     Komponen modal dialog kustom pengganti prompt/alert/confirm
  FacilityDetailModal.tsx   Modal rincian fasilitas & spesifikasi kapasitas
  ReservationDetailModal.tsx Modal rincian reservasi peminjam
  ReportDetailModal.tsx     Modal detail kerusakan & foto bukti laporan
  dashboard/DashboardShell.tsx Shell dashboard bersama (topbar, sub-navigasi teratur, guard izin akses)

config/
  site.ts                   Konfigurasi aturan operasional, jam kampus, dan rute API backend

context/
  AppDataContext.tsx        State management terpusat di sisi client (React Context)

lib/
  slots.ts                  Logika pembuatan & kalkulasi bentrok slot waktu 30 menit
  dashboard-nav.ts          Daftar menu navigasi dashboard per peran (tanpa duplikasi)
  filter-facilities.ts       Helper penyaringan fasilitas kampus

mock/
  fake-users-db.ts          Database akun demo civitas akademika
  auth-api.ts               Lapisan simulasi async API autentikasi

models/
  facility.ts               Definisi tipe data fasilitas, tipe, dan slot
  reservation.ts            Definisi tipe data peminjaman/reservasi
  report.ts                 Definisi tipe data laporan kerusakan & akun tertunda (+ NIM & No. HP)
```

---

## 👥 Akun Demo & Kredensial untuk Pengujian Cepat

Pada kartu autentikasi di landing page (`/#auth`), terdapat kotak **"AKUN DEMO (KLIK UNTUK ISI OTOMATIS)"** yang memungkinkan penguji untuk mengisi email dan kata sandi secara instan dengan satu klik:

| Peran          | Nama Akun               | Email                      | Kata Sandi  | Akses Halaman |
|----------------|-------------------------|----------------------------|-------------|---------------|
| **Admin**      | Admin                   | `admin@sipinjam.ac.id`     | `admin123`  | `/admin/*`    |
| **Petugas**    | Budi (Petugas)          | `petugas@sipinjam.ac.id`   | `petugas123`| `/petugas/*`  |
| **Mahasiswa**  | Sinta (Mahasiswa FSM)   | `mahasiswa@sipinjam.ac.id` | `mhs12345`  | `/pengguna/*` |
| **Dosen**      | Pak Herman (Dosen IF)   | `dosen@sipinjam.ac.id`     | `dosen123`  | `/pengguna/*` |

> [!NOTE]
> Kotak Akun Demo ini bersifat statis untuk 4 peran standar di atas dan tidak akan tercampur dengan akun dinamis baru yang didaftarkan secara manual oleh Admin di menu Kelola Akun.

---

## 🎨 Branding & Aksesibilitas Visual

- **Favicon Kustom SiPinjam**: Dilengkapi ikon vektor SVG (`/favicon.svg` & `app/icon.svg`) bergaya arsitektural kampus Undip dengan aksen warna deep charcoal (`#15171a`) dan brass gold (`#b59876`).
- **Dropdown Arah Bawah (`DownwardSelect`)**: Menghindari perilaku bawaan browser Chromium pada Windows yang sering membalikkan menu pilihan ke atas. Seluruh dropdown formulir (Unit Kerja, Peran Akses, Slot Waktu) dipastikan membuka ke bawah secara rapi dengan batas ketinggian maksimal dan scroll internal.
- **Label Metrik Formal**: Tidak menggunakan singkatan informal (misal: label ringkasan tertulis lengkap sebagai **"Menunggu Verifikasi"**).

---

## ⚙️ Catatan Integrasi Backend

1. **Autentikasi**: Untuk beralih ke backend sungguhan, fungsi di `mock/auth-api.ts` dapat langsung diarahkan ke endpoint REST/GraphQL backend tanpa perlu mengubah antarmuka komponen tampilan.
2. **State & Database**: `context/AppDataContext.tsx` bertindak sebagai lapisan abstraksi data. Fungsi-fungsi mutasi (`submitReservation`, `approveReservation`, `updateReportStatus`, dll.) siap dihubungkan ke panggilan HTTP API.
3. **Konfigurasi Terpusat**: Alamat server backend dapat dikonfigurasi melalui `config/site.ts` atau file environment (`.env.local`).
