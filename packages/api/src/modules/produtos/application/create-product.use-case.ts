import { EntityManager } from '@mikro-orm/core';
import { Product } from '../domain/product.entity';
import { Stock } from '../../estoque/domain/stock.entity';

interface CreateProductDTO {
  sku: string;
  name: string;
  description?: string;
  costPrice: number;
  salePrice: number;
  category?: string;
  initialStock?: number;
}

export class CreateProductUseCase {
  constructor(private em: EntityManager) {}

  async execute(data: CreateProductDTO): Promise<Product> {
    const product = new Product(data);
    const stock = new Stock(product, data.initialStock ?? 0);
    product.stock = stock;
    this.em.persist(product);
    this.em.persist(stock);
    await this.em.flush();
    return product;
  }
}
