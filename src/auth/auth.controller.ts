import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { CurrentUser } from './current-user.decorator';
import type { PublicUser } from '../domain/types';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  current(@CurrentUser() user: PublicUser) {
    return this.auth.current(user);
  }

  @Post('signup')
  signUp(@Body() body: { name?: string; email?: string; password?: string }) {
    return this.auth.signUp(
      body.name ?? '',
      body.email ?? '',
      body.password ?? '',
    );
  }

  @Post('signin')
  signIn(@Body() body: { email?: string; password?: string }) {
    return this.auth.signIn(body.email ?? '', body.password ?? '');
  }

  @Post('signout')
  signOut() {
    return { ok: true };
  }
}
