import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Rss, User, LangCode } from '@prisma/client';
import { InjectQueue } from '@nestjs/bullmq';

import { Queue } from 'bullmq';
import { Item } from 'rss-parser';
import { Telegraf } from 'telegraf';
import { InjectBot } from 'nestjs-telegraf';

import * as RssErrors from 'src/rssPrisma/rss.errors';
import * as UtilitiesErrors from 'src/utilities/utilities.errors';
import { RssService } from 'src/rssPrisma/rss.service';
import { OpenaiService } from 'src/openai/openai.service';
import { UtilitiesService } from 'src/utilities/utilities.service';
import { ArticleService } from 'src/utilities/article/article.service';

@Injectable()
export class QueuesService implements OnModuleInit {
  private readonly logger = new Logger(QueuesService.name);
  private readonly checkRssFeedJob = 'check-rss-feed';
  private readonly sendMessageJob = 'send-message';
  private readonly repeatJobEvery = 500000;

  constructor(
    private readonly rssService: RssService,
    private readonly openaiService: OpenaiService,
    private readonly articleService: ArticleService,
    private readonly utilitiesService: UtilitiesService,
    @InjectBot() private readonly bot: Telegraf,
    @InjectQueue('rss') private readonly rssQueue: Queue,
    @InjectQueue('messages') private readonly messagesQueue: Queue,
  ) {}

  async onModuleInit() {
    await this.handleAllCheckRssJobs();
  }

  async handleAllCheckRssJobs() {
    try {
      const rssFeeds = await this.rssService.getAllRss();

      this.logger.log('Fetching all repeatable jobs from the queue');
      const repeatableJobs = await this.rssQueue.getRepeatableJobs();
      const repeatableJobIds = repeatableJobs.map((job) => job.id);
      this.logger.log(`Found ${repeatableJobs.length} repeatable jobs`);

      this.logger.log('Checking if all feeds are added to the queue');
      for (const rss of rssFeeds) {
        const isFeedJobAddedToQueue = repeatableJobIds.includes(rss.id);
        if (!isFeedJobAddedToQueue) {
          this.logger.log(`Check Rss job not found for rss with id: ${rss.id}`);
          await this.addCheckRssJob(rss.id);
        }
      }

      this.logger.log(
        'Checking if any check rss jobs needs to be removed from the queue',
      );
      for (const job of repeatableJobs) {
        const isFeedDeleted = !rssFeeds.some((feed) => feed.id === job.id);
        if (isFeedDeleted) {
          this.logger.log(`Check Rss job needs to be removed: ${job.id}`);
          await this.deleteCheckRssJob(job.id);
        }
      }

      this.logger.log('All RSS feeds have been successfully checked');
    } catch (error) {
      if (error instanceof RssErrors.RssFeedsNotFoundError) {
        this.logger.log(`No Rss feeds found in the database`);
      }
    }
  }
  async handleCheckRssJobProcess(
    rssId: Rss['id'],
  ): Promise<{ message: string }> {
    const rss = await this.rssService.getRss({ id: rssId, deletedAt: null });

    if (!rss) {
      throw new RssErrors.RssFeedNotFoundError(rssId);
    }

    try {
      await this.utilitiesService.verifyChatExistence(rss.channelId);

      this.logger.log(`Start checking RSS with name: ${rss.name}`);
      this.logger.log(`For user with ID: ${rss.userId}`);

      const rssFeeds = await this.utilitiesService.getParsedRssFeeds(rss.url);
      const unpostedFeedItems = filterItems(rssFeeds, rss.lastPubDate);

      if (unpostedFeedItems.length === 0) {
        throw new RssErrors.NoNewItemsError(rss.name);
      }

      const message = `Found ${unpostedFeedItems.length} unposted items for feed: ${rss.name}`;
      this.logger.log(message);

      for (const item of unpostedFeedItems) {
        await this.addSendMessageJob(rss.id, item);
      }
      // TODO - replace .reverse() with sorting by date
      function filterItems(items: Item[], lastPubDate: Date) {
        return items
          .reverse()
          .filter((item) => new Date(item.isoDate) > new Date(lastPubDate));
      }

      return { message };
    } catch (error) {
      if (
        error instanceof UtilitiesErrors.BotKickedFromChatError ||
        error instanceof UtilitiesErrors.BotIsNotMemberOfChatError
      ) {
        const message = `${rss.name} rss feed has been deleted!\n\nPlease add @ai_rss_to_telegram_bot to the channel with ID: ${rss.channelId}`;
        await this.deleteCheckRssJob(rss.id);
        await this.rssService.deleteRss(rss.userId, rss.id);
        await this.bot.telegram.sendMessage(rss.user.chatId, message);
      }

      if (error instanceof UtilitiesErrors.ChatNotFoundError) {
        const message = `${rss.name} rss feed has been deleted!\n\nChannel with ID ${rss.channelId} doesn't exist anymore.`;
        await this.deleteCheckRssJob(rss.id);
        await this.rssService.deleteRss(rss.userId, rss.id);
        await this.bot.telegram.sendMessage(rss.user.chatId, message);
      }

      throw error;
    }
  }
  async deleteAllUserCheckRssJobs(userId: User['id']) {
    this.logger.log(
      `Removing all check rss jobs from the queue for user: ${userId}`,
    );
    const rssFeeds = await this.rssService.getAllUserRss(userId);
    for (const rss of rssFeeds) {
      await this.deleteCheckRssJob(rss.id);
    }
    this.logger.log(
      `Removing all check rss jobs has been completed for user: ${userId}`,
    );
  }
  async addSendMessageJob(rssId: Rss['id'], feedItem: Item) {
    this.logger.log(`Adding send message job for item: ${feedItem.link}`);
    await this.messagesQueue.add(
      this.sendMessageJob,
      { feedItem, rssId },
      { delay: 50000 },
    );
    await new Promise((resolve) => setTimeout(resolve, 5000));
    this.logger.log(`Send message job added for item: ${feedItem.link}`);
  }
  async addCheckRssJob(rssId: Rss['id']) {
    this.logger.log(`Adding check rss job with ID: ${rssId}`);
    await this.rssQueue.add(
      this.checkRssFeedJob,
      { rssId },
      { repeat: { every: this.repeatJobEvery, key: rssId } },
    );
    this.logger.log(`Check rss job successfully added with ID: ${rssId}`);
  }
  async deleteCheckRssJob(rssId: Rss['id']) {
    this.logger.log(`Removing check rss job with ID: ${rssId}`);
    await this.rssQueue.removeRepeatableByKey(rssId);
    this.logger.log(`Check rss job successfully removed with ID: ${rssId}`);
  }

