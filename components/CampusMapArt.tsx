export default function CampusMapArt() {
  return (
    <svg viewBox="0 0 600 500" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background grid pattern */}
      <defs>
        <pattern id="warmGrid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(194,159,123,0.12)" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="600" height="500" fill="url(#warmGrid)" />

      {/* Roads */}
      <path d="M0 200 H600" stroke="rgba(194,159,123,0.15)" strokeWidth="20" />
      <path d="M300 0 V500" stroke="rgba(194,159,123,0.15)" strokeWidth="20" />
      <path d="M0 350 H400" stroke="rgba(194,159,123,0.1)" strokeWidth="14" />

      {/* Buildings */}
      <rect x="60" y="60" width="120" height="80" rx="6" fill="rgba(194,159,123,0.2)" stroke="rgba(194,159,123,0.35)" />
      <text x="120" y="105" textAnchor="middle" fill="rgba(194,159,123,0.6)" fontSize="11" fontWeight="600">REKTORAT</text>

      <rect x="350" y="60" width="140" height="90" rx="6" fill="rgba(194,159,123,0.2)" stroke="rgba(194,159,123,0.35)" />
      <text x="420" y="110" textAnchor="middle" fill="rgba(194,159,123,0.6)" fontSize="11" fontWeight="600">GEDUNG A</text>

      <rect x="60" y="240" width="100" height="70" rx="6" fill="rgba(194,159,123,0.2)" stroke="rgba(194,159,123,0.35)" />
      <text x="110" y="280" textAnchor="middle" fill="rgba(194,159,123,0.6)" fontSize="11" fontWeight="600">LAB</text>

      <rect x="350" y="240" width="160" height="60" rx="6" fill="rgba(194,159,123,0.2)" stroke="rgba(194,159,123,0.35)" />
      <text x="430" y="275" textAnchor="middle" fill="rgba(194,159,123,0.6)" fontSize="11" fontWeight="600">GEDUNG B</text>

      <rect x="60" y="370" width="130" height="80" rx="6" fill="rgba(194,159,123,0.2)" stroke="rgba(194,159,123,0.35)" />
      <text x="125" y="415" textAnchor="middle" fill="rgba(194,159,123,0.6)" fontSize="11" fontWeight="600">AULA</text>

      <rect x="350" y="370" width="100" height="70" rx="6" fill="rgba(255,255,255,0.1)" stroke="rgba(194,159,123,0.35)" strokeDasharray="4 4" />
      <text x="400" y="410" textAnchor="middle" fill="rgba(194,159,123,0.6)" fontSize="10" fontWeight="600">LAPANGAN</text>

      {/* Accent dots */}
      <circle cx="120" cy="200" r="5" fill="rgba(194,159,123,0.5)" />
      <circle cx="300" cy="200" r="5" fill="rgba(194,159,123,0.5)" />
      <circle cx="420" cy="200" r="5" fill="rgba(194,159,123,0.5)" />
      <circle cx="300" cy="350" r="5" fill="rgba(194,159,123,0.5)" />
    </svg>
  );
}
