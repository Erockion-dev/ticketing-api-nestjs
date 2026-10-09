import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';
import { AdminUsersController } from './admin-users.controller.js';
import { UsersService } from './users.service.js';
import { UserRole } from './enum/user-role.enum.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UserResponseDto } from './dto/user-response.dto.js';
import { UsersResponseDto } from './dto/users-response.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

describe('AdminUsersController', () => {
  let controller: AdminUsersController;
  let findAllMock: ReturnType<typeof vi.fn>;
  let findOneMock: ReturnType<typeof vi.fn>;
  let createMock: ReturnType<typeof vi.fn>;
  let updateMock: ReturnType<typeof vi.fn>;
  let removeMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    findAllMock = vi.fn();
    findOneMock = vi.fn();
    createMock = vi.fn();
    updateMock = vi.fn();
    removeMock = vi.fn();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminUsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAll: findAllMock,
            findOne: findOneMock,
            create: createMock,
            update: updateMock,
            remove: removeMock,
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AdminUsersController>(AdminUsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ********************
  // findAll
  // ********************
  it('should call usersService.findAll with pagination', () => {
    controller.findAll({
      page: 2,
      limit: 10,
    });
    expect(findAllMock).toHaveBeenCalledWith(2, 10);
  });

  it('should return the result from userService.findAll', async () => {
    const response: UsersResponseDto = {
      data: [],
      meta: {
        page: 1,
        limit: 1,
        total: 0,
        totalPages: 0,
      },
    };
    findAllMock.mockResolvedValue(response);

    const restsult = await controller.findAll({
      page: 1,
      limit: 10,
    });

    expect(restsult).toEqual(response);
  });

  // ********************
  // FindOne
  // ********************
  it('should call userService.findOne', () => {
    controller.findOne(1);
    expect(findOneMock).toHaveBeenLastCalledWith(1);
  });

  it('should return the result from userService.findOne', async () => {
    const response: UserResponseDto = {
      id: 1,
      name: 'user',
      email: 'user@email.com',
      role: UserRole.USER,
      active: true,
    };
    findOneMock.mockResolvedValue(response);

    const result = await controller.findOne(1);

    expect(result).toEqual(response);
  });

  // ********************
  // Create
  // ********************
  it('should call userService.create', () => {
    const createUserDto: CreateUserDto = {
      name: 'user',
      email: 'user@email.com',
      password: '123_user',
      role: UserRole.USER,
    };
    controller.create(createUserDto);
    expect(createMock).toHaveBeenCalledWith(createUserDto);
  });

  it('should return the result form serviceUser.create', async () => {
    const createUserDto: CreateUserDto = {
      name: 'user',
      email: 'user@email.com',
      password: '123_user',
      role: UserRole.USER,
    };
    const userResponseDto: UserResponseDto = {
      id: 1,
      name: 'user',
      email: 'user@email.com',
      role: UserRole.USER,
      active: true,
    };
    createMock.mockResolvedValue(userResponseDto);

    const result = await controller.create(createUserDto);

    expect(result).toEqual(userResponseDto);
  });

  // ********************
  // Update
  // ********************
  it('should call userService.update', () => {
    const updateUserDto: UpdateUserDto = {
      name: 'newName',
      email: 'new@email.com',
      role: UserRole.USER,
      active: true,
    };

    controller.update(1, updateUserDto);

    expect(updateMock).toHaveBeenCalledWith(1, updateUserDto);
  });

  it('should return the result from serviceUser.update', async () => {
    const updateUserDto: UpdateUserDto = {
      name: 'newName',
      email: 'new@email.com',
      role: UserRole.USER,
      active: true,
    };
    const userResponseDto: UserResponseDto = {
      id: 1,
      name: 'newName',
      email: 'new@email.com',
      role: UserRole.USER,
      active: true,
    };

    updateMock.mockResolvedValue(userResponseDto);

    const result = await controller.update(1, updateUserDto);

    expect(result).toEqual(userResponseDto);
  });

  // ********************
  // remove
  // ********************
  it('should call userService.remove', () => {
    controller.remove(1);
    expect(removeMock).toHaveBeenCalledWith(1);
  });

  it('should return the result from userService.remove', async () => {
    // for void
    removeMock.mockResolvedValue(undefined);
    const result = await controller.remove(1);
    expect(result).toBeUndefined();
  });
});
