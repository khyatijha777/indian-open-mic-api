import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { IsEmail, IsString, IsNotEmpty, MinLength } from 'class-validator';
import { Post } from './post.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @Column()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @Column()
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;

  @OneToMany(() => Post, (post) => post.user)
  posts!: Post[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
