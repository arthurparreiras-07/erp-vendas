import { EntityManager, FilterQuery } from '@mikro-orm/core';
import { Client } from '../domain/client.entity';

interface ListClientsQuery {
  name?: string;
  cnpj?: string;
  page?: number;
  limit?: number;
}

export class ListClientsUseCase {
  constructor(private em: EntityManager) {}

  async execute(query: ListClientsQuery) {
    const { name, cnpj, page = 1, limit = 20 } = query;
    const where: FilterQuery<Client> = {};
    if (name) where.name = { $ilike: `%${name}%` };
    if (cnpj) where.cnpj = { $ilike: `%${cnpj}%` };

    const [items, total] = await this.em.findAndCount(Client, where, {
      offset: (page - 1) * limit,
      limit,
      orderBy: { createdAt: 'DESC' },
    });
    return { items, total, page, limit };
  }
}
