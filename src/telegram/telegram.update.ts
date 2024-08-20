import { Logger, Controller, Get } from '@nestjs/common';
import { LangCode } from '@prisma/client';

import { Context, deunionize } from 'telegraf';
import { Start, Update, On, Command } from 'nestjs-telegraf';

import * as RssErrors from 'src/rssPrisma/rss.errors';
import * as UtilitiesErrors from 'src/utilities/utilities.errors';
import * as ValidationErrors from 'src/utilities/validation/validation.errors';

import * as AppErrors from './telegram.errors';
import { AppService } from './telegram.service';

// TODO - add command on Stop and Block action
// TODO - Move all not constant values to constants
// TODO - Remove redundant error logging (looping)

@Update()
export class AppUpdate {
  private readonly logger = new Logger(AppUpdate.name);
  private readonly allowedLangCodes = [
    'en',
    'ru',
    'es',
    'fr',
    'de',
    'ja',
    'it',
    'pt',
    'zh',
  ];

  constructor(private readonly appService: AppService) {}

  @Start()
  async onStart(ctx: Context) {
    const chatId = ctx.message.chat.id.toString();
    this.logger.log(`Received /start command for chat_id: ${chatId}`);
    try {
      const message = await this.appService.getMessage('start.md');
      await ctx.reply(message.content);
      this.logger.log(
        `Successfully sent message on /start command for chat_id: ${chatId}`,
      );
    } catch (error) {
      this.logger.error(error);
      this.logger.error(
        `Failed to sent message on /start command for chat_id: ${chatId}`,
      );
      await ctx.reply(
        "Sorry, I'm having trouble processing your request for /start command right now.",
      );
    }
  }

  @Command('new_rss')
  async onNewRss(ctx: Context) {
    const chatId = ctx.message.chat.id.toString();
    this.logger.log(`Received /new_rss command for chat_id: ${chatId}`);
    try {
      const message = await this.appService.getMessage('newRss.md');
      await ctx.reply(message.content);
      this.logger.log(
        `Successfully sent message on /new_rss command for chat_id: ${chatId}`,
      );
    } catch (error) {
      this.logger.error(error);
      await ctx.reply(
        "Sorry, I'm having trouble processing your request for /new_rss command right now.",
      );
    }
  }

  @Command('add_rss')
  async onAddRss(ctx: Context) {
    const chatId = ctx.message.chat.id.toString();
    this.logger.log(`Received /add_rss command for chat_id: ${chatId}`);
    try {
      const text = deunionize(ctx.message).text;

      await ctx.reply(
        'Your request is being processed. This may take a moment. Thank you for your patience.',
      );

      const rss = await this.appService.addUserRssFeed(chatId, text);

      this.logger.log(
        `Completed processing /add_rss command for chat_id: ${chatId}`,
      );
      await ctx.reply(`Thanks! ${rss.name} RSS feed successfully added!`);
    } catch (error) {
      this.logger.error(error);
      this.logger.error(
        `Failed to process /add_rss command for chat_id: ${chatId}`,
      );

      if (
        error instanceof UtilitiesErrors.ChatNotFoundError ||
        error instanceof UtilitiesErrors.BotKickedFromChatError ||
        error instanceof UtilitiesErrors.BotIsNotMemberOfChatError
      ) {
        await ctx.reply(error.message);
        return;
      }

      if (error instanceof UtilitiesErrors.MemberListInaccessibleError) {
        await ctx.reply(
          'Bot is not a member of the channel chat. Please make sure the bot is an admin of the channel.',
        );
        return;
      }

      if (
        error instanceof UtilitiesErrors.UnencodedError ||
        error instanceof UtilitiesErrors.ServiceNotFoundError
      ) {
        await ctx.reply(
          'The RSS URL seems to be invalid. Please verify the URL and try again.',
        );
        return;
      }

      if (error instanceof ValidationErrors.InvalidCommandError) {
        await ctx.reply(
          'Please use the format:\n/add_rss [channel_id] [feed_name] [rss_url]',
        );
        return;
      }

      if (error instanceof ValidationErrors.InvalidChatIdError) {
        await ctx.reply(
          'Invalid channel ID format.\n\nMake sure ID starts with "-" or "@" prefix.',
        );
        return;
      }

      if (error instanceof ValidationErrors.InvalidFeedNameError) {
        await ctx.reply(
          'Invalid feed name format. Feed name should be alphanumeric and contain no special characters.',
        );
        return;
      }

      if (error instanceof ValidationErrors.InvalidUrlError) {
        await ctx.reply(
          'Invalid Rss url format.\nPlease make sure it starts with http:// or https:// protocol.',
        );
        return;
      }

      if (error instanceof RssErrors.RssFeedUrlExistsError) {
        await ctx.reply('Rss feed with the same URL already exists.');
        return;
      }

      if (error instanceof RssErrors.RssFeedNameExistsError) {
        await ctx.reply('Rss feed with the same name already exists.');
        return;
      }

      if (error instanceof RssErrors.RssFeedExistsError) {
        await ctx.reply(
          'An item with the same unique identifier already exists.',
        );
        return;
      }

      if (error instanceof AppErrors.UserRssLimitError) {
        const rssLimit = 10;
        await ctx.reply(`You can add up to ${rssLimit} RSS feeds only.`);
        return;
      }

      await ctx.reply(
        "Sorry, I couldn't process your request to add a RSS feed.",
      );
    }
  }

