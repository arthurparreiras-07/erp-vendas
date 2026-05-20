import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { BaseEntity } from '../../../shared/domain/base.entity';
import { User } from '../../auth/domain/user.entity';

@Entity({ tableName: 'goals' })
export class Goal extends BaseEntity {
  @ManyToOne(() => User)
  seller: User;

  @Property()
  period: string;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  targetAmount: number;

  constructor(seller: User, period: string, targetAmount: number) {
    super();
    this.seller = seller;
    this.period = period;
    this.targetAmount = targetAmount;
  }
}
