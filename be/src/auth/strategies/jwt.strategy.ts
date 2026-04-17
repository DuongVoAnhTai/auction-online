import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Trích xuất Token từ header Authorization: Bearer <TOKEN>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Không cho phép Token hết hạn
      secretOrKey: process.env.JWT_SECRET || 'mysecretkey', // Phải khớp với lúc ký Token
    });
  }

  // Hàm này sẽ chạy sau khi Token được giải mã thành công
  // Những gì trả về ở đây sẽ được gán vào đối tượng request (req.user)
  async validate(payload: any) {
    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
