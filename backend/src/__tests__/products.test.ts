import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../index';

describe('Products API', () => {
  describe('GET /api/products', () => {
    it('returns paginated products list', async () => {
      const res = await request(app).get('/api/products');

      expect(res.status).toBe(200);
      expect(res.body.products).toBeInstanceOf(Array);
      expect(res.body.pagination).toMatchObject({
        page: 1,
        limit: 12,
        total: 2,
        totalPages: 1,
      });
    });

    it('filters by category slug', async () => {
      const res = await request(app).get('/api/products?category=electronics');

      expect(res.status).toBe(200);
      expect(res.body.products.length).toBe(2);
    });

    it('filters by search query', async () => {
      const res = await request(app).get('/api/products?search=Laptop');

      expect(res.status).toBe(200);
      expect(res.body.products.length).toBe(1);
      expect(res.body.products[0].title).toBe('Test Laptop');
    });

    it('returns empty results for no match', async () => {
      const res = await request(app).get('/api/products?search=nonexistent');

      expect(res.status).toBe(200);
      expect(res.body.products.length).toBe(0);
    });
  });

  describe('GET /api/products/categories', () => {
    it('returns category list with product counts', async () => {
      const res = await request(app).get('/api/products/categories');

      expect(res.status).toBe(200);
      expect(res.body.categories).toBeInstanceOf(Array);
      expect(res.body.categories[0]).toMatchObject({
        name: 'Electronics',
        slug: 'electronics',
      });
    });
  });

  describe('GET /api/products/:id', () => {
    it('returns a single product by ID', async () => {
      const listRes = await request(app).get('/api/products');
      const product = listRes.body.products[0];

      const res = await request(app).get(`/api/products/${product.id}`);

      expect(res.status).toBe(200);
      expect(res.body.product.id).toBe(product.id);
      expect(res.body.product.category).toBeDefined();
    });

    it('returns 404 for unknown product ID', async () => {
      const res = await request(app).get('/api/products/nonexistent-id');

      expect(res.status).toBe(404);
    });
  });
});
