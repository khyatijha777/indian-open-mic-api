import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  caption!: string;

  @IsOptional()
  @IsUrl()
  youtubeUrl?: string;

  @IsOptional()
  @IsString()
  s3Url?: string;
}
