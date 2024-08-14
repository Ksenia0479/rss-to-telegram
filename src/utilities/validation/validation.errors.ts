export class InvalidCommandError extends Error {
  constructor(command: string) {
    super(`Invalid command: ${command}`);
    this.name = 'InvalidCommandError';
  }
}

export class InvalidChatIdError extends Error {
  constructor(command: string) {
    super(`Invalid chatId format: ${command}`);
  }
}

export class InvalidUrlError extends Error {
  constructor(command: string) {
    super(`Invalid URL format: ${command}`);
  }
}

export class InvalidFeedNameError extends Error {
  constructor(command: string) {
    super(`Invalid feed name format: ${command}`);
  }
}
