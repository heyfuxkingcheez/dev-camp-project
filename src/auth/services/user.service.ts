import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { CreateUserDto } from '../dto';
import * as argon2 from 'argon2';
import { User } from '../entities';

@Injectable()
export class UserService {
  constructor(private readonly userRepo: UserRepository) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    // const user = await this.userRepo.findOneByEmail(dto.email);
    // if (user) {
    //   throw new BusinessException(
    //     'user',
    //     `${dto.email} already exist`,
    //     `${dto.email} already exist`,
    //     HttpStatus.BAD_REQUEST,
    //   );
    // }

    const hashedPassword = await argon2.hash(dto.password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      hashLength: 50,
    });
    return this.userRepo.createUser(dto, hashedPassword);
  }
}
