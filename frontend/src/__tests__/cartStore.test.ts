import { describe, it, expect, beforeEach } from 'vitest';

import { useCartStore } from '@/store/cartStore';
import type { Product } from '@/types';

const makeProduct = (overrides?: Partial<Product>): Product => ({
  id: 'prod-1',
  title: 'Widget',
  description: 'A widget',
  price: 29.99,
  image: 'https://example.com/widget.jpg',
  rating: 4.0,
  ratingCount: 50,
  stock: 5,
  categoryId: 'cat-1',
  category: { name: 'Electronics', slug: 'electronics' },
  createdAt: new Date().toISOString(),
  ...overrides,
});

describe('Cart Store', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  it('adds an item to the cart', () => {
    useCartStore.getState().addItem(makeProduct(), 1);
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().itemCount()).toBe(1);
  });

  it('increments quantity when same product is added again', () => {
    const product = makeProduct();
    useCartStore.getState().addItem(product, 1);
    useCartStore.getState().addItem(product, 2);

    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(3);
  });

  it('does not exceed stock limit', () => {
    const product = makeProduct({ stock: 3 });
    useCartStore.getState().addItem(product, 10);

    expect(useCartStore.getState().items[0].quantity).toBe(3);
  });

  it('removes an item from the cart', () => {
    const product = makeProduct();
    useCartStore.getState().addItem(product);
    useCartStore.getState().removeItem(product.id);

    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('updates quantity correctly', () => {
    const product = makeProduct();
    useCartStore.getState().addItem(product, 1);
    useCartStore.getState().updateQuantity(product.id, 4);

    expect(useCartStore.getState().items[0].quantity).toBe(4);
  });

  it('removes item when quantity is set to 0', () => {
    const product = makeProduct();
    useCartStore.getState().addItem(product);
    useCartStore.getState().updateQuantity(product.id, 0);

    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('calculates subtotal correctly', () => {
    const p1 = makeProduct({ id: '1', price: 10.00 });
    const p2 = makeProduct({ id: '2', price: 25.00 });
    useCartStore.getState().addItem(p1, 2);
    useCartStore.getState().addItem(p2, 1);

    expect(useCartStore.getState().subtotal()).toBeCloseTo(45.00);
  });

  it('clears the cart', () => {
    useCartStore.getState().addItem(makeProduct());
    useCartStore.getState().clearCart();

    expect(useCartStore.getState().items).toHaveLength(0);
  });
});
