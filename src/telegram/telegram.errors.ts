export class TranslationAlreadyDisabledError extends Error {
  constructor(chatId: string) {
    super(`Translation is already disabled for user with chatId: ${chatId}`);
    this.name = 'TranslationAlreadyDisabledError';
  }
}

export class TranslationAlreadyEnabledError extends Error {
  constructor(chatId: string) {
    super(`Translation is already enabled for user with chatId: ${chatId}`);
    this.name = 'TranslationAlreadyEnabledError';
  }
}

export class UserRssLimitError extends Error {
  constructor(chatId: string) {
    super(`User has reached the limit of RSS feeds with chatId: ${chatId}`);
    this.name = 'UserRssLimitError';
  }
}
