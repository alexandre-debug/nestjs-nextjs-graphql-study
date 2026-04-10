import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetUsersQuery } from './get-users.query';
import { User } from '../entities/user.entity';

@QueryHandler(GetUsersQuery)
export class GetUsersHandler implements IQueryHandler<GetUsersQuery> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async execute(query: GetUsersQuery): Promise<User[]> {
    const qb = this.userRepository.createQueryBuilder('user');

    // Filtro por role, se fornecido
    if (query.role) {
      qb.andWhere('user.role = :role', { role: query.role });
    }

    // Busca por nome ou email (case-insensitive com ILIKE no PostgreSQL)
    if (query.search) {
      qb.andWhere('(user.name ILIKE :search OR user.email ILIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    return qb.orderBy('user.createdAt', 'DESC').getMany();
  }
}
