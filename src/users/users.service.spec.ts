import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service.js';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';
import { UserRole } from './enum/user-role.enum.js';
import { UsersResponseDto } from './dto/users-response.dto.js';
import { UserResponseDto } from './dto/user-response.dto.js';
import { PaginationMetaDto } from '../common/dto/pagination-meta.dto.js';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import bcrypt from 'bcrypt';

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn(),
  },
}));

describe('UsersService', () => {
  let service: UsersService;

  let findAndCountMock: ReturnType<typeof vi.fn>;
  let findOneByMock: ReturnType<typeof vi.fn>;
  let createMock: ReturnType<typeof vi.fn>;
  let saveMock: ReturnType<typeof vi.fn>;
  let removeMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    findAndCountMock = vi.fn();
    findOneByMock = vi.fn();
    createMock = vi.fn();
    createMock = vi.fn();
    saveMock = vi.fn();
    removeMock = vi.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findAndCount: findAndCountMock,
            findOneBy: findOneByMock,
            create: createMock,
            save: saveMock,
            remove: removeMock,
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  const user: User = {
    id: 1,
    name: 'user',
    email: 'user@email.com',
    password: '123_user',
    role: UserRole.USER,
    active: true,
  };
  const userResponseDto: UserResponseDto = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    active: true,
  };
  const createUserDto: CreateUserDto = {
    name: 'user',
    email: 'user@email.com',
    password: '123_user',
    role: UserRole.USER,
  };
  const newUser = {
    name: 'user',
    email: 'user@email.com',
    password: '123_user',
    role: UserRole.USER,
    active: true,
  };
  const savedUser: User = {
    id: 1,
    name: 'user',
    email: 'user@email.com',
    password: '123_user',
    role: UserRole.USER,
    active: true,
  };
  const hashedPassword = 'hashed-password';
  const updateUserDto: UpdateUserDto = {
    name: 'update_user',
    email: 'update_user@email.com',
    role: UserRole.USER,
    active: true,
  };
  const modifiedUser: User = {
    id: 1,
    name: 'update_user',
    email: 'update_user@email.com',
    password: '123_user',
    role: UserRole.USER,
    active: true,
  };
  const updatedUser: User = {
    id: 1,
    name: 'update_user',
    email: 'update_user@email.com',
    password: '123_user',
    role: UserRole.USER,
    active: true,
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ********************
  // findAll
  // ********************
  it('should call userRepository.findAndCount', async () => {
    findAndCountMock.mockResolvedValue([[], 0]);
    await service.findAll(2, 10);
    expect(findAndCountMock).toHaveBeenCalledWith({
      skip: (2 - 1) * 10,
      take: 10,
    });
  });

  it('should return users with pagination metadata', async () => {
    const paginationMetaDto: PaginationMetaDto = {
      page: 2,
      limit: 10,
      total: 11,
      totalPages: 2,
    };

    const response: UsersResponseDto = {
      data: [userResponseDto],
      meta: paginationMetaDto,
    };

    findAndCountMock.mockResolvedValue([[user], 11]);

    const result = await service.findAll(2, 10);

    expect(result).toEqual(response);
  });

  // ********************
  // findOne
  // ********************
  it('should call userRepository.findOne', async () => {
    findOneByMock.mockResolvedValue(user);

    await service.findOne(1);

    expect(findOneByMock).toHaveBeenCalledWith({ id: 1 });
  });

  it('should return the user', async () => {
    findOneByMock.mockResolvedValue(user);
    const result = await service.findOne(1);
    expect(result).toEqual({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active,
    });
  });

  it('should throw NotFoundExeption if user does not exist.', async () => {
    findOneByMock.mockResolvedValue(null);
    const promise = service.findOne(999);
    await expect(promise).rejects.toThrow(NotFoundException);
    await expect(promise).rejects.toThrow(`User with id 999 is not found.`);
  });

  // ********************
  // create
  // ********************
  it('should call userRepository.create and save', async () => {
    vi.mocked(bcrypt.hash).mockImplementation(async () => hashedPassword);
    createMock.mockReturnValue(newUser);
    saveMock.mockResolvedValue(savedUser);

    await service.create(createUserDto);

    expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
    expect(createMock).toHaveBeenCalledWith({
      ...createUserDto,
      password: hashedPassword,
    });
    expect(saveMock).toHaveBeenCalledWith(newUser);
  });

  it('should return the result from userService.create', async () => {
    createMock.mockReturnValue(newUser);
    saveMock.mockResolvedValue(savedUser);

    const result = await service.create(createUserDto);

    expect(result).toEqual(userResponseDto);
  });

  // ********************
  // update
  // ********************
  it('should call userRepository.findOneBy and save', async () => {
    findOneByMock.mockResolvedValue(user);
    saveMock.mockResolvedValue(modifiedUser);

    await service.update(1, updateUserDto);

    expect(findOneByMock).toHaveBeenCalledWith({ id: 1 });
    expect(saveMock).toHaveBeenCalledWith(modifiedUser);
  });

  it('should return the result from repository.save', async () => {
    findOneByMock.mockResolvedValue(user);
    saveMock.mockResolvedValue(updatedUser);

    const result = await service.update(1, updateUserDto);

    expect(result).toEqual({
      id: modifiedUser.id,
      name: modifiedUser.name,
      email: modifiedUser.email,
      role: modifiedUser.role,
      active: modifiedUser.active,
    });
  });

  it('should throw NotFoundException if user does not found.', async () => {
    findOneByMock.mockResolvedValue(null);
    const promise = service.update(999, updateUserDto);
    await expect(promise).rejects.toThrow(NotFoundException);
    await expect(promise).rejects.toThrow('User id 999 not found.');
  });

  it('should throw BadRequestException if user the save fails.', async () => {
    findOneByMock.mockResolvedValue(user);
    saveMock.mockRejectedValue(new Error('Error DB'));

    const promise = service.update(1, updateUserDto);
    await expect(promise).rejects.toThrow(BadRequestException);
    await expect(promise).rejects.toThrow('Error while modifying.');
  });

  // ********************
  // remove
  // ********************
  it('should call userRepository.findOneBy and remove', async () => {
    findOneByMock.mockResolvedValue(user);
    await service.remove(1);
    expect(findOneByMock).toHaveBeenCalledWith({ id: 1 });
    expect(removeMock).toHaveBeenCalledWith(user);
  });

  it('should return undefined.', async () => {
    findOneByMock.mockResolvedValue(user);
    removeMock.mockResolvedValue(user);
    const result = await service.remove(1);
    expect(result).toBeUndefined();
  });

  it('should throw NotFoundException if user does not found.', async () => {
    findOneByMock.mockResolvedValue(null);
    const promise = service.remove(999);
    await expect(promise).rejects.toThrow(NotFoundException);
    await expect(promise).rejects.toThrow('User with id 999 not found.');
  });

  it('should throw BadRequestException if user remove fails.', async () => {
    findOneByMock.mockResolvedValue(user);
    removeMock.mockRejectedValue(new Error('Error BDD'));

    const promise = service.remove(1);

    await expect(promise).rejects.toThrow(BadRequestException);
    await expect(promise).rejects.toThrow('Error during deletion.');
  });
});
