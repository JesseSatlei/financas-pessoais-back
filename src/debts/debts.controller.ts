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
import type { Debt, PublicUser } from '../domain/types';
import { DebtsService } from './debts.service';

@Controller('debts')
@UseGuards(AuthGuard)
export class DebtsController {
  constructor(private readonly debts: DebtsService) {}

  @Get()
  list(@CurrentUser() user: PublicUser) {
    return this.debts.list(user.id);
  }

  @Post()
  add(
    @CurrentUser() user: PublicUser,
    @Body() body: Omit<Debt, 'id' | 'createdAt'>,
  ) {
    return this.debts.add(user.id, body);
  }

  @Put(':id')
  update(
    @CurrentUser() user: PublicUser,
    @Param('id') id: string,
    @Body() body: Omit<Debt, 'id' | 'createdAt'>,
  ) {
    return this.debts.update(user.id, id, body);
  }

  @Delete(':id')
  remove(@CurrentUser() user: PublicUser, @Param('id') id: string) {
    return this.debts.remove(user.id, id);
  }
}
