export class User {
  id: number;
  username: string;
  email: string;
  password: string;
  posts: any[]; // This will be properly typed once we create the Post entity
  createdAt: Date;
} 