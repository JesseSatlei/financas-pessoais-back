import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CategoryEntity } from '../categories/category.entity';
import { EntryEntity } from '../entries/entry.entity';
import { SubscriptionEntity } from '../subscription/subscription.entity';

export type UserRole = 'user' | 'admin';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 120 })
  name: string;

  @Column({ unique: true, length: 160 })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ default: false })
  approved: boolean;

  @Column({ type: 'varchar', length: 16, default: 'user' })
  role: UserRole;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => CategoryEntity, (category) => category.user)
  categories: CategoryEntity[];

  @OneToMany(() => EntryEntity, (entry) => entry.user)
  entries: EntryEntity[];

  @OneToOne(() => SubscriptionEntity, (subscription) => subscription.user)
  subscription?: SubscriptionEntity;
}
