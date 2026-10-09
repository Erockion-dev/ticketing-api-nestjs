import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service.js';
import { OperatorTicketsController } from './operator-tickets/operator-tickets.controller.js';
import { AdminTicketsController } from './admin-tickets/admin-tickets.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entities.js';
import { AuthModule } from '../auth/auth.module.js';
import { OperatorTicketsService } from './operator-tickets/operator-tickets.service.js';
import { UsersModule } from '../users/users.module.js';
import { AdminTicketsService } from './admin-tickets/admin-tickets.service.js';
import { UserTicketsController } from './user-tickets/user-tickets.controller.js';
import { UserTicketsService } from './user-tickets/user-tickets.service.js';
import { TicketCommentsController } from './ticket-comments/ticket-comments.controller.js';
import { TicketCommentsService } from './ticket-comments/ticket-comments.service.js';
import { TicketComment } from './entities/ticket-comment.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, TicketComment]), AuthModule, UsersModule],
  controllers: [
    UserTicketsController,
    OperatorTicketsController,
    AdminTicketsController,
    TicketCommentsController,
  ],
  providers: [
    TicketsService,
    UserTicketsService,
    OperatorTicketsService,
    AdminTicketsService,
    TicketCommentsService,
  ],
})
export class TicketsModule {}
