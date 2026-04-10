/**
 * Handler do CreateActivityLogCommand.
 *
 * Após salvar o log, publica dois tipos de notificação:
 * 1. GraphQL PubSub: para Subscriptions em tempo real no frontend
 * 2. EventEmitter: para outros módulos reagirem internamente (simulando Kafka)
 */
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PubSub } from 'graphql-subscriptions';
import { CreateActivityLogCommand } from './create-activity-log.command';
import { ActivityLog } from '../entities/activity-log.entity';
import { PUB_SUB } from '../../../app.module';
import { UserNotFoundException } from '../../../common/exceptions/business.exception';
import { User } from '../../users/entities/user.entity';

// Constante para o evento de subscription GraphQL
// Centralizar evita typos ao publicar e assinar
export const ACTIVITY_LOG_CREATED = 'activityLogCreated';

@CommandHandler(CreateActivityLogCommand)
export class CreateActivityLogHandler implements ICommandHandler<CreateActivityLogCommand> {
  constructor(
    @InjectRepository(ActivityLog)
    private readonly activityLogRepository: Repository<ActivityLog>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    // PubSub para Subscriptions GraphQL em tempo real
    @Inject(PUB_SUB)
    private readonly pubSub: PubSub,
    // EventEmitter para comunicação interna entre módulos (estilo Kafka/RabbitMQ)
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: CreateActivityLogCommand): Promise<ActivityLog> {
    const { userId, action, metadata } = command;

    // Valida que o usuário existe antes de registrar a atividade
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    const activityLog = this.activityLogRepository.create({
      userId,
      action,
      metadata,
    });

    const saved = await this.activityLogRepository.save(activityLog);

    // --------------------------------------------------------
    // PASSO 1: Publica via GraphQL PubSub
    // O Subscription 'activityLogCreated' no resolver irá receber isso
    // e enviar ao cliente via WebSocket em tempo real.
    // --------------------------------------------------------
    await this.pubSub.publish(ACTIVITY_LOG_CREATED, {
      activityLogCreated: { ...saved, user },
    });

    // --------------------------------------------------------
    // PASSO 2: Emite evento interno via EventEmitter
    // Simula o comportamento de publicar em um tópico Kafka.
    // Outros módulos podem escutar 'activity.created' sem saber
    // nada sobre ActivityLogsModule (baixo acoplamento).
    // --------------------------------------------------------
    this.eventEmitter.emit('activity.created', {
      activityLogId: saved.id,
      userId,
      action,
      timestamp: saved.timestamp,
    });

    return saved;
  }
}
