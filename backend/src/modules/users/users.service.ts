/**
 * UsersService — camada de serviço que orquestra Commands e Queries via CQRS.
 *
 * Por que ter um Service se já temos Commands/Queries?
 * O Service é a "porta de entrada" do módulo para outros módulos.
 * Ele usa o CommandBus e QueryBus para despachar as operações,
 * mantendo o CQRS mas sem expor os detalhes internos ao exterior.
 */
import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserCommand } from './commands/create-user.command';
import { GetUsersQuery } from './queries/get-users.query';
import { GetUserQuery } from './queries/get-user.query';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserNotFoundException } from '../../common/exceptions/business.exception';

@Injectable()
export class UsersService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    // Despacha o comando — o handler correspondente é chamado automaticamente
    return this.commandBus.execute(new CreateUserCommand(dto.name, dto.email, dto.role));
  }

  async findAll(role?: string, search?: string): Promise<User[]> {
    return this.queryBus.execute(new GetUsersQuery(role, search));
  }

  async findOne(id: string): Promise<User> {
    return this.queryBus.execute(new GetUserQuery(id));
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    // Para update, fazemos diretamente no service para simplicidade
    // Em projetos maiores, criaria UpdateUserCommand + UpdateUserHandler
    const user = await this.findOne(id);

    Object.assign(user, dto);
    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<boolean> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
    return true;
  }
}