  @Command('my_rss')
  async onRssList(ctx: Context) {
    let chatId;
    const isMessage = !!ctx.message;
    const isCallbackQuery = !!ctx.callbackQuery;

    if (isMessage) {
      chatId = ctx.message.chat.id.toString();
    }
    if (isCallbackQuery) {
      chatId = ctx.callbackQuery.message.chat.id.toString();
    }

    this.logger.log(`Received /my_rss command for chat_id: ${chatId}`);
    try {
      const data = await this.appService.handleGetRssList(chatId);

      const reply_markup = {
        inline_keyboard: data.inlineKeyboard,
      };

      if (isMessage) {
        await ctx.sendMessage(data.text, { reply_markup });
      }
      if (isCallbackQuery) {
        await ctx.editMessageText(data.text, { reply_markup });
      }

      this.logger.log(
        `Successfully sent RSS names on /my_rss command for chat_id: ${chatId}`,
      );
    } catch (error) {
      this.logger.error(error);

      if (error instanceof RssErrors.RssFeedsNotFoundError) {
        await ctx.reply('No registered RSS feeds found!');
        return;
      }

      if (error instanceof RssErrors.UserNotFoundError) {
        await ctx.reply('Please add a RSS feed first!');
        return;
      }

      await ctx.reply(
        "Sorry, I couldn't process your request to get your Rss feeds.",
      );
    }
  }

  @Command('language')
  async onSetLanguage(ctx: Context) {
    const chatId = ctx.message.chat.id.toString();
    this.logger.log(`Received /language command for chat_id: ${chatId}`);
    try {
      const { text, inline_keyboard } =
        await this.appService.getSetLanguageMessage(chatId);

      await ctx.sendMessage(text, {
        reply_markup: {
          inline_keyboard,
        },
      });

      this.logger.log(
        `Successfully sent message on /language command for chat_id: ${chatId}`,
      );
    } catch (error) {
      this.logger.error(`Failed to process language command: ${error}`);

      if (error instanceof RssErrors.UserNotFoundError) {
        await ctx.reply('Please add a RSS feed first!');
        return;
      }
      await ctx.reply(
        "Sorry, I couldn't process your request to set a language for translation.",
      );
    }
  }

