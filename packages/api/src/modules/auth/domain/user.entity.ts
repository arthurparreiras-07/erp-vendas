import { Entity, Enum, Property, Unique } from '@mikro-orm/core';
import * as bcrypt from 'bcryptjs';
import { BaseEntity } from '../../../shared/domain/base.entity';

export enum UserRole {
  ADMIN = 'admin',
  VENDEDOR = 'vendedor',
}

@Entity({ tableName: 'users' })
export class User extends BaseEntity {
  @Property()
  name: string;

  @Property()
  @Unique()
  email: string;

  @Property({ hidden: true })
  passwordHash: string;

  @Enum(() => UserRole)
  role: UserRole;

  constructor(name: string, email: string, password: string, role: UserRole = UserRole.VENDEDOR) {
    super();
    this.name = name;
    this.email = email;
    this.passwordHash = bcrypt.hashSync(password, 10);
    this.role = role;
  }

  verifyPassword(password: string): boolean {
    return bcrypt.compareSync(password, this.passwordHash);
  }
}
