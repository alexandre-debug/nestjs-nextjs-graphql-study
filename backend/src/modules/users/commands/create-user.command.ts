/**
 * 📚 CONCEITO: CQRS — Command Query Responsibility Segregation
 *
 * CQRS separa as operações de ESCRITA (Commands) das operações de LEITURA (Queries).
 * Benefícios:
 * - Cada side tem seu próprio modelo (Command Model vs Query Model)
 * - Facilita escalar leitura e escrita independentemente
 * - Torna a intenção do código mais explícita
 * - Base para Event Sourcing (quando combinado)
 *
 * Neste projeto:
 * - Commands: CreateUser, UpdateUser, DeleteUser → alteram estado
 * - Queries: GetUsers, GetUser → leem estado
 *
 * No NestJS, @nestjs/cqrs provê CommandBus e QueryBus para despachar
 * o comando/query para o handler correto.
 */

/**
 * CreateUserCommand é um simples objeto de dados (sem lógica).
 * Representa a INTENÇÃO de criar um usuário com os dados fornecidos.
 * O Command Bus encaminha para o CreateUserHandler.
 */
export class CreateUserCommand {
  constructor(
    public readonly name: string,
    public readonly email: string,
    public readonly role: string,
  ) {}
}
