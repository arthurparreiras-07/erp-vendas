import { EntityManager } from '@mikro-orm/core';
import { Order, OrderStatus } from '../../pedidos/domain/order.entity';

export class GetChartUseCase {
  constructor(private em: EntityManager) {}

  async execute() {
    const weeks: { label: string; start: Date; end: Date }[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const start = new Date(now);
      start.setDate(now.getDate() - i * 7 - now.getDay());
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      const label = `Sem ${start.getDate()}/${start.getMonth() + 1}`;
      weeks.push({ label, start, end });
    }

    const orders = await this.em.find(Order, {
      status: { $in: [OrderStatus.PENDING, OrderStatus.CONFIRMED] },
      createdAt: { $gte: weeks[0].start },
    });

    const values = weeks.map((w) =>
      orders
        .filter((o) => o.createdAt >= w.start && o.createdAt <= w.end)
        .reduce((sum, o) => sum + Number(o.total), 0)
    );

    return { labels: weeks.map((w) => w.label), values };
  }
}
