import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface FakeStoreProduct {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
}

const categorySlugMap: Record<string, string> = {
  "electronics": "electronics",
  "jewelery": "jewelry",
  "men's clothing": "mens-clothing",
  "women's clothing": "womens-clothing",
};

const categoryNameMap: Record<string, string> = {
  "electronics": "Electronics",
  "jewelery": "Jewelry",
  "men's clothing": "Men's Clothing",
  "women's clothing": "Women's Clothing",
};

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Fetch products from Fake Store API
  const response = await fetch('https://fakestoreapi.com/products');
  const fakeProducts: FakeStoreProduct[] = await response.json();

  // Create categories
  const uniqueCategories = [...new Set(fakeProducts.map(p => p.category))];

  const categories = await Promise.all(
    uniqueCategories.map(cat =>
      prisma.category.create({
        data: {
          name: categoryNameMap[cat] || cat,
          slug: categorySlugMap[cat] || cat.toLowerCase().replace(/\s+/g, '-'),
        },
      })
    )
  );

  const categoryMap = Object.fromEntries(
    categories.map(cat => [cat.slug, cat.id])
  );

  // Create products
  for (const fp of fakeProducts) {
    const slug = categorySlugMap[fp.category] || fp.category.toLowerCase().replace(/\s+/g, '-');
    const categoryId = categoryMap[slug];

    await prisma.product.create({
      data: {
        title: fp.title,
        description: fp.description,
        price: fp.price,
        image: fp.image,
        rating: fp.rating.rate,
        ratingCount: fp.rating.count,
        stock: Math.floor(Math.random() * 50) + 10,
        categoryId,
      },
    });
  }

  // Add extra products to reach ~40-60
  const electronicsId = categoryMap['electronics'];
  const extraProducts = [
    {
      title: 'Wireless Noise-Cancelling Headphones',
      description: 'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and foldable design for travel.',
      price: 149.99,
      image: 'https://fakestoreapi.com/img/81Zt42ioCgL._AC_SX679_.jpg',
      rating: 4.7,
      ratingCount: 1243,
      stock: 35,
      categoryId: electronicsId,
    },
    {
      title: 'Smart Watch Pro 2024',
      description: 'Feature-packed smartwatch with heart rate monitoring, GPS, 5-day battery, and 50m water resistance.',
      price: 229.99,
      image: 'https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_.jpg',
      rating: 4.5,
      ratingCount: 876,
      stock: 22,
      categoryId: electronicsId,
    },
    {
      title: 'Portable Bluetooth Speaker',
      description: 'Rugged, waterproof Bluetooth speaker with 360° sound and 24-hour playtime.',
      price: 59.99,
      image: 'https://fakestoreapi.com/img/71kEqp2JNA.jpg',
      rating: 4.4,
      ratingCount: 2156,
      stock: 47,
      categoryId: electronicsId,
    },
    {
      title: 'Mechanical Gaming Keyboard',
      description: 'TKL mechanical keyboard with RGB backlight, tactile switches, and aircraft-grade aluminum frame.',
      price: 89.99,
      image: 'https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg',
      rating: 4.6,
      ratingCount: 987,
      stock: 18,
      categoryId: electronicsId,
    },
  ];

  for (const ep of extraProducts) {
    await prisma.product.create({ data: ep });
  }

  console.log(`Seeded ${fakeProducts.length + extraProducts.length} products across ${categories.length} categories.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
