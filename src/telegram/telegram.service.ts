import { Injectable, Logger } from '@nestjs/common';
import { User, Rss, LangCode } from '@prisma/client';

import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram';

import * as RssErrors from 'src/rssPrisma/rss.errors';
import * as RssInterfaces from 'src/rssPrisma/rss.interfaces';

import { RssService } from 'src/rssPrisma/rss.service';
import { QueuesService } from 'src/queues/queues.service';
import { UtilitiesService } from 'src/utilities/utilities.service';
import { ValidationService } from 'src/utilities/validation/validation.service';

import * as AppErrors from './telegram.errors';
import * as Interfaces from './telegram.interfaces';

// TODO - reply with "Processing..." message when user adds RSS feed
// TODO - remove forward slash from the end of the URL if it exists

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private readonly filePath: string = 'src/telegram/markdowns';

  constructor(
    private readonly rssService: RssService,
    private readonly queuesService: QueuesService,
    private readonly utilitiesService: UtilitiesService,
    private readonly validationService: ValidationService,
  ) {}

  private verifyUserRssLimit(
    user: RssInterfaces.UserWithRssAndSetting,
  ): number {
    this.logger.log(`Checking RSS limit for user with id: ${user.id}`);
    const rssLimit = 10;
    const hasReachedRssLimit = user.Rss.length >= rssLimit;
    const availableRssCapacity = rssLimit - user.Rss.length;

    this.logger.log(
      `Rss Limit reached: ${hasReachedRssLimit} for user with id: ${user.id}`,
    );

    if (hasReachedRssLimit) {
      throw new AppErrors.UserRssLimitError(user.chatId);
    }

    return availableRssCapacity;
  }

  async addUserRssFeed(chatId: User['chatId'], text: string) {
    try {
      this.validationService.validateUserCommand(text);

      const commandFormat = /^\/add_rss\s+(\S+)\s+(\S+)\s+(\S+)$/;
      const [, channelId, feedName, url] = text.match(commandFormat);

      this.validationService.validateChatId(channelId);
      const chat = await this.utilitiesService.verifyChatExistence(channelId);
      this.validationService.validateFeedName(feedName);
      this.validationService.validateUrl(url);

      this.logger.log(`Checking if Rss url is available: ${url}`);
      await this.utilitiesService.getParsedRssFeeds(url);
      this.logger.log(`Rss url is available: ${url}`);

      const user = await this.rssService.getUser(chatId);

      this.verifyUserRssLimit(user);

      const currentRss = await this.rssService.getRss({
        url,
        channelId,
        userId: user.id,
        // @ts-expect-error - The expected type comes from property 'deletedAt' which is declared here on type 'Partial<{ id: string; userId: string; url: string; name: string; channelId: string; channelTitle: string; lastPubDate: Date; createdAt: Date; updatedAt: Date; deletedAt: Date; }>'
        deletedAt: { not: null },
      });

      let rss;
      if (currentRss) {
        rss = await this.rssService.updateRss(currentRss.id, {
          name: feedName,
          deletedAt: null,
          updatedAt: new Date(),
        });
      } else {
        rss = await this.rssService.createRss(
          user.id,
          feedName,
          url,
          channelId,
          // @ts-expect-error - Property 'title' does not exist on type 'ChatFromGetChat'
          chat.title,
        );
      }

      await this.queuesService.addCheckRssJob(rss.id);
      return rss;
    } catch (error) {
      this.logger.error(error);
      if (error instanceof RssErrors.UserNotFoundError) {
        await this.rssService.createUserWithSetting(chatId);
        return await this.addUserRssFeed(chatId, text);
      }
      throw error;
    }
  }
  async updateRssChannelTitle(
    channelId: Rss['channelId'],
    channelTitle: Rss['channelTitle'],
  ) {
    const rss = await this.rssService.getRss({ channelId, deletedAt: null });
    await this.rssService.updateRss(rss.id, {
      channelTitle,
      updatedAt: new Date(),
    });
  }
  async updateUserLanguageSetting(
    chatId: string,
    langCode: LangCode,
  ): Promise<string> {
    const user = await this.rssService.getUser(chatId);

    const settings = await this.rssService.updateSetting(user.settingId, {
      langCode,
    });

    return this.utilitiesService.getIso6391Name(settings.langCode);
  }
  async handleDeleteRss(
    chatId: string,
    callbackData: string,
  ): Promise<{ text: string; inlineKeyboard: InlineKeyboardButton[][] }> {
    const regex = /^delete_rss_([0-9a-f]+)$/;
    const [, rssId] = callbackData.match(regex);

    const user = await this.rssService.getUser(chatId);
    const rss = await this.rssService.deleteRss(user.id, rssId);
    await this.queuesService.deleteCheckRssJob(rss.id);

    const text = `${rss.name} RSS feed has been successfully deleted from "${rss.channelTitle}" Channel!`;
    const inlineKeyboard = [
      [{ text: '\u{00AB} Back to Rss list', callback_data: 'my_rss' }],
    ];

    return { text, inlineKeyboard };
  }
  async handleDeleteAllUserRss(chatId: string) {
    const user = await this.rssService.getUser(chatId);
    await this.queuesService.deleteAllUserCheckRssJobs(user.id);
    await this.rssService.deleteAllUserRss(user.id);
  }
  async handleGetRssList(
    chatId: string,
  ): Promise<{ text: string; inlineKeyboard: InlineKeyboardButton[][] }> {
    const user = await this.rssService.getUser(chatId);
    const rssFeeds = await this.rssService.getAllUserRss(user.id);
    const availableRssCapacity = this.verifyUserRssLimit(user);
    const text = [
      `Select RSS feed from the list below (Rss name / Channel title):`,
      `You can add up to ${availableRssCapacity} more RSS feeds`,
    ].join('\n\n');
    const inlineKeyboard = this.utilitiesService.formatRssFeeds(rssFeeds);

    inlineKeyboard.push([
      {
        text: 'Delete All Rss \u{1F5D1}',
        callback_data: 'confirm_delete_all_rss',
      },
    ]);

    return { text, inlineKeyboard };
  }
  async handleSelectRss(
    callbackData: string,
  ): Promise<{ text: string; inlineKeyboard: InlineKeyboardButton[][] }> {
    const regex = /^select_rss_([0-9a-f]+)$/;
    const [, rssId] = callbackData.match(regex);

    const rss = await this.rssService.getRss({ id: rssId, deletedAt: null });

    const text = [
      `Here is RSS feed information:\n`,
      `Name: ${rss.name}`,
      `Url: ${rss.url}\n`,
      `Channel title: ${rss.channelTitle}`,
    ].join('\n');

    const inlineKeyboard = [
      [
        {
          text: 'Delete Rss \u{1F5D1}',
          callback_data: `confirm_delete_rss_${rss.id}`,
        },
        { text: 'Edit Rss (Not available)', callback_data: 'edit_rss' },
      ],
      [{ text: '\u{00AB} Back to Rss list', callback_data: 'my_rss' }],
    ];

    return { text, inlineKeyboard };
  }
  async handleConfirmDeleteRss(
    callbackData: string,
  ): Promise<{ text: string; inlineKeyboard: InlineKeyboardButton[][] }> {
    const regex = /^confirm_delete_rss_([0-9a-f]+)$/;
    const [, rssId] = callbackData.match(regex);

    const rss = await this.rssService.getRss({ id: rssId, deletedAt: null });

    const text = `Are you sure you want to delete ${rss.name} RSS feed from "${rss.channelTitle}" channel?`;

    const inlineKeyboard = [
      [
        {
          text: 'Yes, delete Rss \u{1F5D1}',
          callback_data: `delete_rss_${rss.id}`,
        },
        { text: 'No', callback_data: `select_rss_${rss.id}` },
      ],
      [{ text: '\u{00AB} Back to Rss', callback_data: `select_rss_${rss.id}` }],
    ];

    return { text, inlineKeyboard };
  }
  async enableTranslation(chatId: string): Promise<{ message: string }> {
    const user = await this.rssService.getUser(chatId);

    if (user.setting.enableTranslation) {
      throw new AppErrors.TranslationAlreadyEnabledError(chatId);
    }

    const setting = await this.rssService.updateSetting(user.settingId, {
      enableTranslation: true,
    });

    const language = this.utilitiesService.getIso6391Name(setting.langCode);

    return {
      message: `Translation successfully enabled \u{2705} \n\n Current language: ${language}`,
    };
  }
  async disableTranslation(chatId: string) {
    const user = await this.rssService.getUser(chatId);

    if (!user.setting.enableTranslation) {
      throw new AppErrors.TranslationAlreadyDisabledError(chatId);
    }

    await this.rssService.updateSetting(user.settingId, {
      enableTranslation: false,
    });
  }
  async getMessage(fileName: string): Promise<Interfaces.TelegramMessage> {
    return await this.utilitiesService.loadMdFile(this.filePath, fileName);
  }
  async getSetLanguageMessage(chatId: string): Promise<{
    text: string;
    inline_keyboard: { text: string; callback_data: string }[][];
  }> {
    const inline_keyboard = [
      [
        { text: 'English \u{1F1FA}\u{1F1F8}', callback_data: 'en' },
        { text: 'Russian \u{1F1F7}\u{1F1FA}', callback_data: 'ru' },
        { text: 'Spanish \u{1F1EA}\u{1F1F8}', callback_data: 'es' },
      ],
      [
        { text: 'French \u{1F1EB}\u{1F1F7}', callback_data: 'fr' },
        { text: 'German \u{1F1E9}\u{1F1EA}', callback_data: 'de' },
        { text: 'Japanese \u{1F1EF}\u{1F1F5}', callback_data: 'ja' },
      ],
      [
        { text: 'Italian \u{1F1EE}\u{1F1F9}', callback_data: 'it' },
        { text: 'Portuguese \u{1F1F5}\u{1F1F9}', callback_data: 'pt' },
        { text: 'Chinese \u{1F1E8}\u{1F1F3}', callback_data: 'zh' },
      ],
    ];
    const user = await this.rssService.getUser(chatId);

    const langCode = user.setting.langCode;
    const enableTranslation = user.setting.enableTranslation;

    const language = this.utilitiesService.getIso6391Name(langCode);

    const translationStatus = enableTranslation
      ? 'Enabled \u{2705}'
      : 'Disabled \u{26D4}';
    const instructions = enableTranslation
      ? `Click button below to disable translation`
      : `Click button below to enable translation`;

    const text =
      `Select language below for RSS Feed content translation\n\n` +
      `Current language: ${language}\n` +
      `Translation: ${translationStatus}\n\n` +
      `${instructions}`;

    if (enableTranslation) {
      inline_keyboard.unshift([
        { text: 'Disable translation', callback_data: 'disable_translation' },
      ]);
    } else {
      inline_keyboard.unshift([
        { text: 'Enable translation', callback_data: 'enable_translation' },
      ]);
    }

    return { text, inline_keyboard };
  }
}
