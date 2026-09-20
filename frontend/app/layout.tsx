import type { Metadata } from 'next';
import './globals.css';
import { AppDataProvider } from '@/context/AppDataContext';

export const metadata: Metadata = {
  title: 'SiPinjam - Sistem Reservasi & Pelaporan Fasilitas Undip',
  description:
    'Sistem Reservasi & Pelaporan Fasilitas Kampus — temukan fasilitas, cek ketersediaan jadwal, dan ajukan reservasi.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AppDataProvider>{children}</AppDataProvider>
      </body>
    </html>
  );
}
