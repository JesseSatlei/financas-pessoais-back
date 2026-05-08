import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from './admin.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(AuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('users')
  listUsers() {
    return this.admin.listUsers();
  }

  @Patch('users/:id/approval')
  setApproval(@Param('id') id: string, @Body() body: { approved?: boolean }) {
    return this.admin.setApproval(id, Boolean(body.approved));
  }

  @Patch('users/:id/subscription')
  setSubscription(
    @Param('id') id: string,
    @Body() body: { paid?: boolean },
  ) {
    return this.admin.setSubscriptionPaid(id, Boolean(body.paid));
  }
}
