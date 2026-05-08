import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import type { AuthSession, JwtPayload, PublicUser } from '../domain/types';
import { UserEntity } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    private readonly jwt: JwtService,
  ) {}

  current(user: PublicUser): PublicUser {
    return user;
  }

  async signUp(
    name: string,
    email: string,
    password: string,
  ): Promise<AuthSession> {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) throw new BadRequestException('Nome invalido');
    if (!this.isEmail(cleanEmail))
      throw new BadRequestException('Email invalido');
    if (password.length < 6) {
      throw new BadRequestException('Senha deve ter no minimo 6 caracteres');
    }

    const existing = await this.users.findOne({ where: { email: cleanEmail } });
    if (existing) {
      throw new ConflictException('Email ja cadastrado');
    }

    const user = this.users.create({
      name: cleanName,
      email: cleanEmail,
      passwordHash: await bcrypt.hash(password, 10),
      approved: true,
      role: 'user',
    });

    const saved = await this.users.save(user);
    const safe = this.toPublicUser(saved);
    return { user: safe, token: await this.issueToken(safe) };
  }

  async signIn(email: string, password: string): Promise<AuthSession> {
    const cleanEmail = email.trim().toLowerCase();
    const user = await this.users.findOne({ where: { email: cleanEmail } });
    if (!user) throw new UnauthorizedException('Usuario nao encontrado');
    if (!(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Senha incorreta');
    }
    if (!user.approved && user.role !== 'admin') {
      throw new ForbiddenException('Conta aguardando aprovacao');
    }

    const safe = this.toPublicUser(user);
    return { user: safe, token: await this.issueToken(safe) };
  }

  async verifyToken(token: string): Promise<PublicUser> {
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Token invalido');
    }

    const user = await this.users.findOne({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException('Usuario nao encontrado');
    if (!user.approved && user.role !== 'admin') {
      throw new ForbiddenException('Conta aguardando aprovacao');
    }
    return this.toPublicUser(user);
  }

  private issueToken(user: PublicUser): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };
    return this.jwt.signAsync(payload);
  }

  private toPublicUser(user: UserEntity): PublicUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      approved: user.approved,
      role: user.role,
      createdAt: user.createdAt.getTime(),
    };
  }

  private isEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
