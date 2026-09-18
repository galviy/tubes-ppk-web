'use client';

import { FACILITY_CATEGORIES, FacilityCategory } from '@/models/facilities-data';
import { useAppData } from '@/context/AppDataContext';

interface CategorySidebarProps {
  active: FacilityCategory;
  onSelect: (cat: FacilityCategory) => void;
}

export default function CategorySidebar({ active, onSelect }: CategorySidebarProps) {
  const { facilities } = useAppData();

  return (
    <div className="cat-sidebar">
      {FACILITY_CATEGORIES.map((cat) => {
        const count = cat === 'Semua Jenis' ? facilities.length : facilities.filter((f) => f.type === cat).length;
        return (
          <a key={cat} className={active === cat ? 'active' : ''} onClick={() => onSelect(cat)}>
            <span>{cat}</span>
            <span className="count">{count}</span>
          </a>
        );
      })}
    </div>
  );
}
