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
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AdminModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const databaseUrl = config.get<string>('DATABASE_URL');
        const synchronize = config.get<string>('DB_SYNCHRONIZE', 'true') === 'true';

        const sslEnabled =
          !!databaseUrl || config.get<string>('DB_SSL', 'false') === 'true';
        const ssl = sslEnabled ? { rejectUnauthorized: false } : undefined;

        const entities = [UserEntity, CategoryEntity, EntryEntity, SubscriptionEntity];

        if (databaseUrl) {
          return {
            type: 'postgres',
            url: databaseUrl,
            ssl,
            entities,
            synchronize,
          };
        }

        return {
          type: 'postgres',
          host: config.get<string>('DB_HOST', 'localhost'),
          port: Number(config.get<string>('DB_PORT', '5433')),
          username: config.get<string>('DB_USERNAME', 'financas'),
          password: config.get<string>('DB_PASSWORD', 'financas'),
          database: config.get<string>('DB_DATABASE', 'financas'),
          ssl,
          entities,
          synchronize,
        };
      },
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
