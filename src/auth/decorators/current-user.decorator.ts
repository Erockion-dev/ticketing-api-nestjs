import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { UserResponseDto } from '../../users/dto/user-response.dto.js';

export const CurrentUser = createParamDecorator(
  (data: keyof UserResponseDto | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request & { user: UserResponseDto }>();
    return data ? request.user[data] : request.user;
  },
);
