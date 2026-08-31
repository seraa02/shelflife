import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Create categories
  const electronics = await prisma.category.create({ data: { name: 'Electronics', slug: 'electronics' } });
  const jewelry = await prisma.category.create({ data: { name: 'Jewelry', slug: 'jewelry' } });
  const mens = await prisma.category.create({ data: { name: "Men's Clothing", slug: 'mens-clothing' } });
  const womens = await prisma.category.create({ data: { name: "Women's Clothing", slug: 'womens-clothing' } });

  const products = [
    // Electronics
    { title: 'Fjallraven - Foldsack No. 1 Backpack', description: 'Your perfect pack for everyday use and walks in the forest. Stash your laptop (up to 15 inches) in the padded sleeve, your everyday essentials in the main compartment, and fill your pockets with your phone, wallet and keys.', price: 109.95, image: 'https://fakestoreapi.com/img/81fAXNefw8L._AC_UL900_SR210,210_.jpg', rating: 3.9, ratingCount: 120, stock: 25, categoryId: mens.id },
    { title: 'Mens Casual Premium Slim Fit T-Shirts', description: 'Slim-fitting style, contrast raglan long sleeve, three-button henley placket, light weight & soft fabric for breathable and comfortable wearing.', price: 22.3, image: 'https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg', rating: 4.1, ratingCount: 259, stock: 60, categoryId: mens.id },
    { title: 'Mens Cotton Jacket', description: 'Great outerwear jackets for Spring/Autumn/Winter, suitable for many occasions, such as working, hiking, camping, mountain/rock climbing, cycling, traveling or other outdoors.', price: 55.99, image: 'https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg', rating: 4.7, ratingCount: 500, stock: 30, categoryId: mens.id },
    { title: 'Mens Casual Slim Fit', description: 'The color could be slightly different between on the screen and in practice. Please note that body builds vary by person, so these shirts may have a different look.', price: 15.99, image: 'https://fakestoreapi.com/img/71YXzeOuslL._AC_UY879_.jpg', rating: 2.1, ratingCount: 430, stock: 45, categoryId: mens.id },
    { title: "John Hardy Women's Legends Naga Gold & Silver Dragon Bracelet", description: "From our Legends Collection, the Naga was inspired by the mythical water dragon that protects the ocean's pearl. Wear facing inward to be bestowed with love and abundance.", price: 695, image: 'https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_FMwebp_QL65_.jpg', rating: 4.6, ratingCount: 400, stock: 8, categoryId: jewelry.id },
    { title: "Solid Gold Petite Micropave", description: 'Satisfaction Guaranteed. Return or exchange any order within 30 days. Designed and sold by Hafeez Center in the United States.', price: 168, image: 'https://fakestoreapi.com/img/61sbMiUnoGL._AC_UL640_FMwebp_QL65_.jpg', rating: 3.9, ratingCount: 70, stock: 12, categoryId: jewelry.id },
    { title: 'White Gold Plated Princess', description: 'Classic Created Wedding Engagement Solitaire Diamond Promise Ring for Her. Gifts to spoil your love more for special occasions.', price: 9.99, image: 'https://fakestoreapi.com/img/71YAIFU48IL._AC_UL640_FMwebp_QL65_.jpg', rating: 3, ratingCount: 400, stock: 50, categoryId: jewelry.id },
    { title: 'Pierced Owl Rose Gold Plated Stainless Steel Double', description: 'Rose Gold Plated Double Flared Tunnel Plug Earrings. Made of 316L Stainless Steel', price: 10.99, image: 'https://fakestoreapi.com/img/51UDEzMJVpL._AC_UL640_FMwebp_QL65_.jpg', rating: 1.9, ratingCount: 100, stock: 35, categoryId: jewelry.id },
    { title: "Women's Classic Tee", description: 'The ultimate basic. Pre-washed and pre-shrunk extra-heavy T-Shirt that is 100% cotton.', price: 12.99, image: 'https://fakestoreapi.com/img/81QpkIctqPL._AC_SX679_.jpg', rating: 3.6, ratingCount: 145, stock: 40, categoryId: womens.id },
    { title: "Women's Short-Sleeve Moisture Wicking Performance Crew T-Shirt", description: 'Short-sleeve; Moisture wicking; Crew neck; Flattering cut for active women.', price: 14.99, image: 'https://fakestoreapi.com/img/51eg55uWmdL._AC_UX679_.jpg', rating: 4.5, ratingCount: 146, stock: 55, categoryId: womens.id },
    { title: "Lock and Love Women's Removable Hooded Faux Leather Moto Biker Jacket", description: "100% POLYURETHANE(shell) 100% POLYESTER(lining) 75% POLYESTER 25% COTTON (FLEECE) Faux leather material for style and comfort / 2 pockets of front, 2-For-All button closure", price: 29.95, image: 'https://fakestoreapi.com/img/81XH0e8fefL._AC_UY879-2.jpg', rating: 2.6, ratingCount: 235, stock: 20, categoryId: womens.id },
    { title: "Rain Jacket Women Windbreaker Striped", description: "Lightweight perfet for trip or casual wear---Long sleeve with hooded design makes you stay warm in the cold weather when you are outdoor travel hiking", price: 39.99, image: 'https://fakestoreapi.com/img/71HblAHs1xL._AC_UY879-2.jpg', rating: 3.8, ratingCount: 679, stock: 30, categoryId: womens.id },
    { title: 'MBJ Women\'s Solid Short Sleeve Boat Neck V', description: '95% RAYON 5% SPANDEX, Made in USA or Imported, Do Not Bleach, Lightweight fabric with great stretch for comfort, Ribbed on sleeves and neckline.', price: 9.85, image: 'https://fakestoreapi.com/img/71z3kpMAYsL._AC_UY879_.jpg', rating: 4.7, ratingCount: 130, stock: 65, categoryId: womens.id },
    { title: "Opna Women's Short Sleeve Moisture Tunic", description: '100% Polyester, Machine wash, 100% Polyester, Machine wash, Lightweight, roomy and highly breathable with moisture wicking fabric.', price: 7.95, image: 'https://fakestoreapi.com/img/51eg55uWmdL._AC_UX679_.jpg', rating: 4.5, ratingCount: 146, stock: 40, categoryId: womens.id },
    { title: "DANVOUY Womens T Shirt Casual Cotton Short", description: '95%Cotton,5%Spandex, Features: Casual, Short Sleeve, Letter Print,V-Neck,Fashion Tees, The fabric is soft and has some stretch., Occasion: Casual/Office/Beach/School/Home/Street.', price: 12.99, image: 'https://fakestoreapi.com/img/61pHAEJ4NML._AC_UX679_.jpg', rating: 3.6, ratingCount: 145, stock: 50, categoryId: womens.id },
    // Electronics
    { title: 'WD 2TB Elements Portable External Hard Drive', description: 'USB 3.0 and USB 2.0 Compatibility Fast data transfers Improve PC Performance High compatibility', price: 64, image: 'https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_.jpg', rating: 3.3, ratingCount: 203, stock: 40, categoryId: electronics.id },
    { title: 'SanDisk SSD PLUS 1TB Internal SSD', description: 'Easy upgrade for faster boot up, shutdown, application load and response (As compared to 5400 RPM SATA 2.5" hard drive; Based on published specifications and internal benchmarking tests using PCMark vantage scores)', price: 109, image: 'https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_.jpg', rating: 2.9, ratingCount: 470, stock: 25, categoryId: electronics.id },
    { title: 'Silicon Power 256GB SSD 3D NAND', description: '3D NAND flash are applied to deliver high transfer speeds Remarkable transfer speeds that enable faster bootup and improved overall system performance.', price: 109, image: 'https://fakestoreapi.com/img/71kEqp2JNA.jpg', rating: 4.8, ratingCount: 319, stock: 30, categoryId: electronics.id },
    { title: 'WD 4TB Gaming Drive Works with Playstation 4 Portable External Hard Drive', description: 'Expand your PS4 gaming experience, Play anywhere Fast and easy, setup Sleek design with high capacity, 3-year manufacturer\'s limited warranty', price: 114, image: 'https://fakestoreapi.com/img/61mtL65D4cL._AC_SX679_.jpg', rating: 4.8, ratingCount: 400, stock: 18, categoryId: electronics.id },
    { title: 'Acer SB220Q bi 21.5 inches Full HD (1920 x 1080) IPS Ultra-Thin Zero Frame Monitor', description: '21. 5 inches Full HD (1920 x 1080) widescreen IPS display And Radeon Free Sync technology.', price: 599, image: 'https://fakestoreapi.com/img/81QpkIctqPL._AC_SX679_.jpg', rating: 2.9, ratingCount: 250, stock: 12, categoryId: electronics.id },
    { title: 'Samsung 49-Inch CHG90 144Hz Curved Gaming Monitor', description: '49 INCH SUPER ULTRAWIDE: 32:9 ratio with 5120 x 1440 resolution QUANTUM DOT (QLED): Technology offers 125% sRGB', price: 999.99, image: 'https://fakestoreapi.com/img/81Zt42ioCgL._AC_SX679_.jpg', rating: 2.2, ratingCount: 140, stock: 8, categoryId: electronics.id },
    // Extra electronics
    { title: 'Wireless Noise-Cancelling Headphones', description: 'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and foldable design for travel.', price: 149.99, image: 'https://fakestoreapi.com/img/81Zt42ioCgL._AC_SX679_.jpg', rating: 4.7, ratingCount: 1243, stock: 35, categoryId: electronics.id },
    { title: 'Smart Watch Pro 2024', description: 'Feature-packed smartwatch with heart rate monitoring, GPS, 5-day battery, and 50m water resistance.', price: 229.99, image: 'https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_.jpg', rating: 4.5, ratingCount: 876, stock: 22, categoryId: electronics.id },
    { title: 'Portable Bluetooth Speaker', description: 'Rugged, waterproof Bluetooth speaker with 360° sound and 24-hour playtime.', price: 59.99, image: 'https://fakestoreapi.com/img/71kEqp2JNA.jpg', rating: 4.4, ratingCount: 2156, stock: 47, categoryId: electronics.id },
    { title: 'Mechanical Gaming Keyboard', description: 'TKL mechanical keyboard with RGB backlight, tactile switches, and aircraft-grade aluminum frame.', price: 89.99, image: 'https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg', rating: 4.6, ratingCount: 987, stock: 18, categoryId: electronics.id },
  ];

  await prisma.product.createMany({ data: products });

  console.log(`Seeded ${products.length} products across 4 categories.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
