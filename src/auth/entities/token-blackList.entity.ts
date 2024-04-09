import { BaseEntity } from 'src/common';
import { Column, Entity } from 'typeorm';

@Entity()
export class TokenBlackList extends BaseEntity {
  @Column()
  token: string;

  @Column()
  jti: string;

  @Column()
  tokenType: 'access' | 'refresh';

  @Column({ type: 'timestamp' })
  expiresAt: Date;
}
