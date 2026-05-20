import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { RequestContext } from '@mikro-orm/core';
import { LoginUseCase } from '../application/login.use-case';

const loginBody = z.object({
  email: z.string().email(),
  password: z.string().min(4),
});

export default async function authRoutes(app: FastifyInstance) {
  app.post('/auth/login', {
    schema: {
      tags: ['Auth'],
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string' },
          password: { type: 'string' },
        },
      },
    },
  }, async (req, reply) => {
    const { email, password } = loginBody.parse(req.body);
    const em = RequestContext.getEntityManager()!;
    const useCase = new LoginUseCase(em);
    const user = await useCase.execute(email, password);
    const token = app.jwt.sign({ sub: user.id, role: user.role }, { expiresIn: '2h' });
    return reply.send({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  });

  app.get('/auth/me', {
    schema: { tags: ['Auth'] },
    onRequest: [app.authenticate],
  }, async (req, reply) => {
    const em = RequestContext.getEntityManager()!;
    const { User } = await import('../domain/user.entity');
    const user = await em.findOneOrFail(User, (req.user as any).sub);
    return reply.send({ id: user.id, name: user.name, email: user.email, role: user.role });
  });
}
