import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendOTP(email: string, otp: string) {
    await this.transporter.sendMail({
      from: '"Hệ thống Đấu giá" <no-reply@auction.com>',
      to: email,
      subject: 'Mã xác thực đổi mật khẩu',
      html: `<h3>Mã OTP của bạn là: <b style="color: blue; font-size: 24px;">${otp}</b></h3>
             <p>Mã này có hiệu lực trong 10 phút. Vui lòng không chia sẻ cho bất kỳ ai.</p>`,
    });
  }
}
