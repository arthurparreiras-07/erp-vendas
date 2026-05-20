import { EntityManager } from '@mikro-orm/core';
import { Client } from '../domain/client.entity';
import { Activity, ActivityType } from '../../dashboard/domain/activity.entity';

interface CreateClientDTO {
  name: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  region?: string;
}

export class CreateClientUseCase {
  constructor(private em: EntityManager) {}

  async execute(data: CreateClientDTO): Promise<Client> {
    const client = new Client(data);
    const activity = new Activity(ActivityType.NEW_CLIENT, `Novo cliente cadastrado: ${data.name}`);
    this.em.persist(client);
    this.em.persist(activity);
    await this.em.flush();
    return client;
  }
}
