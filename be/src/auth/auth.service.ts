import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from 'src/mail/mail.service';
import { authenticator } from '@otplib/preset-default';
import * as QRCode from 'qrcode';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.usersService.findByEmail(email);
    if (!user)
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch)
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');

    if (user.is2faEnabled) {
      return {
        require2FA: true,
        userId: user.id,
        message: 'Vui lòng nhập mã OTP để hoàn tất đăng nhập',
      };
    }

    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatarUrl: user.avatarUrl,
        is2faEnabled: user.is2faEnabled,
      },
    };
  }

  async forgotPassword(forgotDto: ForgotPasswordDto) {
    const { email } = forgotDto;
    const user = await this.usersService.findByEmail(email);
    if (!user)
      throw new NotFoundException('Email không tồn tại trong hệ thống');

    // 1. Tạo OTP 6 số ngẫu nhiên
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

    // 2. Lưu vào bảng AuthOTP
    await this.prisma.authOTP.create({
      data: {
        userId: user.id,
        code: otp,
        type: 'RESET_PASSWORD',
        expiresAt: expiresAt,
      },
    });

    // 3. Gửi Mail
    await this.mailService.sendOTP(email, otp);
    return { message: 'Mã OTP đã được gửi tới email của bạn' };
  }

  async resetPassword(resetDto: ResetPasswordDto) {
    // 1. Kiểm tra OTP hợp lệ
    const otpRecord = await this.prisma.authOTP.findFirst({
      where: {
        code: resetDto.otp,
        type: 'RESET_PASSWORD',
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!otpRecord)
      throw new BadRequestException('Mã OTP không hợp lệ hoặc đã hết hạn');

    // 2. Cập nhật mật khẩu mới cho User
    const hashedPassword = await bcrypt.hash(resetDto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: otpRecord.userId },
      data: { passwordHash: hashedPassword },
    });

    // 3. Đánh dấu OTP đã sử dụng
    await this.prisma.authOTP.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });

    return { message: 'Đổi mật khẩu thành công' };
  }

  // 1. Tạo Secret Key và QR Code cho người dùng quét
  async generateTwoFactorAuthenticationSecret(user: any) {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(
      user.email,
      'T-Auction System',
      secret,
    );
    const qrCodeDataURL = await QRCode.toDataURL(otpauthUrl);

    return {
      secret,
      qrCodeDataURL,
    };
  }

  // 2. Kiểm tra mã OTP người dùng nhập có đúng không
  isTwoFactorAuthenticationCodeValid(
    twoFactorAuthenticationCode: string,
    userSecret: string,
  ) {
    return authenticator.verify({
      token: twoFactorAuthenticationCode,
      secret: userSecret,
    });
  }

  // 3. Hàm bật 2FA chính thức (Lưu vào DB)
  async turnOnTwoFactorAuthentication(userId: string, secret: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: secret,
        is2faEnabled: true,
      },
    });
  }

  async loginWith2FA(userId: string, otp: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    const isCodeValid = this.isTwoFactorAuthenticationCodeValid(
      otp,
      user.twoFactorSecret!,
    );

    if (!isCodeValid) throw new UnauthorizedException('Invalid 2FA code');

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatarUrl: user.avatarUrl,
        is2faEnabled: user.is2faEnabled,
      },
    };
  }

  async turnOff2FA(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        is2faEnabled: false,
        twoFactorSecret: null,
      },
    });
  }
}
