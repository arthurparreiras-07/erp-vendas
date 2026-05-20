import { Entity, Property, Unique } from '@mikro-orm/core';
import { BaseEntity } from '../../../shared/domain/base.entity';

@Entity({ tableName: 'clients' })
export class Client extends BaseEntity {
  @Property()
  name: string;

  @Property({ nullable: true })
  @Unique()
  cnpj?: string;

  @Property({ nullable: true })
  email?: string;

  @Property({ nullable: true })
  phone?: string;

  @Property({ nullable: true })
  region?: string;

  constructor(data: { name: string; cnpj?: string; email?: string; phone?: string; region?: string }) {
    super();
    this.name = data.name;
    this.cnpj = data.cnpj;
    this.email = data.email;
    this.phone = data.phone;
    this.region = data.region;
  }

  update(data: Partial<{ name: string; cnpj: string; email: string; phone: string; region: string }>) {
    if (data.name !== undefined) this.name = data.name;
    if (data.cnpj !== undefined) this.cnpj = data.cnpj;
    if (data.email !== undefined) this.email = data.email;
    if (data.phone !== undefined) this.phone = data.phone;
    if (data.region !== undefined) this.region = data.region;
  }
}
