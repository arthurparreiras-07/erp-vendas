import { EntityManager } from '@mikro-orm/core';
import { Order, OrderStatus } from '../../pedidos/domain/order.entity';
import { Client } from '../../clientes/domain/client.entity';
import { Stock } from '../../estoque/domain/stock.entity';

export class GetKpisUseCase {
  constructor(private em: EntityManager) {}

  async execute() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [allOrders, newClientsCount, stocks] = await Promise.all([
      this.em.find(Order, { status: { $in: [OrderStatus.PENDING, OrderStatus.CONFIRMED] } }),
      this.em.count(Client, { createdAt: { $gte: startOfMonth } }),
      this.em.find(Stock, {}),
    ]);

    const monthlyOrders = allOrders.filter((o) => o.createdAt >= startOfMonth);
    const monthlyRevenue = monthlyOrders.reduce((sum, o) => sum + Number(o.total), 0);
    const totalSales = allOrders.length;
    const lowStockItems = stocks.filter((s) => s.physical - s.reserved < 5).length;

    return { totalSales, newClients: newClientsCount, lowStockItems, monthlyRevenue };
  }
}
