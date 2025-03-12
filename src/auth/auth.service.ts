import { Injectable, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { oAuthClientId, oAuthClientSecret, refreshToken } from 'src/endpoints';

@Injectable()
export class AuthService implements OnModuleInit {
  private accessToken: string;

  constructor(
    private readonly httpService: HttpService,
  ) {}

  async onModuleInit() {
    await this.authenticate();
  }

  private async authenticate() {

    const tokenUrl = 'https://oauth2.googleapis.com/token';
    const params = new URLSearchParams();
    params.append('client_id', oAuthClientId);
    params.append('client_secret', oAuthClientSecret);
    params.append('refresh_token', refreshToken);
    params.append('grant_type', 'refresh_token');

    const response = await firstValueFrom(
      this.httpService.post(tokenUrl, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }),
    );

    this.accessToken = response.data.access_token;
    console.log("this.acceess token: ", this.accessToken);
  }

  getAccessToken(): string {
    return this.accessToken;
  }
} 
