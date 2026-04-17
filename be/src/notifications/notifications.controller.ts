import { Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getMyNotifications(@Req() req: any) {
    const userId = req.user.sub; // Lấy ID từ Token đã giải mã
    return this.notificationsService.findAll(userId);
  }

  @Patch('mark-all-read')
  async markAllRead(@Req() req: any) {
    const userId = req.user.sub;
    return this.notificationsService.markAllAsRead(userId);
  }

  @Patch('mark-read/:id')
  async markRead(@Req() req: any) {
    const userId = req.user.sub;
    return this.notificationsService.markAsRead(req.params.id, userId);
  }
}
