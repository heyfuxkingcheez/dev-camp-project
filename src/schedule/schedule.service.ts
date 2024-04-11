import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  AccessTokenRepository,
  RefreshTokenRepository,
} from 'src/auth/repositories';
import { TokenBlackListService } from 'src/auth/services';

@Injectable()
export class SchedulerService {
  constructor(
    private readonly accessTokenRepository: AccessTokenRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly tokenBlackListService: TokenBlackListService,
  ) {}

  // 토큰 블랙리스트 DB 정리
  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async handleCron() {
    await this.tokenBlackListService.removeExpiredTokens();
    console.log('[DB]토큰 블랙리스트 정리 완료');
  }

  // 만료 토큰 상태 변경
  @Cron(CronExpression.EVERY_HOUR)
  async tokenStatus() {
    await this.accessTokenRepository.changeStatusExpiredTokens();
    await this.refreshTokenRepository.changeStatusExpiredTokens();
    console.log('[DB]만료 토큰 정리 완료');
  }
}
