import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { BaseEntity } from '../../../shared/domain/base.entity';
import { Product } from '../../produtos/domain/product.entity';
import { Order } from './order.entity';

@Entity({ tableName: 'order_items' })
export class OrderItem extends BaseEntity {
  @ManyToOne(() => Order)
  order: Order;

  @ManyToOne(() => Product)
  product: Product;

  @Property()
  quantity: number;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  constructor(order: Order, product: Product, quantity: number, unitPrice: number) {
    super();
    this.order = order;
    this.product = product;
    this.quantity = quantity;
    this.unitPrice = unitPrice;
    this.subtotal = quantity * unitPrice;
  }
}
