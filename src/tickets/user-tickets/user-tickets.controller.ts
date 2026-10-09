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
import { CreateTicketDto } from '.././dto/create-ticket.dto.js';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { UserResponseDto } from '../../users/dto/user-response.dto.js';
import { PaginationDto } from '../../common/dto/pagination.dto.js';
import { UpdateTicketDto } from '.././dto/update-ticket.dto.js';
import { UserTicketsService } from './user-tickets.service.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.USER)
@Controller('user/tickets')
export class UserTicketsController {
  constructor(private readonly userTicketsService: UserTicketsService) {}

  @Post()
  @HttpCode(201)
  create(@Body() createTicketDto: CreateTicketDto, @CurrentUser() user: UserResponseDto) {
    return this.userTicketsService.create(createTicketDto, user);
  }

  @Get()
  @HttpCode(200)
  findAll(@Query() pagination: PaginationDto, @CurrentUser() user: UserResponseDto) {
    return this.userTicketsService.findAll(pagination, user);
  }

  @Get(':id')
  @HttpCode(200)
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: UserResponseDto) {
    return this.userTicketsService.findOne(id, user);
  }

  @Patch(':id')
  @HttpCode(200)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateTicketDto,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.userTicketsService.update(id, updateUserDto, user);
  }
}
