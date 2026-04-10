/**
 * 📚 CONCEITO: Exceções de Domínio (Domain Exceptions)
 *
 * Em vez de lançar erros genéricos, criamos exceções específicas do domínio.
 * Isso permite tratar erros de negócio de forma diferente de erros técnicos
 * (ex: "usuário não encontrado" vs "falha de conexão com banco").
 *
 * No GraphQL, as exceções são formatadas pelo `formatError` no AppModule
 * e pelo filtro GraphQLExceptionFilter antes de chegarem ao cliente.
 */
import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessException extends HttpException {
  constructor(
    message: string,
    // Código semântico que o frontend pode usar para i18n ou lógica condicional
    public readonly code: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super({ message, code }, status);
  }
}

// Exceções específicas facilitam o tratamento no lado do cliente
export class UserNotFoundException extends BusinessException {
  constructor(id: string) {
    super(`Usuário com ID "${id}" não encontrado.`, 'USER_NOT_FOUND', HttpStatus.NOT_FOUND);
  }
}

export class EmailAlreadyExistsException extends BusinessException {
  constructor(email: string) {
    super(`O e-mail "${email}" já está em uso.`, 'EMAIL_ALREADY_EXISTS', HttpStatus.CONFLICT);
  }
}

export class ActivityLogNotFoundException extends BusinessException {
  constructor(id: string) {
    super(
      `Log de atividade com ID "${id}" não encontrado.`,
      'ACTIVITY_LOG_NOT_FOUND',
      HttpStatus.NOT_FOUND,
    );
  }
}
