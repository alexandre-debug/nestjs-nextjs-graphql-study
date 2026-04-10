/**
 * GetUsersQuery — representa a intenção de buscar todos os usuários.
 *
 * Queries no CQRS são somente leitura: nunca alteram estado.
 * Podem ser otimizadas de forma diferente dos Commands:
 * - Leitura de réplicas do banco
 * - Cache de resultados
 * - Projeções desnormalizadas para performance
 */
export class GetUsersQuery {
  constructor(
    // Parâmetros opcionais de filtro — expandidos conforme necessidade
    public readonly role?: string,
    public readonly search?: string,
  ) {}
}
