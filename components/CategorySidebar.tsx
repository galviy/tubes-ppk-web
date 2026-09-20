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

  const dynamicTypes = Array.from(new Set(facilities.map((f) => f.type))).filter(Boolean);
  const categories = ['Semua Jenis', ...dynamicTypes];

  return (
    <div className="cat-sidebar">
      {categories.map((cat) => {
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
