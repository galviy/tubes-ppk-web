export default function CampusMapArt() {
  return (
    <svg viewBox="0 0 520 560" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(360 80) rotate(120) scale(420 380)">
          <stop stopColor="#3B82F6" stopOpacity="0.35" />
          <stop offset="1" stopColor="#3B82F6" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="520" height="560" fill="url(#glow)" />
      <g stroke="rgba(255,255,255,0.14)" strokeWidth="1">
        <line x1="0" y1="120" x2="520" y2="120" />
        <line x1="0" y1="240" x2="520" y2="240" />
        <line x1="0" y1="360" x2="520" y2="360" />
        <line x1="0" y1="480" x2="520" y2="480" />
        <line x1="130" y1="0" x2="130" y2="560" />
        <line x1="260" y1="0" x2="260" y2="560" />
        <line x1="390" y1="0" x2="390" y2="560" />
      </g>
      <path d="M70 470 C 140 380, 150 300, 230 260 S 360 190, 420 90" stroke="#8FB4FF" strokeWidth="2.5" strokeDasharray="2 10" strokeLinecap="round" />
      <g>
        <rect x="52" y="440" width="60" height="60" rx="10" fill="#1E3A8A" stroke="#5C8DFF" strokeWidth="1.5" />
        <rect x="66" y="454" width="10" height="10" fill="#8FB4FF" />
        <rect x="86" y="454" width="10" height="10" fill="#8FB4FF" />
        <rect x="66" y="472" width="10" height="10" fill="#5C8DFF" />
        <rect x="86" y="472" width="10" height="10" fill="#5C8DFF" />
      </g>
      <g>
        <rect x="200" y="232" width="70" height="70" rx="12" fill="#213A73" stroke="#5C8DFF" strokeWidth="1.5" />
        <path d="M235 240 L200 275 M235 240 L270 275" stroke="#8FB4FF" strokeWidth="1.5" />
        <circle cx="235" cy="240" r="5" fill="#8FB4FF" />
      </g>
      <g>
        <circle cx="410" cy="80" r="34" fill="#213A73" stroke="#5C8DFF" strokeWidth="1.5" />
        <path d="M394 80 a16 16 0 1 1 32 0 a16 16 0 1 1 -32 0" stroke="#8FB4FF" strokeWidth="1.5" />
      </g>
      <g>
        <rect x="330" y="380" width="90" height="56" rx="10" fill="#1E3A8A" stroke="#5C8DFF" strokeWidth="1.5" />
        <line x1="330" y1="408" x2="420" y2="408" stroke="#5C8DFF" />
        <line x1="358" y1="380" x2="358" y2="436" stroke="#5C8DFF" />
        <line x1="392" y1="380" x2="392" y2="436" stroke="#5C8DFF" />
      </g>
      <circle cx="82" cy="470" r="4" fill="#0D9488" />
      <circle cx="235" cy="267" r="4" fill="#C2740A" />
      <circle cx="410" cy="80" r="4" fill="#0D9488" />
      <circle cx="375" cy="408" r="4" fill="#0D9488" />
    </svg>
  );
}
