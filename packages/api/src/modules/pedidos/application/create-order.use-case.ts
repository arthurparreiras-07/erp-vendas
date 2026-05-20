import { EntityManager } from '@mikro-orm/core';
import { Order } from '../domain/order.entity';
import { OrderItem } from '../domain/order-item.entity';
import { Client } from '../../clientes/domain/client.entity';
import { User } from '../../auth/domain/user.entity';
import { Product } from '../../produtos/domain/product.entity';
import { Activity, ActivityType } from '../../dashboard/domain/activity.entity';

interface OrderItemDTO {
  productId: string;
  quantity: number;
}

interface CreateOrderDTO {
  clientId: string;
  sellerId: string;
  items: OrderItemDTO[];
  discount?: number;
  tax?: number;
}

export class CreateOrderUseCase {
  constructor(private em: EntityManager) {}

  async execute(data: CreateOrderDTO): Promise<Order> {
    const client = await this.em.findOneOrFail(Client, data.clientId);
    const seller = await this.em.findOneOrFail(User, data.sellerId);
    const order = new Order(client, seller, data.discount ?? 0, data.tax ?? 0);
    this.em.persist(order);

    for (const itemDTO of data.items) {
      const product = await this.em.findOneOrFail(Product, itemDTO.productId, { populate: ['stock'] });
      if (!product.stock) throw new Error(`Produto ${product.name} sem estoque cadastrado`);
      product.stock.reserve(itemDTO.quantity);
      const item = new OrderItem(order, product, itemDTO.quantity, product.salePrice);
      order.items.add(item);
      this.em.persist(item);
    }

    order.calcTotal();
    const activity = new Activity(ActivityType.NEW_ORDER, `Novo pedido criado para ${client.name} — R$ ${order.total.toFixed(2)}`);
    this.em.persist(activity);
    await this.em.flush();
    return order;
  }
}
