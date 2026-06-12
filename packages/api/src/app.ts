import 'dotenv/config';
import Fastify from 'fastify';
import jwt from '@fastify/jwt';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import fp from 'fastify-plugin';
import { DomainError } from './shared/domain/errors';

import dbPlugin from './plugins/db.plugin';
import swaggerPlugin from './plugins/swagger.plugin';

import authRoutes from './modules/auth/http/auth.route';
import clientRoutes from './modules/clientes/http/client.route';
import productRoutes from './modules/produtos/http/product.route';
import stockRoutes from './modules/estoque/http/stock.route';
import orderRoutes from './modules/pedidos/http/order.route';
import dashboardRoutes from './modules/dashboard/http/dashboard.route';
import reportRoutes from './modules/relatorios/http/report.route';

const isDev = process.env.NODE_ENV !== 'production';

const app = Fastify({
  logger: {
    level: isDev ? 'info' : 'warn',
    ...(isDev && { transport: { target: 'pino-pretty', options: { colorize: true } } }),
  },
});

async function main() {
  // contentSecurityPolicy desabilitado para não bloquear o Swagger UI
  await app.register(helmet, { contentSecurityPolicy: false });

  await app.register(cors, {
    origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
  });

  await app.register(rateLimit, { global: true, max: 100, timeWindow: '1 minute' });
  await app.register(cookie);
  await app.register(swaggerPlugin);
  await app.register(dbPlugin);

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) throw new Error('JWT_SECRET não definido no ambiente');
  await app.register(jwt, {
    secret: jwtSecret,
    cookie: { cookieName: 'token', signed: false },
  });

  app.decorate('authenticate', async function (req: any, reply: any) {
    try {
      await req.jwtVerify();
    } catch {
      reply.status(401).send({ error: 'Não autorizado' });
    }
  });

  app.setErrorHandler((error, _req, reply) => {
    if (error instanceof DomainError) {
      return reply.status(error.statusCode).send({ error: error.message });
    }
    if (error.name === 'NotFoundError') {
      return reply.status(404).send({ error: 'Recurso não encontrado' });
    }
    if (error.name === 'ZodError') {
      return reply.status(400).send({ error: 'Dados inválidos' });
    }
    app.log.error(error);
    return reply.status(500).send({ error: 'Erro interno do servidor' });
  });

  app.get('/health', { schema: { hide: true } }, async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }));

  // rotas sem fp() para preservar encapsulamento — o addHook de cada módulo
  // fica restrito ao seu escopo e não vaza para o POST /auth/login
  await app.register(authRoutes);
  await app.register(clientRoutes);
  await app.register(productRoutes);
  await app.register(stockRoutes);
  await app.register(orderRoutes);
  await app.register(dashboardRoutes);
  await app.register(reportRoutes);

  const port = Number(process.env.PORT);
  await app.listen({ port, host: '0.0.0.0' });
  console.log(`API rodando em http://localhost:${port}`);
  console.log(`Swagger em http://localhost:${port}/docs`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
