import { TicketPriority } from '../enum/ticket-priority.enum.js';
import { TicketStatus } from '../enum/ticket-status.enum.js';

export class TicketSummaryDto {
  id: number;
  title: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: Date;
}
