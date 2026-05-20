import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { RequestContext } from '@mikro-orm/core';
import { CreateClientUseCase } from '../application/create-client.use-case';
import { ListClientsUseCase } from '../application/list-clients.use-case';
import { Client } from '../domain/client.entity';

const clientBody = z.object({
  name: z.string().min(2),
  cnpj: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  region: z.string().optional(),
});

export default async function clientRoutes(app: FastifyInstance) {
  app.addHook('onRequest', app.authenticate);

  app.get('/clients', {
    schema: { tags: ['Clientes'] },
  }, async (req) => {
    const { name, cnpj, page, limit } = req.query as any;
    const em = RequestContext.getEntityManager()!;
    return new ListClientsUseCase(em).execute({ name, cnpj, page: Number(page) || 1, limit: Number(limit) || 20 });
  });

  app.post('/clients', {
    schema: { tags: ['Clientes'] },
  }, async (req, reply) => {
    const data = clientBody.parse(req.body);
    const em = RequestContext.getEntityManager()!;
    const client = await new CreateClientUseCase(em).execute(data);
    return reply.status(201).send(client);
  });

  app.get('/clients/:id', {
    schema: { tags: ['Clientes'] },
  }, async (req) => {
    const { id } = req.params as any;
    const em = RequestContext.getEntityManager()!;
    return em.findOneOrFail(Client, id);
  });

  app.put('/clients/:id', {
    schema: { tags: ['Clientes'] },
  }, async (req) => {
    const { id } = req.params as any;
    const data = clientBody.partial().parse(req.body);
    const em = RequestContext.getEntityManager()!;
    const client = await em.findOneOrFail(Client, id);
    client.update(data);
    await em.flush();
    return client;
  });
}
