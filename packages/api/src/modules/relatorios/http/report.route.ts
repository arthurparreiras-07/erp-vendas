import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { RequestContext } from '@mikro-orm/core';
import { SalesReportUseCase } from '../application/sales-report.use-case';
import { Goal } from '../domain/goal.entity';
import { User, UserRole } from '../../auth/domain/user.entity';
import { requireRole } from '../../../shared/http/authorize';

export default async function reportRoutes(app: FastifyInstance) {
  app.addHook('onRequest', app.authenticate);

  app.get('/reports/sales', {
    schema: {
      tags: ['Relatórios'],
      operationId: 'getSalesReport',
      querystring: {
        type: 'object',
        properties: {
          from: { type: 'string', format: 'date' },
          to: { type: 'string', format: 'date' },
          sellerId: { type: 'string' },
          region: { type: 'string' },
        },
      },
      response: {
        200: { type: 'array', items: { $ref: 'SalesReportRow#' } },
      },
    },
  }, async (req) => {
    const { from, to, sellerId, region } = req.query as any;
    const em = RequestContext.getEntityManager()!;
    return new SalesReportUseCase(em).execute({ from, to, sellerId, region });
  });

  app.get('/goals', {
    schema: {
      tags: ['Relatórios'],
      operationId: 'listGoals',
      response: {
        200: { type: 'array', items: { $ref: 'Goal#' } },
      },
    },
  }, async () => {
    const em = RequestContext.getEntityManager()!;
    return em.find(Goal, {}, { populate: ['seller'], orderBy: { period: 'DESC' } });
  });

  app.post('/goals', {
    onRequest: [requireRole(UserRole.ADMIN)],
    schema: {
      tags: ['Relatórios'],
      operationId: 'createGoal',
      body: {
        type: 'object',
        required: ['sellerId', 'period', 'targetAmount'],
        properties: {
          sellerId: { type: 'string', format: 'uuid' },
          period: { type: 'string', pattern: '^\\d{4}-\\d{2}$' },
          targetAmount: { type: 'number', minimum: 0 },
        },
      },
      response: { 201: { $ref: 'Goal#' } },
    },
  }, async (req, reply) => {
    const { sellerId, period, targetAmount } = z.object({
      sellerId: z.string().uuid(),
      period: z.string().regex(/^\d{4}-\d{2}$/),
      targetAmount: z.number().positive(),
    }).parse(req.body);
    const em = RequestContext.getEntityManager()!;
    const seller = await em.findOneOrFail(User, sellerId);
    const goal = new Goal(seller, period, targetAmount);
    await em.persistAndFlush(goal);
    return reply.status(201).send(goal);
  });
}
