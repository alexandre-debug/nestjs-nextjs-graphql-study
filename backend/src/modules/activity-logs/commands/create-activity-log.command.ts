/**
 * Comando para registrar uma nova atividade de funcionário.
 *
 * Em um sistema real de monitoramento como o nestjs-nextjs-graphql-study, este comando
 * seria disparado por agentes instalados nos computadores dos funcionários,
 * chegando via mensageria (Kafka) ou diretamente via API.
 */
export class CreateActivityLogCommand {
  constructor(
    public readonly userId: string,
    public readonly action: string,
    public readonly metadata?: Record<string, any>,
  ) {}
}
