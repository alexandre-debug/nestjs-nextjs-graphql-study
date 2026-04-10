import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';

import { ActivityLog } from './entities/activity-log.entity';
import { User } from '../users/entities/user.entity';
import { ActivityLogsService } from './activity-logs.service';
import { ActivityLogsResolver } from './activity-logs.resolver';
import { ActivityCreatedListener } from './events/activity-created.listener';
import { UsersModule } from '../users/users.module';

import { CreateActivityLogHandler } from './commands/create-activity-log.handler';
import { GetActivityLogsHandler } from './queries/get-activity-logs.handler';

const CommandHandlers = [CreateActivityLogHandler];
const QueryHandlers = [GetActivityLogsHandler];
const EventListeners = [ActivityCreatedListener];

@Module({
  imports: [
    // Precisamos do repositório de User para validar o userId no handler
    TypeOrmModule.forFeature([ActivityLog, User]),
    CqrsModule,
    forwardRef(() => UsersModule),
  ],
  providers: [
    ActivityLogsService,
    ActivityLogsResolver,
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventListeners,
  ],
  exports: [ActivityLogsService],
})
export class ActivityLogsModule {}
