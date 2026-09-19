'use client';

import { FACILITY_CATEGORIES, FacilityCategory } from '@/models/facilities-data';
import { useAppData } from '@/context/AppDataContext';

interface CategorySidebarProps {
  active?: FacilityCategory;
  selected?: FacilityCategory;
  onSelect: (cat: FacilityCategory) => void;
}

export default function CategorySidebar({ active, selected, onSelect }: CategorySidebarProps) {
  const { facilities } = useAppData();
  const currentActive = active || selected || 'Semua Jenis';

  return (
    <div className="cat-sidebar">
      {FACILITY_CATEGORIES.map((cat) => {
        const count = cat === 'Semua Jenis' ? facilities.length : facilities.filter((f) => f.type === cat).length;
        const isActive = currentActive === cat;
        return (
          <a key={cat} className={isActive ? 'active' : ''} onClick={() => onSelect(cat)}>
            <span>{cat}</span>
            <span className="count">{count}</span>
          </a>
        );
      })}
    </div>
  );
}
