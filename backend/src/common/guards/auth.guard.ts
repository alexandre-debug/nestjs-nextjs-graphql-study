/**
 * 📚 CONCEITO: Guards no NestJS
 *
 * Guards são responsáveis por AUTORIZAÇÃO: determinam se uma requisição
 * pode prosseguir ou deve ser bloqueada. São executados ANTES dos interceptors
 * e handlers.
 *
 * Diferença de Middleware: Middleware é executado antes dos Guards e não
 * tem acesso ao contexto de execução do NestJS (tipo de handler, decorators, etc).
 *
 * Uso típico: verificar JWT, roles de usuário, rate limiting por usuário.
 *
 * NOTA: Neste projeto de estudo, o guard é simplificado para demonstrar
 * o padrão. Em produção, validaria um JWT real.
 */
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';

// Decorator customizado para marcar rotas como públicas
export const IS_PUBLIC_KEY = 'isPublic';
import { SetMetadata } from '@nestjs/common';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// Decorator para definir roles necessárias
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Verifica se a rota foi marcada como pública com @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    // Para GraphQL, o contexto é diferente do HTTP.
    // GqlExecutionContext converte o ExecutionContext para acessar
    // os argumentos GraphQL (args, context, info)
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();

    // Em produção: validaria req.headers.authorization (Bearer JWT)
    // Aqui, simulamos que qualquer requisição com o header 'x-user-id' é autenticada
    const userId = req?.headers?.['x-user-id'];

    if (!userId) {
      // Descomentando o throw abaixo, a autenticação seria obrigatória
      // throw new UnauthorizedException('Autenticação necessária.');
      console.warn('[AuthGuard] Requisição sem autenticação - permitida em modo de desenvolvimento');
      return true; // Permite em dev para não bloquear os testes
    }

    // Verifica as roles necessárias (se definidas com @Roles())
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) return true;

    // Em produção, extrairia o role do JWT decodificado
    const userRole = req?.headers?.['x-user-role'] || 'EMPLOYEE';
    return requiredRoles.includes(userRole);
  }
}
