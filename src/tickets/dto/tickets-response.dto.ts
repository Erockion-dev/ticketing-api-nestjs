import { PaginationMetaDto } from '../../common/dto/pagination-meta.dto.js';
import { TicketResponseDto } from './ticket-response.dto.js';

export class TicketsResponseDto {
  data: TicketResponseDto[];
  meta: PaginationMetaDto;
}
