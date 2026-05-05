import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { Entry, PublicUser } from '../domain/types';
import { EntriesService } from './entries.service';

@Controller('entries')
@UseGuards(AuthGuard)
export class EntriesController {
  constructor(private readonly entries: EntriesService) {}

  @Get()
  list(@CurrentUser() user: PublicUser) {
    return this.entries.list(user.id);
  }

  @Post()
  add(
    @CurrentUser() user: PublicUser,
    @Body() body: Omit<Entry, 'id' | 'createdAt'>,
  ) {
    return this.entries.add(user.id, body);
  }

  @Post('seed-if-empty')
  seedIfEmpty(
    @CurrentUser() user: PublicUser,
    @Body() body: { sample?: Entry[] },
  ) {
    return this.entries.seedIfEmpty(user.id, body.sample ?? []);
  }

  @Delete(':id')
  remove(@CurrentUser() user: PublicUser, @Param('id') id: string) {
    return this.entries.remove(user.id, id);
  }
}
