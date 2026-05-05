import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import type { SignOptions } from 'jsonwebtoken';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { CategoryEntity } from './categories/category.entity';
import { CategoriesController } from './categories/categories.controller';
import { CategoriesService } from './categories/categories.service';
import { EntryEntity } from './entries/entry.entity';
import { EntriesController } from './entries/entries.controller';
import { EntriesService } from './entries/entries.service';
import { SubscriptionEntity } from './subscription/subscription.entity';
import { SubscriptionController } from './subscription/subscription.controller';
import { SubscriptionService } from './subscription/subscription.service';
import { UserEntity } from './users/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: Number(config.get<string>('DB_PORT', '5433')),
        username: config.get<string>('DB_USERNAME', 'financas'),
        password: config.get<string>('DB_PASSWORD', 'financas'),
        database: config.get<string>('DB_DATABASE', 'financas'),
        entities: [UserEntity, CategoryEntity, EntryEntity, SubscriptionEntity],
        synchronize: config.get<string>('DB_SYNCHRONIZE', 'true') === 'true',
      }),
    }),
    TypeOrmModule.forFeature([
      UserEntity,
      CategoryEntity,
      EntryEntity,
      SubscriptionEntity,
    ]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => ({
        secret: config.get<string>('JWT_SECRET', 'dev-secret-change-me'),
        signOptions: {
          expiresIn: config.get<string>(
            'JWT_EXPIRES_IN',
            '7d',
          ) as SignOptions['expiresIn'],
        },
      }),
    }),
  ],
  controllers: [
    AppController,
    AuthController,
    CategoriesController,
    EntriesController,
    SubscriptionController,
  ],
  providers: [
    AppService,
    AuthService,
    CategoriesService,
    EntriesService,
    SubscriptionService,
  ],
})
export class AppModule {}
