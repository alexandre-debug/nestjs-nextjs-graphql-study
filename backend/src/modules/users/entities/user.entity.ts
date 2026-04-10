/**
 * Entidade User — mapeada para a tabela "users" no PostgreSQL via TypeORM.
 *
 * Também é o tipo GraphQL (ObjectType) graças à abordagem code-first:
 * uma única classe serve tanto como entidade do banco quanto como tipo GraphQL.
 *
 * ATENÇÃO EM ENTREVISTAS: Saiba explicar a diferença entre as abordagens
 * code-first e schema-first no GraphQL e os trade-offs de cada uma.
 */
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { ActivityLog } from '../../activity-logs/entities/activity-log.entity';

// Enum de roles disponíveis para funcionários monitorados
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE',
}

// Registra o enum no schema GraphQL para que ele apareça como tipo escalar
registerEnumType(UserRole, {
  name: 'UserRole',
  description: 'Nível de acesso do usuário no sistema de monitoramento',
});

@ObjectType('User') // Nome do tipo no schema GraphQL
@Entity('users') // Nome da tabela no PostgreSQL
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ length: 150 })
  name: string;

  @Field()
  @Column({ unique: true, length: 255 })
  email: string;

  @Field(() => UserRole)
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.EMPLOYEE,
  })
  role: UserRole;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  // Relação 1:N com ActivityLog — um usuário tem muitos logs de atividade.
  // { nullable: true } no Field porque nem sempre carregamos os logs junto com o usuário.
  @Field(() => [ActivityLog], { nullable: true })
  @OneToMany(() => ActivityLog, (log) => log.user, { eager: false })
  activityLogs?: ActivityLog[];
}
