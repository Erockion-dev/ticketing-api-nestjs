import { IsInt, IsOptional, IsPositive, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateTicketDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  title: string;

  @IsString()
  @MinLength(2)
  @MaxLength(5000)
  description: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  parentTicketId?: number;
}
