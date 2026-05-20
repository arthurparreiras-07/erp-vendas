import { Collection, Entity, Enum, ManyToOne, OneToMany, Property } from '@mikro-orm/core';
import { BaseEntity } from '../../../shared/domain/base.entity';
import { Client } from '../../clientes/domain/client.entity';
import { User } from '../../auth/domain/user.entity';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
}

@Entity({ tableName: 'orders' })
export class Order extends BaseEntity {
  @ManyToOne(() => Client)
  client: Client;

  @ManyToOne(() => User)
  seller: User;

  @Enum(() => OrderStatus)
  status: OrderStatus = OrderStatus.PENDING;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number = 0;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  discount: number = 0;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  tax: number = 0;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  total: number = 0;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: ['all'] as any })
  items = new Collection<OrderItem>(this);

  constructor(client: Client, seller: User, discount = 0, tax = 0) {
    super();
    this.client = client;
    this.seller = seller;
    this.discount = discount;
    this.tax = tax;
  }

  calcTotal() {
    this.subtotal = this.items.getItems().reduce((sum, item) => sum + Number(item.subtotal), 0);
    this.total = this.subtotal - Number(this.discount) + Number(this.tax);
  }

  confirm() {
    if (this.status !== OrderStatus.PENDING) throw new Error('Apenas pedidos pendentes podem ser confirmados');
    this.status = OrderStatus.CONFIRMED;
  }

  cancel() {
    if (this.status === OrderStatus.CANCELLED) throw new Error('Pedido já cancelado');
    this.status = OrderStatus.CANCELLED;
  }
}
