/**
 * Módulo raiz da aplicação NestJS.
 *
 * O AppModule agrega todos os outros módulos e configura os providers globais:
 * - TypeORM (conexão com PostgreSQL)
 * - GraphQL (schema code-first)
 * - EventEmitter (eventos assíncronos)
 * - CQRS (módulo compartilhado entre features)
 */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { join } from 'path';
import { PubSub } from 'graphql-subscriptions';

import { UsersModule } from './modules/users/users.module';
import { ActivityLogsModule } from './modules/activity-logs/activity-logs.module';
import { User } from './modules/users/entities/user.entity';
import { ActivityLog } from './modules/activity-logs/entities/activity-log.entity';
import { GraphQLExceptionFilter } from './common/filters/graphql-exception.filter';
import { APP_FILTER } from '@nestjs/core';

// Token de injeção para o PubSub (usado nas subscriptions GraphQL).
// Exportamos aqui para ser importado em outros módulos.
export const PUB_SUB = 'PUB_SUB';

@Module({
  imports: [
    // ConfigModule: carrega variáveis de ambiente do arquivo .env
    ConfigModule.forRoot({
      isGlobal: true, // disponível em todo o app sem precisar importar em cada módulo
      envFilePath: '.env',
    }),

    // TypeORM: configura a conexão com PostgreSQL de forma assíncrona
    // usando as variáveis de ambiente carregadas pelo ConfigModule
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'nestjs-nextjs-graphql-study'),
        password: configService.get('DB_PASSWORD', 'nestjs-nextjs-graphql-study123'),
        database: configService.get('DB_DATABASE', 'nestjs-nextjs-graphql-study_study'),
        entities: [User, ActivityLog],
        // synchronize: true apenas em desenvolvimento!
        // Em produção, use migrations para controlar o schema do banco.
        synchronize: true,
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),

    // GraphQLModule: configura o servidor Apollo com abordagem code-first.
    // Code-first = você escreve as classes TypeScript e o schema GraphQL
    // é gerado automaticamente. Alternativa: schema-first (escreve o SDL primeiro).
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      // Habilita subscriptions via WebSocket usando o protocolo graphql-ws
      subscriptions: {
        'graphql-ws': true,
      },
      // Formata os erros antes de enviá-los ao cliente
      formatError: (error) => {
        const originalError = error.extensions?.originalError as any;
        return {
          message: originalError?.message || error.message,
          code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
          path: error.path,
        };
      },
      // Contexto disponível em todos os resolvers
      context: ({ req, res, connectionParams }) => ({
        req,
        res,
        connectionParams,
      }),
    }),

    // EventEmitter: permite comunicação assíncrona entre módulos
    // sem acoplamento direto, simulando mensageria (Kafka, RabbitMQ)
    EventEmitterModule.forRoot({
      wildcard: true, // permite eventos como 'activity.*'
      maxListeners: 20,
    }),

    UsersModule,
    ActivityLogsModule,
  ],
  providers: [
    // PubSub: mecanismo de publish/subscribe para as Subscriptions GraphQL.
    // Em produção, substituiria por Redis PubSub para suportar múltiplas instâncias.
    {
      provide: PUB_SUB,
      useValue: new PubSub(),
    },
    // Filtro global para formatar exceções GraphQL uniformemente
    {
      provide: APP_FILTER,
      useClass: GraphQLExceptionFilter,
    },
  ],
  exports: [PUB_SUB],
})
export class AppModule {}
