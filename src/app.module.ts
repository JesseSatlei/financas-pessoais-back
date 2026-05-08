import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoryEntity } from './categories/category.entity';
import { CategoriesController } from './categories/categories.controller';
import { CategoriesService } from './categories/categories.service';
import { DebtEntity } from './debts/debt.entity';
import { DebtsController } from './debts/debts.controller';
import { DebtsService } from './debts/debts.service';
import { EntryEntity } from './entries/entry.entity';
import { EntriesController } from './entries/entries.controller';
import { EntriesService } from './entries/entries.service';
import { PeopleController } from './people/people.controller';
import { PersonEntity } from './people/person.entity';
import { PeopleService } from './people/people.service';
import { RecurringBillEntity } from './recurring-bills/recurring-bill.entity';
import { RecurringBillsController } from './recurring-bills/recurring-bills.controller';
import { RecurringBillsService } from './recurring-bills/recurring-bills.service';
import { SubscriptionEntity } from './subscription/subscription.entity';
import { SubscriptionController } from './subscription/subscription.controller';
import { SubscriptionService } from './subscription/subscription.service';
import { UserEntity } from './users/user.entity';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AdminModule,
    AuthModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const databaseUrl = config.get<string>('DATABASE_URL');
        const synchronize =
          config.get<string>('DB_SYNCHRONIZE', 'true') === 'true';

        const sslEnabled =
          !!databaseUrl || config.get<string>('DB_SSL', 'false') === 'true';
        const ssl = sslEnabled ? { rejectUnauthorized: false } : undefined;

        const entities = [
          UserEntity,
          CategoryEntity,
          EntryEntity,
          DebtEntity,
          RecurringBillEntity,
          PersonEntity,
          SubscriptionEntity,
        ];

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
      DebtEntity,
      RecurringBillEntity,
      PersonEntity,
      SubscriptionEntity,
    ]),
  ],
  controllers: [
    AppController,
    CategoriesController,
    EntriesController,
    DebtsController,
    RecurringBillsController,
    PeopleController,
    SubscriptionController,
  ],
  providers: [
    AppService,
    CategoriesService,
    EntriesService,
    DebtsService,
    RecurringBillsService,
    PeopleService,
    SubscriptionService,
  ],
})
export class AppModule {}
