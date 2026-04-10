/**
 * 📚 CONCEITO: GraphQL Subscriptions
 *
 * Subscriptions são conexões WebSocket persistentes que permitem ao servidor
 * EMPURRAR dados ao cliente quando um evento ocorre, sem o cliente precisar
 * fazer polling (requisições repetidas).
 *
 * Fluxo:
 * 1. Cliente abre conexão WebSocket e envia a subscription query
 * 2. Servidor registra o cliente como "inscrito" no PubSub
 * 3. Quando um evento é publicado (via pubSub.publish), o servidor
 *    envia os dados para todos os clientes inscritos automaticamente
 *
 * Casos de uso: feeds em tempo real, notificações, dashboards ao vivo
 */
import { Resolver, Query, Mutation, Args, Subscription, ID } from '@nestjs/graphql';
import { Inject, UseGuards, UseInterceptors } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { ActivityLogsService } from './activity-logs.service';
import { ActivityLog } from './entities/activity-log.entity';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';
import { ActivityLogFiltersDto } from './dto/activity-log-filters.dto';
import { PUB_SUB } from '../../app.module';
import { ACTIVITY_LOG_CREATED } from './commands/create-activity-log.handler';
import { LoggingInterceptor } from '../../common/interceptors/logging.interceptor';
import { AuthGuard, Public } from '../../common/guards/auth.guard';

@Resolver(() => ActivityLog)
@UseGuards(AuthGuard)
@UseInterceptors(LoggingInterceptor)
export class ActivityLogsResolver {
  constructor(
    private readonly activityLogsService: ActivityLogsService,
    @Inject(PUB_SUB)
    private readonly pubSub: PubSub,
  ) {}

  // ============================================================
  // QUERIES
  // ============================================================

  @Public()
  @Query(() => [ActivityLog], {
    name: 'activityLogs',
    description: 'Retorna logs de atividade com filtros opcionais',
  })
  findAll(
    @Args('filters', { nullable: true }) filters?: ActivityLogFiltersDto,
  ): Promise<ActivityLog[]> {
    return this.activityLogsService.findAll(filters);
  }

  // ============================================================
  // MUTATIONS
  // ============================================================

  @Mutation(() => ActivityLog, {
    name: 'createActivityLog',
    description: 'Registra uma nova atividade de funcionário',
  })
  createActivityLog(
    @Args('input') createActivityLogDto: CreateActivityLogDto,
  ): Promise<ActivityLog> {
    return this.activityLogsService.create(createActivityLogDto);
  }

  // ============================================================
  // SUBSCRIPTIONS — tempo real via WebSocket
  // ============================================================

  /**
   * Subscription que notifica todos os clientes conectados quando
   * um novo log de atividade é criado.
   *
   * O cliente conecta via WebSocket e fica "ouvindo".
   * Quando CreateActivityLogHandler publica via pubSub.publish(),
   * esta subscription recebe e retransmite para os clientes.
   */
  @Public()
  @Subscription(() => ActivityLog, {
    name: 'activityLogCreated',
    description: 'Emite em tempo real quando uma nova atividade é registrada',
  })
  activityLogCreated() {
    // asyncIterator retorna um iterador assíncrono que produz valores
    // conforme os eventos são publicados no PubSub
    return this.pubSub.asyncIterator(ACTIVITY_LOG_CREATED);
  }

  /**
   * Subscription filtrada: notifica apenas sobre atividades de um usuário específico.
   *
   * O argumento 'filter' recebe uma função que decide se o evento
   * deve ser enviado para este subscriber específico.
   */
  @Public()
  @Subscription(() => ActivityLog, {
    name: 'userActivityUpdated',
    description: 'Emite em tempo real sobre atividades de um usuário específico',
    // filter: chamado para cada evento publicado, decide se envia ao cliente
    filter: (payload, variables) => {
      return payload.activityLogCreated.userId === variables.userId;
    },
  })
  userActivityUpdated(@Args('userId', { type: () => ID }) userId: string) {
    return this.pubSub.asyncIterator(ACTIVITY_LOG_CREATED);
  }
}
