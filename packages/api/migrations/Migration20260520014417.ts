import { Migration } from '@mikro-orm/migrations';

export class Migration20260520014417 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "activities" ("id" uuid not null, "created_at" timestamptz not null, "type" text check ("type" in ('new_order', 'stock_alert', 'new_client', 'stock_update')) not null, "description" varchar(255) not null, constraint "activities_pkey" primary key ("id"));`);

    this.addSql(`create table "clients" ("id" uuid not null, "created_at" timestamptz not null, "name" varchar(255) not null, "cnpj" varchar(255) null, "email" varchar(255) null, "phone" varchar(255) null, "region" varchar(255) null, constraint "clients_pkey" primary key ("id"));`);
    this.addSql(`alter table "clients" add constraint "clients_cnpj_unique" unique ("cnpj");`);

    this.addSql(`create table "products" ("id" uuid not null, "created_at" timestamptz not null, "sku" varchar(255) not null, "name" varchar(255) not null, "description" varchar(255) null, "cost_price" numeric(10,2) not null, "sale_price" numeric(10,2) not null, "category" varchar(255) null, constraint "products_pkey" primary key ("id"));`);
    this.addSql(`alter table "products" add constraint "products_sku_unique" unique ("sku");`);

    this.addSql(`create table "stocks" ("id" uuid not null, "created_at" timestamptz not null, "product_id" uuid not null, "physical" int not null default 0, "reserved" int not null default 0, "updated_at" timestamptz not null, constraint "stocks_pkey" primary key ("id"));`);
    this.addSql(`alter table "stocks" add constraint "stocks_product_id_unique" unique ("product_id");`);

    this.addSql(`create table "users" ("id" uuid not null, "created_at" timestamptz not null, "name" varchar(255) not null, "email" varchar(255) not null, "password_hash" varchar(255) not null, "role" text check ("role" in ('admin', 'vendedor')) not null, constraint "users_pkey" primary key ("id"));`);
    this.addSql(`alter table "users" add constraint "users_email_unique" unique ("email");`);

    this.addSql(`create table "orders" ("id" uuid not null, "created_at" timestamptz not null, "client_id" uuid not null, "seller_id" uuid not null, "status" text check ("status" in ('pending', 'confirmed', 'cancelled')) not null default 'pending', "subtotal" numeric(10,2) not null default 0, "discount" numeric(10,2) not null default 0, "tax" numeric(10,2) not null default 0, "total" numeric(10,2) not null default 0, constraint "orders_pkey" primary key ("id"));`);

    this.addSql(`create table "order_items" ("id" uuid not null, "created_at" timestamptz not null, "order_id" uuid not null, "product_id" uuid not null, "quantity" int not null, "unit_price" numeric(10,2) not null, "subtotal" numeric(10,2) not null, constraint "order_items_pkey" primary key ("id"));`);

    this.addSql(`create table "goals" ("id" uuid not null, "created_at" timestamptz not null, "seller_id" uuid not null, "period" varchar(255) not null, "target_amount" numeric(10,2) not null, constraint "goals_pkey" primary key ("id"));`);

    this.addSql(`alter table "stocks" add constraint "stocks_product_id_foreign" foreign key ("product_id") references "products" ("id") on update cascade;`);

    this.addSql(`alter table "orders" add constraint "orders_client_id_foreign" foreign key ("client_id") references "clients" ("id") on update cascade;`);
    this.addSql(`alter table "orders" add constraint "orders_seller_id_foreign" foreign key ("seller_id") references "users" ("id") on update cascade;`);

    this.addSql(`alter table "order_items" add constraint "order_items_order_id_foreign" foreign key ("order_id") references "orders" ("id") on update cascade;`);
    this.addSql(`alter table "order_items" add constraint "order_items_product_id_foreign" foreign key ("product_id") references "products" ("id") on update cascade;`);

    this.addSql(`alter table "goals" add constraint "goals_seller_id_foreign" foreign key ("seller_id") references "users" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "orders" drop constraint "orders_client_id_foreign";`);

    this.addSql(`alter table "stocks" drop constraint "stocks_product_id_foreign";`);

    this.addSql(`alter table "order_items" drop constraint "order_items_product_id_foreign";`);

    this.addSql(`alter table "orders" drop constraint "orders_seller_id_foreign";`);

    this.addSql(`alter table "goals" drop constraint "goals_seller_id_foreign";`);

    this.addSql(`alter table "order_items" drop constraint "order_items_order_id_foreign";`);

    this.addSql(`drop table if exists "activities" cascade;`);

    this.addSql(`drop table if exists "clients" cascade;`);

    this.addSql(`drop table if exists "products" cascade;`);

    this.addSql(`drop table if exists "stocks" cascade;`);

    this.addSql(`drop table if exists "users" cascade;`);

    this.addSql(`drop table if exists "orders" cascade;`);

    this.addSql(`drop table if exists "order_items" cascade;`);

    this.addSql(`drop table if exists "goals" cascade;`);
  }

}
