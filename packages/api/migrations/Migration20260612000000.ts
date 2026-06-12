import { Migration } from '@mikro-orm/migrations';

export class Migration20260612000000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`CREATE INDEX "idx_orders_status" ON "orders" ("status");`);
    this.addSql(`CREATE INDEX "idx_orders_created_at" ON "orders" ("created_at");`);
    this.addSql(`CREATE INDEX "idx_orders_seller" ON "orders" ("seller_id");`);
    this.addSql(`CREATE INDEX "idx_clients_region" ON "clients" ("region");`);
    this.addSql(`CREATE INDEX "idx_products_category" ON "products" ("category");`);
  }

  override async down(): Promise<void> {
    this.addSql(`DROP INDEX IF EXISTS "idx_orders_status";`);
    this.addSql(`DROP INDEX IF EXISTS "idx_orders_created_at";`);
    this.addSql(`DROP INDEX IF EXISTS "idx_orders_seller";`);
    this.addSql(`DROP INDEX IF EXISTS "idx_clients_region";`);
    this.addSql(`DROP INDEX IF EXISTS "idx_products_category";`);
  }

}
