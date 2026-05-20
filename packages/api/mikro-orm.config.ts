import { defineConfig } from '@mikro-orm/postgresql';
import { Migrator } from '@mikro-orm/migrations';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { User } from './src/modules/auth/domain/user.entity';
import { Client } from './src/modules/clientes/domain/client.entity';
import { Product } from './src/modules/produtos/domain/product.entity';
import { Stock } from './src/modules/estoque/domain/stock.entity';
import { Order } from './src/modules/pedidos/domain/order.entity';
import { OrderItem } from './src/modules/pedidos/domain/order-item.entity';
import { Activity } from './src/modules/dashboard/domain/activity.entity';
import { Goal } from './src/modules/relatorios/domain/goal.entity';

export default defineConfig({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  user: process.env.DB_USER ?? 'erp',
  password: process.env.DB_PASSWORD ?? 'erp123',
  dbName: process.env.DB_NAME ?? 'erp_vendas',
  entities: [User, Client, Product, Stock, Order, OrderItem, Activity, Goal],
  metadataProvider: TsMorphMetadataProvider,
  migrations: {
    path: './migrations',
    glob: '!(*.d).{js,ts}',
  },
  extensions: [Migrator],
  debug: process.env.NODE_ENV !== 'production',
});
