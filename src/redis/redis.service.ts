import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  // access token 생성
  async setAccessToken(
    userId: string,
    accessToken: string,
    expiresAt: number,
  ): Promise<void> {
    await this.redis.set(
      `access_token:${userId}`,
      accessToken,
      'PX',
      expiresAt,
    );
  }

  // access token 조회
  async getAccessToken(userId: string): Promise<string | null> {
    return await this.redis.get(`access_token:${userId}`);
  }

  // access token 삭제
  async removeAccessToken(userId: string): Promise<void> {
    await this.redis.del(`access_token:${userId}`);
  }

  // refresh token 생성
  async setRefreshToken(
    userId: string,
    refreshToken: string,
    expiresAt: number,
  ): Promise<void> {
    await this.redis.set(
      `refresh_token:${userId}`,
      refreshToken,
      'PX',
      expiresAt,
    );
  }

  // refresh token 조회
  async getRefreshToken(userId: string): Promise<string | null> {
    return await this.redis.get(`refresh_token:${userId}`);
  }

  // refresh token 삭제
  async removeRefreshToken(userId: string): Promise<void> {
    await this.redis.del(`refresh_token:${userId}`);
  }

  // token black-list 생성
  async setTokenToBlackList(accessToken: string, refreshToken: string) {}
}
