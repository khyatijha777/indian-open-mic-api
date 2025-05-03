import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { compare, hash } from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    console.log('user: ', user);
    console.log('Input password:', loginDto.password);
    console.log('Stored password:', user.password);
    const isPasswordValid = await compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      ...user,
    };
  }

  // async signup(createUserDto: CreateUserDto) {
  //   const existingUser = await this.usersService.findByEmail(
  //     createUserDto.email,
  //   );
  //   if (existingUser) {
  //     throw new BadRequestException('Email already in use');
  //   }
  //   console.log('SIGN UP createUserDto.password: ', createUserDto.password);

  //   const hashedPassword = await hash(createUserDto.password, 10);
  //   const user = await this.usersService.create({
  //     ...createUserDto,
  //     password: hashedPassword,
  //   });

  //   const payload = { email: user.email, sub: user.id };
  //   return {
  //     access_token: this.jwtService.sign(payload),
  //     ...user,
  //   };
  // }
}
