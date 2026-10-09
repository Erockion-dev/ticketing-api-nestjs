import { IsInt, IsPositive, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateTicketCommentDto {
  @IsString()
  @MinLength(2)
  @MaxLength(5000)
  content: string;

  @IsInt()
  @IsPositive()
  ticketId: number;
}
