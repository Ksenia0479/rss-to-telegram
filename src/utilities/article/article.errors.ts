export class UnsupportedRssError extends Error {
  constructor(url: string) {
    super(
      `No active template found for extracting article text from url: ${url}`,
    );

    this.name = this.constructor.name;
    // Ensure the instance appears to be of type UnsupportedRssError
    //Object.setPrototypeOf(this, UnsupportedRssError.prototype);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UnsupportedRssError);
    }
  }
}
