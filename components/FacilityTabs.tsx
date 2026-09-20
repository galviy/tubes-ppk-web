'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAppData } from '@/context/AppDataContext';

interface SpaceOverview {
  type: string;
  category: string;
  dimensions: string;
  description: string;
  bookingUrl: string;
}

const DEFAULT_OVERVIEWS: Record<string, Omit<SpaceOverview, 'type'>> = {
  'Ruang Kelas': {
    category: 'Ruang Perkuliahan & Seminar',
    dimensions: '10.5m × 7.8m (81.9 m²)',
    description:
      'Ruang kelas akademik modern ber-AC dengan tata pencahayaan alami, whiteboard, dan smart display interaktif. Tersedia untuk perkuliahan reguler, ujian, seminar, maupun diskusi kelompok dengan slot waktu 30 menit (jam operasional 07.00–20.00).',
    bookingUrl: '/jadwal?facility=b201',
  },
  'Aula': {
    category: 'Gedung Serbaguna & Seremonial',
    dimensions: '22.0m × 14.5m (319 m²)',
    description:
      'Aula serbaguna dengan panggung utama representatif, ruang persiapan backstage, sound system berdaya tinggi, dan proyektor resolusi tinggi. Ideal untuk wisuda mini, seminar nasional, orasi ilmiah, dan perhelatan akbar organisasi mahasiswa.',
    bookingUrl: '/jadwal?facility=aula',
  },
  'Laboratorium': {
    category: 'Laboratorium Komputer & Riset',
    dimensions: '14.0m × 8.5m (119 m²)',
    description:
      'Laboratorium komputer berpendingin ganda dilengkapi unit PC berkecepatan tinggi, koneksi internet gigabit dedicated, dan server lokal. Siap digunakan untuk praktikum pemrograman, komputasi numerik, dan riset akademik.',
    bookingUrl: '/jadwal?facility=lab-ti',
  },
  'Lapangan': {
    category: 'Sarana Olahraga Outdoor / Indoor',
    dimensions: '30.0m × 18.0m (540 m²)',
    description:
      'Lapangan olahraga multifungsi (futsal, basket, bulutangkis) dengan permukaan taraflex anti-slip, garis lapangan standar turnamen, lampu sorot penerangan malam, dan bangku pemain cadangan untuk kegiatan ekstrakurikuler serta kompetisi.',
    bookingUrl: '/jadwal?facility=futsal',
  },
  'Alat': {
    category: 'Peralatan Audio Visual & Presentasi',
    dimensions: 'Unit Box Portable (Flight Case)',
    description:
      'Peralatan penunjang kegiatan akademik portabel mencakup proyektor resolusi tinggi, mikrofon nirkabel (wireless mic), active speaker portable, dan kabel gulung. Tersedia untuk dipinjam dosen maupun mahasiswa dengan verifikasi petugas.',
    bookingUrl: '/jadwal?facility=proj3',
  },
};

