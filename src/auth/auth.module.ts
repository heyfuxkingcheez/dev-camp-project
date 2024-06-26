import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { TokenBlackListService, UserService } from './services';
import { UserRepository } from './repositories/user.repository';
import { PassportModule } from '@nestjs/passport';
import {
  AccessLogRepository,
  AccessTokenRepository,
  RefreshTokenRepository,
  TokenBlackListRepository,
} from './repositories';
import { RedisModule } from 'src/redis/redis.module';
import { JwtStrategy } from './strategies';
import {
  AccessLog,
  AccessToken,
  RefreshToken,
  TokenBlackList,
} from './entities';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('ACCESS_TOKEN_EXP'),
        },
      }),
    }),
    TypeOrmModule.forFeature([
      User,
      AccessLog,
      AccessToken,
      RefreshToken,
      TokenBlackList,
    ]),
    RedisModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserService,
    TokenBlackListService,

    UserRepository,
    AccessLogRepository,
    AccessTokenRepository,
    RefreshTokenRepository,
    TokenBlackListRepository,

    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [
    AuthService,
    UserService,
    TokenBlackListService,

    UserRepository,
    AccessLogRepository,
    AccessTokenRepository,
    RefreshTokenRepository,
    TokenBlackListRepository,

    JwtStrategy,
  ],
})
export class AuthModule {}
