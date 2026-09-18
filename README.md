# SiPinjam — Sistem Reservasi & Pelaporan Fasilitas Kampus

Proyek Next.js (App Router) dengan output static export — hasil `npm run build`
adalah folder `/out` berisi HTML/CSS/JS murni per halaman, siap di-hosting di
static hosting mana pun tanpa Node.js server berjalan terus.

## Menjalankan

```bash
npm install
npm run dev      # buka http://localhost:3000
npm run build    # hasil statis ada di folder out/
npx serve out    # coba hasil build statis secara lokal
```

## Struktur folder

```
app/
  layout.tsx                Root layout — font, metadata, membungkus AppDataProvider
  globals.css                Seluruh design token & style (halaman publik + dashboard)
  page.tsx                   Beranda — hero saja, halaman singkat
  fasilitas/page.tsx          Route /fasilitas — filter lengkap + katalog fasilitas
  jadwal/page.tsx             Route /jadwal — pratinjau ketersediaan (slot 30 menit)
  panduan/page.tsx            Route /panduan — alur 3 langkah
  login/page.tsx              Route /login
  register/page.tsx           Route /register

  pengguna/
    layout.tsx                 Sidebar khusus Pengguna (dipakai semua halaman di bawahnya)
    page.tsx                   Menu ringkas /pengguna
    reservasi/page.tsx          Ajukan Reservasi
    riwayat/page.tsx            Riwayat Reservasi (+ batalkan)
    lapor/page.tsx              Lapor Kerusakan Fasilitas
    status-laporan/page.tsx     Status Laporan Saya

  petugas/
    layout.tsx                 Sidebar khusus Petugas
    page.tsx                   Menu ringkas /petugas
    dashboard/page.tsx          Ringkasan antrian
    reservasi/page.tsx          Antrian Reservasi (approve/reject + deteksi bentrok)
    laporan/page.tsx            Antrian Laporan (ubah status + tandai fasilitas perbaikan)

  admin/
    layout.tsx                 Sidebar khusus Admin
    page.tsx                   Menu ringkas /admin
    dashboard/page.tsx          Rekap ringkas
    fasilitas/page.tsx          Kelola data fasilitas (tambah/nonaktifkan)
    akun/page.tsx               Daftarkan akun langsung + verifikasi registrasi mandiri
    rekap/page.tsx              Rekap okupansi & kerusakan + ekspor CSV/Excel/PDF

components/                  Komponen tampilan (view) halaman publik
  Navbar.tsx, Hero.tsx, CampusMapArt.tsx, SearchWidget.tsx,
  CategorySidebar.tsx, FacilityCard.tsx, FacilityGrid.tsx,
  SchedulePreview.tsx, Flow.tsx, Footer.tsx
  dashboard/DashboardShell.tsx   Topbar + sidebar dipakai ulang oleh 3 layout di atas

context/
  AppDataContext.tsx          "Database" sementara sisi client (React Context)
                               — state facilities/reservations/reports/pendingAccounts
                               beserta semua fungsi mutasinya (approve, reject, dst),
                               plus state auth (currentUser, login, logout). Ganti isi
                               provider ini dengan pemanggilan API asli tanpa perlu
                               mengubah satu pun komponen tampilan.

mock/                        Data & "API" PALSU — sengaja dipisah dari kode utama.
  fake-users-db.ts             Daftar akun demo (email/password/role) — ganti/hapus
                                begitu ada database pengguna sungguhan.
  auth-api.ts                  Fungsi login()/registerSelf() berbentuk async, meniru
                                pemanggilan API sungguhan. Untuk hubungkan ke backend
                                asli: ganti isi dua fungsi ini jadi fetch() ke endpoint
                                kalian — AppDataContext dan halaman login/register
                                TIDAK perlu diubah sama sekali.

models/                      "Model" — definisi tipe data & data awal (seed)
  facility.ts                  Tipe: Facility, FacilityStatus, SlotState, dst.
  reservation.ts                Tipe: Reservation, ReservationStatus
  report.ts                     Tipe: Report, ReportStatus, PendingAccount
  facilities-data.ts            Data awal (mock) — fasilitas, reservasi, laporan, akun

lib/                         Logika bisnis murni, terpisah dari UI
  slots.ts                     Generate 26 slot 30 menit, tentukan status tiap slot
  filter-facilities.ts          Filter kategori/lokasi/kapasitas/status
```

## Peta halaman per aktor (sesuai user story)

| Aktor       | Route                                            |
|-------------|---------------------------------------------------|
| Pengunjung  | `/` (hero) · `/fasilitas` · `/jadwal` · `/panduan` — semua tanpa login |
| Pengguna    | `/pengguna/reservasi`, `/riwayat`, `/lapor`, `/status-laporan` |
| Petugas     | `/petugas/dashboard`, `/reservasi`, `/laporan`    |
| Admin       | `/admin/dashboard`, `/fasilitas`, `/akun`, `/rekap` |

## Akun demo untuk login

Halaman `/login` menampilkan daftar ini juga (tombol "Isi otomatis"):

| Role     | Email                        | Password    |
|----------|-------------------------------|-------------|
| Admin    | admin@sipinjam.ac.id          | admin123    |
| Petugas  | petugas@sipinjam.ac.id        | petugas123  |
| Pengguna | mahasiswa@sipinjam.ac.id      | mhs12345    |
| Pengguna | dosen@sipinjam.ac.id          | dosen123    |

Login sungguhan divalidasi terhadap `mock/fake-users-db.ts` (lihat bagian
`mock/` di atas). Dashboard `/pengguna`, `/petugas`, `/admin` terkunci —
kalau belum login dengan role yang sesuai, halaman menampilkan ajakan ke
`/login`, bukan langsung menampilkan isinya.

## Catatan implementasi

- **Autentikasi masih palsu** (lihat folder `mock/`), tapi alurnya sudah
  seperti login sungguhan: validasi email/password, redirect sesuai role,
  dan dashboard terkunci untuk role yang salah/belum login. Untuk backend
  asli, cukup ganti isi `mock/auth-api.ts` — tidak perlu menyentuh halaman
  login/register atau AppDataContext.
- **Registrasi mandiri** mengisi antrean "Verifikasi Registrasi Mandiri" di
  `/admin/akun`, tapi akun itu belum bisa dipakai login sungguhan di demo ini
  (password registrasi tidak disimpan ke `fake-users-db.ts`) — pada backend
  asli, verifikasi admin akan mengaktifkan baris pengguna di database.
- **Data transaksi masih in-memory** lewat `context/AppDataContext.tsx`
  (hilang saat refresh). Ganti fungsi-fungsi di provider ini
  (submitReservation, approveReservation, dst.) dengan pemanggilan API ke
  backend + database asli.
- Validasi slot 30 menit & deteksi bentrok jadwal saat ini berjalan di
  browser (`lib/slots.ts`) — sesuai ketentuan soal, validasi ini **wajib**
  diulang di sisi server pada implementasi akhir, bukan hanya di client.
