import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Ticket } from './entities/ticket.entities.js';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service.js';
import { UserRole } from '../users/enum/user-role.enum.js';
import { User } from '../users/entities/user.entity.js';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    private readonly usersService: UsersService,
  ) {}

  public async getValidParentTicket(parentTicketId: number): Promise<Ticket> {
    const parentTicket = await this.ticketRepository.findOne({
      where: { id: parentTicketId },
      relations: {
        parentTicket: true,
      },
    });

    if (!parentTicket) {
      throw new NotFoundException('Parent ticket not found.');
    }

    if (parentTicket.parentTicket) {
      throw new BadRequestException('A child ticket cannot be used as a parent.');
    }

    if (parentTicket.deletedAt !== null) {
      throw new BadRequestException('A deleted ticket cannot be used as a parent.');
    }

    return parentTicket;
  }

  public async validateAndUpdateParentTicket(
    ticket: Ticket,
    parentTicketId: number | null | undefined,
  ) {
    if (ticket.id === parentTicketId) {
      throw new BadRequestException('A ticket cannot be its own parent.');
    }

    // Cannot become a child if it has children
    if (
      parentTicketId !== undefined &&
      parentTicketId !== null &&
      ticket.relatedTickets.length > 0
    ) {
      throw new BadRequestException('A ticket with child tickets cannot become a child ticket.');
    }

    // Set or remove parent ticket
    if (parentTicketId === null) {
      ticket.parentTicket = null;
    } else if (parentTicketId) {
      ticket.parentTicket = await this.getValidParentTicket(parentTicketId);
    }
  }

  public async validateRequester(id: number): Promise<User> {
    const requester = await this.usersService.findEntity(id);
    if (!requester || requester.active === false) {
      throw new BadRequestException(`Requester with id ${id} not exist.`);
    }

    return requester;
  }

  public async validateAndUpdateAssignedTo(ticket: Ticket, assignedTo: number | undefined | null) {
    if (assignedTo !== undefined) {
      if (assignedTo === null) {
        ticket.assignedTo = null;
      } else {
        const userAssignedTo = await this.usersService.findEntity(assignedTo);
        if (
          !userAssignedTo ||
          userAssignedTo.active === false ||
          userAssignedTo.role !== UserRole.OPERATOR
        ) {
          throw new BadRequestException(`You cannot perform an assignment for this user.`);
        }

        ticket.assignedTo = userAssignedTo;
      }
    }
  }
}
