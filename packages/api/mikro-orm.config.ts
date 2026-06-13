import 'dotenv/config';
import path from 'path';
import { defineConfig, ReflectMetadataProvider } from '@mikro-orm/postgresql';
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

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} não definido no ambiente`);
  return value;
}

const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  host: requireEnv('DB_HOST'),
  port: Number(requireEnv('DB_PORT')),
  user: requireEnv('DB_USER'),
  password: requireEnv('DB_PASSWORD'),
  dbName: requireEnv('DB_NAME'),
  entities: [User, Client, Product, Stock, Order, OrderItem, Activity, Goal],
  metadataProvider: isProduction ? ReflectMetadataProvider : TsMorphMetadataProvider,
  migrations: {
    path: path.join(__dirname, 'migrations'),
    glob: '!(*.d).{js,ts}',
  },
  extensions: [Migrator],
  debug: !isProduction,
});
