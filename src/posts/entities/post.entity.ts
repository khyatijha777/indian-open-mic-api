import { User } from '../../users/entities/user.entity';

export class Post {
  id!: number;
  content!: string;
  author!: User;
  likes!: number;
  fileUrl!: string;
  createdAt!: Date;
}
