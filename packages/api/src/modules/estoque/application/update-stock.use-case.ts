import { EntityManager } from '@mikro-orm/core';
import { Stock } from '../domain/stock.entity';
import { Activity, ActivityType } from '../../dashboard/domain/activity.entity';

export class UpdateStockUseCase {
  constructor(private em: EntityManager) {}

  async execute(productId: string, physical: number): Promise<Stock> {
    const stock = await this.em.findOneOrFail(Stock, { product: productId }, { populate: ['product'] });
    stock.updatePhysical(physical);
    const activity = new Activity(ActivityType.STOCK_UPDATE, `Estoque de ${stock.product.name} atualizado para ${physical} unidades`);
    this.em.persist(activity);
    await this.em.flush();
    return stock;
  }
}
