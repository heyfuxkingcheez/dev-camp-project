import { Injectable } from '@nestjs/common';
import { TokenBlackListRepository } from '../repositories';

@Injectable()
export class TokenBlackListService {
  constructor(
    private readonly tokenBlackListRepository: TokenBlackListRepository,
  ) {}

  async addToBlacklist(
    token: string,
    jti: string,
    type: 'access' | 'refresh',
    expiresAt: Date,
  ): Promise<void> {
    await this.tokenBlackListRepository.addTokenToBlackList(
      token,
      jti,
      type,
      expiresAt,
    );
  }

  async removeExpiredTokens(): Promise<void> {
    await this.tokenBlackListRepository.removeExpiredTokens();
  }

  async isTokenBlackListed(jti: string): Promise<boolean> {
    const token = await this.tokenBlackListRepository.isTokenBlackListed(jti);
    if (!token) return false;
    return true;
  }
}
