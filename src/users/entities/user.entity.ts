import { IsString, IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @Column({ unique: true })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @Column()
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
