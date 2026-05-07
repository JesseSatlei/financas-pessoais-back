import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { UserEntity } from '../users/user.entity';

@Injectable()
export class AdminService implements OnModuleInit {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    const enabled = this.config.get<string>('ADMIN_ENABLED', 'true') === 'true';
    const email = this.config.get<string>('ADMIN_EMAIL')?.trim().toLowerCase();
    const password = this.config.get<string>('ADMIN_PASSWORD') ?? '';
    const name = this.config.get<string>('ADMIN_NAME', 'Admin');

    if (!enabled) return;
    if (!email || !password) {
      this.logger.warn(
        'Admin seed skipped (set ADMIN_EMAIL and ADMIN_PASSWORD to enable).',
      );
      return;
    }

    const existing = await this.users.findOne({ where: { email } });
    const passwordHash = await bcrypt.hash(password, 10);

    if (!existing) {
      await this.users.save(
        this.users.create({
          name,
          email,
          passwordHash,
          role: 'admin',
          approved: true,
        }),
      );
      this.logger.log(`Admin created: ${email}`);
      return;
    }

    let changed = false;
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      changed = true;
    }
    if (!existing.approved) {
      existing.approved = true;
      changed = true;
    }

    const rotatePassword =
      this.config.get<string>('ADMIN_ROTATE_PASSWORD', 'false') === 'true';
    if (rotatePassword) {
      existing.passwordHash = passwordHash;
      changed = true;
    }

    if (changed) {
      await this.users.save(existing);
      this.logger.log(`Admin updated: ${email}`);
    }
  }

  listUsers() {
    return this.users.find({
      select: {
        id: true,
        name: true,
        email: true,
        approved: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async setApproval(userId: string, approved: boolean) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) return null;
    user.approved = approved;
    return this.users.save(user);
  }
}
