import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Ticket } from './../entities/ticket.entities.js';
import { IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserResponseDto } from '../../users/dto/user-response.dto.js';
import { TicketsMapper } from './../tickets.mapper.js';
import { TicketsResponseDto } from './../dto/tickets-response.dto.js';
import { TicketsService } from '../tickets.service.js';
import { TicketResponseDto } from '../dto/ticket-response.dto.js';
import { CreateOperatorTicketDto } from '../dto/create-operator-ticket.dto.js';
import { UpdateOperatorTicketDto } from '../dto/update-operator-ticket.dto.js';
import { OperatorTicketsQueryDto } from '../dto/operator-tickets-query.dto.js';
import { TicketAssignmentFilter } from '../enum/ticket-assignment-filter.enum.js';
import { UsersService } from '../../users/users.service.js';

@Injectable()
export class OperatorTicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    private readonly ticketService: TicketsService,
    private readonly userService: UsersService,
  ) {}

  async findAll(
    operatorTicketsQueryDto: OperatorTicketsQueryDto,
    user: UserResponseDto,
  ): Promise<TicketsResponseDto> {
    let where;

    switch (operatorTicketsQueryDto.assignment) {
      case TicketAssignmentFilter.MINE:
        where = { assignedTo: { id: user.id } };
        break;

      case TicketAssignmentFilter.UNASSIGNED:
        where = { assignedTo: IsNull() };
        break;

      default:
        where = [{ assignedTo: { id: user.id } }, { assignedTo: IsNull() }];
    }

    const [tickets, total] = await this.ticketRepository.findAndCount({
      where,
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
      skip: (operatorTicketsQueryDto.page - 1) * operatorTicketsQueryDto.limit,
      take: operatorTicketsQueryDto.limit,
      order: {
        createdAt: 'DESC',
      },
    });

    const data = tickets.map((ticket) => TicketsMapper.toResponse(ticket));

    return {
      data: data,
      meta: {
        page: operatorTicketsQueryDto.page,
        limit: operatorTicketsQueryDto.limit,
        total,
        totalPages: Math.ceil(total / operatorTicketsQueryDto.limit),
      },
    };
  }

  async findOne(id: number, user: UserResponseDto): Promise<TicketResponseDto> {
    const ticket = await this.ticketRepository.findOne({
      where: [
        { id, assignedTo: user },
        { id, assignedTo: IsNull() },
      ],
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
    createOperatorTicketDto: CreateOperatorTicketDto,
    user: UserResponseDto,
  ): Promise<TicketResponseDto> {
    let parentTicket: Ticket | null = null;

    if (createOperatorTicketDto.parentTicketId) {
      parentTicket = await this.ticketService.getValidParentTicket(
        createOperatorTicketDto.parentTicketId,
      );
    }

    const requester = await this.ticketService.validateRequester(createOperatorTicketDto.requester);

    const ticket = this.ticketRepository.create({
      title: createOperatorTicketDto.title,
      description: createOperatorTicketDto.description,
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

  async update(
    id: number,
    user: UserResponseDto,
    updateOperatorTicketDto: UpdateOperatorTicketDto,
  ): Promise<TicketResponseDto> {
    const ticket = await this.ticketRepository.findOne({
      where: [
        { id, assignedTo: user },
        { id, assignedTo: IsNull() },
      ],
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
      updateOperatorTicketDto.parentTicketId,
    );

    Object.assign(ticket, {
      title: updateOperatorTicketDto.title,
      status: updateOperatorTicketDto.status,
      priority: updateOperatorTicketDto.priority,
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

  async remove(id: number, user: UserResponseDto) {
    const ticket = await this.ticketRepository.findOne({
      where: {
        id: id,
        assignedTo: {
          id: user.id,
        },
      },
      relations: {
        createdBy: true,
        requester: true,
        assignedTo: true,
        parentTicket: true,
        relatedTickets: true,
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

  async claim(id: number, user: UserResponseDto) {
    const userEntity = await this.userService.findEntity(user.id);
    if (!userEntity) {
      throw new BadRequestException(`User not found.`);
    }

    const updateResult = await this.ticketRepository.update(
      {
        id,
        assignedTo: IsNull(),
        deletedAt: IsNull(),
      },
      {
        assignedTo: userEntity,
      },
    );

    if (updateResult.affected !== 1) {
      const ticket = await this.ticketRepository.findOneBy({ id });
      if (!ticket) {
        throw new NotFoundException(`ticket with id ${id} not found.`);
      }

      throw new ConflictException(`Ticket with id ${id} has already been claimed.`);
    }

    const result = await this.ticketRepository.findOne({
      where: { id },
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
