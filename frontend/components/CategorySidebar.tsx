'use client';

import { useMemo } from 'react';
import {
  DEFAULT_ROOM_CATEGORIES,
  DEFAULT_ALAT_CATEGORIES,
  FacilityCategory,
  isRuanganFacility,
  isAlatFacility,
} from '@/models/facilities-data';
import { useAppData } from '@/context/AppDataContext';

interface CategorySidebarProps {
  active?: FacilityCategory;
  selected?: FacilityCategory;
  onSelect: (cat: FacilityCategory) => void;
  tabType?: 'semua' | 'ruangan' | 'alat';
}

export default function CategorySidebar({ active, selected, onSelect, tabType = 'semua' }: CategorySidebarProps) {
  const { facilities } = useAppData();
  const currentActive = active || selected || 'Semua Jenis';

  const relevantFacilities = useMemo(() => {
    if (tabType === 'ruangan') return facilities.filter(isRuanganFacility);
    if (tabType === 'alat') return facilities.filter(isAlatFacility);
    return facilities;
  }, [facilities, tabType]);

  const categories = useMemo(() => {
    const dynamicRuangan = Array.from(new Set(facilities.filter(isRuanganFacility).map((f) => f.type))).filter(Boolean);
    const dynamicAlat = Array.from(new Set(facilities.filter(isAlatFacility).map((f) => f.type))).filter(Boolean);
    const roomCats = Array.from(new Set([...DEFAULT_ROOM_CATEGORIES, ...dynamicRuangan]));

    if (tabType === 'ruangan') {
      return ['Semua Jenis', ...roomCats];
    }
    if (tabType === 'alat') {
      return ['Semua Jenis', ...dynamicAlat];
    }
    return ['Semua Jenis', ...Array.from(new Set([...roomCats, ...dynamicAlat]))];
  }, [facilities, tabType]);

  return (
    <div className="cat-sidebar">
      {categories.map((cat) => {
        const count = cat === 'Semua Jenis' ? relevantFacilities.length : relevantFacilities.filter((f) => f.type === cat).length;
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
