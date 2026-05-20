import { FastifyInstance } from 'fastify';
import { RequestContext } from '@mikro-orm/core';
import { GetKpisUseCase } from '../application/get-kpis.use-case';
import { GetChartUseCase } from '../application/get-chart.use-case';
import { Activity } from '../domain/activity.entity';

export default async function dashboardRoutes(app: FastifyInstance) {
  app.addHook('onRequest', app.authenticate);

  app.get('/dashboard/kpis', {
    schema: { tags: ['Dashboard'] },
  }, async () => {
    const em = RequestContext.getEntityManager()!;
    return new GetKpisUseCase(em).execute();
  });

  app.get('/dashboard/chart', {
    schema: { tags: ['Dashboard'] },
  }, async () => {
    const em = RequestContext.getEntityManager()!;
    return new GetChartUseCase(em).execute();
  });

  app.get('/activities', {
    schema: { tags: ['Dashboard'] },
  }, async () => {
    const em = RequestContext.getEntityManager()!;
    return em.find(Activity, {}, { orderBy: { createdAt: 'DESC' }, limit: 20 });
  });
}
