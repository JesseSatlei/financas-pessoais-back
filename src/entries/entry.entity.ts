import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { EntryType } from '../domain/types';
import { UserEntity } from '../users/user.entity';

@Entity('entries')
export class EntryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  @Index()
  userId: string;

  @ManyToOne(() => UserEntity, (user) => user.entries, {
    onDelete: 'CASCADE',
  })
  user: UserEntity;

  @Column({ type: 'varchar', length: 20 })
  type: EntryType;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  amount: string;

  @Column({ length: 80 })
  category: string;

  @Column({ nullable: true, length: 240 })
  description?: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ nullable: true, length: 80 })
  account?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
