import { EntityManager } from '@mikro-orm/core';
import { Order } from '../domain/order.entity';

export class ConfirmOrderUseCase {
  constructor(private em: EntityManager) {}

  async execute(orderId: string): Promise<Order> {
    const order = await this.em.findOneOrFail(Order, orderId, {
      populate: ['items', 'items.product', 'items.product.stock', 'client'],
    });
    order.confirm();
    for (const item of order.items.getItems()) {
      item.product.stock?.consume(item.quantity);
    }
    await this.em.flush();
    return order;
  }
}
