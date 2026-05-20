import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { RequestContext } from '@mikro-orm/core';
import { SalesReportUseCase } from '../application/sales-report.use-case';
import { Goal } from '../domain/goal.entity';
import { User } from '../../auth/domain/user.entity';

export default async function reportRoutes(app: FastifyInstance) {
  app.addHook('onRequest', app.authenticate);

  app.get('/reports/sales', {
    schema: { tags: ['Relatórios'] },
  }, async (req) => {
    const { from, to, sellerId, region } = req.query as any;
    const em = RequestContext.getEntityManager()!;
    return new SalesReportUseCase(em).execute({ from, to, sellerId, region });
  });

  app.get('/goals', {
    schema: { tags: ['Relatórios'] },
  }, async () => {
    const em = RequestContext.getEntityManager()!;
    return em.find(Goal, {}, { populate: ['seller'], orderBy: { period: 'DESC' } });
  });

  app.post('/goals', {
    schema: { tags: ['Relatórios'] },
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
