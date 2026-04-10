/**
 * 📚 CONCEITO: Interceptors no NestJS
 *
 * Interceptors executam código ANTES e DEPOIS do handler (resolver/controller).
 * Usam RxJS Observables para envolver a execução, permitindo:
 * - Logging de tempo de resposta
 * - Transformação da resposta
 * - Cache de respostas
 * - Tratamento de erros centralizado
 *
 * Ordem de execução: Middleware → Guards → Interceptors → Pipes → Handler
 *                    Handler → Interceptors (transformação) → Response
 */
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();

    // Extrai informações do contexto GraphQL para o log
    const gqlContext = GqlExecutionContext.create(context);
    const info = gqlContext.getInfo();
    const operationName = info?.fieldName || 'unknown';
    const operationType = info?.parentType?.name || 'unknown';

    this.logger.log(`[${operationType}] ${operationName} - Iniciando`);

    // next.handle() retorna um Observable que representa a execução do handler.
    // Usando pipe(), podemos adicionar operadores RxJS para transformar/monitorar.
    return next.handle().pipe(
      // tap: executa um efeito colateral sem alterar o valor do Observable
      tap(() => {
        const duration = Date.now() - now;
        this.logger.log(`[${operationType}] ${operationName} - Concluído em ${duration}ms`);
      }),
      // catchError: captura erros e pode transformá-los ou repassá-los
      catchError((error) => {
        const duration = Date.now() - now;
        this.logger.error(
          `[${operationType}] ${operationName} - Falhou em ${duration}ms: ${error.message}`,
        );
        // throwError recria o Observable de erro para que o filtro de exceção o trate
        return throwError(() => error);
      }),
    );
  }
}
