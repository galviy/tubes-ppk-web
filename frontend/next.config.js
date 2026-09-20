/** @type {import('next').NextConfig} */
const nextConfig = {
  // Menghasilkan situs statis murni (folder /out) saat `npm run build`,
  // jadi hasil akhirnya bisa di-hosting di static hosting mana pun
  // tanpa perlu Node.js server berjalan terus.
  output: 'export',
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
