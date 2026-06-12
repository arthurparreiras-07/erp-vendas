import fp from 'fastify-plugin';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { MikroORM, RequestContext } from '@mikro-orm/core';
import config from '../../mikro-orm.config';

declare module 'fastify' {
  interface FastifyInstance {
    orm: MikroORM;
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export default fp(async (app: FastifyInstance) => {
  const orm = await MikroORM.init(config);
  app.decorate('orm', orm);

  app.addHook('onRequest', (_req, _reply, done) => {
    RequestContext.create(orm.em, done);
  });

  app.addHook('onClose', async () => {
    await orm.close();
  });
});
