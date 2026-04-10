/**
 * Entidade ActivityLog — registra cada ação realizada por um funcionário.
 *
 * Exemplos de ações monitoradas (contexto nestjs-nextjs-graphql-study):
 * - WEBSITE_VISIT: acesso a um site
 * - APP_USAGE: uso de aplicativo
 * - FILE_ACCESS: acesso a arquivo
 * - SCREENSHOT: captura de tela automática
 * - IDLE: funcionário inativo
 * - LOGIN / LOGOUT: entrada e saída do sistema
 */
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@ObjectType('ActivityLog')
@Entity('activity_logs')
// Index no userId para otimizar consultas por usuário (muito frequentes em monitoramento)
@Index(['userId'])
export class ActivityLog {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => ID)
  @Column('uuid')
  userId: string;

  // Relação N:1 — muitos logs pertencem a um usuário
  @Field(() => User)
  @ManyToOne(() => User, (user) => user.activityLogs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Field()
  @Column({ length: 100 })
  action: string;

  @Field()
  @CreateDateColumn()
  timestamp: Date;

  // metadata: dados extras como URL visitada, nome do app, duração, etc.
  // GraphQLJSON é um scalar customizado que aceita qualquer objeto JSON
  @Field(() => GraphQLJSON, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
