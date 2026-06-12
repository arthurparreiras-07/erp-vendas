import { EntityManager } from '@mikro-orm/core';

interface SalesReportQuery {
  from?: string;
  to?: string;
  sellerId?: string;
  region?: string;
}

interface ReportRow {
  sellerId: string;
  sellerName: string;
  totalAmount: number;
  orderCount: number;
  avgMargin: number;
}

export class SalesReportUseCase {
  constructor(private em: EntityManager) {}

  async execute(query: SalesReportQuery): Promise<ReportRow[]> {
    const conditions: string[] = [`o.status IN ('pending', 'confirmed')`];
    const params: unknown[] = [];

    if (query.from) {
      params.push(new Date(query.from));
      conditions.push(`o.created_at >= $${params.length}`);
    }
    if (query.to) {
      params.push(new Date(query.to));
      conditions.push(`o.created_at <= $${params.length}`);
    }
    if (query.sellerId) {
      params.push(query.sellerId);
      conditions.push(`o.seller_id = $${params.length}::uuid`);
    }
    if (query.region) {
      params.push(query.region);
      conditions.push(`c.region = $${params.length}`);
    }

    const where = conditions.join(' AND ');

    const sql = `
      SELECT
        u.id                                                         AS "sellerId",
        u.name                                                       AS "sellerName",
        SUM(o.total)::float                                          AS "totalAmount",
        COUNT(o.id)::int                                             AS "orderCount",
        CASE WHEN SUM(o.total) > 0
          THEN ((SUM(o.total) - COALESCE(SUM(ic.cost), 0)) / SUM(o.total)) * 100
          ELSE 0
        END::float                                                   AS "avgMargin"
      FROM orders o
      JOIN users u   ON u.id = o.seller_id
      JOIN clients c ON c.id = o.client_id
      LEFT JOIN (
        SELECT oi.order_id, SUM(oi.quantity::numeric * p.cost_price) AS cost
        FROM order_items oi
        JOIN products p ON p.id = oi.product_id
        GROUP BY oi.order_id
      ) ic ON ic.order_id = o.id
      WHERE ${where}
      GROUP BY u.id, u.name
      ORDER BY "totalAmount" DESC
    `;

    const rows = await this.em.getConnection().execute<ReportRow[]>(sql, params);
    return rows;
  }
}
