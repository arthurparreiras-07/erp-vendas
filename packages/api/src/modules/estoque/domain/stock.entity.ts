import { Entity, OneToOne, Property } from '@mikro-orm/core';
import { BaseEntity } from '../../../shared/domain/base.entity';
import { InsufficientStockError } from '../../../shared/domain/errors';
import { Product } from '../../produtos/domain/product.entity';

@Entity({ tableName: 'stocks' })
export class Stock extends BaseEntity {
  @OneToOne(() => Product, { owner: true })
  product: Product;

  @Property()
  physical: number = 0;

  @Property()
  reserved: number = 0;

  @Property({ persist: false })
  get available(): number {
    return this.physical - this.reserved;
  }

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  constructor(product: Product, physical: number = 0) {
    super();
    this.product = product;
    this.physical = physical;
  }

  reserve(qty: number) {
    if (this.available < qty) throw new InsufficientStockError(`Estoque insuficiente: disponível ${this.available}, solicitado ${qty}`);
    this.reserved += qty;
    this.updatedAt = new Date();
  }

  release(qty: number) {
    this.reserved = Math.max(0, this.reserved - qty);
    this.updatedAt = new Date();
  }

  consume(qty: number) {
    this.physical = Math.max(0, this.physical - qty);
    this.release(qty);
    this.updatedAt = new Date();
  }

  updatePhysical(qty: number) {
    this.physical = qty;
    this.updatedAt = new Date();
  }
}
