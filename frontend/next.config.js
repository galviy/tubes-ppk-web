/** @type {import('next').NextConfig} */
const nextConfig = {
  // Mode dinamis (bukan `output: 'export'`) supaya `rewrites()` proxy
  // /api/* -> backend Go berjalan. Browser hanya kenal 1 origin
  // (localhost:3000) sehingga tidak kena blokir CORS dan cookie
  // session_id HttpOnly tetap terkirim via credentials:'include'.
  // Backend Go TIDAK diubah sama sekali.
  images: {
    unoptimized: true,
  },

  async rewrites() {
    const backend = process.env.BACKEND_URL || 'http://127.0.0.1:8080';
    return [
      {
        source: '/api/:path*',
        destination: `${backend}/:path*`,
      },
    ];
  },

  // PENTING (dev mode saja, tidak mempengaruhi hasil build/export):
  // Sejak Next.js 15.2.3+/16, dev server MEMBLOKIR diam-diam semua request
  // internal /_next/* kalau diakses dari origin selain localhost (mis. lewat
  // IP LAN seperti 192.168.x.x saat testing dari HP/laptop lain). Efeknya:
  // halaman tampil normal tapi semua tombol/interaksi mati total.
  // Tambahkan IP/hostname yang dipakai untuk akses dev server di sini.
  // Ganti/lengkapi sesuai IP jaringan kalian masing-masing.
  // allowedDevOrigins cuma menerima hostname/IP persis, atau wildcard
  // subdomain (mis. '*.contoh.dev') -- TIDAK menerima notasi CIDR (/24).
  // Kalau IP kalian berubah (DHCP), tambahkan IP barunya ke daftar ini.
  allowedDevOrigins: [
    '192.168.18.13',
    'localhost',
  ],
};

module.exports = nextConfig;
