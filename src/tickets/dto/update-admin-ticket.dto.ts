import {
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { TicketStatus } from '../enum/ticket-status.enum.js';
import { TicketPriority } from '../enum/ticket-priority.enum.js';

export class UpdateAdminTicketDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @MinLength(2)
  @MaxLength(5000)
  description: string;

  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @IsOptional()
  @IsInt()
  @IsPositive()
  requester?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  assignedToId?: number | null;

  @IsOptional()
  @IsInt()
  @IsPositive()
  parentTicketId?: number;
}
