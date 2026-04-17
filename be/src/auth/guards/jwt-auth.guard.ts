import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
// Khi không điền gì, mặc định passpord sẽ đặt tên cho stategy là chuỗi jwt
export class JwtAuthGuard extends AuthGuard('jwt') {}
