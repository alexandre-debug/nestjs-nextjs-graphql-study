import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';

import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';

// Handlers CQRS — registrados como providers para o CommandBus/QueryBus os encontrar
import { CreateUserHandler } from './commands/create-user.handler';
import { GetUsersHandler } from './queries/get-users.handler';
import { GetUserHandler } from './queries/get-user.handler';

// Agrupamos os handlers em arrays para facilitar o registro
const CommandHandlers = [CreateUserHandler];
const QueryHandlers = [GetUsersHandler, GetUserHandler];

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // registra o repositório User neste módulo
    CqrsModule, // disponibiliza CommandBus, QueryBus e EventBus
    // forwardRef: resolve dependência circular entre UsersModule e ActivityLogsModule.
    // UsersResolver precisa de ActivityLogsService; ActivityLogsModule importa User.
    // forwardRef adia a resolução até que ambos os módulos estejam carregados.
    forwardRef(() => ActivityLogsModule),
  ],
  providers: [UsersService, UsersResolver, ...CommandHandlers, ...QueryHandlers],
  exports: [UsersService],
})
export class UsersModule {}
