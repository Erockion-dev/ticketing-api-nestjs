import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { UserRole } from './enum/user-role.enum.js';
import { UserResponseDto } from './dto/user-response.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

describe('UsersController', () => {
  let controller: UsersController;
  let findOneMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    findOneMock = vi.fn();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findOne: findOneMock,
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return the result from userService.findOne', async () => {
    const profile: UserResponseDto = {
      id: 1,
      name: 'user',
      email: 'user@email.com',
      role: UserRole.USER,
      active: true,
    };

    const result = controller.profile(profile);

    expect(result).toEqual(profile);
  });
});
