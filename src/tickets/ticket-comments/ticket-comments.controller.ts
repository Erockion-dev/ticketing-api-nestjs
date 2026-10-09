import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { UserRole } from '../../users/enum/user-role.enum.js';
import { TicketCommentsService } from './ticket-comments.service.js';
import { CreateTicketCommentDto } from '../dto/create-ticket-comment.dto.js';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { UserResponseDto } from '../../users/dto/user-response.dto.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class TicketCommentsController {
  constructor(private readonly ticketCommentsService: TicketCommentsService) {}

  @Post('ticket-comment')
  @HttpCode(201)
  create(
    @Body() createTicketCommentDto: CreateTicketCommentDto,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.ticketCommentsService.create(createTicketCommentDto, user);
  }

  @Roles(UserRole.ADMIN)
  @Delete('admin/ticket-comment/:id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ticketCommentsService.remove(id);
  }
}