  private async prepareReplyTextMessage(
    item: Item,
    settings: {
      enableTranslation: boolean;
      langCode: LangCode;
    },
  ): Promise<{ title: string; text: string }> {
    const tLang = this.utilitiesService.getIso6391Name(settings.langCode);
    const article = await this.articleService.getArticleContent(item.link);
    const isLangDif = tLang.toLowerCase() !== article.language.toLowerCase();

    let articleData = { content: '' };
    if (article.text) {
      articleData = await this.openaiService.getContent('journalist', {
        content: { title: item.title, text: article.text, tags: '' },
        aLang: article.language,
      });
    }

    if (settings.enableTranslation && isLangDif) {
      const tTitle = await this.openaiService.getContent('translator', {
        content: item.title,
        aLang: article.language,
        tLang: tLang,
      });

      let tArticle = { content: '' };
      if (articleData.content) {
        tArticle = await this.openaiService.getContent('translator', {
          content: articleData.content,
          aLang: article.language,
          tLang: tLang,
        });
      }

      return {
        title: tTitle.content,
        text: tArticle.content,
      };
    }

    return { title: item.title, text: articleData.content };
  }

  async handleSendMessageJobProcess(rssId: Rss['id'], item: Item) {
    this.logger.log(
      `Starting to process and send article with url: ${item.link} for RSS with ID: ${rssId}`,
    );
    const rss = await this.rssService.getRss({ id: rssId, deletedAt: null });

    if (!rss) {
      throw new RssErrors.RssFeedNotFoundError(rssId);
    }

    const { enableTranslation, langCode } = rss.user.setting;

    const { title, text } = await this.prepareReplyTextMessage(item, {
      enableTranslation,
      langCode,
    });

    const caption = text
      ? `${title}\n\n${text}\n\n${item.link}`
      : `${title}\n\n${item.link}`;

    await this.bot.telegram.sendMessage(rss.channelId, caption);

    await this.rssService.updateRss(rss.id, {
      lastPubDate: new Date(item.isoDate),
      updatedAt: new Date(),
    });

    this.logger.log(`Article successfully sent to channel: ${rss.channelId}`);
  }
}
