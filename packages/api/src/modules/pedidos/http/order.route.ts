import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { RequestContext } from '@mikro-orm/core';
import { CreateOrderUseCase } from '../application/create-order.use-case';
import { ConfirmOrderUseCase } from '../application/confirm-order.use-case';
import { CancelOrderUseCase } from '../application/cancel-order.use-case';
import { Order, OrderStatus } from '../domain/order.entity';

const createOrderBody = z.object({
  clientId: z.string().uuid(),
  items: z.array(z.object({ productId: z.string().uuid(), quantity: z.number().int().positive() })).min(1),
  discount: z.number().min(0).optional(),
  tax: z.number().min(0).optional(),
});

export default async function orderRoutes(app: FastifyInstance) {
  app.addHook('onRequest', app.authenticate);

  app.get('/orders', {
    schema: { tags: ['Pedidos'] },
  }, async (req) => {
    const { status, sellerId, clientId, page } = req.query as any;
    const em = RequestContext.getEntityManager()!;
    const where: any = {};
    if (status) where.status = status;
    if (sellerId) where.seller = sellerId;
    if (clientId) where.client = clientId;
    const p = Number(page) || 1;
    const [items, total] = await em.findAndCount(Order, where, {
      populate: ['client', 'seller', 'items', 'items.product'],
      offset: (p - 1) * 20,
      limit: 20,
      orderBy: { createdAt: 'DESC' },
    });
    return { items, total, page: p };
  });

  app.post('/orders', {
    schema: { tags: ['Pedidos'] },
  }, async (req, reply) => {
    const data = createOrderBody.parse(req.body);
    const em = RequestContext.getEntityManager()!;
    const sellerId = (req.user as any).sub;
    const order = await new CreateOrderUseCase(em).execute({ ...data, sellerId });
    return reply.status(201).send(order);
  });

  app.get('/orders/:id', {
    schema: { tags: ['Pedidos'] },
  }, async (req) => {
    const { id } = req.params as any;
    const em = RequestContext.getEntityManager()!;
    return em.findOneOrFail(Order, id, { populate: ['client', 'seller', 'items', 'items.product'] });
  });

  app.patch('/orders/:id/confirm', {
    schema: { tags: ['Pedidos'] },
  }, async (req) => {
    const { id } = req.params as any;
    const em = RequestContext.getEntityManager()!;
    return new ConfirmOrderUseCase(em).execute(id);
  });

  app.patch('/orders/:id/cancel', {
    schema: { tags: ['Pedidos'] },
  }, async (req) => {
    const { id } = req.params as any;
    const em = RequestContext.getEntityManager()!;
    return new CancelOrderUseCase(em).execute(id);
  });
}
