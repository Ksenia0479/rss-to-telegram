import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Rss, User } from '@prisma/client';

import * as TGTypes from 'telegraf/typings/core/types/typegram';
import { InjectBot } from 'nestjs-telegraf';
import { firstValueFrom } from 'rxjs';
import { Telegraf } from 'telegraf';
import { promises as fs } from 'fs';
import { AxiosError } from 'axios';
import { join } from 'path';

import * as _iso6391 from 'iso-639-1';
import * as Parser from 'rss-parser';

import * as Errors from './utilities.errors';
import * as Interfaces from './utilities.interfaces';

@Injectable()
export class UtilitiesService {
  private readonly logger = new Logger(UtilitiesService.name);

  constructor(
    @InjectBot() private readonly bot: Telegraf,
    private readonly httpService: HttpService,
  ) {}

  getIso6391Name(code: string): string {
    this.logger.log(`Getting language name for code: ${code}`);
    const iso6391 = _iso6391 as any as typeof import('iso-639-1').default;
    const langCode = code.toLowerCase().substring(0, 2);
    const langName = iso6391.getName(langCode);
    this.logger.log(`Received language: ${langName}`);
    return langName;
  }

  formatRssFeeds(feeds: Rss[]): TGTypes.InlineKeyboardButton[][] {
    let count = 0;
    let index = 0;

    return feeds.reduce((result, rss) => {
      if (!result[index]) result.push([]);

      if (count < 3) {
        result[index].push({
          text: `${rss.name} / ${rss.channelTitle}`,
          callback_data: `select_rss_${rss.id}`,
        });
        count++;
      } else {
        index += 1;
        count = 0;
      }

      return result;
    }, []);
  }

  async verifyChatExistence(
    chatId: User['chatId'] | Rss['channelId'],
  ): Promise<TGTypes.ChatFromGetChat> {
    this.logger.log(`Checking if chat exists with id: ${chatId}`);
    try {
      const chat = await this.bot.telegram.getChat(chatId);

      this.logger.log(`Chat exists with id: ${chatId}`);

      const chatMember = await this.bot.telegram.getChatMember(
        chatId,
        this.bot.botInfo.id,
      );

      this.logger.log(`Chat member status: ${chatMember.status}`);

      return chat;
    } catch (error) {
      this.logger.error(error);
      if (error.code === 403) {
        const description = error.description as string;

        if (description === 'Forbidden: bot was kicked from the channel chat') {
          throw new Errors.BotKickedFromChatError(chatId);
        }

        if (
          description === 'Forbidden: bot is not a member of the channel chat'
        ) {
          throw new Errors.BotIsNotMemberOfChatError(chatId);
        }
      }

      if (error.code === 400) {
        if (error.description === 'Bad Request: chat not found') {
          throw new Errors.ChatNotFoundError(chatId);
        }

        if (error.description === 'Bad Request: member list is inaccessible') {
          throw new Errors.MemberListInaccessibleError(chatId);
        }
      }

      throw new Error(error);
    }
  }

  async loadMdFile(
    directoryPath: string,
    fileName: string,
  ): Promise<Interfaces.MarkdownFileLoadResult> {
    const encoding = 'utf8';
    try {
      const filePath = join(directoryPath, fileName);
      if (!filePath.endsWith('.md')) {
        throw new Error('File is not a markdown file.');
      }
      const fileContent = await fs.readFile(filePath, encoding);
      if (!fileContent) {
        throw new Error(`File ${fileName} is empty.`);
      }
      //const parsedContent = await marked.parse(fileContent);
      return { fileName, content: fileContent };
    } catch (error) {
      this.logger.error(`Error loading Markdown files: ${error}`);
      throw error;
    }
  }

  async getFeedData(url: string): Promise<string> {
    this.logger.log(`Fetching feed data from: ${url}`);
    try {
      const { data } = await firstValueFrom(this.httpService.get<string>(url));
      this.logger.log(`Feed data successfully fetched from: ${url}`);
      return data;
    } catch (error) {
      this.logger.error(error);
      if (error instanceof AxiosError) {
        if (error.code === 'ENOTFOUND') {
          throw new Errors.ServiceNotFoundError(url);
        }
      }
      if (error?.response?.status === 449) {
        // TODO - retry x times and then throw error
        await new Promise((resolve) => setTimeout(resolve, 5000));
        this.logger.log(`Retrying to fetch feed data from: ${url}`);
        return await this.getFeedData(url);
      }
      this.logger.error(`Failed to fetch feed data from url: ${url}`);
      throw error;
    }
  }

  async getParsedRssFeeds(url: string): Promise<Parser.Item[]> {
    this.logger.log(`Starting to parse RSS feed from url: ${url}`);
    try {
      const feedData = await this.getFeedData(url);
      const parser = new Parser();
      const parsedFeed = await parser.parseString(feedData);
      this.logger.log(`Successfully parsed RSS feed from url: ${url}`);
      return parsedFeed.items;
    } catch (error) {
      if (error.message?.includes('Unencoded <')) {
        throw new Errors.UnencodedError();
      }

      this.logger.error(error);
      this.logger.error(`Failed to parse RSS feed from url: ${url}`);
      throw error;
    }
  }
}
