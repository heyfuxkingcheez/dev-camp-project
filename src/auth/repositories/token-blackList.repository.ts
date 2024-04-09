import { Injectable } from '@nestjs/common';
import { TokenBlackList } from '../entities';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class TokenBlackListRepository extends Repository<TokenBlackList> {
  constructor(
    @InjectRepository(TokenBlackList)
    private readonly repo: Repository<TokenBlackList>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }

  async addTokenToBlackList(
    token: string,
    jti: string,
    tokenType: 'access' | 'refresh',
    expiresAt: number,
  ): Promise<void> {
    console.log(expiresAt);

    const blackListedToken = new TokenBlackList();
    blackListedToken.token = token;
    blackListedToken.jti = jti;
    blackListedToken.tokenType = tokenType;
    blackListedToken.expiresAt = new Date(expiresAt * 1000);
    await this.repo.save(blackListedToken);
  }

  async isTokenBlackListed(jti: string): Promise<boolean> {
    const foundToken = await this.repo.findOne({ where: { jti } });
    return !!foundToken;
  }

  async removeExpiredTokens(): Promise<void> {
    await this.createQueryBuilder()
      .delete()
      .from(TokenBlackList)
      .where('expiresAt < NOW()')
      .execute();
  }
}