  @Command('get_channel_id')
  async onGetChannelId(ctx: Context) {
    const chatId = ctx.message.chat.id.toString();
    this.logger.log(`Received /get_channel_id command for chat_id: ${chatId}`);
    try {
      const message = await this.appService.getMessage('getChannelId.md');
      await ctx.reply(message.content);
      this.logger.log(
        `Successfully sent message on /get_channel_id command for chat_id: ${chatId}`,
      );
    } catch (error) {
      this.logger.error(error);
      await ctx.reply("Sorry, I'm having trouble processing your request.");
    }
  }

  async onSelectRss(ctx: Context) {
    const chatId = ctx.callbackQuery.message.chat.id.toString();
    const callbackData = deunionize(ctx.callbackQuery).data?.toLowerCase();

    this.logger.log(
      `Received select_rss command feed: ${callbackData} from chat_id: ${chatId}`,
    );

    try {
      const data = await this.appService.handleSelectRss(callbackData);

      await ctx.editMessageText(data.text, {
        reply_markup: { inline_keyboard: data.inlineKeyboard },
      });

      this.logger.log(
        `Successfully sent RSS feed information for chat_id: ${chatId}`,
      );
    } catch (error) {
      this.logger.error(error);

      this.logger.error(
        `Failed to process selected RSS feed: ${callbackData} for chat_id: ${chatId}`,
      );

      await ctx.editMessageText(
        "Sorry, I'm having trouble processing your request.",
      );
    }
  }

  async onConfirmDeleteRss(ctx: Context) {
    const chatId = ctx.callbackQuery.message.chat.id.toString();
    const callbackData = deunionize(ctx.callbackQuery).data?.toLowerCase();

    this.logger.log(
      `Received confirm_delete_rss command: ${callbackData} for chat_id: ${chatId}`,
    );

    try {
      const data = await this.appService.handleConfirmDeleteRss(callbackData);

      await ctx.editMessageText(data.text, {
        reply_markup: { inline_keyboard: data.inlineKeyboard },
      });

      this.logger.log(
        `Successfully processed confirm_delete_rss command: ${callbackData} for chat_id: ${chatId}`,
      );
    } catch (error) {
      this.logger.error(error);

      this.logger.error(
        `Failed to process confirm_delete_rss command: ${callbackData} for chat_id: ${chatId}`,
      );

      await ctx.editMessageText(
        "Sorry, I'm having trouble processing your request.",
      );
    }
  }

  async onDeleteRss(ctx: Context) {
    const chatId = ctx.callbackQuery.message.chat.id.toString();
    const callbackData = deunionize(ctx.callbackQuery).data?.toLowerCase();

    this.logger.log(
      `Received delete_rss command from user with chat_id: ${chatId}`,
    );

    try {
      const data = await this.appService.handleDeleteRss(chatId, callbackData);

      await ctx.editMessageText(data.text, {
        reply_markup: { inline_keyboard: data.inlineKeyboard },
      });

      this.logger.log(
        `Completed processing /delete_rss command for chat_id: ${chatId} `,
      );
    } catch (error) {
      this.logger.error(`Failed to delete RSS feed: ${error}`);

      if (error instanceof RssErrors.UserNotFoundError) {
        await ctx.editMessageText('Please add a RSS feed first!');
        return;
      }

      await ctx.editMessageText(
        "Sorry, I couldn't process your request to remove RSS feed.",
      );
    }
  }

