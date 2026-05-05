import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { SubscriptionStatus } from '../domain/types';
import { UserEntity } from '../users/user.entity';

@Entity('subscriptions')
export class SubscriptionEntity {
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId: string;

  @OneToOne(() => UserEntity, (user) => user.subscription, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ type: 'varchar', length: 20 })
  status: SubscriptionStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: string;

  @Column({ name: 'pix_key', length: 80 })
  pixKey: string;

  @Column({ name: 'declared_paid_at', type: 'timestamptz', nullable: true })
  declaredPaidAt?: Date;

  @Column({ name: 'activated_at', type: 'timestamptz', nullable: true })
  activatedAt?: Date;

  @Column({ name: 'next_billing_at', type: 'timestamptz', nullable: true })
  nextBillingAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
