# SiPinjam — Sistem Reservasi & Pelaporan Fasilitas Kampus Universitas Diponegoro

Sistem informasi berbasis web modern untuk pengelolaan izin reservasi dan pelaporan kendala sarana prasarana akademik di lingkungan Universitas Diponegoro. Dibangun menggunakan Next.js (App Router), TypeScript, dan Vanilla CSS dengan design system elegan bertema arsitektural kampus.

---

## 🚀 Menjalankan Aplikasi

```bash
npm install
npm run dev      # Jalankan development server di http://localhost:3000
npm run build    # Produksi static export (folder out/)
npx serve out    # Pratinjau hasil build statis lokal
```

---

## 🏛️ Fitur & Arsitektur Sistem

1. **Autentikasi Terpadu di Hero Landing Page (`/#auth`)**
   - Halaman split terpisah `/login` dan `/register` telah diintegrasikan langsung ke kartu mengambang di hero beranda.
   - Memiliki dua tab: **Masuk** (login dengan kredensial & quick demo button 1-klik) dan **Daftar Akun** (registrasi mandiri civitas akademika).
   - Menampilkan status sesi aktif langsung pada kartu jika pengguna telah login (disertai tombol akses dashboard per peran dan logout).

2. **Dialog & Penolakan Berbasis Modal UI/UX (`ActionPromptModal`)**
   - Seluruh interaksi penting (alasan penolakan reservasi, pembatalan darurat, penolakan laporan kerusakan, catatan resolusi perbaikan, konfirmasi kapasitas lebih, serta notifikasi bentrok jadwal) **tidak lagi menggunakan dialog bawaan browser** (`prompt()`, `alert()`, `confirm()`).
   - Digantikan dengan dialog modal kustom yang terintegrasi penuh dengan tema visual aplikasi (mendukung validasi input, shortcut keyboard `Esc` dan `Ctrl+Enter`, serta badge penanda status).

3. **Manajemen Jadwal 30 Menit (07.00 – 20.00 WIB)**
   - 26 slot waktu modular 30 menit dengan pembagian periode (Pagi, Siang, Sore, Malam).
   - Pencegahan bentrok peminjaman otomatis secara real-time.

4. **17 User Stories Lengkap & Berperan Ganda**
   - **Pengunjung / Publik**: Eksplorasi katalog fasilitas, filter kategori, denah lantai (floor plans), dan cek matriks ketersediaan tanpa perlu login.
   - **Pengguna (Mahasiswa/Dosen)**: Pengajuan izin peminjaman ruangan/alat, pemantauan riwayat reservasi, pembatalan mandiri, pelaporan kerusakan fasilitas berlampirkan bukti, dan pengecekan status penanganan.
   - **Petugas Sarpras**: Validasi permohonan reservasi (setujui / tolak berargumen), pembatalan darurat berargumen, tindak lanjut laporan kerusakan (proses / selesaikan dengan catatan resolusi / tolak), serta kontrol status operasional fasilitas (Aktif / Perbaikan).
   - **Admin Sarpras**: Dashboard rekapitulasi, pengelolaan master data fasilitas, pendaftaran akun langsung, verifikasi registrasi mandiri, serta ekspor laporan rekap (CSV, Excel, PDF).

---

## 📁 Struktur Folder

```
app/
  layout.tsx                Root layout (font Jost, metadata, AppDataProvider)
  globals.css               Design token & stylesheet sistem (publik & dashboard)
  page.tsx                  Landing page (Navbar, Hero Auth Card, Floor Plans, Features, Footer)
  fasilitas/page.tsx        Katalog fasilitas kampus lengkap dengan filter multi-kategori
  jadwal/page.tsx           Matriks jadwal ketersediaan slot 30 menit (07.00–20.00)

  pengguna/
    layout.tsx              Layout dashboard pengguna
    page.tsx                Menu ringkasan & quick navigation pengguna
    reservasi/page.tsx       Form pengajuan reservasi dengan deteksi bentrok & modal konfirmasi
    riwayat/page.tsx         Riwayat reservasi pengguna (+ pembatalan mandiri)
    lapor/page.tsx           Form pelaporan kerusakan sarpras (+ unggah bukti foto/video)
    status-laporan/page.tsx  Timeline progres tindak lanjut perbaikan laporan

  petugas/
    layout.tsx              Layout dashboard petugas
    page.tsx                Menu ringkasan petugas
    dashboard/page.tsx       Statistik antrean reservasi & kerusakan
    reservasi/page.tsx       Antrian reservasi (setujui/tolak dengan modal alasan)
    laporan/page.tsx         Antrian laporan (tindak lanjut/resolusi/tolak dengan modal)

  admin/
    layout.tsx              Layout dashboard admin
    page.tsx                Menu ringkasan admin
    dashboard/page.tsx       Metrik fasilitas, okupansi, dan pengguna
    fasilitas/page.tsx       Kelola data master fasilitas (tambah, edit, ubah status)
    akun/page.tsx            Daftarkan akun langsung & verifikasi registrasi mandiri
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
  dashboard/DashboardShell.tsx Shell dashboard bersama (topbar, navigasi, guard izin akses)

context/
  AppDataContext.tsx        State management terpusat di sisi client (React Context)

lib/
  slots.ts                  Logika pembuatan & kalkulasi bentrok slot waktu 30 menit
  filter-facilities.ts       Helper penyaringan fasilitas kampus

mock/
  fake-users-db.ts          Database akun demo civitas akademika
  auth-api.ts               Lapisan simulasi async API autentikasi

models/
  facility.ts               Definisi tipe data fasilitas, tipe, dan slot
  reservation.ts            Definisi tipe data peminjaman/reservasi
  report.ts                 Definisi tipe data laporan kerusakan & akun tertunda
```

---

## 👥 Akun Demo untuk Pengujian Cepat

Pada kartu autentikasi di landing page (`/#auth`), terdapat tombol **"Isi otomatis"** untuk mengisi email dan kata sandi secara instan:

| Role      | Email                      | Kata Sandi  | Akses Halaman |
|-----------|----------------------------|-------------|---------------|
| **Admin** | `admin@sipinjam.ac.id`     | `admin123`  | `/admin/*`    |
| **Petugas**| `petugas@sipinjam.ac.id`  | `petugas123`| `/petugas/*`  |
| **Mahasiswa** | `mahasiswa@sipinjam.ac.id` | `mhs12345`  | `/pengguna/*` |
| **Dosen** | `dosen@sipinjam.ac.id`     | `dosen123`  | `/pengguna/*` |

---

## ⚙️ Catatan Integrasi Backend

1. **Autentikasi**: Untuk beralih ke backend sungguhan, fungsi di `mock/auth-api.ts` dapat langsung diarahkan ke endpoint REST/GraphQL backend tanpa perlu mengubah antarmuka komponen tampilan.
2. **State & Database**: `context/AppDataContext.tsx` bertindak sebagai lapisan abstraksi data. Fungsi-fungsi mutasi (`submitReservation`, `approveReservation`, `updateReportStatus`, dll.) siap dihubungkan ke panggilan HTTP API.
3. **Validasi Server-Side**: Logika slot waktu dan bentrok jadwal di `lib/slots.ts` disarankan diimplementasikan ulang pada backend database transaksi untuk menjamin integritas data (ACID / locking).
