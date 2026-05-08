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
import type { Person, PublicUser } from '../domain/types';
import { PeopleService } from './people.service';

@Controller('people')
@UseGuards(AuthGuard)
export class PeopleController {
  constructor(private readonly people: PeopleService) {}

  @Get()
  list(@CurrentUser() user: PublicUser) {
    return this.people.list(user.id);
  }

  @Post()
  add(
    @CurrentUser() user: PublicUser,
    @Body() body: Omit<Person, 'id' | 'createdAt'>,
  ) {
    return this.people.add(user.id, body);
  }

  @Put(':id')
  update(
    @CurrentUser() user: PublicUser,
    @Param('id') id: string,
    @Body() body: Omit<Person, 'id' | 'createdAt'>,
  ) {
    return this.people.update(user.id, id, body);
  }

  @Delete(':id')
  remove(@CurrentUser() user: PublicUser, @Param('id') id: string) {
    return this.people.remove(user.id, id);
  }
}
