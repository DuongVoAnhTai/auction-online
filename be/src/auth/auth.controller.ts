import {
  Body,
  Controller,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.usersService.create(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/generate')
  async generate2FA(@Req() req) {
    const { qrCodeDataURL, secret } =
      await this.authService.generateTwoFactorAuthenticationSecret(req.user);
    return { qrCodeDataURL, secret };
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/turn-on')
  async turnOnTwoFactorAuthentication(
    @Req() req,
    @Body() body: { otp: string; secret: string },
  ) {
    const isCodeValid = this.authService.isTwoFactorAuthenticationCodeValid(
      body.otp,
      body.secret,
    );

    if (!isCodeValid) {
      throw new UnauthorizedException('Mã xác thực không đúng');
    }

    await this.authService.turnOnTwoFactorAuthentication(
      req.user.sub,
      body.secret,
    );
    return { message: 'Bật 2FA thành công' };
  }

  @Post('2fa/authenticate')
  async authenticate2FA(@Body() body: { userId: string; otp: string }) {
    return this.authService.loginWith2FA(body.userId, body.otp);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/turn-off')
  async turnOff2FA(@Req() req) {
    return this.authService.turnOff2FA(req.user.sub);
  }
}
