import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { PIX_KEY, SUBSCRIPTION_AMOUNT } from '../domain/constants';
import { SubscriptionEntity } from '../subscription/subscription.entity';
import { UserEntity } from '../users/user.entity';

@Injectable()
export class AdminService implements OnModuleInit {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    @InjectRepository(SubscriptionEntity)
    private readonly subscriptions: Repository<SubscriptionEntity>,
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

  async listUsers() {
    const users = await this.users.find({
      relations: { subscription: true },
      order: { createdAt: 'DESC' },
    });
    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      approved: user.approved,
      role: user.role,
      createdAt: user.createdAt.getTime(),
      subscription: user.subscription
        ? {
            status: this.effectiveSubscriptionStatus(user.subscription),
            amount: Number(user.subscription.amount),
            declaredPaidAt: user.subscription.declaredPaidAt?.getTime(),
            activatedAt: user.subscription.activatedAt?.getTime(),
            nextBillingAt: user.subscription.nextBillingAt?.getTime(),
          }
        : {
            status: 'none',
            amount: SUBSCRIPTION_AMOUNT,
          },
    }));
  }

  async setApproval(userId: string, approved: boolean) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) return null;
    user.approved = approved;
    return this.users.save(user);
  }

  async setSubscriptionPaid(userId: string, paid: boolean) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) return null;

    const existing = await this.subscriptions.findOne({ where: { userId } });
    const subscription =
      existing ??
      this.subscriptions.create({
        userId,
        amount: SUBSCRIPTION_AMOUNT.toFixed(2),
        pixKey: PIX_KEY,
      });

    subscription.amount = SUBSCRIPTION_AMOUNT.toFixed(2);
    subscription.pixKey = PIX_KEY;

    if (paid) {
      const now = new Date();
      subscription.status = 'active';
      subscription.declaredPaidAt = subscription.declaredPaidAt ?? now;
      subscription.activatedAt = now;
      subscription.nextBillingAt = new Date(
        now.getTime() + 30 * 24 * 60 * 60 * 1000,
      );
    } else {
      subscription.status = 'pending';
      subscription.nextBillingAt = undefined;
    }

    await this.subscriptions.save(subscription);
    return this.listUsers().then((users) =>
      users.find((item) => item.id === userId),
    );
  }

  private effectiveSubscriptionStatus(subscription: SubscriptionEntity) {
    if (
      subscription.status === 'active' &&
      subscription.nextBillingAt &&
      subscription.nextBillingAt.getTime() <= Date.now()
    ) {
      return 'pending';
    }
    return subscription.status;
  }
}
