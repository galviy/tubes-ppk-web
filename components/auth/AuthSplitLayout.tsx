import Link from 'next/link';
import CampusMapArt from '@/components/CampusMapArt';

interface FeatureMini {
  num: string;
  title: string;
  desc: string;
}

interface AuthSplitLayoutProps {
  topRightLabel: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  features: FeatureMini[];
  children: React.ReactNode;
}

export default function AuthSplitLayout({ topRightLabel, eyebrow, title, subtitle, features, children }: AuthSplitLayoutProps) {
  return (
    <div className="auth-split">
      <div className="auth-split-left">
        <div className="asl-map"><CampusMapArt /></div>
        <div className="asl-overlay">
          <Link href="/" className="asl-brand">
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
              <rect width="30" height="30" rx="9" fill="#fff" fillOpacity="0.12" />
              <path d="M8 20L15 9L22 20" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M11 20L15 13L19 20" stroke="#8FB4FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            SiPinjam
          </Link>

          <div className="asl-content">
            <span className="asl-pill">Portal Sarana &amp; Prasarana Kampus</span>
            <h1>Satu akun untuk semua urusan fasilitas kampus</h1>
            <p>Cek jadwal, ajukan reservasi, dan laporkan kerusakan tanpa perlu antre ke loket sarpras.</p>

            <div className="asl-features">
              {features.map((f) => (
                <div key={f.num} className="asl-feature-card">
                  <span className="asl-feature-num">{f.num}</span>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="auth-split-right">
        <div className="asr-top">
          <span>{topRightLabel}</span>
        </div>
        <div className="asr-form-wrap">
          <span className="asr-eyebrow">{eyebrow}</span>
          <h2>{title}</h2>
          <p className="asr-sub">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
