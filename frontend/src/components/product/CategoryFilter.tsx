import type { Category } from '@/types';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  categories: Category[];
  selected: string | null;
  onSelect: (slug: string | null) => void;
}

export function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  return (
    <nav aria-label="Category filter">
      <ul className="flex flex-wrap gap-2">
        <li>
          <button
            onClick={() => onSelect(null)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium transition-all',
              selected === null
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-brand-300 hover:text-brand-700'
            )}
            aria-pressed={selected === null}
          >
            All
          </button>
        </li>
        {categories.map(cat => (
          <li key={cat.id}>
            <button
              onClick={() => onSelect(cat.slug)}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-medium transition-all',
                selected === cat.slug
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-brand-300 hover:text-brand-700'
              )}
              aria-pressed={selected === cat.slug}
            >
              {cat.name}
              {cat._count && (
                <span className="ml-1.5 text-xs opacity-70">({cat._count.products})</span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
