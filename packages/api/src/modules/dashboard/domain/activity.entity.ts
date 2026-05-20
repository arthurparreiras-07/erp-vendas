import { Entity, Enum, Property } from '@mikro-orm/core';
import { BaseEntity } from '../../../shared/domain/base.entity';

export enum ActivityType {
  NEW_ORDER = 'new_order',
  STOCK_ALERT = 'stock_alert',
  NEW_CLIENT = 'new_client',
  STOCK_UPDATE = 'stock_update',
}

@Entity({ tableName: 'activities' })
export class Activity extends BaseEntity {
  @Enum(() => ActivityType)
  type: ActivityType;

  @Property()
  description: string;

  constructor(type: ActivityType, description: string) {
    super();
    this.type = type;
    this.description = description;
  }
}
