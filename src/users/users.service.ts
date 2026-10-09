import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { User } from './entities/user.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersResponseDto } from './dto/users-response.dto.js';
import { UserResponseDto } from './dto/user-response.dto.js';
import { UserAuthDto } from './dto/user-auth.dto.js';
import bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    try {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      const user = this.userRepository.create({
        ...createUserDto,
        password: hashedPassword,
      });

      const savedUser = await this.userRepository.save(user);

      return {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
        active: user.active,
      };
    } catch (error) {
      throw new BadRequestException('Erreur lors de la création.');
    }
  }

  async findAll(page: number, limit: number): Promise<UsersResponseDto> {
    const [users, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });

    const data: UserResponseDto[] = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active,
    }));

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number): Promise<UserResponseDto> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(`User with id ${id} is not found.`);
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active,
    };
  }

  async findEntity(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User id ${id} not found.`);
    }

    Object.assign(user, updateUserDto);

    try {
      const userSaved = await this.userRepository.save(user);

      return {
        id: userSaved.id,
        name: userSaved.name,
        email: userSaved.email,
        role: userSaved.role,
        active: user.active,
      };
    } catch (error) {
      throw new BadRequestException('Error while modifying.');
    }
  }

  async remove(id: number): Promise<void> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found.`);
    }

    try {
      await this.userRepository.remove(user);
    } catch (error) {
      throw new BadRequestException('Error during deletion.');
    }
  }

  async findByEmailAuth(email: string): Promise<UserAuthDto | null> {
    const user = await this.userRepository.findOneBy({ email });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
      active: user.active,
    };
  }
}
