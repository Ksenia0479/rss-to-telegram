import { Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';

import { Job } from 'bullmq';

import * as RssErrors from 'src/rssPrisma/rss.errors';
import * as UtilitiesErrors from 'src/utilities/utilities.errors';

import { QueuesService } from './queues.service';

@Processor('rss')
export class QueueRssProcessor extends WorkerHost {
  private readonly logger = new Logger(QueueRssProcessor.name);

  constructor(private readonly queuesService: QueuesService) {
    super();
  }

  async process(job: Job<{ rssId: string }>): Promise<void> {
    this.logger.log(
      `Starting to process job with a name: ${job.name} and ID: ${job.id}`,
    );
    switch (job.name) {
      case 'check-rss-feed': {
        const rssId = job.data.rssId;
        this.logger.log(`Starting to process job for Rss with ID: ${job.id}`);
        try {
          const res = await this.queuesService.handleCheckRssJobProcess(rssId);
          await job.log(res.message);
          this.logger.log(`Finished processing job for Rss with ID: ${rssId}`);
        } catch (error) {
          if (error instanceof RssErrors.NoNewItemsError) {
            const message = `No new items found for Rss with ID: ${rssId}`;
            this.logger.log(message);
            await job.log(message);
            return;
          }
          if (error instanceof RssErrors.RssFeedNotFoundError) {
            const message = `Rss with ID: ${rssId} not found`;
            this.logger.error(message);
            await job.log(message);
            return;
          }
          if (error instanceof UtilitiesErrors.UnencodedError) {
            const message = `Error is not encoded for Rss with ID: ${rssId}`;
            this.logger.error(message);
            await job.log(message);
            return;
          }
          await job.log(error);
          this.logger.error(`Error processing job for Rss with ID: ${rssId}`);
          this.logger.error(error);
        }
        break;
      }
    }
  }
}
