import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// GET /api/products
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const {
    category,
    search,
    page = '1',
    limit = '12',
    sortBy = 'createdAt',
    order = 'desc',
  } = req.query as Record<string, string>;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const where: { category?: { slug: string }; title?: { contains: string; mode: 'insensitive' } } = {};

  if (category) {
    where.category = { slug: category };
  }

  if (search) {
    where.title = { contains: search, mode: 'insensitive' };
  }

  const validSortFields: Record<string, boolean> = { createdAt: true, price: true, rating: true, title: true };
  const sortField = validSortFields[sortBy] ? sortBy : 'createdAt';
  const sortOrder = order === 'asc' ? 'asc' : 'desc';

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: { select: { name: true, slug: true } } },
      orderBy: { [sortField]: sortOrder },
      skip,
      take: limitNum,
    }),
    prisma.product.count({ where }),
  ]);

  res.json({
    products,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

// GET /api/products/categories
router.get('/categories', async (_req: Request, res: Response): Promise<void> => {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  });
  res.json({ categories });
});

// GET /api/products/:id
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: { category: { select: { name: true, slug: true } } },
  });

  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  res.json({ product });
});

export default router;
