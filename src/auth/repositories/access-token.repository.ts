import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { AccessToken } from '../entities/access-token.entity';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities';

@Injectable()
export class AccessTokenRepository extends Repository<AccessToken> {
  constructor(
    @InjectRepository(AccessToken)
    private readonly repo: Repository<AccessToken>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }

  async saveAccessToken(
    jti: string,
    user: User,
    token: string,
    expiresAt: Date,
  ): Promise<AccessToken> {
    const accessToken = new AccessToken();
    accessToken.jti = jti;
    accessToken.user = user;
    accessToken.token = token;
    accessToken.expiredAt = expiresAt;
    accessToken.isRevoked = false;
    return this.repo.save(accessToken);
  }

  async findOneByJti(jti: string): Promise<AccessToken> {
    return this.findOneBy({ jti, isRevoked: false });
  }
}
