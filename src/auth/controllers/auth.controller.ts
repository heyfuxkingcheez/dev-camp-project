import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services';
import { CreateUserDto, SignupResDto } from '../dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto): Promise<SignupResDto> {
    const user = await this.userService.createUser(createUserDto);
    return {
      id: user.id,
      nickName: user.nick_name,
      email: user.email,
      password: user.password,
    };
  }
}
