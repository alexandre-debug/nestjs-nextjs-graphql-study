import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetActivityLogsQuery } from './get-activity-logs.query';
import { ActivityLog } from '../entities/activity-log.entity';

@QueryHandler(GetActivityLogsQuery)
export class GetActivityLogsHandler implements IQueryHandler<GetActivityLogsQuery> {
  constructor(
    @InjectRepository(ActivityLog)
    private readonly activityLogRepository: Repository<ActivityLog>,
  ) {}

  async execute(query: GetActivityLogsQuery): Promise<ActivityLog[]> {
    const qb = this.activityLogRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user') // JOIN para carregar dados do usuário
      .orderBy('log.timestamp', 'DESC');

    if (query.userId) {
      qb.andWhere('log.userId = :userId', { userId: query.userId });
    }

    if (query.action) {
      qb.andWhere('log.action = :action', { action: query.action });
    }

    // Filtro por intervalo de data usando between
    if (query.startDate) {
      qb.andWhere('log.timestamp >= :startDate', { startDate: new Date(query.startDate) });
    }

    if (query.endDate) {
      qb.andWhere('log.timestamp <= :endDate', { endDate: new Date(query.endDate) });
    }

    // Limita o número de resultados para evitar overload (padrão: 100)
    qb.take(query.limit || 100);

    return qb.getMany();
  }
}
