export class BotKickedFromChatError extends Error {
  constructor(chatId: string) {
    super(
      `Please add @ai_rss_to_telegram_bot to the channel with ID: ${chatId}`,
    );
    this.name = 'BotKickedFromChatError';
  }
}

export class BotIsNotMemberOfChatError extends Error {
  constructor(chatId: string) {
    super(
      `Please add @ai_rss_to_telegram_bot to the channel with ID: ${chatId}`,
    );
    this.name = 'BotIsNotMemberOfChatError';
  }
}

export class ChatNotFoundError extends Error {
  constructor(chatId: string) {
    super(
      `Channel not found with ID: ${chatId}.\n\nPlease create a channel first!`,
    );
    this.name = 'ChatNotFoundError';
  }
}

export class UnencodedError extends Error {
  constructor() {
    super('Error is not encoded');
    this.name = 'UnencodedError';
  }
}

export class ServiceNotFoundError extends Error {
  constructor(serviceUrl: string) {
    super(`Service not found for URL: ${serviceUrl}`);
    this.name = 'ServiceNotFoundError';
  }
}

export class MemberListInaccessibleError extends Error {
  constructor(chatId: string) {
    super(`Member list is inaccessible for chat with ID: ${chatId}`);
    this.name = 'MemberListInaccessibleError';
  }
}
