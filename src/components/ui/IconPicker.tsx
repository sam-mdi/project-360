import { useState, useMemo } from 'react';
import type { LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Search } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

const ICON_CATEGORIES: Record<string, string[]> = {
  Sleep: ['Moon', 'Bed', 'CloudMoon', 'Stars', 'ZZZ'],
  Food: ['Coffee', 'UtensilsCrossed', 'Apple', 'Sandwich', 'Pizza', 'Cookie', 'Soup', 'Wine', 'Beer', 'Salad'],
  Work: ['Briefcase', 'Laptop', 'Monitor', 'Code', 'FileText', 'PenTool', 'Calculator', 'Phone', 'Video', 'Mail'],
  Exercise: ['Dumbbell', 'Bike', 'PersonStanding', 'Trophy', 'Activity', 'Heart', 'Zap', 'Footprints'],
  Social: ['Users', 'MessageCircle', 'PartyPopper', 'Handshake', 'UserPlus', 'Globe'],
  Wellness: ['Leaf', 'Sun', 'Droplets', 'Wind', 'Smile', 'Brain', 'Stethoscope'],
  Learning: ['BookOpen', 'GraduationCap', 'Pencil', 'Library', 'FlaskConical', 'Microscope', 'Music', 'Palette'],
  Home: ['Home', 'Car', 'ShoppingCart', 'Shirt', 'Sofa', 'Bath', 'Hammer', 'Wrench'],
  Nature: ['Tree', 'Flower', 'Mountain', 'Waves', 'Cloud', 'Rainbow', 'Snowflake'],
  Misc: ['Star', 'Flame', 'Clock', 'Calendar', 'Bell', 'Gift', 'Map', 'Camera', 'Gamepad', 'Headphones'],
};

const ALL_ICONS = Object.entries(ICON_CATEGORIES).flatMap(([cat, icons]) =>
  icons.map((name) => ({ name, category: cat }))
);

interface IconPickerProps {
  value?: string;
  onSelect: (name: string) => void;
  onCancel: () => void;
}

export function IconPicker({ value, onSelect, onCancel }: IconPickerProps) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(value ?? '');
  const [activeCategory, setActiveCategory] = useState('All');

  const icons = LucideIcons as unknown as Record<string, LucideIcon>;

  const filtered = useMemo(() => {
    let list = ALL_ICONS;
    if (activeCategory !== 'All') list = list.filter((i) => i.category === activeCategory);
    if (search) list = list.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [search, activeCategory]);

  return (
    <div className="flex flex-col h-full">
      {/* Header + search */}
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-lg font-bold text-stone-900 mb-3">Pick an Icon</h2>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            className="w-full pl-8 pr-3 py-2 rounded-xl bg-stone-100 text-sm outline-none focus:ring-2 focus:ring-amber-400"
            placeholder="Search icons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Category pills — compact */}
      <div className="flex gap-1.5 px-4 pb-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {['All', ...Object.keys(ICON_CATEGORIES)].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              'flex-none rounded-full font-semibold transition-colors whitespace-nowrap',
              'text-[12px] px-3 py-1.5',
              activeCategory === cat
                ? 'bg-amber-500 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Icon grid — dense 8-column */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        <div
          className="grid"
          style={{ gridTemplateColumns: 'repeat(8, 1fr)', gap: 4 }}
        >
          {filtered.map(({ name }) => {
            const Icon = icons[name];
            if (!Icon) return null;
            const isSelected = selected === name;
            return (
              <button
                key={name}
                onClick={() => setSelected(name)}
                title={name}
                style={{ width: 56, height: 56, padding: 6 }}
                className={cn(
                  'flex items-center justify-center rounded-xl transition-all',
                  isSelected
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'text-stone-600 hover:bg-amber-50 hover:border hover:border-amber-300 hover:text-amber-700'
                )}
              >
                <Icon size={28} />
              </button>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-8 text-stone-400 text-sm">No icons found</div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-stone-100 flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={onCancel}>Cancel</Button>
        <Button className="flex-1" disabled={!selected} onClick={() => selected && onSelect(selected)}>
          Next
        </Button>
      </div>
    </div>
  );
}
