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
      maxRetries: 3,
      httpOptions: {
        timeout: 30000,
        connectTimeout: 30000,
      },
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
    user?: User,
  ): Promise<Post> {
    console.log('🚀 ~ PostsService ~ user:', user);
    if (!file) {
      throw new Error('No file provided');
    }

    console.log('user: ', user);

    const s3Key = `posts/${user?.id || 'anonymous'}/${Date.now()}-${file.originalname}`;
    console.log('Uploading to S3 with key:', s3Key);

    let s3Url: string;
    let tempFilePath: string;

    try {
      // First, save the file locally
      tempFilePath = path.join(os.tmpdir(), file.originalname);
      await fs.promises.writeFile(tempFilePath, file.buffer);

      // Upload to S3 using the local file
      const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: s3Key,
        Body: fs.createReadStream(tempFilePath),
        ContentType: file.mimetype,
      };

      await this.s3.putObject(uploadParams).promise();
      s3Url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
      console.log('Successfully uploaded to S3:', s3Url);

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
            console.log(`YouTube upload progress: ${Math.round(progress)}%`);
          },
        },
      );

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
    } catch (error) {
      console.error('Error in createPost:', error);
      throw error;
    } finally {
      // Clean up temp file
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        try {
          await fs.promises.unlink(tempFilePath);
        } catch (cleanupError) {
          console.error('Error cleaning up temp file:', cleanupError);
        }
      }
    }
  }

  async findAll(user: User): Promise<Post[]> {
    return this.postsRepository.find({
      where: { user: { id: user.id } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
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
