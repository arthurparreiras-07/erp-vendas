import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { RequestContext } from '@mikro-orm/core';
import { UpdateStockUseCase } from '../application/update-stock.use-case';
import { Stock } from '../domain/stock.entity';
import { requireRole } from '../../../shared/http/authorize';
import { UserRole } from '../../auth/domain/user.entity';

export default async function stockRoutes(app: FastifyInstance) {
  app.addHook('onRequest', app.authenticate);

  app.get('/stock', {
    schema: {
      tags: ['Estoque'],
      operationId: 'listStock',
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['low', 'ok', 'all'] },
        },
      },
      response: {
        200: { type: 'array', items: { $ref: 'Stock#' } },
      },
    },
  }, async (req) => {
    const { status } = req.query as { status?: 'low' | 'ok' | 'all' };
    const em = RequestContext.getEntityManager()!;
    const stocks = await em.find(Stock, {}, { populate: ['product'] });
    if (status === 'low') return stocks.filter((s) => s.physical - s.reserved < 5);
    if (status === 'ok') return stocks.filter((s) => s.physical - s.reserved >= 5);
    return stocks;
  });

  app.put('/stock/:productId', {
    onRequest: [requireRole(UserRole.ADMIN)],
    schema: {
      tags: ['Estoque'],
      operationId: 'updateStock',
      params: {
        type: 'object',
        properties: { productId: { type: 'string' } },
        required: ['productId'],
      },
      body: {
        type: 'object',
        required: ['physical'],
        properties: { physical: { type: 'integer', minimum: 0 } },
      },
      response: { 200: { $ref: 'Stock#' } },
    },
  }, async (req) => {
    const { productId } = req.params as any;
    const { physical } = z.object({ physical: z.number().int().min(0) }).parse(req.body);
    const em = RequestContext.getEntityManager()!;
    return new UpdateStockUseCase(em).execute(productId, physical);
  });
}
