import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AccessLogRepository,
  AccessTokenRepository,
  UserRepository,
} from '../repositories';
import { LoginResDto } from '../dto';
import * as argon2 from 'argon2';
import { User } from '../entities';
import { RequestInfo, TokenPayload } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenRepository } from './../repositories/refresh-token.repository';
import { TokenBlackListService } from './token_blackList.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly userRepository: UserRepository,
    private readonly accessLogRepository: AccessLogRepository,
    private readonly jwtService: JwtService,
    private readonly accessTokenRepository: AccessTokenRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly tokenBlackListService: TokenBlackListService,
  ) {}

  async login(
    email: string,
    plainPassword: string,
    req: RequestInfo,
  ): Promise<LoginResDto> {
    const user = await this.validateUser(email, plainPassword);
    await this.invalidateTokens(user.id);

    const payload: TokenPayload = this.createTokenPayload(user.id);

    const [accessToken, refreshToken] = await Promise.all([
      this.createAccessToken(user, payload),
      this.createRefreshToken(user, payload),
    ]);

    const { ip, endpoint, ua } = req;
    await this.accessLogRepository.createAccessLog(user, ua, endpoint, ip);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        nickName: user.nick_name,
        email: user.email,
      },
    };
  }

  async logout(accessToken: string, refreshToken: string): Promise<void> {
    const [access, refresh] = await Promise.all([
      this.jwtService.verifyAsync(accessToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      }),
      this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      }),
    ]);

    // console.log(access, refresh);
    await Promise.all([
      this.tokenBlackListService.addToBlacklist(
        accessToken,
        access.jti,
        'access',
        access.exp,
      ),
      this.tokenBlackListService.addToBlacklist(
        refreshToken,
        refresh.jti,
        'refresh',
        refresh.exp,
      ),
    ]);
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const user = await this.userRepository.findOneBy({ id: payload.sub });
      if (!user) throw new UnauthorizedException('존재하지 않는 회원입니다.');

      return this.createAccessToken(user, payload);
    } catch (error) {
      throw new UnauthorizedException('잘못된 접근입니다.');
    }
  }

  private async validateUser(
    email: string,
    plainPassword: string,
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user || !(await argon2.verify(user.password, plainPassword))) {
      throw new UnauthorizedException(
        '존재하지 않는 회원이거나 비밀번호가 틀립니다',
      );
    }
    return user;
  }

  createTokenPayload(userId: string): TokenPayload {
    return {
      sub: userId,
      iat: Math.floor(Date.now() / 1000),
      jti: uuidv4(),
    };
  }

  async createAccessToken(user: User, payload: TokenPayload): Promise<string> {
    const expiresIn = this.configService.get<string>('ACCESS_TOKEN_EXP');
    const token = this.jwtService.sign(payload, { expiresIn });
    const expiresAt = this.calculateExpiry(expiresIn);

    await this.accessTokenRepository.saveAccessToken(
      payload.jti,
      user,
      token,
      expiresAt,
    );

    return token;
  }

  async createRefreshToken(user: User, payload: TokenPayload): Promise<string> {
    const expiresIn = this.configService.get<string>('REFRESH_TOKEN_EXP');
    const token = this.jwtService.sign(payload, { expiresIn });
    const expiresAt = this.calculateExpiry(expiresIn);

    await this.refreshTokenRepository.saveRefreshToken(
      payload.jti,
      user,
      token,
      expiresAt,
    );

    return token;
  }

  async invalidateTokens(userId: string): Promise<void> {
    const now = new Date();
    const [lastestAccessToken, lastestRefresToken] = await Promise.all([
      this.accessTokenRepository
        .createQueryBuilder('AccessToken')
        .where('AccessToken.userId = :userId', { userId })
        .andWhere('AccessToken.expiresAt > :now', { now })
        .orderBy('AccessToken.expiresAt', 'DESC')
        .getOne(),
      this.refreshTokenRepository
        .createQueryBuilder('RefreshToken')
        .where('RefreshToken.userId = :userId', { userId })
        .andWhere('RefreshToken.expiresAt > :now', { now })
        .orderBy('RefreshToken.expiresAt', 'DESC')
        .getOne(),
    ]);

    if (lastestAccessToken && lastestRefresToken) {
      Promise.all([
        this.tokenBlackListService.addToBlacklist(
          lastestAccessToken.token,
          lastestAccessToken.jti,
          'access',
          lastestAccessToken.expiresAt,
        ),
        this.tokenBlackListService.addToBlacklist(
          lastestRefresToken.token,
          lastestRefresToken.jti,
          'refresh',
          lastestRefresToken.expiresAt,
        ),
      ]);
    }
    return;
  }

  private calculateExpiry(expiry: string): Date {
    let expiresInMilliseconds = 0;

    if (expiry.endsWith('d')) {
      const days = parseInt(expiry.slice(0, -1), 10);
      expiresInMilliseconds = days * 24 * 60 * 60 * 1000;
    } else if (expiry.endsWith('h')) {
      const hours = parseInt(expiry.slice(0, -1), 10);
      expiresInMilliseconds = hours * 60 * 60 * 1000;
    } else if (expiry.endsWith('m')) {
      const minutes = parseInt(expiry.slice(0, -1), 10);
      expiresInMilliseconds = minutes * 60 * 1000;
    } else if (expiry.endsWith('s')) {
      const seconds = parseInt(expiry.slice(0, -1), 10);
      expiresInMilliseconds = seconds * 1000;
    } else {
      throw new BadRequestException('숫자 계산 실패');
    }

    return new Date(Date.now() + expiresInMilliseconds);
  }
}
