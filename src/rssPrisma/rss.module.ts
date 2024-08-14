import { Module } from '@nestjs/common';

import { UtilsModule } from 'src/utilities/utilities.module';

import { RssService, PrismaService } from './rss.service';

@Module({
  imports: [UtilsModule],
  providers: [RssService, PrismaService],
  exports: [RssService],
})
export class RssPrismaModule {}
