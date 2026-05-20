import { MikroORM } from '@mikro-orm/core';
import config from '../../../mikro-orm.config';
import { User, UserRole } from '../../modules/auth/domain/user.entity';
import { Client } from '../../modules/clientes/domain/client.entity';
import { Product } from '../../modules/produtos/domain/product.entity';
import { Stock } from '../../modules/estoque/domain/stock.entity';

async function seed() {
  const orm = await MikroORM.init(config);
  const em = orm.em.fork();

  const admin = new User('Admin ERP', 'admin@erp.com', 'admin123', UserRole.ADMIN);
  const v1 = new User('João Silva', 'joao@erp.com', 'senha123', UserRole.VENDEDOR);
  const v2 = new User('Maria Santos', 'maria@erp.com', 'senha123', UserRole.VENDEDOR);

  const clients = [
    new Client({ name: 'Comércio ABC Ltda', cnpj: '12.345.678/0001-90', email: 'abc@comercio.com', region: 'Sudeste' }),
    new Client({ name: 'Distribuidora XYZ', cnpj: '98.765.432/0001-10', email: 'xyz@dist.com', region: 'Sul' }),
    new Client({ name: 'Tech Solutions SA', cnpj: '11.222.333/0001-44', email: 'tech@solutions.com', region: 'Sudeste' }),
    new Client({ name: 'Mercado Bom Preço', cnpj: '55.666.777/0001-88', region: 'Nordeste' }),
    new Client({ name: 'Supermercados Norte', cnpj: '44.555.666/0001-77', region: 'Norte' }),
  ];

  const productsData = [
    { sku: 'NB-001', name: 'Notebook Core i5', costPrice: 2500, salePrice: 3499.90, category: 'Informática', stock: 15 },
    { sku: 'MON-001', name: 'Monitor 24" Full HD', costPrice: 600, salePrice: 899.90, category: 'Informática', stock: 20 },
    { sku: 'TEC-001', name: 'Teclado Mecânico', costPrice: 150, salePrice: 299.90, category: 'Periféricos', stock: 30 },
    { sku: 'MOU-001', name: 'Mouse Sem Fio', costPrice: 50, salePrice: 129.90, category: 'Periféricos', stock: 45 },
    { sku: 'HD-001', name: 'HD Externo 1TB', costPrice: 220, salePrice: 349.90, category: 'Armazenamento', stock: 3 },
    { sku: 'PEN-001', name: 'Pendrive 64GB', costPrice: 25, salePrice: 59.90, category: 'Armazenamento', stock: 60 },
    { sku: 'CAB-001', name: 'Cabo HDMI 2m', costPrice: 15, salePrice: 39.90, category: 'Cabos', stock: 2 },
    { sku: 'WEB-001', name: 'Webcam HD 1080p', costPrice: 120, salePrice: 219.90, category: 'Periféricos', stock: 12 },
    { sku: 'HUB-001', name: 'Hub USB-C 7 portas', costPrice: 80, salePrice: 159.90, category: 'Periféricos', stock: 8 },
    { sku: 'IMP-001', name: 'Impressora Laser', costPrice: 800, salePrice: 1199.90, category: 'Impressão', stock: 4 },
  ];

  for (const p of productsData) {
    const product = new Product(p);
    const stock = new Stock(product, p.stock);
    product.stock = stock;
    em.persist(product);
    em.persist(stock);
  }

  em.persist([admin, v1, v2, ...clients]);
  await em.flush();
  console.log('Seed concluído com sucesso!');
  await orm.close();
}

seed().catch((e) => { console.error(e); process.exit(1); });
