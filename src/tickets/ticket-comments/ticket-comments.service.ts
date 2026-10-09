import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TicketComment } from '../entities/ticket-comment.entity.js';
import { CreateTicketCommentDto } from '../dto/create-ticket-comment.dto.js';
import { UserResponseDto } from '../../users/dto/user-response.dto.js';
import { Ticket } from '../entities/ticket.entities.js';
import { UserRole } from '../../users/enum/user-role.enum.js';
import { TicketcommentSummaryDto } from '../dto/ticket-comment-summary.dto.js';

@Injectable()
export class TicketCommentsService {
  constructor(
    @InjectRepository(TicketComment)
    private readonly ticketCommentRepository: Repository<TicketComment>,

    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
  ) {}

  async create(
    createTicketCommentDto: CreateTicketCommentDto,
    user: UserResponseDto,
  ): Promise<TicketcommentSummaryDto> {
    const ticket = await this.ticketRepository.findOne({
      where: {
        id: createTicketCommentDto.ticketId,
      },
      relations: {
        createdBy: true,
        requester: true,
        assignedTo: true,
      },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with id ${createTicketCommentDto.ticketId} not exist.`);
    }

    if (!this.validateCreateTicketComment(user, ticket)) {
      throw new BadRequestException(`You are not authorized to post a comment.`);
    }
    const ticketComment = this.ticketCommentRepository.create({
      content: createTicketCommentDto.content,
      ticket: ticket,
      createdBy: user,
    });

    const savedTicketComment = await this.ticketCommentRepository.save(ticketComment);

    return {
      id: savedTicketComment.id,
      content: savedTicketComment.content,
      createdBy: {
        id: savedTicketComment.createdBy.id,
        name: savedTicketComment.createdBy.name,
      },
      createdAt: savedTicketComment.createdAt,
    };
  }

  async remove(id: number) {
    const ticketComment = await this.ticketCommentRepository.findOneBy({ id });

    if (!ticketComment) {
      throw new NotFoundException(`Ticket-comment with id ${id} not found.`);
    }

    try {
      await this.ticketCommentRepository.softRemove(ticketComment);
    } catch {
      throw new BadRequestException('Error during deletion.');
    }
  }

  private validateCreateTicketComment(user: UserResponseDto, ticket: Ticket): boolean {
    if (
      user.role === UserRole.ADMIN ||
      user.id === ticket.createdBy.id ||
      user.id === ticket.requester.id ||
      user.id === ticket.assignedTo?.id
    ) {
      return true;
    }
    return false;
  }
}
