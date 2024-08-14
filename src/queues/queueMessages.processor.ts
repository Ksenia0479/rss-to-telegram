import { Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';

import { Job } from 'bullmq';
import { Item } from 'rss-parser';

import * as RssErrors from 'src/rssPrisma/rss.errors';
import * as UtilitiesErrors from 'src/utilities/utilities.errors';

import { QueuesService } from './queues.service';

@Processor('messages')
export class QueueMessagesProcessor extends WorkerHost {
  private readonly logger = new Logger(QueueMessagesProcessor.name);

  constructor(private readonly queuesService: QueuesService) {
    super();
  }

  async process(job: Job<{ rssId: string; feedItem: Item }>): Promise<void> {
    this.logger.log(
      `Starting to process job with a name: ${job.name} and ID: ${job.id}`,
    );
    switch (job.name) {
      case 'send-message': {
        const rssId = job.data.rssId;
        const feedItem = job.data.feedItem;
        try {
          await this.queuesService.handleSendMessageJobProcess(rssId, feedItem);
          await new Promise((resolve) => setTimeout(resolve, 5000));
        } catch (error) {
          if (error instanceof UtilitiesErrors.ServiceNotFoundError) {
            this.logger.error(error.message);
            await job.log(error.message);
            return;
          }
          if (error instanceof RssErrors.RssFeedNotFoundError) {
            const message = `Rss with ID: ${rssId} not found`;
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
