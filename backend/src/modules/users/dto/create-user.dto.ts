/**
 * 📚 CONCEITO: DTOs com class-validator
 *
 * DTOs (Data Transfer Objects) definem a "forma" dos dados que entram na aplicação.
 * Combinados com class-validator e ValidationPipe, garantem que os dados
 * sejam válidos antes de chegar na lógica de negócio.
 *
 * No GraphQL code-first, usamos @InputType() em vez de @ObjectType().
 * A diferença: InputType é para dados de entrada (mutations), ObjectType para saída.
 */
import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsEnum, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { UserRole } from '../entities/user.entity';

@InputType('CreateUserInput')
export class CreateUserDto {
  @Field()
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MinLength(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
  @MaxLength(150, { message: 'Nome não pode ter mais de 150 caracteres' })
  name: string;

  @Field()
  @IsEmail({}, { message: 'E-mail inválido' })
  @IsNotEmpty({ message: 'E-mail é obrigatório' })
  email: string;

  @Field(() => UserRole, { defaultValue: UserRole.EMPLOYEE })
  @IsEnum(UserRole, { message: 'Role inválida. Valores aceitos: ADMIN, MANAGER, EMPLOYEE' })
  role: UserRole = UserRole.EMPLOYEE;
}
