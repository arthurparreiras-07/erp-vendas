import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import {
  authUserSchema,
  clientSchema,
  productSchema,
  stockSchema,
  orderSchema,
  activitySchema,
  goalSchema,
  kpisSchema,
  chartSchema,
  salesReportRowSchema,
} from '../shared/http/schemas';

export default fp(async (app: FastifyInstance) => {
  await app.register(swagger, {
    refResolver: {
      buildLocalReference(json: Record<string, unknown>, _baseUri: unknown, _fragment: unknown, i: number) {
        return (json.$id as string) || `def-${i}`;
      },
    },
    openapi: {
      info: { title: 'ERP Vendas API', version: '1.0.0' },
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        },
      },
      security: [{ bearerAuth: [] }],
    },
  });

  // Registrar schemas na ordem de dependência (dependências primeiro)
  app.addSchema(authUserSchema);
  app.addSchema(clientSchema);
  app.addSchema(productSchema);
  app.addSchema(stockSchema);
  app.addSchema(orderSchema);
  app.addSchema(activitySchema);
  app.addSchema(goalSchema);
  app.addSchema(kpisSchema);
  app.addSchema(chartSchema);
  app.addSchema(salesReportRowSchema);

  await app.register(swaggerUi, { routePrefix: '/docs' });
});
