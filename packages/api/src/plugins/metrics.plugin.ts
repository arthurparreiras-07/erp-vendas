import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import metricsPlugin from 'fastify-metrics';

export default fp(async (app: FastifyInstance) => {
  await app.register(metricsPlugin, {
    endpoint: '/metrics',
    routeMetrics: {
      overrides: {
        histogram: {
          name: 'http_request_duration_seconds',
          buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5],
        },
      },
    },
  });
});