/* Architectural 2D Floor Plan Drawings */
function ArchitecturalPlan({ type, label }: { type: string; label: string }) {
  const typeLower = type.toLowerCase();

  // 1. Ruang Kelas
  if (typeLower.includes('kelas') || typeLower.includes('kuliah')) {
    return (
      <svg viewBox="0 0 540 380" fill="none" xmlns="http://www.w3.org/2000/svg" className="ochoco-fp-svg">
        <rect width="540" height="380" fill="#FCFCFC" rx="4" />
        <rect x="50" y="30" width="440" height="300" stroke="#222" strokeWidth="6" fill="#FFF" />

        {/* Door with 90-degree swing arc */}
        <line x1="50" y1="270" x2="50" y2="330" stroke="#FFF" strokeWidth="8" />
        <path d="M50 330 A 50 50 0 0 1 100 280" stroke="#777" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
        <line x1="50" y1="330" x2="50" y2="280" stroke="#222" strokeWidth="2.5" />
        <text x="60" y="315" fontSize="9" fill="#888" fontFamily="var(--font)">PINTU MASUK</text>

        {/* Windows on top wall */}
        <line x1="140" y1="30" x2="260" y2="30" stroke="#0ea5e9" strokeWidth="4" />
        <line x1="300" y1="30" x2="420" y2="30" stroke="#0ea5e9" strokeWidth="4" />
        <text x="180" y="24" fontSize="8" fill="#0ea5e9" fontFamily="var(--font)">JENDELA UTARA</text>

        {/* Front Stage / Podium */}
        <rect x="130" y="60" width="280" height="30" rx="3" fill="#F4EDE6" stroke="#b59876" strokeWidth="1.5" />
        <text x="270" y="79" fontSize="10" fontWeight="600" fill="#b59876" textAnchor="middle" fontFamily="var(--font)">
          SMARTBOARD & WHITEBOARD INTERAKTIF
        </text>

        {/* Lecturer Desk & Chair */}
        <rect x="235" y="105" width="70" height="26" rx="2" fill="#EAEAEA" stroke="#444" strokeWidth="1.5" />
        <circle cx="270" cy="142" r="8" fill="#FFF" stroke="#444" strokeWidth="1.5" />
        <text x="270" y="121" fontSize="9" fill="#444" textAnchor="middle" fontFamily="var(--font)">MEJA DOSEN</text>

        {/* Student Desk Matrix */}
        {[0, 1, 2, 3].map((row) => (
          <g key={row}>
            {/* Left Bank */}
            <rect x="90" y={170 + row * 36} width="140" height="18" rx="2" fill="#F8F8F8" stroke="#555" strokeWidth="1.2" />
            <circle cx="120" cy={195 + row * 36} r="6" fill="#FFF" stroke="#555" strokeWidth="1.2" />
            <circle cx="160" cy={195 + row * 36} r="6" fill="#FFF" stroke="#555" strokeWidth="1.2" />
            <circle cx="200" cy={195 + row * 36} r="6" fill="#FFF" stroke="#555" strokeWidth="1.2" />

            {/* Right Bank */}
            <rect x="310" y={170 + row * 36} width="140" height="18" rx="2" fill="#F8F8F8" stroke="#555" strokeWidth="1.2" />
            <circle cx="340" cy={195 + row * 36} r="6" fill="#FFF" stroke="#555" strokeWidth="1.2" />
            <circle cx="380" cy={195 + row * 36} r="6" fill="#FFF" stroke="#555" strokeWidth="1.2" />
            <circle cx="420" cy={195 + row * 36} r="6" fill="#FFF" stroke="#555" strokeWidth="1.2" />
          </g>
        ))}

        {/* Dimension Callouts */}
        <line x1="50" y1="350" x2="490" y2="350" stroke="#b59876" strokeWidth="1" />
        <line x1="50" y1="345" x2="50" y2="355" stroke="#b59876" strokeWidth="1" />
        <line x1="490" y1="345" x2="490" y2="355" stroke="#b59876" strokeWidth="1" />
        <text x="270" y="365" fontSize="10" fontWeight="600" fill="#b59876" textAnchor="middle" fontFamily="var(--font)">
          ◄─── PANJANG: 10.5 M ───►
        </text>
      </svg>
    );
  }

  // 2. Aula
  if (typeLower.includes('aula') || typeLower.includes('serbaguna')) {
    return (
      <svg viewBox="0 0 540 380" fill="none" xmlns="http://www.w3.org/2000/svg" className="ochoco-fp-svg">
        <rect width="540" height="380" fill="#FCFCFC" rx="4" />
        <rect x="40" y="25" width="460" height="310" stroke="#222" strokeWidth="6" fill="#FFF" />

        {/* Double entrance doors at bottom */}
        <line x1="220" y1="335" x2="320" y2="335" stroke="#FFF" strokeWidth="8" />
        <path d="M220 335 A 40 40 0 0 1 260 295" stroke="#777" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
        <line x1="220" y1="335" x2="260" y2="295" stroke="#222" strokeWidth="2.5" />
        <path d="M320 335 A 40 40 0 0 0 280 295" stroke="#777" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
        <line x1="320" y1="335" x2="280" y2="295" stroke="#222" strokeWidth="2.5" />
        <text x="270" y="325" fontSize="9" fill="#888" textAnchor="middle" fontFamily="var(--font)">FOYER & PINTU GANDA</text>

        {/* Grand Stage at Top */}
        <rect x="70" y="45" width="400" height="60" rx="4" fill="#F4EDE6" stroke="#b59876" strokeWidth="2" />
        <text x="270" y="78" fontSize="12" fontWeight="700" fill="#b59876" textAnchor="middle" fontFamily="var(--font)">
          PANGGUNG UTAMA & PODIUM VIP
        </text>

        {/* Backstage Wing Rooms */}
        <rect x="70" y="45" width="70" height="60" fill="#FFF" stroke="#444" strokeWidth="1.5" />
        <text x="105" y="78" fontSize="8" fill="#666" textAnchor="middle" fontFamily="var(--font)">BACKSTAGE L</text>
        <rect x="400" y="45" width="70" height="60" fill="#FFF" stroke="#444" strokeWidth="1.5" />
        <text x="435" y="78" fontSize="8" fill="#666" textAnchor="middle" fontFamily="var(--font)">BACKSTAGE R</text>

        {/* VIP Round Tables Row */}
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <circle cx={120 + i * 100} cy={135} r="18" fill="#EFEFEF" stroke="#b59876" strokeWidth="1.5" />
            <circle cx={120 + i * 100} cy={135} r="5" fill="#b59876" />
          </g>
        ))}
        <text x="270" y="165" fontSize="9" fill="#888" textAnchor="middle" fontFamily="var(--font)">MEJA VIP BUNDAR MODULAR</text>

        {/* Audience Theater Seating Grid */}
        {[0, 1, 2].map((r) => (
          <g key={r}>
            {[0, 1, 2, 3, 4, 5, 6, 7].map((c) => (
              <rect
                key={c}
                x={80 + c * 48}
                y={180 + r * 32}
                width="36"
                height="16"
                rx="2"
                fill="#FFF"
                stroke="#555"
                strokeWidth="1.2"
              />
            ))}
          </g>
        ))}

        {/* Sound Engineer Console in back */}
        <rect x="400" y="275" width="80" height="35" rx="3" fill="#333" />
        <text x="440" y="296" fontSize="8" fill="#FFF" textAnchor="middle" fontFamily="var(--font)">KONTROL AUDIO FOH</text>
      </svg>
    );
  }

  // 3. Laboratorium
  if (typeLower.includes('lab')) {
    return (
      <svg viewBox="0 0 540 380" fill="none" xmlns="http://www.w3.org/2000/svg" className="ochoco-fp-svg">
        <rect width="540" height="380" fill="#FCFCFC" rx="4" />
        <rect x="50" y="30" width="440" height="300" stroke="#222" strokeWidth="6" fill="#FFF" />

        {/* Door bottom left */}
        <line x1="50" y1="260" x2="50" y2="320" stroke="#FFF" strokeWidth="8" />
        <path d="M50 320 A 45 45 0 0 1 95 275" stroke="#777" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
        <line x1="50" y1="320" x2="95" y2="275" stroke="#222" strokeWidth="2" />

        {/* Server Rack Closet Top Right */}
        <rect x="400" y="30" width="90" height="70" fill="#181D24" stroke="#222" strokeWidth="2" />
        <text x="445" y="62" fontSize="9" fontWeight="700" fill="#b59876" textAnchor="middle" fontFamily="var(--font)">
          SERVER RACK
        </text>
        <text x="445" y="76" fontSize="7.5" fill="#FFF" textAnchor="middle" fontFamily="var(--font)">GIGABIT HUB</text>

        {/* Projector Screen & Instructor Console */}
        <rect x="130" y="45" width="220" height="12" rx="2" fill="#b59876" />
        <text x="240" y="40" fontSize="9" fontWeight="600" fill="#b59876" textAnchor="middle" fontFamily="var(--font)">
          LAYAR PROYEKTOR 120"
        </text>
        <rect x="200" y="70" width="80" height="24" rx="2" fill="#EAEAEA" stroke="#333" strokeWidth="1.5" />
        <text x="240" y="85" fontSize="8" fill="#333" textAnchor="middle" fontFamily="var(--font)">INSTRUKTUR</text>

        {/* 3 Computer Island Benches */}
        {[0, 1, 2].map((island) => (
          <g key={island}>
            <rect x="90" y={115 + island * 65} width="340" height="34" rx="3" fill="#F7F7F7" stroke="#444" strokeWidth="1.5" />
            {/* Monitor Icons */}
            {[0, 1, 2, 3, 4, 5, 6, 7].map((pc) => (
              <g key={pc}>
                <rect x={105 + pc * 40} y={120 + island * 65} width="22" height="10" rx="1" fill="#181D24" />
                <circle cx={116 + pc * 40} cy={140 + island * 65} r="4" fill="#FFF" stroke="#444" strokeWidth="1.2" />
              </g>
            ))}
          </g>
        ))}

        {/* Cable Floor Duct Callout */}
        <text x="260" y="318" fontSize="9" fill="#888" textAnchor="middle" fontFamily="var(--font)">
          FLOOR RACEWAY & HIGH-SPEED RJ45 CONDUIT
        </text>
      </svg>
    );
  }

  // 4. Lapangan
  if (typeLower.includes('lapangan') || typeLower.includes('olahraga')) {
    return (
      <svg viewBox="0 0 540 380" fill="none" xmlns="http://www.w3.org/2000/svg" className="ochoco-fp-svg">
        <rect width="540" height="380" fill="#FCFCFC" rx="4" />
        <rect x="40" y="25" width="460" height="310" stroke="#222" strokeWidth="6" fill="#FFF" />

        {/* Court Floor */}
        <rect x="80" y="55" width="380" height="240" rx="4" fill="#FDFBF7" stroke="#b59876" strokeWidth="2.5" />

        {/* Halfway line & Center Circle */}
        <line x1="270" y1="55" x2="270" y2="295" stroke="#b59876" strokeWidth="2" />
        <circle cx="270" cy="175" r="40" stroke="#b59876" strokeWidth="2" fill="none" />
        <circle cx="270" cy="175" r="4" fill="#b59876" />

        {/* Goal Areas Left & Right */}
        <rect x="80" y="115" width="50" height="120" stroke="#b59876" strokeWidth="2" fill="none" />
        <rect x="410" y="115" width="50" height="120" stroke="#b59876" strokeWidth="2" fill="none" />

        {/* Bleachers / Spectator Seating on Top */}
        <rect x="80" y="30" width="380" height="18" fill="#EEE" stroke="#777" strokeWidth="1" />
        <text x="270" y="42" fontSize="8.5" fill="#555" textAnchor="middle" fontFamily="var(--font)">TRIBUN PENONTON KAPASITAS 100</text>

        {/* Player Bench & Referee */}
        <rect x="150" y="300" width="100" height="18" fill="#EAEAEA" stroke="#555" strokeWidth="1" />
        <text x="200" y="312" fontSize="8" fill="#333" textAnchor="middle" fontFamily="var(--font)">BENCH TIM A</text>
        <rect x="290" y="300" width="100" height="18" fill="#EAEAEA" stroke="#555" strokeWidth="1" />
        <text x="340" y="312" fontSize="8" fill="#333" textAnchor="middle" fontFamily="var(--font)">BENCH TIM B</text>
      </svg>
    );
  }

  // 5. Alat
  if (typeLower.includes('alat') || typeLower.includes('proyektor')) {
    return (
      <svg viewBox="0 0 540 380" fill="none" xmlns="http://www.w3.org/2000/svg" className="ochoco-fp-svg">
        <rect width="540" height="380" fill="#FCFCFC" rx="4" />
        {/* Outer Case / Storage Shelf */}
        <rect x="50" y="30" width="440" height="300" stroke="#222" strokeWidth="5" rx="8" fill="#FFF" />

        {/* Main Flight Case Header */}
        <rect x="60" y="40" width="420" height="32" rx="4" fill="#181D24" />
        <text x="270" y="60" fontSize="11" fontWeight="700" fill="#b59876" textAnchor="middle" fontFamily="var(--font)">
          UNIT PENYIMPANAN & KOPER ALAT MULTIMEDIA (AV KIT)
        </text>

        {/* Compartment 1: Proyektor Portable */}
        <rect x="75" y="90" width="170" height="110" rx="6" fill="#F8F8F8" stroke="#b59876" strokeWidth="2" />
        <rect x="95" y="110" width="130" height="60" rx="4" fill="#181D24" />
        <circle cx="160" cy="140" r="20" stroke="#b59876" strokeWidth="3" fill="#333" />
        <circle cx="160" cy="140" r="10" fill="#0ea5e9" />
        <text x="160" y="188" fontSize="9" fontWeight="600" fill="#181D24" textAnchor="middle" fontFamily="var(--font)">
          PROYEKTOR LASER 4500 LUMENS
        </text>

        {/* Compartment 2: Wireless Mic Station */}
        <rect x="275" y="90" width="190" height="110" rx="6" fill="#F8F8F8" stroke="#555" strokeWidth="1.5" />
        <rect x="295" y="110" width="150" height="24" rx="3" fill="#EAEAEA" stroke="#444" strokeWidth="1.2" />
        <circle cx="315" cy="122" r="5" fill="#16a34a" />
        <circle cx="330" cy="122" r="5" fill="#16a34a" />
        <line x1="295" y1="122" x2="280" y2="105" stroke="#222" strokeWidth="2" />
        <line x1="445" y1="122" x2="460" y2="105" stroke="#222" strokeWidth="2" />
        <rect x="310" y="145" width="50" height="12" rx="4" fill="#333" />
        <rect x="380" y="145" width="50" height="12" rx="4" fill="#333" />
        <text x="370" y="188" fontSize="9" fontWeight="600" fill="#181D24" textAnchor="middle" fontFamily="var(--font)">
          RECEIVER + 2x WIRELESS MIC UHF
        </text>

        {/* Compartment 3: Portable Speaker Active */}
        <rect x="75" y="215" width="170" height="95" rx="6" fill="#F8F8F8" stroke="#555" strokeWidth="1.5" />
        <rect x="105" y="225" width="110" height="60" rx="4" fill="#181D24" />
        <circle cx="160" cy="255" r="18" stroke="#777" strokeWidth="2" fill="#222" />
        <circle cx="160" cy="255" r="8" fill="#b59876" />
        <text x="160" y="298" fontSize="8.5" fill="#555" textAnchor="middle" fontFamily="var(--font)">
          PORTABLE ACTIVE SPEAKER
        </text>

        {/* Compartment 4: Cables & Tripod Accessories */}
        <rect x="275" y="215" width="190" height="95" rx="6" fill="#F8F8F8" stroke="#555" strokeWidth="1.5" />
        <circle cx="330" cy="255" r="18" stroke="#444" strokeWidth="3" strokeDasharray="4 2" fill="none" />
        <text x="330" y="258" fontSize="7" fill="#666" textAnchor="middle">HDMI 20M</text>
        <circle cx="410" cy="255" r="18" stroke="#444" strokeWidth="3" strokeDasharray="4 2" fill="none" />
        <text x="410" y="258" fontSize="7" fill="#666" textAnchor="middle">POWER 30M</text>
        <text x="370" y="298" fontSize="8.5" fill="#555" textAnchor="middle" fontFamily="var(--font)">
          KABEL HDMI, AUDIO JACK & TRIPOD
        </text>
      </svg>
    );
  }

  // 6. Dynamic CAD Blueprint for custom newly added room types
  return (
    <svg viewBox="0 0 540 380" fill="none" xmlns="http://www.w3.org/2000/svg" className="ochoco-fp-svg">
      <rect width="540" height="380" fill="#FCFCFC" rx="4" />
      <rect x="45" y="25" width="450" height="315" stroke="#181D24" strokeWidth="6" fill="#FFF" />

      {/* Door arc */}
      <line x1="45" y1="265" x2="45" y2="325" stroke="#FFF" strokeWidth="8" />
      <path d="M45 325 A 48 48 0 0 1 93 277" stroke="#888" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
      <line x1="45" y1="325" x2="93" y2="277" stroke="#181D24" strokeWidth="2.5" />
      <text x="55" y="312" fontSize="9" fill="#888" fontFamily="var(--font)">PINTU MASUK</text>

      {/* Windows */}
      <line x1="120" y1="25" x2="250" y2="25" stroke="#0ea5e9" strokeWidth="4" />
      <line x1="290" y1="25" x2="420" y2="25" stroke="#0ea5e9" strokeWidth="4" />
      <text x="185" y="20" fontSize="8" fill="#0ea5e9" fontFamily="var(--font)">JENDELA UTARA</text>

      {/* Header Plaque */}
      <rect x="110" y="55" width="320" height="32" rx="4" fill="#F5EFEB" stroke="#b59876" strokeWidth="1.5" />
      <text x="270" y="75" fontSize="11" fontWeight="700" fill="#b59876" textAnchor="middle" fontFamily="var(--font)">
        {label.toUpperCase()}
      </text>

      {/* Center Table */}
      <rect x="130" y="115" width="280" height="120" rx="8" fill="#F8F8F8" stroke="#444" strokeWidth="1.5" />
      <text x="270" y="178" fontSize="10" fontWeight="600" fill="#666" textAnchor="middle" fontFamily="var(--font)">
        ZONA MODULAR ARSITEKTURAL
      </text>

      {/* Chairs */}
      {[0, 1, 2, 3].map((i) => (
        <g key={`top-${i}`}>
          <circle cx={165 + i * 70} cy={102} r="7" fill="#FFF" stroke="#444" strokeWidth="1.5" />
          <circle cx={165 + i * 70} cy={248} r="7" fill="#FFF" stroke="#444" strokeWidth="1.5" />
        </g>
      ))}

      {/* Dimension Line */}
      <line x1="45" y1="355" x2="495" y2="355" stroke="#b59876" strokeWidth="1" />
      <line x1="45" y1="350" x2="45" y2="360" stroke="#b59876" strokeWidth="1" />
      <line x1="495" y1="350" x2="495" y2="360" stroke="#b59876" strokeWidth="1" />
      <text x="270" y="370" fontSize="10" fontWeight="600" fill="#b59876" textAnchor="middle" fontFamily="var(--font)">
        ◄─── TATA RUANG MODULAR KAMPUS ───►
      </text>
    </svg>
  );
}

