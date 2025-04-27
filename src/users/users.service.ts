import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { hash } from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const hashedPassword: string = await hash(createUserDto.password, 10);
      const user = this.usersRepository.create({
        ...createUserDto,
        password: hashedPassword,
      });
      return await this.usersRepository.save(user);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to create user: ${error.message}`);
      }
      throw new Error('Failed to create user: Unknown error');
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.usersRepository.findOne({ where: { email } });
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to find user by email: ${error.message}`);
      }
      throw new Error('Failed to find user by email: Unknown error');
    }
  }

  async findById(id: number): Promise<User | null> {
    try {
      const user = await this.usersRepository.findOne({ where: { id } });
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return user;
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof Error) {
        throw new Error(`Failed to find user by ID: ${error.message}`);
      }
      throw new Error('Failed to find user by ID: Unknown error');
    }
  }
}
