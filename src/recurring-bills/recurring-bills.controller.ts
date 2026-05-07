import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { PublicUser, RecurringBill } from '../domain/types';
import { RecurringBillsService } from './recurring-bills.service';

@Controller('recurring-bills')
@UseGuards(AuthGuard)
export class RecurringBillsController {
  constructor(private readonly bills: RecurringBillsService) {}

  @Get()
  list(@CurrentUser() user: PublicUser) {
    return this.bills.list(user.id);
  }

  @Post()
  add(
    @CurrentUser() user: PublicUser,
    @Body() body: Omit<RecurringBill, 'id' | 'createdAt'>,
  ) {
    return this.bills.add(user.id, body);
  }

  @Put(':id')
  update(
    @CurrentUser() user: PublicUser,
    @Param('id') id: string,
    @Body() body: Omit<RecurringBill, 'id' | 'createdAt'>,
  ) {
    return this.bills.update(user.id, id, body);
  }

  @Put(':id/paid')
  togglePaid(
    @CurrentUser() user: PublicUser,
    @Param('id') id: string,
    @Body() body: { month: string; paid: boolean },
  ) {
    return this.bills.togglePaid(user.id, id, body.month, body.paid);
  }

  @Delete(':id')
  remove(@CurrentUser() user: PublicUser, @Param('id') id: string) {
    return this.bills.remove(user.id, id);
  }
}
