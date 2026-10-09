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
import { OperatorTicketsService } from './operator-tickets.service.js';
import { UpdateOperatorTicketDto } from '../dto/update-operator-ticket.dto.js';
import { OperatorTicketsQueryDto } from '../dto/operator-tickets-query.dto.js';
import { CreateAdminTicketDto } from '../dto/create-admin-ticket.dto.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OPERATOR)
@Controller('operator/tickets')
export class OperatorTicketsController {
  constructor(private readonly operatorTicketsService: OperatorTicketsService) {}

  @Post()
  @HttpCode(201)
  create(@Body() createAdminTicketDto: CreateAdminTicketDto, @CurrentUser() user: UserResponseDto) {
    return this.operatorTicketsService.create(createAdminTicketDto, user);
  }

  @Get()
  @HttpCode(200)
  findAll(
    @Query() operatorTicketsQueryDto: OperatorTicketsQueryDto,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.operatorTicketsService.findAll(operatorTicketsQueryDto, user);
  }

  @Get(':id')
  @HttpCode(200)
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: UserResponseDto) {
    return this.operatorTicketsService.findOne(id, user);
  }

  @Patch(':id')
  @HttpCode(200)
  update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserResponseDto,
    @Body() updateOperatorTicketDto: UpdateOperatorTicketDto,
  ) {
    return this.operatorTicketsService.update(id, user, updateOperatorTicketDto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: UserResponseDto) {
    return this.operatorTicketsService.remove(id, user);
  }

  @Post(':id/claim')
  @HttpCode(200)
  claim(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: UserResponseDto) {
    return this.operatorTicketsService.claim(id, user);
  }
}
