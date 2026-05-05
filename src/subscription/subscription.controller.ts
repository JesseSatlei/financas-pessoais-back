import { Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { PublicUser } from '../domain/types';
import { SubscriptionService } from './subscription.service';

@Controller('subscription')
@UseGuards(AuthGuard)
export class SubscriptionController {
  constructor(private readonly subscription: SubscriptionService) {}

  @Get()
  get(@CurrentUser() user: PublicUser) {
    return this.subscription.get(user.id);
  }

  @Post('declare-paid')
  declarePaid(@CurrentUser() user: PublicUser) {
    return this.subscription.declarePaid(user.id);
  }

  @Delete()
  cancel(@CurrentUser() user: PublicUser) {
    return this.subscription.cancel(user.id);
  }
}
