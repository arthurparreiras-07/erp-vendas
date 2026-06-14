import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { RequestContext } from '@mikro-orm/core';
import { LoginUseCase } from '../application/login.use-case';

const loginBody = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export default async function authRoutes(app: FastifyInstance) {
  app.post('/auth/login', {
    schema: {
      tags: ['Auth'],
      operationId: 'loginUser',
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: { user: { $ref: 'AuthUser#' } },
          required: ['user'],
        },
      },
    },
  }, async (req, reply) => {
    const { email, password } = loginBody.parse(req.body);
    const em = RequestContext.getEntityManager()!;
    const useCase = new LoginUseCase(em);
    const user = await useCase.execute(email, password);
    const token = app.jwt.sign({ sub: user.id, role: user.role }, { expiresIn: '2h' });
    const isProd = process.env.NODE_ENV === 'production';
    reply.setCookie('token', token, {
      httpOnly: true,
      sameSite: isProd ? 'none' : 'lax',
      secure: isProd,
      path: '/',
      maxAge: 60 * 60 * 2,
    });
    return reply.send({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  });

  app.post('/auth/logout', {
    schema: {
      tags: ['Auth'],
      operationId: 'logoutUser',
      response: {
        200: {
          type: 'object',
          properties: { ok: { type: 'boolean' } },
          required: ['ok'],
        },
      },
    },
  }, async (_req, reply) => {
    return reply.clearCookie('token', { path: '/' }).send({ ok: true });
  });

  app.get('/auth/me', {
    schema: {
      tags: ['Auth'],
      operationId: 'getMe',
      response: { 200: { $ref: 'AuthUser#' } },
    },
    onRequest: [app.authenticate],
  }, async (req, reply) => {
    const em = RequestContext.getEntityManager()!;
    const { User } = await import('../domain/user.entity');
    const user = await em.findOneOrFail(User, (req.user as any).sub);
    return reply.send({ id: user.id, name: user.name, email: user.email, role: user.role });
  });
}