  async onConfirmDeleteAllRss(ctx: Context) {
    const chatId = ctx.callbackQuery.message.chat.id.toString();
    const callbackData = deunionize(ctx.callbackQuery).data?.toLowerCase();

    this.logger.log(
      `Received confirm_delete_all_rss command for chat_id: ${chatId}`,
    );

    try {
      // const data = await this.appService.handleConfirmAllDeleteRss();

      const text = `Are you sure you want to delete all registered RSS feeds?`;

      const inlineKeyboard = [
        [
          {
            text: 'Yes, delete all Rss \u{1F5D1}',
            callback_data: 'delete_all_rss',
          },
          {
            text: 'No',
            callback_data: 'my_rss',
          },
        ],
        [{ text: '\u{00AB} Back to Rss list', callback_data: 'my_rss' }],
      ];

      await ctx.editMessageText(text, {
        reply_markup: { inline_keyboard: inlineKeyboard },
      });

      this.logger.log(
        `Successfully processed confirm_delete_all_rss command for chat_id: ${chatId}`,
      );
    } catch (error) {
      this.logger.error(error);

      this.logger.error(
        `Failed to process confirm_delete_all_rss command: ${callbackData} for chat_id: ${chatId}`,
      );

      await ctx.editMessageText(
        "Sorry, I'm having trouble processing your request.",
      );
    }
  }

  async onDeleteAllRss(ctx: Context) {
    const chatId = ctx.callbackQuery.message.chat.id.toString();
    this.logger.log(`Received /delete_all_rss command for chat_id: ${chatId}`);
    try {
      await this.appService.handleDeleteAllUserRss(chatId);
      await ctx.editMessageText(
        'All registered RSS feeds successfully removed!',
      );
    } catch (error) {
      this.logger.error(`Failed to delete all RSS feeds: ${error}`);
      if (error instanceof RssErrors.RssFeedsNotFoundError) {
        await ctx.editMessageText('No registered RSS feeds found!');
        return;
      }
      if (error instanceof RssErrors.UserNotFoundError) {
        await ctx.editMessageText('Please add a RSS feed first!');
        return;
      }
      await ctx.editMessageText(
        "Sorry, I couldn't process your request to remove all RSS feeds.",
      );
    }
  }

  async onUpdateLanguage(ctx: Context) {
    const chatId = ctx.callbackQuery.message.chat.id.toString();
    const callbackData = deunionize(ctx.callbackQuery).data?.toLowerCase();
    const langCode = callbackData as LangCode;

    this.logger.log(`Updating language: ${langCode} for chat_id: ${chatId}`);
    try {
      const language = await this.appService.updateUserLanguageSetting(
        chatId,
        langCode,
      );

      this.logger.log(
        `${language} language successfully updated for chat_id: ${chatId}`,
      );

      await ctx.reply(`Language successfully set: *${language}*`, {
        parse_mode: 'Markdown',
      });
    } catch (error) {
      this.logger.error(error);
      this.logger.error(`Failed to update language for chat_id: ${chatId}`);

      if (error instanceof RssErrors.UserNotFoundError) {
        await ctx.reply('Please add a RSS feed first!');
        ctx.answerCbQuery();
        return;
      }
      await ctx.reply(
        "Sorry, I couldn't process your request to set a language for translation.",
      );
    }
  }

  async onEnableTranslation(ctx: Context) {
    const chatId = ctx.callbackQuery.message.chat.id.toString();
    this.logger.log(
      `Received /enable_translation command for chat_id: ${chatId}`,
    );
    try {
      const response = await this.appService.enableTranslation(chatId);
      await ctx.reply(response.message);
      this.logger.log(
        `Completed processing /enable_translation command for chat_id: ${chatId}`,
      );
    } catch (error) {
      this.logger.error(error);

      if (error instanceof AppErrors.TranslationAlreadyEnabledError) {
        await ctx.reply('Translation is already enabled!');
        return;
      }
      if (error instanceof RssErrors.UserNotFoundError) {
        await ctx.reply('Please add a RSS feed first!');
        return;
      }

      await ctx.reply(
        "Sorry, I couldn't process your request to enable translation.",
      );
    }
    this.logger.log(
      `Completed processing /enable_translation command for chat_id: ${chatId}`,
    );
  }