export default function FacilityTabs() {
  const { facilities } = useAppData();

  // Dynamic types derived from master data (automatically includes new types added in Admin)
  const types = useMemo(() => {
    const list = Array.from(new Set(facilities.map((f) => f.type))).filter(Boolean);
    return list.length > 0 ? list : ['Ruang Kelas', 'Aula', 'Laboratorium', 'Lapangan', 'Alat'];
  }, [facilities]);

  const [activeTab, setActiveTab] = useState(0);

  // Guard against activeTab out of range
  const safeTab = activeTab < types.length ? activeTab : 0;
  const currentType = types[safeTab] || 'Ruang Kelas';

  // Construct high-level general space overview
  const overview = useMemo<SpaceOverview>(() => {
    // If standard default type with pre-configured architectural dimensions:
    if (DEFAULT_OVERVIEWS[currentType]) {
      const matchingFacility = facilities.find((f) => f.type === currentType);
      return {
        type: currentType,
        ...DEFAULT_OVERVIEWS[currentType],
        bookingUrl: matchingFacility ? `/jadwal?facility=${matchingFacility.id}` : DEFAULT_OVERVIEWS[currentType].bookingUrl,
      };
    }

    // For any custom facility type added/edited from admin dashboard
    const matchingFacility = facilities.find((f) => f.type === currentType);
    return {
      type: currentType,
      category: currentType,
      dimensions: matchingFacility?.loc || 'Gedung Kampus Undip',
      description:
        matchingFacility?.desc ||
        `Fasilitas ${currentType.toLowerCase()} modern Universitas Diponegoro untuk menunjang kegiatan perkuliahan, kolaborasi, dan kemahasiswaan.`,
      bookingUrl: matchingFacility ? `/jadwal?facility=${matchingFacility.id}` : '/jadwal',
    };
  }, [currentType, facilities]);

  return (
    <section className="ochoco-fp-section" id="floor-plans">
      <div className="ochoco-fp-container">
        {/* Header Row: Title left, dynamic space tabs right */}
        <div className="ochoco-fp-header">
          <h2 className="ochoco-fp-title">
            <span style={{ color: '#b59876' }}>FLOOR</span>
            <br />
            PLANS
          </h2>

          <ul className="ochoco-fp-tabs-list" role="tablist">
            {types.map((type, i) => (
              <li key={type}>
                <button
                  type="button"
                  role="tab"
                  className={`ochoco-fp-tab-btn ${i === safeTab ? 'active' : ''}`}
                  onClick={() => setActiveTab(i)}
                  aria-selected={i === safeTab}
                >
                  {type.toUpperCase()}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Content Row: 2 columns matching initial elegant architectural style */}
        <div className="ochoco-fp-content">
          {/* Left: Architectural Floor Plan Graphic */}
          <div className="ochoco-fp-visual">
            <ArchitecturalPlan type={currentType} label={currentType} />
          </div>

          {/* Right: High-level category, general overview description & Schedule CTA */}
          <div className="ochoco-fp-info">
            <div className="ochoco-fp-meta-tag">
              {overview.category} • {overview.dimensions}
            </div>
            <p className="ochoco-fp-desc">{overview.description}</p>
            <Link href={overview.bookingUrl} className="ochoco-fp-schedule-btn">
              SCHEDULE
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
