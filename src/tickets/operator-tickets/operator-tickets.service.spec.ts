import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IsNull } from 'typeorm';
import { UserResponseDto } from '../../users/dto/user-response.dto.js';
import { UserRole } from '../../users/enum/user-role.enum.js';
import { User } from '../../users/entities/user.entity.js';
import { UsersService } from '../../users/users.service.js';
import { Ticket } from '../entities/ticket.entities.js';
import { TicketPriority } from '../enum/ticket-priority.enum.js';
import { TicketStatus } from '../enum/ticket-status.enum.js';
import { TicketsService } from '../tickets.service.js';
import { OperatorTicketsService } from './operator-tickets.service.js';

describe('OperatorTicketsService', () => {
  let service: OperatorTicketsService;
  let ticketRepository: {
    update: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    findOneBy: ReturnType<typeof vi.fn>;
  };
  let findEntityMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    ticketRepository = {
      update: vi.fn(),
      findOne: vi.fn(),
      findOneBy: vi.fn(),
    };
    findEntityMock = vi.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OperatorTicketsService,
        TicketsService,
        {
          provide: getRepositoryToken(Ticket),
          useValue: ticketRepository,
        },
        {
          provide: UsersService,
          useValue: { findEntity: findEntityMock },
        },
      ],
    }).compile();

    service = module.get<OperatorTicketsService>(OperatorTicketsService);
  });

  const user: UserResponseDto = {
    id: 7,
    name: 'Operator',
    email: 'operator@example.com',
    role: UserRole.OPERATOR,
    active: true,
  };
  const userEntity: User = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    active: user.active,
    password: 'hashed-password',
  };

  it('claims only an existing, undeleted, unassigned ticket in one update', async () => {
    const createdAt = new Date();
    findEntityMock.mockResolvedValue(userEntity);
    ticketRepository.update.mockResolvedValue({ affected: 1 });
    ticketRepository.findOne.mockResolvedValue({
      id: 12,
      title: 'Ticket',
      description: 'Description',
      status: TicketStatus.OPEN,
      priority: TicketPriority.NORMAL,
      createdBy: userEntity,
      requester: userEntity,
      assignedTo: userEntity,
      createdAt,
      updatedAt: createdAt,
      parentTicket: null,
      relatedTickets: [],
      ticketComments: [],
    });

    const result = await service.claim(12, user);

    expect(ticketRepository.update).toHaveBeenCalledWith(
      {
        id: 12,
        assignedTo: IsNull(),
        deletedAt: IsNull(),
      },
      { assignedTo: userEntity },
    );
    expect(result.assignedTo).toEqual({ id: user.id, name: user.name });
  });

  it('returns a conflict when another operator already claimed the ticket', async () => {
    findEntityMock.mockResolvedValue(userEntity);
    ticketRepository.update.mockResolvedValue({ affected: 0 });
    ticketRepository.findOneBy.mockResolvedValue({ id: 12 });

    await expect(service.claim(12, user)).rejects.toBeInstanceOf(ConflictException);
  });

  it('returns not found when the ticket does not exist', async () => {
    findEntityMock.mockResolvedValue(userEntity);
    ticketRepository.update.mockResolvedValue({ affected: 0 });
    ticketRepository.findOneBy.mockResolvedValue(null);

    await expect(service.claim(12, user)).rejects.toBeInstanceOf(NotFoundException);
  });
});
