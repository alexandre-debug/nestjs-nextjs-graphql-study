import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';
import { ActivityLogFiltersDto } from './dto/activity-log-filters.dto';
import { CreateActivityLogCommand } from './commands/create-activity-log.command';
import { GetActivityLogsQuery } from './queries/get-activity-logs.query';
import { ActivityLog } from './entities/activity-log.entity';

@Injectable()
export class ActivityLogsService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async create(dto: CreateActivityLogDto): Promise<ActivityLog> {
    return this.commandBus.execute(
      new CreateActivityLogCommand(dto.userId, dto.action, dto.metadata),
    );
  }

  async findAll(filters?: ActivityLogFiltersDto): Promise<ActivityLog[]> {
    return this.queryBus.execute(
      new GetActivityLogsQuery(
        filters?.userId,
        filters?.action,
        filters?.startDate,
        filters?.endDate,
      ),
    );
  }

  // Método conveniente para buscar logs por usuário (usado pelo UsersResolver)
  async findByUserId(userId: string): Promise<ActivityLog[]> {
    return this.queryBus.execute(new GetActivityLogsQuery(userId, undefined, undefined, undefined, 50));
  }
}
