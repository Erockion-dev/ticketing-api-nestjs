import { Module } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { UsersController } from './users.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';
import { PassportModule } from '@nestjs/passport';
import { AdminUsersController } from './admin-users.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([User]), PassportModule.register({})],
  exports: [UsersService],
  controllers: [UsersController, AdminUsersController],
  providers: [UsersService],
})
export class UsersModule {}
