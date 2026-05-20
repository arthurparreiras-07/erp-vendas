import { EntityManager } from '@mikro-orm/core';
import { Order } from '../domain/order.entity';

export class CancelOrderUseCase {
  constructor(private em: EntityManager) {}

  async execute(orderId: string): Promise<Order> {
    const order = await this.em.findOneOrFail(Order, orderId, {
      populate: ['items', 'items.product', 'items.product.stock'],
    });
    order.cancel();
    for (const item of order.items.getItems()) {
      item.product.stock?.release(item.quantity);
    }
    await this.em.flush();
    return order;
  }
}
