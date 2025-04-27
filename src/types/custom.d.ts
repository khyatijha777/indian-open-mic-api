declare namespace Express {
  interface Multer {
    File: {
      fieldname: string;
      originalname: string;
      encoding: string;
      mimetype: string;
      buffer: Buffer;
      size: number;
    };
  }
}

declare module 'aws-sdk' {
  export class S3 {
    constructor(options?: any);
    putObject(params: any): { promise(): Promise<any> };
    getObject(params: any): { createReadStream(): any };
  }
}

declare module 'googleapis' {
  import { GoogleAuth } from 'google-auth-library';

  interface YouTubeOptions {
    version: string;
    auth: GoogleAuth;
  }

  interface YouTube {
    videos: {
      insert(params: any, options?: any): Promise<any>;
    };
  }

  export const google: {
    auth: {
      GoogleAuth: typeof GoogleAuth;
    };
    youtube(options: YouTubeOptions): YouTube;
  };
} 