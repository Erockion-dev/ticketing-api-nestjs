import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { UserRole } from '../../users/enum/user-role.enum.js';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { UserResponseDto } from '../../users/dto/user-response.dto.js';
import { CreateOperatorTicketDto } from '../dto/create-operator-ticket.dto.js';
import { PaginationDto } from '../../common/dto/pagination.dto.js';
import { AdminTicketsService } from './admin-tickets.service.js';
import { UpdateAdminTicketDto } from '../dto/update-admin-ticket.dto.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/tickets')
export class AdminTicketsController {
  constructor(private readonly adminTicketsService: AdminTicketsService) {}

  @Post()
  @HttpCode(201)
  create(
    @Body() createOperatorTicketDto: CreateOperatorTicketDto,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.adminTicketsService.create(createOperatorTicketDto, user);
  }

  @Get()
  @HttpCode(200)
  findAll(@Query() pagination: PaginationDto) {
    return this.adminTicketsService.findAll(pagination);
  }

  @Get(':id')
  @HttpCode(200)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.adminTicketsService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(200)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAdminTicketDto: UpdateAdminTicketDto,
  ) {
    return this.adminTicketsService.update(id, updateAdminTicketDto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.adminTicketsService.remove(id);
  }
}
