import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ExpressAdapter } from '@bull-board/express';
import { BullBoardModule } from '@bull-board/nestjs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';

import { OpenaiModule } from 'src/openai/openai.module';
import { RssPrismaModule } from 'src/rssPrisma/rss.module';
import { UtilsModule } from 'src/utilities/utilities.module';
import { ArticleModule } from 'src/utilities/article/article.module';

import { QueueMessagesProcessor } from './queueMessages.processor';
import { QueueRssProcessor } from './queueRss.processor';
import { QueuesService } from './queues.service';

@Module({
  imports: [
    UtilsModule,
    OpenaiModule,
    ArticleModule,
    RssPrismaModule,
    BullModule.registerQueue({
      name: 'rss',
    }),
    BullBoardModule.forFeature({
      name: 'rss',
      adapter: BullMQAdapter,
    }),
    BullModule.registerQueue({
      name: 'messages',
    }),
    BullBoardModule.forFeature({
      name: 'messages',
      adapter: BullMQAdapter,
    }),
    BullModule.forRootAsync({
      imports: [
        ConfigModule.forRoot({
          envFilePath: ['.env', `.env.${process.env.NODE_ENV}.local`],
        }),
      ],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
        },
      }),
    }),
    BullBoardModule.forRoot({
      route: '/queues',
      adapter: ExpressAdapter,
    }),
  ],
  providers: [QueuesService, QueueRssProcessor, QueueMessagesProcessor],
  exports: [QueuesService],
})
export class QueuesModule {}
