import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CartItem } from '@/components/cart/CartItem';
import { useCartStore } from '@/store/cartStore';
import type { CartItem as CartItemType } from '@/types';

const item: CartItemType = {
  quantity: 2,
  product: {
    id: 'prod-1',
    title: 'Cool Widget',
    description: 'A cool widget',
    price: 49.99,
    image: 'https://example.com/widget.jpg',
    rating: 4.2,
    ratingCount: 30,
    stock: 10,
    categoryId: 'cat-1',
    category: { name: 'Electronics', slug: 'electronics' },
    createdAt: new Date().toISOString(),
  },
};

function renderItem() {
  return render(
    <MemoryRouter>
      <ul>
        <CartItem item={item} />
      </ul>
    </MemoryRouter>
  );
}

describe('CartItem', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [item] });
  });

  it('renders item title and price', () => {
    renderItem();
    expect(screen.getByText('Cool Widget')).toBeInTheDocument();
    // quantity 2 × $49.99 = $99.98
    expect(screen.getByText('$99.98')).toBeInTheDocument();
  });

  it('renders current quantity', () => {
    renderItem();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('removes item from cart when remove button is clicked', () => {
    renderItem();
    fireEvent.click(screen.getByLabelText(/remove cool widget/i));
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('increases quantity when + is clicked', () => {
    renderItem();
    fireEvent.click(screen.getByLabelText('Increase quantity'));
    expect(useCartStore.getState().items[0].quantity).toBe(3);
  });

  it('decreases quantity when − is clicked', () => {
    renderItem();
    fireEvent.click(screen.getByLabelText('Decrease quantity'));
    expect(useCartStore.getState().items[0].quantity).toBe(1);
  });
});
