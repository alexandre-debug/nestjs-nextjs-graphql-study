import { InputType, Field, ID } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

@InputType('CreateActivityLogInput')
export class CreateActivityLogDto {
  @Field(() => ID)
  @IsUUID('4', { message: 'userId deve ser um UUID válido' })
  @IsNotEmpty()
  userId: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Ação é obrigatória' })
  @MaxLength(100, { message: 'Ação não pode ter mais de 100 caracteres' })
  action: string;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: Record<string, any>;
}
