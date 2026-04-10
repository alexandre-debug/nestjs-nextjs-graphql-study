import { InputType, Field, PartialType } from '@nestjs/graphql';
import { IsOptional, IsString, MinLength, MaxLength } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

// PartialType torna todos os campos opcionais, ideal para operações de update.
// Evita duplicação: reutilizamos as validações do CreateUserDto.
@InputType('UpdateUserInput')
export class UpdateUserDto extends PartialType(CreateUserDto) {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name?: string;
}
