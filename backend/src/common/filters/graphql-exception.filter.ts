/**
 * 📚 CONCEITO: Exception Filters no NestJS
 *
 * Filtros de exceção interceptam erros lançados durante o processamento
 * de uma requisição ANTES de chegarem ao cliente. Permitem formatar
 * a resposta de erro de forma consistente em toda a aplicação.
 *
 * No GraphQL, erros são capturados aqui e transformados em um formato
 * padronizado que o Apollo Server envia ao cliente.
 *
 * Diferença de Interceptors: Filters tratam ERROS, Interceptors transformam
 * a resposta normal (sucesso ou erro) de forma mais ampla.
 */
import { Catch, ArgumentsHost } from '@nestjs/common';
import { GqlExceptionFilter, GqlArgumentsHost } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { BusinessException } from '../exceptions/business.exception';

@Catch()
export class GraphQLExceptionFilter implements GqlExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Converte o contexto para GraphQL (em vez de HTTP)
    const gqlHost = GqlArgumentsHost.create(host);
    const info = gqlHost.getInfo();

    console.error(`[GraphQL Error] Campo: ${info?.fieldName}`, exception);

    // Se já é uma exceção de negócio, formata com o código semântico
    if (exception instanceof BusinessException) {
      const response = exception.getResponse() as { message: string; code: string };
      return new GraphQLError(response.message, {
        extensions: {
          code: response.code,
          statusCode: exception.getStatus(),
        },
      });
    }

    // Erros genéricos: não expõe detalhes internos ao cliente (segurança)
    if (exception instanceof Error) {
      return new GraphQLError('Erro interno do servidor.', {
        extensions: {
          code: 'INTERNAL_SERVER_ERROR',
          ...(process.env.NODE_ENV === 'development' && { details: exception.message }),
        },
      });
    }

    return new GraphQLError('Ocorreu um erro inesperado.');
  }
}
