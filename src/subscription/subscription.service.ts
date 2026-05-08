import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PIX_KEY, SUBSCRIPTION_AMOUNT } from '../domain/constants';
import type { Subscription } from '../domain/types';
import { SubscriptionEntity } from './subscription.entity';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(SubscriptionEntity)
    private readonly subscriptions: Repository<SubscriptionEntity>,
  ) {}

  async get(userId: string): Promise<Subscription> {
    const subscription = await this.subscriptions.findOne({
      where: { userId },
    });
    if (!subscription) {
      return {
          userId,
          status: 'none',
          amount: SUBSCRIPTION_AMOUNT,
          pixKey: PIX_KEY,
        };
    }
    await this.expireIfNeeded(subscription);
    return this.toPublicSubscription(subscription);
  }

  async declarePaid(userId: string): Promise<Subscription> {
    const now = new Date();
    const existing = await this.subscriptions.findOne({ where: { userId } });
    const subscription =
      existing ??
      this.subscriptions.create({
        userId,
        amount: SUBSCRIPTION_AMOUNT.toFixed(2),
        pixKey: PIX_KEY,
      });

    subscription.status = 'pending';
    subscription.amount = SUBSCRIPTION_AMOUNT.toFixed(2);
    subscription.pixKey = PIX_KEY;
    subscription.declaredPaidAt = now;

    const saved = await this.subscriptions.save(subscription);
    return this.toPublicSubscription(saved);
  }

  async confirmPaid(userId: string): Promise<Subscription> {
    const now = new Date();
    const existing = await this.subscriptions.findOne({ where: { userId } });
    const subscription =
      existing ??
      this.subscriptions.create({
        userId,
        declaredPaidAt: now,
      });

    subscription.status = 'active';
    subscription.amount = SUBSCRIPTION_AMOUNT.toFixed(2);
    subscription.pixKey = PIX_KEY;
    subscription.declaredPaidAt = subscription.declaredPaidAt ?? now;
    subscription.activatedAt = now;
    subscription.nextBillingAt = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000,
    );

    return this.toPublicSubscription(await this.subscriptions.save(subscription));
  }

  async markUnpaid(userId: string): Promise<Subscription> {
    const existing = await this.subscriptions.findOne({ where: { userId } });
    const subscription =
      existing ??
      this.subscriptions.create({
        userId,
        amount: SUBSCRIPTION_AMOUNT.toFixed(2),
        pixKey: PIX_KEY,
      });

    subscription.status = 'pending';
    subscription.amount = SUBSCRIPTION_AMOUNT.toFixed(2);
    subscription.pixKey = PIX_KEY;
    subscription.nextBillingAt = undefined;

    return this.toPublicSubscription(await this.subscriptions.save(subscription));
  }

  async cancel(userId: string): Promise<{ ok: true }> {
    await this.subscriptions.delete({ userId });
    return { ok: true };
  }

  private async expireIfNeeded(
    subscription: SubscriptionEntity,
  ): Promise<void> {
    if (
      subscription.status === 'active' &&
      subscription.nextBillingAt &&
      subscription.nextBillingAt.getTime() <= Date.now()
    ) {
      subscription.status = 'pending';
      await this.subscriptions.save(subscription);
    }
  }

  private toPublicSubscription(subscription: SubscriptionEntity): Subscription {
    const expired =
      subscription.status === 'active' &&
      subscription.nextBillingAt &&
      subscription.nextBillingAt.getTime() <= Date.now();
    return {
      userId: subscription.userId,
      status: expired ? 'pending' : subscription.status,
      amount: Number(subscription.amount),
      pixKey: subscription.pixKey,
      declaredPaidAt: subscription.declaredPaidAt?.getTime(),
      activatedAt: subscription.activatedAt?.getTime(),
      nextBillingAt: subscription.nextBillingAt?.getTime(),
    };
  }
}
