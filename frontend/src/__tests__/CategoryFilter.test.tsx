import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CategoryFilter } from '@/components/product/CategoryFilter';
import type { Category } from '@/types';

const categories: Category[] = [
  { id: '1', name: 'Electronics', slug: 'electronics', _count: { products: 10 } },
  { id: '2', name: 'Jewelry', slug: 'jewelry', _count: { products: 5 } },
];

describe('CategoryFilter', () => {
  it('renders "All" button and all category buttons', () => {
    render(<CategoryFilter categories={categories} selected={null} onSelect={vi.fn()} />);

    expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /electronics/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /jewelry/i })).toBeInTheDocument();
  });

  it('"All" button is pressed when no category is selected', () => {
    render(<CategoryFilter categories={categories} selected={null} onSelect={vi.fn()} />);
    expect(screen.getByRole('button', { name: /all/i })).toHaveAttribute('aria-pressed', 'true');
  });

  it('marks the selected category as pressed', () => {
    render(<CategoryFilter categories={categories} selected="electronics" onSelect={vi.fn()} />);
    expect(screen.getByRole('button', { name: /electronics/i })).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onSelect with null when "All" is clicked', () => {
    const onSelect = vi.fn();
    render(<CategoryFilter categories={categories} selected="electronics" onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('button', { name: /all/i }));
    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it('calls onSelect with slug when a category is clicked', () => {
    const onSelect = vi.fn();
    render(<CategoryFilter categories={categories} selected={null} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('button', { name: /jewelry/i }));
    expect(onSelect).toHaveBeenCalledWith('jewelry');
  });
});
