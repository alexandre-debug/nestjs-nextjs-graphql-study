import { InputType, Field, ID } from '@nestjs/graphql';
import { IsOptional, IsUUID, IsString, IsDateString } from 'class-validator';

@InputType('ActivityLogFiltersInput')
export class ActivityLogFiltersDto {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  action?: string;

  // Filtro por intervalo de data (ISO 8601)
  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
