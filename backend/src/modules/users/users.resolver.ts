/**
 * 📚 CONCEITO: Resolvers GraphQL no NestJS
 *
 * Resolvers são equivalentes aos Controllers no REST:
 * cada método resolve um campo do schema GraphQL.
 *
 * Tipos de operações:
 * - @Query: leitura de dados (equivalente ao GET no REST)
 * - @Mutation: escrita/modificação de dados (POST/PUT/DELETE no REST)
 * - @Subscription: stream de eventos em tempo real (WebSocket)
 * - @ResolveField: resolve um campo de um tipo composto (ex: user.activityLogs)
 *
 * ATENÇÃO EM ENTREVISTAS: Explique o N+1 problem no GraphQL e como
 * o DataLoader resolve isso para campos relacionados como activityLogs.
 */
import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { ActivityLog } from '../activity-logs/entities/activity-log.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard, Public, Roles } from '../../common/guards/auth.guard';
import { LoggingInterceptor } from '../../common/interceptors/logging.interceptor';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

@Resolver(() => User) // Informa ao NestJS que este resolver é responsável pelo tipo User
@UseGuards(AuthGuard) // Guard aplicado a todos os campos deste resolver
@UseInterceptors(LoggingInterceptor) // Interceptor para logging de tempo
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  // ============================================================
  // QUERIES — operações de leitura
  // ============================================================

  @Public() // Este campo não requer autenticação
  @Query(() => [User], {
    name: 'users',
    description: 'Retorna todos os usuários monitorados, com filtros opcionais',
  })
  findAll(
    @Args('role', { nullable: true }) role?: string,
    @Args('search', { nullable: true }) search?: string,
  ): Promise<User[]> {
    return this.usersService.findAll(role, search);
  }

  @Public()
  @Query(() => User, {
    name: 'user',
    description: 'Retorna um usuário específico pelo ID',
  })
  findOne(@Args('id', { type: () => ID }) id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  // ============================================================
  // MUTATIONS — operações de escrita
  // ============================================================

  @Roles('ADMIN', 'MANAGER') // Apenas admins e managers podem criar usuários
  @Mutation(() => User, {
    name: 'createUser',
    description: 'Cria um novo usuário monitorado no sistema',
  })
  createUser(@Args('input') createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Mutation(() => User, {
    name: 'updateUser',
    description: 'Atualiza os dados de um usuário existente',
  })
  updateUser(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @Roles('ADMIN')
  @Mutation(() => Boolean, {
    name: 'deleteUser',
    description: 'Remove um usuário do sistema (apenas ADMIN)',
  })
  deleteUser(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return this.usersService.remove(id);
  }

  // ============================================================
  // RESOLVE FIELD — resolve campos de tipo composto
  // Evita carregar dados desnecessários quando activityLogs não é solicitado
  // ============================================================

  @ResolveField(() => [ActivityLog])
  async activityLogs(@Parent() user: User): Promise<ActivityLog[]> {
    // Carrega os logs apenas quando o cliente solicita este campo
    return this.activityLogsService.findByUserId(user.id);
  }
}
