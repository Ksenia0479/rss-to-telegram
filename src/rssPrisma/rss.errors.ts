export class UserNotFoundError extends Error {
  constructor(chatId: string) {
    super(`User not found with chat_id: ${chatId}`);
    this.name = 'UserNotFoundError';
  }
}

export class UserAlreadyExistsError extends Error {
  constructor(chatId: string) {
    super(`User already exists with chat_id: ${chatId}`);
    this.name = 'UserAlreadyExistsError';
  }
}

export class RssFeedsNotFoundError extends Error {
  constructor(chatId: string) {
    super(`No RSS feeds found for user with id: ${chatId}`);
    this.name = 'RssFeedsNotFoundError';
  }
}

export class RssFeedNotFoundError extends Error {
  constructor(userId: string) {
    super(`RSS feed not found for user with ID: ${userId}`);
    this.name = 'RssFeedNotFoundError';
  }
}

export class RssFeedUrlExistsError extends Error {
  constructor(userId: string) {
    super(`RSS feed URL already exists for user with ID: ${userId}`);
    this.name = 'RssFeedUrlExistsError';
  }
}

export class RssFeedNameExistsError extends Error {
  constructor(userId: string) {
    super(`RSS feed name already exists for user with ID: ${userId}`);
    this.name = 'RssFeedNameExistsError';
  }
}

export class RssFeedExistsError extends Error {
  constructor(userId: string) {
    super(`RSS feed already exists for user with ID: ${userId}`);
    this.name = 'RssFeedExistsError';
  }
}

export class NoNewItemsError extends Error {
  constructor(feedName: string) {
    super(`No new items found for feed: ${feedName}`);
    this.name = 'NoNewItemsError';
  }
}
