import { EntityManager } from '@mikro-orm/core';
import { Order } from '../domain/order.entity';

export class ConfirmOrderUseCase {
  constructor(private em: EntityManager) {}

  async execute(orderId: string): Promise<Order> {
    const order = await this.em.findOneOrFail(Order, orderId, { populate: ['items', 'client'] });
    order.confirm();
    await this.em.flush();
    return order;
  }
}
