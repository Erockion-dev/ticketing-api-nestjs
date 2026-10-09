import { UserSummaryDto } from '../../users/dto/user-summary.dto.js';
import { TicketPriority } from '../enum/ticket-priority.enum.js';
import { TicketStatus } from '../enum/ticket-status.enum.js';
import { TicketcommentSummaryDto } from './ticket-comment-summary.dto.js';
import { TicketSummaryDto } from './ticket-summary.dto.js';

export class TicketResponseDto {
  id: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdBy: UserSummaryDto;
  requester: UserSummaryDto;
  assignedTo: UserSummaryDto | null;
  createdAt: Date;
  updatedAt: Date | null;
  parentTicket: TicketSummaryDto | null;
  relatedTickets: TicketSummaryDto[];
  ticketComments: TicketcommentSummaryDto[];
}
