import { beforeEach, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Use test DB
process.env.DATABASE_URL = 'file:./test.db';
process.env.JWT_SECRET = 'test-jwt-secret-at-least-32-characters-long';
process.env.NODE_ENV = 'test';

const prisma = new PrismaClient({
  datasources: { db: { url: 'file:./test.db' } },
});

beforeEach(async () => {
  // Clean tables in dependency order
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Seed minimal test data
  const category = await prisma.category.create({
    data: { name: 'Electronics', slug: 'electronics' },
  });

  await prisma.product.createMany({
    data: [
      {
        title: 'Test Laptop',
        description: 'A great laptop',
        price: 999.99,
        image: 'https://example.com/laptop.jpg',
        rating: 4.5,
        ratingCount: 100,
        stock: 10,
        categoryId: category.id,
      },
      {
        title: 'Test Phone',
        description: 'A great phone',
        price: 599.99,
        image: 'https://example.com/phone.jpg',
        rating: 4.2,
        ratingCount: 200,
        stock: 5,
        categoryId: category.id,
      },
    ],
  });

  await prisma.user.create({
    data: {
      name: 'Test User',
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 10),
    },
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});
