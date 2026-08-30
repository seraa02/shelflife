import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProductCard } from '@/components/product/ProductCard';
import { useCartStore } from '@/store/cartStore';
import type { Product } from '@/types';

const mockProduct: Product = {
  id: 'prod-1',
  title: 'Test Laptop Pro',
  description: 'A powerful laptop for testing.',
  price: 999.99,
  image: 'https://example.com/laptop.jpg',
  rating: 4.5,
  ratingCount: 123,
  stock: 10,
  categoryId: 'cat-1',
  category: { name: 'Electronics', slug: 'electronics' },
  createdAt: new Date().toISOString(),
};

const outOfStockProduct: Product = { ...mockProduct, stock: 0 };

function renderCard(product: Product) {
  return render(
    <MemoryRouter>
      <ProductCard product={product} />
    </MemoryRouter>
  );
}

describe('ProductCard', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  it('renders product title, price and category', () => {
    renderCard(mockProduct);

    expect(screen.getByText('Test Laptop Pro')).toBeInTheDocument();
    expect(screen.getByText('$999.99')).toBeInTheDocument();
    expect(screen.getByText('Electronics')).toBeInTheDocument();
  });

  it('renders product image with alt text', () => {
    renderCard(mockProduct);

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('alt', 'Test Laptop Pro');
    expect(img).toHaveAttribute('src', mockProduct.image);
  });

  it('adds product to cart when "Add to cart" is clicked', () => {
    renderCard(mockProduct);

    const btn = screen.getByRole('button', { name: /add test laptop pro to cart/i });
    fireEvent.click(btn);

    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].product.id).toBe('prod-1');
    expect(items[0].quantity).toBe(1);
  });

  it('shows out of stock badge and disables button when stock is 0', () => {
    renderCard(outOfStockProduct);

    expect(screen.getByText('Out of stock')).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: /add/i });
    expect(btn).toBeDisabled();
  });

  it('links to the product detail page', () => {
    renderCard(mockProduct);

    const links = screen.getAllByRole('link');
    const productLink = links.find((l: HTMLElement) => l.getAttribute('href') === `/products/${mockProduct.id}`);
    expect(productLink).toBeDefined();
  });
});
