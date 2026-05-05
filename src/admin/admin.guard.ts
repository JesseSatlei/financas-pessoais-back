import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import type { PublicUser } from '../domain/types';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user: PublicUser }>();

    if (request.user?.role !== 'admin') {
      throw new ForbiddenException('Acesso restrito ao admin');
    }
    return true;
  }
}

