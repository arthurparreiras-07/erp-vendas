import { FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '../../modules/auth/domain/user.entity';

export function requireRole(...roles: UserRole[]) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const user = req.user as { sub: string; role: UserRole };
    if (!roles.includes(user.role)) {
      return reply.status(403).send({ error: 'Acesso não autorizado' });
    }
  };
}
