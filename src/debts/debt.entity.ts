import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { DebtDirection } from '../domain/types';
import { UserEntity } from '../users/user.entity';

@Entity('debts')
export class DebtEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  @Index()
  userId: string;

  @ManyToOne(() => UserEntity, (user) => user.debts, { onDelete: 'CASCADE' })
  user: UserEntity;

  @Column({ type: 'varchar', length: 20 })
  direction: DebtDirection;

  @Column({ length: 120 })
  person: string;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  amount: string;

  @Column({
    name: 'paid_amount',
    type: 'decimal',
    precision: 14,
    scale: 2,
    default: 0,
  })
  paidAmount: string;

  @Column({ nullable: true, length: 240 })
  description?: string;

  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
