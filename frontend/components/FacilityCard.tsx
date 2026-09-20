import { Facility } from '@/models/facility';

const statusBadge: Record<Facility['status'], { cls: string; label: string }> = {
  avail: { cls: 'avail', label: 'Tersedia' },
  busy: { cls: 'busy', label: 'Digunakan' },
  repair: { cls: 'repair', label: 'Perbaikan' },
  nonaktif: { cls: 'repair', label: 'Nonaktif' },
};

interface FacilityCardProps {
  facility: Facility;
  onOpenDetail: (facilityId: string) => void;
}

export default function FacilityCard({ facility, onOpenDetail }: FacilityCardProps) {
  const badge = statusBadge[facility.status];

  return (
    <div className="card card-clickable" onClick={() => onOpenDetail(facility.id)}>
      <div className="card-media" style={{ position: 'relative', overflow: 'hidden' }}>
        {facility.image ? (
          <img
            src={facility.image}
            alt={facility.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <svg viewBox="0 0 300 150" preserveAspectRatio="xMidYMid slice">
            <g stroke="rgba(255,255,255,.18)">
              <rect x="26" y="26" width="56" height="36" />
              <rect x="100" y="26" width="56" height="36" />
              <rect x="174" y="26" width="56" height="36" />
              <rect x="26" y="80" width="56" height="36" />
              <rect x="100" y="80" width="56" height="36" />
              <rect x="174" y="80" width="56" height="36" />
            </g>
          </svg>
        )}
        <span className={`badge ${badge.cls}`} style={{ zIndex: 2 }}>{badge.label}</span>
      </div>

      <div className="card-body">
        <h3>{facility.name}</h3>
        <div className="card-loc">{facility.type} · {facility.loc}</div>
        <div className="amenities">
          {facility.amenities.map((a) => (
            <span key={a} className="amenity">{a}</span>
          ))}
        </div>
        <div className="card-foot">
          <div className="capacity">Kapasitas <b>{facility.cap} orang</b></div>
          <span className="card-btn">Lihat detail</span>
        </div>
      </div>
    </div>
  );
}
