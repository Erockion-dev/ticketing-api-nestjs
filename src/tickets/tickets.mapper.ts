import { TicketResponseDto } from './dto/ticket-response.dto.js';
import { TicketSummaryDto } from './dto/ticket-summary.dto.js';
import { Ticket } from './entities/ticket.entities.js';

export class TicketsMapper {
  static toResponse(ticket: Ticket): TicketResponseDto {
    return {
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      createdBy: {
        id: ticket.createdBy.id,
        name: ticket.createdBy.name,
      },
      requester: {
        id: ticket.requester.id,
        name: ticket.requester.name,
      },
      assignedTo: ticket.assignedTo
        ? {
            id: ticket.assignedTo.id,
            name: ticket.assignedTo.name,
          }
        : null,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      parentTicket: ticket.parentTicket ? this.toSummary(ticket.parentTicket) : null,
      relatedTickets: ticket.relatedTickets?.map((ticket) => this.toSummary(ticket)) ?? [],
      ticketComments:
        ticket.ticketComments?.map((ticketComment) => ({
          id: ticketComment.id,
          content: ticketComment.content,
          createdBy: {
            id: ticketComment.createdBy.id,
            name: ticketComment.createdBy.name,
          },
          createdAt: ticketComment.createdAt,
        })) ?? [],
    };
  }

  static toSummary(ticket: Ticket): TicketSummaryDto {
    return {
      id: ticket.id,
      title: ticket.title,
      status: ticket.status,
      priority: ticket.priority,
      createdAt: ticket.createdAt,
    };
  }
}
