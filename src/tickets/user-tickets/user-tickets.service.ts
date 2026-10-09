import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket } from '../entities/ticket.entities.js';
import { CreateTicketDto } from '../dto/create-ticket.dto.js';
import { UserResponseDto } from '../../users/dto/user-response.dto.js';
import { TicketResponseDto } from '../dto/ticket-response.dto.js';
import { TicketsMapper } from '../tickets.mapper.js';
import { PaginationDto } from '../../common/dto/pagination.dto.js';
import { TicketsResponseDto } from '../dto/tickets-response.dto.js';
import { UpdateTicketDto } from '../dto/update-ticket.dto.js';
import { TicketsService } from '../tickets.service.js';

@Injectable()
export class UserTicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    private readonly ticketService: TicketsService,
  ) {}

  async create(
    createTicketDto: CreateTicketDto,
    user: UserResponseDto,
  ): Promise<TicketResponseDto> {
    let parentTicket: Ticket | null = null;

    if (createTicketDto.parentTicketId) {
      parentTicket = await this.ticketService.getValidParentTicket(createTicketDto.parentTicketId);
    }

    const ticket = this.ticketRepository.create({
      title: createTicketDto.title,
      description: createTicketDto.description,
      createdBy: user,
      requester: user,
      parentTicket: parentTicket,
    });

    const savedTicket = await this.ticketRepository.save(ticket);

    const result = await this.ticketRepository.findOne({
      where: { id: savedTicket.id },
      relations: {
        createdBy: true,
        requester: true,
        assignedTo: true,
        parentTicket: true,
        relatedTickets: true,
        ticketComments: {
          createdBy: true,
        },
      },
    });

    if (!result) {
      throw new NotFoundException('Ticket could not be retrieved after creation.');
    }

    return TicketsMapper.toResponse(result);
  }

  async findAll(pagination: PaginationDto, user: UserResponseDto): Promise<TicketsResponseDto> {
    const [tickets, total] = await this.ticketRepository.findAndCount({
      where: [{ createdBy: { id: user.id } }, { requester: { id: user.id } }],
      relations: {
        createdBy: true,
        requester: true,
        assignedTo: true,
        parentTicket: true,
        relatedTickets: true,
        ticketComments: {
          createdBy: true,
        },
      },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
      order: {
        createdAt: 'DESC',
      },
    });

    const data = tickets.map((ticket) => TicketsMapper.toResponse(ticket));

    return {
      data: data,
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }

  async findOne(id: number, user: UserResponseDto): Promise<TicketResponseDto> {
    const ticket = await this.ticketRepository.findOne({
      where: [
        {
          id: id,
          createdBy: {
            id: user.id,
          },
        },
        {
          id: id,
          requester: {
            id: user.id,
          },
        },
      ],
      relations: {
        createdBy: true,
        requester: true,
        assignedTo: true,
        parentTicket: true,
        relatedTickets: true,
        ticketComments: {
          createdBy: true,
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with id ${id} is not found.`);
    }

    return TicketsMapper.toResponse(ticket);
  }

  async update(
    id: number,
    updateTicketDto: UpdateTicketDto,
    user: UserResponseDto,
  ): Promise<TicketResponseDto> {
    const ticket = await this.ticketRepository.findOne({
      where: [
        {
          id: id,
          createdBy: {
            id: user.id,
          },
        },
        {
          id: id,
          requester: {
            id: user.id,
          },
        },
      ],
      relations: {
        createdBy: true,
        requester: true,
        assignedTo: true,
        parentTicket: true,
        relatedTickets: true,
      },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with id ${id} is not found.`);
    }

    await this.ticketService.validateAndUpdateParentTicket(ticket, updateTicketDto.parentTicketId);

    Object.assign(ticket, {
      title: updateTicketDto.title,
      priority: updateTicketDto.priority,
    });

    const savedTicket = await this.ticketRepository.save(ticket);

    const result = await this.ticketRepository.findOne({
      where: { id: savedTicket.id },
      relations: {
        createdBy: true,
        requester: true,
        assignedTo: true,
        parentTicket: true,
        relatedTickets: true,
        ticketComments: {
          createdBy: true,
        },
      },
    });

    if (!result) {
      throw new NotFoundException('Ticket could not be retrieved after update.');
    }

    return TicketsMapper.toResponse(result);
  }
}
