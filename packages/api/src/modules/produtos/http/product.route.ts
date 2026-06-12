import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { RequestContext } from '@mikro-orm/core';
import { CreateProductUseCase } from '../application/create-product.use-case';
import { ListProductsUseCase } from '../application/list-products.use-case';
import { Product } from '../domain/product.entity';
import { paginatedProducts } from '../../../shared/http/schemas';

const productBody = z.object({
  sku: z.string().min(1),
  name: z.string().min(2),
  description: z.string().optional(),
  costPrice: z.number().positive(),
  salePrice: z.number().positive(),
  category: z.string().optional(),
  initialStock: z.number().int().min(0).optional(),
});

export default async function productRoutes(app: FastifyInstance) {
  app.addHook('onRequest', app.authenticate);

  app.get('/products', {
    schema: {
      tags: ['Produtos'],
      operationId: 'listProducts',
      querystring: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          page: { type: 'integer' },
          limit: { type: 'integer' },
        },
      },
      response: { 200: paginatedProducts },
    },
  }, async (req) => {
    const { category, page, limit } = req.query as any;
    const em = RequestContext.getEntityManager()!;
    return new ListProductsUseCase(em).execute({ category, page: Number(page) || 1, limit: Number(limit) || 50 });
  });

  app.post('/products', {
    schema: {
      tags: ['Produtos'],
      operationId: 'createProduct',
      body: {
        type: 'object',
        required: ['sku', 'name', 'costPrice', 'salePrice'],
        properties: {
          sku: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          costPrice: { type: 'number' },
          salePrice: { type: 'number' },
          category: { type: 'string' },
          initialStock: { type: 'integer' },
        },
      },
      response: { 201: { $ref: 'Product#' } },
    },
  }, async (req, reply) => {
    const data = productBody.parse(req.body);
    const em = RequestContext.getEntityManager()!;
    const product = await new CreateProductUseCase(em).execute(data);
    return reply.status(201).send(product);
  });

  app.get('/products/:id', {
    schema: {
      tags: ['Produtos'],
      operationId: 'getProduct',
      params: {
        type: 'object',
        properties: { id: { type: 'string' } },
        required: ['id'],
      },
      response: { 200: { $ref: 'Product#' } },
    },
  }, async (req) => {
    const { id } = req.params as any;
    const em = RequestContext.getEntityManager()!;
    return em.findOneOrFail(Product, id, { populate: ['stock'] });
  });

  app.put('/products/:id', {
    schema: {
      tags: ['Produtos'],
      operationId: 'updateProduct',
      params: {
        type: 'object',
        properties: { id: { type: 'string' } },
        required: ['id'],
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          costPrice: { type: 'number' },
          salePrice: { type: 'number' },
          category: { type: 'string' },
        },
      },
      response: { 200: { $ref: 'Product#' } },
    },
  }, async (req) => {
    const { id } = req.params as any;
    const data = productBody.omit({ sku: true, initialStock: true }).partial().parse(req.body);
    const em = RequestContext.getEntityManager()!;
    const product = await em.findOneOrFail(Product, id);
    product.update(data);
    await em.flush();
    return product;
  });

  app.delete('/products/:id', {
    schema: {
      tags: ['Produtos'],
      operationId: 'deleteProduct',
      params: {
        type: 'object',
        properties: { id: { type: 'string' } },
        required: ['id'],
      },
      response: { 204: { type: 'null' } },
    },
  }, async (req, reply) => {
    const { id } = req.params as any;
    const em = RequestContext.getEntityManager()!;
    const product = await em.findOneOrFail(Product, id);
    await em.removeAndFlush(product);
    return reply.status(204).send();
  });
}
