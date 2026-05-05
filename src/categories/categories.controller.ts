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
import type { EntryType, PublicUser } from '../domain/types';
import { CategoriesService } from './categories.service';

@Controller('categories')
@UseGuards(AuthGuard)
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Get()
  list(@CurrentUser() user: PublicUser) {
    return this.categories.list(user.id);
  }

  @Post()
  add(
    @CurrentUser() user: PublicUser,
    @Body() body: { type?: EntryType; name?: string },
  ) {
    return this.categories.add(
      user.id,
      body.type as EntryType,
      body.name ?? '',
    );
  }

  @Delete(':type/:name')
  remove(
    @CurrentUser() user: PublicUser,
    @Param('type') type: EntryType,
    @Param('name') name: string,
  ) {
    return this.categories.remove(user.id, type, name);
  }
}
