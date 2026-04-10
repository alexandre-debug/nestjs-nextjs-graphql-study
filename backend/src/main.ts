/**
 * Ponto de entrada da aplicação NestJS
 *
 * Aqui configuramos o servidor HTTP e WebSocket para suportar
 * tanto as queries/mutations GraphQL (HTTP) quanto as subscriptions (WebSocket via graphql-ws).
 */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ValidationPipe global: valida automaticamente todos os DTOs
  // usando as anotações do class-validator antes de chegar nos handlers.
  // Isso evita repetição de validação em cada resolver/controller.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove campos não declarados no DTO
      forbidNonWhitelisted: true, // lança erro se campos extras forem enviados
      transform: true, // transforma os dados para os tipos declarados no DTO
    }),
  );

  // Habilita CORS para o frontend Next.js se conectar
  app.enableCors({
    origin: ['http://localhost:3000'],
    credentials: true,
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`🚀 Backend rodando em: http://localhost:${port}/graphql`);
  console.log(`📡 WebSocket (Subscriptions) em: ws://localhost:${port}/graphql`);
}

bootstrap();
