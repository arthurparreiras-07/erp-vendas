import { EntityManager } from '@mikro-orm/core';
import { User } from '../domain/user.entity';

export class LoginUseCase {
  constructor(private em: EntityManager) {}

  async execute(email: string, password: string): Promise<User> {
    const user = await this.em.findOne(User, { email });
    if (!user || !user.verifyPassword(password)) {
      throw new Error('Credenciais inválidas');
    }
    return user;
  }
}
