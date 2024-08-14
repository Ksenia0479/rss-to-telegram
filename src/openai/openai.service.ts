import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import * as _ from 'lodash';
import OpenAI from 'openai';

// TODO - check how to integrate openai inside nestjs project more gracefully

@Injectable()
export class OpenaiService {
  private readonly logger = new Logger(OpenaiService.name);
  private readonly openai;
  private readonly model = 'gpt-3.5-turbo-0125';
  private readonly topP = 1;
  private readonly maxTokens = 350;
  private readonly temperature = 1;
  private readonly presencePenalty = 0;
  private readonly frequencyPenalty = 0;
  private readonly userPromptFormat = {
    journalist: {
      articleName: null,
      articleDescription: null,
      seedWords: null,
      requiredNumberOfSentences: `up to 4`,
      requiredNumberOfTokensInEachSentence: `from 50 to 75`,
    },
    translator: {},
  };

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI(this.configService.get('OPENAI_API_KEY'));
  }

  async getContent(
    role: 'journalist' | 'translator',
    where: {
      content: string | { title: string; text: string; tags: string };
      aLang: string;
      tLang?: string;
    },
  ): Promise<{ content: string }> {
    this.logger.log(
      `Getting content for ${role} with: ${JSON.stringify(where)}`,
    );

    const preparedContent = this.getPreparedContentFormat(role, {
      content: where.content,
    });

    const systemContent = this.getSystemContent(role, {
      aLang: where.aLang,
      tLang: where.tLang,
    });

    try {
      const chatCompletion = await this.openai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: systemContent,
          },
          //...chatHistory.version2,
          {
            role: 'user',
            content: preparedContent,
          },
        ],
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        top_p: this.topP,
        frequency_penalty: this.frequencyPenalty,
        presence_penalty: this.presencePenalty,
      });

      const message = chatCompletion.choices[0].message;

      this.logger.log(
        `Content successfully received for ${role}: ${message.content}`,
      );

      return message;
    } catch (error) {
      this.logger.log(`Failed to get content for ${role}: ${error}`);
    }
  }

  private getSystemContent(
    role: 'journalist' | 'translator',
    where: { aLang: string; tLang?: string },
  ): string {
    const articleLanguage = where.aLang.toUpperCase() || 'English';
    const translationLanguage = where.tLang?.toUpperCase() || 'English';

    switch (role) {
      case 'journalist':
        return (
          `I want you to act as a ${articleLanguage} journalist. The language you use is ${articleLanguage} one only.` +
          'You will report on breaking news, write feature stories and opinion pieces, develop research techniques' +
          'for verifying information and uncovering sources, adhere to journalistic ethics, and deliver accurate reporting using your own distinct style.\n\n' +
          'Write short article description for the provided article.'
        );
      case 'translator':
        return (
          `I want you to act as a ${articleLanguage}-${translationLanguage} translator, spelling corrector and improver.` +
          `You will detect the language, translate it and answer in the corrected and improved version of my text, in ${translationLanguage}.` +
          `I want you to replace my simplified A0-level words and sentences with more beautiful and elegant, upper level ${translationLanguage} words and sentences.` +
          'Keep the meaning same, but make them more literary and in journalism style.' +
          'I want you to only reply the correction, the improvements and nothing else, do not write explanations.'
        );
    }
  }

  private getPreparedContentFormat(
    role: 'journalist' | 'translator',
    where: {
      content: string | { title: string; text: string; tags: string };
    },
  ): string {
    this.logger.log(`Preparing prompt: ${JSON.stringify(where)}`);
    let formattedPrompt: string;
    switch (role) {
      case 'journalist': {
        const obj = where.content as {
          title: string;
          text: string;
          tags: string;
        };
        const promptWithRules = this.addPromptRules(
          role,
          obj.title,
          obj.text,
          obj.tags,
        );
        formattedPrompt = this.formatPrompt(promptWithRules);
        break;
      }
      case 'translator': {
        formattedPrompt = where.content as string;
        break;
      }
    }
    this.logger.log(`Prompt prepared: ${formattedPrompt}`);
    return formattedPrompt;
  }

  private formatPrompt(prompt) {
    return _.reduce(
      prompt,
      (acc, value, key) => (acc += `${_.startCase(key)}: ${value} \n\n`),
      '',
    );
  }

  private addPromptRules(role, articleName, articleDescription, seedWords) {
    return {
      ...this.userPromptFormat[role],
      articleName,
      articleDescription,
      seedWords,
    };
  }
}
