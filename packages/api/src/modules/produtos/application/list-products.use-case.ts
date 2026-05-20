import { EntityManager, FilterQuery } from '@mikro-orm/core';
import { Product } from '../domain/product.entity';

interface ListProductsQuery {
  category?: string;
  page?: number;
  limit?: number;
}

export class ListProductsUseCase {
  constructor(private em: EntityManager) {}

  async execute(query: ListProductsQuery) {
    const { category, page = 1, limit = 50 } = query;
    const where: FilterQuery<Product> = {};
    if (category) where.category = category;

    const [items, total] = await this.em.findAndCount(Product, where, {
      populate: ['stock'],
      offset: (page - 1) * limit,
      limit,
      orderBy: { name: 'ASC' },
    });
    return { items, total, page, limit };
  }
}
