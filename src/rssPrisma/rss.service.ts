import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  Rss,
  User,
  Prisma,
  Setting,
  LangCode,
  PrismaClient,
} from '@prisma/client';

import * as RssErrors from 'src/rssPrisma/rss.errors';
import * as RssInterfaces from 'src/rssPrisma/rss.interfaces';
import { UtilitiesService } from 'src/utilities/utilities.service';

// TODO - validate all data before saving to the database

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super();
  }

  async onModuleInit() {
    await this.checkConnection();
  }

  private async checkConnection(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('Successfully connected to the database.');
    } catch (error) {
      this.logger.error('Failed to connect to the database.', error);
      // Handle the error as needed (e.g., retry connection, log error, terminate application)
    }
  }
}

@Injectable()
export class RssService {
  private readonly logger = new Logger(RssService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly utilitiesService: UtilitiesService,
  ) {}

  async getLastRssPublicationDate(
    url: string,
    userId: string,
    channelId: string,
  ): Promise<Date> {
    this.logger.log(`Generating last pub date for RSS feed with URL: ${url}`);
    const feeds = await this.utilitiesService.getParsedRssFeeds(url);
    let lastPubDate = new Date(feeds[feeds.length - 1].isoDate);

    const latestRss = await this.prisma.rss.findFirst({
      where: { userId, channelId, url },
      orderBy: { lastPubDate: 'desc' },
    });

    if (latestRss && new Date(latestRss.lastPubDate) > new Date(lastPubDate)) {
      lastPubDate = latestRss.lastPubDate;
    }
    this.logger.log(`Last pub date for RSS feed: ${lastPubDate}`);

    return lastPubDate;
  }

