import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { UtilitiesService } from './utilities.service';

@Module({
  imports: [HttpModule],
  providers: [UtilitiesService],
  exports: [UtilitiesService],
})
export class UtilsModule {}
