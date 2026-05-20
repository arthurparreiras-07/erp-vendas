import Fastify from 'fastify';
import jwt from '@fastify/jwt';
import cors from '@fastify/cors';
import fp from 'fastify-plugin';

import dbPlugin from './plugins/db.plugin';
import swaggerPlugin from './plugins/swagger.plugin';

import authRoutes from './modules/auth/http/auth.route';
import clientRoutes from './modules/clientes/http/client.route';
import productRoutes from './modules/produtos/http/product.route';
import stockRoutes from './modules/estoque/http/stock.route';
import orderRoutes from './modules/pedidos/http/order.route';
import dashboardRoutes from './modules/dashboard/http/dashboard.route';
import reportRoutes from './modules/relatorios/http/report.route';

const app = Fastify({ logger: true });

async function main() {
  await app.register(cors, { origin: true });
  await app.register(swaggerPlugin);
  await app.register(dbPlugin);

  const jwtSecret = process.env.JWT_SECRET ?? 'erp-secret-dev';
  await app.register(jwt, { secret: jwtSecret });

  app.decorate('authenticate', async function (req: any, reply: any) {
    try {
      await req.jwtVerify();
    } catch {
      reply.status(401).send({ error: 'Não autorizado' });
    }
  });

  await app.register(fp(authRoutes));
  await app.register(fp(clientRoutes));
  await app.register(fp(productRoutes));
  await app.register(fp(stockRoutes));
  await app.register(fp(orderRoutes));
  await app.register(fp(dashboardRoutes));
  await app.register(fp(reportRoutes));

  const port = Number(process.env.PORT ?? 3000);
  await app.listen({ port, host: '0.0.0.0' });
  console.log(`API rodando em http://localhost:${port}`);
  console.log(`Swagger em http://localhost:${port}/docs`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
