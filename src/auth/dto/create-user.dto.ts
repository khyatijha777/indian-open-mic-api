import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  // Optional: add name field if needed
  @IsNotEmpty()
  name: string;
}
