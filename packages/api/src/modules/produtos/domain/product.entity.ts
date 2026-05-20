import { Entity, OneToOne, Property, Unique } from '@mikro-orm/core';
import { BaseEntity } from '../../../shared/domain/base.entity';
import { Stock } from '../../estoque/domain/stock.entity';

@Entity({ tableName: 'products' })
export class Product extends BaseEntity {
  @Property()
  @Unique()
  sku: string;

  @Property()
  name: string;

  @Property({ nullable: true })
  description?: string;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  costPrice: number;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  salePrice: number;

  @Property({ nullable: true })
  category?: string;

  @OneToOne(() => Stock, (stock) => stock.product, { nullable: true })
  stock?: Stock;

  constructor(data: {
    sku: string;
    name: string;
    description?: string;
    costPrice: number;
    salePrice: number;
    category?: string;
  }) {
    super();
    this.sku = data.sku;
    this.name = data.name;
    this.description = data.description;
    this.costPrice = data.costPrice;
    this.salePrice = data.salePrice;
    this.category = data.category;
  }

  update(data: Partial<{ name: string; description: string; costPrice: number; salePrice: number; category: string }>) {
    if (data.name !== undefined) this.name = data.name;
    if (data.description !== undefined) this.description = data.description;
    if (data.costPrice !== undefined) this.costPrice = data.costPrice;
    if (data.salePrice !== undefined) this.salePrice = data.salePrice;
    if (data.category !== undefined) this.category = data.category;
  }
}
