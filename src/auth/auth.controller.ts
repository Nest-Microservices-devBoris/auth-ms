import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LoginUserDto, RegisterUserDto } from './dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {} 

  @MessagePattern('auth.register.user')
  async registerUser(@Payload() registerUserDto: RegisterUserDto) {
    return registerUserDto ;
  }
  
  @MessagePattern('auth.login.user')
  async loginUser(@Payload() loginUserDto: LoginUserDto) {
    return loginUserDto;
  }

  @MessagePattern('auth.verify.user')
  async verifyUser(data: any) {
    return 'Verify user';
  }
}
