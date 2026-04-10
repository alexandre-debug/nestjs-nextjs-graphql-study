/**
 * 📚 CONCEITO: Event-Driven Architecture com EventEmitter
 *
 * O padrão de eventos (pub/sub interno) permite que módulos reajam
 * a ações sem conhecer o módulo que as originou.
 *
 * Comparação com Kafka/RabbitMQ:
 * - EventEmitter: in-process, sem persistência, simples, ideal para monólito
 * - Kafka: distribuído, persistente, alta throughput, ideal para microsserviços
 * - RabbitMQ: distribuído, suporte a routing complexo, ideal para tasks/jobs
 *
 * Em entrevistas: saiba explicar quando escolher cada abordagem e
 * os trade-offs entre consistência eventual e sincronicidade.
 */
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

interface ActivityCreatedPayload {
  activityLogId: string;
  userId: string;
  action: string;
  timestamp: Date;
}

@Injectable()
export class ActivityCreatedListener {
  private readonly logger = new Logger(ActivityCreatedListener.name);

  /**
   * Escuta o evento 'activity.created' publicado pelo CreateActivityLogHandler.
   * Wildcard: '@OnEvent('activity.*')' capturia todos os eventos de atividade.
   *
   * Em produção, aqui poderíamos:
   * - Enviar alertas por e-mail para comportamentos suspeitos
   * - Atualizar métricas em tempo real (Redis/InfluxDB)
   * - Disparar regras de compliance
   * - Registrar em sistema de auditoria separado
   */
  @OnEvent('activity.created', { async: true })
  async handleActivityCreated(payload: ActivityCreatedPayload): Promise<void> {
    this.logger.log(
      `[Evento Recebido] activity.created — Usuário: ${payload.userId}, Ação: ${payload.action}`,
    );

    // Simulação: detecção de padrão suspeito
    const suspiciousActions = ['FILE_DOWNLOAD_BULK', 'USB_DEVICE_CONNECTED', 'VPN_CONNECTED'];

    if (suspiciousActions.includes(payload.action)) {
      this.logger.warn(
        `⚠️ [ALERTA DE COMPLIANCE] Ação suspeita detectada: ${payload.action} pelo usuário ${payload.userId}`,
      );
      // Em produção: dispararia alerta via e-mail, Slack, ou sistema de tickets
    }
  }
}
