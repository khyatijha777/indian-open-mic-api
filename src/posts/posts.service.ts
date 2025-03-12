import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { UsersService } from '../users/users.service';
import { Post } from './entities/post.entity';

@Injectable()
export class PostsService {
  private readonly posts:Post[] = [];

  constructor(private readonly usersService: UsersService) {}

  create(createPostDto: CreatePostDto) {
    const user = this.usersService.findOne(createPostDto.userId);
    if (!user) return null;

    const post = {
      id: this.posts.length + 1,
      content: createPostDto.content,
      author: user,
      likes: 0,
      createdAt: new Date(),
    };
    
    this.posts.push(post);
    user.posts.push(post);
    return post;
  }

  findAll() {
    return this.posts;
  }

  findOne(id: number) {
    return this.posts.find(post => post.id === id);
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    const post = this.findOne(id);
    if (!post) return null;
    Object.assign(post, updatePostDto);
    return post;
  }

  remove(id: number) {
    const index = this.posts.findIndex(post => post.id === id);
    if (index === -1) return null;
    return this.posts.splice(index, 1)[0];
  }
} 