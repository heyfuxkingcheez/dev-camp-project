import { UserRole } from '../entities';

export class CreateUserDto {
  nickName: string;
  email: string;
  password: string;
  role: UserRole;
}
