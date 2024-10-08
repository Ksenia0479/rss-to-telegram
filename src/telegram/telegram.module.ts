import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { TelegrafModule } from 'nestjs-telegraf';

import { QueuesModule } from 'src/queues/queues.module';
import { OpenaiModule } from 'src/openai/openai.module';
import { RssPrismaModule } from 'src/rssPrisma/rss.module';
import { UtilsModule } from 'src/utilities/utilities.module';
import { ArticleModule } from 'src/utilities/article/article.module';
import { ValidationModule } from 'src/utilities/validation/validation.module';

import { AppUpdate } from './telegram.update';
import { AppService } from './telegram.service';

@Module({
  imports: [
    UtilsModule,
    QueuesModule,
    OpenaiModule,
    ArticleModule,
    RssPrismaModule,
    ValidationModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      envFilePath: ['.env', `.env.${process.env.NODE_ENV}.local`],
    }),
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        token: configService.get<string>('TELEGRAM_BOT_TOKEN'),
      }),
    }),
  ],
  providers: [AppService, AppUpdate],
  exports: [AppService],
})
export class AppModule {}
