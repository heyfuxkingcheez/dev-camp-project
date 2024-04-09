import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TokenBlackListRepository } from 'src/auth/repositories';

@Injectable()
export class SchedulerService {
  constructor(
    private readonly tokenBlackListRepository: TokenBlackListRepository,
  ) {}

  // 토큰 블랙리스트 DB 정리
  @Cron('15 4 * * *')
  async handleCron() {
    await this.tokenBlackListRepository.removeExpiredTokens();
    console.log('DB 정리 완료');
  }
}
