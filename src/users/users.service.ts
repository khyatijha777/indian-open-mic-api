import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
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

  async create(createUserDto: CreateUserDto): Promise<Partial<User>> {
    try {
      // Check if user already exists
      const existingUser = await this.usersRepository.findOne({
        where: { email: createUserDto.email },
      });
      console.log('🚀 ~ UsersService ~ create ~ existingUser:', existingUser);

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      const hashedPassword: string = await hash(createUserDto.password, 10);
      const user = this.usersRepository.create({
        ...createUserDto,
        password: hashedPassword,
      });
      const savedUser  = await this.usersRepository.save(user);
      const {password, ...restUser} = savedUser;
      return restUser;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      // Check for unique constraint violation
      if (
        error instanceof Error &&
        error.message.includes('duplicate key value violates unique constraint')
      ) {
        throw new ConflictException('User with this email already exists');
      }
      if (error instanceof Error) {
        throw new Error(`Failed to create user: ${error.message}`);
      }
      throw new Error('Failed to create user: Unknown error');
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.usersRepository.findOne({ where: { email } });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to find user by email: ${error.message}`);
      }
      throw new Error('Failed to find user by email: Unknown error');
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      const user = await this.usersRepository.findOne({ where: { id } });
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return user;
    } catch (error) {
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
