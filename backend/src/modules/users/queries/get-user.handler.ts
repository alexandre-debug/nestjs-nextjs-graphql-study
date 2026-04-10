import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetUserQuery } from './get-user.query';
import { User } from '../entities/user.entity';
import { UserNotFoundException } from '../../../common/exceptions/business.exception';

@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async execute(query: GetUserQuery): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: query.id },
      relations: ['activityLogs'], // carrega os logs relacionados
    });

    if (!user) {
      throw new UserNotFoundException(query.id);
    }

    return user;
  }
}
