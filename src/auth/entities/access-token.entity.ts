import { BaseEntity } from 'src/common';
import { Column, Entity, ManyToOne, Relation } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class AccessToken extends BaseEntity {
  @ManyToOne(() => User)
  user: Relation<User>;

  @Column()
  jti: string;

  @Column()
  token: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ default: false })
  isRevoked: boolean;
}
