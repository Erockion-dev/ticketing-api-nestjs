import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto.js';
import { TicketAssignmentFilter } from '../enum/ticket-assignment-filter.enum.js';

export class OperatorTicketsQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(TicketAssignmentFilter)
  assignment?: TicketAssignmentFilter;
}
