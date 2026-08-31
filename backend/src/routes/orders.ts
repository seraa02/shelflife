import { Router, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

type TxClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

const router = Router();

const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1, 'Cart cannot be empty'),
  shipping: z.object({
    name: z.string().min(2),
    address: z.string().min(5),
    city: z.string().min(2),
    state: z.string().min(2),
    zip: z.string().min(3),
    country: z.string().default('US'),
  }),
});

// All order routes require auth
router.use(requireAuth);

// POST /api/orders
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = checkoutSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message });
    return;
  }

  const { items, shipping } = parsed.data;

  // Fetch products to verify prices (never trust client-side prices)
  const productIds = items.map(i => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });

  if (products.length !== productIds.length) {
    res.status(400).json({ error: 'One or more products not found' });
    return;
  }

  const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

  // Validate stock
  for (const item of items) {
    const product = productMap[item.productId];
    if (product.stock < item.quantity) {
      res.status(400).json({
        error: `Insufficient stock for "${product.title}". Available: ${product.stock}`,
      });
      return;
    }
  }

  const subtotal = items.reduce((sum, item) => {
    return sum + productMap[item.productId].price * item.quantity;
  }, 0);

  const shippingCost = subtotal > 50 ? 0 : 9.99;
  const total = subtotal + shippingCost;

  // Create order and decrement stock in a transaction
  const order = await prisma.$transaction(async (tx: TxClient) => {
    const newOrder = await tx.order.create({
      data: {
        userId: req.userId!,
        subtotal,
        shipping: shippingCost,
        total,
        shippingName: shipping.name,
        shippingAddress: shipping.address,
        shippingCity: shipping.city,
        shippingState: shipping.state,
        shippingZip: shipping.zip,
        shippingCountry: shipping.country,
        status: 'CONFIRMED',
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: productMap[item.productId].price,
          })),
        },
      },
      include: {
        items: {
          include: { product: { select: { title: true, image: true } } },
        },
      },
    });

    // Decrement stock
    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return newOrder;
  });

  res.status(201).json({ order });
});

// GET /api/orders
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const orders = await prisma.order.findMany({
    where: { userId: req.userId! },
    include: {
      items: {
        include: { product: { select: { title: true, image: true, price: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ orders });
});

// GET /api/orders/:id
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, userId: req.userId! },
    include: {
      items: {
        include: { product: { select: { title: true, image: true, price: true } } },
      },
    },
  });

  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  res.json({ order });
});

export default router;
