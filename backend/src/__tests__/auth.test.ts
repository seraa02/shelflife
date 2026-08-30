import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../index';

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('creates a new user and returns a token', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'securepass123',
      });

      expect(res.status).toBe(201);
      expect(res.body.user).toMatchObject({
        name: 'Jane Doe',
        email: 'jane@example.com',
      });
      expect(res.body.user.password).toBeUndefined();
      expect(res.body.token).toBeDefined();
    });

    it('rejects duplicate email with 409', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(res.status).toBe(409);
      expect(res.body.error).toMatch(/already registered/i);
    });

    it('validates email format', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Bad Email',
        email: 'not-an-email',
        password: 'password123',
      });

      expect(res.status).toBe(400);
    });

    it('requires password of at least 8 characters', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Short Pass',
        email: 'short@example.com',
        password: 'abc',
      });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('logs in with correct credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe('test@example.com');
      expect(res.body.token).toBeDefined();
    });

    it('rejects wrong password with 401', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(res.status).toBe(401);
    });

    it('rejects unknown email with 401', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'ghost@example.com',
        password: 'password123',
      });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns user profile when authenticated', async () => {
      const loginRes = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'password123',
      });

      const { token } = loginRes.body;

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe('test@example.com');
    });

    it('returns 401 without a token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });
});
