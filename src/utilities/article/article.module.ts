import { Module } from '@nestjs/common';

import { ArticleService } from './article.service';
import { UtilsModule } from '../utilities.module';

@Module({
  imports: [UtilsModule],
  exports: [ArticleService],
  providers: [ArticleService],
})
export class ArticleModule {}
