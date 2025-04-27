import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../entities/post.entity';
import { User } from '../entities/user.entity';
import { CreatePostDto } from './dto/create-post.dto';
import * as AWS from 'aws-sdk';
import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

interface UploadedFile {
  originalname: string;
  buffer: Buffer;
  mimetype: string;
}

@Injectable()
export class PostsService {
  private s3: AWS.S3;
  private youtube: any;

  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });

    const auth = new GoogleAuth({
      credentials: {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
        type: 'authorized_user',
      },
      scopes: [
        'https://www.googleapis.com/auth/youtube.upload',
        'https://www.googleapis.com/auth/youtube.readonly',
      ],
    });

    this.youtube = google.youtube({ version: 'v3', auth });
  }

  async createPost(
    file: UploadedFile,
    createPostDto: CreatePostDto,
    user: User,
  ): Promise<Post> {
    if (!file) {
      throw new Error('No file provided');
    }

    // Upload to S3
    const s3Key = `posts/${user.id}/${Date.now()}-${file.originalname}`;
    await this.s3
      .putObject({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: s3Key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
      .promise();

    const s3Url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

    // Download file from S3 to local temp directory
    const tempFilePath = path.join(os.tmpdir(), file.originalname);
    const fileStream = fs.createWriteStream(tempFilePath);
    const s3Stream = this.s3
      .getObject({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: s3Key,
      })
      .createReadStream();

    await new Promise<void>((resolve, reject) => {
      s3Stream.pipe(fileStream);
      s3Stream.on('error', reject);
      fileStream.on('finish', resolve);
    });

    // Upload to YouTube
    const fileSize = fs.statSync(tempFilePath).size;
    const youtubeResponse = await this.youtube.videos.insert(
      {
        part: 'id,snippet,status',
        notifySubscribers: false,
        requestBody: {
          snippet: {
            title: createPostDto.caption,
            description: createPostDto.caption,
          },
          status: {
            privacyStatus: 'public',
          },
        },
        media: {
          body: fs.createReadStream(tempFilePath),
        },
      },
      {
        onUploadProgress: (evt: { bytesRead: number }) => {
          const progress = (evt.bytesRead / fileSize) * 100;
          console.log(`${Math.round(progress)}% complete`);
        },
      },
    );

    // Clean up temp file
    fs.unlinkSync(tempFilePath);

    if (!youtubeResponse.data.id) {
      throw new Error('Failed to upload video to YouTube');
    }

    // Create post in database
    const post = this.postsRepository.create({
      caption: createPostDto.caption,
      mediaUrl: s3Url,
      youtubeUrl: `https://www.youtube.com/watch?v=${youtubeResponse.data.id}`,
      user,
      isPublished: true,
    });

    return this.postsRepository.save(post);
  }

  async findAll(): Promise<Post[]> {
    return this.postsRepository.find({
      relations: ['user'],
    });
  }

  async findOne(id: string): Promise<Post | null> {
    return this.postsRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async update(id: string, updatePostDto: Partial<Post>): Promise<Post> {
    await this.postsRepository.update(id, updatePostDto);
    const post = await this.findOne(id);
    if (!post) {
      throw new Error('Post not found');
    }
    return post;
  }

  async remove(id: string): Promise<void> {
    await this.postsRepository.delete(id);
  }
}
