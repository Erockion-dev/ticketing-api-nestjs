import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Ticket } from './../entities/ticket.entities.js';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserResponseDto } from '../../users/dto/user-response.dto.js';
import { TicketsMapper } from './../tickets.mapper.js';
import { TicketsResponseDto } from './../dto/tickets-response.dto.js';
import { TicketsService } from '../tickets.service.js';
import { TicketResponseDto } from '../dto/ticket-response.dto.js';
import { PaginationDto } from '../../common/dto/pagination.dto.js';
import { UpdateAdminTicketDto } from '../dto/update-admin-ticket.dto.js';
import { CreateAdminTicketDto } from '../dto/create-admin-ticket.dto.js';

@Injectable()
export class AdminTicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    private readonly ticketService: TicketsService,
  ) {}

  async findAll(pagination: PaginationDto): Promise<TicketsResponseDto> {
    const [tickets, total] = await this.ticketRepository.findAndCount({
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

  async findOne(id: number): Promise<TicketResponseDto> {
    const ticket = await this.ticketRepository.findOne({
      where: {
        id,
      },
      withDeleted: true,
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

  async create(
    createAdminTicketDto: CreateAdminTicketDto,
    user: UserResponseDto,
  ): Promise<TicketResponseDto> {
    let parentTicket: Ticket | null = null;

    if (createAdminTicketDto.parentTicketId) {
      parentTicket = await this.ticketService.getValidParentTicket(
        createAdminTicketDto.parentTicketId,
      );
    }

    const requester = await this.ticketService.validateRequester(createAdminTicketDto.requester);

    const ticket = this.ticketRepository.create({
      title: createAdminTicketDto.title,
      description: createAdminTicketDto.description,
      createdBy: user,
      requester: requester,
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

  async update(id: number, updateAdminTicketDto: UpdateAdminTicketDto): Promise<TicketResponseDto> {
    const ticket = await this.ticketRepository.findOne({
      where: {
        id,
      },
      withDeleted: true,
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

    await this.ticketService.validateAndUpdateParentTicket(
      ticket,
      updateAdminTicketDto.parentTicketId,
    );

    if (updateAdminTicketDto.requester !== undefined) {
      ticket.requester = await this.ticketService.validateRequester(updateAdminTicketDto.requester);
    }

    await this.ticketService.validateAndUpdateAssignedTo(ticket, updateAdminTicketDto.assignedToId);

    Object.assign(ticket, {
      title: updateAdminTicketDto.title,
      description: updateAdminTicketDto.description,
      status: updateAdminTicketDto.status,
      priority: updateAdminTicketDto.priority,
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

  async remove(id: number) {
    const ticket = await this.ticketRepository.findOne({
      where: {
        id: id,
      },
    });

    if (!ticket) {
      throw new NotFoundException(`ticket with id ${id} not found.`);
    }

    try {
      await this.ticketRepository.softRemove(ticket);
    } catch (error) {
      throw new BadRequestException('Error during deletion.');
    }
  }
}