  async onDisableTranslation(ctx: Context) {
    const chatId = ctx.callbackQuery.message.chat.id.toString();

    this.logger.log(
      `Received /disable_translation command for chat_id: ${chatId}`,
    );
    try {
      await this.appService.disableTranslation(chatId);
      await ctx.reply('Translation successfully disabled \u{26D4}');
    } catch (error) {
      this.logger.error(error);

      if (error instanceof AppErrors.TranslationAlreadyDisabledError) {
        await ctx.reply('Translation is already disabled!');
        return;
      }

      if (error instanceof RssErrors.UserNotFoundError) {
        await ctx.reply('Please add a RSS feed first!');
        return;
      }

      await ctx.reply(
        "Sorry, I couldn't process your request to disable translation.",
      );
    }
    this.logger.log(
      `Completed processing /disable_translation command for chat_id: ${chatId}`,
    );
  }

  @On('callback_query')
  async onCallbackQuery(ctx: Context) {
    const chatId = ctx.callbackQuery.message.chat.id.toString();
    const callbackData = deunionize(ctx.callbackQuery).data?.toLowerCase();

    this.logger.log(
      `Received callback query: ${callbackData} from chat_id: ${chatId}`,
    );

    if (callbackData === 'my_rss') {
      await this.onRssList(ctx);
    }

    if (callbackData.startsWith('select_rss')) {
      await this.onSelectRss(ctx);
    }

    if (callbackData.startsWith('confirm_delete_rss')) {
      await this.onConfirmDeleteRss(ctx);
    }

    if (callbackData.startsWith('delete_rss')) {
      await this.onDeleteRss(ctx);
    }

    if (callbackData.startsWith('confirm_delete_all_rss')) {
      await this.onConfirmDeleteAllRss(ctx);
    }

    if (callbackData === 'delete_all_rss') {
      await this.onDeleteAllRss(ctx);
    }

    if (this.allowedLangCodes.includes(callbackData)) {
      await this.onUpdateLanguage(ctx);
    }

    if (callbackData === 'enable_translation') {
      await this.onEnableTranslation(ctx);
    }

    if (callbackData === 'disable_translation') {
      await this.onDisableTranslation(ctx);
    }

    ctx.answerCbQuery();
  }

  async handleGetMyIdCommand(ctx: Context) {
    const message = deunionize(deunionize(ctx.update).channel_post);
    const messageText = message.text?.toLowerCase();
    const isPublic = !!message.chat.username;
    const getMyId = 'get my id';

    if (messageText === getMyId && !isPublic) {
      const chatId = message.chat.id.toString();

      this.logger.log(`Received "${getMyId}" command for chat_id: ${chatId}`);
      try {
        await ctx.reply(`Channel ID: *${chatId}*`, {
          parse_mode: 'Markdown',
        });
        this.logger.log(`Successfully sent chat_id: ${chatId}`);
      } catch (error) {
        this.logger.error(error);
        this.logger.error(
          `Failed to process "${getMyId}" command for chat_id: ${chatId}`,
        );
      }
    }
  }

  async handleChannelTitleUpdate(ctx: Context) {
    const message = deunionize(deunionize(ctx.update).channel_post);

    if (message.new_chat_title) {
      const chat = message.chat;
      const isPublic = !!message.chat.username;
      const channelTitle = message.new_chat_title;
      const channelId = isPublic ? `@${chat.username}` : chat.id.toString();

      this.logger.log(
        `Received new channel title: ${channelTitle} for channel_id: ${channelId}`,
      );
      try {
        await this.appService.updateRssChannelTitle(channelId, channelTitle);

        this.logger.log(
          `Channel title ${channelTitle} updated for channel_id: ${channelId}`,
        );
      } catch (error) {
        this.logger.error(error);
        this.logger.error(
          `Failed to update channel title for channel_id: ${channelId}`,
        );
      }
    }
  }

  @On('channel_post')
  async onChannelPost(ctx: Context) {
    await this.handleChannelTitleUpdate(ctx);
    await this.handleGetMyIdCommand(ctx);
  }
}
