import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards
  ,Req
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { Post as PostEntity } from '../entities/post.entity';
import { JwtAuthGuard } from 'src/jwt-auth.guard';
import { Request } from 'express';
import { User } from 'src/entities/user.entity';

@UseGuards(JwtAuthGuard)
@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async createPost(
    @UploadedFile() file: Express.Multer['File'],
    @Body() createPostDto: CreatePostDto,
    @Req() req: Request
  ) {
    const user = req.user as User;
    console.log("user: ", user);
    return this.postsService.createPost(file, createPostDto, user);
  }

  @Get()
  findAll(
    @Req() req: Request
  ) {
    const user = req.user as User;
    console.log("djeiofj");
    return this.postsService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: Partial<PostEntity>) {
    return this.postsService.update(id, updatePostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postsService.remove(id);
  }
}
