import { EntityManager, FilterQuery } from '@mikro-orm/core';
import { Order, OrderStatus } from '../../pedidos/domain/order.entity';

interface SalesReportQuery {
  from?: string;
  to?: string;
  sellerId?: string;
  region?: string;
}

export class SalesReportUseCase {
  constructor(private em: EntityManager) {}

  async execute(query: SalesReportQuery) {
    const where: FilterQuery<Order> = {
      status: { $in: [OrderStatus.PENDING, OrderStatus.CONFIRMED] },
    };
    if (query.from) where.createdAt = { ...(where.createdAt as object), $gte: new Date(query.from) };
    if (query.to) where.createdAt = { ...(where.createdAt as object), $lte: new Date(query.to) };
    if (query.sellerId) where.seller = query.sellerId;
    if (query.region) (where as any).client = { region: query.region };

    const orders = await this.em.find(Order, where, {
      populate: ['seller', 'client', 'items', 'items.product'],
    });

    const bySellerMap = new Map<string, { sellerName: string; totalAmount: number; orderCount: number; totalCost: number }>();
    for (const order of orders) {
      const key = order.seller.id;
      if (!bySellerMap.has(key)) {
        bySellerMap.set(key, { sellerName: order.seller.name, totalAmount: 0, orderCount: 0, totalCost: 0 });
      }
      const entry = bySellerMap.get(key)!;
      entry.totalAmount += Number(order.total);
      entry.orderCount += 1;
      entry.totalCost += order.items.getItems().reduce((s, i) => s + Number(i.product.costPrice) * i.quantity, 0);
    }

    return Array.from(bySellerMap.entries()).map(([sellerId, data]) => ({
      sellerId,
      sellerName: data.sellerName,
      totalAmount: data.totalAmount,
      orderCount: data.orderCount,
      avgMargin: data.totalAmount > 0 ? ((data.totalAmount - data.totalCost) / data.totalAmount) * 100 : 0,
    }));
  }
}
