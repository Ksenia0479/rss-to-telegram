import { Injectable, Logger } from '@nestjs/common';

import * as Errors from './validation.errors';

@Injectable()
export class ValidationService {
  private readonly logger = new Logger(ValidationService.name);

  validateUserCommand(text: string) {
    this.logger.log(`Checking validity of user command: ${text}`);
    const regex = /^\/add_rss\s+(\S+)\s+(\S+)\s+(\S+)$/;
    const commandArgs = text.match(regex);

    if (!commandArgs) {
      throw new Errors.InvalidCommandError(text);
    }
    this.logger.log(`Validation result: ${!!commandArgs} for command: ${text}`);
  }

  validateChatId(chatId: string) {
    this.logger.log(`Checking validity of chat ID: ${chatId}`);
    const privFormat = /^-\d+$/;
    const pubFormat = /^@[a-zA-Z0-9_]{5,}$/;
    const regex = new RegExp(`(${privFormat.source})|(${pubFormat.source})`);
    const isValid = chatId && regex.test(chatId);
    this.logger.log(`Validation result:${isValid} for chat ID:${chatId}`);
    if (!isValid) {
      throw new Errors.InvalidChatIdError(chatId);
    }
  }

  // TODO - test this function
  validateUrl(url: string) {
    this.logger.log(`Checking validity of URL: ${url}`);
    // https://gist.github.com/dperini/729294
    const regexWebUrl = new RegExp(
      '^' +
        // protocol identifier (optional)
        // short syntax // still required
        '(?:(?:(?:https?|ftp):)?\\/\\/)' +
        // user:pass BasicAuth (optional)
        '(?:\\S+(?::\\S*)?@)?' +
        '(?:' +
        // IP address exclusion
        // private & local networks
        '(?!(?:10|127)(?:\\.\\d{1,3}){3})' +
        '(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})' +
        '(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})' +
        // IP address dotted notation octets
        // excludes loopback network 0.0.0.0
        // excludes reserved space >= 224.0.0.0
        // excludes network & broadcast addresses
        // (first & last IP address of each class)
        '(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])' +
        '(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}' +
        '(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))' +
        '|' +
        // host & domain names, may end with dot
        // can be replaced by a shortest alternative
        // (?![-_])(?:[-\\w\\u00a1-\\uffff]{0,63}[^-_]\\.)+
        '(?:' +
        '(?:' +
        '[a-z0-9\\u00a1-\\uffff]' +
        '[a-z0-9\\u00a1-\\uffff_-]{0,62}' +
        ')?' +
        '[a-z0-9\\u00a1-\\uffff]\\.' +
        ')+' +
        // TLD identifier name, may end with dot
        '(?:[a-z\\u00a1-\\uffff]{2,}\\.?)' +
        ')' +
        // port number (optional)
        '(?::\\d{2,5})?' +
        // resource path (optional)
        '(?:[/?#]\\S*)?' +
        '$',
      'i',
    );
    const isValid = url && regexWebUrl.test(url);
    this.logger.log(`Validation result: ${isValid} for URL: ${url}`);
    if (!isValid) {
      throw new Errors.InvalidUrlError(url);
    }
  }

  validateFeedName(feedName: string) {
    this.logger.log(`Checking validity of feed name: ${feedName}`);
    const isValid = feedName && feedName.length > 0;
    this.logger.log(`Validation result: ${isValid} for feed name: ${feedName}`);
    if (!isValid) {
      throw new Errors.InvalidFeedNameError(feedName);
    }
  }
}
