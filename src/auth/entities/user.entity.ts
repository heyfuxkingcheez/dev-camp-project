import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type UserRole = 'admin' | 'user';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  nick_name: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar' })
  role: UserRole;
}
