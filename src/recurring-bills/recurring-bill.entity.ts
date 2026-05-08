import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../users/user.entity';

@Entity('recurring_bills')
export class RecurringBillEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  @Index()
  userId: string;

  @ManyToOne(() => UserEntity, (user) => user.recurringBills, {
    onDelete: 'CASCADE',
  })
  user: UserEntity;

  @Column({ length: 120 })
  title: string;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  amount: string;

  @Column({ length: 80 })
  category: string;

  @Column({ name: 'due_day', type: 'int' })
  dueDay: number;

  @Column({ nullable: true, length: 80 })
  account?: string;

  @Column({ nullable: true, length: 240 })
  notes?: string;

  @Column({ default: true })
  active: boolean;

  @Column({ name: 'variable_amount', default: false })
  variableAmount: boolean;

  @Column({ name: 'split_with', nullable: true, length: 120 })
  splitWith?: string;

  @Column({ name: 'paid_months', type: 'simple-json', default: '[]' })
  paidMonths: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