  async createRss(
    userId: User['id'],
    name: Rss['name'],
    url: Rss['url'],
    channelId: Rss['channelId'],
    channelTitle: Rss['channelTitle'],
  ): Promise<RssInterfaces.RssWithUserAndSetting> {
    this.logger.log(`Creating new ${name} Rss Feed for user: ${userId}`);
    try {
      const lastPubDate = await this.getLastRssPublicationDate(
        url,
        userId,
        channelId,
      );

      const rss = await this.prisma.rss.create({
        data: {
          url,
          name,
          userId,
          channelId,
          lastPubDate,
          channelTitle,
          deletedAt: null,
        },
        include: {
          user: { include: { setting: true } },
        },
      });

      this.logger.log(`Rss feed successfully added with ID: ${rss.id}`);

      return rss;
    } catch (error) {
      this.logger.error(`Failed to crete ${name} RSS for user_id: ${userId}`);

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        switch (error.meta?.target) {
          case 'Rss_channel_id_url_deleted_at_key':
            throw new RssErrors.RssFeedUrlExistsError(userId);
          case 'Rss_channel_id_name_deleted_at_key':
            throw new RssErrors.RssFeedNameExistsError(userId);
          default:
            throw new RssErrors.RssFeedExistsError(userId);
        }
      }

      this.logger.error(error);
      throw error;
    }
  }
  async getRss(
    where: Partial<Rss>,
  ): Promise<RssInterfaces.RssWithUserAndSetting> {
    this.logger.log(`Fetching Rss where: ${JSON.stringify(where)}`);
    try {
      const rss = await this.prisma.rss.findFirst({
        where,
        include: { user: { include: { setting: true } } },
      });

      this.logger.log(`Rss successfully fetched: ${JSON.stringify(rss)}`);

      return rss;
    } catch (error) {
      this.logger.error(error);
      this.logger.error(`Failed to fetch Rss where: ${JSON.stringify(where)}`);
      throw error;
    }
  }
  async getAllRss(): Promise<RssInterfaces.RssWithUserAndSetting[]> {
    this.logger.log(`Fetching all RSS feeds`);
    try {
      const rssFeeds: RssInterfaces.RssWithUserAndSetting[] =
        await this.prisma.rss.findMany({
          where: { deletedAt: null },
          include: { user: { include: { setting: true } } },
        });

      if (rssFeeds.length === 0) {
        throw new RssErrors.RssFeedsNotFoundError('');
      }

      this.logger.log(`Fetched ${rssFeeds.length} RSS feeds`);

      return rssFeeds;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
  async getAllUserRss(
    userId: User['id'],
  ): Promise<RssInterfaces.RssWithUserAndSetting[]> {
    this.logger.log(`Fetching all RSS feeds for user with ID: ${userId}`);
    try {
      const rssFeeds = await this.prisma.rss.findMany({
        where: { deletedAt: null, userId },
        include: { user: { include: { setting: true } } },
      });

      if (rssFeeds.length === 0) {
        throw new RssErrors.RssFeedsNotFoundError(userId);
      }

      this.logger.log(
        `Found ${rssFeeds.length} RSS feeds for user with ID: ${userId}`,
      );

      return rssFeeds;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
  async updateRss(
    rssId: Rss['id'],
    data: Partial<Rss>,
  ): Promise<RssInterfaces.RssWithUserAndSetting> {
    this.logger.log(`Starting to update RSS with ID: ${rssId}`);
    try {
      const rss = await this.prisma.rss.update({
        data,
        where: { id: rssId },
        include: {
          user: {
            include: { setting: true },
          },
        },
      });

      this.logger.log(`RSS successfully updated with ID: ${rssId}`);
      return rss;
    } catch (error) {
      this.logger.error(`Failed to update Rss with ID: ${rssId}`);
      this.logger.error(error);
      throw error;
    }
  }
  async deleteRss(userId: User['id'], rssId: Rss['id']): Promise<Rss> {
    this.logger.log(`Deleting RSS feed with ID: ${rssId}`);
    try {
      const rss = await this.getRss({ id: rssId, userId, deletedAt: null });

      await this.prisma.rss.update({
        data: { deletedAt: new Date(), updatedAt: new Date() },
        where: { id: rss.id },
      });

      this.logger.log(`RSS feed successfully deleted with ID: ${rss.id}`);
      return rss;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
  async deleteAllUserRss(userId: User['id']) {
    this.logger.log(
      `Softly deleting all registered RSS feeds for user with ID: ${userId}`,
    );
    try {
      const result = await this.prisma.rss.updateMany({
        where: {
          userId,
          deletedAt: null,
        },
        data: { deletedAt: new Date(), updatedAt: new Date() },
      });

      if (result.count === 0) {
        throw new RssErrors.RssFeedsNotFoundError(userId);
      }

      this.logger.log(
        `${result.count} RSS feeds successfully deleted for user with ID: ${userId}`,
      );
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async createUserWithSetting(chatId: User['chatId']): Promise<User> {
    this.logger.log(`Creating User and Setting with chat_id: ${chatId}`);
    try {
      const user = await this.prisma.user.create({
        data: {
          chatId,
          deletedAt: null,
          setting: {
            create: {
              langCode: LangCode.en,
              deletedAt: null,
            },
          },
        },
      });
      this.logger.log(`User and Setting created with user.id: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error(
        `Failed to create User and Setting with chat_id: ${chatId}`,
      );
      this.logger.error(error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new RssErrors.UserAlreadyExistsError(chatId);
        }
      }

      throw error;
    }
  }
  async getUser(
    chatId: User['chatId'],
  ): Promise<RssInterfaces.UserWithRssAndSetting> {
    this.logger.log(`Fetching user with chat_id: ${chatId}`);
    try {
      const user = await this.prisma.user.findFirst({
        where: { chatId, deletedAt: null },
        include: { setting: true, Rss: { where: { deletedAt: null } } },
      });

      if (!user) throw new RssErrors.UserNotFoundError(chatId);

      this.logger.log(`User successfully fetched with ID: ${user.id}`);

      return user;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
  async updateSetting(
    id: Setting['id'],
    data: Partial<Setting>,
  ): Promise<RssInterfaces.SettingWithUser> {
    this.logger.log(`Updating setting with ID: ${id}`);
    try {
      const setting = await this.prisma.setting.update({
        data,
        where: { id, deletedAt: null },
        include: { user: true },
      });

      this.logger.log(`Setting successfully updated with ID: ${id}`);
      return setting;
    } catch (error) {
      this.logger.error(`Failed to update setting with ID: ${id}`);
      this.logger.error(error);
      throw error;
    }
  }
}
