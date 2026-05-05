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
    return subscription
      ? this.toPublicSubscription(subscription)
      : {
          userId,
          status: 'none',
          amount: SUBSCRIPTION_AMOUNT,
          pixKey: PIX_KEY,
        };
  }

  async declarePaid(userId: string): Promise<Subscription> {
    const now = new Date();
    const subscription = this.subscriptions.create({
      userId,
      status: 'active',
      amount: SUBSCRIPTION_AMOUNT.toFixed(2),
      pixKey: PIX_KEY,
      declaredPaidAt: now,
      activatedAt: now,
      nextBillingAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
    });

    const saved = await this.subscriptions.save(subscription);
    return this.toPublicSubscription(saved);
  }

  async cancel(userId: string): Promise<{ ok: true }> {
    await this.subscriptions.delete({ userId });
    return { ok: true };
  }

  private toPublicSubscription(subscription: SubscriptionEntity): Subscription {
    return {
      userId: subscription.userId,
      status: subscription.status,
      amount: Number(subscription.amount),
      pixKey: subscription.pixKey,
      declaredPaidAt: subscription.declaredPaidAt?.getTime(),
      activatedAt: subscription.activatedAt?.getTime(),
      nextBillingAt: subscription.nextBillingAt?.getTime(),
    };
  }
}
