import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  caption!: string;

  @Column()
  mediaUrl!: string;

  @Column()
  youtubeUrl!: string;

  @Column({ default: false })
  isPublished!: boolean;

  @ManyToOne(() => User, (user) => user.posts, { nullable: true })
  user?: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
